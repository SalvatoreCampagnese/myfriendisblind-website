"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import VisionCanvas from "@/components/vision/VisionCanvas";
import Reveal from "@/components/ui/Reveal";
import { SectionHead } from "@/components/ui/Bits";

/* docs/ART_DIRECTION.md, "the one visual requirement":

     A screenshot must say, without a caption:
     One of these players can see everything. The other cannot.

   So the site says it with one room and one seam, immediately under the
   hero. Same frame, same moment, same geometry — the only difference is
   which player is standing in it. */

function Seam() {
  const [x, setX] = useState(0.5);
  const box = useRef<HTMLDivElement | null>(null);
  const dragging = useRef(false);

  const move = useCallback((clientX: number) => {
    const r = box.current?.getBoundingClientRect();
    if (!r) return;
    setX(Math.min(0.97, Math.max(0.03, (clientX - r.left) / r.width)));
  }, []);

  return (
    <div
      ref={box}
      className="seam-box"
      onPointerDown={(e) => { dragging.current = true; (e.target as Element).setPointerCapture?.(e.pointerId); move(e.clientX); }}
      onPointerMove={(e) => { if (dragging.current) move(e.clientX); }}
      onPointerUp={() => { dragging.current = false; }}
      onPointerCancel={() => { dragging.current = false; }}
      style={{
        position: "relative",
        aspectRatio: "16 / 9",
        overflow: "hidden",
        border: "1px solid var(--edge)",
        cursor: "ew-resize",
        touchAction: "none",
        userSelect: "none",
        background: "#05070A",
      }}
    >
      {/* GUIDE: the untouched frame */}
      <Image
        src="/art/shot-gantry.webp"
        alt="The Foundry Gantry as the Guide sees it: three lit decks, yellow railings, a red warning lamp on the crusher."
        fill
        sizes="(max-width: 900px) 100vw, 62vw"
        priority
        style={{ objectFit: "cover", filter: "brightness(1.22) saturate(1.06)" }}
      />

      {/* BLIND: the same frame, through the real shader */}
      <div
        aria-hidden
        style={{ position: "absolute", inset: 0, clipPath: `inset(0 ${(1 - x) * 100}% 0 0)` }}
      >
        <VisionCanvas src="/art/shot-gantry.webp" darkness={0.42} exposure={2.0} fixedClarity={0.05} style={{ position: "absolute", inset: 0 }} />
      </div>

      {/* the seam itself */}
      <div
        aria-hidden
        style={{
          position: "absolute", top: 0, bottom: 0, left: `${x * 100}%`,
          width: 2, background: "var(--cyan)",
          boxShadow: "0 0 22px 3px color-mix(in srgb, var(--cyan) 55%, transparent)",
          transform: "translateX(-1px)",
        }}
      >
        <span
          style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            width: 44, height: 44, borderRadius: 2,
            background: "#0A0D11", border: "1px solid var(--cyan)",
            display: "grid", placeItems: "center",
            color: "var(--cyan)", fontSize: 13,
          }}
          className="mono"
        >
          ⇄
        </span>
      </div>

      <span className="mono seam-label" style={{ left: 14, color: "var(--cyan)", borderColor: "color-mix(in srgb, var(--cyan) 45%, transparent)" }}>
        BLIND
      </span>
      <span className="mono seam-label" style={{ right: 14, color: "var(--orange)", borderColor: "color-mix(in srgb, var(--orange) 45%, transparent)" }}>
        GUIDE
      </span>

      <input
        type="range" min={3} max={97} value={Math.round(x * 100)}
        onChange={(e) => setX(Number(e.target.value) / 100)}
        aria-label="Drag to compare what the Blind player sees with what the Guide sees"
        style={{
          position: "absolute", bottom: 10, left: "12%", width: "76%",
          opacity: 0, height: 34, cursor: "ew-resize",
        }}
      />

      <style>{`
        .seam-label {
          position: absolute; top: 14px; font-size: 10.5px; letter-spacing: 0.18em;
          padding: 5px 10px; background: rgba(6,8,11,0.8); border: 1px solid;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}

export default function Switcher() {
  return (
    <section id="switcher" className="section" style={{ background: "linear-gradient(180deg, transparent, #0A0D11 30%, #0A0D11 70%, transparent)" }}>
      <div className="shell">
        <Reveal>
          <SectionHead
            index="01"
            kicker="asymmetric information"
            title={<>The same room.<br />Drag the seam.</>}
            lede="Nothing on the left has been removed. It is the identical frame, through the identical shader the game ships — 35 uniforms, mip-blurred, tinted cold, tunnelled and grained."
          />
        </Reveal>

        <Reveal mode="wipe"><Seam /></Reveal>
      </div>
    </section>
  );
}
