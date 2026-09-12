"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useClarity, useFrame } from "@/components/ClarityProvider";
import { HAZARD_CYCLE } from "@/lib/clock";

/* Site chrome: the nav bar, the always-live hazard readout, and the two
   ability buttons.

   The HUD is drawn above the vision effect and stays perfectly sharp — the
   game does the same thing on CanvasLayer 10. The disadvantage comes from
   the role design, never from an unusable interface. */

/* Route-absolute, not bare fragments: the same header is drawn over /pitch,
   where there is no #tower to jump to. */
const NAV: { href: string; label: string; accent?: boolean }[] = [
  { href: "/#switcher", label: "THE SEAM" },
  { href: "/#tower", label: "THE TOWER" },
  { href: "/#rooms", label: "THE ROOMS" },
  { href: "/#the-game", label: "THE GAME" },
  { href: "/#roles", label: "ROLES" },
  { href: "/pitch", label: "PITCH", accent: true },
];

const DISCORD = "https://discord.gg/49wCWwHqq";

export default function Chrome() {
  const { flash, ping, phaseIndex, pings } = useClarity();
  const [scrolled, setScrolled] = useState(false);
  const chargeBar = useRef<HTMLSpanElement | null>(null);
  const clockText = useRef<HTMLSpanElement | null>(null);

  useFrame((f) => {
    if (chargeBar.current) chargeBar.current.style.transform = `scaleX(${f.charge})`;
    if (clockText.current) clockText.current.textContent = f.cycle.toFixed(1).padStart(4, "0");
  });

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  const phase = HAZARD_CYCLE[phaseIndex];

  return (
    <>
      <a
        href="#top"
        style={{
          position: "absolute", left: -9999, top: 0, zIndex: 999,
          background: "var(--yellow)", color: "#000", padding: "10px 16px",
        }}
        onFocus={(e) => { e.currentTarget.style.left = "12px"; e.currentTarget.style.top = "12px"; }}
        onBlur={(e) => { e.currentTarget.style.left = "-9999px"; }}
      >
        Skip to content
      </a>

      <header
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 60,
          transition: "background 350ms ease, border-color 350ms ease, backdrop-filter 350ms",
          background: scrolled ? "color-mix(in srgb, #07090C 82%, transparent)" : "transparent",
          backdropFilter: scrolled ? "blur(14px) saturate(1.1)" : "none",
          borderBottom: `1px solid ${scrolled ? "var(--edge)" : "transparent"}`,
        }}
      >
        <div
          className="shell"
          style={{
            display: "flex", alignItems: "center", gap: "1.5rem",
            height: 62, justifyContent: "space-between",
          }}
        >
          <Link href="/#top" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <span
              aria-hidden
              className="beacon"
              style={{
                width: 9, height: 9, borderRadius: "50%",
                background: phase.lethal ? "var(--red)" : "var(--green)",
                boxShadow: `0 0 12px ${phase.lethal ? "var(--red)" : "var(--green)"}`,
              }}
            />
            <span className="display brandmark" style={{ fontSize: 15, color: "var(--ink)", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>
              MY FRIEND IS BLIND
            </span>
          </Link>

          <nav style={{ display: "flex", gap: "1.4rem" }} className="nav-links">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="mono navlink"
                style={{
                  fontSize: 11, letterSpacing: "0.14em", textDecoration: "none",
                  color: n.accent ? "var(--yellow)" : "var(--ink-dim)",
                  transition: "color 180ms",
                  ...(n.accent
                    ? { borderBottom: "1px solid color-mix(in srgb, var(--yellow) 45%, transparent)", paddingBottom: 2 }
                    : null),
                }}
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* live phase readout — the same clock the whole site runs on */}
            <div
              className="mono hazard-readout"
              style={{
                display: "flex", alignItems: "center", gap: 8,
                fontSize: 10.5, letterSpacing: "0.1em",
                padding: "5px 9px",
                border: "1px solid var(--edge)",
                color: phase.lethal ? "var(--red)" : "var(--green)",
                background: "color-mix(in srgb, var(--charcoal) 70%, transparent)",
              }}
            >
              <span>{phase.name}</span>
              <span ref={clockText} style={{ color: "var(--ink-faint)" }}>0.0</span>
            </div>

            <button
              onClick={() => ping()}
              aria-label="PING — a directional cue (key G)"
              className="mono hud-btn"
              style={{
                fontSize: 10.5, letterSpacing: "0.12em", padding: "6px 11px",
                background: "transparent", color: "var(--cyan)",
                border: "1px solid color-mix(in srgb, var(--cyan) 38%, transparent)",
                cursor: "pointer",
              }}
            >
              G · PING
            </button>

            <button
              onClick={flash}
              aria-label="FLASH — about 1.3 seconds of clarity (key F)"
              className="mono hud-btn"
              style={{
                position: "relative", overflow: "hidden",
                fontSize: 10.5, letterSpacing: "0.12em", padding: "6px 11px",
                background: "color-mix(in srgb, var(--yellow) 12%, transparent)",
                color: "var(--yellow)",
                border: "1px solid color-mix(in srgb, var(--yellow) 50%, transparent)",
                cursor: "pointer",
              }}
            >
              <span
                ref={chargeBar}
                aria-hidden
                style={{
                  position: "absolute", inset: 0, transformOrigin: "left",
                  background: "color-mix(in srgb, var(--yellow) 22%, transparent)",
                  transform: "scaleX(1)",
                }}
              />
              <span style={{ position: "relative" }}>F · FLASH</span>
            </button>

            <a
              href={DISCORD}
              target="_blank"
              rel="noreferrer noopener"
              className="mono nav-discord"
              style={{
                fontSize: 10.5, letterSpacing: "0.12em", padding: "6px 12px",
                textDecoration: "none", color: "#0B0A05",
                background: "var(--yellow)",
              }}
            >
              DISCORD
            </a>
          </div>
        </div>
      </header>

      {/* PING — a directional cue, never a map marker. It gives you a screen
          edge and a ripple, and nothing that could solve a room for you. */}
      <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 55, pointerEvents: "none" }}>
        {pings.map((p) => (
          <span key={p.id}>
            <span
              style={{
                position: "absolute",
                left: `${p.x * 100}%`, top: `${p.y * 100}%`,
                width: 90, height: 90, marginLeft: -45, marginTop: -45,
                borderRadius: "50%", border: "2px solid var(--cyan)",
                animation: "blip 1.35s cubic-bezier(0.2,0.7,0.3,1) forwards",
              }}
            />
            <span
              style={{
                position: "absolute", top: 0, bottom: 0, width: "22vw",
                [p.x < 0.5 ? "left" : "right"]: 0,
                background: `linear-gradient(to ${p.x < 0.5 ? "right" : "left"}, color-mix(in srgb, var(--cyan) 24%, transparent), transparent)`,
                animation: "blipfade 1.35s ease-out forwards",
              } as React.CSSProperties}
            />
          </span>
        ))}
      </div>

      <style>{`
        @keyframes blipfade { 0% { opacity: 0; } 18% { opacity: 1; } 100% { opacity: 0; } }
        .navlink:hover { color: var(--yellow) !important; }
        .hud-btn:hover { filter: brightness(1.35); }
        .nav-discord:hover { filter: brightness(1.12); }
        .hud-btn:active { transform: translateY(1px); }
        @media (max-width: 980px) { .nav-links { display: none !important; } }
        @media (max-width: 480px) {
          .brandmark { font-size: 12px !important; letter-spacing: 0.04em !important; }
          .hud-btn { padding: 6px 8px !important; letter-spacing: 0.08em !important; }
        }
        @media (max-width: 620px) { .hazard-readout { display: none !important; } }
      `}</style>
    </>
  );
}
