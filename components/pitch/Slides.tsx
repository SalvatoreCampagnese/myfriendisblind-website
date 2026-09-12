"use client";

import Image from "next/image";
import { createContext, useContext, useEffect, useState, type ElementType, type ReactNode } from "react";
import VisionCanvas from "@/components/vision/VisionCanvas";
import { Chevrons } from "@/components/ui/Bits";
import { useReducedMotion } from "@/lib/useReducedMotion";
import {
  ASKS, ASSUMPTIONS, BREAK_EVEN, COMPARABLES, CREATORS, CUTS, FIXED_COST_EUR, SLIDES,
  FOUNDER, GTM, HITS, LOOP, MARGINS, MULTIPLIER, NEXT_STEPS, PILLARS,
  ASK_BEYOND_CAPITAL, ASK_TOTAL_EUR, ASK_USE, COST_PER_RELAYED_SESSION, eur, FREE_SESSIONS,
  GB_PER_RELAYED_SESSION, INFRA, PLATFORM_COLOUR, PROJECTIONS, ROADMAP, SCALE,
  SOURCES_CREATOR, SOURCES_MARKET, STATUS_COLOUR, UNIT, usdK,
} from "@/lib/pitch";

const DISCORD = "https://discord.gg/49wCWwHqq";

/* =====================================================================
   Thirteen slides, one per page of the September 2026 deck.

   The deck is a document, so the numbers stay exactly as the deck states
   them — including the caveats. Slide 5 and slide 10 both hinge on the
   difference between a disclosed figure and a third-party estimate, and a
   deck that quietly drops that distinction is a deck that cannot be
   checked. So the STIMA / PUBBLICO tags are part of the design, not a
   disclaimer bolted to the bottom.
   ===================================================================== */

/** True while this slide is the one on screen. Drives every stagger. */
const Live = createContext(false);
export const useLive = () => useContext(Live);

/* --------------------------------------------------------------- atoms */

/** An animated block. `d` is the stagger, in ms. */
type AProps = React.HTMLAttributes<HTMLElement> & {
  d?: number;
  mode?: "wipe" | "rise" | "bar";
  as?: ElementType;
};

function A({ children, d = 0, mode, as: Tag = "div", style, ...rest }: AProps) {
  return (
    <Tag data-pa={mode ?? ""} style={{ ...style, ["--pd" as string]: `${d}ms` }} {...rest}>
      {children}
    </Tag>
  );
}

/** Counts up the first time its slide becomes the live one. */
function Num({
  to, decimals = 0, thousands = false, prefix = "", suffix = "",
}: {
  to: number; decimals?: number; thousands?: boolean; prefix?: string; suffix?: string;
}) {
  const live = useLive();
  const reduced = useReducedMotion();
  const [v, setV] = useState(0);

  // The ramp runs every time the slide becomes live, with no run-once latch:
  // a latch set in an effect body is cleared and re-read by StrictMode's
  // double mount, which left deep-linked slides frozen at zero. Re-counting
  // on a revisit is the better failure anyway.
  useEffect(() => {
    if (!live || reduced) return;

    const t0 = performance.now();
    const dur = 1000;
    let raf = 0;
    const step = (t: number) => {
      const u = Math.min(1, (t - t0) / dur);
      setV(to * (1 - Math.pow(1 - u, 4)));
      if (u < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [live, reduced, to]);

  const shown = reduced ? to : v;
  const text = thousands
    ? new Intl.NumberFormat("it-IT", { maximumFractionDigits: decimals, useGrouping: "always" }).format(shown)
    : shown.toFixed(decimals);

  return <span className="mono">{prefix}{text}{suffix}</span>;
}

/** A bar that grows out of its left edge. Width carries the value. */
function Bar({ pct, colour, d = 0, height = 6 }: { pct: number; colour: string; d?: number; height?: number }) {
  return (
    <div style={{ height, width: "100%", background: "color-mix(in srgb, var(--steel-dark) 45%, transparent)" }}>
      <A
        mode="bar"
        d={d}
        style={{
          height: "100%",
          width: `${Math.max(2, pct * 100)}%`,
          background: colour,
          boxShadow: `0 0 14px -2px ${colour}`,
        }}
      >
        {null}
      </A>
    </div>
  );
}

function Card({
  children, accent, d = 0, glow = false, pad = "0.95rem 1.1rem", col = false,
}: {
  children: ReactNode; accent?: string; d?: number; glow?: boolean; pad?: string;
  /** column layout, so a `margin-top: auto` footer sits on the card floor */
  col?: boolean;
}) {
  return (
    <A
      d={d}
      className="pcard clip-plate"
      style={{
        padding: pad,
        ...(col ? { display: "flex", flexDirection: "column" as const } : null),
        borderLeft: accent ? `2px solid ${accent}` : undefined,
        boxShadow: glow && accent
          ? `0 0 34px -14px ${accent}, inset 0 1px 0 rgba(255,255,255,0.04)`
          : "inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      {children}
    </A>
  );
}

function Kicker({ children, colour = "var(--accent)" }: { children: ReactNode; colour?: string }) {
  return (
    <div className="mono" style={{ fontSize: 10, letterSpacing: "0.2em", color: colour, textTransform: "uppercase" }}>
      {children}
    </div>
  );
}

function Foot({ children, d = 900, m = "1rem" }: { children: ReactNode; d?: number; m?: string }) {
  return (
    <A
      d={d}
      className="mono"
      style={{
        marginTop: m, fontSize: 10.5, lineHeight: 1.65,
        letterSpacing: "0.03em", color: "var(--ink-faint)", maxWidth: "96ch",
      }}
    >
      {children}
    </A>
  );
}

/** The head every slide but the cover wears. */
function Head({
  n, kicker, title, lede, size = "1",
}: {
  n: string; kicker: string; title: ReactNode; lede?: ReactNode; size?: "1" | "2";
}) {
  const fs = size === "1"
    ? "clamp(1.55rem, 3.8vw, 3.1rem)"
    : "clamp(1.35rem, 3vw, 2.4rem)";
  return (
    <header style={{ marginBottom: "clamp(0.9rem, 2.2vh, 1.6rem)" }}>
      <A d={0} style={{ display: "flex", alignItems: "center", gap: 13, marginBottom: 12 }}>
        <span className="display" style={{ fontSize: 12, color: "var(--accent)", letterSpacing: "0.2em" }}>{n}</span>
        <span style={{ height: 1, width: 30, background: "var(--steel-dark)" }} />
        <span className="stencil" style={{ fontSize: "0.66rem" }}>{kicker}</span>
      </A>
      <A d={70} as="h2" className="display" style={{ fontSize: fs, margin: 0, color: "var(--ink)", maxWidth: "26ch" }}>
        {title}
      </A>
      {lede ? (
        <A d={150} as="p" style={{
          margin: "0.7rem 0 0", maxWidth: "72ch",
          fontSize: "clamp(0.95rem, 1.45vw, 1.15rem)", color: "var(--ink-dim)", lineHeight: 1.55,
        }}>
          {lede}
        </A>
      ) : null}
    </header>
  );
}

/** Slide body wrapper: the shell, plus the grid backdrop. */
function Body({ children, grid = true, back }: { children: ReactNode; grid?: boolean; back?: ReactNode }) {
  return (
    <>
      {back}
      {grid ? <div className="gridfield" aria-hidden style={{ opacity: 0.3 }} /> : null}
      <div className="shell" style={{ position: "relative", zIndex: 2, width: "min(1240px, 100% - 3.5rem)" }}>
        {children}
      </div>
    </>
  );
}

function Grid({ children, min = 220, gap = "0.8rem" }: { children: ReactNode; min?: number; gap?: string }) {
  return (
    <div style={{ display: "grid", gap, gridTemplateColumns: `repeat(auto-fit, minmax(min(${min}px, 100%), 1fr))` }}>
      {children}
    </div>
  );
}

/* ============================================================ 01 cover */

function Cover() {
  return (
    <>
      {/* The one visual requirement, as the cover: the same room twice.
          Left is the Guide's frame. Right is the Blind's, drawn by the real
          shader at a clarity the deck never lets improve. */}
      <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 0, display: "flex", overflow: "hidden" }}>
        <div style={{ position: "relative", flex: 1, overflow: "hidden" }}>
          <Image
            src="/art/hero-hall.webp"
            alt=""
            fill
            priority
            sizes="50vw"
            style={{ objectFit: "cover", filter: "saturate(0.95) contrast(1.08) brightness(0.95)" }}
          />
        </div>
        <div style={{ position: "relative", flex: 1, overflow: "hidden", background: "#06080B" }}>
          <VisionCanvas
            src="/art/hero-hall.webp"
            darkness={0.5}
            exposure={2.4}
            fixedClarity={0.05}
            style={{ position: "absolute", inset: 0 }}
          />
        </div>
      </div>

      {/* the seam */}
      <div
        aria-hidden
        style={{
          position: "absolute", top: 0, bottom: 0, left: "50%", width: 1, zIndex: 1,
          background: "color-mix(in srgb, var(--cyan) 70%, transparent)",
          boxShadow: "0 0 30px 4px color-mix(in srgb, var(--cyan) 35%, transparent)",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
          background:
            "radial-gradient(ellipse 66% 58% at 50% 50%, rgba(7,9,12,0.5) 12%, rgba(7,9,12,0.9) 100%), linear-gradient(to top, #07090C 1%, transparent 30%)",
        }}
      />

      <div className="shell" style={{ position: "relative", zIndex: 3, textAlign: "center" }}>
        <A d={0} style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 14, marginBottom: 18 }}>
          <Chevrons count={4} />
          <span className="stencil" style={{ color: "var(--concrete)", fontSize: "0.66rem" }}>
            co-op · social party · pc
          </span>
          <Chevrons count={4} />
        </A>

        <A d={90} as="h1" style={{ margin: 0 }}>
          <span className="sr-only">My Friend Is Blind — pitch deck, settembre 2026</span>
          <Image
            src="/art/logo.webp"
            alt="My Friend Is Blind"
            width={1536}
            height={1024}
            priority
            className="drift"
            style={{
              width: "min(340px, 54vw)", height: "auto", margin: "0 auto",
              filter: "drop-shadow(0 24px 52px rgba(0,0,0,0.9))",
            }}
          />
        </A>

        <A d={200} as="p" className="display" style={{
          fontSize: "clamp(1.05rem, 2.5vw, 1.85rem)", margin: "1.1rem auto 0", maxWidth: "30ch",
          textShadow: "0 3px 20px rgba(0,0,0,0.9)",
        }}>
          Due giocatori. Informazioni diverse.<br />
          <span style={{ color: "var(--yellow)" }}>Una sola possibilità: comunicare.</span>
        </A>

        <A d={300} className="mono" style={{
          marginTop: "clamp(1.1rem, 2.6vh, 1.8rem)", fontSize: 10.5, letterSpacing: "0.16em",
          color: "var(--ink)", textTransform: "uppercase",
        }}>
          asymmetric information — il gameplay nasce da ciò che un giocatore sa e l’altro no
        </A>

        <A d={390} className="mono" style={{
          marginTop: "0.75rem", fontSize: 10.5, letterSpacing: "0.2em", color: "var(--yellow)",
        }}>
          PITCH DECK · SETTEMBRE 2026
        </A>
      </div>
    </>
  );
}

/* ========================================================== 02 founder */

function Founder() {
  return (
    <Body
      back={
        /* The DEVELOPER claim, shown rather than stated: the game's own
           modular wall kit, parked in the empty quarter beside the heading
           and cropped to its top row. Faded into the page from the left so
           it reads as work on a bench, not as wallpaper. */
        <div
          aria-hidden
          className="founder-kit"
          style={{
            position: "absolute", right: "-2%", top: "4%", width: "52%",
            height: "clamp(92px, 20vh, 168px)",
            zIndex: 0, overflow: "hidden", pointerEvents: "none",
            maskImage: "linear-gradient(to right, transparent 2%, #000 38%)",
            WebkitMaskImage: "linear-gradient(to right, transparent 2%, #000 38%)",
          }}
        >
          <Image
            src="/art/kit-walls.webp"
            alt=""
            fill
            sizes="(max-width: 900px) 92vw, 780px"
            style={{
              objectFit: "cover",
              objectPosition: "center top",
              opacity: 0.6,
              filter: "saturate(0.9) contrast(1.04) brightness(0.9)",
            }}
          />
        </div>
      }
    >
      <Head
        n="02"
        kicker="founder–market fit"
        title="Founder–market fit"
        lede="Il progetto nasce dall’incrocio tra esperienza tecnica, prodotto e community gaming."
      />

      <Grid min={210}>
        {FOUNDER.map((f, i) => (
          <Card key={f.kicker} accent={f.colour} d={220 + i * 90}>
            <Kicker colour={f.colour}>{f.kicker}</Kicker>
            <div className="display" style={{ fontSize: "clamp(1.9rem, 4vw, 2.9rem)", marginTop: 8, color: "var(--ink)" }}>
              <Num to={f.value} suffix={f.suffix} thousands={f.thousands} />
            </div>
            <div style={{ height: 1, background: "var(--edge)", margin: "0.7rem 0 0.65rem" }} />
            <p style={{ margin: 0, fontSize: "0.86rem", lineHeight: 1.55, color: "var(--ink-dim)" }}>{f.body}</p>
          </Card>
        ))}
      </Grid>

      {/* The claim and its oldest piece of evidence, side by side. */}
      <A d={640} className="pcard pitch-2col" style={{
        marginTop: "0.8rem", padding: "0.95rem 1.1rem", borderLeft: "2px solid var(--yellow)",
        display: "grid", gridTemplateColumns: "auto minmax(0, 1fr)", gap: "1.1rem", alignItems: "center",
      }}>
        <figure className="founder-shot" style={{
          margin: 0, position: "relative", flex: "0 0 auto",
          width: "clamp(104px, 13vh, 148px)", aspectRatio: "1 / 1",
          border: "1px solid var(--edge)", overflow: "hidden",
        }}>
          <Image
            src="/art/founder.webp"
            alt="Il founder, da bambino, seduto a una scrivania con le mani sulla tastiera di un PC."
            fill
            sizes="160px"
            style={{ objectFit: "cover", objectPosition: "34% 38%", filter: "saturate(0.92) contrast(1.08)" }}
          />
          <span aria-hidden style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to top, rgba(7,9,12,0.55), transparent 55%)",
          }} />
          <figcaption className="mono" style={{
            position: "absolute", left: 7, bottom: 6, fontSize: 8.5,
            letterSpacing: "0.16em", color: "var(--yellow)",
          }}>
            DAY 1
          </figcaption>
        </figure>

        <div>
          <p className="display" style={{ margin: 0, fontSize: "clamp(1rem, 1.9vw, 1.35rem)", color: "var(--ink)" }}>
            Non sto imparando il pubblico da zero.
          </p>
          <p style={{ margin: "0.55rem 0 0", fontSize: "0.92rem", color: "var(--ink-dim)", lineHeight: 1.55, maxWidth: "88ch" }}>
            Sto trasformando esperienza tecnica + cultura gaming + distribuzione community in un prodotto co-op
            progettato per essere <span style={{ color: "var(--yellow)" }}>guardato, condiviso e rigiocato</span>.
          </p>
        </div>
      </A>
    </Body>
  );
}

/* ========================================================== 03 product */

function Product() {
  const roles = [
    { id: "THE GUIDE", img: "/art/role-guide.webp", alt: "The Guide, at a console above the room.", lines: ["vede il quadro generale", "ma non può risolvere tutto"], colour: "var(--orange)" },
    { id: "THE BLIND", img: "/art/role-blind.webp", alt: "The Blind, inside the room, feeling for the wall.", lines: ["agisce nel mondo", "con visibilità limitata"], colour: "var(--cyan)" },
  ];

  return (
    <Body>
      <Head
        n="03"
        kicker="il prodotto"
        title={<>Cos’è My&nbsp;Friend&nbsp;Is&nbsp;Blind</>}
        lede="Un co-op asimmetrico in cui la comunicazione non è una feature: è il gioco."
      />

      <div className="pitch-2col" style={{ display: "grid", gap: "1rem", gridTemplateColumns: "minmax(0, 1.15fr) minmax(0, 1fr)" }}>
        <div style={{ display: "grid", gap: "0.9rem" }}>
          <div style={{ display: "grid", gap: "0.9rem", gridTemplateColumns: "1fr 1fr", position: "relative" }}>
            {roles.map((r, i) => (
              <A key={r.id} d={230 + i * 110} className="pcard clip-plate" style={{ overflow: "hidden", borderTop: `2px solid ${r.colour}` }}>
                <div style={{ position: "relative", aspectRatio: "16 / 10", overflow: "hidden" }}>
                  <Image
                    src={r.img}
                    alt={r.alt}
                    fill
                    sizes="(max-width: 900px) 45vw, 260px"
                    style={{ objectFit: "cover", filter: i === 1 ? "brightness(0.72) saturate(0.8)" : "brightness(1)" }}
                  />
                  <div aria-hidden style={{
                    position: "absolute", inset: 0,
                    background: `linear-gradient(to top, #0B0E12 6%, transparent 70%), radial-gradient(ellipse at 50% 60%, transparent 40%, color-mix(in srgb, ${r.colour} 12%, transparent) 100%)`,
                  }} />
                </div>
                <div style={{ padding: "0.75rem 0.9rem 0.9rem" }}>
                  <div className="display" style={{ fontSize: "clamp(0.95rem, 1.7vw, 1.2rem)", color: r.colour, letterSpacing: "0.05em" }}>
                    {r.id}
                  </div>
                  <p className="mono" style={{ margin: "0.4rem 0 0", fontSize: 11, lineHeight: 1.6, color: "var(--ink-dim)" }}>
                    {r.lines.map((l) => <span key={l} style={{ display: "block" }}>{l}</span>)}
                  </p>
                </div>
              </A>
            ))}

            {/* the thing both of them are actually doing */}
            <A d={470} aria-hidden style={{
              position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)",
              pointerEvents: "none",
            }}>
              <span style={{
                display: "flex", alignItems: "stretch",
                border: "1px solid #0B0A05",
                boxShadow: "0 12px 34px rgba(0,0,0,0.85)",
                whiteSpace: "nowrap",
              }}>
                <span className="stripe-thin" aria-hidden style={{ width: 13 }} />
                <span className="display" style={{
                  background: "#0B0A05", color: "var(--yellow)",
                  fontSize: "clamp(0.85rem, 1.9vw, 1.3rem)", padding: "8px 14px",
                  letterSpacing: "0.06em",
                }}>
                  PARLA VELOCE
                </span>
                <span className="stripe-thin" aria-hidden style={{ width: 13 }} />
              </span>
            </A>
          </div>

          {/* core loop */}
          <A d={560} className="pcard" style={{ padding: "0.9rem 1rem" }}>
            <Kicker>core loop</Kicker>
            <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
              {LOOP.map((step, i) => (
                <span key={step} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <span className="mono" style={{
                    fontSize: 11, letterSpacing: "0.08em", padding: "5px 9px",
                    color: i === LOOP.length - 1 ? "var(--yellow)" : "var(--ink)",
                    background: "color-mix(in srgb, var(--charcoal) 80%, black)",
                    border: "1px solid var(--edge)",
                  }}>
                    {step}
                  </span>
                  {i < LOOP.length - 1 ? (
                    <svg width="9" height="12" viewBox="0 0 11 15" aria-hidden style={{ opacity: 0.5 }}>
                      <path d="M0 0 L6 7.5 L0 15 L4 15 L10 7.5 L4 0 Z" fill="var(--yellow)" />
                    </svg>
                  ) : null}
                </span>
              ))}
            </div>
          </A>
        </div>

        <div style={{ display: "grid", gap: "0.9rem", alignContent: "start" }}>
          <A d={300} as="p" style={{
            margin: 0, fontSize: "0.95rem", lineHeight: 1.6, color: "var(--ink-dim)",
          }}>
            Ogni livello cambia la regola, la pressione o l’informazione disponibile. Il risultato è una sequenza di
            momenti <span style={{ color: "var(--ink)" }}>“clip-worthy”</span>: incomprensioni, panico, clutch e
            fallimenti condivisi.
          </A>

          <Card accent="var(--cyan)" d={400}>
            <Kicker colour="var(--cyan)">session design</Kicker>
            <p style={{ margin: "0.5rem 0 0", fontSize: "0.9rem", lineHeight: 1.55, color: "var(--ink-dim)" }}>
              Livelli brevi, regole leggibili, escalation rapida, alta densità di momenti social.
            </p>
          </Card>

          <Card accent="var(--yellow)" d={490} glow>
            <Kicker colour="var(--yellow)">design target</Kicker>
            <p className="display" style={{ margin: "0.5rem 0 0", fontSize: "clamp(1.15rem, 2.4vw, 1.7rem)", color: "var(--ink)" }}>
              “Ancora una run.”
            </p>
            <p style={{ margin: "0.5rem 0 0", fontSize: "0.9rem", lineHeight: 1.55, color: "var(--ink-dim)" }}>
              Un gioco semplice da capire, difficile da coordinare, divertente anche da guardare.
            </p>
          </Card>
        </div>
      </div>
    </Body>
  );
}

/* ========================================================== 04 why now */

function WhyNow() {
  return (
    <Body>
      <Head
        n="04"
        kicker="timing"
        title="Perché adesso"
        lede="Il co-op è diventato uno dei motori più forti della scoperta organica su Steam."
      />

      <div className="pitch-2col" style={{ display: "grid", gap: "1rem", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.1fr)" }}>
        <A d={230} className="pcard clip-plate" style={{ padding: "0.95rem 1.1rem", borderLeft: "2px solid var(--green)" }}>
          <Kicker colour="var(--green)">co-op = moltiplicatore sociale</Kicker>
          <ol style={{ listStyle: "none", margin: "0.9rem 0 0", padding: 0, display: "grid", gap: "0.75rem" }}>
            {MULTIPLIER.map((m, i) => (
              <li key={m} style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
                <span className="mono" style={{ fontSize: 10.5, color: "var(--green)", letterSpacing: "0.14em", flex: "0 0 auto" }}>
                  0{i + 1}
                </span>
                <span className="display" style={{ fontSize: "clamp(1rem, 2.3vw, 1.65rem)", color: i === 2 ? "var(--green)" : "var(--ink)" }}>
                  {m}
                </span>
              </li>
            ))}
          </ol>
        </A>

        <div style={{ display: "grid", gap: "0.9rem" }}>
          {HITS.map((h, i) => (
            <Card key={h.name} accent={h.colour} d={340 + i * 110}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
                <div>
                  <Kicker colour={h.colour}>2024 hit</Kicker>
                  <div className="display" style={{ fontSize: "clamp(1.05rem, 2.1vw, 1.5rem)", color: "var(--ink)", marginTop: 5 }}>
                    {h.name}
                  </div>
                </div>
                <div className="display" style={{ fontSize: "clamp(1.8rem, 3.9vw, 2.6rem)", color: h.colour, lineHeight: 1 }}>
                  <Num to={h.value} />{h.unit}
                </div>
              </div>
              <div style={{ marginTop: "0.5rem" }}>
                <Bar pct={h.bar} colour={h.colour} d={520 + i * 110} />
              </div>
              <p className="mono" style={{ margin: "0.45rem 0 0", fontSize: 10.5, lineHeight: 1.45, color: "var(--ink-faint)" }}>
                {h.note}
              </p>
            </Card>
          ))}
        </div>
      </div>

      <A d={640} className="pcard" style={{ marginTop: "0.8rem", padding: "0.9rem 1.1rem" }}>
        <Kicker colour="var(--concrete)">segnale di mercato</Kicker>
        <p style={{ margin: "0.5rem 0 0", fontSize: "0.88rem", lineHeight: 1.5, color: "var(--ink-dim)", maxWidth: "94ch" }}>
          VGI: nel 2024 i giochi indie hanno raggiunto livelli di revenue comparabili a AAA/AA su Steam; il settore
          indie cresce dal 2020. <span style={{ color: "var(--ink)" }}>My Friend Is Blind</span> punta al segmento
          “small-team social co-op”: prezzo accessibile, onboarding immediato, forte potenziale creator.
        </p>
      </A>

      <Foot d={760} m="0.7rem">
        Fonti: Video Game Insights — Rise of the Co-Op Games (2024); Global Indie Games Market Report 2024.
      </Foot>
    </Body>
  );
}

/* ======================================================= 05 comparable */

function Comparable() {
  const kindColour: Record<string, string> = {
    DICHIARATO: "var(--green)",
    STIMA: "var(--yellow)",
    DERIVATO: "var(--orange)",
  };

  return (
    <Body>
      <Head
        n="05"
        kicker="comparable"
        title="Comparable: il range è enorme"
        lede="Dai piccoli breakout ai fenomeni globali: la categoria dimostra elasticità di scala."
      />

      <Grid min={250}>
        {COMPARABLES.map((c, i) => (
          <Card key={c.name} accent={c.colour} d={230 + i * 110} col>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
              <div className="display" style={{ fontSize: "clamp(1rem, 1.9vw, 1.3rem)", color: "var(--ink)", letterSpacing: "0.03em" }}>
                {c.name}
              </div>
              <span className="mono" style={{
                flex: "0 0 auto", fontSize: 9, letterSpacing: "0.16em", padding: "3px 7px",
                color: kindColour[c.kind],
                border: `1px solid color-mix(in srgb, ${kindColour[c.kind]} 40%, transparent)`,
              }}>
                {c.kind}
              </span>
            </div>

            <div className="display" style={{ fontSize: "clamp(1.5rem, 3.1vw, 2.15rem)", color: c.colour, marginTop: 9, lineHeight: 1 }}>
              {c.metric}
            </div>
            <div className="mono" style={{ fontSize: 9.5, lineHeight: 1.5, color: "var(--ink-faint)", marginTop: 6 }}>
              {c.math}
            </div>

            <div style={{ height: 1, background: "var(--edge)", margin: "0.7rem 0" }} />

            <p style={{ margin: 0, fontSize: "0.83rem", lineHeight: 1.6, color: "var(--ink-dim)" }}>{c.body}</p>

            <p className="mono" style={{ margin: "0.8rem 0 0", marginTop: "auto", paddingTop: "0.8rem", fontSize: 10, letterSpacing: "0.1em", color: "var(--ink-faint)", textTransform: "uppercase" }}>
              Benchmark: <span style={{ color: c.colour }}>{c.benchmark}</span>
            </p>
          </Card>
        ))}
      </Grid>

      {/* the caveat is the point of the slide */}
      <A d={580} className="pcard" style={{
        marginTop: "0.8rem", padding: "0.9rem 1.1rem",
        borderLeft: "2px solid var(--red)",
      }}>
        <Kicker colour="var(--red)">nota metodologica</Kicker>
        <p style={{ margin: "0.5rem 0 0", fontSize: "0.9rem", lineHeight: 1.6, color: "var(--ink-dim)", maxWidth: "94ch" }}>
          Valve non pubblica le vendite per titolo. Un solo gross qui è dichiarato dall’editore; gli altri due sono
          stime di terze parti moltiplicate per il prezzo di listino, quindi{" "}
          <span style={{ color: "var(--ink)" }}>range, non consuntivi</span> — e non tengono conto di fee di
          piattaforma, sconti successivi, refund e regional pricing.
        </p>
      </A>

      <Foot d={700}>
        Fonti: Steam; Devolver Digital Admission Document; PC Gamer; Video Game Insights/Sensor Tower;
        SteamPageAnalyzer. Dati consultati 10/09/2026.
      </Foot>
    </Body>
  );
}

/* =========================================================== 06 thesis */

function Thesis() {
  return (
    <Body>
      <Head
        n="06"
        kicker="la tesi"
        title="La tesi di mercato"
        lede="Non serve replicare Fall Guys. Serve catturare una frazione credibile del comportamento che rende i co-op virali."
      />

      <Grid min={215}>
        {PILLARS.map((p, i) => (
          <Card key={p.n} accent={p.colour} d={230 + i * 95}>
            <div className="display" style={{
              fontSize: "clamp(2.2rem, 5vw, 3.4rem)", color: `color-mix(in srgb, ${p.colour} 26%, transparent)`,
              lineHeight: 0.85, marginBottom: 6,
            }}>
              {p.n}
            </div>
            <div className="display" style={{ fontSize: "clamp(0.92rem, 1.7vw, 1.15rem)", color: p.colour, letterSpacing: "0.05em" }}>
              {p.name}
            </div>
            <p style={{ margin: "0.6rem 0 0", fontSize: "0.86rem", lineHeight: 1.55, color: "var(--ink-dim)" }}>{p.body}</p>
          </Card>
        ))}
      </Grid>

      <A d={640} className="pcard clip-plate" style={{ marginTop: "0.8rem", padding: "0.95rem 1.1rem", borderLeft: "2px solid var(--yellow)" }}>
        <Kicker colour="var(--yellow)">posizionamento</Kicker>
        <p className="display" style={{ margin: "0.6rem 0 0", fontSize: "clamp(1rem, 2.2vw, 1.5rem)", color: "var(--ink)", maxWidth: "40ch" }}>
          “Keep Talking and Nobody Explodes” incontra la tensione da party game moderno
        </p>
        <p style={{ margin: "0.55rem 0 0", fontSize: "0.92rem", color: "var(--ink-dim)", lineHeight: 1.55 }}>
          — ma con una relazione <span style={{ color: "var(--orange)" }}>Guide</span> /{" "}
          <span style={{ color: "var(--cyan)" }}>Blind</span> immediatamente riconoscibile.
        </p>
      </A>
    </Body>
  );
}

/* ========================================================= 07 creators */

function Creators() {
  const max = Math.max(...CREATORS.map((c) => c.reach));

  return (
    <Body>
      <Head
        n="07"
        kicker="distribuzione"
        title="Creator già vicini al progetto"
        lede="Audience gaming italiana utilizzabile per test, feedback, contenuti e launch amplification."
      />

      <A d={200} className="pcard" style={{ padding: "0.5rem 0.25rem", overflowX: "auto" }}>
        <table className="mono" style={{ width: "100%", minWidth: 560, borderCollapse: "collapse", fontSize: 11.5 }}>
          <thead>
            <tr>
              {["CREATOR", "AUDIENCE", "REACH MISURATA", "STATUS"].map((h, i) => (
                <th
                  key={h}
                  style={{
                    textAlign: i === 0 ? "left" : i === 3 ? "right" : "left",
                    padding: "8px 12px", fontWeight: 400,
                    fontSize: 9.5, letterSpacing: "0.18em", color: "var(--ink-faint)",
                    borderBottom: "1px solid var(--edge)", whiteSpace: "nowrap",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CREATORS.map((c, i) => (
              <tr key={c.name} style={{ borderBottom: "1px solid color-mix(in srgb, var(--steel-dark) 32%, transparent)" }}>
                <td style={{ padding: "6px 12px", whiteSpace: "nowrap" }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 7 }}>
                    <span style={{ color: "var(--ink)" }}>{c.name}</span>
                    {c.handle ? (
                      <span style={{ fontSize: 9.5, color: "var(--ink-faint)" }}>@{c.handle}</span>
                    ) : null}
                    <span style={{
                      fontSize: 8, letterSpacing: "0.12em", padding: "1px 5px",
                      color: PLATFORM_COLOUR[c.platform],
                      border: `1px solid color-mix(in srgb, ${PLATFORM_COLOUR[c.platform]} 34%, transparent)`,
                    }}>
                      {c.platform === "YOUTUBE" ? "YT" : "TW"}
                    </span>
                  </div>
                </td>
                <td style={{ padding: "6px 12px", minWidth: 150 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ color: c.reach ? "var(--ink)" : "var(--ink-faint)", width: 48, flex: "0 0 auto" }}>
                      {c.followers}
                    </span>
                    <span style={{ flex: 1, minWidth: 44 }}>
                      {c.reach ? (
                        <Bar pct={c.reach / max} colour="var(--toxic)" d={340 + i * 70} height={4} />
                      ) : (
                        /* no bar: a YouTube channel has no figure on this axis */
                        <span style={{ display: "block", height: 4, borderTop: "1px dashed var(--steel-dark)" }} />
                      )}
                    </span>
                  </div>
                </td>
                <td style={{
                  padding: "6px 12px", fontSize: 11,
                  color: c.lead ? "var(--ink)" : "var(--ink-dim)",
                }}>
                  {c.viewers}
                </td>
                <td style={{ padding: "6px 12px", textAlign: "right", whiteSpace: "nowrap" }}>
                  <span style={{
                    display: "inline-block", fontSize: 9, letterSpacing: "0.14em", padding: "3px 7px",
                    color: STATUS_COLOUR[c.status],
                    border: `1px solid color-mix(in srgb, ${STATUS_COLOUR[c.status]} 38%, transparent)`,
                  }}>
                    {c.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </A>

      <A d={620} className="pcard" style={{ marginTop: "0.8rem", padding: "0.9rem 1.1rem", borderLeft: "2px solid var(--steel)" }}>
        <p style={{ margin: 0, fontSize: "0.88rem", lineHeight: 1.6, color: "var(--ink-dim)", maxWidth: "96ch" }}>
          <span className="mono" style={{ fontSize: 10, letterSpacing: "0.16em", color: "var(--concrete)" }}>NOTA — </span>
          “supporto” indica contatti/creator indicati dal founder; non implica endorsement commerciale o impegno
          contrattuale. La barra misura i follower Twitch:{" "}
          <span style={{ color: "var(--ink)" }}>ElChape</span> è su YouTube e la sua reach è misurata sulle view per
          video, quindi non è sulla stessa scala e non ha barra.
        </p>
      </A>

      <Foot d={720}>
        Fonti: Streams Charts, TwitchMetrics e siti ufficiali (10/09/2026). ElChape — @ChapeGaming: media e picco
        calcolati sui 15 video del feed YouTube pubblico del canale (29/05 → 11/09/2026, 305.727 view totali);
        iscritti non verificati su fonte primaria.
      </Foot>
    </Body>
  );
}

/* ========================================================== 08 roadmap */

function Roadmap() {
  return (
    <Body>
      <Head
        n="08"
        kicker="roadmap"
        title="Roadmap verso il lancio"
        lede="Una finestra corta, guidata da playtest e iterazione sul fun factor."
      />

      {/* the track */}
      <A d={200} mode="wipe" aria-hidden className="stripe-thin" style={{
        height: 7, width: "100%", opacity: 0.8, marginBottom: 2,
      }}>
        {null}
      </A>

      <Grid min={200}>
        {ROADMAP.map((r, i) => (
          <A key={r.name} d={320 + i * 110} style={{ paddingTop: 14, position: "relative" }}>
            {/* the node on the track */}
            <span aria-hidden style={{
              position: "absolute", top: -6, left: 0,
              width: 11, height: 11, borderRadius: "50%",
              background: r.colour, boxShadow: `0 0 16px 2px ${r.colour}`,
              border: "2px solid #07090C",
            }} />
            <div className="mono" style={{ fontSize: 10.5, letterSpacing: "0.18em", color: r.colour }}>{r.when}</div>
            <div className="display" style={{ fontSize: "clamp(1.15rem, 2.5vw, 1.75rem)", color: "var(--ink)", marginTop: 7 }}>
              {r.name}
            </div>
            <p style={{ margin: "0.55rem 0 0", fontSize: "0.86rem", lineHeight: 1.55, color: "var(--ink-dim)", maxWidth: "30ch" }}>
              {r.body}
            </p>
          </A>
        ))}
      </Grid>

      <A d={780} className="pcard clip-plate" style={{ marginTop: "1.1rem", padding: "0.95rem 1.1rem", borderLeft: "2px solid var(--cyan)" }}>
        <Kicker colour="var(--cyan)">obiettivo del test</Kicker>
        <p style={{ margin: "0.55rem 0 0", fontSize: "0.94rem", lineHeight: 1.6, color: "var(--ink-dim)", maxWidth: "94ch" }}>
          Non <span style={{ color: "var(--ink-faint)", textDecoration: "line-through" }}>“trovare bug”</span>. Trovare
          dove la tensione cala, dove la comunicazione si rompe in modo divertente e quali livelli fanno dire{" "}
          <span style={{ color: "var(--yellow)" }}>“rifacciamolo”</span>.
        </p>
      </A>
    </Body>
  );
}

/* ========================================================== 09 pricing */

function Pricing() {
  return (
    <Body>
      <Head
        n="09"
        kicker="pricing"
        title="Pricing"
        lede="Accessibile per entrare. Più valore quando porti un amico."
      />

      <div className="pitch-2col" style={{ display: "grid", gap: "1rem", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.25fr)" }}>
        <Card accent="var(--steel)" d={230}>
          <Kicker colour="var(--concrete)">single copy</Kicker>
          <div className="display" style={{ fontSize: "clamp(2.4rem, 5.6vw, 3.8rem)", color: "var(--ink)", lineHeight: 1, marginTop: 8 }}>
            $7.99
          </div>
          <p style={{ margin: "0.8rem 0 0", fontSize: "0.88rem", lineHeight: 1.6, color: "var(--ink-dim)" }}>
            Accesso standard al gioco. Prezzo coerente con Machine Party e BOMBANANA! al listino USA osservato.
          </p>
        </Card>

        <Card accent="var(--green)" d={330} glow>
          <Kicker colour="var(--green)">friend pass bundle</Kicker>
          <div className="display" style={{ fontSize: "clamp(2.4rem, 5.6vw, 3.8rem)", color: "var(--green)", lineHeight: 1, marginTop: 8 }}>
            $11.99
          </div>
          <p style={{ margin: "0.8rem 0 0", fontSize: "0.88rem", lineHeight: 1.6, color: "var(--ink-dim)" }}>
            Proposta commerciale per abbassare la frizione del “convincere un amico”.
          </p>
          <p className="mono" style={{ margin: "0.65rem 0 0", fontSize: 10.5, lineHeight: 1.65, color: "var(--ink-faint)" }}>
            Da definire tecnicamente/commercialmente su Steam: bundle/guest access devono rispettare le feature
            disponibili sulla piattaforma.
          </p>
        </Card>
      </div>

      <A d={470} className="pcard clip-plate" style={{ marginTop: "0.8rem", padding: "0.95rem 1.1rem", borderLeft: "2px solid var(--yellow)" }}>
        <Kicker colour="var(--yellow)">principio</Kicker>
        <p className="display" style={{ margin: "0.6rem 0 0", fontSize: "clamp(1rem, 2.1vw, 1.45rem)", lineHeight: 1.28, color: "var(--ink)", maxWidth: "46ch" }}>
          Nel co-op il prezzo non deve massimizzare ARPU al giorno 1: deve massimizzare il numero di{" "}
          <span style={{ color: "var(--yellow)" }}>coppie che iniziano a giocare</span>.
        </p>
      </A>

      <Foot d={600}>
        Riferimento listini USA Steam al 10/09/2026: Machine Party $7.99; BOMBANANA! $7.99.
      </Foot>
    </Body>
  );
}

/* ====================================================== 10 projections */

function Projections() {
  return (
    <Body>
      <Head
        n="10"
        kicker="proiezioni"
        title="Proiezioni conservative"
        lede="Modello semplice: copie × $7.99. Nessuna microtransazione, DLC o uplift da bundle incluso."
      />

      <Grid min={215}>
        {PROJECTIONS.map((p, i) => (
          <Card key={p.tier} accent={p.colour} d={230 + i * 100} glow={p.tier === "TARGET"}>
            <Kicker colour={p.colour}>{p.tier}</Kicker>
            <div className="display" style={{ fontSize: "clamp(1.6rem, 3.4vw, 2.3rem)", color: "var(--ink)", marginTop: 8, lineHeight: 1 }}>
              <Num to={p.copies} />K <span style={{ fontSize: "0.55em", color: "var(--ink-dim)" }}>copie</span>
            </div>
            <div style={{ margin: "0.8rem 0" }}>
              <Bar pct={p.bar} colour={p.colour} d={420 + i * 100} />
            </div>
            <dl className="mono" style={{ margin: 0, display: "grid", gridTemplateColumns: "auto 1fr", gap: "5px 12px", fontSize: 11.5 }}>
              <dt style={{ color: "var(--ink-faint)", letterSpacing: "0.1em", fontSize: 10 }}>GROSS</dt>
              <dd style={{ margin: 0, color: "var(--ink)", textAlign: "right" }}>{p.gross}</dd>
              <dt style={{ color: "var(--ink-faint)", letterSpacing: "0.1em", fontSize: 10 }}>NET −30%*</dt>
              <dd style={{ margin: 0, color: p.colour, textAlign: "right" }}>{p.net}</dd>
            </dl>
          </Card>
        ))}
      </Grid>

      {/* the benchmark, kept at the prudent end on purpose */}
      <A d={580} className="pcard clip-plate pitch-2col" style={{
        marginTop: "0.8rem", padding: "0.95rem 1.1rem", borderLeft: "2px solid var(--orange)",
        display: "grid", gap: "1rem", gridTemplateColumns: "minmax(0, 1fr) auto", alignItems: "center",
      }}>
        <div>
          <Kicker colour="var(--orange)">“30% sotto” — benchmark machine party (review-based)</Kicker>
          <p style={{ margin: "0.55rem 0 0", fontSize: "0.92rem", lineHeight: 1.6, color: "var(--ink-dim)", maxWidth: "70ch" }}>
            Stima pubblica review-based: ~159K copie. Applicando −30% → ~111,6K copie → ~$892K gross a $7.99.
          </p>
        </div>
        <div className="pitch-figure" style={{ textAlign: "right" }}>
          <div className="display" style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)", color: "var(--orange)", lineHeight: 1 }}>
            $624K
          </div>
          <div className="mono" style={{ fontSize: 10, letterSpacing: "0.12em", color: "var(--ink-faint)", marginTop: 6 }}>
            DOPO 30% STEAM* · SU 111,6K COPIE
          </div>
        </div>
      </A>

      <Foot d={720}>
        *Semplificazione pitch: 30% platform fee; non include IVA/tasse, refund, regional pricing, sconti, chargeback,
        publisher/marketing. Benchmark: SteamPageAnalyzer Machine Party ~159.360 copie (stima Boxleiter). Il dato
        VGI/Sensor Tower è molto più alto: il deck usa il benchmark più prudente.
      </Foot>
    </Body>
  );
}

/* ========================================================== 11 margini */

const SEG = {
  steam: "var(--steel)",
  cost: "var(--orange)",
  net: "var(--green)",
};

function Margins() {
  return (
    <Body>
      <Head
        n="11"
        kicker="margini"
        title="Dove vanno i ricavi"
        lede="Nessuna royalty motore, nessun publisher, nessun costo server: l’unica deduzione che scala col venduto è la fee Steam."
      />

      {/* what a single copy actually does */}
      <Grid min={205}>
        <Card accent={SEG.net} d={210}>
          <Kicker colour={SEG.net}>al team, per copia</Kicker>
          <div className="display" style={{ fontSize: "clamp(1.6rem, 3.2vw, 2.2rem)", marginTop: 6, color: "var(--ink)", lineHeight: 1 }}>
            <Num to={UNIT.net} decimals={2} prefix="$" />
          </div>
          <p className="mono" style={{ margin: "0.55rem 0 0", fontSize: 10.5, lineHeight: 1.55, color: "var(--ink-faint)" }}>
            70% di $7.99 — dopo la sola fee Steam
          </p>
        </Card>

        <Card accent={SEG.cost} d={300}>
          <Kicker colour={SEG.cost}>costo marginale, per copia</Kicker>
          <div className="display" style={{ fontSize: "clamp(1.6rem, 3.2vw, 2.2rem)", marginTop: 6, color: "var(--ink)", lineHeight: 1 }}>
            $0.00
          </div>
          <p className="mono" style={{ margin: "0.55rem 0 0", fontSize: 10.5, lineHeight: 1.55, color: "var(--ink-faint)" }}>
            la copia numero 100.000 costa quanto la prima
          </p>
        </Card>

        <Card accent="var(--yellow)" d={390} glow>
          <Kicker colour="var(--yellow)">break-even</Kicker>
          <div className="display" style={{ fontSize: "clamp(1.6rem, 3.2vw, 2.2rem)", marginTop: 6, color: "var(--ink)", lineHeight: 1 }}>
            <Num to={BREAK_EVEN} thousands /> <span style={{ fontSize: "0.5em", color: "var(--ink-dim)" }}>copie</span>
          </div>
          <p className="mono" style={{ margin: "0.55rem 0 0", fontSize: 10.5, lineHeight: 1.55, color: "var(--ink-faint)" }}>
            ≈11% dello scenario FLOOR
          </p>
        </Card>
      </Grid>

      {/* the spend, drawn at the scale of the revenue it comes out of */}
      <A d={470} className="pcard" style={{ marginTop: "0.8rem", padding: "0.9rem 1.1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
          <Kicker colour="var(--concrete)">spese sulla scala dei ricavi</Kicker>
          <div className="mono" style={{ display: "flex", gap: 14, fontSize: 9.5, letterSpacing: "0.12em", color: "var(--ink-faint)" }}>
            {[["STEAM 30%", SEG.steam], ["SPESE", SEG.cost], ["NETTO", SEG.net]].map(([t, c]) => (
              <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                <span aria-hidden style={{ width: 9, height: 9, background: c, display: "inline-block" }} />
                {t}
              </span>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gap: "0.45rem", marginTop: "0.7rem" }}>
          {MARGINS.map((m, i) => (
            <div key={m.tier} className="margin-row" style={{
              display: "grid", gridTemplateColumns: "150px minmax(0, 1fr) 108px",
              gap: 12, alignItems: "center",
            }}>
              <div className="mono" style={{ display: "flex", alignItems: "baseline", gap: 8, whiteSpace: "nowrap" }}>
                <span style={{ fontSize: 10, letterSpacing: "0.16em", color: m.colour }}>{m.tier}</span>
                <span style={{ fontSize: 10.5, color: "var(--ink-dim)" }}>{m.label}</span>
              </div>

              {/* one bar per scenario, always full width: the share is the point */}
              <div style={{ display: "flex", height: 18, background: "#0B0E12", border: "1px solid var(--edge)", overflow: "hidden" }}>
                <A mode="bar" d={560 + i * 110} style={{ width: `${m.share.steam * 100}%`, background: SEG.steam, opacity: 0.55 }}>{null}</A>
                <A mode="bar" d={620 + i * 110} style={{ width: `${m.share.cost * 100}%`, background: SEG.cost, boxShadow: `0 0 12px -2px ${SEG.cost}`, minWidth: 2 }}>{null}</A>
                <A mode="bar" d={680 + i * 110} style={{ width: `${m.share.net * 100}%`, background: SEG.net, opacity: 0.9 }}>{null}</A>
              </div>

              <div className="mono" style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                <span style={{ fontSize: 12, color: SEG.net }}>{usdK(m.net)}</span>
                <span style={{ fontSize: 9.5, letterSpacing: "0.08em", color: "var(--ink-faint)", marginLeft: 7 }}>
                  {(m.share.net * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </A>

      <A d={900} className="pcard" style={{ marginTop: "0.8rem", padding: "0.9rem 1.1rem", borderLeft: "2px solid var(--green)" }}>
        <div className="margins-cuts" style={{ display: "grid", gap: "0.5rem 1.4rem", gridTemplateColumns: "repeat(auto-fit, minmax(min(215px, 100%), 1fr))" }}>
          {CUTS.map((c) => (
            <div key={c.name} style={{ display: "flex", alignItems: "baseline", gap: 9 }}>
              <span className="mono" style={{
                fontSize: 11, letterSpacing: "0.06em", minWidth: 34, textAlign: "right",
                color: c.cut ? "var(--steel)" : "var(--green)",
              }}>
                {c.pct}
              </span>
              <span>
                <span className="mono" style={{ fontSize: 11, color: "var(--ink)" }}>{c.name}</span>
                <span className="mono" style={{ display: "block", fontSize: 10, lineHeight: 1.5, color: "var(--ink-faint)" }}>{c.why}</span>
              </span>
            </div>
          ))}
        </div>
      </A>

      <Foot d={1000} m="0.55rem">
        Spesa cash fino al lancio indicata come tetto: &lt; €{FIXED_COST_EUR.toLocaleString("it-IT", { useGrouping: "always" })}, convertita a un cambio
        volutamente sfavorevole ($1,20/€) e imputata interamente all’anno di lancio. Il tempo del founder non è
        valorizzato. Ricavi e fee come alla slide 10.
      </Foot>
    </Body>
  );
}

/* ===================================================== 12 costi a scala */

function Scale() {
  const facts = [
    { k: "sessioni in p2p diretto", v: "75–85%", n: "nessun costo: i due client parlano fra loro", c: "var(--green)" },
    { k: "costo di una sessione con relay", v: `$${COST_PER_RELAYED_SESSION.toFixed(4)}`, n: `${(GB_PER_RELAYED_SESSION * 1000).toFixed(1)} MB a $0,05/GB, listino Cloudflare`, c: "var(--cyan)" },
    { k: "assorbite dal free tier", v: FREE_SESSIONS.toLocaleString("it-IT", { useGrouping: "always" }), n: "sessioni con relay, prima di pagare $1", c: "var(--yellow)" },
  ];

  return (
    <Body>
      <Head
        n="12"
        kicker="scala"
        title="Cosa costa scalare"
        lede="P2P di default, relay solo quando il NAT lo impone: l’infrastruttura resta marginale anche allo scenario più alto. La voce che cresce davvero sono le persone."
      />

      <Grid min={205}>
        {facts.map((f, i) => (
          <Card key={f.k} accent={f.c} d={200 + i * 90}>
            <Kicker colour={f.c}>{f.k}</Kicker>
            <div className="display" style={{ fontSize: "clamp(1.5rem, 3vw, 2.05rem)", marginTop: 6, color: "var(--ink)", lineHeight: 1 }}>
              {f.v}
            </div>
            <p className="mono" style={{ margin: "0.5rem 0 0", fontSize: 10.5, lineHeight: 1.45, color: "var(--ink-faint)" }}>
              {f.n}
            </p>
          </Card>
        ))}
      </Grid>

      {/* the whole infra bill, at each scenario */}
      <A d={460} className="pcard" style={{ marginTop: "0.7rem", padding: "0.8rem 1.1rem" }}>
        <Kicker colour="var(--concrete)">costo infrastruttura, sull’intera vita del titolo</Kicker>
        <div style={{ display: "grid", gap: "0.4rem", marginTop: "0.6rem" }}>
          {SCALE.map((sc) => (
            <div key={sc.tier} className="scale-row mono" style={{
              display: "grid", gridTemplateColumns: "150px minmax(0, 1fr) 118px",
              gap: 12, alignItems: "baseline", fontSize: 11,
            }}>
              <span style={{ whiteSpace: "nowrap" }}>
                <span style={{ fontSize: 10, letterSpacing: "0.16em", color: sc.colour }}>{sc.tier}</span>{" "}
                <span style={{ color: "var(--ink-dim)" }}>{(sc.copies / 1000).toFixed(0)}K copie</span>
              </span>
              <span style={{ color: "var(--ink-faint)", fontSize: 10.5 }}>
                {sc.sessions.toLocaleString("it-IT", { useGrouping: "always" })} sessioni ·{" "}
                {sc.relayed.toLocaleString("it-IT", { useGrouping: "always" })} con relay ·{" "}
                {sc.gb.toLocaleString("it-IT", { useGrouping: "always", maximumFractionDigits: 0 })} GB
              </span>
              <span style={{ textAlign: "right", color: sc.cost ? "var(--ink)" : "var(--green)", fontSize: 12 }}>
                {sc.cost ? `$${sc.cost.toFixed(0)}` : "$0"}
                {!sc.cost && <span style={{ fontSize: 9, color: "var(--ink-faint)", marginLeft: 6 }}>FREE TIER</span>}
              </span>
            </div>
          ))}
        </div>
      </A>

      {/* the line item that actually grows */}
      <A d={800} className="pcard clip-plate" style={{
        marginTop: "0.7rem", padding: "0.85rem 1.1rem", borderLeft: "2px solid var(--yellow)",
      }}>
        <div className="pitch-2col" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: "1.1rem", alignItems: "center" }}>
          <div>
            <Kicker colour="var(--yellow)">la spesa long-term: persone, non server</Kicker>
            <p style={{ margin: "0.5rem 0 0", fontSize: "0.9rem", lineHeight: 1.55, color: "var(--ink-dim)", maxWidth: "78ch" }}>
              <span style={{ color: "var(--ink)" }}>Game design expert</span> come consulente part-time già dal closed
              test, dove il feedback vale di più. Voce a giornata, non impegno fisso: il costo entra prima del lancio
              ma non trasforma il break-even in un problema.
            </p>
          </div>
          <div className="pitch-figure" style={{ textAlign: "right" }}>
            <div className="display" style={{ fontSize: "clamp(1.5rem, 3.4vw, 2.2rem)", color: "var(--yellow)", lineHeight: 1 }}>
              {eur(ASK_TOTAL_EUR * 0.45)}
            </div>
            <div className="mono" style={{ fontSize: 9.5, letterSpacing: "0.1em", color: "var(--ink-faint)", marginTop: 5 }}>
              45% DELL’ASK · ~{eur(Math.round((ASK_TOTAL_EUR * 0.45) / 12))}/MESE
            </div>
          </div>
        </div>
      </A>

      <Foot d={940} m="0.55rem">
        Listino Cloudflare Realtime TURN (set. 2026): $0,05/GB edge→client, primi 1.000 GB gratis. Assunzioni:{" "}
        {(INFRA.relayShare * 100).toFixed(0)}% di sessioni con relay — estremo alto del range NAT 15–25% —,{" "}
        {INFRA.kbpsPerPlayer} kbps per giocatore, sessioni da {INFRA.sessionMinutes} min,{" "}
        {INFRA.sessionsPerPlayer} sessioni per acquirente; la voce resta su Discord. Server dedicati su tutte le
        sessioni sposterebbero il costo di tre ordini di grandezza.
      </Foot>
    </Body>
  );
}

/* ============================================================== 13 gtm */

function GoToMarket() {
  return (
    <Body>
      <Head
        n="13"
        kicker="go-to-market"
        title="Go-to-market"
        lede="Costruire domanda prima del launch, poi trasformare ogni sessione in distribuzione."
      />

      <Grid min={210}>
        {GTM.map((g, i) => (
          <Card key={g.n} accent={g.colour} d={230 + i * 95}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
              <span className="display" style={{
                fontSize: "clamp(1.6rem, 3.4vw, 2.3rem)", lineHeight: 0.9,
                color: `color-mix(in srgb, ${g.colour} 30%, transparent)`,
              }}>
                {g.n}
              </span>
              <span className="display" style={{ fontSize: "clamp(0.9rem, 1.65vw, 1.1rem)", color: g.colour, letterSpacing: "0.05em" }}>
                {g.name}
              </span>
            </div>
            <div style={{ height: 1, background: "var(--edge)", margin: "0.75rem 0 0.7rem" }} />
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 7 }}>
              {g.lines.map((l) => (
                <li key={l} style={{ display: "flex", gap: 8, fontSize: "0.85rem", lineHeight: 1.5, color: "var(--ink-dim)" }}>
                  <span aria-hidden style={{ color: g.colour, flex: "0 0 auto" }}>›</span>
                  <span>{l}</span>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </Grid>

      <A d={640} className="pcard clip-plate" style={{ marginTop: "0.8rem", padding: "0.95rem 1.1rem", borderLeft: "2px solid var(--green)" }}>
        <Kicker colour="var(--green)">north-star pre-launch</Kicker>
        <p className="display" style={{ margin: "0.6rem 0 0", fontSize: "clamp(1rem, 2.1vw, 1.45rem)", color: "var(--ink)", maxWidth: "48ch" }}>
          Wishlist qualificate + coppie che completano più di un livello{" "}
          <span style={{ color: "var(--green)" }}>nella stessa sessione</span>.
        </p>
      </A>
    </Body>
  );
}

/* ============================================================= 14 next */

function NextSteps() {
  return (
    <Body>
      <Head
        n="14"
        kicker="next steps"
        title="Next steps"
        lede="Da prototipo promettente a lancio misurabile."
      />

      <div className="pitch-2col" style={{ display: "grid", gap: "1rem", gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 1fr)" }}>
        <A d={230} className="pcard" style={{ padding: "0.95rem 1.1rem", borderLeft: "2px solid var(--cyan)" }}>
          <Kicker colour="var(--cyan)">settembre → ottobre</Kicker>
          <ol style={{ listStyle: "none", margin: "0.9rem 0 0", padding: 0, display: "grid", gap: "0.6rem" }}>
            {NEXT_STEPS.map((s, i) => (
              <li key={s} style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
                <span className="mono" style={{ fontSize: 10.5, color: "var(--cyan)", letterSpacing: "0.12em", flex: "0 0 auto" }}>
                  0{i + 1}
                </span>
                <span style={{ fontSize: "0.94rem", lineHeight: 1.5, color: "var(--ink)" }}>{s}</span>
              </li>
            ))}
          </ol>
        </A>

        <A d={330} className="pcard clip-plate" style={{
          padding: "0.95rem 1.1rem", borderLeft: "2px solid var(--yellow)",
          display: "flex", flexDirection: "column",
        }}>
          <Kicker colour="var(--yellow)">cosa cerco ora</Kicker>
          <ul style={{ listStyle: "none", margin: "0.9rem 0 0", padding: 0, display: "grid", gap: "0.45rem", flex: 1 }}>
            {ASKS.map((a) => (
              <li key={a} className="display" style={{ fontSize: "clamp(1.05rem, 2.3vw, 1.55rem)", color: "var(--ink)" }}>
                {a}
              </li>
            ))}
          </ul>
          <a
            href={DISCORD}
            target="_blank"
            rel="noreferrer noopener"
            className="display pitch-cta"
            style={{
              marginTop: "1.1rem", alignSelf: "flex-start",
              display: "inline-flex", alignItems: "center", gap: 10,
              fontSize: 14, letterSpacing: "0.06em", padding: "13px 22px",
              color: "#0B0A05", background: "var(--yellow)", textDecoration: "none",
              clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)",
            }}
          >
            PARLIAMONE SU DISCORD
          </a>
        </A>
      </div>

      <A d={520} className="pcard" style={{ marginTop: "0.8rem", padding: "0.9rem 1.1rem" }}>
        <p style={{ margin: 0, fontSize: "0.94rem", lineHeight: 1.6, color: "var(--ink-dim)", maxWidth: "96ch" }}>
          <span className="mono" style={{ fontSize: 10, letterSpacing: "0.16em", color: "var(--concrete)" }}>OBIETTIVO — </span>
          lanciare a <span style={{ color: "var(--ink)" }}>metà ottobre 2026</span> con una base abbastanza forte da far
          parlare il gioco prima che sia il gioco a dover comprare attenzione.
        </p>
      </A>
    </Body>
  );
}

/* ============================================================== 15 ask */

function Ask() {
  return (
    <Body>
      <Head
        n="15"
        kicker="l’ask"
        title="Cosa chiedo"
        lede="Il prodotto va in pari sotto le 1.100 copie. Il capitale non serve a sopravvivere: serve a comprare velocità in una finestra che si chiude."
      />

      <div className="pitch-2col" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.35fr)", gap: "0.8rem" }}>
        <Card accent="var(--yellow)" d={200} glow>
          <Kicker colour="var(--yellow)">round seed</Kicker>
          <div className="display" style={{ fontSize: "clamp(2.2rem, 5.4vw, 3.5rem)", marginTop: 6, color: "var(--ink)", lineHeight: 1 }}>
            <Num to={ASK_TOTAL_EUR} thousands prefix="€" />
          </div>
          <p style={{ margin: "0.7rem 0 0", fontSize: "0.88rem", lineHeight: 1.55, color: "var(--ink-dim)" }}>
            Dodici mesi di runway per chiudere i 7 livelli, lanciare a metà ottobre e trasformare il primo titolo in
            una pipeline.
          </p>
        </Card>

        <A d={300} className="pcard" style={{ padding: "0.85rem 1.1rem" }}>
          <Kicker colour="var(--concrete)">impiego dei fondi</Kicker>

          {/* the allocation, as one bar and then as the rows that compose it */}
          <div aria-hidden style={{ display: "flex", height: 12, marginTop: "0.6rem", overflow: "hidden", border: "1px solid var(--edge)" }}>
            {ASK_USE.map((u, i) => (
              <A key={u.name} mode="bar" d={420 + i * 80} style={{ width: `${u.pct * 100}%`, background: u.colour, opacity: 0.85 }}>{null}</A>
            ))}
          </div>

          <div style={{ display: "grid", gap: "0.34rem", marginTop: "0.7rem" }}>
            {ASK_USE.map((u, i) => (
              <A key={u.name} d={500 + i * 70} className="mono ask-row" style={{
                display: "grid", gridTemplateColumns: "11px 132px 58px minmax(0, 1fr)",
                gap: 9, alignItems: "baseline", fontSize: 11,
              }}>
                <span aria-hidden style={{ width: 9, height: 9, background: u.colour, display: "inline-block" }} />
                <span style={{ color: "var(--ink)", whiteSpace: "nowrap" }}>{u.name}</span>
                <span style={{ color: u.colour, textAlign: "right" }}>{eur(ASK_TOTAL_EUR * u.pct)}</span>
                <span style={{ color: "var(--ink-faint)", fontSize: 10 }}>{u.note}</span>
              </A>
            ))}
          </div>
        </A>
      </div>

      <div className="pitch-2col" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: "0.7rem", marginTop: "0.7rem" }}>
        <Card accent="var(--green)" d={780}>
          <Kicker colour="var(--green)">cosa non serve finanziare</Kicker>
          <ul style={{ listStyle: "none", margin: "0.55rem 0 0", padding: 0, display: "grid", gap: "0.3rem" }}>
            {[
              ["Break-even prodotto", "1.073 copie, ~11% dello scenario FLOOR"],
              ["Quota publisher", "nessuna: la revenue non è divisa"],
              ["Infrastruttura", "$310 sull’intera vita a 100K copie"],
            ].map(([k, v]) => (
              <li key={k} className="mono" style={{ display: "flex", gap: 8, fontSize: 10.5, lineHeight: 1.45 }}>
                <span aria-hidden style={{ color: "var(--green)" }}>›</span>
                <span><span style={{ color: "var(--ink)" }}>{k}</span> — <span style={{ color: "var(--ink-faint)" }}>{v}</span></span>
              </li>
            ))}
          </ul>
        </Card>

        <Card accent="var(--cyan)" d={860}>
          <Kicker colour="var(--cyan)">oltre al capitale</Kicker>
          <ul style={{ listStyle: "none", margin: "0.55rem 0 0", padding: 0, display: "grid", gap: "0.3rem" }}>
            {ASK_BEYOND_CAPITAL.map((a) => (
              <li key={a.what} className="mono" style={{ display: "flex", gap: 8, fontSize: 10.5, lineHeight: 1.45 }}>
                <span aria-hidden style={{ color: "var(--cyan)" }}>›</span>
                <span><span style={{ color: "var(--ink)" }}>{a.what}</span> — <span style={{ color: "var(--ink-faint)" }}>{a.why}</span></span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Foot d={960} m="0.55rem">
        Ripartizione indicativa, non vincolante. Il break-even di 1.073 copie è quello della slide 11 e non include
        il round: è il punto in cui il prodotto copre la spesa cash già sostenuta. Il moltiplicatore publisher è di
        Over Powered Game Marketing.
      </Foot>
    </Body>
  );
}

/* ========================================================= 16 appendix */

function Appendix() {
  const cols = [
    { title: "MERCATO / COMPARABLE", items: SOURCES_MARKET, colour: "var(--cyan)" },
    { title: "CREATOR DATA", items: SOURCES_CREATOR, colour: "var(--toxic)" },
    { title: "ASSUNZIONI FINANZIARIE", items: ASSUMPTIONS, colour: "var(--yellow)" },
  ];

  return (
    <Body>
      <Head
        n="16"
        kicker="appendice"
        title={<>Appendice · fonti &amp; assunzioni</>}
        lede="I dati pubblici sono separati dalle stime per mantenere il pitch verificabile."
        size="2"
      />

      <Grid min={250}>
        {cols.map((c, i) => (
          <Card key={c.title} accent={c.colour} d={230 + i * 110}>
            <Kicker colour={c.colour}>{c.title}</Kicker>
            <ul style={{ listStyle: "none", margin: "0.85rem 0 0", padding: 0, display: "grid", gap: "0.55rem" }}>
              {c.items.map((it) => (
                <li key={it} style={{ display: "flex", gap: 9, fontSize: "0.8rem", lineHeight: 1.55, color: "var(--ink-dim)" }}>
                  <span aria-hidden style={{ color: c.colour, flex: "0 0 auto" }}>•</span>
                  <span>{it}</span>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </Grid>

      <A d={580} style={{
        marginTop: "1.2rem", display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 16, flexWrap: "wrap", paddingTop: "1rem", borderTop: "1px solid var(--edge)",
      }}>
        <span className="mono" style={{ fontSize: 10.5, letterSpacing: "0.14em", color: "var(--ink-faint)" }}>
          DATI CONSULTATI: 10 SETTEMBRE 2026
        </span>
        <span className="display" style={{ fontSize: 13, letterSpacing: "0.14em", color: "var(--yellow)" }}>
          MY FRIEND IS BLIND · PITCH DECK
        </span>
      </A>
    </Body>
  );
}

/* --------------------------------------------------------------- export */

const BODIES = [
  Cover, Founder, Product, WhyNow, Comparable, Thesis, Creators,
  Roadmap, Pricing, Projections, Margins, Scale, GoToMarket, NextSteps, Ask, Appendix,
];

/* The rail and the bodies are two lists that have to stay the same length;
   inserting a slide means touching both. Fail loudly at import rather than
   rendering `undefined` somewhere in the middle of the deck. */
if (BODIES.length !== SLIDES.length) {
  throw new Error(
    `pitch deck: ${SLIDES.length} slides in SLIDES but ${BODIES.length} bodies — add the missing one to BODIES.`,
  );
}

/** One slide's content, wrapped in its Live context. */
export function SlideBody({ index, live }: { index: number; live: boolean }) {
  const Slide = BODIES[index];
  return (
    <Live.Provider value={live}>
      <Slide />
    </Live.Provider>
  );
}

export const SLIDE_COUNT = BODIES.length;
