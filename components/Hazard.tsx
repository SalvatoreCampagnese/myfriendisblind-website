"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useClarity, useFrame } from "@/components/ClarityProvider";
import Reveal from "@/components/ui/Reveal";
import { SectionHead, Tag } from "@/components/ui/Bits";
import { CYCLE_SECONDS, HAZARD_CYCLE, phaseAt } from "@/lib/clock";

/* One robot arm sweeping the only route north, on a ten-second cycle.

   The phase is a pure function of the round clock, so both peers see the
   same machine with nothing to desync. That is also why this dial and the
   beacon in the nav bar never disagree: they read the same clock.

   The LIFT is lethal, and that is the point. It is the beat where a Guide
   who calls "now" one second early kills their friend. */

type Verdict = { text: string; colour: string; sub: string } | null;

function Dial() {
  const cv = useRef<HTMLCanvasElement | null>(null);
  const size = 320;

  useFrame((f) => {
    const c = cv.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (c.width !== size * dpr) { c.width = size * dpr; c.height = size * dpr; }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);

    const cx = size / 2, cy = size / 2;
    const R = size / 2 - 26;
    const START = -Math.PI / 2;

    // the four arcs, sized by their real durations
    let a0 = START;
    const colours = ["#3CD65C", "#F2C200", "#C0392B", "#E8701A"];
    HAZARD_CYCLE.forEach((p, i) => {
      const a1 = a0 + (p.seconds / CYCLE_SECONDS) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(cx, cy, R, a0 + 0.012, a1 - 0.012);
      ctx.lineWidth = 16;
      ctx.strokeStyle = colours[i];
      ctx.globalAlpha = 0.26;
      ctx.stroke();
      a0 = a1;
    });
    ctx.globalAlpha = 1;

    // the lit portion: everything the cycle has already passed
    const ang = START + (f.cycle / CYCLE_SECONDS) * Math.PI * 2;
    a0 = START;
    HAZARD_CYCLE.forEach((p, i) => {
      const a1 = a0 + (p.seconds / CYCLE_SECONDS) * Math.PI * 2;
      const end = Math.min(a1, ang);
      if (end > a0) {
        ctx.beginPath();
        ctx.arc(cx, cy, R, a0 + 0.012, end - 0.012 > a0 ? end - 0.012 : a0 + 0.013);
        ctx.lineWidth = 16;
        ctx.strokeStyle = colours[i];
        ctx.stroke();
      }
      a0 = a1;
    });

    // the head
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(ang + Math.PI / 2);
    ctx.beginPath();
    ctx.moveTo(0, -R - 13);
    ctx.lineTo(6, -R + 1);
    ctx.lineTo(-6, -R + 1);
    ctx.closePath();
    ctx.fillStyle = "#E6EAEF";
    ctx.fill();
    ctx.restore();

    // inner ring + tick marks at every second
    ctx.beginPath();
    ctx.arc(cx, cy, R - 26, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(90,98,109,0.32)";
    ctx.lineWidth = 1;
    ctx.stroke();

    for (let s = 0; s < CYCLE_SECONDS; s++) {
      const t = START + (s / CYCLE_SECONDS) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(t) * (R - 30), cy + Math.sin(t) * (R - 30));
      ctx.lineTo(cx + Math.cos(t) * (R - 36), cy + Math.sin(t) * (R - 36));
      ctx.strokeStyle = "rgba(140,140,134,0.45)";
      ctx.stroke();
    }
  });

  return <canvas ref={cv} style={{ width: size, height: size, display: "block" }} aria-hidden />;
}

export default function Hazard() {
  const { read, phaseIndex } = useClarity();
  const [verdict, setVerdict] = useState<Verdict>(null);
  const [score, setScore] = useState({ good: 0, dead: 0 });
  const label = useRef<HTMLDivElement | null>(null);
  const secs = useRef<HTMLSpanElement | null>(null);

  useFrame((f) => {
    const p = phaseAt(f.t);
    if (label.current) {
      label.current.textContent = p.phase.name;
      label.current.style.color = p.phase.colour;
    }
    if (secs.current) secs.current.textContent = (p.phase.seconds - p.local).toFixed(2);
  });

  useEffect(() => {
    if (!verdict) return;
    const id = window.setTimeout(() => setVerdict(null), 2600);
    return () => window.clearTimeout(id);
  }, [verdict]);

  const call = () => {
    const p = phaseAt(read().t);
    if (p.phase.name === "CLEAR") {
      const early = p.local < 0.4;
      setScore((s) => ({ ...s, good: s.good + 1 }));
      setVerdict(early
        ? { text: "THEY MADE IT", colour: "var(--green)", sub: "Called on the very first beat of CLEAR. Perfect, and terrifying." }
        : { text: "THEY MADE IT", colour: "var(--green)", sub: `${(3.5 - p.local).toFixed(1)} s of window left. Comfortable.` });
    } else if (p.phase.name === "ARMING") {
      setScore((s) => ({ ...s, good: s.good + 1 }));
      setVerdict({ text: "JUST BARELY", colour: "var(--yellow)", sub: `${(1.5 - p.local).toFixed(1)} s before the slam. Your friend heard the warning and went anyway.` });
    } else if (p.phase.name === "SLAM") {
      setScore((s) => ({ ...s, dead: s.dead + 1 }));
      setVerdict({ text: "YOU KILLED THEM", colour: "var(--red)", sub: "The arm was already down. There was a warning; it lasted a second and a half." });
    } else {
      setScore((s) => ({ ...s, dead: s.dead + 1 }));
      setVerdict({ text: "YOU KILLED THEM", colour: "var(--orange)", sub: "The LIFT is lethal too. One second early is the whole joke — and it is engineered." });
    }
  };

  const p = HAZARD_CYCLE[phaseIndex];

  return (
    <section id="hazard" className="section" style={{ position: "relative", overflow: "hidden" }}>
      <div
        aria-hidden
        style={{
          position: "absolute", inset: 0,
          background: `radial-gradient(ellipse 60% 50% at 22% 50%, color-mix(in srgb, ${p.lethal ? "var(--red)" : "var(--green)"} 9%, transparent), transparent 70%)`,
          transition: "background 700ms ease",
        }}
      />
      <div className="shell" style={{ position: "relative" }}>
        <Reveal>
          <SectionHead
            index="06"
            kicker="the hazard"
            title={<>Ten seconds.<br />Five of them kill.</>}
            lede="One robot arm sweeping the only route north. The dial below is live — it is the same clock the beacon in the nav bar is reading. Call the go, and find out whether your friend is still alive."
          />
        </Reveal>

        <div className="haz-grid">
          <Reveal>
            <div style={{ position: "relative", width: 320, maxWidth: "100%", margin: "0 auto" }}>
              <Dial />
              <div
                style={{
                  position: "absolute", inset: 0, display: "grid",
                  placeContent: "center", textAlign: "center", pointerEvents: "none",
                }}
              >
                <div
                  ref={label}
                  className="display"
                  style={{ fontSize: 30, color: "var(--green)", transition: "color 300ms" }}
                >
                  CLEAR
                </div>
                <div className="mono" style={{ fontSize: 12, color: "var(--ink-faint)", marginTop: 6, letterSpacing: "0.1em" }}>
                  <span ref={secs}>0.00</span> S LEFT
                </div>
                <div className="mono" style={{ fontSize: 10, color: "var(--ink-faint)", marginTop: 14, letterSpacing: "0.16em", maxWidth: 150 }}>
                  {p.lethal ? "LETHAL" : "SAFE"}
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div>
              <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 26 }}>
                <tbody>
                  {HAZARD_CYCLE.map((h, i) => (
                    <tr
                      key={h.name}
                      style={{
                        background: i === phaseIndex ? "color-mix(in srgb, var(--charcoal) 90%, transparent)" : "transparent",
                        transition: "background 300ms",
                      }}
                    >
                      <td style={{ padding: "10px 12px", borderLeft: `3px solid ${h.colour}`, width: 1 }}>
                        <span className="display" style={{ fontSize: 16, color: h.colour }}>{h.name}</span>
                      </td>
                      <td className="mono" style={{ padding: "10px 12px", fontSize: 12, color: "var(--ink-dim)", width: 1, whiteSpace: "nowrap" }}>
                        {h.seconds.toFixed(1)}s
                      </td>
                      <td style={{ padding: "10px 12px", fontSize: 14, color: h.lethal ? "var(--ink)" : "var(--ink-dim)" }}>
                        {h.note}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <button
                onClick={call}
                className="display call-btn"
                style={{
                  fontSize: 20, padding: "16px 32px", width: "100%",
                  cursor: "pointer", border: "none", color: "#0B0A05",
                  background: "var(--yellow)",
                  clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%)",
                }}
              >
                CALL IT — “GO, NOW”
              </button>

              <div
                style={{
                  marginTop: 16, minHeight: 74,
                  padding: verdict ? "14px 16px" : 0,
                  border: verdict ? `1px solid color-mix(in srgb, ${verdict.colour} 45%, transparent)` : "1px solid transparent",
                  background: verdict ? `color-mix(in srgb, ${verdict.colour} 8%, transparent)` : "transparent",
                  transition: "all 260ms",
                }}
              >
                {verdict && (
                  <>
                    <div className="display" style={{ fontSize: 21, color: verdict.colour }}>{verdict.text}</div>
                    <div style={{ fontSize: 14.5, color: "var(--ink-dim)", marginTop: 5 }}>{verdict.sub}</div>
                  </>
                )}
              </div>

              <div className="mono" style={{ marginTop: 10, fontSize: 11, letterSpacing: "0.12em", color: "var(--ink-faint)" }}>
                SURVIVED <span style={{ color: "var(--green)" }}>{String(score.good).padStart(2, "0")}</span>
                {"  ·  "}
                DEATHS <span style={{ color: "var(--red)" }}>{String(score.dead).padStart(2, "0")}</span>
                {"  ·  "}
                DEATHS ARE COUNTED IN THE ROUND STATISTICS, WHICH IS THE ENTIRE PUNISHMENT
              </div>
            </div>
          </Reveal>

          <Reveal delay={220} className="haz-art">
            <div style={{ position: "relative" }}>
              <Image
                src="/art/hazard-arm.webp"
                alt="The robot arm hazard: a heavy industrial arm on a hazard-striped base, mid-slam."
                width={1024}
                height={1024}
                sizes="(max-width: 1100px) 40vw, 320px"
                className="drift"
                style={{
                  width: "100%", height: "auto",
                  filter: `drop-shadow(0 0 40px color-mix(in srgb, ${p.lethal ? "var(--red)" : "var(--green)"} 34%, transparent))`,
                  transition: "filter 500ms, transform 500ms",
                  transform: p.name === "SLAM" ? "rotate(6deg) translateY(10px)" : p.name === "ARMING" ? "rotate(-3deg)" : "none",
                }}
              />
            </div>
          </Reveal>
        </div>

        <Reveal delay={120}>
          <div style={{ marginTop: "3rem", display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <Tag colour="var(--red)">engineered miscommunication</Tag>
            <span style={{ color: "var(--ink-dim)", fontSize: 15.5, maxWidth: "62ch" }}>
              Only the kill is server-authoritative. Everything else is a pure function
              of the clock — which is exactly why nobody can blame the netcode for what
              just happened.
            </span>
          </div>
        </Reveal>
      </div>

      <style>{`
        .haz-grid { display: grid; grid-template-columns: 320px 1fr 260px; gap: 3rem; align-items: center; }
        .call-btn:hover { filter: brightness(1.1); }
        .call-btn:active { transform: translateY(2px); }
        @media (max-width: 1100px) {
          .haz-grid { grid-template-columns: 300px 1fr; }
          .haz-art { display: none; }
        }
        @media (max-width: 760px) { .haz-grid { grid-template-columns: 1fr; gap: 2rem; } }
      `}</style>
    </section>
  );
}
