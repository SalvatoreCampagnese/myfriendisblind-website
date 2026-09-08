/* The hazard cycle, lifted from docs/GAME_DESIGN.md.
   A pure function of the round clock, so both peers see the same machine
   with nothing to desync. */

export type PhaseName = "CLEAR" | "ARMING" | "SLAM" | "LIFT";

export type Phase = {
  name: PhaseName;
  seconds: number;
  lethal: boolean;
  colour: string;
  note: string;
};

export const HAZARD_CYCLE: Phase[] = [
  { name: "CLEAR",  seconds: 3.5, lethal: false, colour: "var(--green)",  note: "safe — go now" },
  { name: "ARMING", seconds: 1.5, lethal: false, colour: "var(--yellow)", note: "warning — still safe, but not for long" },
  { name: "SLAM",   seconds: 4.0, lethal: true,  colour: "var(--red)",    note: "lethal" },
  { name: "LIFT",   seconds: 1.0, lethal: true,  colour: "var(--orange)", note: "still lethal — this is the beat that kills friendships" },
];

export const CYCLE_SECONDS = HAZARD_CYCLE.reduce((a, p) => a + p.seconds, 0); // 10.0

export function phaseAt(t: number) {
  const c = ((t % CYCLE_SECONDS) + CYCLE_SECONDS) % CYCLE_SECONDS;
  let acc = 0;
  for (let i = 0; i < HAZARD_CYCLE.length; i++) {
    const p = HAZARD_CYCLE[i];
    if (c < acc + p.seconds) {
      return { index: i, phase: p, local: c - acc, cycle: c, progress: c / CYCLE_SECONDS };
    }
    acc += p.seconds;
  }
  const last = HAZARD_CYCLE.length - 1;
  return { index: last, phase: HAZARD_CYCLE[last], local: 0, cycle: c, progress: 1 };
}

/* FLASH's envelope, with the shape the design doc specifies:
   anticipate 0.07 -> punch 0.13 -> hold 1.15 -> fade 0.85.
   The dip before the punch makes clarity feel earned; the slow fade makes
   losing it feel like loss. */
export const FLASH = {
  anticipate: 0.07,
  punch: 0.13,
  hold: 1.15,
  fade: 0.85,
  cooldown: 7.0,
};
export const FLASH_TOTAL = FLASH.anticipate + FLASH.punch + FLASH.hold + FLASH.fade; // 2.20

const easeOut = (u: number) => 1 - Math.pow(1 - u, 3);
const easeIn = (u: number) => u * u * u;

/** Returns { clarity, pulse } for a FLASH `t` seconds old, given a base clarity. */
export function flashEnvelope(t: number, base: number) {
  const { anticipate, punch, hold, fade } = FLASH;
  if (t < 0) return { clarity: base, pulse: 0 };

  if (t < anticipate) {
    const u = t / anticipate;
    return { clarity: base * (1 - u), pulse: 0 };
  }
  const t1 = t - anticipate;
  if (t1 < punch) {
    const u = t1 / punch;
    return { clarity: easeOut(u), pulse: Math.sin(u * Math.PI) * 0.34 };
  }
  const t2 = t1 - punch;
  if (t2 < hold) {
    // clarity decays to 0.82 across the hold: you are pushed to ACT, not to sightsee
    return { clarity: 1 - 0.18 * (t2 / hold), pulse: 0 };
  }
  const t3 = t2 - hold;
  if (t3 < fade) {
    const u = t3 / fade;
    return { clarity: 0.82 + (base - 0.82) * easeIn(u), pulse: 0 };
  }
  return { clarity: base, pulse: 0 };
}

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
