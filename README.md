# MY FRIEND IS BLIND — website

Marketing site for the game in `../my-friend-is-blind-godot`. Next.js 16 (App
Router) + React 19 + Tailwind v4, statically prerendered.

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
```

## The idea

The site is built the way the game is: **one room, two viewers, and a `clarity`
value between them.**

`components/vision/shader.ts` is a WebGL2 port of the game's
`shaders/blind_vision.gdshader` — the same term stack in the same order
(distortion → mip blur → chromatic aberration → light bleed → tone → darkness →
vignette → FLASH pulse → VISOR Sobel edges → grain), driven by the same
`clarity` uniform. `components/vision/VisionCanvas.tsx` runs it over a still of
a room instead of over a live back buffer, which is the one substitution; a
baked still has to be lifted by `u_exposure` before the darkness multiply can
take it away again.

`components/ClarityProvider.tsx` is the clock. One `requestAnimationFrame`
drives everything that moves — the hazard beacon in the nav, the phase dial in
§03, the perk cooldown ring in §04 and the shader over the hero all read the
same frame, so they cannot disagree. Per-frame values are published through a
**subscription**, not React state: a 60 Hz `setState` would re-render the page
every frame. React state carries only what changes rarely (which phase, whether
FLASH is up).

Two things are ported verbatim from the design docs:

- **FLASH's envelope** — anticipate 0.07 → punch 0.13 → hold 1.15 → fade 0.85,
  with clarity decaying to 0.82 across the hold (`lib/clock.ts`).
- **The hazard cycle** — CLEAR 3.5 / ARMING 1.5 / SLAM 4.0 / LIFT 1.0, a pure
  function of the clock. The LIFT is lethal, which is why §03's "call it" button
  can kill you.

Press **F** for FLASH, **G** for PING, anywhere on the page.

Every claim in the copy is quoted from the project's own documents
(`CAMPAIGN_ARC.md`, `GAME_DESIGN.md`, `ART_DIRECTION.md`, `game_scene.md`).
Nothing was invented for marketing.

## Accessibility

The HUD is always sharp. The vision effect runs on **imagery only** — never on
text — for the same reason the game renders its HUD on `CanvasLayer` 10 above
the shader: the disadvantage comes from the role design, never from an unusable
interface. `prefers-reduced-motion` freezes the shader's time term, disables the
reveals and the typing, and prints the counters at their final values.

## Assets

`public/art/` — mixed provenance:

| file | source |
|---|---|
| `logo.webp`, `perk-flash.webp`, `menu-bg.webp` | the game's own `assets/ui/`, re-encoded to WebP |
| everything else | generated with OpenAI `gpt-image-1` against `docs/ART_DIRECTION.md`'s palette and material rules |

## One licence note

The game names its typeface in exactly one place (`project.godot` →
`assets/fonts/Craze.ttf`), and that file is **personal use only**. This site
therefore substitutes **Anton** — the same heavy condensed sans silhouette,
freely licensed — via `next/font`. If the game buys a commercial Craze licence,
`app/layout.tsx` is the one line to change.
