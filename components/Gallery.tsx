"use client";

import Image from "next/image";
import { useState } from "react";
import Reveal from "@/components/ui/Reveal";
import { SectionHead } from "@/components/ui/Bits";
import { SHOTS } from "@/lib/data";

/* Hold a shot to take the Guide's eyes away.

   The full 35-uniform effect runs on the hero and on the seam above; these
   three use a cheap CSS approximation on purpose — five live WebGL contexts
   on one page is a budget, not a feature. */

export default function Gallery() {
  const [blind, setBlind] = useState<number | null>(null);

  return (
    <section className="section" style={{ background: "#0A0D11", position: "relative", overflow: "hidden" }}>
      <div className="gridfield" />
      <div className="shell" style={{ position: "relative" }}>
        <Reveal>
          <SectionHead
            index="06"
            kicker="the rooms"
            title={<>Colour is vocabulary.</>}
            lede="Colour zones give the Guide words to use. “The orange room” is a usable sentence; “the third room” is not. Hold a shot to take the light away."
          />
        </Reveal>

        <div className="shot-grid">
          {SHOTS.map((s, i) => (
            <Reveal key={s.src} delay={i * 100}>
              <figure
                className="shot"
                style={{ margin: 0, position: "relative", cursor: "pointer" }}
                onPointerDown={() => setBlind(i)}
                onPointerUp={() => setBlind(null)}
                onPointerLeave={() => setBlind(null)}
                onFocus={() => setBlind(i)}
                onBlur={() => setBlind(null)}
                tabIndex={0}
                aria-label={`${s.name}. Hold to see it as the Blind player does.`}
              >
                <div style={{ position: "relative", aspectRatio: "3 / 2", overflow: "hidden", border: "1px solid var(--edge)" }}>
                  <Image
                    src={s.src}
                    alt={`${s.name} — ${s.line}`}
                    fill
                    sizes="(max-width: 900px) 100vw, 33vw"
                    style={{
                      objectFit: "cover",
                      transition: "filter 420ms ease, transform 700ms cubic-bezier(0.16,0.84,0.28,1)",
                      filter: blind === i
                        ? "blur(17px) saturate(0.42) brightness(0.34) contrast(0.72)"
                        : "none",
                      transform: blind === i ? "scale(1.1)" : "scale(1.02)",
                    }}
                  />
                  <div
                    aria-hidden
                    style={{
                      position: "absolute", inset: 0, pointerEvents: "none",
                      transition: "opacity 420ms",
                      opacity: blind === i ? 1 : 0,
                      background: "radial-gradient(ellipse 62% 52% at 50% 50%, transparent 12%, rgba(4,6,9,0.94) 96%)",
                    }}
                  />
                  <figcaption
                    className="mono"
                    style={{
                      position: "absolute", left: 12, top: 12, zIndex: 2,
                      fontSize: 10, letterSpacing: "0.18em",
                      padding: "5px 9px", background: "rgba(6,8,11,0.82)",
                      border: "1px solid var(--edge)",
                      color: blind === i ? "var(--cyan)" : "var(--yellow)",
                      transition: "color 300ms",
                    }}
                  >
                    {blind === i ? "BLIND" : s.floor}
                  </figcaption>
                  <span
                    className="mono hold-hint"
                    style={{
                      position: "absolute", right: 12, bottom: 12, zIndex: 2,
                      fontSize: 9.5, letterSpacing: "0.16em", color: "var(--ink-faint)",
                      opacity: blind === i ? 0 : 1, transition: "opacity 300ms",
                    }}
                  >
                    HOLD ▸
                  </span>
                </div>
                <div style={{ paddingTop: 14 }}>
                  <div className="display" style={{ fontSize: 20, color: "var(--ink)" }}>{s.name}</div>
                  <p style={{ margin: "5px 0 0", fontSize: 14.5, color: "var(--ink-dim)", lineHeight: 1.45 }}>{s.line}</p>
                </div>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>

      <style>{`
        .shot-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 22px; }
        .shot:focus-visible { outline: 2px solid var(--cyan); outline-offset: 6px; }
        @media (max-width: 900px) { .shot-grid { grid-template-columns: 1fr; max-width: 560px; } }
      `}</style>
    </section>
  );
}
