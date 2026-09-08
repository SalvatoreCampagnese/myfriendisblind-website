"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { FLASH, FLASH_TOTAL, clamp01, flashEnvelope, phaseAt } from "@/lib/clock";
import { useReducedMotion } from "@/lib/useReducedMotion";

/* =====================================================================
   One clock for the whole site.

   The hazard beacon in the nav, the phase ring in THE TEN SECONDS and the
   shader over the hero are all driven from this single rAF — exactly as
   they are in the game, where the phase is a pure function of the round
   clock and there is nothing to desync.

   Per-frame values are published through a subscription, NOT through React
   state: a 60 Hz setState would re-render the whole page every frame.
   React state carries only the coarse things that actually change rarely
   (which phase we are in, whether FLASH is up).
   ===================================================================== */

export type Frame = {
  t: number;        // seconds since load
  clarity: number;  // 0 = full blind, 1 = untouched frame
  pulse: number;    // additive white punch, FLASH only
  edge: number;     // VISOR Sobel impulse
  charge: number;   // 0..1, 1 = FLASH ready
  flashing: boolean;
  cycle: number;    // 0..10s position in the hazard cycle
};

export type Ping = { id: number; x: number; y: number };

type ClarityAPI = {
  subscribe: (fn: (f: Frame) => void) => () => void;
  read: () => Frame;
  flash: () => void;
  ping: (x?: number, y?: number) => void;
  flashing: boolean;
  ready: boolean;
  phaseIndex: number;
  pings: Ping[];
  reduced: boolean;
};

const Ctx = createContext<ClarityAPI | null>(null);

export function useClarity() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useClarity() used outside <ClarityProvider>");
  return v;
}

/** Subscribe a callback to every frame. The callback must not setState. */
export function useFrame(fn: (f: Frame) => void) {
  const { subscribe } = useClarity();
  const ref = useRef(fn);
  useEffect(() => { ref.current = fn; });
  useEffect(() => subscribe((f) => ref.current(f)), [subscribe]);
}

export function ClarityProvider({ children }: { children: React.ReactNode }) {
  const frame = useRef<Frame>({
    t: 0, clarity: 0.09, pulse: 0, edge: 0, charge: 1, flashing: false, cycle: 0,
  });
  const subs = useRef(new Set<(f: Frame) => void>());
  const flashAt = useRef(-999);
  const scroll = useRef(0);
  const start = useRef(0);
  const pingId = useRef(0);

  const [flashing, setFlashing] = useState(false);
  const [ready, setReady] = useState(true);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [pings, setPings] = useState<Ping[]>([]);
  const reduced = useReducedMotion();

  const subscribe = useCallback((fn: (f: Frame) => void) => {
    subs.current.add(fn);
    fn(frame.current);
    return () => { subs.current.delete(fn); };
  }, []);

  const read = useCallback(() => frame.current, []);

  const flash = useCallback(() => {
    const now = (performance.now() - start.current) / 1000;
    // long enough that the Guide stays essential
    if (now - flashAt.current < FLASH_TOTAL + FLASH.cooldown) return;
    flashAt.current = now;
  }, []);

  const ping = useCallback((x?: number, y?: number) => {
    const id = ++pingId.current;
    setPings((p) => [...p.slice(-3), { id, x: x ?? Math.random(), y: y ?? Math.random() }]);
    window.setTimeout(() => setPings((p) => p.filter((q) => q.id !== id)), 1500);
  }, []);

  useEffect(() => {
    start.current = performance.now();
    let raf = 0;
    let lastPhase = -1;
    let lastFlashing = false;
    let lastReady = true;
    let lastCssClarity = -1;

    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      scroll.current = h > 0 ? clamp01(window.scrollY / h) : 0;
    };
    onScroll();

    const onKey = (e: KeyboardEvent) => {
      if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "f" || e.key === "F") { e.preventDefault(); flash(); }
      if (e.key === "g" || e.key === "G") { e.preventDefault(); ping(); }
    };

    const tick = () => {
      const now = (performance.now() - start.current) / 1000;

      // Base clarity climbs as you descend the tower — the site learns to
      // see. It never reaches 1 on its own: only FLASH buys that.
      const base = 0.09 + 0.28 * scroll.current;

      const age = now - flashAt.current;
      const active = age >= 0 && age < FLASH_TOTAL;
      const env = active ? flashEnvelope(age, base) : { clarity: base, pulse: 0 };

      // VISOR: the edge impulse rides the punch and dies with it
      const edge = active ? Math.max(0, 1 - Math.abs(age - 0.32) / 0.85) * 1.4 : 0;
      const charge = age < 0 ? 1 : clamp01((age - FLASH_TOTAL) / FLASH.cooldown);
      const ph = phaseAt(now);

      const f: Frame = {
        t: now,
        clarity: env.clarity,
        pulse: env.pulse,
        edge,
        charge,
        flashing: active,
        cycle: ph.cycle,
      };
      frame.current = f;
      subs.current.forEach((fn) => fn(f));

      if (ph.index !== lastPhase) { lastPhase = ph.index; setPhaseIndex(ph.index); }
      if (active !== lastFlashing) { lastFlashing = active; setFlashing(active); }
      const isReady = charge >= 1;
      if (isReady !== lastReady) { lastReady = isReady; setReady(isReady); }

      // publish a coarse clarity to CSS for surfaces that are not canvases
      const q = Math.round(f.clarity * 50) / 50;
      if (q !== lastCssClarity) {
        lastCssClarity = q;
        document.documentElement.style.setProperty("--clarity", String(q));
      }

      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    window.addEventListener("keydown", onKey);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("keydown", onKey);
    };
  }, [flash, ping]);

  return (
    <Ctx.Provider
      value={{ subscribe, read, flash, ping, flashing, ready, phaseIndex, pings, reduced }}
    >
      {children}
    </Ctx.Provider>
  );
}
