"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/useReducedMotion";

/* Small industrial trim pieces. Colour means something; nothing here glows
   unless it is meant to. */

export function StripeRule({ height = 10 }: { height?: number }) {
  return (
    <div
      className="stripe"
      style={{ height, width: "100%", opacity: 0.85 }}
      aria-hidden
    />
  );
}

export function Chevrons({ count = 6, colour = "var(--yellow)" }: { count?: number; colour?: string }) {
  return (
    <div aria-hidden style={{ display: "flex", gap: 4, alignItems: "center" }}>
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} width="11" height="15" viewBox="0 0 11 15" style={{
          opacity: 0.18 + (i / count) * 0.82,
          animation: `beacon 1.4s ease-in-out ${i * 0.09}s infinite`,
        }}>
          <path d="M0 0 L6 7.5 L0 15 L4 15 L10 7.5 L4 0 Z" fill={colour} />
        </svg>
      ))}
    </div>
  );
}

export function Tag({ children, colour = "var(--cyan)" }: { children: React.ReactNode; colour?: string }) {
  return (
    <span
      className="mono clip-tag"
      style={{
        display: "inline-block",
        fontSize: 11,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        padding: "5px 12px 5px 10px",
        color: colour,
        background: "color-mix(in srgb, var(--charcoal) 90%, black)",
        border: `1px solid color-mix(in srgb, ${colour} 34%, transparent)`,
        borderLeft: `2px solid ${colour}`,
      }}
    >
      {children}
    </span>
  );
}

export function SectionHead({
  index,
  kicker,
  title,
  lede,
}: {
  index: string;
  kicker: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
}) {
  return (
    <header style={{ marginBottom: "3.25rem", maxWidth: "58ch" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
        <span className="display" style={{ fontSize: 13, color: "var(--yellow)", letterSpacing: "0.2em" }}>
          {index}
        </span>
        <span style={{ height: 1, width: 34, background: "var(--steel-dark)" }} />
        <span className="stencil">{kicker}</span>
      </div>
      <h2 className="display" style={{ fontSize: "clamp(2.1rem, 5.4vw, 3.9rem)", margin: 0, color: "var(--ink)" }}>
        {title}
      </h2>
      {lede ? <p className="lede" style={{ marginTop: "1.1rem" }}>{lede}</p> : null}
    </header>
  );
}

/** A number that counts up once, when it first comes into view. */
export function CountUp({ to, suffix = "", decimals = 0 }: { to: number; suffix?: string; decimals?: number }) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [v, setV] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;

    let raf = 0;
    const run = () => {
      const t0 = performance.now();
      const dur = 1100;
      const step = (t: number) => {
        const u = Math.min(1, (t - t0) / dur);
        setV(to * (1 - Math.pow(1 - u, 4)));
        if (u < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };

    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) { run(); return; }

    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      run();
    }, { threshold: 0.4 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [to, reduced]);

  return <span ref={ref} className="mono">{(reduced ? to : v).toFixed(decimals)}{suffix}</span>;
}
