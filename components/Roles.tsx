"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import VisionCanvas from "@/components/vision/VisionCanvas";
import Reveal from "@/components/ui/Reveal";
import { SectionHead, Tag } from "@/components/ui/Bits";

/* docs/ART_DIRECTION.md, "the one visual requirement":

     A screenshot must say, without a caption:
     One of these players can see everything. The other cannot.

   So the site says it with one room and one seam. Same frame, same
   moment, same geometry — the only difference is which player is
   standing in it. */

const ROWS = [
  { label: "Vision",         blind: "heavy blur, low contrast, vignette, distortion", guide: "normal" },
  { label: "Sees the key",   blind: "only during FLASH",                              guide: "always" },
  { label: "Sees hazards",   blind: "barely",                                         guide: "clearly, including their timing" },
  { label: "Can carry the key", blind: "yes",                                         guide: "no" },
  { label: "Ability",        blind: "F — FLASH: ~1.3 s of clarity, long cooldown",    guide: "G — PING: a directional cue, not a map marker" },
  { label: "Feels",          blind: "vulnerable, confused, still busy",               guide: "responsible, informed, helpless" },
];

function Seam() {
  const [x, setX] = useState(0.5);
  const box = useRef<HTMLDivElement | null>(null);
  const dragging = useRef(false);

  const move = useCallback((clientX: number) => {
    const r = box.current?.getBoundingClientRect();
    if (!r) return;
    setX(Math.min(0.97, Math.max(0.03, (clientX - r.left) / r.width)));
  }, []);

  return (
    <div
      ref={box}
      className="seam-box"
      onPointerDown={(e) => { dragging.current = true; (e.target as Element).setPointerCapture?.(e.pointerId); move(e.clientX); }}
      onPointerMove={(e) => { if (dragging.current) move(e.clientX); }}
      onPointerUp={() => { dragging.current = false; }}
      onPointerCancel={() => { dragging.current = false; }}
      style={{
        position: "relative",
        aspectRatio: "16 / 9",
        overflow: "hidden",
        border: "1px solid var(--edge)",
        cursor: "ew-resize",
        touchAction: "none",
        userSelect: "none",
        background: "#05070A",
      }}
    >
      {/* GUIDE: the untouched frame */}
      <Image
        src="/art/shot-gantry.webp"
        alt="The Foundry Gantry as the Guide sees it: three lit decks, yellow railings, a red warning lamp on the crusher."
        fill
        sizes="(max-width: 900px) 100vw, 62vw"
        style={{ objectFit: "cover", filter: "brightness(1.22) saturate(1.06)" }}
      />

      {/* BLIND: the same frame, through the real shader */}
      <div
        aria-hidden
        style={{ position: "absolute", inset: 0, clipPath: `inset(0 ${(1 - x) * 100}% 0 0)` }}
      >
        <VisionCanvas src="/art/shot-gantry.webp" darkness={0.42} exposure={2.0} fixedClarity={0.05} style={{ position: "absolute", inset: 0 }} />
      </div>

      {/* the seam itself */}
      <div
        aria-hidden
        style={{
          position: "absolute", top: 0, bottom: 0, left: `${x * 100}%`,
          width: 2, background: "var(--cyan)",
          boxShadow: "0 0 22px 3px color-mix(in srgb, var(--cyan) 55%, transparent)",
          transform: "translateX(-1px)",
        }}
      >
        <span
          style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            width: 44, height: 44, borderRadius: 2,
            background: "#0A0D11", border: "1px solid var(--cyan)",
            display: "grid", placeItems: "center",
            color: "var(--cyan)", fontSize: 13,
          }}
          className="mono"
        >
          ⇄
        </span>
      </div>

      <span className="mono seam-label" style={{ left: 14, color: "var(--cyan)", borderColor: "color-mix(in srgb, var(--cyan) 45%, transparent)" }}>
        BLIND
      </span>
      <span className="mono seam-label" style={{ right: 14, color: "var(--orange)", borderColor: "color-mix(in srgb, var(--orange) 45%, transparent)" }}>
        GUIDE
      </span>

      <input
        type="range" min={3} max={97} value={Math.round(x * 100)}
        onChange={(e) => setX(Number(e.target.value) / 100)}
        aria-label="Drag to compare what the Blind player sees with what the Guide sees"
        style={{
          position: "absolute", bottom: 10, left: "12%", width: "76%",
          opacity: 0, height: 34, cursor: "ew-resize",
        }}
      />

      <style>{`
        .seam-label {
          position: absolute; top: 14px; font-size: 10.5px; letter-spacing: 0.18em;
          padding: 5px 10px; background: rgba(6,8,11,0.8); border: 1px solid;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}

function RoleCard({
  side, art, name, accent, ability, lines,
}: {
  side: string; art: string; name: string; accent: string; ability: string; lines: string[];
}) {
  return (
    <div
      className="rolecard"
      style={{
        position: "relative",
        overflow: "hidden",
        border: "1px solid var(--edge)",
        borderTop: `2px solid ${accent}`,
        background: "linear-gradient(180deg, color-mix(in srgb, var(--charcoal) 80%, transparent), #0A0D11)",
      }}
    >
      <div style={{ position: "relative", aspectRatio: "1 / 1", overflow: "hidden" }}>
        <Image
          src={art}
          alt={`The ${name} player`}
          fill
          sizes="(max-width: 780px) 100vw, 30vw"
          style={{ objectFit: "cover", objectPosition: "50% 30%" }}
        />
        <div
          aria-hidden
          style={{
            position: "absolute", inset: 0,
            background: `linear-gradient(to top, #0A0D11 4%, transparent 55%), radial-gradient(ellipse at 50% 40%, transparent 40%, color-mix(in srgb, ${accent} 12%, transparent) 100%)`,
          }}
        />
        <span
          className="mono"
          style={{
            position: "absolute", top: 12, left: 12, fontSize: 10, letterSpacing: "0.2em",
            color: accent, padding: "4px 9px", border: `1px solid color-mix(in srgb, ${accent} 40%, transparent)`,
            background: "rgba(6,8,11,0.75)",
          }}
        >
          {side}
        </span>
      </div>

      <div style={{ padding: "18px 20px 22px" }}>
        <div className="display" style={{ fontSize: 26, color: accent, lineHeight: 1 }}>{name}</div>
        <div className="mono" style={{ fontSize: 11.5, color: "var(--ink-faint)", marginTop: 8, letterSpacing: "0.1em" }}>
          {ability}
        </div>
        <ul style={{ margin: "16px 0 0", padding: 0, listStyle: "none", display: "grid", gap: 8 }}>
          {lines.map((l) => (
            <li key={l} style={{ display: "flex", gap: 10, fontSize: 14.5, color: "var(--ink-dim)", lineHeight: 1.45 }}>
              <span aria-hidden style={{ color: accent, flexShrink: 0 }}>▸</span>
              <span>{l}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function Roles() {
  return (
    <section id="roles" className="section" style={{ background: "linear-gradient(180deg, transparent, #0A0D11 30%, #0A0D11 70%, transparent)" }}>
      <div className="shell">
        <Reveal>
          <SectionHead
            index="02"
            kicker="asymmetric information"
            title={<>The same room.<br />Drag the seam.</>}
            lede="Nothing on the left has been removed. It is the identical frame, through the identical shader the game ships — 35 uniforms, mip-blurred, tinted cold, tunnelled and grained."
          />
        </Reveal>

        <Reveal mode="wipe"><Seam /></Reveal>

        <Reveal delay={120}>
          <p className="mono" style={{ fontSize: 12, color: "var(--ink-faint)", marginTop: 14, letterSpacing: "0.06em" }}>
            The blur is a mipmap textureLod sample, so its cost is flat and its apparent
            radius scales with viewport width. Getting that wrong makes the game far
            easier at 4K — which is why it is a measured constant, not an eyeballed one.
          </p>
        </Reveal>

        <div className="roles-grid" style={{ marginTop: "4rem" }}>
          <Reveal delay={0}>
            <RoleCard
              side="ROLE A"
              art="/art/role-blind.webp"
              name="BLIND"
              accent="var(--cyan)"
              ability="F — FLASH · ~1.3 s of clarity · long cooldown"
              lines={[
                "Shapes and colour blobs. No detail, no readable signs.",
                "Bright things smear outward — you cannot read the EXIT sign, but you can see that there is a green glow over there.",
                "The only player who can pick up the key, open the door and reach the exit.",
                "Not a passenger. Vulnerable, confused, and still busy.",
              ]}
            />
          </Reveal>

          <Reveal delay={110}>
            <div style={{ display: "grid", gap: 2, alignContent: "start" }}>
              <div className="stencil" style={{ marginBottom: 12, color: "var(--yellow)" }}>
                THE ONLY THREE THINGS THAT DIFFER
              </div>
              {ROWS.map((r, i) => (
                <div
                  key={r.label}
                  className="rolerow"
                  style={{
                    display: "grid", gridTemplateColumns: "1fr 1fr",
                    gap: 1,
                    background: "var(--edge)",
                    animationDelay: `${i * 60}ms`,
                  }}
                >
                  <div style={{ padding: "11px 13px", background: "#0B0F14" }}>
                    <div className="mono" style={{ fontSize: 9.5, letterSpacing: "0.16em", color: "var(--ink-faint)" }}>
                      {r.label.toUpperCase()}
                    </div>
                    <div style={{ fontSize: 14, color: "var(--cyan)", marginTop: 3, lineHeight: 1.35 }}>{r.blind}</div>
                  </div>
                  <div style={{ padding: "11px 13px", background: "#0B0F14" }}>
                    <div className="mono" style={{ fontSize: 9.5, letterSpacing: "0.16em", color: "var(--ink-faint)" }}>
                      &nbsp;
                    </div>
                    <div style={{ fontSize: 14, color: "var(--orange)", marginTop: 3, lineHeight: 1.35 }}>{r.guide}</div>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={220}>
            <RoleCard
              side="ROLE B"
              art="/art/role-guide.webp"
              name="GUIDE"
              accent="var(--orange)"
              ability="G — PING · a directional cue, never a path"
              lines={[
                "Clear vision, an objective marker, the hazard's phase countdown.",
                "The Guide's data is never sent to the Blind client — restricted synchronizers and targeted RPCs, not hidden UI.",
                "Never given a button that solves the level.",
                "Responsible, informed, and completely helpless.",
              ]}
            />
          </Reveal>
        </div>

        <Reveal delay={120}>
          <div style={{ marginTop: "2.5rem", display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <Tag colour="var(--yellow)">design rule</Tag>
            <span style={{ color: "var(--ink-dim)", fontSize: 15.5 }}>
              If a Guide ability ever removes the need to talk, it is a design bug — not a feature.
            </span>
          </div>
        </Reveal>
      </div>

      <style>{`
        .roles-grid { display: grid; grid-template-columns: 1fr 1.15fr 1fr; gap: 20px; align-items: start; }
        .rolecard { transition: transform 320ms cubic-bezier(0.16,0.84,0.28,1); }
        .rolecard:hover { transform: translateY(-5px); }
        @media (max-width: 1000px) {
          .roles-grid { grid-template-columns: 1fr 1fr; }
          .roles-grid > *:nth-child(2) { grid-column: 1 / -1; order: 3; }
        }
        @media (max-width: 640px) { .roles-grid { grid-template-columns: 1fr; } }
      `}</style>
    </section>
  );
}
