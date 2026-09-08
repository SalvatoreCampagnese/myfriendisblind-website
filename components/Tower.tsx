"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Reveal from "@/components/ui/Reveal";
import { SectionHead, Tag } from "@/components/ui/Bits";
import { ACTS, FLOORS, LADDER } from "@/lib/data";

/* The campaign is a tower of thirty floors — and a run plays eight of them:
   seven sampled one per bucket across floors 0-28, so the run still climbs,
   and the roof, which is always last.

   The tutorial is therefore not guaranteed. A pair whose first ever run
   opens on the Cryo Vault gets no on-ramp. That is a deliberate trade for
   variety. */

export default function Tower() {
  const [active, setActive] = useState(0);
  const rows = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const i = Number((e.target as HTMLElement).dataset.i);
            if (!Number.isNaN(i)) setActive(i);
          }
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );
    rows.current.forEach((r) => r && io.observe(r));
    return () => io.disconnect();
  }, []);

  const cur = FLOORS[active];
  const band = (1 - active / (FLOORS.length - 1)) * 100;

  return (
    <section id="tower" className="section" style={{ position: "relative" }}>
      <div className="shell">
        <Reveal>
          <SectionHead
            index="05"
            kicker="the campaign"
            title={<>Thirty floors.<br />You will play eight.</>}
            lede="A level is not harder because it does more damage. A level is harder because the sentence the Guide has to say gets harder to say. That is the only axis this ladder is measured on."
          />
        </Reveal>

        <div className="tower-grid">
          {/* the tower, pinned */}
          <div className="tower-art">
            <div style={{ position: "sticky", top: "13vh" }}>
              <div style={{ position: "relative", borderRadius: 2, overflow: "hidden", border: "1px solid var(--edge)" }}>
                <Image
                  src="/art/tower.webp"
                  alt="A cutaway of the tower: thirty stacked industrial floors connected by one lift shaft, the top floor open to the sky."
                  width={1024}
                  height={1536}
                  sizes="(max-width: 950px) 60vw, 330px"
                  style={{ width: "100%", height: "auto", display: "block", filter: "saturate(0.9) contrast(1.05)" }}
                />
                {/* the lift, riding the floor you are reading */}
                <div
                  aria-hidden
                  style={{
                    position: "absolute", left: 0, right: 0,
                    top: `${band}%`,
                    height: 3,
                    background: cur.colour,
                    boxShadow: `0 0 24px 4px ${cur.colour}`,
                    transition: "top 620ms cubic-bezier(0.16,0.84,0.28,1), background 400ms",
                    transform: "translateY(-1.5px)",
                  }}
                />
                <div
                  aria-hidden
                  style={{
                    position: "absolute", left: 0, right: 0, top: `${band}%`,
                    height: "16%", transform: "translateY(-50%)",
                    background: `linear-gradient(to bottom, transparent, color-mix(in srgb, ${cur.colour} 20%, transparent), transparent)`,
                    transition: "top 620ms cubic-bezier(0.16,0.84,0.28,1), background 400ms",
                  }}
                />
                <div
                  aria-hidden
                  style={{
                    position: "absolute", inset: 0,
                    background: "linear-gradient(to bottom, rgba(7,9,12,0.55), transparent 22%, transparent 78%, rgba(7,9,12,0.65))",
                  }}
                />
              </div>

              <div style={{ marginTop: 14, minHeight: 64 }}>
                <div className="mono" style={{ fontSize: 10.5, letterSpacing: "0.18em", color: "var(--ink-faint)" }}>
                  FLOOR {String(cur.n).padStart(2, "0")} · ACT {cur.act}
                </div>
                <div className="display" style={{ fontSize: 22, color: cur.colour, marginTop: 4, transition: "color 400ms" }}>
                  {cur.name}
                </div>
              </div>
            </div>
          </div>

          {/* the floors */}
          <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {ACTS.map((act) => {
              const mine = FLOORS.filter((f) => f.act === act.id);
              return (
                <li key={act.id}>
                  <Reveal>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 14, margin: "2.4rem 0 1rem" }}>
                      <span className="display" style={{ fontSize: 13, color: "var(--yellow)", letterSpacing: "0.16em" }}>
                        ACT {act.id}
                      </span>
                      <span className="display" style={{ fontSize: 17, color: "var(--ink)" }}>{act.name}</span>
                    </div>
                    <p className="mono" style={{ fontSize: 12, color: "var(--ink-faint)", margin: "0 0 14px" }}>
                      FLOORS {act.floors} — {act.about}
                    </p>
                  </Reveal>

                  <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 2 }}>
                    {mine.map((f) => {
                      const i = FLOORS.indexOf(f);
                      const on = i === active;
                      return (
                        <li
                          key={f.n}
                          data-i={i}
                          ref={(el) => { rows.current[i] = el; }}
                          className="floorrow"
                          style={{
                            display: "grid",
                            gridTemplateColumns: "46px 1fr",
                            gap: 16,
                            padding: "16px 18px",
                            background: on ? "color-mix(in srgb, var(--charcoal) 85%, transparent)" : "color-mix(in srgb, var(--charcoal) 38%, transparent)",
                            borderLeft: `2px solid ${on ? f.colour : "var(--steel-dark)"}`,
                            transition: "background 400ms, border-color 400ms",
                          }}
                        >
                          <span
                            className="display"
                            style={{ fontSize: 22, color: on ? f.colour : "var(--ink-faint)", transition: "color 400ms", lineHeight: 1.1 }}
                          >
                            {String(f.n).padStart(2, "0")}
                          </span>
                          <span>
                            <span className="display" style={{ fontSize: 19, color: on ? "var(--ink)" : "var(--ink-dim)", transition: "color 400ms" }}>
                              {f.name}
                            </span>
                            <span className="mono" style={{ display: "block", fontSize: 10.5, letterSpacing: "0.12em", color: f.colour, opacity: 0.85, margin: "5px 0 7px" }}>
                              {f.rung.toUpperCase()}
                            </span>
                            <span style={{ display: "block", fontSize: 15, color: "var(--ink-dim)", lineHeight: 1.45 }}>
                              {f.line}
                            </span>
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              );
            })}
          </ol>
        </div>

        {/* the ladder */}
        <div style={{ marginTop: "5rem" }}>
          <Reveal>
            <h3 className="display" style={{ fontSize: "clamp(1.5rem, 3.4vw, 2.2rem)", margin: "0 0 8px" }}>
              THE ONE RULE THE LADDER OBEYS
            </h3>
            <p className="lede" style={{ maxWidth: "60ch", marginTop: 0, marginBottom: "2rem" }}>
              A level that only adds hazards moves nothing up this table and does not
              belong in the campaign.
            </p>
          </Reveal>
          <div style={{ display: "grid", gap: 2 }}>
            {LADDER.map((l, i) => (
              <Reveal key={l.rung} delay={i * 60} mode="wipe">
                <div
                  className="rung"
                  style={{
                    display: "grid", gridTemplateColumns: "80px 1fr 1fr", gap: 20, alignItems: "center",
                    padding: "15px 18px",
                    background: "color-mix(in srgb, var(--charcoal) 48%, transparent)",
                    borderLeft: `2px solid color-mix(in srgb, var(--yellow) ${18 + l.rung * 14}%, var(--steel-dark))`,
                    transition: "background 240ms, transform 240ms",
                  }}
                >
                  <span className="mono" style={{ fontSize: 11, letterSpacing: "0.14em", color: "var(--ink-faint)" }}>
                    RUNG {l.rung}
                  </span>
                  <span style={{ fontSize: 16, color: "var(--ink)" }}>{l.gets}</span>
                  <span className="mono" style={{ fontSize: 14, color: "var(--yellow)" }}>{l.eg}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal delay={100}>
          <div style={{ marginTop: "2.5rem", display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <Tag colour="var(--cyan)">how a run is picked</Tag>
            <span style={{ color: "var(--ink-dim)", fontSize: 15.5, maxWidth: "64ch" }}>
              The host rolls one integer and sends it with the start call; both machines
              build the same list from it. Only the seed crosses the wire — a peer is
              never told which scene to load, only which position in a list it derived
              itself.
            </span>
          </div>
        </Reveal>
      </div>

      <style>{`
        .tower-grid { display: grid; grid-template-columns: 330px 1fr; gap: 3.5rem; align-items: start; }
        .floorrow:hover { background: color-mix(in srgb, var(--charcoal) 92%, transparent) !important; }
        .rung:hover { background: color-mix(in srgb, var(--charcoal) 82%, transparent); transform: translateX(4px); }
        @media (max-width: 950px) {
          .tower-grid { grid-template-columns: 1fr; }
          .tower-art { display: none; }
          .rung { grid-template-columns: 70px 1fr !important; }
          .rung > *:last-child { grid-column: 1 / -1; }
        }
      `}</style>
    </section>
  );
}
