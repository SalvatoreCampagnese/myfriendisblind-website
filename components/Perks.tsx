"use client";

import Image from "next/image";
import { useRef } from "react";
import { useClarity, useFrame } from "@/components/ClarityProvider";
import Reveal from "@/components/ui/Reveal";
import { SectionHead } from "@/components/ui/Bits";
import { FLASH } from "@/lib/clock";

/* The Blind's perk readout is a picture, not a row of words.

   PerkSlot draws ONE perk in four states, all in _draw() with no child
   nodes. This is that badge, live: hit F and watch it go READY -> ACTIVE ->
   COOLDOWN -> READY, ring filling as the wait drains.

   UNAVAILABLE outranks COOLDOWN deliberately. A player looking at a spinner
   assumes waiting will fix it; if the charge is gone or the room eats the
   signal, the spinner is the interface lying. */

const STATES = [
  { id: "READY",       colour: "var(--yellow)", what: "the lit badge" },
  { id: "ACTIVE",      colour: "var(--cyan)",   what: "the lit badge over a pulsing accent glow" },
  { id: "COOLDOWN",    colour: "var(--steel)",  what: "the badge dimmed, a ring that fills as the wait drains, and the seconds left in the middle" },
  { id: "UNAVAILABLE", colour: "var(--red)",    what: "the crossed-out badge — charges spent, or the body is in an EM-dead room" },
];

function LiveBadge() {
  const ring = useRef<HTMLCanvasElement | null>(null);
  const wrap = useRef<HTMLDivElement | null>(null);
  const num = useRef<HTMLDivElement | null>(null);
  const state = useRef<HTMLDivElement | null>(null);
  const size = 210;

  useFrame((f) => {
    const c = ring.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (c.width !== size * dpr) { c.width = size * dpr; c.height = size * dpr; }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);

    const cx = size / 2, cy = size / 2, R = size / 2 - 8;
    const cooling = !f.flashing && f.charge < 1;

    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.lineWidth = 5;
    ctx.strokeStyle = "rgba(90,98,109,0.28)";
    ctx.stroke();

    if (f.flashing) {
      // ACTIVE: a pulsing accent glow
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.lineWidth = 5 + Math.sin(f.t * 9) * 2.4;
      ctx.strokeStyle = "#22D3EE";
      ctx.shadowColor = "#22D3EE";
      ctx.shadowBlur = 22;
      ctx.stroke();
      ctx.shadowBlur = 0;
    } else if (cooling) {
      // COOLDOWN: a ring that fills as the wait drains, and a turning head
      ctx.beginPath();
      ctx.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + f.charge * Math.PI * 2);
      ctx.lineWidth = 5;
      ctx.strokeStyle = "#F2C200";
      ctx.stroke();

      const a = -Math.PI / 2 + f.charge * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(a) * R, cy + Math.sin(a) * R, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = "#F2C200";
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.lineWidth = 5;
      ctx.strokeStyle = "#F2C200";
      ctx.stroke();
    }

    if (wrap.current) {
      wrap.current.style.filter = f.flashing
        ? "brightness(1.35) saturate(1.2)"
        : cooling ? "brightness(0.45) saturate(0.3)" : "brightness(1)";
    }
    if (num.current) {
      const left = (1 - f.charge) * FLASH.cooldown;
      num.current.textContent = cooling ? left.toFixed(1) : "";
      num.current.style.opacity = cooling ? "1" : "0";
    }
    if (state.current) {
      state.current.textContent = f.flashing ? "ACTIVE" : cooling ? "COOLDOWN" : "READY";
      state.current.style.color = f.flashing ? "var(--cyan)" : cooling ? "var(--steel)" : "var(--yellow)";
    }
  });

  return (
    <div style={{ position: "relative", width: size, height: size, margin: "0 auto" }}>
      <canvas ref={ring} style={{ position: "absolute", inset: 0, width: size, height: size }} aria-hidden />
      <div ref={wrap} style={{ position: "absolute", inset: 30, transition: "filter 200ms" }}>
        <Image
          src="/art/perk-flash.webp"
          alt="The FLASH perk badge: a hazard-striped plate with a torch on it and the key F in the corner."
          width={256}
          height={256}
          style={{ width: "100%", height: "auto" }}
        />
      </div>
      <div
        ref={num}
        className="mono"
        style={{
          position: "absolute", inset: 0, display: "grid", placeContent: "center",
          fontSize: 34, color: "var(--ink)", opacity: 0,
          textShadow: "0 2px 12px #000", transition: "opacity 200ms",
        }}
      />
      <div
        ref={state}
        className="mono"
        style={{
          position: "absolute", bottom: -26, left: 0, right: 0, textAlign: "center",
          fontSize: 11, letterSpacing: "0.2em", color: "var(--yellow)",
        }}
      >
        READY
      </div>
    </div>
  );
}

export default function Perks() {
  const { flash, ping } = useClarity();

  return (
    <section className="section" style={{ background: "#0A0D11" }}>
      <div className="shell">
        <Reveal>
          <SectionHead
            index="04"
            kicker="two buttons, and only two"
            title={<>One buys clarity.<br />One buys a hint.</>}
            lede="Charges are pips under the badge, not “x2”: the Blind reads this while moving, and two boxes with one of them dark is a shape, while “VISOR x1” is a sentence."
          />
        </Reveal>

        <div className="perk-grid">
          <Reveal>
            <div style={{ textAlign: "center", padding: "10px 0 44px" }}>
              <LiveBadge />
              <button
                onClick={flash}
                className="mono perk-btn"
                style={{ marginTop: 46, color: "var(--yellow)", borderColor: "color-mix(in srgb, var(--yellow) 40%, transparent)" }}
              >
                FIRE FLASH — F
              </button>
            </div>
          </Reveal>

          <Reveal delay={110}>
            <div>
              <h3 className="display" style={{ fontSize: 30, margin: "0 0 6px", color: "var(--yellow)" }}>FLASH</h3>
              <p className="mono" style={{ fontSize: 12, letterSpacing: "0.08em", color: "var(--ink-faint)", margin: "0 0 20px" }}>
                BLIND ONLY · ~1.3 s CLEAR WINDOW
              </p>

              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  {[
                    ["shape", "anticipate 0.07 → punch 0.13 → hold 1.15 → fade 0.85", "the dip before the punch makes clarity feel earned; the slow fade makes losing it feel like loss"],
                    ["hold decay", "clarity falls to 0.82 before the fade", "you are pushed to act, not to sightsee"],
                    ["cooldown", "long", "long enough that the Guide stays essential"],
                    ["the leak", "the Guide's HUD reads FLASH ACTIVE", "deliberate: it is communication fuel, not a leak"],
                  ].map(([a, b, c]) => (
                    <tr key={a} style={{ borderTop: "1px solid var(--edge)" }}>
                      <td className="mono" style={{ padding: "12px 0", verticalAlign: "top", width: 110, fontSize: 11, letterSpacing: "0.1em", color: "var(--ink-faint)", textTransform: "uppercase" }}>{a}</td>
                      <td style={{ padding: "12px 0 12px 16px" }}>
                        <div style={{ fontSize: 15, color: "var(--ink)" }}>{b}</div>
                        <div style={{ fontSize: 13.5, color: "var(--ink-dim)", marginTop: 2 }}>{c}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ display: "grid", gap: 8, marginTop: 30 }}>
                <div className="stencil" style={{ color: "var(--yellow)" }}>FOUR STATES, ONE _draw()</div>
                {STATES.map((s, i) => (
                  <div
                    key={s.id}
                    style={{
                      display: "grid", gridTemplateColumns: "112px 1fr", gap: 14, alignItems: "baseline",
                      padding: "8px 0", borderBottom: i < 3 ? "1px solid var(--edge)" : "none",
                    }}
                  >
                    <span className="mono" style={{ fontSize: 11.5, letterSpacing: "0.14em", color: s.colour }}>{s.id}</span>
                    <span style={{ fontSize: 14.5, color: "var(--ink-dim)" }}>{s.what}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={200}>
            <div style={{ textAlign: "center" }}>
              <Image
                src="/art/perk-ping.webp"
                alt="The PING badge: a hazard-striped plate with radar arcs on it and the key G in the corner."
                width={256}
                height={256}
                style={{ width: 150, height: "auto", margin: "0 auto", filter: "drop-shadow(0 0 26px color-mix(in srgb, var(--cyan) 30%, transparent))" }}
              />
              <h3 className="display" style={{ fontSize: 26, margin: "18px 0 4px", color: "var(--cyan)" }}>PING</h3>
              <p className="mono" style={{ fontSize: 11.5, letterSpacing: "0.08em", color: "var(--ink-faint)", margin: 0 }}>
                GUIDE ONLY
              </p>
              <p style={{ fontSize: 15, color: "var(--ink-dim)", marginTop: 16, textAlign: "left" }}>
                A directional audio cue and a soft screen-edge hint. Never a path.
                Never a world-space arrow. The Guide is never given a button that
                solves the level — if one ever removes the need to talk, it is a bug.
              </p>
              <button
                onClick={() => ping()}
                className="mono perk-btn"
                style={{ marginTop: 20, color: "var(--cyan)", borderColor: "color-mix(in srgb, var(--cyan) 40%, transparent)" }}
              >
                FIRE PING — G
              </button>
            </div>
          </Reveal>
        </div>
      </div>

      <style>{`
        .perk-grid { display: grid; grid-template-columns: 260px 1fr 260px; gap: 3rem; align-items: start; }
        .perk-btn {
          font-size: 11px; letter-spacing: 0.14em; padding: 11px 18px;
          background: transparent; border: 1px solid; cursor: pointer;
          transition: filter 180ms, transform 120ms;
        }
        .perk-btn:hover { filter: brightness(1.4); }
        .perk-btn:active { transform: translateY(1px); }
        @media (max-width: 1040px) {
          .perk-grid { grid-template-columns: 240px 1fr; }
          .perk-grid > *:last-child { grid-column: 1 / -1; max-width: 520px; }
        }
        @media (max-width: 700px) { .perk-grid { grid-template-columns: 1fr; } }
      `}</style>
    </section>
  );
}
