"use client";

import Image from "next/image";
import { useState } from "react";
import Reveal from "@/components/ui/Reveal";
import { Chevrons, SectionHead } from "@/components/ui/Bits";

const CMDS = [
  { label: "host a session", cmd: "godot --path . -- --host" },
  { label: "join one",       cmd: "godot --path . -- --join 127.0.0.1" },
];

const MARQUEE = [
  "STOP MOVING!", "WHY?!", "THERE'S A HOLE!", "WHERE?!", "IN FRONT OF YOU!",
  "WHERE IS FRONT?!", "…", "AGAIN?",
];

function Copyable({ cmd }: { cmd: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard?.writeText(cmd).then(() => {
          setDone(true);
          window.setTimeout(() => setDone(false), 1400);
        }).catch(() => {});
      }}
      className="mono cmd"
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
        width: "100%", textAlign: "left", cursor: "pointer",
        padding: "13px 16px", fontSize: 13,
        background: "#0B0F14", color: "var(--ink)",
        border: "1px solid var(--edge)", borderLeft: "2px solid var(--green)",
      }}
    >
      <span><span style={{ color: "var(--green)" }}>$ </span>{cmd}</span>
      <span style={{ fontSize: 10.5, letterSpacing: "0.14em", color: done ? "var(--green)" : "var(--ink-faint)" }}>
        {done ? "COPIED" : "COPY"}
      </span>
    </button>
  );
}

export default function Outro() {
  return (
    <>
      {/* the quote reel — Pillar 5, streamability, as a marquee */}
      <div
        aria-hidden
        style={{
          overflow: "hidden", borderTop: "1px solid var(--edge)", borderBottom: "1px solid var(--edge)",
          background: "#0A0D11", padding: "16px 0",
        }}
      >
        <div style={{ display: "flex", width: "max-content", animation: "marquee 34s linear infinite" }}>
          {[0, 1].map((k) => (
            <div key={k} style={{ display: "flex", gap: "2.6rem", paddingRight: "2.6rem" }}>
              {MARQUEE.map((m, i) => (
                <span
                  key={`${k}-${i}`}
                  className="display"
                  style={{ fontSize: "clamp(1.3rem, 3vw, 2.1rem)", color: i % 2 ? "var(--ink-faint)" : "var(--yellow)", whiteSpace: "nowrap" }}
                >
                  {m}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <section className="section" style={{ position: "relative", overflow: "hidden" }}>
        <div
          aria-hidden
          style={{
            position: "absolute", inset: 0,
            background: "radial-gradient(ellipse 70% 55% at 50% 100%, color-mix(in srgb, var(--green) 10%, transparent), transparent 70%)",
          }}
        />
        <div className="shell" style={{ position: "relative" }}>
          <div className="outro-grid">
            <Reveal>
              <div>
                <SectionHead
                  index="08"
                  kicker="status"
                  title={<>v0.1 — the vertical slice.</>}
                  lede="Every system in the MVP list exists and is wired. What has not happened is the only test that matters: two humans in a call, one blind, arguing about which left."
                />

                <div style={{ display: "grid", gap: 10, maxWidth: 480 }}>
                  {CMDS.map((c) => (
                    <div key={c.cmd}>
                      <div className="mono" style={{ fontSize: 10, letterSpacing: "0.16em", color: "var(--ink-faint)", marginBottom: 6, textTransform: "uppercase" }}>
                        {c.label}
                      </div>
                      <Copyable cmd={c.cmd} />
                    </div>
                  ))}
                  <p className="mono" style={{ fontSize: 12, color: "var(--ink-faint)", marginTop: 6 }}>
                    Godot 4.7+ · ENet host/join · two OS processes complete a handshake and
                    exchange RPCs both ways.
                  </p>
                </div>

                <div style={{ marginTop: 30, display: "flex", alignItems: "center", gap: 14 }}>
                  <Chevrons count={4} colour="var(--green)" />
                  <span className="display" style={{ fontSize: 15, color: "var(--green)", letterSpacing: "0.1em" }}>
                    SUCCESS CRITERION: “ONE MORE.”
                  </span>
                </div>
              </div>
            </Reveal>

            <Reveal delay={140}>
              <div style={{ position: "relative", textAlign: "center" }}>
                <Image
                  src="/art/key.webp"
                  alt="The key: the one object only the Blind player can carry."
                  width={1024}
                  height={1024}
                  sizes="(max-width: 900px) 60vw, 360px"
                  className="drift"
                  style={{ width: "min(340px, 80%)", height: "auto", filter: "drop-shadow(0 0 60px color-mix(in srgb, var(--yellow) 30%, transparent))" }}
                />
                <div className="mono" style={{ fontSize: 11, letterSpacing: "0.16em", color: "var(--ink-faint)", marginTop: 10 }}>
                  ONLY THE BLIND PLAYER CAN CARRY IT
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <footer style={{ borderTop: "1px solid var(--edge)", background: "#080A0E" }}>
        <div className="stripe-thin" style={{ height: 6, opacity: 0.6 }} aria-hidden />
        <div
          className="shell"
          style={{
            padding: "34px 0 44px",
            display: "flex", flexWrap: "wrap", gap: "1.5rem",
            justifyContent: "space-between", alignItems: "flex-start",
          }}
        >
          <div>
            <div className="display" style={{ fontSize: 17, letterSpacing: "0.08em" }}>MY FRIEND IS BLIND</div>
            <div className="mono" style={{ fontSize: 11.5, color: "var(--ink-faint)", marginTop: 6 }}>
              Two players. One pair of eyes. Built in Godot 4.7.
            </div>
          </div>
          <div className="mono" style={{ fontSize: 11.5, color: "var(--ink-faint)", maxWidth: "44ch", lineHeight: 1.7 }}>
            Every claim on this page is quoted from the project&apos;s own design
            documents. The vision effect above is the shipping shader, ported to
            WebGL2 — same terms, same order, same numbers.
          </div>
          <div style={{ display: "grid", gap: 10, justifyItems: "start" }}>
            <a
              href="https://discord.gg/49wCWwHqq"
              target="_blank"
              rel="noreferrer noopener"
              className="mono"
              style={{
                fontSize: 11, letterSpacing: "0.14em", textDecoration: "none",
                color: "#0B0A05", background: "var(--yellow)", padding: "9px 15px",
              }}
            >
              JOIN THE DISCORD →
            </a>
            <a href="#top" className="mono" style={{ fontSize: 11, letterSpacing: "0.16em", color: "var(--ink-faint)", textDecoration: "none" }}>
              BACK TO THE TOP ↑
            </a>
          </div>
        </div>
      </footer>

      <style>{`
        .outro-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 3rem; align-items: center; }
        .cmd:hover { border-color: color-mix(in srgb, var(--green) 45%, transparent); }
        @media (max-width: 820px) { .outro-grid { grid-template-columns: 1fr; } }
      `}</style>
    </>
  );
}
