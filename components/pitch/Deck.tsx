"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SLIDES } from "@/lib/pitch";
import { SlideBody } from "@/components/pitch/Slides";
import { useReducedMotion } from "@/lib/useReducedMotion";

/* =====================================================================
   The deck.

   A horizontal scroll-snap track, driven four ways at once — wheel, keys,
   arrows and the rail — all of which funnel through go(). Scroll position
   stays the single source of truth, so a trackpad swipe and an arrow key
   cannot disagree about which slide you are on.

   Wheel needs care. Each slide is its own vertical scroller, because a
   dense slide on a laptop does not fit in one viewport. So a vertical
   wheel is only stolen and turned into a page turn once the slide itself
   has nothing left to scroll — otherwise the deck would eat half of a
   slide the reader has not finished. Horizontal wheel is never stolen:
   native snap already does the right thing with it, and better.
   ===================================================================== */

const LAST = SLIDES.length - 1;
const TURN_MS = 640;

function Arrow({ dir }: { dir: -1 | 1 }) {
  return (
    <svg width="13" height="13" viewBox="0 0 11 15" aria-hidden style={{ transform: dir < 0 ? "scaleX(-1)" : undefined }}>
      <path d="M0 0 L6 7.5 L0 15 L4 15 L10 7.5 L4 0 Z" fill="currentColor" />
    </svg>
  );
}

export default function Deck() {
  const scroller = useRef<HTMLDivElement | null>(null);
  const slides = useRef<(HTMLElement | null)[]>([]);
  const lockUntil = useRef(0);
  const [active, setActive] = useState(0);
  const [touched, setTouched] = useState(false);
  const reduced = useReducedMotion();

  /* The index, readable synchronously. A key held down fires faster than
     React commits, and every input path needs to step from where the deck
     is actually going — not from the render that has not happened yet. */
  const at = useRef(0);
  const landing = useRef(0);

  const go = useCallback(
    (n: number, jump = false) => {
      const el = scroller.current;
      if (!el) return;
      const k = Math.max(0, Math.min(LAST, n));
      at.current = k;
      lockUntil.current = performance.now() + TURN_MS;
      // Optimistic: the incoming slide starts its stagger while it is still
      // sliding in, which is the whole effect.
      setActive(k);
      el.scrollTo({ left: k * el.clientWidth, behavior: jump || reduced ? "auto" : "smooth" });

      // A smooth scroll is a no-op in a backgrounded tab, which would leave
      // the rail and the reveals a slide ahead of what is on screen forever.
      // Check the landing, and put it there outright if it never arrived.
      window.clearTimeout(landing.current);
      landing.current = window.setTimeout(() => {
        if (at.current !== k) return; // the reader moved on; leave them there
        const want = k * el.clientWidth;
        if (Math.abs(el.scrollLeft - want) > 2) el.scrollLeft = want;
      }, TURN_MS + 120);
    },
    [reduced],
  );

  useEffect(() => () => window.clearTimeout(landing.current), []);

  const step = useCallback(
    (d: -1 | 1) => {
      setTouched(true);
      go(at.current + d);
    },
    [go],
  );

  /* deep link, on mount only — /pitch#pricing opens on slide 9 */
  useEffect(() => {
    const key = window.location.hash.replace("#", "").toLowerCase();
    if (!key) return;
    const i = SLIDES.findIndex((s) => s.id === key || s.n === key);
    if (i > 0) go(i, true);
  }, [go]);

  /* keep the hash pointing at what is on screen, without a history entry */
  useEffect(() => {
    const id = SLIDES[active].id;
    if (window.location.hash.replace("#", "") !== id) {
      window.history.replaceState(null, "", `#${id}`);
    }
  }, [active]);

  /* Scroll is the ground truth, but only once it stops moving. Reading the
     index mid-flight would pick up every position a smooth scroll passes
     through, and — worse — the moment during a resize when the old
     scrollLeft is still measured against the new page width. */
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    let settle = 0;

    const onScroll = () => {
      window.clearTimeout(settle);
      settle = window.setTimeout(() => {
        const w = el.clientWidth;
        if (w === 0) return;
        const i = Math.max(0, Math.min(LAST, Math.round(el.scrollLeft / w)));
        if (at.current === i) return;
        at.current = i;
        setActive(i);
      }, 110);
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.clearTimeout(settle);
      el.removeEventListener("scroll", onScroll);
    };
  }, []);

  /* A resize changes what one page-width means, so the pixel offset has to be
     recomputed from the index — never the other way round. */
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      el.scrollLeft = at.current * el.clientWidth;
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* wheel — only stolen once the slide itself has nothing left to give */
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return; // native snap does this better
      if (Math.abs(e.deltaY) < 4) return;

      const slide = slides.current[active];
      if (slide && slide.scrollHeight - slide.clientHeight > 6) {
        const atTop = slide.scrollTop <= 1;
        const atEnd = slide.scrollTop + slide.clientHeight >= slide.scrollHeight - 1;
        const wantsMore = e.deltaY < 0 ? !atTop : !atEnd;
        if (wantsMore) return; // let the slide scroll itself
      }

      e.preventDefault();
      if (performance.now() < lockUntil.current) return;
      step(e.deltaY > 0 ? 1 : -1);
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [active, step]);

  /* keys */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      if (e.repeat && performance.now() < lockUntil.current) return;

      switch (e.key) {
        case "ArrowRight":
        case "PageDown":
          e.preventDefault(); step(1); break;
        case "ArrowLeft":
        case "PageUp":
          e.preventDefault(); step(-1); break;
        case "Home":
          e.preventDefault(); setTouched(true); go(0); break;
        case "End":
          e.preventDefault(); setTouched(true); go(LAST); break;
        default:
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, step]);

  const cur = SLIDES[active];

  return (
    <div
      style={{
        height: "100svh",
        display: "flex",
        flexDirection: "column",
        paddingTop: 62,
        overflow: "hidden",
        position: "relative",
        isolation: "isolate",
      }}
    >
      {/* progress — the hazard stripe, as a completion bar */}
      <div aria-hidden style={{ height: 3, flex: "0 0 auto", background: "#0B0E12", position: "relative", zIndex: 40 }}>
        <div
          className="stripe-thin"
          style={{
            height: "100%",
            width: `${((active + 1) / SLIDES.length) * 100}%`,
            transition: "width 520ms cubic-bezier(0.16,0.84,0.28,1)",
          }}
        />
      </div>

      <div
        ref={scroller}
        className="deck-scroll"
        role="region"
        aria-roledescription="carousel"
        aria-label="Pitch deck — My Friend Is Blind"
        tabIndex={-1}
      >
        {SLIDES.map((s, i) => (
          <section
            key={s.id}
            id={`pitch-${s.id}`}
            ref={(n) => { slides.current[i] = n; }}
            className="pslide"
            data-live={i === active}
            inert={i !== active}
            aria-roledescription="slide"
            aria-label={`${s.n} di ${SLIDES.length} — ${s.label}`}
            style={{ ["--accent" as string]: s.accent }}
          >
            {/* The grain needs its own clipped layer: .grain::after sits at
                inset -50%, which on the scroll container itself would add
                half a viewport of phantom scroll to every slide. */}
            <span aria-hidden className="grain" style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }} />
            <SlideBody index={i} live={i === active} />
          </section>
        ))}
      </div>

      {/* the two side hit-zones — a deck should turn where you expect it to */}
      <button
        type="button"
        className="deck-edge"
        style={{ left: 0, justifyItems: "start", paddingLeft: 14 }}
        onClick={() => step(-1)}
        disabled={active === 0}
        aria-label="Slide precedente"
      >
        <span style={{ display: "block", transform: "scaleX(-1)" }}><Arrow dir={1} /></span>
      </button>
      <button
        type="button"
        className="deck-edge"
        style={{ right: 0, justifyItems: "end", paddingRight: 14 }}
        onClick={() => step(1)}
        disabled={active === LAST}
        aria-label="Slide successiva"
      >
        <Arrow dir={1} />
      </button>

      {/* the rail */}
      <div
        style={{
          flex: "0 0 auto",
          borderTop: "1px solid var(--edge)",
          background: "color-mix(in srgb, #07090C 88%, transparent)",
          backdropFilter: "blur(12px)",
          position: "relative",
          zIndex: 40,
        }}
      >
        <div
          className="shell deck-rail"
          style={{
            display: "flex", alignItems: "center", gap: "1.25rem",
            height: 60, width: "min(1240px, 100% - 3.5rem)",
          }}
        >
          {/* where you are */}
          <div style={{ display: "flex", alignItems: "baseline", gap: 9, flex: "0 0 auto" }}>
            <span className="display" style={{ fontSize: 20, color: "var(--yellow)", lineHeight: 1 }}>{cur.n}</span>
            <span className="mono" style={{ fontSize: 10.5, color: "var(--ink-faint)", letterSpacing: "0.12em" }}>
              / {SLIDES.length}
            </span>
            <span
              className="mono deck-label"
              style={{
                marginLeft: 6, fontSize: 10.5, letterSpacing: "0.16em",
                color: "var(--ink-dim)", whiteSpace: "nowrap",
              }}
            >
              {cur.label}
            </span>
          </div>

          {/* the segmented rail — each segment is a slide, the live one widens */}
          <div style={{ display: "flex", alignItems: "center", gap: 4, flex: 1, minWidth: 60 }}>
            {SLIDES.map((s, i) => (
              <button
                key={s.id}
                type="button"
                className="deck-dot"
                data-on={i === active}
                onClick={() => { setTouched(true); go(i); }}
                aria-label={`Vai alla slide ${s.n}: ${s.label}`}
                aria-current={i === active ? "true" : undefined}
              />
            ))}
          </div>

          {/* the hint, until you have moved once */}
          <span
            className="mono deck-hint-text"
            aria-hidden
            style={{
              flex: "0 0 auto", fontSize: 10, letterSpacing: "0.14em", color: "var(--ink-faint)",
              opacity: touched ? 0 : 1, transition: "opacity 500ms ease", whiteSpace: "nowrap",
            }}
          >
            SCROLL <span className="deck-hint" style={{ display: "inline-block", color: "var(--yellow)" }}>→</span>
            <span style={{ margin: "0 8px", opacity: 0.4 }}>·</span> ← →
          </span>

          <div style={{ display: "flex", gap: 6, flex: "0 0 auto" }}>
            <button type="button" className="deck-arrow" onClick={() => step(-1)} disabled={active === 0} aria-label="Slide precedente">
              <Arrow dir={-1} />
            </button>
            <button type="button" className="deck-arrow" onClick={() => step(1)} disabled={active === LAST} aria-label="Slide successiva">
              <Arrow dir={1} />
            </button>
          </div>
        </div>
      </div>

      {/* the announcement, for anyone not watching it happen */}
      <p aria-live="polite" className="sr-only">
        Slide {cur.n} di {SLIDES.length}: {cur.label}
      </p>

      <style>{`
        .sr-only {
          position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
          overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0;
        }
        .pitch-cta { transition: transform 120ms, filter 180ms; }
        .pitch-cta:hover { transform: translateY(-2px); filter: brightness(1.08); }
        .pitch-cta:active { transform: translateY(1px); }
        @media (max-width: 760px) {
          .deck-label { display: none; }
          .deck-hint-text { display: none; }
        }
        @media (max-width: 900px) {
          .pitch-2col { grid-template-columns: minmax(0, 1fr) !important; }
          .pitch-figure { text-align: left !important; }
        }
      `}</style>
    </div>
  );
}
