"use client";

import Image from "next/image";
import Reveal from "@/components/ui/Reveal";
import { CountUp, SectionHead, Tag } from "@/components/ui/Bits";
import { PALETTE, SPECS } from "@/lib/data";

/* docs/ART_DIRECTION.md: "The art is code."
   assets/models/*.glb are outputs. The source is a directory of Python. An
   asset change is a script edit and a rebuild, never a manual mesh tweak —
   which is what makes 69 assets stay consistent. */

const TIERS = [
  { name: "BACKGROUND",    range: "0.8 – 1.4", what: "corridors, fill, things you are not meant to look at", pct: 18 },
  { name: "GAMEPLAY AREA", range: "1.6 – 2.2", what: "the rooms you walk through", pct: 36 },
  { name: "HAZARD",        range: "2.4 – 4.0", what: "saturated red and amber, plus the pit's own green", pct: 64 },
  { name: "OBJECTIVE",     range: "5.0 – 6.0", what: "one tight spot on the key, one on the exit", pct: 100 },
];

const TRAPS = [
  { n: "01", title: "Tuning that does nothing", body: "build_materials() was guarded behind “only if the materials are missing”, so on an existing .blend every palette edit was a silent no-op. Three rounds of tuning changed zero pixels." },
  { n: "02", title: "Mirrored text", body: "Sign glyphs are laid out in the XZ plane with the readable face on +Y. A viewer on that side has their right hand toward −X, so text advancing in +X renders backwards. It did." },
  { n: "03", title: "Saturated emissives clip to white", body: "A near-neon base plus emission plus a SCREEN-blend glow pushed the toxic pit past 1.0 in every channel. It rendered white and washed the hall out." },
  { n: "04", title: "Art authored against a grey-box lies", body: "The Blind vision profile was tuned on a neutral test scene and looked correct. Against the real, much darker art it produced an unreadable smear with no shapes at all." },
];

export default function Make() {
  return (
    <section id="make" className="section">
      <div className="shell">
        <Reveal>
          <SectionHead
            index="07"
            kicker="how it is built"
            title={<>The art is code.</>}
            lede="Sixty-nine modular assets, 47.9k triangles, twenty-six flat-shaded materials and no texture maps at all — which is exactly what keeps the blur cheap, because there is no high-frequency detail to lose."
          />
        </Reveal>

        {/* the numbers */}
        <div className="spec-grid">
          {SPECS.map((s, i) => (
            <Reveal key={s.label} delay={i * 70}>
              <div
                style={{
                  padding: "20px 18px 22px",
                  borderTop: "2px solid var(--yellow)",
                  background: "color-mix(in srgb, var(--charcoal) 50%, transparent)",
                  height: "100%",
                }}
              >
                <div className="display" style={{ fontSize: 40, color: "var(--ink)", lineHeight: 1 }}>
                  <CountUp to={s.value} suffix={s.suffix} decimals={s.value % 1 !== 0 ? 1 : 0} />
                </div>
                <div className="mono" style={{ fontSize: 11, letterSpacing: "0.12em", color: "var(--yellow)", marginTop: 10, textTransform: "uppercase" }}>
                  {s.label}
                </div>
                <div style={{ fontSize: 13.5, color: "var(--ink-dim)", marginTop: 4 }}>{s.note}</div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* palette */}
        <div style={{ marginTop: "4.5rem" }}>
          <Reveal>
            <h3 className="display" style={{ fontSize: "clamp(1.5rem, 3.4vw, 2.2rem)", margin: "0 0 6px" }}>
              ACCENT COLOURS MEAN THINGS
            </h3>
            <p className="lede" style={{ maxWidth: "56ch", marginTop: 0, marginBottom: "1.8rem" }}>
              Structure is neutral. Colour carries meaning and is used sparingly. If
              everything glows, nothing reads.
            </p>
          </Reveal>

          <div className="pal-grid">
            {PALETTE.map((p, i) => (
              <Reveal key={p.hex} delay={i * 45}>
                <div className="swatch" style={{ height: "100%" }}>
                  <div style={{ height: 66, background: p.hex, borderBottom: "1px solid rgba(0,0,0,0.5)" }} />
                  <div style={{ padding: "10px 11px 13px", background: "color-mix(in srgb, var(--charcoal) 60%, transparent)", borderTop: 0 }}>
                    <div className="mono" style={{ fontSize: 11, color: "var(--ink)" }}>{p.hex}</div>
                    <div className="mono" style={{ fontSize: 9.5, letterSpacing: "0.14em", color: "var(--ink-faint)", marginTop: 3, textTransform: "uppercase" }}>
                      {p.role}
                    </div>
                    <div style={{ fontSize: 12.5, color: "var(--ink-dim)", marginTop: 5, lineHeight: 1.35 }}>{p.use}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* lighting tiers */}
        <div className="light-grid" style={{ marginTop: "4.5rem" }}>
          <Reveal>
            <div>
              <h3 className="display" style={{ fontSize: "clamp(1.4rem, 3vw, 1.9rem)", margin: "0 0 6px" }}>
                FOUR LIGHTING TIERS
              </h3>
              <p style={{ color: "var(--ink-dim)", maxWidth: "44ch", marginTop: 0 }}>
                No sky. No directional light. Looking up shows fogged blackness crossed
                by roof trusses, which reads as a high industrial ceiling and costs
                nothing.
              </p>
              <div style={{ display: "grid", gap: 2, marginTop: 24 }}>
                {TIERS.map((t, i) => (
                  <div key={t.name} style={{ padding: "13px 0", borderTop: "1px solid var(--edge)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16 }}>
                      <span className="display" style={{ fontSize: 15, color: "var(--ink)" }}>{t.name}</span>
                      <span className="mono" style={{ fontSize: 11.5, color: "var(--yellow)" }}>{t.range}</span>
                    </div>
                    <div
                      style={{
                        height: 3, marginTop: 8,
                        background: `linear-gradient(to right, color-mix(in srgb, var(--yellow) ${20 + i * 20}%, transparent) ${t.pct}%, var(--edge) ${t.pct}%)`,
                      }}
                    />
                    <div style={{ fontSize: 13.5, color: "var(--ink-dim)", marginTop: 7 }}>{t.what}</div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div style={{ position: "relative", border: "1px solid var(--edge)", overflow: "hidden" }}>
              <Image
                src="/art/menu-bg.webp"
                alt="The game's menu backdrop: a fogged industrial hall with hazard-striped crates and a yellow hard hat marked BLIND."
                width={1712}
                height={949}
                sizes="(max-width: 900px) 100vw, 48vw"
                style={{ width: "100%", height: "auto", display: "block" }}
              />
              <div
                aria-hidden
                style={{
                  position: "absolute", inset: 0,
                  background: "linear-gradient(to top, rgba(7,9,12,0.9), transparent 45%)",
                }}
              />
              <div className="mono" style={{ position: "absolute", left: 16, bottom: 14, fontSize: 10.5, letterSpacing: "0.16em", color: "var(--ink-dim)" }}>
                GOOD COMMUNICATION SURVIVES EVERYTHING
              </div>
            </div>
          </Reveal>
        </div>

        {/* the traps */}
        <div style={{ marginTop: "4.5rem" }}>
          <Reveal>
            <h3 className="display" style={{ fontSize: "clamp(1.5rem, 3.4vw, 2.2rem)", margin: "0 0 6px" }}>
              FOUR TRAPS THAT COST REAL TIME
            </h3>
            <p className="lede" style={{ maxWidth: "58ch", marginTop: 0, marginBottom: "2rem" }}>
              Recorded because each was invisible until something was actually rendered.
            </p>
          </Reveal>
          <div className="trap-grid">
            {TRAPS.map((t, i) => (
              <Reveal key={t.n} delay={i * 80}>
                <div
                  className="trap"
                  style={{
                    padding: "20px 20px 22px", height: "100%",
                    background: "color-mix(in srgb, var(--charcoal) 46%, transparent)",
                    borderLeft: "2px solid var(--red)",
                    transition: "background 260ms, transform 260ms",
                  }}
                >
                  <div className="mono" style={{ fontSize: 11, letterSpacing: "0.16em", color: "var(--red)" }}>TRAP {t.n}</div>
                  <div className="display" style={{ fontSize: 18, margin: "8px 0 10px", color: "var(--ink)" }}>{t.title}</div>
                  <p style={{ margin: 0, fontSize: 14.5, color: "var(--ink-dim)", lineHeight: 1.5 }}>{t.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal delay={100}>
          <div style={{ marginTop: "3rem", display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <Tag colour="var(--green)">the design rule</Tag>
            <span style={{ color: "var(--ink-dim)", fontSize: 15.5, maxWidth: "64ch" }}>
              If a system technically works but the round is boring, change the mechanic
              rather than polishing the system. The goal is not to implement the
              specification.
            </span>
          </div>
        </Reveal>
      </div>

      <style>{`
        .spec-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 12px; }
        .pal-grid  { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; }
        .light-grid{ display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; align-items: start; }
        .trap-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
        .trap:hover { background: color-mix(in srgb, var(--charcoal) 78%, transparent); transform: translateY(-3px); }
        .swatch { transition: transform 240ms; }
        .swatch:hover { transform: translateY(-4px); }
        @media (max-width: 1100px) {
          .spec-grid { grid-template-columns: repeat(3, 1fr); }
          .trap-grid { grid-template-columns: 1fr 1fr; }
          .pal-grid  { grid-template-columns: repeat(4, 1fr); }
        }
        @media (max-width: 820px) { .light-grid { grid-template-columns: 1fr; gap: 2.5rem; } }
        @media (max-width: 620px) {
          .spec-grid { grid-template-columns: 1fr 1fr; }
          .trap-grid { grid-template-columns: 1fr; }
          .pal-grid  { grid-template-columns: 1fr 1fr; }
        }
      `}</style>
    </section>
  );
}
