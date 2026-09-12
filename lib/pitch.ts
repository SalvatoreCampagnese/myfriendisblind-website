/* The September 2026 pitch deck, transcribed from
   My_Friend_Is_Blind_Pitch_Deck.pptx.

   Every figure, caveat and source line below is quoted from the deck. The
   deck itself is careful to separate public data from third-party estimate,
   and that separation is load-bearing: it is why the numbers are quotable.
   Nothing here is rounded up, smoothed or re-spun for the web. */

export type SlideMeta = { id: string; n: string; label: string; accent: string };

const C = {
  cyan: "var(--cyan)",
  yellow: "var(--yellow)",
  orange: "var(--orange)",
  green: "var(--green)",
  red: "var(--red)",
  toxic: "var(--toxic)",
  steel: "var(--steel)",
};

/** The rail. Order here is the order of the deck. */
export const SLIDES: SlideMeta[] = [
  { id: "cover",      n: "01", label: "COVER",       accent: C.yellow },
  { id: "founder",    n: "02", label: "FOUNDER",     accent: C.cyan },
  { id: "product",    n: "03", label: "IL GIOCO",    accent: C.yellow },
  { id: "why-now",    n: "04", label: "PERCHÉ ORA",  accent: C.green },
  { id: "comparable", n: "05", label: "COMPARABLE",  accent: C.orange },
  { id: "thesis",     n: "06", label: "TESI",        accent: C.cyan },
  { id: "creators",   n: "07", label: "CREATOR",     accent: C.toxic },
  { id: "roadmap",    n: "08", label: "ROADMAP",     accent: C.yellow },
  { id: "pricing",    n: "09", label: "PRICING",     accent: C.green },
  { id: "projections",n: "10", label: "PROIEZIONI",  accent: C.green },
  { id: "margins",    n: "11", label: "MARGINI",     accent: C.green },
  { id: "scale",      n: "12", label: "COSTI A SCALA",accent: C.cyan },
  { id: "gtm",        n: "13", label: "GO-TO-MARKET",accent: C.cyan },
  { id: "next",       n: "14", label: "NEXT STEPS",  accent: C.yellow },
  { id: "appendix",   n: "15", label: "APPENDICE",   accent: C.steel },
];

/* ------------------------------------------------------------ 02 founder */

export const FOUNDER = [
  {
    kicker: "DEVELOPER",
    value: 10, suffix: " anni", decimals: 0,
    body: "Esperienza nello sviluppo software e nella costruzione di prodotti digitali.",
    colour: C.cyan,
  },
  {
    kicker: "PLAYER",
    value: 6400, suffix: " h", decimals: 0, thousands: true,
    body: "Giocatore assiduo: migliaia di ore vissute dentro loop, community e dinamiche multiplayer.",
    colour: C.yellow,
  },
  {
    kicker: "PRODUCT",
    value: 2, suffix: " launch", decimals: 0,
    body: "Co-Founder di una società di prodotto con due prodotti già lanciati sul mercato.",
    colour: C.orange,
  },
  {
    kicker: "COMMUNITY",
    value: 6000, suffix: "+", decimals: 0, thousands: true,
    body: "Ex-founder di una community gaming con oltre 6.000 giocatori.",
    colour: C.green,
  },
];

/* ------------------------------------------------------------ 03 product */

export const LOOP = ["Osserva", "comunica", "agisci", "fallisci/impara", "riprova"];

/* ------------------------------------------------------------ 04 why now */

export const HITS = [
  {
    name: "Palworld",
    value: 19, unit: "M",
    note: "Copie vendute riportate da VGI nel report co-op (dato a giugno 2024).",
    colour: C.green,
    bar: 1,
  },
  {
    name: "Helldivers 2",
    value: 11, unit: "M",
    note: "Copie vendute riportate da VGI nel report co-op (dato a giugno 2024).",
    colour: C.cyan,
    bar: 11 / 19,
  },
];

export const MULTIPLIER = [
  "Un acquisto crea una sessione.",
  "Una sessione crea conversazione.",
  "La conversazione crea contenuti.",
];

/* --------------------------------------------------------- 05 comparable */

/* The headline is the gross, not the sticker price: a pitch compares what a
   title took, and the price alone says nothing about scale. Where the gross
   is not disclosed it is shown as a range and the arithmetic that produced
   it is printed underneath, so the reader can check it rather than trust it. */
export const COMPARABLES = [
  {
    name: "FALL GUYS",
    metric: "$150,5M",
    /** how the headline figure was arrived at */
    math: "revenue attribuita, 12 mesi al 31/12/2020",
    benchmark: "breakout globale",
    body:
      "7M di copie Steam superate in meno di un mese dal lancio 2020. Il dato di revenue è dichiarato da Devolver nell’Admission Document: è l’unico dei tre che non sia una stima.",
    colour: C.yellow,
    kind: "DICHIARATO",
  },
  {
    name: "MACHINE PARTY",
    metric: "$1,3M – 8,4M",
    math: "~159K × $7.99 (review model) · 1,5M unità (VGI/Sensor Tower)",
    benchmark: "social party recente",
    body:
      "Lanciato 30 luglio 2026, ~4K review Steam. Le due stime terze divergono di 6,5x sulle stesse vendite: il range è il dato, non la media fra i due estremi.",
    colour: C.cyan,
    kind: "STIMA",
  },
  {
    name: "BOMBANANA!",
    metric: "~$3,0 – 3,7M",
    math: "~466K unità × $6.39–7.99",
    benchmark: "co-op asimmetrico diretto",
    body:
      "Lanciato 2 settembre 2026 a $7.99 con sconto lancio −20%. 1.650 review Steam, 96% positive al 10 settembre. Unità stimate VGI; la revenue reale è dietro paywall, quindi il gross è calcolato da noi sui due prezzi praticati.",
    colour: C.orange,
    kind: "DERIVATO",
  },
];

/* ------------------------------------------------------------- 06 thesis */

export const PILLARS = [
  { n: "01", name: "LOW FRICTION",   body: "Prezzo sotto i $12 e concetto spiegabile in pochi secondi.", colour: C.green },
  { n: "02", name: "SOCIAL TENSION", body: "Informazione incompleta + timer + responsabilità condivisa.", colour: C.yellow },
  { n: "03", name: "CREATOR FUEL",   body: "Urla, errori, clutch e tradimenti generano clip naturalmente.", colour: C.orange },
  { n: "04", name: "REPLAYABILITY",  body: "7+ livelli al lancio e struttura espandibile con nuove prove.", colour: C.cyan },
];

/* ----------------------------------------------------------- 07 creators */

export type Creator = {
  name: string;
  handle?: string;
  platform: "TWITCH" | "YOUTUBE";
  followers: string;
  /** follower count, for the bar. 0 = no comparable figure, so no bar. */
  reach: number;
  viewers: string;
  status: "VERIFICATO" | "PARZIALE" | "DA VALIDARE";
  /** the one row whose reach is measured rather than inferred */
  lead?: boolean;
};

/* ElChape is the one YouTube entry, so his numbers are not on the Twitch
   scale and deliberately get no bar: views on a published video accumulate,
   average concurrent viewers do not. The figures come from YouTube's own
   Atom feed for the channel (primary source), not from an aggregator —
   15 videos, 29 May to 11 Sep 2026, 305.727 views in total. */
export const CREATORS: Creator[] = [
  { name: "ManuuXO",      platform: "TWITCH",  followers: "~555K", reach: 555_000, viewers: "4.634 avg / 10.407 peak", status: "VERIFICATO" },
  { name: "ElChape",      handle: "ChapeGaming", platform: "YOUTUBE", followers: "n/d", reach: 0,
    viewers: "20,4K media/video · picco 53.138", status: "VERIFICATO", lead: true },
  { name: "Dario Martiz", platform: "TWITCH",  followers: "~90K",  reach: 90_000,  viewers: "317 avg / 739 peak",      status: "VERIFICATO" },
  { name: "Sami_GBT",     platform: "TWITCH",  followers: "~45K",  reach: 45_000,  viewers: "25 avg / 58 peak",        status: "VERIFICATO" },
  { name: "Stalkerina",   platform: "TWITCH",  followers: "~33K",  reach: 33_000,  viewers: "54 avg / 122 peak",       status: "VERIFICATO" },
  { name: "panniR",       platform: "TWITCH",  followers: "~31K",  reach: 31_000,  viewers: "53 peak su MW4; avg non trovato", status: "PARZIALE" },
  { name: "Bizzio2",      platform: "TWITCH",  followers: "~12K",  reach: 12_000,  viewers: "55 avg / 153 peak",       status: "VERIFICATO" },
];

export const PLATFORM_COLOUR: Record<Creator["platform"], string> = {
  TWITCH: C.toxic,
  YOUTUBE: C.red,
};

export const STATUS_COLOUR: Record<Creator["status"], string> = {
  VERIFICATO: C.green,
  PARZIALE: C.yellow,
  "DA VALIDARE": C.steel,
};

/* ------------------------------------------------------------ 08 roadmap */

export const ROADMAP = [
  { when: "10 SET",     name: "Core build",   body: "Networking, UX, primi livelli + instrumentation", colour: C.cyan },
  { when: "FINE SET",   name: "Closed test",  body: "Persone selezionate + creator feedback",          colour: C.yellow },
  { when: "01–14 OTT",  name: "Polish sprint",body: "Bilanciamento, bug fixing, onboarding, store assets", colour: C.orange },
  { when: "METÀ OTT",   name: "Launch",       body: "Almeno 7 livelli + creator activation",            colour: C.green },
];

/* -------------------------------------------------------- 10 projections */

export const PROJECTIONS = [
  { tier: "FLOOR",    copies: 10,  label: "10K copie",  gross: "$79.9K",  net: "$55.9K",  colour: C.steel,  bar: 0.10 },
  { tier: "TARGET",   copies: 35,  label: "35K copie",  gross: "$279.7K", net: "$195.8K", colour: C.yellow, bar: 0.35 },
  { tier: "BREAKOUT", copies: 100, label: "100K copie", gross: "$799K",   net: "$559.3K", colour: C.green,  bar: 1 },
];

/* ----------------------------------------------------------- 11 margini */

/* The one number on this slide that is not derived: the founder's cash spend
   to launch, given as a ceiling rather than a figure. Everything below falls
   out of it and of $7.99 x 70%, so the arithmetic is checkable end to end.

   The ceiling is stated in euro and the deck's revenue in dollars, so it is
   converted at a deliberately unfavourable $1.20/EUR — the prudent direction
   for a cost. */
export const FIXED_COST_EUR = 5000;
export const FIXED_COST_USD = 6000;

export const STEAM_FEE = 0.30;

export const UNIT = {
  price: 7.99,
  steam: 7.99 * STEAM_FEE,          // 2.40
  net: 7.99 * (1 - STEAM_FEE),      // 5.59
  marginal: 0,
};

/** Every cut the revenue does NOT take, and the one it does. */
export const CUTS = [
  { name: "Engine — Godot",  pct: "0%",  why: "licenza MIT: nessuna royalty sul venduto",       cut: false },
  { name: "Publisher",       pct: "0%",  why: "nessun publisher: la revenue non è divisa",      cut: false },
  { name: "Server",          pct: "0%",  why: "co-op P2P / Steam relay: nessun costo a sessione", cut: false },
  { name: "Steam",           pct: "30%", why: "l’unica deduzione ricorrente",                   cut: true },
];

/** Copies needed to clear the fixed cost. ~11% of the FLOOR scenario. */
export const BREAK_EVEN = Math.ceil(FIXED_COST_USD / UNIT.net);

/** The three scenarios of slide 10, opened up into where the money goes. */
export const MARGINS = PROJECTIONS.map((p) => {
  const gross = p.copies * 1000 * UNIT.price;
  const steam = gross * STEAM_FEE;
  const net = gross - steam - FIXED_COST_USD;
  return {
    tier: p.tier,
    label: p.label,
    colour: p.colour,
    gross,
    steam,
    cost: FIXED_COST_USD,
    net,
    /** shares of this scenario's own gross — the bar is always full width */
    share: { steam: steam / gross, cost: FIXED_COST_USD / gross, net: net / gross },
  };
});

/** $79,900 -> "$79.9K" — the notation slide 10 already uses. */
export function usdK(n: number) {
  return `$${(n / 1000).toFixed(1)}K`;
}

/* -------------------------------------------------------- 12 costi a scala */

/* The networking is hybrid: peer-to-peer by default, with a Cloudflare TURN
   relay only for the sessions whose NAT refuses a direct connection. That
   makes infrastructure a variable cost — so it is modelled, not asserted.

   Cloudflare Realtime TURN list price, from Cloudflare's own docs (Sept 2026):
   $0.05/GB billed on edge-to-client traffic, first 1,000 GB free. Everything
   below is arithmetic on top of that plus four stated assumptions. */
export const INFRA = {
  turnPerGB: 0.05,
  freeGB: 1000,
  /** upper end of the usual 15–25% NAT-traversal failure range */
  relayShare: 0.25,
  /** state sync only — voice lives in Discord, so it is not our traffic */
  kbpsPerPlayer: 64,
  playersPerSession: 2,
  sessionMinutes: 30,
  /** lifetime sessions played per buyer */
  sessionsPerPlayer: 20,
};

/** GB billed by one relayed session: 64 kbps x 2 players x 30 min = 28,8 MB. */
export const GB_PER_RELAYED_SESSION =
  (INFRA.kbpsPerPlayer * INFRA.playersPerSession * INFRA.sessionMinutes * 60) / 8 / 1_000_000;

export const COST_PER_RELAYED_SESSION = GB_PER_RELAYED_SESSION * INFRA.turnPerGB;

/** How many relayed sessions the free tier alone absorbs. */
export const FREE_SESSIONS = Math.floor(INFRA.freeGB / GB_PER_RELAYED_SESSION);

export const SCALE = PROJECTIONS.map((p) => {
  const copies = p.copies * 1000;
  const sessions = (copies * INFRA.sessionsPerPlayer) / INFRA.playersPerSession;
  const relayed = sessions * INFRA.relayShare;
  const gb = relayed * GB_PER_RELAYED_SESSION;
  const cost = Math.max(0, gb - INFRA.freeGB) * INFRA.turnPerGB;
  return { tier: p.tier, colour: p.colour, copies, sessions, relayed, gb, cost };
});

/* ------------------------------------------------------------ 13 go-to-market */

export const GTM = [
  { n: "01", name: "PLAYTEST",      lines: ["20–50 coppie selezionate", "Misurare completion, retry, rage/fun moments"], colour: C.cyan },
  { n: "02", name: "CREATOR SEED",  lines: ["Build privata ai creator", "Clip, reaction, feedback, Discord"],            colour: C.yellow },
  { n: "03", name: "WISHLIST PUSH", lines: ["Short-form + Steam page", "CTA unica: wishlist / Discord"],                 colour: C.orange },
  { n: "04", name: "LAUNCH EVENT",  lines: ["Creator co-op night", "7 livelli + sfide community"],                       colour: C.green },
];

/* ------------------------------------------------------------- 12 next */

export const NEXT_STEPS = [
  "Chiudere il core loop e i 7 livelli",
  "Eseguire closed test strutturati",
  "Validare retention di sessione e livelli top",
  "Preparare Steam, trailer e creator kit",
  "Coordinare creator activation per launch week",
];

export const ASKS = ["Feedback strategico.", "Playtester.", "Creator.", "Partner di distribuzione."];

/* --------------------------------------------------------- 13 appendix */

export const SOURCES_MARKET = [
  "Steam — Machine Party, BOMBANANA! store pages (prezzi, release, review)",
  "Devolver Digital — Admission Document (Fall Guys: $150.5M revenue, 2020 period)",
  "PC Gamer — Fall Guys 7M Steam copies, Aug 2020",
  "Video Game Insights / Sensor Tower — Machine Party & BOMBANANA! estimates",
  "SteamPageAnalyzer — Machine Party review-based sales estimate",
  "VGI — Rise of the Co-Op Games; Global Indie Games Market Report 2024",
];

export const SOURCES_CREATOR = [
  "Streams Charts — ManuuXO, DarioMartiz, Stalkerina, Bizzio2, Sami_GBT",
  "TwitchMetrics — panniR MW4 peak reference",
  "Creator metrics are snapshots and can change daily.",
];

export const ASSUMPTIONS = [
  "$7.99 ASP used for simple gross model",
  "30% Steam fee shown as simplified platform deduction",
  "Excludes taxes, VAT, refunds, regional pricing, discounts and other costs",
  "Fixed cash cost to launch stated as a ceiling (< €5K), converted at an unfavourable $1.20/€",
  "No engine royalty (Godot, MIT) and no publisher share; P2P / Steam-relay networking implies no per-session server cost",
  "Founder time is not costed: the model is cash out, not fully loaded cost",
  "Infra: hybrid P2P + Cloudflare TURN at list ($0.05/GB, first 1,000 GB free); 25% relayed, 64 kbps/player, 30-min sessions, 20 sessions/buyer",
];
