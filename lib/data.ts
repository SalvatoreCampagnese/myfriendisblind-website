/* Everything on this site is quoted from the game's own documents —
   docs/CAMPAIGN_ARC.md, docs/GAME_DESIGN.md, docs/ART_DIRECTION.md,
   game_scene.md. No marketing invented on top. */

export type Floor = {
  n: number;
  name: string;
  act: string;
  rung: string;
  line: string;
  colour: string;
};

export const ACTS = [
  { id: "I",   name: "LEARNING TO SPEAK",             floors: "1–2",   about: "the Blind learns to trust; the Guide learns to be precise" },
  { id: "II",  name: "THE VOCABULARY",                floors: "3–7",   about: "patterns, momentum, ambiguity — the language is stressed" },
  { id: "III", name: "THE GUIDE IS NOT SAFE EITHER",  floors: "8–12",  about: "the Guide can be blinded, be late, or kill by mistake" },
  { id: "IV",  name: "BOTH OF YOU",                   floors: "13–15", about: "the channel itself fails; the roles swap mid-level" },
  { id: "V",   name: "ABOVE THE CORE",                floors: "16–20", about: "the floor becomes a consumable, and then a balance" },
  { id: "VI",  name: "WHAT LANGUAGE CANNOT SAY",      floors: "21–29", about: "everything the Guide knows is something their friend told them" },
];

const C = {
  cyan: "var(--cyan)",
  yellow: "var(--yellow)",
  orange: "var(--orange)",
  red: "var(--red)",
  green: "var(--green)",
  toxic: "var(--toxic)",
};

export const FLOORS: Floor[] = [
  { n: 1,  name: "TRAINING FACILITY",  act: "I",   rung: "Rung 1 — naming a direction", line: "The whole level exists to prove in four seconds that “forward” means nothing to a person who cannot see the room.", colour: C.cyan },
  { n: 2,  name: "FOUNDRY GANTRY",     act: "I",   rung: "Rung 2 — naming a distance",  line: "Three decks. The word the level was built for is “up”.", colour: C.orange },
  { n: 3,  name: "RECLAIM LINE",       act: "II",  rung: "Rung 4 — read out a pattern", line: "Conveyors over a shredder pit, and a floor of live plates that is silent, unlit and unsmelled.", colour: C.yellow },
  { n: 4,  name: "CRYO VAULT",         act: "II",  rung: "Rung 4 — speak early",        line: "Ice. “Stop” is useless; “stop now” is already too late.", colour: C.cyan },
  { n: 5,  name: "BLACKOUT STACK",     act: "II",  rung: "Rung 5 — the Guide can lose their sight too", line: "EM-dead zones. The first time the Blind has to describe the world to the Guide.", colour: C.red },
  { n: 6,  name: "ACID YARD",          act: "II",  rung: "Rung 3 + a global clock",     line: "The downpour. Shelter is finite and the route between shelters is longer than the dry window.", colour: C.toxic },
  { n: 7,  name: "MIRROR WING",        act: "II",  rung: "Rung 6 — the level attacks the language itself", line: "A symmetric room. Every sentence the Guide has ever used is true of two places at once.", colour: C.cyan },
  { n: 8,  name: "PRESSURE LOCKS",     act: "III", rung: "Rung 5 — the Guide can kill", line: "The Guide is given the controls, which means the Guide is given the deaths.", colour: C.orange },
  { n: 9,  name: "SOUND TRAP",         act: "III", rung: "Rung 3, inverted",            line: "Turrets that hear movement. The safe moment to move is the moment the lethal thing is running.", colour: C.red },
  { n: 10, name: "REACTOR CATWALKS",   act: "III", rung: "Rung 6 — “north” stops being a constant", line: "The room turns under you, and the vocabulary turns with it.", colour: C.green },
  { n: 11, name: "FLOODING SUMP",      act: "III", rung: "Rung 4 + a moving floor plane", line: "The pattern is still there. The height it is at is not.", colour: C.cyan },
  { n: 12, name: "FURNACE BELT",       act: "III", rung: "Rung 5 — hidden resource management", line: "Something is being spent that neither of you was told about.", colour: C.orange },
  { n: 13, name: "SORTING MAZE",       act: "IV",  rung: "Rung 6 — the Guide's information is late", line: "The map is real. The map is stale. Both at once.", colour: C.yellow },
  { n: 14, name: "RELAY ANTENNA",      act: "IV",  rung: "Rung 6 — the channel itself fails", line: "The thing that breaks is not the room. It is the sentence crossing between you.", colour: C.cyan },
  { n: 15, name: "THE CORE",           act: "IV",  rung: "All four rungs, then the roles swap mid-level", line: "One chamber, and when both of you stand in it the roles reverse inside the same round.", colour: C.red },
  { n: 16, name: "THE SCAFFOLD",       act: "V",   rung: "The floor is a consumable",   line: "Twenty-five cells over a twenty-five-metre hole. Twenty of them fall two seconds after you touch them.", colour: C.orange },
  { n: 17, name: "THE DEADMAN",        act: "V",   rung: "Attention as a resource",     line: "The Guide cannot look at their friend and help them at the same time.", colour: C.yellow },
  { n: 18, name: "THE ECHO",           act: "V",   rung: "Latency, weaponised",         line: "The world is in the present tense. Your friend is not — the marker is four seconds old.", colour: C.cyan },
  { n: 19, name: "THE SHORT ROPE",     act: "V",   rung: "Shared load",                 line: "You are roped together, and the floor only bears one of you.", colour: C.red },
  { n: 20, name: "THE COUNTERWEIGHT",  act: "V",   rung: "Shared physics",              line: "The deck is a balance, and the two of you are the weights.", colour: C.green },
  { n: 21, name: "THE SOUNDING",       act: "VI",  rung: "The information inverts",     line: "The Blind knows something the Guide does not.", colour: C.cyan },
  { n: 22, name: "THE DYNAMO",         act: "VI",  rung: "Sight becomes a currency",    line: "The Blind decides when the Guide can see. Eight seconds at a time.", colour: C.yellow },
  { n: 23, name: "THE SURVEY",         act: "VI",  rung: "One bit per cell",            line: "Everything the Guide knows about this floor is something their friend told them.", colour: C.orange },
  { n: 24, name: "THE TRAIL",          act: "VI",  rung: "Order reverses",              line: "The Blind goes first. A cell holds the Guide only where their friend stood in the last five seconds.", colour: C.green },
  { n: 25, name: "THE CUTTING ROOM",   act: "VI",  rung: "Rhythm, one-way",             line: "A rhythm you have to learn, and no way to take a step back.", colour: C.red },
  { n: 26, name: "THE ANNEX",          act: "VI",  rung: "The map expires",             line: "The room you learned is not the room you have to leave. Exactly one wall stands in both.", colour: C.cyan },
  { n: 27, name: "THE STACKS",         act: "VI",  rung: "Mutual blindness",            line: "Neither of you can see what the other one can hear.", colour: C.toxic },
  { n: 28, name: "THE PATTERN",        act: "VI",  rung: "Continuous coupling",         line: "Be where I am, and never stop. The north deck holds you only while your friend stands opposite.", colour: C.yellow },
  { n: 29, name: "THE GALLERY",        act: "VI",  rung: "The last thing taken away",   line: "Twenty-eight floors took something from the Guide. This one takes the marker. One of those is your friend.", colour: C.orange },
  { n: 30, name: "THE ROOF",           act: "VI",  rung: "The terminus",                line: "Everything you learned is now in the way. Run.", colour: C.green },
];

export const PILLARS = [
  { n: 1, name: "COMMUNICATION",         line: "Players must communicate to succeed." },
  { n: 2, name: "ASYMMETRIC INFORMATION", line: "The two players should never experience exactly the same game." },
  { n: 3, name: "TRUST",                 line: "The Blind player must trust the Guide. The Guide must make good decisions." },
  { n: 4, name: "CHAOS",                 line: "Mistakes should create funny situations rather than simply frustration." },
  { n: 5, name: "STREAMABILITY",         line: "Funny clips, arguments, panic, clutch moments, memorable quotes." },
  { n: 6, name: "SHORT SESSIONS",        line: "3–10 minutes a round. Short enough that you immediately say “one more”." },
];

export const LADDER = [
  { rung: 1, gets: "naming a direction", eg: "“turn right”" },
  { rung: 2, gets: "naming a distance", eg: "“two metres from the wall”" },
  { rung: 3, gets: "naming a rhythm", eg: "“go on the third clank”" },
  { rung: 4, gets: "naming a pattern", eg: "“third from the left, then two forward”" },
  { rung: 5, gets: "naming something the Guide can also lose", eg: "“I can't see you — keep talking”" },
  { rung: 6, gets: "naming something language cannot say", eg: "a symmetric room, a stale map" },
];

export const LOOP = [
  { id: "LOBBY",     line: "both ready · host starts" },
  { id: "COUNTDOWN", line: "three" },
  { id: "PLAYING",   line: "find the key · carry it · unlock · both reach the exit" },
  { id: "RESULT",    line: "time · deaths · perks used · objective time" },
  { id: "SWAP",      line: "roles reverse · next floor" },
];

export const ARGUMENT = [
  { who: "guide", text: "Go left." },
  { who: "blind", text: "My left or your left?" },
  { who: "guide", text: "YOUR left." },
  { who: "blind", text: "Okay." },
  { who: "stage", text: "(turns right)" },
  { who: "guide", text: "NO." },
  { who: "blind", text: "You said left." },
  { who: "guide", text: "I MEANT YOUR OTHER LEFT." },
];

export const SHOTS = [
  { src: "/art/shot-gantry.webp", floor: "FLOOR 02", name: "FOUNDRY GANTRY", line: "Three decks. The problem is height and edges." },
  { src: "/art/shot-pit.webp",    floor: "FLOOR 06", name: "ACID YARD",      line: "Shelter is finite. The route between shelters is not short enough." },
  { src: "/art/shot-cryo.webp",   floor: "FLOOR 04", name: "CRYO VAULT",     line: "Near-zero friction. Every instruction must arrive one beat early." },
];
