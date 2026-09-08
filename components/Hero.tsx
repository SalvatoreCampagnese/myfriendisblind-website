"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import VisionCanvas from "@/components/vision/VisionCanvas";
import { useClarity, useFrame } from "@/components/ClarityProvider";
import { Chevrons } from "@/components/ui/Bits";

const DISCORD = "https://discord.gg/49wCWwHqq";

function DiscordMark() {
  return (
    <svg aria-hidden width="22" height="17" viewBox="0 0 71 55" fill="currentColor" style={{ flexShrink: 0 }}>
      <path d="M60.1 4.9A58.5 58.5 0 0 0 45.6.4a.2.2 0 0 0-.2.1c-.6 1.1-1.3 2.6-1.8 3.7a54 54 0 0 0-16.2 0c-.5-1.2-1.2-2.6-1.9-3.7a.2.2 0 0 0-.2-.1c-5 .9-9.9 2.4-14.5 4.5a.2.2 0 0 0-.1.1C1.6 18.7-1 32.1.3 45.4v.2c6.1 4.5 12 7.2 17.8 9a.2.2 0 0 0 .3-.1c1.4-1.9 2.6-3.9 3.7-6a.2.2 0 0 0-.1-.3c-2-.7-3.8-1.6-5.6-2.6a.2.2 0 0 1 0-.4l1.1-.9a.2.2 0 0 1 .2 0c11.6 5.3 24.1 5.3 35.6 0a.2.2 0 0 1 .2 0l1.1.9a.2.2 0 0 1 0 .4c-1.8 1-3.6 1.9-5.6 2.6a.2.2 0 0 0-.1.3c1.1 2.1 2.4 4.1 3.7 6a.2.2 0 0 0 .3.1c5.8-1.8 11.7-4.5 17.8-9a.2.2 0 0 0 .1-.2c1.5-15.4-2.5-28.7-10.6-40.4a.2.2 0 0 0-.1-.1ZM23.7 37.3c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.6 0 6.5 3.3 6.4 7.2 0 4-2.8 7.2-6.4 7.2Zm23.7 0c-3.5 0-6.4-3.2-6.4-7.2s2.8-7.2 6.4-7.2c3.6 0 6.5 3.3 6.4 7.2 0 4-2.8 7.2-6.4 7.2Z" />
    </svg>
  );
}

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

      <div className="shell grain" style={{ position: "relative", zIndex: 4, paddingTop: 78, paddingBottom: 40 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
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
            style={{ width: "min(330px, 58vw)", height: "auto", filter: "drop-shadow(0 22px 46px rgba(0,0,0,0.85))" }}
          />
        </h1>

        <p
          className="display"
          style={{
            fontSize: "clamp(1.25rem, 2.9vw, 2rem)",
            margin: "1.1rem 0 0",
            maxWidth: 600,
            color: "var(--ink)",
            textShadow: "0 3px 20px rgba(0,0,0,0.9)",
          }}
        >
          Two friends enter the same room.{" "}
          <span style={{ color: "var(--yellow)" }}>One of them can see it.</span>
        </p>

        <p className="lede" style={{ maxWidth: 470, marginTop: "0.8rem", fontSize: "1.02rem", textShadow: "0 2px 14px #000" }}>
          One of you is nearly blind. The other sees everything and cannot touch a
          thing. You get a voice channel and ten seconds before the arm comes back.
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: "1.5rem", alignItems: "center" }}>
          <a
            href={DISCORD}
            target="_blank"
            rel="noreferrer noopener"
            className="display flash-cta"
            style={{
              display: "inline-flex", alignItems: "center", gap: 12,
              fontSize: 18,
              letterSpacing: "0.06em",
              padding: "17px 32px",
              color: "#0B0A05",
              background: "var(--yellow)",
              textDecoration: "none",
              clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%)",
            }}
          >
            <DiscordMark />
            FIND A PARTNER ON DISCORD
          </a>

          <button
            onClick={() => { flash(); setEverFlashed(true); }}
            className="mono ghost-cta"
            style={{
              fontSize: 12, letterSpacing: "0.14em", padding: "16px 22px",
              color: ready ? "var(--ink)" : "var(--ink-faint)",
              border: "1px solid var(--steel-dark)",
              background: "color-mix(in srgb, var(--charcoal) 60%, transparent)",
              cursor: "pointer",
              transition: "opacity 240ms, transform 120ms",
            }}
          >
            {ready ? "PRESS F TO SEE" : "RECHARGING…"}
          </button>
        </div>

        <p className="mono" style={{ fontSize: 11.5, letterSpacing: "0.06em", color: "var(--ink-faint)", marginTop: "0.9rem", maxWidth: 460, lineHeight: 1.6 }}>
          The game needs two people. The Discord is where you find the second one —
          playtests, build drops, and the voice channels the whole thing is played in.
        </p>

        {/* the readout, always sharp — the HUD never lies about the state */}
        <div
          className="mono"
          style={{
            marginTop: "1.5rem",
            display: "flex", flexWrap: "wrap", gap: "1.6rem",
            fontSize: 11, letterSpacing: "0.12em", color: "var(--ink-faint)",
          }}
        >
          <span>
            CLARITY <span ref={readout} style={{ color: "var(--cyan)" }}>009</span>
            <span style={{ opacity: 0.5 }}>/100</span>
          </span>
          <span style={{ opacity: everFlashed ? 0.35 : 1, transition: "opacity 600ms" }}>
            G <span style={{ color: "var(--ink-dim)" }}>PING</span> · F <span style={{ color: "var(--ink-dim)" }}>FLASH</span>
          </span>
        </div>
      </div>

      <style>{`
        .flash-cta { transition: transform 120ms, filter 180ms; }
        .flash-cta:hover { transform: translateY(-2px); filter: brightness(1.08); }
        .flash-cta:active { transform: translateY(1px); }
        .ghost-cta:hover { border-color: var(--steel); }
        .ghost-cta:active { transform: translateY(1px); }
        .sr-only {
          position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
          overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0;
        }
      `}</style>
    </section>
  );
}
