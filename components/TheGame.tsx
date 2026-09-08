"use client";

import { useEffect, useRef, useState } from "react";
import Reveal from "@/components/ui/Reveal";
import { SectionHead } from "@/components/ui/Bits";
import { ARGUMENT, LOOP, PILLARS } from "@/lib/data";
import { useReducedMotion } from "@/lib/useReducedMotion";

/* The argument types itself out, because the joke is a rhythm and a static
   block of quotes does not have one. */

function Argument() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [typed, setTyped] = useState(-1);
  const [chars, setChars] = useState(0);
  const [running, setRunning] = useState(false);
  const reduced = useReducedMotion();

  // With motion off the argument is simply printed, in full, at once.
  const line = reduced ? ARGUMENT.length : typed;

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setRunning(true); io.disconnect(); }
    }, { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  useEffect(() => {
    if (!running) return;
    let i = 0, c = 0, cancelled = false;
    const step = () => {
      if (cancelled) return;
      const cur = ARGUMENT[i];
      if (!cur) return;
      if (c <= cur.text.length) {
        setTyped(i); setChars(c); c++;
        window.setTimeout(step, cur.who === "stage" ? 44 : 26);
      } else {
        i++; c = 0;
        if (i < ARGUMENT.length) window.setTimeout(step, 420);
        else setTyped(ARGUMENT.length);
      }
    };
    step();
    return () => { cancelled = true; };
  }, [running]);

  const colour = (who: string) =>
    who === "guide" ? "var(--orange)" : who === "blind" ? "var(--cyan)" : "var(--ink-faint)";

  return (
    <div
      ref={ref}
      className="mono plate"
      style={{
        padding: "26px 26px 30px",
        minHeight: 330,
        fontSize: "clamp(0.85rem, 1.55vw, 1.02rem)",
        lineHeight: 1.95,
        background: "linear-gradient(180deg, #0D1116, #0A0D11)",
        borderLeft: "2px solid var(--yellow)",
      }}
    >
      <div className="stencil" style={{ marginBottom: 18, color: "var(--steel)" }}>
        VOICE CHANNEL · 00:00:07
      </div>
      {ARGUMENT.map((l, i) => {
        const shown = i < line || reduced ? l.text : i === line ? l.text.slice(0, chars) : "";
        if (i > line) return null;
        return (
          <div key={i} style={{ display: "flex", gap: 12, opacity: i === line ? 1 : 0.72 }}>
            <span style={{ color: "var(--ink-faint)", width: 58, flexShrink: 0, fontSize: "0.78em" }}>
              {l.who === "stage" ? "" : l.who.toUpperCase()}
            </span>
            <span style={{ color: colour(l.who), fontStyle: l.who === "stage" ? "italic" : "normal" }}>
              {shown}
              {i === line && chars <= l.text.length && (
                <span style={{ animation: "caret 1s step-end infinite", color: "var(--yellow)" }}>▍</span>
              )}
            </span>
          </div>
        );
      })}
      {line >= ARGUMENT.length && (
        <div style={{ marginTop: 22, color: "var(--yellow)", fontSize: "0.86em", letterSpacing: "0.1em" }}>
          ▸ THAT IS THE GAME.
        </div>
      )}
    </div>
  );
}

/* The loop, as a machine schematic with something actually travelling it. */
function Loop() {
  return (
    <ol
      style={{
        listStyle: "none", margin: 0, padding: 0,
        display: "grid", gap: 2,
      }}
    >
      {LOOP.map((s, i) => (
        <Reveal as="li" key={s.id} delay={i * 90} mode="wipe">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "58px 1fr",
              alignItems: "center",
              gap: 16,
              padding: "14px 18px",
              background: "color-mix(in srgb, var(--charcoal) 62%, transparent)",
              borderLeft: `2px solid ${i === 2 ? "var(--yellow)" : "var(--steel-dark)"}`,
            }}
          >
            <span className="mono" style={{ fontSize: 11, color: "var(--ink-faint)" }}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <span>
              <span className="display" style={{ fontSize: 17, color: i === 2 ? "var(--yellow)" : "var(--ink)" }}>
                {s.id}
              </span>
              <span className="mono" style={{ fontSize: 12, color: "var(--ink-dim)", marginLeft: 14 }}>
                {s.line}
              </span>
            </span>
          </div>
        </Reveal>
      ))}
      <Reveal as="li" delay={LOOP.length * 90}>
        <div
          className="mono"
          style={{ padding: "14px 18px 0 92px", fontSize: 12, color: "var(--ink-faint)" }}
        >
          Death is instant respawn at the last checkpoint. A round is scored, not
          gated: dying costs time and pride, never progress.
        </div>
      </Reveal>
    </ol>
  );
}

export default function TheGame() {
  return (
    <section id="the-game" className="section" style={{ position: "relative" }}>
      <div className="gridfield" />
      <div className="shell" style={{ position: "relative" }}>
        <Reveal>
          <SectionHead
            index="01"
            kicker="the premise"
            title={<>You cannot move<br />your friend.</>}
            lede="You can only talk. Everything this game is made of falls out of that one restriction."
          />
        </Reveal>

        <div className="game-grid">
          <Reveal><Argument /></Reveal>
          <Reveal delay={140}>
            <div>
              <h3 className="stencil" style={{ marginBottom: 18, color: "var(--yellow)" }}>THE LOOP</h3>
              <Loop />
            </div>
          </Reveal>
        </div>

        <div style={{ marginTop: "5rem" }}>
          <Reveal>
            <h3 className="stencil" style={{ marginBottom: 22, color: "var(--yellow)" }}>
              SIX PILLARS · EVERY FEATURE REINFORCES AT LEAST ONE
            </h3>
          </Reveal>
          <div className="pillar-grid">
            {PILLARS.map((p, i) => (
              <Reveal key={p.n} delay={i * 70}>
                <div
                  className="pillar"
                  style={{
                    padding: "20px 20px 22px",
                    height: "100%",
                    background: "color-mix(in srgb, var(--charcoal) 55%, transparent)",
                    border: "1px solid var(--edge)",
                    borderTop: "2px solid var(--steel-dark)",
                    transition: "border-top-color 260ms, transform 260ms, background 260ms",
                  }}
                >
                  <div className="mono" style={{ fontSize: 10.5, color: "var(--ink-faint)", letterSpacing: "0.16em" }}>
                    PILLAR {p.n}
                  </div>
                  <div className="display" style={{ fontSize: 19, margin: "8px 0 10px", color: "var(--ink)" }}>
                    {p.name}
                  </div>
                  <p style={{ margin: 0, fontSize: 14.5, color: "var(--ink-dim)", lineHeight: 1.5 }}>{p.line}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .game-grid { display: grid; grid-template-columns: 1.05fr 1fr; gap: 3rem; align-items: start; }
        .pillar-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .pillar:hover { border-top-color: var(--yellow); transform: translateY(-3px); background: color-mix(in srgb, var(--charcoal) 78%, transparent); }
        @media (max-width: 900px) {
          .game-grid { grid-template-columns: 1fr; gap: 2.5rem; }
          .pillar-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 560px) { .pillar-grid { grid-template-columns: 1fr; } }
      `}</style>
    </section>
  );
}
