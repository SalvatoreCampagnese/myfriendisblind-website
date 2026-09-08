"use client";

import { useEffect, useRef, useState } from "react";
import { useClarity } from "@/components/ClarityProvider";
import { FRAG, VERT } from "./shader";

/* Runs the ported blind_vision shader over a still of the room.

   If WebGL2 is unavailable the component falls back to the same still with
   CSS filters — degraded, but never a blank rectangle. game_scene.md §8:
   difficult to understand, NOT impossible to play. */

type Props = {
  src: string;
  /** 0 = untouched, 0.9 = the 90% black layer the Blind actually looks at */
  darkness?: number;
  /** lifts the baked still to the exposure a live frame would have */
  exposure?: number;
  className?: string;
  style?: React.CSSProperties;
  /** hold clarity at a fixed value instead of tracking the site clock */
  fixedClarity?: number;
  priority?: boolean;
};

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.error("blind_vision:", gl.getShaderInfoLog(s));
    gl.deleteShader(s);
    return null;
  }
  return s;
}

export default function VisionCanvas({
  src,
  darkness = 0.55,
  exposure = 1,
  className,
  style,
  fixedClarity,
  priority,
}: Props) {
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const wrap = useRef<HTMLDivElement | null>(null);
  const [failed, setFailed] = useState(false);
  const { subscribe, reduced } = useClarity();
  const live = useRef({ clarity: fixedClarity ?? 0.06, pulse: 0, edge: 0, t: 0 });

  useEffect(() =>
    subscribe((f) => {
      live.current = {
        clarity: fixedClarity ?? f.clarity,
        pulse: f.pulse,
        edge: f.edge,
        t: f.t,
      };
    }), [subscribe, fixedClarity]);

  useEffect(() => {
    const cv = canvas.current;
    const host = wrap.current;
    if (!cv || !host) return;

    const gl = cv.getContext("webgl2", {
      antialias: false,
      alpha: false,
      powerPreference: "low-power",
    });
    if (!gl) { setFailed(true); return; }

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) { setFailed(true); return; }

    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error("blind_vision link:", gl.getProgramInfoLog(prog));
      setFailed(true);
      return;
    }
    gl.useProgram(prog);

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const U = {
      tex: gl.getUniformLocation(prog, "u_tex"),
      res: gl.getUniformLocation(prog, "u_res"),
      texAspect: gl.getUniformLocation(prog, "u_texAspect"),
      time: gl.getUniformLocation(prog, "u_time"),
      clarity: gl.getUniformLocation(prog, "u_clarity"),
      pulse: gl.getUniformLocation(prog, "u_pulse"),
      edge: gl.getUniformLocation(prog, "u_edge"),
      darkness: gl.getUniformLocation(prog, "u_darkness"),
      exposure: gl.getUniformLocation(prog, "u_exposure"),
    };

    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    // one grey texel until the still lands, so the first frame is not garbage
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
      new Uint8Array([12, 14, 18, 255]));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.uniform1i(U.tex, 0);

    let imgW = 1, imgH = 1, loaded = false;
    const img = new Image();
    img.decoding = "async";
    img.src = src;
    img.onload = () => {
      imgW = img.naturalWidth;
      imgH = img.naturalHeight;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      // filter_linear_mipmap: what makes a LOD-4 blur one fetch from a tiny
      // texture instead of hundreds from a big one
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      loaded = true;
    };
    img.onerror = () => setFailed(true);

    let w = 0, h = 0;
    const dpr = () => Math.min(window.devicePixelRatio || 1, 1.75);
    const resize = () => {
      const r = host.getBoundingClientRect();
      const nw = Math.max(1, Math.round(r.width * dpr()));
      const nh = Math.max(1, Math.round(r.height * dpr()));
      if (nw === w && nh === h) return;
      w = nw; h = nh;
      cv.width = w; cv.height = h;
      gl.viewport(0, 0, w, h);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    // only draw while on screen
    let visible = true;
    const io = new IntersectionObserver(
      ([e]) => { visible = e.isIntersecting; },
      { rootMargin: "120px" }
    );
    io.observe(host);

    let raf = 0;
    const draw = () => {
      raf = requestAnimationFrame(draw);
      if (!visible || !loaded || w === 0) return;

      // cover fit, in UV space
      const canvasAR = w / h;
      const imgAR = imgW / imgH;
      const ax = canvasAR > imgAR ? 1 : imgAR / canvasAR;
      const ay = canvasAR > imgAR ? canvasAR / imgAR : 1;

      const s = live.current;
      gl.uniform2f(U.res, w, h);
      gl.uniform2f(U.texAspect, 1 / ax, 1 / ay);
      gl.uniform1f(U.time, reduced ? 0 : s.t);
      gl.uniform1f(U.clarity, s.clarity);
      gl.uniform1f(U.pulse, s.pulse);
      gl.uniform1f(U.edge, s.edge);
      gl.uniform1f(U.darkness, darkness);
      gl.uniform1f(U.exposure, exposure);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      gl.deleteTexture(tex);
      gl.deleteBuffer(buf);
      gl.deleteVertexArray(vao);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, [src, darkness, exposure, reduced]);

  return (
    <div ref={wrap} className={className} style={{ position: "relative", overflow: "hidden", ...style }}>
      {failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          aria-hidden
          fetchPriority={priority ? "high" : undefined}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "blur(26px) saturate(0.45) brightness(0.5) contrast(0.75)",
            transform: "scale(1.06)",
          }}
        />
      ) : (
        <canvas
          ref={canvas}
          aria-hidden
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}
        />
      )}
    </div>
  );
}
