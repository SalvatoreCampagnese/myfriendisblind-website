"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import VisionCanvas from "@/components/vision/VisionCanvas";
import { useClarity, useFrame } from "@/components/ClarityProvider";
import { Chevrons } from "@/components/ui/Bits";

/* The site opens the way the game opens: you are looking at a room you
   cannot read. The shader over this hero is the real one. Everything you
   need in order to use the page — every word — sits above it, sharp. */

export default function Hero() {
  const { flash, ready } = useClarity();
  const [everFlashed, setEverFlashed] = useState(false);
  const veil = useRef<HTMLDivElement | null>(null);
  const readout = useRef<HTMLSpanElement | null>(null);

  useFrame((f) => {
    if (veil.current) veil.current.style.opacity = String(Math.min(0.55, f.pulse * 1.6));
    if (readout.current) readout.current.textContent = (f.clarity * 100).toFixed(0).padStart(3, "0");
  });

  useEffect(() => {
    const on = (e: KeyboardEvent) => { if (e.key === "f" || e.key === "F") setEverFlashed(true); };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, []);

  return (
    <section
      style={{
        position: "relative",
        minHeight: "100svh",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        isolation: "isolate",
      }}
    >
      <VisionCanvas
        src="/art/hero-hall.webp"
        darkness={0.62}
        exposure={2.6}
        priority
        style={{ position: "absolute", inset: 0, zIndex: 1 }}
      />

      {/* the FLASH punch, above the frame, additive */}
      <div
        ref={veil}
        aria-hidden
        style={{
          position: "absolute", inset: 0, zIndex: 2, opacity: 0,
          background: "radial-gradient(ellipse at 50% 55%, rgba(184,232,255,0.9), rgba(120,190,230,0.15) 55%, transparent 78%)",
          mixBlendMode: "screen", pointerEvents: "none",
        }}
      />

      <div
        aria-hidden
        style={{
          position: "absolute", inset: 0, zIndex: 3, pointerEvents: "none",
          background:
            "linear-gradient(to top, #07090C 2%, transparent 42%), radial-gradient(ellipse 80% 60% at 50% 40%, transparent 30%, rgba(7,9,12,0.75) 100%)",
        }}
      />

      <div className="shell grain" style={{ position: "relative", zIndex: 4, paddingTop: 86, paddingBottom: 48 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 22 }}>
          <Chevrons count={5} />
          <span className="stencil" style={{ color: "var(--concrete)" }}>
            2-player online co-op · v0.1 vertical slice
          </span>
        </div>

        <h1 style={{ margin: 0, maxWidth: 920 }}>
          <span className="sr-only">My Friend Is Blind</span>
          <Image
            src="/art/logo.webp"
            alt="My Friend Is Blind"
            width={1536}
            height={1024}
            priority
            className="drift"
            style={{ width: "min(420px, 72vw)", height: "auto", filter: "drop-shadow(0 22px 46px rgba(0,0,0,0.85))" }}
          />
        </h1>

        <p
          className="display"
          style={{
            fontSize: "clamp(1.25rem, 2.9vw, 2rem)",
            margin: "1.6rem 0 0",
            maxWidth: 600,
            color: "var(--ink)",
            textShadow: "0 3px 20px rgba(0,0,0,0.9)",
          }}
        >
          Two friends enter the same room.{" "}
          <span style={{ color: "var(--yellow)" }}>One of them can see it.</span>
        </p>

        <p className="lede" style={{ maxWidth: 520, marginTop: "0.9rem", textShadow: "0 2px 14px #000" }}>
          One player&apos;s vision is heavily degraded — they can tell that something is
          there, but not what it is. The other sees everything: the key, the exit,
          the hazard about to kill their friend. They cannot move their friend.
          They can only talk.
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: "1.9rem", alignItems: "center" }}>
          <button
            onClick={() => { flash(); setEverFlashed(true); }}
            className="display flash-cta"
            style={{
              position: "relative",
              fontSize: 18,
              letterSpacing: "0.06em",
              padding: "16px 30px",
              color: "#0B0A05",
              background: "var(--yellow)",
              border: "none",
              cursor: "pointer",
              clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%)",
              opacity: ready ? 1 : 0.5,
              transition: "opacity 240ms, transform 120ms",
            }}
          >
            {ready ? "PRESS F TO SEE" : "RECHARGING…"}
          </button>

          <a
            href="#the-game"
            className="mono"
            style={{
              fontSize: 12, letterSpacing: "0.14em", padding: "16px 22px",
              textDecoration: "none", color: "var(--ink)",
              border: "1px solid var(--steel-dark)",
              background: "color-mix(in srgb, var(--charcoal) 60%, transparent)",
            }}
          >
            WHAT IS THIS ↓
          </a>
        </div>

        {/* the readout, always sharp — the HUD never lies about the state */}
        <div
          className="mono"
          style={{
            marginTop: "2.1rem",
            display: "flex", flexWrap: "wrap", gap: "1.6rem",
            fontSize: 11, letterSpacing: "0.12em", color: "var(--ink-faint)",
          }}
        >
          <span>
            CLARITY <span ref={readout} style={{ color: "var(--cyan)" }}>009</span>
            <span style={{ opacity: 0.5 }}>/100</span>
          </span>
          <span>PROFILE <span style={{ color: "var(--ink-dim)" }}>vision_blind_base</span></span>
          <span style={{ opacity: everFlashed ? 0.35 : 1, transition: "opacity 600ms" }}>
            G <span style={{ color: "var(--ink-dim)" }}>PING</span> · F <span style={{ color: "var(--ink-dim)" }}>FLASH</span>
          </span>
        </div>
      </div>

      <style>{`
        .flash-cta:hover { transform: translateY(-2px); }
        .flash-cta:active { transform: translateY(1px); }
        .sr-only {
          position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
          overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0;
        }
      `}</style>
    </section>
  );
}
