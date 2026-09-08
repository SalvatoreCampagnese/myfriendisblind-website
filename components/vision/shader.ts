/* =====================================================================
   blind_vision — a WebGL2 port of the game's shaders/blind_vision.gdshader
   ---------------------------------------------------------------------
   Same term stack, same order, same uniform names: distortion, mip blur,
   chromatic aberration, light bleed, tone, darkness, vignette, FLASH
   pulse, VISOR Sobel edges, grain. `clarity` in 0..1 blends the whole
   thing: 0 = full blind, 1 = the untouched frame.

   The one substitution: Godot samples the back buffer through
   `hint_screen_texture`; here the "frame" is a still of the room, mipped
   by the driver, which is what keeps a LOD-3 blur one fetch instead of
   hundreds.
   ===================================================================== */

export const VERT = /* glsl */ `#version 300 es
in vec2 a_pos;
out vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

export const FRAG = /* glsl */ `#version 300 es
precision highp float;

in  vec2 v_uv;
out vec4 fragColor;

uniform sampler2D u_tex;
uniform vec2  u_res;        // canvas size, px
uniform vec2  u_texAspect;  // cover-fit correction
uniform float u_time;

uniform float u_clarity;
uniform float u_pulse;      // FLASH white punch
uniform float u_edge;       // VISOR edge impulse
uniform float u_darkness;
// Exposure on the still itself. The game's shader has no such term because
// it reads a live frame that is already exposed by the level's lights; a
// baked image has to be lifted to the same place before the darkness
// multiply can take it back away again.
uniform float u_exposure;

// per-group response curves — vignette clears last, which is what stops
// FLASH from feeling like plain normal vision
const float CURVE_BLUR  = 0.85;
const float CURVE_COLOR = 1.00;
const float CURVE_VIGN  = 1.60;

const float BLUR_LOD       = 4.10;
const float BLUR_SPREAD    = 1.35;
const float BLUR_EDGE_BIAS = 0.45;

const float BLEED_AMOUNT   = 0.22;
const float BLEED_LOD_OFF  = 1.80;
const float BLEED_THRESH   = 0.55;

const float CONTRAST       = 0.62;
const float CONTRAST_PIVOT = 0.48;
const float BRIGHTNESS     = 1.06;
const float LIFT           = 0.045;
const float DESATURATION   = 0.55;
const vec3  TINT           = vec3(0.62, 0.74, 0.92);
const float TINT_AMOUNT    = 0.35;

const float VIGN_INTENSITY = 0.85;
const float VIGN_INNER     = 0.30;
const float VIGN_OUTER     = 1.05;
const float VIGN_ROUND     = 0.85;
const vec3  VIGN_COLOR     = vec3(0.02, 0.03, 0.05);

const float DISTORT_AMOUNT = 0.0055;
const float DISTORT_SCALE  = 5.50;
const float DISTORT_SPEED  = 0.32;
const float DISTORT_EDGE   = 0.80;

const float ABERRATION_PX  = 2.60;
const float ABERRATION_POW = 2.00;

const float GRAIN_AMOUNT   = 0.030;
const float GRAIN_HZ       = 12.0;

const vec3  EDGE_COLOR     = vec3(0.55, 0.94, 1.0);
const float EDGE_LOD       = 0.60;
const float EDGE_WIDTH     = 1.30;
const float EDGE_THRESHOLD = 0.030;
const float EDGE_KNEE      = 0.170;

const vec3 LUMA = vec3(0.2126, 0.7152, 0.0722);

// 9-tap disc: centre + 4 axis + 4 diagonal, weighted 1 / 0.72 / 0.5
const vec2 K9[9] = vec2[9](
  vec2( 0.0,     0.0),
  vec2( 1.0,     0.0), vec2(-1.0,     0.0),
  vec2( 0.0,     1.0), vec2( 0.0,    -1.0),
  vec2( 0.7071,  0.7071), vec2(-0.7071,  0.7071),
  vec2( 0.7071, -0.7071), vec2(-0.7071, -0.7071)
);
const float W9[9] = float[9](1.0, 0.72, 0.72, 0.72, 0.72, 0.5, 0.5, 0.5, 0.5);

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

// cover-fit: the still behaves like a background-size:cover frame
vec2 fit(vec2 uv) { return (uv - 0.5) * u_texAspect + 0.5; }

// Gamma-compressed luminance. The sqrt is doing real work: this frame is a
// dark room, and a linear-luma Sobel finds almost no gradient down there.
float edgeLuma(vec2 uv, float lod) {
  return sqrt(max(dot(textureLod(u_tex, fit(clamp(uv, vec2(0.001), vec2(0.999))), lod).rgb, LUMA), 0.0));
}

void main() {
  vec2  px     = 1.0 / u_res;
  float aspect = u_res.x / u_res.y;

  float kb = pow(u_clarity, CURVE_BLUR);
  float kc = pow(u_clarity, CURVE_COLOR);
  float kv = pow(u_clarity, CURVE_VIGN);

  vec2  centred = (v_uv - 0.5) * vec2(mix(1.0, aspect, VIGN_ROUND), 1.0);
  float r  = length(centred) * 1.41421356;
  float r2 = r * r;

  // -------- distortion : slow, low frequency, edge-weighted. Never
  // coupled to motion — that is what causes simulator sickness.
  float dt = u_time * DISTORT_SPEED;
  vec2 warp = vec2(
    sin(v_uv.y * DISTORT_SCALE        + dt) + 0.55 * sin(v_uv.y * DISTORT_SCALE * 2.17 - dt * 1.31),
    cos(v_uv.x * DISTORT_SCALE * 0.87 - dt) + 0.55 * cos(v_uv.x * DISTORT_SCALE * 1.93 + dt * 1.11)
  );
  float dmask = mix(1.0, r2, DISTORT_EDGE);
  vec2  uv = v_uv + warp * DISTORT_AMOUNT * dmask * (1.0 - kb);
  uv = clamp(uv, vec2(0.0005), vec2(0.9995));

  // -------- blur
  float lod = max(mix(BLUR_LOD + BLUR_EDGE_BIAS * r2, 0.0, kb), 0.0);

  // static per-pixel rotation of the tap disc: turns a 9-tap star into
  // noise, which reads as grain rather than as a kernel artefact
  float ang = hash21(floor(gl_FragCoord.xy)) * 6.28318530718;
  float sa = sin(ang), ca = cos(ang);
  mat2 rot = mat2(ca, -sa, sa, ca);

  vec2 step_uv = px * exp2(lod) * BLUR_SPREAD;

  vec3 acc = vec3(0.0);
  float wsum = 0.0;
  for (int i = 0; i < 9; i++) {
    acc  += textureLod(u_tex, fit(clamp(uv + rot * K9[i] * step_uv, vec2(0.001), vec2(0.999))), lod).rgb * W9[i];
    wsum += W9[i];
  }
  vec3 col = acc / wsum * u_exposure;

  // -------- chromatic aberration : 2 extra fetches, radial, zero at centre
  float ab = ABERRATION_PX * pow(r, ABERRATION_POW) * (1.0 - kb);
  if (ab > 0.001) {
    vec2 dir = (r > 0.0001) ? normalize(v_uv - 0.5) : vec2(0.0);
    vec2 off = dir * ab * px;
    col.r = textureLod(u_tex, fit(clamp(uv + off, vec2(0.001), vec2(0.999))), lod).r * u_exposure;
    col.b = textureLod(u_tex, fit(clamp(uv - off, vec2(0.001), vec2(0.999))), lod).b * u_exposure;
  }

  // -------- light bleed : the Blind player's whole navigation affordance.
  // They cannot read the EXIT sign; they can see that there is a green
  // glow over there.
  vec3 wide = textureLod(u_tex, fit(uv), lod + BLEED_LOD_OFF).rgb * u_exposure;
  col += wide * smoothstep(BLEED_THRESH, 1.0, dot(wide, LUMA)) * BLEED_AMOUNT * (1.0 - kb);

  // -------- tone
  float ctr = mix(1.0, CONTRAST,   1.0 - kc);
  float bri = mix(1.0, BRIGHTNESS, 1.0 - kc);
  col = (col - CONTRAST_PIVOT) * ctr + CONTRAST_PIVOT;
  col = col * bri + LIFT * (1.0 - kc);
  col = mix(col, vec3(dot(col, LUMA)), DESATURATION * (1.0 - kc));
  col = mix(col, col * TINT, TINT_AMOUNT * (1.0 - kc));

  // -------- darkness : not a dim room, a BLACK one with a few things
  // burning through it. A flat multiply and nothing cleverer, deliberately.
  col *= 1.0 - u_darkness * (1.0 - kc);

  // -------- vignette
  col = mix(col, VIGN_COLOR, smoothstep(VIGN_INNER, VIGN_OUTER, r) * VIGN_INTENSITY * (1.0 - kv));

  // -------- FLASH pulse
  col += vec3(0.72, 0.92, 1.0) * u_pulse;

  // -------- VISOR edges : added last, outside the clarity curves. The
  // point of the impulse is the OUTLINE, and a tunnel that ate it at the
  // periphery would take away the one thing the charge was spent on.
  if (u_edge > 0.001) {
    vec2 eo = px * exp2(EDGE_LOD) * EDGE_WIDTH * 2.0;
    float l00 = edgeLuma(v_uv + vec2(-eo.x, -eo.y), EDGE_LOD);
    float l10 = edgeLuma(v_uv + vec2( 0.0,  -eo.y), EDGE_LOD);
    float l20 = edgeLuma(v_uv + vec2( eo.x, -eo.y), EDGE_LOD);
    float l01 = edgeLuma(v_uv + vec2(-eo.x,  0.0),  EDGE_LOD);
    float l21 = edgeLuma(v_uv + vec2( eo.x,  0.0),  EDGE_LOD);
    float l02 = edgeLuma(v_uv + vec2(-eo.x,  eo.y), EDGE_LOD);
    float l12 = edgeLuma(v_uv + vec2( 0.0,   eo.y), EDGE_LOD);
    float l22 = edgeLuma(v_uv + vec2( eo.x,  eo.y), EDGE_LOD);
    float gx = (l00 + 2.0 * l01 + l02) - (l20 + 2.0 * l21 + l22);
    float gy = (l00 + 2.0 * l10 + l20) - (l02 + 2.0 * l12 + l22);
    float e = smoothstep(EDGE_THRESHOLD, EDGE_THRESHOLD + EDGE_KNEE, length(vec2(gx, gy)));
    col += EDGE_COLOR * e * u_edge;
  }

  // -------- grain, doubling as a dither: mip blur bands badly on
  // gradients and this hides it. Quantised in time so it updates at
  // GRAIN_HZ rather than every frame — far less shimmery.
  float tq = floor(u_time * GRAIN_HZ);
  col += (hash21(gl_FragCoord.xy + vec2(tq * 17.13, tq * 31.77)) - 0.5) * GRAIN_AMOUNT * (1.0 - kc);

  fragColor = vec4(max(col, vec3(0.0)), 1.0);
}`;
