// Guard data. Each guard is pure data: the fencer rig solves the body from `pose`.
// pose: lean = torso lean (px, + = toward opponent), front/back = foot x offset from hip,
//       hilt = crossguard position relative to the near shoulder (screen px, y down),
//       angle = blade direction in degrees (0 = point at opponent, 90 = straight up).
// plate: folio/plate reference — MUST be filled in and checked before the "Content lock" gate.
window.TRADITIONS = {
  german:  { label: "German longsword",  color: "#a3261d" },
  italian: { label: "Italian longsword", color: "#1f4e8c" },
};

// ---- Sources ----
// Plate images are only added once the guard is identified from the manuscript's own label/text.
const FIORE_GETTY = "Fiore dei Liberi, Fior di Battaglia (c. 1404–10), J. Paul Getty Museum, Ms. Ludwig XV 13";
const GETTY_CREDIT = "J. Paul Getty Museum, Ms. Ludwig XV 13 · Public domain (Getty Open Content)";
const MEYER_1570 = "Liechtenauer's four guards, as taught and illustrated by Joachim Meyer, Gründtliche Beschreibung der Kunst des Fechtens (1570)";
const MEYER_CREDIT = "Joachim Meyer (1570), woodcut by Tobias Stimmer's circle, hand-coloured copy · Leipzig University Library · Public domain";

// ---- Fencer looks ----
// Costume rosters drawn from the sources; each question picks a random fencer from its tradition's roster.
window.LOOKS = {
  // Fiore's Getty manuscript: pen-and-ink figures in plain white padded jackets and hose, bare-soled hose,
  // masters wearing gold crowns, scholars a gold garter below the left knee, many bearded.
  italian: {
    style: "fiore",
    source: "after the Getty Fior di Battaglia (c. 1404–10)",
    jackets: ["#f4ede0", "#efe6d3", "#f1e9da"],
    hair: ["#3b2a1d", "#5a3a22", "#2a211b", "#7a4a26"],
    crown: 0.6, beard: [0.35, 0.3, 0.35], // none / short / full
    garter: 1, // scholars (no crown) wear Fiore's gold garter below the left knee
    chaperone: 0.5, chapColors: ["#7e2620", "#2b2522", "#34466e", "#3f5a37", "#6b3550"], // half the scholars wear one
  },
  // Meyer's 1570 woodcuts (Tobias Stimmer's circle), hand-coloured copy: slashed doublets, ruffs,
  // puffed pluderhosen, coloured hose, flat black shoes, flat caps.
  german: {
    style: "meyer",
    source: "after Joachim Meyer, Gründtliche Beschreibung (1570)",
    jackets: ["#8e3b3b", "#3d3836", "#7d8fa8", "#b89a4a", "#6f8f6a", "#8a5a78", "#a8744a"],
    breeches: ["#d9b85c", "#c98a8a", "#9db0c6", "#8e3b3b", "#e3d6b0", "#7e9a72"],
    hose: ["#3a3532", "#7a2e2e", "#5b6b84", "#c9b48a", "#2f3a2c"],
    hair: ["#b88a4a", "#7a5230", "#4a3424", "#c9a66b"],
    cap: 0.3, ruff: 0.75, beard: [0.3, 0.35, 0.35],
  },
};

// Masters the player can pick from before a run. Each guard belongs to one master.
// Hall of Masters / Survival best only record runs with every master selected.
window.MASTERS = [
  { id: "liechtenauer", name: "Liechtenauer", tradition: "german" },
  { id: "fiore", name: "Fiore", tradition: "italian" },
];

window.GUARDS = [
  {
    id: "vom_tag", name: "Vom Tag", variants: ["vom dach", "vom tage", "tag", "dach", "oberhut", "hochhut", "day", "roof"],
    tradition: "german", master: "liechtenauer",
    source: MEYER_1570, plate: "sword plate C, left figure (Ch. 3, “Day”)",
    manuscript: { src: "assets/plates/vom_tag.jpg", credit: MEYER_CREDIT },
    tip: "Vom Tag: sword held up at the shoulder or high over the head, point up.",
  },
  {
    id: "ochs", name: "Ochs", variants: ["ochse", "ox"],
    tradition: "german", master: "liechtenauer",
    source: MEYER_1570, plate: "sword plate B, left figure (Ch. 3, “Ox”)",
    manuscript: { src: "assets/plates/ochs.jpg", credit: MEYER_CREDIT },
    tip: "Ochs: hilt high beside the head, point at the opponent's face.",
  },
  {
    id: "pflug", name: "Pflug", variants: ["pflueg", "pflüg", "plough", "plow"],
    tradition: "german", master: "liechtenauer",
    source: MEYER_1570, plate: "sword plate B, right figure (Ch. 3, “Plow”)",
    manuscript: { src: "assets/plates/pflug.jpg", credit: MEYER_CREDIT },
    tip: "Pflug: hilt beside the front knee, point rising at the opponent's face — a thrust from below.",
  },
  {
    id: "alber", name: "Alber", variants: ["olber", "fool"],
    tradition: "german", master: "liechtenauer",
    source: MEYER_1570, plate: "sword plate C, right figure (Ch. 3, “Fool”)",
    manuscript: { src: "assets/plates/alber.jpg", credit: MEYER_CREDIT },
    tip: "Alber: left foot forward, point on the ground in front of the forward foot.",
  },
  {
    id: "posta_di_donna", name: "Posta di Donna", variants: ["donna", "posta della donna", "posta di dona", "posta de donna", "posta di donna destra", "posta de donna destraza"],
    tradition: "italian", master: "fiore",
    source: FIORE_GETTY, plate: "fol. 23v, “Posta de donna destraza”",
    manuscript: { src: "assets/plates/posta_di_donna.jpg", credit: GETTY_CREDIT },
    tip: "Posta di Donna: sword over the right shoulder, blade running down behind your back.",
  },
  {
    id: "posta_di_finestra", name: "Posta di Finestra", variants: ["finestra", "fenestra", "posta di fenestra", "posta de fenestra"],
    tradition: "italian", master: "fiore",
    source: FIORE_GETTY, plate: "fol. 23v, “Posta de fenestra instabile”",
    manuscript: { src: "assets/plates/posta_di_finestra.jpg", credit: GETTY_CREDIT },
    tip: "Posta di Finestra: hands high, hilt at the temple, blade level toward the opponent — the 'window'.",
  },
  {
    id: "posta_longa", name: "Posta Longa", variants: ["longa", "posta lunga", "lunga"],
    tradition: "italian", master: "fiore",
    source: FIORE_GETTY, plate: "fol. 24r, “Posta longa instabile”",
    manuscript: { src: "assets/plates/posta_longa.jpg", credit: GETTY_CREDIT },
    tip: "Posta Longa: leaning in, arms fully extended, point rising toward the opponent's face.",
  },
  {
    id: "coda_longa", name: "Coda Longa", variants: ["coda lunga", "posta di coda longa", "posta di choda longa", "choda longa"],
    tradition: "italian", master: "fiore",
    source: FIORE_GETTY, plate: "fol. 24v, “Posta di choda longa stabile”",
    manuscript: { src: "assets/plates/coda_longa.jpg", credit: GETTY_CREDIT },
    tip: "Coda Longa: the 'long tail' — lunging forward, hilt low behind the rear hip, point trailing on the ground behind.",
  },
];

// Near-twins used for Master-tier wrong options.
// Near-twins used for Master-tier wrong options (similar-looking but genuinely different guards).
window.TWINS = [];
// Equivalent guards: the same position under another master's name. Either answer counts as correct,
// and the two never appear together as options. Edit this list to add or remove pairs.
window.EQUIVALENT = [
  ["langort", "posta_longa"],        // Longpoint: arms extended, point at the face
  ["ochs", "posta_di_finestra"],     // hilt high beside the head, point forward
  ["zornhut", "posta_di_donna"],     // sword on the shoulder, blade behind
  ["nebenhut", "coda_longa"],        // sword low at the side, point back on the ground
];

// ---- 3D poses ----
// Metres; +x toward the opponent, y up, +z = the fencer's right. See js/fencer3d.js for the fields.
// Fiore poses were checked against the Getty plates (fols 23v–24v); German poses follow the
// descriptions in Meyer 1570, Sword Ch. 3, checked against his plates B and C.
window.POSES3D = {
  vom_tag:           { lead: "left", stance: 1.00, width: 0.32, crouch: 0.20, shift: 0.05, turn: 30, twist: 5,  lean: 4,  hilt: [0.00, 1.82, 0.06], blade: [180, 55] },
  ochs:              { lead: "left", stance: 1.00, width: 0.30, crouch: 0.18, shift: 0.08, turn: 40, twist: 10, lean: 10, hilt: [0.22, 1.55, 0.22], blade: [-8, -12], poleL: [1, -0.3, -0.4] },
  pflug:             { lead: "right", stance: 1.15, width: 0.32, crouch: 0.26, shift: 0.15, turn: -10, twist: -20, lean: 30, hilt: [0.58, 0.80, -0.04], blade: [-5, 20], view: 150 },
  alber:             { lead: "left", stance: 1.00, width: 0.30, crouch: 0.20, shift: 0.10, turn: 10, twist: -25, lean: 35, hilt: [0.42, 0.62, 0.02], blade: [0, -40] },
  // posta_di_donna: right side reworked by the player in the stance editor (2026-11-19)
  posta_di_donna:    { lead: "right", stance: 0.65, width: 0.55, crouch: 0.20, shift: 0.17, turn: -16, twist: -35, lean: 20, sideLean: 26, hilt: [0.41, 1.37, 0.16], blade: [-165, -45], roll: -15, elbowR: 46, elbowL: 180 },
  posta_di_finestra: { lead: "left", stance: 1.00, width: 0.30, crouch: 0.16, shift: 0.08, turn: 40, twist: 5,  lean: 4,  hilt: [0.08, 1.66, 0.17], blade: [-6, 2] },
  posta_longa:       { lead: "left", stance: 1.05, width: 0.28, crouch: 0.14, shift: 0.15, turn: 15, twist: -30, lean: 25, hilt: [0.89, 1.22, 0.05], blade: [0, 25] },
  coda_longa:        { lead: "left", stance: 0.95, width: 0.28, crouch: 0.18, turn: 40, twist: 25, lean: 20, shift: 0.08, hilt: [-0.10, 0.72, 0.25], blade: [178, -35], poleL: [1, -0.4, 0.2], poleR: [0.2, -1, 0.6] },
};
for (const g of window.GUARDS) g.pose = window.POSES3D[g.id];

// ---- Left / right versions ----
// The poses above (and their plates) are the RIGHT-side versions: sword on the right side.
// A left version is the mirror image (right hand still at the cross, as for a right-hander)
// unless the source draws it differently, in which case it gets its own pose/plate/tip here.
window.SIDES = {
  vom_tag: { left: {} }, // modern HEMA practice; the sources only show the right side
  ochs: { left: {} },
  pflug: { left: {} },
  posta_di_donna: {
    left: {
      // Getty fol. 23v draws the left Donna differently: sword over the LEFT shoulder, blade level behind.
      // reworked by the player in the stance editor (2026-11-19)
      pose: { lead: "left", stance: 0.89, width: 0.30, crouch: 0.14, shift: 0.08, turn: 27, twist: -10, lean: 8, hilt: [0.30, 1.43, -0.08], blade: [-170, 4], elbowR: -71 },
      plate: "fol. 23v, “Posta di donna la senestra”",
      manuscript: { src: "assets/plates/posta_di_donna_left.jpg", credit: GETTY_CREDIT },
      tip: "Posta di Donna on the left: sword over the left shoulder, blade lying level behind you.",
    },
  },
  posta_di_finestra: { lead: "left", stance: 1.00, width: 0.30, crouch: 0.16, shift: 0.08, turn: 40, twist: 5,  lean: 4,  hilt: [0.08, 1.66, 0.17], blade: [-6, 2] },
  coda_longa: { left: {} },
};
for (const g of window.GUARDS) if (window.SIDES[g.id]) g.sides = window.SIDES[g.id];

// ---- Pose variants ----
// Extra right-side ways of holding the same guard; each question picks one (left versions mirror it).
// Vom Tag: Meyer shows it high over the head; modern HEMA also teaches it at the shoulder —
// hilt by the right shoulder, point up and back (Glossary of HEMA guards; Hroarr; Talhoffer blog).
window.POSE_VARIANTS = {
  vom_tag: [
    { lead: "left", stance: 1.00, width: 0.32, crouch: 0.18, shift: 0.05, turn: 40, twist: 10, lean: 4, hilt: [0.02, 1.46, 0.24], blade: [172, 72] },
    // "v2p" (version 2, player): designed by the player in the stance editor, 2026-11-19 — at the shoulder, blade back
    { lead: "left", stance: 1.00, width: 0.32, crouch: 0.20, shift: 0.05, turn: 30, twist: 5, lean: 4, hilt: [0.103, 1.50, 0.222], blade: [180, 66] },
  ],
};
for (const g of window.GUARDS) g.poses = [g.pose].concat(window.POSE_VARIANTS[g.id] || []);

// Left versions drawn separately for a particular variant (index into g.poses); other variants mirror.
window.LEFT_VARIANTS = {
  // "v2p" left: designed by the player — right foot forward, hilt by the left shoulder, blade straight up
  vom_tag: { 2: { lead: "right", stance: 1.00, width: 0.32, crouch: 0.20, shift: 0.05, turn: -30, twist: -5, lean: 4, hilt: [0.14, 1.38, -0.154], blade: [10, 90] } },
};
for (const g of window.GUARDS) {
  g.leftPoses = {};
  if (g.sides && g.sides.left && g.sides.left.pose) g.leftPoses[0] = g.sides.left.pose;
  Object.assign(g.leftPoses, window.LEFT_VARIANTS[g.id] || {});
}
// The pose for a guard, side and variant: a separately drawn left version if there is one, else the mirror.
window.guardPose = (g, side, vi = 0) => {
  const base = (g.poses || [g.pose])[vi % (g.poses || [g.pose]).length];
  return side === "left" ? (g.leftPoses && g.leftPoses[vi]) || Fencer3D.mirrorPose(base) : base;
};

// ---- Meyer's own guards (1570, Sword Ch. 3) ----
// Descriptions follow Meyer's text (Garber 2023 / Rasmusson 2003 translations on Wiktenauer).
// Plates (images) are only Meyer's own woodcuts, attached where his text names the plate and the figure (or it is the only
// fencer in that guard there, or a cited reference source identifies the figure). Other sources' images are
// never shipped in the app. Nebenhut has no plate.
const MEYER_OWN = "Joachim Meyer, Gründtliche Beschreibung der Kunst des Fechtens (1570), Sword Ch. 3";
window.MASTERS.push({ id: "meyer", name: "Meyer", tradition: "german" });
const meyerGuard = (id, name, variants, plate, plateSrc, tip, pose, sides = true) => ({
  id, name, variants, tradition: "german", master: "meyer", source: MEYER_OWN, plate,
  manuscript: plateSrc ? { src: "assets/plates/" + plateSrc + ".jpg", credit: MEYER_CREDIT } : undefined,
  tip, pose, poses: [pose], sides: sides ? { left: {} } : undefined,
});
window.GUARDS.push(
  meyerGuard("zornhut", "Zornhut", ["zorn hut", "zornhuet", "wrath guard", "wrath"],
    "sword plate E, left figure (Meyer: “see Figure E”; figure identified by HEMA 101, Meyer's Longsword 101, Ch. 1–4; also Jakob Sutor 1612, p. 13, “die Zornhut”)", "zornhut",
    "Zornhut: left foot forward, sword on the right shoulder, blade hanging down behind you.",
    { lead: "left", stance: 1.00, width: 0.30, crouch: 0.16, shift: 0.06, turn: 45, twist: 10, lean: 6, hilt: [-0.05, 1.42, 0.24], blade: [185, -50], poleL: [1, -0.5, 0.3] }),
  meyerGuard("langort", "Langort", ["langenort", "langer ort", "long point", "longpoint"],
    "sword plate A, right figure (Ch. 3, “Longpoint”; the figure is not named — the only fencer in Longpoint)", "langort",
    "Langort: left foot forward, arms stretched out in front of the face, point at the opponent's face.",
    { lead: "left", stance: 1.00, width: 0.28, crouch: 0.14, shift: 0.10, turn: 15, twist: -30, lean: 15, hilt: [0.75, 1.45, 0.03], blade: [0, 5] }, false),
  meyerGuard("wechsel", "Wechsel", ["wechselhut", "change", "change guard"],
    "sword plate D, right figure (Ch. 3, “Change”)", "wechsel",
    "Wechsel: right foot forward, point down to the ground beside you, short edge toward the opponent.",
    { lead: "right", stance: 1.05, width: 0.32, crouch: 0.20, shift: 0.06, turn: -20, twist: 30, lean: 14, hilt: [0.04, 0.80, 0.28], blade: [170, -70] }),
  meyerGuard("nebenhut", "Nebenhut", ["neben hut", "nebenhuet", "side guard"],
    "no plate in Meyer 1570; pose reference: HEMA 101, Meyer's Longsword 101, Ch. 1–4", null,
    "Nebenhut: left foot forward, sword beside the right side, pommel up.",
    { lead: "left", stance: 1.00, width: 0.30, crouch: 0.20, shift: 0.10, turn: 40, twist: 10, lean: 15, hilt: [0.02, 0.72, 0.30], blade: [188, -45] }),
  meyerGuard("eisenport", "Eisenport", ["eisenpforte", "eisen port", "iron gate", "iron door"],
    "rapier plate C, right figure (Meyer refers to his rapier section; figure identified by HEMA 101, Meyer's Longsword 101, Ch. 1–4)", "eisenport",
    "Eisenport: right foot forward, wide and low, arms hanging straight, hilt before the knee, point up at the face.",
    { lead: "right", stance: 1.05, width: 0.32, crouch: 0.26, shift: 0.05, turn: -10, twist: 20, lean: 25, hilt: [0.30, 0.70, 0.06], blade: [0, 28] }),
  meyerGuard("schrankhut", "Schrankhut", ["schranckhut", "schrank hut", "barrier guard", "crossed guard"],
    "sword plate F, left figure (Ch. 3, “Crossed Guard”; the right figure is Hanging Point)", "schrankhut",
    "Schrankhut: hands crossed in front of you, point down on the ground.",
    { lead: "left", stance: 1.05, width: 0.32, crouch: 0.22, shift: 0.10, turn: 30, twist: 10, lean: 28, hilt: [0.30, 0.80, -0.18], blade: [-25, -50], poleR: [0.6, -1, 0.2] }),
  meyerGuard("hangetort", "Hangetort", ["hengetort", "hangender ort", "hanging point"],
    "sword plate F, right figure (Ch. 3, “Hanging Point”)", "hangetort",
    "Hangetort: right foot forward, arms stretched out before the face, blade hanging down toward the opponent.",
    { lead: "right", stance: 1.05, width: 0.30, crouch: 0.20, shift: 0.08, turn: -10, twist: 20, lean: 12, hilt: [0.52, 1.50, 0.05], blade: [0, -35] }),
  meyerGuard("schluessel", "Schlüssel", ["schlussel", "schluessel", "key"],
    "sword plate D, left figure (Ch. 3, “Key”)", "schluessel",
    "Schlüssel: left foot forward, crossed hands before the chest, blade on the left arm, point at the face.",
    { lead: "left", stance: 1.00, width: 0.30, crouch: 0.14, shift: 0.06, turn: 35, twist: 5, lean: 8, hilt: [0.20, 1.24, 0.14], blade: [-22, 8], poleR: [0.1, -0.5, 1], poleL: [0.3, -1, -0.6] }),
  meyerGuard("einhorn", "Einhorn", ["ainhorn", "unicorn"],
    "sword plate E, right figure (Ch. 3, “Unicorn”)", "einhorn",
    "Einhorn: left foot forward, crossed hands lifted up to the right, point out and upward.",
    { lead: "left", stance: 1.00, width: 0.30, crouch: 0.14, shift: 0.06, turn: 35, twist: 5, lean: 4, hilt: [0.15, 1.75, 0.30], blade: [-10, 45] }),
);
window.TWINS.push(["eisenport", "pflug"],
  ["hangetort", "ochs"], ["schrankhut", "alber"], ["wechsel", "coda_longa"], ["nebenhut", "wechsel"]);

// ---- Which sides are used ----
// By default a guard uses its right side, plus its left side if it has one (g.sides.left).
// The stance editor can switch either side off (or turn a mirrored left side on); those choices
// arrive as g.sideUse = { right, left } from js/pose-edits.js. At least one side is always used.
window.sidesUsedOf = (g) => {
  const u = g.sideUse || { right: true, left: !!(g.sides && g.sides.left) };
  const out = ["right", "left"].filter((s) => u[s]);
  return out.length ? out : ["right"];
};

// ---- Player edits from the stance editor (baked in 2026-11-19 from stance-off-poses (1).json) ----
// These were posed by the player against the plates and replace the poses above. Side settings
// (kind: "sides") switch a guard's left or right side off. Applied last, so they win.
window.BAKED_EDITS = [
  { guard: "vom_tag", side: "left", vi: 2, pose: {lead: "right", stance: 0.92, width: 0.32, crouch: 0.13, shift: 0.05, turn: -30, twist: -5, lean: 4, hilt: [0.14, 1.406, -0.162], blade: [10, 90], roll: 114} }, // Vom Tag (left) v3
  { guard: "vom_tag", side: "left", vi: 1, pose: {lead: "right", stance: 0.85, width: 0.32, crouch: 0.13, shift: 0.05, turn: -40, twist: -10, lean: 4, hilt: [0.19, 1.456, -0.201], blade: [-172, 72]} }, // Vom Tag (left) v2
  { guard: "vom_tag", side: "right", vi: 0, pose: {lead: "left", stance: 0.96, width: 0.32, crouch: 0.18, shift: 0.05, turn: 30, twist: 5, lean: 4, hilt: [0.013, 1.77, 0.053], blade: [180, 35]} }, // Vom Tag (right) v1
  { guard: "vom_tag", side: "left", vi: 0, pose: {lead: "right", stance: 0.96, width: 0.32, crouch: 0.18, shift: 0.05, turn: -30, twist: -5, lean: 4, hilt: [0.053, 1.77, -0.043], blade: [-180, 36], roll: -1} }, // Vom Tag (left) v1
  { guard: "vom_tag", side: "right", vi: 1, pose: {lead: "left", stance: 0.96, width: 0.32, crouch: 0.13, shift: 0.05, turn: 40, twist: 10, lean: 4, hilt: [0.11, 1.45, 0.24], blade: [172, 73], elbowR: 23, roll: 30} }, // Vom Tag (right) v2
  { guard: "pflug", side: "left", vi: 0, pose: {lead: "right", stance: 1.15, width: 0.32, crouch: 0.26, shift: 0.15, turn: -10, twist: -20, lean: 30, hilt: [0.58, 0.8, -0.04], blade: [-5, 20], view: 150, roll: 55} }, // Pflug (right) — swapped to the left side at the player's request
  { guard: "pflug", side: "right", vi: 0, pose: {lead: "left", stance: 0.64, width: 0.32, crouch: 0.13, shift: 0.11, turn: -19, twist: 20, lean: 30, hilt: [0.62, 0.852, 0.022], blade: [5, 20], view: 150} }, // Pflug (left) — swapped to the right side at the player's request
  { guard: "alber", side: "right", vi: 0, pose: {lead: "left", stance: 0.86, width: 0.3, crouch: 0.16, shift: 0.1, turn: 10, twist: -25, lean: 35, hilt: [0.598, 0.72, -0.005], blade: [0, -32]} }, // Alber (right)
  { guard: "posta_longa", side: "right", vi: 0, pose: {lead: "left", stance: 0.79, width: 0.28, crouch: 0.14, shift: 0.15, turn: 15, twist: -30, lean: 17, hilt: [0.87, 1.22, 0.05], blade: [-11, 25]} }, // Posta Longa (right)
  { guard: "coda_longa", side: "right", vi: 0, pose: {lead: "left", stance: 0.95, width: 0.28, crouch: 0.18, turn: 40, twist: 25, lean: 20, shift: 0.08, hilt: [-0.1, 0.72, 0.25], blade: [178, -35], poleL: [1, -0.4, 0.2], poleR: [0.2, -1, 0.6], elbowR: 144} }, // Coda Longa (right)
  { guard: "zornhut", kind: "sides", right: true, left: false }, // Sides used: Zornhut
  { guard: "zornhut", side: "right", vi: 0, pose: {lead: "left", stance: 1, width: 0.3, crouch: 0.37, shift: -0.18, turn: 90, twist: 12, lean: 23, hilt: [-0.452, 1.142, 0.096], blade: [-38, -21], poleL: [1, -0.5, 0.3], footRFwd: -0.03, footRSide: 0.05, footRTurn: 90, footLTurn: -50, sideLean: 18, elbowR: 39, elbowL: 25, roll: 5, headTurn: -14, headNod: -14, headLean: -6} }, // Zornhut (right)
  { guard: "langort", side: "right", vi: 0, pose: {lead: "left", stance: 1, width: 0.28, crouch: 0.14, shift: 0.1, turn: 15, twist: -30, lean: 15, hilt: [0.82, 1.19, -0.02], blade: [-5, 5]} }, // Langort (right)
  { guard: "wechsel", kind: "sides", right: true, left: false }, // Sides used: Wechsel
  { guard: "wechsel", side: "right", vi: 0, pose: {lead: "right", stance: 0.87, width: 0.32, crouch: 0.25, shift: 0.22, turn: -20, twist: -35, lean: 15, hilt: [0.29, 0.822, -0.31], blade: [-91, -63], footLTurn: 50, sideLean: 19, roll: 15, headNod: -17} }, // Wechsel (right)
  { guard: "nebenhut", kind: "sides", right: true, left: false }, // Sides used: Nebenhut
  // the player's Nebenhut (right) pose, moved to Eisenport as its second variant at the player's request
  { guard: "eisenport", side: "right", vi: 1, pose: {lead: "left", stance: 0.76, width: 0.34, crouch: 0.22, shift: 0.2, turn: 40, twist: -9, lean: 20, hilt: [0.74, 0.997, 0.17], blade: [-36, -62], kneeL: 2, kneeR: 34, sideLean: -1, elbowL: -75, elbowR: -151, roll: -61} }, // was Nebenhut (right)
  { guard: "schrankhut", kind: "sides", right: true, left: false }, // Sides used: Schrankhut
  { guard: "schluessel", side: "right", vi: 0, pose: {lead: "left", stance: 0.8, width: 0.57, crouch: 0.14, shift: 0.06, turn: 35, twist: 51, lean: 8, hilt: [0.19, 1.31, 0.15], blade: [-22, 1], poleR: [0.1, -0.5, 1], poleL: [0.3, -1, -0.6], elbowL: 68, elbowR: 21, headTurn: -33} }, // Schlüssel (right)
  { guard: "schluessel", kind: "sides", right: true, left: false }, // Sides used: Schlüssel
  { guard: "einhorn", side: "right", vi: 0, pose: {lead: "left", stance: 1, width: 0.3, crouch: 0.14, shift: 0.06, turn: 35, twist: 34, lean: 4, hilt: [0.337, 1.578, 0.152], blade: [-40, 23]} }, // Einhorn (right)
  { guard: "einhorn", kind: "sides", right: true, left: false }, // Sides used: Einhorn
  { guard: "ochs", side: "right", vi: 0, pose: {lead: "left", stance: 1, width: 0.3, crouch: 0.18, shift: 0.08, turn: 40, twist: 10, lean: 10, hilt: [0.37, 1.49, 0.22], blade: [-35, -12], poleL: [1, -0.3, -0.4], elbowL: -47, elbowR: -81, roll: 90} }, // Ochs (right)
  { guard: "ochs", side: "left", vi: 0, pose: {lead: "right", stance: 1, width: 0.3, crouch: 0.18, shift: 0.08, turn: -40, twist: -10, lean: 10, hilt: [0.34, 1.54, -0.22], blade: [8, -12], roll: 90, poleR: [1, -0.3, 0.4], elbowR: 63, elbowL: 77} }, // Ochs (left)
  // left Wechsel (the mirror of the right Wechsel above), now Nebenhut's pose (its earlier pose moved to Eisenport)
  { guard: "nebenhut", side: "right", vi: 0, pose: {lead: "left", stance: 0.87, width: 0.32, crouch: 0.25, shift: 0.22, turn: 20, twist: 35, lean: 15, hilt: [0.29, 0.822, 0.31], blade: [91, -63], footRTurn: 50, sideLean: -19, roll: -15, headNod: -17} },
];
for (const e of window.BAKED_EDITS) {
  const g = window.GUARDS.find((x) => x.id === e.guard);
  if (!g) continue;
  if (e.kind === "sides") { g.sideUse = { right: !!e.right, left: !!e.left }; continue; }
  g.poses = g.poses || [g.pose];
  if (e.side === "left") {
    (g.leftPoses = g.leftPoses || {})[e.vi] = e.pose;
    if (!e.vi && g.sides && g.sides.left) g.sides.left.pose = e.pose;
  } else {
    g.poses[e.vi] = e.pose;
    if (!e.vi) g.pose = e.pose;
  }
}

// ---- Fiore's remaining guards (the 12 longsword guards, Getty Ms. Ludwig XV 13, fols 23v–24v) ----
// Posed from Fiore's own drawings (checked joint by joint); list of the 12 after Guy Windsor / School of
// European Swordsmanship wiki. Already built above: Posta di Donna (+ "la sinestra" = its left side),
// Posta di Finestra, Posta Longa, Coda Longa. (Dente di Zenghiaro Mezano was added as a Dente variant, then removed
// at the player's request on 2026-11-19.)
// Each is drawn on one side only.
(function () {
  const fiore = (id, name, variants, plate, plateSrc, tip, pose) => ({
    id, name, variants, tradition: "italian", master: "fiore", source: FIORE_GETTY, plate,
    manuscript: { src: "assets/plates/" + plateSrc + ".jpg", credit: GETTY_CREDIT },
    tip, pose, poses: [pose], sideUse: { right: true, left: false },
  });
  window.GUARDS.push(
    fiore("tutta_porta_di_ferro", "Tutta Porta di Ferro", ["porta di ferro", "tutta porta", "posta di porta di ferro", "full iron gate", "whole iron door"],
      "fol. 23v, “Porta di ferro pulsativa”", "tutta_porta_di_ferro",
      "Tutta Porta di Ferro: the 'full iron gate' — arms hanging, hands low in the middle, point down to the ground in front.",
      { lead: "left", stance: 1.05, width: 0.26, crouch: 0.20, shift: 0.08, turn: 30, twist: 0, lean: 8, hilt: [0.18, 0.68, 0.02], blade: [0, -48] }),
    fiore("porta_di_ferro_mezana", "Porta di Ferro Mezana", ["mezana porta di ferro", "mezza porta di ferro", "porta di ferro mezzana", "mezza porta", "middle iron gate"],
      "fol. 24r, “Porta di ferro mezana / stabile”", "porta_di_ferro_mezana",
      "Porta di Ferro Mezana: the 'middle iron gate' — hilt by the front hip, point forward and down toward the ground.",
      { lead: "right", stance: 1.10, width: 0.30, crouch: 0.18, shift: 0.10, turn: -20, twist: -30, lean: 8, hilt: [0.26, 0.80, 0.12], blade: [0, -42], view: 160 }),
    fiore("posta_breve", "Posta Breve", ["breve", "short guard"],
      "fol. 24r, “Posta breve stabile”", "posta_breve",
      "Posta Breve: the 'short guard' — hilt drawn in at the belly, elbows back, point straight at the opponent.",
      { lead: "left", stance: 1.05, width: 0.26, crouch: 0.16, shift: 0.12, turn: 30, twist: 0, lean: 8, hilt: [0.34, 1.02, 0.06], blade: [0, 14] }),
    fiore("dente_di_zenghiaro", "Dente di Zenghiaro", ["dente di cinghiale", "dente di cenghiaro", "dente zenghiaro", "zenghiaro", "dente", "boar's tooth", "boars tooth"],
      "fol. 24r, “Dente di cenghiaro stabile”", "dente_di_zenghiaro",
      "Dente di Zenghiaro: the 'boar's tooth' — hilt low by the left hip, point down and forward, ready to thrust upward.",
      { lead: "right", stance: 1.05, width: 0.32, crouch: 0.20, shift: 0.08, turn: -30, twist: 30, lean: 10, hilt: [0.12, 0.88, -0.20], blade: [8, -48], poleR: [1, -0.5, 0.3], view: 130 }),
    fiore("posta_di_bicorno", "Posta di Bicorno", ["bicorno", "bichorno", "posta di bichorno", "two-horned guard", "two horned guard"],
      "fol. 24v, “Posta di Bichorno instabile”", "posta_di_bicorno",
      "Posta di Bicorno: the 'two-horned guard' — hands drawn in before the chest, point raised along the centre line.",
      { lead: "left", stance: 1.15, width: 0.26, crouch: 0.18, shift: 0.12, turn: 25, twist: 0, lean: 2, hilt: [0.50, 1.34, 0.00], blade: [0, 38], view: 155 }),
    fiore("posta_frontale", "Posta Frontale", ["frontale", "posta frontale ditta corona", "corona", "posta di corona", "crown guard", "crown"],
      "fol. 24v, “Posta frontale ditta corona instabile”", "posta_frontale",
      "Posta Frontale (Corona): hands before the forehead, blade upright — the 'crown'.",
      { lead: "left", stance: 1.00, width: 0.26, crouch: 0.14, shift: 0.10, turn: 25, twist: 0, lean: 10, hilt: [0.50, 1.58, 0.05], blade: [0, 78] }),
  );
})();

// Nebenhut has no plate in Meyer 1570, and what it looked like was unclear even then. The player chose this
// manuscript drawing (captioned "Stand beid in der hut") as the version people can agree on.
(function () {
  const neb = window.GUARDS.find((g) => g.id === "nebenhut");
  neb.manuscript = { src: "assets/plates/nebenhut.jpg", credit: "Medieval German fencing manuscript, “Stand beid in der hut” · chosen as the agreed picture of Nebenhut" };
  neb.plate = "no plate in Meyer 1570; plate shown is a medieval German fencing manuscript drawing (“Stand beid in der hut”)";
})();

// ---- Player edits, second batch (baked 2026-11-19 from stance-off-poses (2).json, all 49 saved items) ----
// Applied after everything above, in the order they were saved, exactly as the stance editor applied them in
// the player's browser: replace a pose, add a variant, set the sides used, or switch a guard on/off.
window.BAKED_EDITS_2 = [
  {"name":"Vom Tag (left) v3","saved":"2026-11-19T01:04:11.408Z","guard":"vom_tag","side":"left","vi":2,"pose":{"lead":"right","stance":0.92,"width":0.32,"crouch":0.13,"shift":0.05,"turn":-30,"twist":-5,"lean":4,"hilt":[0.14,1.406,-0.162],"blade":[10,90],"roll":114}},
  {"name":"Vom Tag (right) v1","saved":"2026-11-19T01:12:31.733Z","guard":"vom_tag","side":"right","vi":0,"pose":{"lead":"left","stance":0.96,"width":0.32,"crouch":0.18,"shift":0.05,"turn":30,"twist":5,"lean":4,"hilt":[0.013,1.77,0.053],"blade":[180,35]}},
  {"name":"Vom Tag (left) v1","saved":"2026-11-19T01:14:41.397Z","guard":"vom_tag","side":"left","vi":0,"pose":{"lead":"right","stance":0.96,"width":0.32,"crouch":0.18,"shift":0.05,"turn":-30,"twist":-5,"lean":4,"hilt":[0.053,1.77,-0.043],"blade":[-180,36],"roll":-1,"elbowR":0,"elbowL":0,"sideLean":0,"headTurn":0,"headNod":0,"headLean":0}},
  {"name":"Pflug (left)","saved":"2026-11-19T01:18:08.338Z","guard":"pflug","side":"left","vi":0,"pose":{"lead":"left","stance":0.64,"width":0.32,"crouch":0.13,"shift":0.11,"turn":-19,"twist":20,"lean":30,"hilt":[0.62,0.852,0.022],"blade":[5,20],"view":150,"roll":0,"elbowR":0,"elbowL":0,"sideLean":0,"headTurn":0,"headNod":0,"headLean":0}},
  {"name":"Alber (right)","saved":"2026-11-19T01:19:11.573Z","guard":"alber","side":"right","vi":0,"pose":{"lead":"left","stance":0.86,"width":0.3,"crouch":0.16,"shift":0.1,"turn":10,"twist":-25,"lean":35,"hilt":[0.598,0.72,-0.005],"blade":[0,-32]}},
  {"name":"Posta Longa (right)","saved":"2026-11-19T01:22:01.007Z","guard":"posta_longa","side":"right","vi":0,"pose":{"lead":"left","stance":0.79,"width":0.28,"crouch":0.14,"shift":0.15,"turn":15,"twist":-30,"lean":17,"hilt":[0.87,1.22,0.05],"blade":[-11,25]}},
  {"name":"Coda Longa (right)","saved":"2026-11-19T01:22:33.068Z","guard":"coda_longa","side":"right","vi":0,"pose":{"lead":"left","stance":0.95,"width":0.28,"crouch":0.18,"turn":40,"twist":25,"lean":20,"shift":0.08,"hilt":[-0.1,0.72,0.25],"blade":[178,-35],"poleL":[1,-0.4,0.2],"poleR":[0.2,-1,0.6],"elbowR":144}},
  {"name":"Zornhut (right)","saved":"2026-11-19T01:35:34.442Z","guard":"zornhut","side":"right","vi":0,"pose":{"lead":"left","stance":1,"width":0.3,"crouch":0.37,"shift":-0.18,"turn":90,"twist":12,"lean":23,"hilt":[-0.452,1.142,0.096],"blade":[-38,-21],"poleL":[1,-0.5,0.3],"footRFwd":-0.03,"footRSide":0.05,"footRTurn":90,"footLTurn":-50,"sideLean":18,"elbowR":39,"elbowL":25,"roll":5,"headTurn":-14,"headNod":-14,"headLean":-6}},
  {"name":"Langort (right)","saved":"2026-11-19T01:36:28.446Z","guard":"langort","side":"right","vi":0,"pose":{"lead":"left","stance":1,"width":0.28,"crouch":0.14,"shift":0.1,"turn":15,"twist":-30,"lean":15,"hilt":[0.82,1.19,-0.02],"blade":[-5,5]}},
  {"name":"Sides used: Wechsel","saved":"2026-11-19T01:42:13.563Z","guard":"wechsel","kind":"sides","right":true,"left":false},
  {"name":"Wechsel (right)","saved":"2026-11-19T01:42:39.663Z","guard":"wechsel","side":"right","vi":0,"pose":{"lead":"right","stance":0.87,"width":0.32,"crouch":0.25,"shift":0.22,"turn":-20,"twist":-35,"lean":15,"hilt":[0.29,0.822,-0.31],"blade":[-91,-63],"footLTurn":50,"sideLean":19,"roll":15,"headNod":-17}},
  {"name":"Sides used: Nebenhut","saved":"2026-11-19T02:07:11.927Z","guard":"nebenhut","kind":"sides","right":true,"left":false},
  {"name":"Sides used: Schrankhut","saved":"2026-11-19T02:28:19.471Z","guard":"schrankhut","kind":"sides","right":true,"left":false},
  {"name":"Schlüssel (right)","saved":"2026-11-19T02:32:38.296Z","guard":"schluessel","side":"right","vi":0,"pose":{"lead":"left","stance":0.8,"width":0.57,"crouch":0.14,"shift":0.06,"turn":35,"twist":51,"lean":8,"hilt":[0.19,1.31,0.15],"blade":[-22,1],"poleR":[0.1,-0.5,1],"poleL":[0.3,-1,-0.6],"elbowL":68,"elbowR":21,"headTurn":-33}},
  {"name":"Sides used: Schlüssel","saved":"2026-11-19T02:33:26.913Z","guard":"schluessel","kind":"sides","right":true,"left":false},
  {"name":"Sides used: Einhorn","saved":"2026-11-19T02:40:34.898Z","guard":"einhorn","kind":"sides","right":true,"left":false},
  {"name":"Ochs (right)","saved":"2026-11-19T02:46:12.843Z","guard":"ochs","side":"right","vi":0,"pose":{"lead":"left","stance":1,"width":0.3,"crouch":0.18,"shift":0.08,"turn":40,"twist":10,"lean":10,"hilt":[0.37,1.49,0.22],"blade":[-35,-12],"poleL":[1,-0.3,-0.4],"elbowL":-47,"elbowR":-81,"roll":90}},
  {"name":"Ochs (left)","saved":"2026-11-19T02:49:03.468Z","guard":"ochs","side":"left","vi":0,"pose":{"lead":"right","stance":1,"width":0.3,"crouch":0.18,"shift":0.08,"turn":-40,"twist":-10,"lean":10,"hilt":[0.34,1.54,-0.22],"blade":[8,-12],"roll":90,"poleR":[1,-0.3,0.4],"elbowR":63,"elbowL":77,"sideLean":0,"headTurn":0,"headNod":0,"headLean":0,"kneeR":0,"kneeL":0,"footLFwd":0,"footRFwd":0,"footLSide":0,"footRSide":0,"footLTurn":0,"footRTurn":0}},
  {"name":"Vom Tag (right) v3","saved":"2026-11-19T03:02:28.387Z","guard":"vom_tag","side":"right","vi":2,"pose":{"lead":"left","stance":1,"width":0.32,"crouch":0.2,"shift":0.05,"turn":30,"twist":5,"lean":4,"hilt":[0.183,1.707,0.12],"blade":[180,36],"roll":90,"elbowL":49}},
  {"name":"Vom Tag (left) v2","saved":"2026-11-19T03:03:29.198Z","guard":"vom_tag","side":"left","vi":1,"pose":{"lead":"right","stance":0.85,"width":0.32,"crouch":0.13,"shift":0.05,"turn":-40,"twist":-10,"lean":4,"hilt":[0.19,1.456,-0.201],"blade":[-172,72],"elbowR":0,"elbowL":0,"sideLean":0,"headTurn":0,"headNod":0,"headLean":0}},
  {"name":"Posta di Donna (left)","saved":"2026-11-19T03:10:39.140Z","guard":"posta_di_donna","side":"left","vi":0,"pose":{"lead":"left","stance":0.89,"width":0.3,"crouch":0.14,"shift":0.08,"turn":27,"twist":-10,"lean":8,"hilt":[0.3,1.43,-0.08],"blade":[-170,4],"elbowR":-71,"headTurn":80}},
  {"name":"Posta di Donna (right)","saved":"2026-11-19T03:12:06.801Z","guard":"posta_di_donna","side":"right","vi":0,"pose":{"lead":"right","stance":0.65,"width":0.55,"crouch":0.2,"shift":0.17,"turn":-16,"twist":-35,"lean":20,"sideLean":26,"hilt":[0.398,1.41,0.119],"blade":[-166,-43],"roll":-15,"elbowR":46,"elbowL":180,"headTurn":-59,"footRTurn":33}},
  {"name":"Posta di Finestra (right)","saved":"2026-11-19T03:15:11.320Z","guard":"posta_di_finestra","side":"right","vi":0,"pose":{"lead":"left","stance":1,"width":0.3,"crouch":0.16,"shift":-0.12,"turn":90,"twist":27,"lean":11,"hilt":[-0.194,1.515,0.25],"blade":[-6,2],"footRFwd":0.05,"footRSide":-0.02,"footRTurn":90,"footLTurn":-60,"footLSide":-0.1,"footLFwd":-0.04,"elbowR":1}},
  {"name":"Sides used: Coda Longa","saved":"2026-11-19T03:18:49.746Z","guard":"coda_longa","kind":"sides","right":true,"left":false},
  {"name":"Coda Longa (left)","saved":"2026-11-19T03:19:24.659Z","guard":"coda_longa","side":"left","vi":0,"pose":{"lead":"right","stance":0.95,"width":0.28,"crouch":0.18,"turn":-52,"twist":-11,"lean":20,"shift":0.08,"hilt":[-0.04,0.827,-0.203],"blade":[-178,-35],"poleL":[0.2,-1,-0.6],"poleR":[1,-0.4,-0.2],"elbowR":-4,"roll":0,"elbowL":-89,"sideLean":0,"headTurn":0,"headNod":0,"headLean":0,"kneeR":0,"kneeL":0,"footLFwd":0,"footRFwd":0,"footLSide":0,"footRSide":0,"footLTurn":0,"footRTurn":0}},
  {"name":"Vom Tag (right) v2","saved":"2026-11-19T03:33:26.422Z","guard":"vom_tag","side":"right","vi":1,"pose":{"lead":"left","stance":0.6,"width":0.32,"crouch":0.08,"shift":0.05,"turn":40,"twist":10,"lean":4,"hilt":[0.18,1.51,0.17],"blade":[172,86],"elbowR":1,"elbowL":-5}},
  {"name":"Pflug (right) v2","saved":"2026-11-19T03:45:42.502Z","guard":"pflug","side":"right","addVariant":true,"pose":{"lead":"right","stance":1.15,"width":0.32,"crouch":0.26,"shift":0.15,"turn":-10,"twist":-20,"lean":30,"hilt":[0.68,0.72,-0.04],"blade":[8,20],"view":150,"roll":55}},
  {"name":"Pflug (left) v2","saved":"2026-11-19T03:47:35.541Z","guard":"pflug","side":"left","vi":1,"pose":{"lead":"left","stance":0.97,"width":0.32,"crouch":0.26,"shift":0.15,"turn":10,"twist":20,"lean":30,"hilt":[0.58,0.8,0.15],"blade":[-2,20],"view":150,"roll":-55,"elbowR":0,"elbowL":0,"sideLean":0,"headTurn":0,"headNod":0,"headLean":0,"kneeR":0,"kneeL":0,"footLFwd":0,"footRFwd":0,"footLSide":0,"footRSide":0,"footLTurn":0,"footRTurn":0}},
  {"name":"Alber (left)","saved":"2026-11-19T03:48:09.817Z","guard":"alber","side":"left","vi":0,"pose":{"lead":"right","stance":0.86,"width":0.3,"crouch":0.16,"shift":0.1,"turn":-10,"twist":-1,"lean":35,"hilt":[0.598,0.72,0.005],"blade":[0,-32],"roll":0,"elbowR":0,"elbowL":0,"sideLean":0,"headTurn":0,"headNod":0,"headLean":0,"kneeR":0,"kneeL":0,"footLFwd":0,"footRFwd":0,"footLSide":0,"footRSide":0,"footLTurn":0,"footRTurn":0}},
  {"name":"Used in the game: Nebenhut","saved":"2026-11-19T03:53:03.963Z","guard":"nebenhut","kind":"use","used":true},
  {"name":"Sides used: Zornhut","saved":"2026-11-19T04:03:25.696Z","guard":"zornhut","kind":"sides","right":true,"left":false},
  {"name":"Sides used: Eisenport","saved":"2026-11-19T04:07:13.335Z","guard":"eisenport","kind":"sides","right":true,"left":false},
  {"name":"Nebenhut (right)","saved":"2026-11-19T04:09:58.236Z","guard":"nebenhut","side":"right","vi":0,"pose":{"lead":"left","stance":0.87,"width":0.32,"crouch":0.25,"shift":0.22,"turn":20,"twist":35,"lean":15,"hilt":[0.29,0.822,0.31],"blade":[121,-55],"footRTurn":50,"sideLean":-19,"roll":-8,"headNod":-17}},
  {"name":"Used in the game: Eisenport","saved":"2026-11-19T04:18:03.976Z","guard":"eisenport","kind":"use","used":false},
  {"name":"Nebenhut (right) v2","saved":"2026-11-19T04:29:46.489Z","guard":"nebenhut","side":"right","addVariant":true,"pose":{"lead":"left","stance":0.87,"width":0.32,"crouch":0.25,"shift":0.22,"turn":20,"twist":35,"lean":15,"hilt":[0.29,0.822,0.31],"blade":[144,-19],"footRTurn":50,"sideLean":-19,"roll":-15,"headNod":-17}},
  {"name":"Schrankhut (right)","saved":"2026-11-19T04:31:28.580Z","guard":"schrankhut","side":"right","vi":0,"pose":{"lead":"left","stance":1.05,"width":0.32,"crouch":0.25,"shift":0.1,"turn":30,"twist":-1,"lean":28,"hilt":[0.592,0.89,-0.09],"blade":[-80,-67],"poleR":[0.6,-1,0.2],"footRSide":-0.2,"elbowL":-80}},
  {"name":"Hangetort (right)","saved":"2026-11-19T04:33:00.755Z","guard":"hangetort","side":"right","vi":0,"pose":{"lead":"right","stance":0.86,"width":0.38,"crouch":0.2,"shift":0.23,"turn":-80,"twist":44,"lean":12,"hilt":[0.66,1.51,-0.07],"blade":[8,-42],"elbowL":54,"elbowR":-33,"roll":90}},
  {"name":"Einhorn (right)","saved":"2026-11-19T04:33:29.570Z","guard":"einhorn","side":"right","vi":0,"pose":{"lead":"left","stance":1,"width":0.3,"crouch":0.14,"shift":0.06,"turn":35,"twist":34,"lean":4,"hilt":[0.337,1.578,0.152],"blade":[-29,33],"headTurn":-27}},
  {"name":"Hangetort (left)1","saved":"2026-11-19T04:42:43.792Z","guard":"hangetort","side":"right","addVariant":true,"pose":{"lead":"right","stance":0.86,"width":0.38,"crouch":0.2,"shift":0.23,"turn":-80,"twist":13,"lean":12,"hilt":[0.59,1.48,-0.07],"blade":[0,-35],"elbowL":111,"elbowR":6,"roll":90,"sideLean":0,"headTurn":0,"headNod":0,"headLean":0,"kneeR":0,"kneeL":0,"footLFwd":0,"footRFwd":0,"footLSide":0,"footRSide":0,"footLTurn":0,"footRTurn":0}},
  {"name":"Tutta Porta di Ferro (right)","saved":"2026-11-19T05:07:19.896Z","guard":"tutta_porta_di_ferro","side":"right","vi":0,"pose":{"lead":"left","stance":1.05,"width":0.26,"crouch":0.2,"shift":0.08,"turn":30,"twist":-28,"lean":8,"hilt":[0.36,0.68,0.12],"blade":[90,-48],"roll":-42}},
  {"name":"Porta di Ferro Mezana (right)","saved":"2026-11-19T05:16:58.716Z","guard":"porta_di_ferro_mezana","side":"right","vi":0,"pose":{"lead":"right","stance":1.1,"width":0.3,"crouch":0.18,"shift":0.1,"turn":-20,"twist":-30,"lean":8,"hilt":[0.353,0.633,-0.188],"blade":[0,-42],"view":160}},
  {"name":"Sides used: Posta Frontale","saved":"2026-11-19T05:47:43.010Z","guard":"posta_frontale","kind":"sides","right":true,"left":true},
  {"name":"Posta Frontale (left)","saved":"2026-11-19T05:49:14.142Z","guard":"posta_frontale","side":"left","vi":0,"pose":{"lead":"right","stance":1,"width":0.26,"crouch":0.14,"shift":0.1,"turn":-25,"twist":0,"lean":10,"hilt":[0.5,1.58,-0.05],"blade":[0,78],"roll":90,"elbowR":0,"elbowL":0,"sideLean":0,"headTurn":0,"headNod":0,"headLean":0,"kneeR":0,"kneeL":0,"footLFwd":0,"footRFwd":0,"footLSide":0,"footRSide":0,"footLTurn":0,"footRTurn":0}},
  {"name":"Used in the game: Dente di Zenghiaro","saved":"2026-11-19T05:50:08.728Z","guard":"dente_di_zenghiaro","kind":"use","used":true},
  {"name":"Sides used: Posta di Bicorno","saved":"2026-11-19T05:51:31.423Z","guard":"posta_di_bicorno","kind":"sides","right":true,"left":true},
  {"name":"Posta Frontale (right)","saved":"2026-11-19T05:51:57.805Z","guard":"posta_frontale","side":"right","vi":0,"pose":{"lead":"left","stance":1,"width":0.26,"crouch":0.14,"shift":0.1,"turn":25,"twist":0,"lean":10,"hilt":[0.5,1.58,0.05],"blade":[0,78],"roll":90}},
  {"name":"Posta Breve (right)","saved":"2026-11-19T05:55:27.539Z","guard":"posta_breve","side":"right","vi":0,"pose":{"lead":"left","stance":0.95,"width":0.26,"crouch":0.23,"shift":0.03,"turn":30,"twist":-15,"lean":8,"hilt":[0.373,0.8,0.042],"blade":[-11,26],"kneeR":-9}},
  {"name":"Dente di Zenghiaro (right)","saved":"2026-11-19T06:04:54.845Z","guard":"dente_di_zenghiaro","side":"right","vi":0,"pose":{"lead":"right","stance":0.92,"width":0.32,"crouch":0.16,"shift":0.08,"turn":-30,"twist":-30,"lean":10,"hilt":[0.119,0.801,-0.19],"blade":[12,-44],"poleR":[1,-0.5,0.3],"view":130,"elbowL":8,"roll":9,"headTurn":22,"elbowR":29}},
];
window.BAKED_SAVED = new Set(window.BAKED_EDITS_2.map((e) => e.name + "|" + e.saved)); // pose-edits.js skips these
for (const e of window.BAKED_EDITS_2) {
  const g = window.GUARDS.find((x) => x.id === e.guard);
  if (!g) continue;
  if (e.kind === "use") { g.unused = !e.used; continue; }
  if (e.kind === "sides") {
    g.sideUse = { right: !!e.right, left: !!e.left };
    if (e.left && !(g.sides && g.sides.left)) g.sides = Object.assign(g.sides || {}, { left: {} });
    continue;
  }
  if (!e.pose) continue;
  g.poses = g.poses || [g.pose];
  if (e.addVariant) g.poses.push(e.pose);
  else if (e.side === "left") {
    if (g.sides && g.sides.left) { (g.leftPoses = g.leftPoses || {})[e.vi || 0] = e.pose; if (!e.vi) g.sides.left.pose = e.pose; }
  } else { g.poses[e.vi || 0] = e.pose; if (!e.vi) g.pose = g.poses[0]; }
}

// ---- Modern names: the English translations / names used in HEMA today (Windsor & Wiktenauer for Fiore;
// Forgeng & Chidester for Meyer). Shown on the answer buttons when "Modern names" is on, and always after a hit.
window.MODERN_NAMES = {
  vom_tag: "Roof", ochs: "Ox", pflug: "Plow", alber: "Fool",
  posta_di_donna: "Woman's Guard", posta_di_finestra: "Window Guard", posta_longa: "Long Guard", coda_longa: "Long Tail",
  tutta_porta_di_ferro: "Full Iron Gate", porta_di_ferro_mezana: "Middle Iron Gate", posta_breve: "Short Guard",
  dente_di_zenghiaro: "Boar's Tooth", posta_di_bicorno: "Two-Horned Guard", posta_frontale: "Crown Guard",
  zornhut: "Wrath Guard", langort: "Longpoint", wechsel: "Change", nebenhut: "Side Guard", eisenport: "Iron Gate",
  schrankhut: "Barrier Guard", hangetort: "Hanging Point", schluessel: "Key", einhorn: "Unicorn",
};
for (const g of window.GUARDS) g.modern = window.MODERN_NAMES[g.id] || "";

// ---- Royal Armouries Ms. I.33 (sword and buckler, Franconia, c. 1300) ----
// The seven wards named in the verse on fol. 1r: "Septem custodie sunt sub brach incipiende / Humero dextrali datur
// alter, terna sinistro / Capiti da quartam, da dextro latere quintam / Pectori da sextam, postrema sit tibi langort".
// Each plate is the figure the text says is in that ward (Bachmann's transcription/translation on Wiktenauer).
// Scans: Royal Armouries; Wikimedia Commons lists its copies as public domain (PD-Art). The Armouries also offers them
// under its Non-Commercial Licence — the player chose to use them and will contact the Armouries if needed.
// All wards are one-sided (right-handed sword, buckler in the left fist). Poses read from the plates.
window.TRADITIONS.i33 = { label: "Sword & buckler", color: "#4f6b2a" };
window.LOOKS.i33 = {
  style: "i33",
  source: "after Royal Armouries Ms. I.33 (c. 1300)",
  // washed colours of the I.33 tunics: ochre, blue, grey, olive green, brown
  jackets: ["#cfae5a", "#8ea3cf", "#a3a3a8", "#9aa267", "#b9864a", "#d9c9a0"],
  hose: ["#cfae5a", "#8ea3cf", "#a3a3a8", "#9aa267", "#e8dcc0"],
  hair: ["#6b4a2a", "#8a6a3a", "#4a3424", "#a07a40"],
  priest: 0.5, // the tonsured priest; otherwise the hooded scholar
  beard: [1, 0, 0],
};
window.MASTERS.push({ id: "i33", name: "I.33", tradition: "i33" });
(function () {
  const SRC = "Royal Armouries Ms. I.33 (Walpurgis Fechtbuch), Franconia, c. 1300";
  const CREDIT = "Royal Armouries Ms. I.33 · scan: Royal Armouries · listed as public domain (PD-Art) on Wikimedia Commons";
  const ward = (id, name, modern, variants, plate, tip, pose) => ({
    id, name, modern, variants, tradition: "i33", master: "i33", source: SRC, plate,
    manuscript: { src: "assets/plates/" + id + ".jpg", credit: CREDIT },
    tip, pose, poses: [pose], sideUse: { right: true, left: false },
  });
  window.GUARDS.push(
    ward("i33_prima", "Prima", "Underarm", ["prima custodia", "sub brachio", "sub brach"],
      "fol. 2r, upper left figure (“prima custodia, videlicet sub brachio”)",
      "Prima (sub brachio): the sword hand tucked under the left arm, blade trailing behind you, buckler held out in front.",
      { lead: "right", stance: 1.00, width: 0.30, crouch: 0.22, shift: 0.06, turn: -20, twist: -30, lean: 18, hilt: [0.05, 1.02, -0.20], blade: [-165, -22], poleR: [1, -0.5, 0], buckler: [0.40, 1.20, -0.02] }),
    ward("i33_secunda", "Secunda", "Right Shoulder", ["humero dextrali"],
      "fol. 9r, upper left figure (“the second ward, which is given to the right shoulder”)",
      "Secunda: sword on the right shoulder, blade lying back over it, buckler stretched out toward the opponent.",
      { lead: "left", stance: 1.00, width: 0.30, crouch: 0.20, shift: 0.06, turn: 30, twist: 10, lean: 12, hilt: [0.18, 1.36, 0.12], blade: [178, 22], buckler: [0.62, 1.30, 0.00] }),
    ward("i33_tertia", "Tertia", "Left Shoulder", ["humero sinistro"],
      "fol. 12r, upper left figure (“Here, the priest adopts third ward”)",
      "Tertia: sword drawn over to the left shoulder, blade level behind you, buckler held high in front.",
      { lead: "right", stance: 1.00, width: 0.30, crouch: 0.20, shift: 0.06, turn: -20, twist: -10, lean: 12, hilt: [0.12, 1.42, -0.12], blade: [-175, 5], poleR: [1, 0, 0.3], buckler: [0.45, 1.45, -0.02] }),
    ward("i33_quarta", "Quarta", "High Guard", ["capiti"],
      "fol. 14v, lower right figure (“here the fourth is treated”)",
      "Quarta: sword raised over the head, blade sloping down behind you, buckler before the chest.",
      { lead: "left", stance: 1.00, width: 0.30, crouch: 0.20, shift: 0.05, turn: 25, twist: 5, lean: 10, hilt: [0.10, 1.72, 0.10], blade: [180, -28], poleR: [0.2, 0.3, 1], buckler: [0.45, 1.15, -0.02], view: 120 }),
    ward("i33_quinta", "Quinta", "Tail", ["dextro latere"],
      "fol. 27v, upper left figure (“Here the fifth ward is displaced, its displacement being halbschilt”)",
      "Quinta: sword low at the right side, point trailing back, buckler arm stretched out in front.",
      { lead: "left", stance: 1.00, width: 0.30, crouch: 0.20, shift: 0.08, turn: 35, twist: 10, lean: 14, headNod: 15, hilt: [-0.05, 0.98, 0.28], blade: [178, -8], buckler: [0.80, 1.38, -0.05] }),
    ward("i33_sexta", "Sexta", "Breast", ["pectori"],
      "fol. 17r, upper left figure (“Here the priest adopts the sixth ward, which is given to the breast”)",
      "Sexta: hilt at the breast, blade held level at the opponent, buckler pushed out ahead along it.",
      { lead: "left", stance: 1.00, width: 0.30, crouch: 0.20, shift: 0.08, turn: 25, twist: 0, lean: 12, hilt: [0.22, 1.22, 0.12], blade: [-8, 0], poleR: [-1, -0.15, 0.5], buckler: [0.68, 1.42, -0.04] }),
    ward("i33_septima", "Septima", "Longpoint", ["langort"],
      "fol. 20r, upper left figure (“Here the final ward is again adopted, which is called langort, and here the priest is adopting it”)",
      "Septima (langort): both arms stretched forward, buckler over the sword hand, point sloping down at the opponent.",
      { lead: "left", stance: 1.05, width: 0.30, crouch: 0.20, shift: 0.10, turn: 20, twist: -15, lean: 25, hilt: [0.80, 1.08, 0.02], blade: [0, -40], buckler: [0.86, 1.18, -0.03] }),
  );
})();

// ---- Player edits, third batch: the I.33 wards (baked 2026-11-19 from stance-off-poses(1).json, saved in Firefox) ----
// Applied exactly as the stance editor applied them: replace a pose, or add a variant (Quarta v2, Sexta, Septima).
window.BAKED_EDITS_3 = [
  {"name":"Prima (right)","saved":"2026-11-19T20:30:57.123Z","guard":"i33_prima","side":"right","vi":0,"pose":{"lead":"right","stance":0.66,"width":0.3,"crouch":0.21,"shift":0.28,"turn":-6,"twist":-13,"lean":18,"hilt":[0.508,1.12,-0.131],"blade":[-134,-22],"poleR":[0.859,-0.5,0.511],"buckler":[0.765,1.21,-0.02],"bucklerFace":[31,0],"headTurn":21}},
  {"name":"Secunda (right)","saved":"2026-11-19T20:33:32.028Z","guard":"i33_secunda","side":"right","vi":0,"pose":{"lead":"left","stance":1,"width":0.3,"crouch":0.2,"shift":-0.13,"turn":30,"twist":10,"lean":12,"hilt":[0.04,1.36,0.18],"blade":[178,22],"buckler":[0.56,1.25,0],"bucklerFace":[0,0]}},
  {"name":"Tertia (right)","saved":"2026-11-19T20:36:43.153Z","guard":"i33_tertia","side":"right","vi":0,"pose":{"lead":"right","stance":0.83,"width":0.3,"crouch":0.2,"shift":0.19,"turn":-20,"twist":-10,"lean":12,"hilt":[0.25,1.32,-0.18],"blade":[-175,5],"poleR":[1,0,0.3],"buckler":[0.69,1.19,-0.02],"bucklerFace":[0,0]}},
  {"name":"Quarta (right) v2","saved":"2026-11-19T20:50:52.917Z","guard":"i33_quarta","side":"right","addVariant":true,"pose":{"lead":"left","stance":0.72,"width":0.3,"crouch":0.13,"shift":-0.12,"turn":25,"twist":5,"lean":10,"hilt":[-0.07,1.51,0.23],"blade":[180,15],"poleR":[0.2,0.3,1],"buckler":[0.4,1.22,0.04],"view":120,"bucklerFace":[0,0],"roll":-18}},
  {"name":"Quarta (right) v1","saved":"2026-11-19T20:53:43.536Z","guard":"i33_quarta","side":"right","vi":0,"pose":{"lead":"left","stance":1,"width":0.3,"crouch":0.2,"shift":0.05,"turn":25,"twist":5,"lean":10,"hilt":[0.1,1.62,0.1],"blade":[180,-28],"poleR":[0.2,0.3,1],"buckler":[0.59,1.15,-0.02],"view":120}},
  {"name":"Quinta (right)","saved":"2026-11-19T20:59:13.093Z","guard":"i33_quinta","side":"right","vi":0,"pose":{"lead":"left","stance":0.76,"width":0.3,"crouch":0.1,"shift":-0.1,"turn":35,"twist":10,"lean":14,"headNod":15,"hilt":[-0.23,0.75,0.28],"blade":[178,-8],"buckler":[0.62,1.14,-0.05],"elbowR":87,"headTurn":-24,"bucklerFace":[0,0]}},
  {"name":"Sexta (right)","saved":"2026-11-19T21:04:45.020Z","guard":"i33_sexta","side":"right","addVariant":true,"pose":{"lead":"left","stance":1,"width":0.3,"crouch":0.2,"shift":-0.12,"turn":52,"twist":4,"lean":12,"hilt":[-0.142,1.14,0.272],"blade":[-12,1],"poleR":[-1.114,-0.15,-0.083],"buckler":[0.587,1.17,0.065],"elbowR":-16,"elbowL":1,"bucklerFace":[-2,0],"headTurn":-18}},
  {"name":"Septima (right)","saved":"2026-11-19T21:09:27.021Z","guard":"i33_septima","side":"right","addVariant":true,"pose":{"lead":"left","stance":1.05,"width":0.3,"crouch":0.2,"shift":-0.02,"turn":20,"twist":-15,"lean":25,"hilt":[0.53,0.89,0.02],"blade":[0,-43],"buckler":[0.6,0.95,-0.03],"bucklerFace":[0,0],"roll":92}},
  // later saves from Chrome (stance-off-poses (5).json): Secunda replaced, Quarta's 2nd variant replaced
  {"name":"Secunda (right)","saved":"2026-11-19T21:26:58.621Z","guard":"i33_secunda","side":"right","vi":0,"pose":{"lead":"left","stance":1,"width":0.3,"crouch":0.2,"shift":-0.13,"turn":30,"twist":10,"lean":12,"hilt":[0.02,1.21,0.18],"blade":[178,22],"buckler":[0.56,1.25,0],"bucklerFace":[0,0]}},
  {"name":"Quarta (right) v2","saved":"2026-11-19T21:27:27.151Z","guard":"i33_quarta","side":"right","vi":1,"pose":{"lead":"left","stance":0.72,"width":0.3,"crouch":0.13,"shift":-0.12,"turn":25,"twist":5,"lean":10,"hilt":[-0.07,1.59,0.23],"blade":[180,15],"poleR":[0.2,0.3,1],"buckler":[0.4,1.22,0.04],"view":120,"bucklerFace":[0,0],"roll":-18}},
];
for (const e of window.BAKED_EDITS_3) {
  window.BAKED_SAVED.add(e.name + "|" + e.saved); // pose-edits.js skips these
  const g = window.GUARDS.find((x) => x.id === e.guard);
  if (!g || !e.pose) continue;
  g.poses = g.poses || [g.pose];
  if (e.addVariant) g.poses.push(e.pose);
  else { g.poses[e.vi || 0] = e.pose; if (!e.vi) g.pose = g.poses[0]; }
}
// ---- Salvator Fabris, Lo Schermo, overo Scienza d'Arme (Copenhagen, 1606): the four rapier guards ----
// Book 1, Part 1, Chs. 19–32 (translation A. F. Johnson / Michael Chidester on Wiktenauer). Each chapter's text
// describes "the following figure": chapter k shows plate k−18 (plate numbers are engraved in the plate corners).
// Every plate shows both fencers in the guard; the plate used is the right-hand fencer. The engravings (Nicolaus
// Andrea of Flensburg, Jan van Halbeeck, Francesco Valesio) draw the fencers nude; the 3D fencers wear early-1600s dress.
// One pose per guard (second variants from plates 1, 3, 9 and 14 were removed at the player's request). Right side only.
window.TRADITIONS.rapier = { label: "Italian rapier", color: "#5e3a7a" };
window.LOOKS.rapier = {
  style: "fabris",
  source: "in early-1600s dress (Fabris's plates draw the fencers nude)",
  jackets: ["#2b2522", "#5a2a2a", "#2f3a4a", "#3d4a32", "#6b5a3a", "#7a6a5a", "#8a7a5a"],
  breeches: ["#2b2522", "#5a2a2a", "#2f3a4a", "#6b5a3a", "#8e3b3b"],
  hose: ["#2b2522", "#c9b48a", "#7a2e2e", "#e3d6b0", "#5b6b84"],
  hair: ["#3b2a1d", "#5a3a22", "#2a211b", "#7a5230"],
  ruff: 0.6, beard: [0.15, 0.35, 0.5],
};
window.MASTERS.push({ id: "fabris", name: "Fabris", tradition: "rapier" });
(function () {
  const SRC = "Salvator Fabris, Lo Schermo, overo Scienza d'Arme (Copenhagen, 1606), Book 1, Part 1";
  const CREDIT = "Salvator Fabris, Lo Schermo (1606), engraving · scan via Guy Windsor / Wiktenauer · Public domain";
  const fab = (id, name, modern, variants, plate, tip, pose) => ({
    id, name, modern, variants, tradition: "rapier", master: "fabris", source: SRC, plate,
    manuscript: { src: "assets/plates/" + id + ".jpg", credit: CREDIT },
    tip, pose, poses: [pose], sideUse: { right: true, left: false },
  });
  const R = { rapier: true, lead: "right" };
  window.GUARDS.push(
    fab("fabris_prima", "Prima", "First", ["prima guardia"],
      "plate 2, p. 29, right figure (Ch. 20, “a well formed guard in prime”)",
      "Prima: the hand high as when the sword is just drawn, arm extended, body bent forward, point toward the opponent.",
      Object.assign({}, R, { stance: 0.45, width: 0.20, crouch: 0.12, shift: -0.08, turn: -30, twist: -10, lean: 60, headNod: 20,
        hilt: [0.95, 1.40, 0.12], blade: [0, -8], roll: -150, leftHand: [0.42, 1.25, -0.04], view: 160 })),
    fab("fabris_seconda", "Seconda", "Second", ["seconda guardia"],
      "plate 4, p. 31, right figure (Ch. 22, “a well formed guard in second”)",
      "Seconda: arm a little lower than in prima, hand turned nails down, body bent forward, point in line.",
      Object.assign({}, R, { stance: 0.55, width: 0.20, crouch: 0.14, shift: -0.08, turn: -30, twist: -10, lean: 60, headNod: 15,
        hilt: [0.95, 1.30, 0.08], blade: [0, -2], roll: -90, leftHand: [0.45, 1.18, -0.04], view: 160 })),
    fab("fabris_terza", "Terza", "Third", ["terza guardia"],
      "plate 10, p. 37, right figure (Ch. 28, “the manner of forming well a sword guard in third”)",
      "Terza: the natural guard — hand neither turned up nor down, arm extended before you, point at the opponent.",
      Object.assign({}, R, { stance: 0.70, width: 0.24, crouch: 0.18, shift: -0.02, turn: -25, twist: -10, lean: 45,
        hilt: [0.95, 1.15, 0.05], blade: [0, 2], leftHand: [0.38, 1.20, -0.08], view: 160 })),
    fab("fabris_quarta", "Quarta", "Fourth", ["quarta guardia"],
      "plate 13, p. 40, right figure (Ch. 31, “a guard in Fourth, the last of the four guards”)",
      "Quarta: hand turned nails up, arm out before you, chest turned more to the opponent, left hand raised by the head.",
      Object.assign({}, R, { stance: 0.70, width: 0.26, crouch: 0.20, shift: 0.02, turn: -10, twist: -5, lean: 15,
        hilt: [0.80, 1.20, 0.00], blade: [0, 0], roll: 90, leftHand: [0.22, 1.62, -0.12], view: 150 })),
  );
})();

// ---- Player edits, fourth batch: Fabris (baked 2026-11-19 from stance-off-poses (6).json, saved in Chrome) ----
window.BAKED_EDITS_4 = [
  {"name":"Prima (right) v1","saved":"2026-11-19T21:42:38.057Z","guard":"fabris_prima","side":"right","vi":0,"pose":{"rapier":true,"lead":"right","stance":0.13,"width":0.2,"crouch":0.05,"shift":-0.25,"turn":-30,"twist":-10,"lean":60,"headNod":20,"hilt":[0.68,1.32,0.12],"blade":[0,1],"roll":-150,"leftHand":[0.25,1.24,-0.34],"view":160,"elbowR":-89}},
  {"name":"Seconda (right) v1","saved":"2026-11-19T21:43:37.991Z","guard":"fabris_seconda","side":"right","vi":0,"pose":{"rapier":true,"lead":"right","stance":0.55,"width":0.2,"crouch":0.14,"shift":-0.25,"turn":-30,"twist":-10,"lean":60,"headNod":15,"hilt":[0.66,1.3,0.08],"blade":[0,-2],"roll":-90,"leftHand":[0.22,1.18,-0.36],"view":160}},
  {"name":"Terza (right) v1","saved":"2026-11-19T21:44:42.184Z","guard":"fabris_terza","side":"right","vi":0,"pose":{"rapier":true,"lead":"right","stance":0.7,"width":0.24,"crouch":0.23,"shift":-0.24,"turn":-25,"twist":-10,"lean":45,"hilt":[0.73,1.1,0.05],"blade":[0,2],"leftHand":[0.05,1.18,-0.26],"view":160}},
  {"name":"Quarta (right) v1","saved":"2026-11-19T21:47:15.164Z","guard":"fabris_quarta","side":"right","vi":0,"pose":{"rapier":true,"lead":"right","stance":0.7,"width":0.26,"crouch":0.2,"shift":0.02,"turn":-39,"twist":2,"lean":15,"hilt":[0.785,1.05,0.019],"blade":[-1,0],"roll":90,"leftHand":[0.129,1.36,-0.2],"view":150,"elbowL":56}},
];
for (const e of window.BAKED_EDITS_4) {
  window.BAKED_SAVED.add(e.name + "|" + e.saved); // pose-edits.js skips these
  const g = window.GUARDS.find((x) => x.id === e.guard);
  if (!g || !e.pose) continue;
  g.poses = g.poses || [g.pose];
  if (e.addVariant) g.poses.push(e.pose);
  else { g.poses[e.vi || 0] = e.pose; if (!e.vi) g.pose = g.poses[0]; }
}
// ---- Extra built-in plates (the player can choose them in the editor, and pose a variant against them) ----
// g.extraPlates: alternative plates for a guard. Fabris: the neighbouring chapter's figure for each guard. Each is also the
// plate for the guard's 2nd variant (g.variantPlates[1]), used as soon as the player adds that variant in the editor.
(function () {
  const FAB = "Salvator Fabris, Lo Schermo (1606), engraving · scan via Guy Windsor / Wiktenauer · Public domain";
  const extra = {
    fabris_prima:   { id: "pl1",  file: "fabris_prima_pl1",   plate: "plate 1, p. 28, right figure (Ch. 19, “the guard in prime formed in drawing the sword from the scabbard”)" },
    fabris_seconda: { id: "pl3",  file: "fabris_seconda_pl3", plate: "plate 3, p. 30, right figure (Ch. 21, “the guard in second, arising from the guard in first”)" },
    fabris_terza:   { id: "pl9",  file: "fabris_terza_pl9",   plate: "plate 9, p. 36, right figure (Ch. 27, “the guard in third, which arises from the guard in first”)" },
    fabris_quarta:  { id: "pl14", file: "fabris_quarta_pl14", plate: "plate 14, p. 41, right figure (Ch. 32, “an extended guard in Fourth”)" },
  };
  for (const id in extra) {
    const g = window.GUARDS.find((x) => x.id === id), x = extra[id];
    if (!g) continue;
    const p = { id: x.id, src: "assets/plates/" + x.file + ".jpg", plate: x.plate, credit: FAB };
    g.extraPlates = [p];
    g.variantPlates = Object.assign({}, g.variantPlates, { 1: { src: p.src, plate: p.plate } });
  }
  // Variant 2 of each Fabris guard, posed after its extra plate (restored at the player's request so they can edit it).
  const R = { rapier: true, lead: "right" };
  const v2 = {
    fabris_prima: Object.assign({}, R, { stance: 0.55, width: 0.20, crouch: 0.14, shift: -0.04, turn: -30, twist: -10, lean: 45,
      hilt: [0.45, 1.65, 0.05], blade: [0, -10], roll: -150, poleR: [0.3, 0.5, 1], leftHand: [0.52, 1.20, -0.10], view: 160 }),
    fabris_terza: Object.assign({}, R, { stance: 0.75, width: 0.24, crouch: 0.22, shift: 0.02, turn: -25, twist: -10, lean: 25,
      hilt: [0.80, 1.10, 0.08], blade: [0, 12], leftHand: [0.30, 1.22, -0.10], view: 160 }),
    fabris_quarta: Object.assign({}, R, { stance: 0.75, width: 0.26, crouch: 0.22, shift: 0.04, turn: -15, twist: -5, lean: 35,
      hilt: [1.00, 1.15, 0.00], blade: [0, 0], roll: 90, leftHand: [0.00, 1.45, -0.22], view: 150 }),
  };
  for (const id in v2) {
    const g = window.GUARDS.find((x) => x.id === id);
    if (g && (g.poses || []).length === 1) g.poses.push(v2[id]);
  }
})();

// ---- Player edits, fifth batch: Fabris variant 2 (baked 2026-11-19 from stance-off-poses (7).json, saved in Chrome) ----
// Applied after the restored variant-2 poses above, so the player's versions win.
window.BAKED_EDITS_5 = [
  {"name":"Prima (right) v2","saved":"2026-11-19T22:08:00.015Z","guard":"fabris_prima","side":"right","vi":1,"pose":{"rapier":true,"lead":"right","stance":0.18,"width":0.11,"crouch":0.06,"shift":-0.25,"turn":4,"twist":-10,"lean":55,"hilt":[0.29,1.472,0.387],"blade":[35,-0.5],"roll":-150,"poleR":[-0.274,1.036,0.44],"leftHand":[0.476,1.125,-0.151],"view":160,"kneeL":43,"elbowR":-8,"headTurn":27,"sideLean":-38,"footLFwd":-0.12,"footLSide":-0.09}},
  {"name":"Terza (right) v2","saved":"2026-11-19T22:10:54.898Z","guard":"fabris_terza","side":"right","vi":1,"pose":{"rapier":true,"lead":"right","stance":0.75,"width":0.24,"crouch":0.22,"shift":0.02,"turn":-46,"twist":17,"lean":25,"hilt":[0.788,0.93,0.158],"blade":[6,16],"leftHand":[0.326,1.22,-0.239],"view":160,"footLFwd":0.05,"footLSide":-0.3}},
  {"name":"Quarta (right) v2","saved":"2026-11-19T22:14:52.732Z","guard":"fabris_quarta","side":"right","vi":1,"pose":{"rapier":true,"lead":"right","stance":0.25,"width":0.26,"crouch":0.22,"shift":-0.5,"turn":-15,"twist":-5,"lean":57,"hilt":[0.473,1.127,-0.004],"blade":[1.5,3.4],"roll":90,"leftHand":[-0.16,1.174,-0.26],"view":150,"elbowL":43,"headNod":-9,"footLFwd":-0.36}},
];
for (const e of window.BAKED_EDITS_5) {
  window.BAKED_SAVED.add(e.name + "|" + e.saved); // pose-edits.js skips these
  const g = window.GUARDS.find((x) => x.id === e.guard);
  if (!g || !e.pose) continue;
  g.poses = g.poses || [g.pose];
  if (e.addVariant) g.poses.push(e.pose);
  else { g.poses[e.vi || 0] = e.pose; if (!e.vi) g.pose = g.poses[0]; }
}
// ---- Player edits, sixth batch: I.33 Sexta main pose (baked 2026-11-19 from stance-off-poses (8).json, saved in Chrome) ----
window.BAKED_EDITS_6 = [
  {"name":"Sexta (right) v1","saved":"2026-11-20T04:14:28.157Z","guard":"i33_sexta","side":"right","vi":0,"pose":{"lead":"left","stance":1,"width":0.3,"crouch":0.2,"shift":0.08,"turn":38,"twist":15,"lean":12,"hilt":[0.154,1.03,0.232],"blade":[-18,-2],"poleR":[-1.118,-0.15,-0.03],"buckler":[0.744,1.06,-0.136],"bucklerFace":[-15,0],"elbowR":-50,"headTurn":-23}},
];
for (const e of window.BAKED_EDITS_6) {
  window.BAKED_SAVED.add(e.name + "|" + e.saved); // pose-edits.js skips these
  const g = window.GUARDS.find((x) => x.id === e.guard);
  if (!g || !e.pose) continue;
  g.poses = g.poses || [g.pose];
  if (e.addVariant) g.poses.push(e.pose);
  else { g.poses[e.vi || 0] = e.pose; if (!e.vi) g.pose = g.poses[0]; }
}

// ---- Player edits, seventh batch: Fabris main poses (baked 2026-11-19 from stance-off-poses (9).json, saved in Chrome) ----
window.BAKED_EDITS_7 = [
  {"name":"Seconda (right)","saved":"2026-11-20T04:21:50.516Z","guard":"fabris_seconda","side":"right","vi":0,"pose":{"rapier":true,"lead":"right","stance":0.55,"width":0.2,"crouch":0.14,"shift":-0.25,"turn":-30,"twist":-10,"lean":60,"headNod":15,"hilt":[0.69,1.28,0.08],"blade":[0,-2],"roll":-90,"leftHand":[0.22,1.18,-0.36],"view":160}},
  {"name":"Prima (right) v1","saved":"2026-11-20T04:22:41.074Z","guard":"fabris_prima","side":"right","vi":0,"pose":{"rapier":true,"lead":"right","stance":0.13,"width":0.2,"crouch":0.05,"shift":-0.25,"turn":-30,"twist":-10,"lean":60,"headNod":20,"hilt":[0.64,1.44,0.12],"blade":[0,0],"roll":-150,"leftHand":[0.25,1.24,-0.34],"view":160,"elbowR":-89}},
  {"name":"Terza (right) v1","saved":"2026-11-20T04:23:05.904Z","guard":"fabris_terza","side":"right","vi":0,"pose":{"rapier":true,"lead":"right","stance":0.7,"width":0.24,"crouch":0.23,"shift":-0.24,"turn":-25,"twist":-10,"lean":45,"hilt":[0.67,1.1,0.05],"blade":[0,2],"leftHand":[0.05,1.18,-0.26],"view":160}},
];
for (const e of window.BAKED_EDITS_7) {
  window.BAKED_SAVED.add(e.name + "|" + e.saved); // pose-edits.js skips these
  const g = window.GUARDS.find((x) => x.id === e.guard);
  if (!g || !e.pose) continue;
  g.poses = g.poses || [g.pose];
  if (e.addVariant) g.poses.push(e.pose);
  else { g.poses[e.vi || 0] = e.pose; if (!e.vi) g.pose = g.poses[0]; }
}

// ---- Player edits, eighth batch: Hangetort variant 3 (baked 2026-11-19 from stance-off-poses (10).json, saved in Chrome) ----
window.BAKED_EDITS_8 = [
  {"name":"Hangetort (right) v3","saved":"2026-11-20T04:59:19.153Z","guard":"hangetort","side":"right","addVariant":true,"pose":{"lead":"right","stance":0.49,"width":0.38,"crouch":0.15,"shift":-0.17,"turn":-109,"twist":13,"lean":12,"hilt":[-0.049,1.602,-0.232],"blade":[-1,-39.4],"elbowL":-8,"elbowR":89,"roll":90,"sideLean":-4,"footLFwd":-0.42,"footLSide":-0.45,"footRSide":-0.37,"footLTurn":79,"footRTurn":-83}},
];
for (const e of window.BAKED_EDITS_8) {
  window.BAKED_SAVED.add(e.name + "|" + e.saved); // pose-edits.js skips these
  const g = window.GUARDS.find((x) => x.id === e.guard);
  if (!g || !e.pose) continue;
  g.poses = g.poses || [g.pose];
  if (e.addVariant) g.poses.push(e.pose);
  else { g.poses[e.vi || 0] = e.pose; if (!e.vi) g.pose = g.poses[0]; }
}

// ---- Player edits, ninth batch: Hangetort variant 3, left side (baked 2026-11-19 from stance-off-poses (11).json, saved in Chrome) ----
window.BAKED_EDITS_9 = [
  {"name":"Hangetort (left) v3","saved":"2026-11-20T05:06:38.740Z","guard":"hangetort","side":"left","vi":2,"pose":{"lead":"left","stance":0.49,"width":0.38,"crouch":0.15,"shift":-0.17,"turn":109,"twist":-13,"lean":12,"hilt":[-0.109,1.642,0.232],"blade":[13,-39.4],"elbowL":-56,"elbowR":-115,"roll":-90,"sideLean":4,"footRFwd":-0.42,"footLSide":-0.37,"footRSide":-0.45,"footLTurn":-83,"footRTurn":79}},
];
for (const e of window.BAKED_EDITS_9) {
  window.BAKED_SAVED.add(e.name + "|" + e.saved); // pose-edits.js skips these
  const g = window.GUARDS.find((x) => x.id === e.guard);
  if (!g || !e.pose) continue;
  g.poses = g.poses || [g.pose];
  if (e.addVariant) g.poses.push(e.pose);
  else if (e.side === "left") {
    if (g.sides && g.sides.left) { (g.leftPoses = g.leftPoses || {})[e.vi || 0] = e.pose; if (!e.vi) g.sides.left.pose = e.pose; }
  } else { g.poses[e.vi || 0] = e.pose; if (!e.vi) g.pose = g.poses[0]; }
}

// ---- Player edits, tenth batch: Hangetort variant 2 (baked 2026-11-19 from stance-off-poses (12).json, saved in Chrome) ----
window.BAKED_EDITS_10 = [
  {"name":"Hangetort (right) v2","saved":"2026-11-20T05:09:48.607Z","guard":"hangetort","side":"right","vi":1,"pose":{"lead":"right","stance":0.86,"width":0.38,"crouch":0.2,"shift":0.23,"turn":-80,"twist":13,"lean":12,"hilt":[0.61,1.48,-0.11],"blade":[0,-35],"elbowL":111,"elbowR":6,"roll":90}},
];
for (const e of window.BAKED_EDITS_10) {
  window.BAKED_SAVED.add(e.name + "|" + e.saved); // pose-edits.js skips these
  const g = window.GUARDS.find((x) => x.id === e.guard);
  if (!g || !e.pose) continue;
  g.poses = g.poses || [g.pose];
  if (e.addVariant) g.poses.push(e.pose);
  else if (e.side === "left") {
    if (g.sides && g.sides.left) { (g.leftPoses = g.leftPoses || {})[e.vi || 0] = e.pose; if (!e.vi) g.sides.left.pose = e.pose; }
  } else { g.poses[e.vi || 0] = e.pose; if (!e.vi) g.pose = g.poses[0]; }
}

// ---- Player edits, eleventh batch: Alber left side + variant 2 (baked 2026-11-19 from stance-off-poses (13).json, saved in Chrome) ----
window.BAKED_EDITS_11 = [
  {"name":"Sides used: Alber","saved":"2026-11-20T05:12:04.616Z","kind":"sides","guard":"alber","right":true,"left":true},
  {"name":"Alber (left)","saved":"2026-11-20T05:13:29.517Z","guard":"alber","side":"left","vi":0,"pose":{"lead":"right","stance":0.86,"width":0.3,"crouch":0.16,"shift":0.1,"turn":-10,"twist":14,"lean":35,"hilt":[0.737,0.827,0.194],"blade":[21,-35]}},
  {"name":"Alber (right) v2","saved":"2026-11-20T05:14:30.656Z","guard":"alber","side":"right","addVariant":true,"pose":{"lead":"left","stance":0.86,"width":0.3,"crouch":0.16,"shift":0.1,"turn":58,"twist":12,"lean":12,"hilt":[0.204,0.733,0.172],"blade":[-9,-35],"roll":-8,"elbowR":-76,"elbowL":14}},
  {"name":"Alber (left) v2","saved":"2026-11-20T05:21:49.770Z","guard":"alber","side":"left","vi":1,"pose":{"lead":"right","stance":0.86,"width":0.3,"crouch":0.16,"shift":0.1,"turn":-63,"twist":-5,"lean":11,"hilt":[0.298,0.714,-0.173],"blade":[6,-38],"sideLean":-1,"headTurn":21}},
];
for (const e of window.BAKED_EDITS_11) {
  window.BAKED_SAVED.add(e.name + "|" + e.saved); // pose-edits.js skips these
  const g = window.GUARDS.find((x) => x.id === e.guard);
  if (!g) continue;
  if (e.kind === "use") { g.unused = !e.used; continue; }
  if (e.kind === "sides") {
    g.sideUse = { right: !!e.right, left: !!e.left };
    if (e.left && !(g.sides && g.sides.left)) g.sides = Object.assign(g.sides || {}, { left: {} });
    continue;
  }
  if (!e.pose) continue;
  g.poses = g.poses || [g.pose];
  if (e.addVariant) g.poses.push(e.pose);
  else if (e.side === "left") {
    if (g.sides && g.sides.left) { (g.leftPoses = g.leftPoses || {})[e.vi || 0] = e.pose; if (!e.vi) g.sides.left.pose = e.pose; }
  } else { g.poses[e.vi || 0] = e.pose; if (!e.vi) g.pose = g.poses[0]; }
}

// ---- Alfred Hutton, Cold Steel: A Practical Treatise on the Sabre (London, 1889): the five engaging guards ----
// "The Guards" (pp. 12–14): "The old masters taught four engaging guards ... Inside, Outside, Medium, and the Hanging
// Guard"; the Medium is the guard Hutton bases all his lessons on. Plate III draws the Medium Guard (a Victorian
// fencer); Plates IV–VII are Hutton's reproductions of James Miller's 1737 engravings of the Inside, Outside, Hanging and
// St. George's Guards. Each Miller plate shows both fencers in the guard; the plate used is the right-hand fencer.
// Scan: Digital Library of India copy on the Internet Archive (in.ernet.dli.2015.278655), public domain (1889).
// Right side only (Hutton's fencers all lead with the right foot). Poses are first drafts for the stance editor.
window.TRADITIONS.sabre = { label: "Victorian military", color: "#2e5e6b" }; // Hutton: sabre, great stick and dagger
window.LOOKS.sabre = {
  style: "hutton",
  source: "in a striped Victorian fencing jersey, after Hutton's plates",
  // jersey stripes [ground, stripe] and trousers
  stripes: [["#1f2a44", "#e8dcc4"], ["#1d1712", "#e8dcc4"], ["#5a2a2a", "#e8dcc4"], ["#2f4a3a", "#e8dcc4"], ["#1f2a44", "#b03a2e"]],
  trousers: ["#2b2522", "#1f2a44", "#3a3a3a", "#1d1712"],
  jackets: ["#f1e9da", "#e8dcc4", "#efe6d2", "#2b2522", "#2f3a4a"],
  breeches: ["#2b2522", "#5a4a3a", "#3a3a3a", "#6b5a3a", "#c9b48a"],
  hose: ["#e3d6b0", "#f1e9da", "#2b2522", "#5b6b84"],
  hair: ["#3b2a1d", "#5a3a22", "#2a211b", "#d8d0c0"],
  ruff: 0, beard: [0.7, 0.2, 0.1],
};
window.MASTERS.push({ id: "hutton", name: "Hutton", tradition: "sabre" });
(function () {
  const SRC = "Alfred Hutton, Cold Steel: A Practical Treatise on the Sabre (London, 1889), “The Guards”";
  const CREDIT = "Alfred Hutton, Cold Steel (1889) · scan: Digital Library of India via Internet Archive · Public domain";
  const MILLER = "Alfred Hutton, Cold Steel (1889), after James Miller (1737) · scan: Digital Library of India via Internet Archive · Public domain";
  const hut = (id, name, modern, variants, plate, credit, tip, pose) => ({
    id, name, modern: modern || "", variants, tradition: "sabre", master: "hutton", source: SRC, plate,
    manuscript: { src: "assets/plates/" + id + ".jpg", credit },
    tip, pose, poses: [pose], sideUse: { right: true, left: false },
  });
  const R = { sabre: true, lead: "right", view: 155 };
  window.GUARDS.push(
    hut("hutton_medium", "Medium Guard", undefined, ["medium", "the medium", "guardia mista"],
      "Plate III, “Medium Guard”", CREDIT,
      "Medium Guard: between quarte and tierce — edge inclined downwards, point opposite the opponent’s face. Hutton’s own guard.",
      Object.assign({}, R, { stance: 0.62, width: 0.2, crouch: 0.14, shift: -0.04, turn: -40, twist: -5, lean: 4,
        hilt: [0.55, 1.05, 0.12], blade: [-4, 12], roll: -45 })),
    hut("hutton_inside", "Inside Guard", "Quarte", ["inside", "guard in quarte"],
      "Plate IV, “The Inside Guard — after James Miller, 1737”, right figure", MILLER,
      "Inside Guard: in the form of quarte — hand turned nails up and carried to the inside (left), point raised at the opponent.",
      Object.assign({}, R, { stance: 0.55, width: 0.2, crouch: 0.1, shift: -0.02, turn: -35, twist: -5, lean: 0,
        hilt: [0.62, 1.30, 0.02], blade: [-8, 30], roll: 90, leftHand: [-0.05, 1.62, -0.22] })),
    hut("hutton_outside", "Outside Guard", "Tierce", ["outside", "guard in tierce"],
      "Plate V, “The Outside Guard — after James Miller, 1737”, right figure", MILLER,
      "Outside Guard: in the form of tierce — hand turned nails down and carried to the outside (right), point raised at the opponent.",
      Object.assign({}, R, { stance: 0.55, width: 0.2, crouch: 0.1, shift: -0.02, turn: -35, twist: -5, lean: 0,
        hilt: [0.62, 1.30, 0.26], blade: [6, 30], roll: -90, leftHand: [-0.25, 1.35, -0.45] })),
    hut("hutton_hanging", "Hanging Guard", "Prime", ["hanging", "hanging guard"],
      "Plate VI, “The Hanging Guard — after James Miller, 1737”, right figure", MILLER,
      "Hanging Guard: hand raised as high as the head, edge up, point dropped to the opponent’s right hip; look under the shell.",
      Object.assign({}, R, { stance: 0.6, width: 0.22, crouch: 0.14, shift: 0.02, turn: -35, twist: -5, lean: 14,
        hilt: [0.55, 1.62, 0.12], blade: [-15, -35] })),
    hut("hutton_st_george", "St. George’s Guard", undefined, ["st george", "st. george", "st george's guard", "st georges guard", "saint george"],
      "Plate VII, “The St. George’s Guard — after James Miller, 1737”, right figure", MILLER,
      "St. George’s Guard: the hand raised above the head, the blade held across over it to cover the head.",
      Object.assign({}, R, { stance: 0.55, width: 0.2, crouch: 0.1, shift: -0.02, turn: -35, twist: -5, lean: 2,
        hilt: [0.36, 1.80, 0.12], blade: [-125, 10] })),
  );
  // Master-tier look-alikes: quarte and tierce forms mirror each other; the Medium sits between them;
  // the Hanging Guard and St. George’s both raise the hand above the head
  window.TWINS.push(["hutton_inside", "hutton_outside"], ["hutton_medium", "hutton_outside"], ["hutton_hanging", "hutton_st_george"]);
})();

// ---- Hutton, Cold Steel (1889): the other plates captioned as guards ----
// "The Great Stick" (pp. 143–150): a five-foot rattan cane in both hands, after the Italian army's method;
// Plate XXX "The Great Stick — Guard (Quarte)", Plate XXXI "The Great Stick — False Guard (Tierce)".
// "The Short Sword-Bayonet, or Dagger" (pp. 191–196): Plate XLI "The Dagger — Guard".
// Each plate is a single Victorian fencer (scan pages 162, 166 and 206 of the same Internet Archive copy).
(function () {
  const CREDIT = "Alfred Hutton, Cold Steel (1889) · scan: Digital Library of India via Internet Archive · Public domain";
  const hut = (id, name, variants, source, plate, tip, pose) => ({
    id, name, modern: "", variants, tradition: "sabre", master: "hutton", source, plate,
    manuscript: { src: "assets/plates/" + id + ".jpg", credit: CREDIT },
    tip, pose, poses: [pose], sideUse: { right: true, left: false },
  });
  const STICK = "Alfred Hutton, Cold Steel (London, 1889), “The Great Stick”";
  window.GUARDS.push(
    hut("hutton_stick_quarte", "Great Stick Guard", ["great stick", "stick guard", "guard in quarte", "great stick quarte"], STICK,
      "Plate XXX, “The Great Stick — Guard (Quarte)”",
      "Great Stick Guard: a quarte — both hands on the cane, the left just below the right, forearm close to the body, right foot forward, point at the level of the eyes.",
      { stick: true, lead: "right", view: 155, stance: 0.6, width: 0.26, crouch: 0.15, shift: -0.02, turn: -50, twist: -5, lean: 4,
        hilt: [0.36, 1.0, 0.02], blade: [-6, 12], roll: 90 }),
    hut("hutton_stick_false", "Great Stick False Guard", ["false guard", "fals-guardia", "falsa guardia", "guard in tierce", "great stick tierce"], STICK,
      "Plate XXXI, “The Great Stick — False Guard (Tierce)”",
      "Great Stick False Guard: a tierce — right foot drawn back behind the left, the cane passed over to the right side, left hand under the right forearm, point at eye level.",
      { stick: true, lead: "left", view: 25, stance: 0.55, width: 0.3, crouch: 0.15, shift: 0, turn: 40, twist: 5, lean: 4,
        hilt: [0.3, 1.0, 0.22], blade: [8, 20], roll: -90 }),
    hut("hutton_dagger", "Dagger Guard", ["dagger", "sword-bayonet guard", "bayonet guard"],
      "Alfred Hutton, Cold Steel (London, 1889), “The Short Sword-Bayonet, or Dagger”",
      "Plate XLI, “The Dagger — Guard”",
      "Dagger Guard: the dagger held overhand in the medium guard, right foot forward, the open left hand close to the left breast, ready to seize the wrist.",
      { dagger: true, lead: "right", view: 155, stance: 0.58, width: 0.22, crouch: 0.15, shift: -0.02, turn: -40, twist: -5, lean: 4,
        hilt: [0.5, 1.1, 0.12], blade: [-5, 8], roll: -45 }),
  );
  window.TWINS.push(["hutton_stick_quarte", "hutton_stick_false"]);
})();

// ---- Player edits, twelfth batch: Hutton sabre guards + stick/dagger switched off (baked 2026-11-20 from Firefox stance-off-poses(2).json) ----
window.BAKED_EDITS_12 = [
  {"name":"Inside Guard (right)","saved":"2026-11-20T08:44:44.229Z","guard":"hutton_inside","side":"right","vi":0,"pose":{"sabre":true,"lead":"right","view":155,"stance":0.55,"width":0.2,"crouch":0.1,"shift":-0.02,"turn":-35,"twist":-5,"lean":0,"hilt":[0.62,1.3,0.02],"blade":[-8,30],"roll":90,"leftHand":[-0.14,1,-0.22],"elbowL":35}},
  {"name":"Outside Guard (right)","saved":"2026-11-20T08:45:57.088Z","guard":"hutton_outside","side":"right","vi":0,"pose":{"sabre":true,"lead":"right","view":155,"stance":0.55,"width":0.2,"crouch":0.1,"shift":-0.02,"turn":-35,"twist":-5,"lean":0,"hilt":[0.62,1.3,0.26],"blade":[6,30],"roll":-90,"leftHand":[-0.15,1.04,-0.15],"elbowL":-6,"headTurn":23}},
  {"name":"Hanging Guard (right)","saved":"2026-11-20T08:47:24.687Z","guard":"hutton_hanging","side":"right","vi":0,"pose":{"sabre":true,"lead":"right","view":155,"stance":0.6,"width":0.22,"crouch":0.14,"shift":0.02,"turn":-35,"twist":-5,"lean":14,"hilt":[0.64,1.62,0.12],"blade":[-15,-35],"roll":-167,"elbowR":-100,"leftHand":[-0.117,1.007,-0.16],"headTurn":22}},
  {"name":"St. George’s Guard (right)","saved":"2026-11-20T08:48:50.288Z","guard":"hutton_st_george","side":"right","vi":0,"pose":{"sabre":true,"lead":"right","view":155,"stance":0.55,"width":0.2,"crouch":0.1,"shift":-0.02,"turn":-35,"twist":-5,"lean":2,"hilt":[0.36,1.73,0.26],"blade":[-98,10],"roll":20,"elbowR":-48,"headTurn":25}},
  {"name":"Used in the game: Great Stick Guard","saved":"2026-11-20T08:51:32.176Z","kind":"use","guard":"hutton_stick_quarte","used":false},
  {"name":"Used in the game: Great Stick False Guard","saved":"2026-11-20T08:51:42.100Z","kind":"use","guard":"hutton_stick_false","used":false},
  {"name":"Used in the game: Dagger Guard","saved":"2026-11-20T08:51:47.156Z","kind":"use","guard":"hutton_dagger","used":false},
];
for (const e of window.BAKED_EDITS_12) {
  window.BAKED_SAVED.add(e.name + "|" + e.saved); // pose-edits.js skips these
  const g = window.GUARDS.find((x) => x.id === e.guard);
  if (!g) continue;
  if (e.kind === "use") { g.unused = !e.used; continue; }
  if (e.kind === "sides") {
    g.sideUse = { right: !!e.right, left: !!e.left };
    if (e.left && !(g.sides && g.sides.left)) g.sides = Object.assign(g.sides || {}, { left: {} });
    continue;
  }
  if (!e.pose) continue;
  g.poses = g.poses || [g.pose];
  if (e.addVariant) g.poses.push(e.pose);
  else if (e.side === "left") {
    if (g.sides && g.sides.left) { (g.leftPoses = g.leftPoses || {})[e.vi || 0] = e.pose; if (!e.vi) g.sides.left.pose = e.pose; }
  } else { g.poses[e.vi || 0] = e.pose; if (!e.vi) g.pose = g.poses[0]; }
}

// ---- Hutton, Cold Steel (1889): the seventeen parries, Plates IX–XXV ("The Parries", pp. 34–38 and 73) ----
// Each plate is a single Victorian fencer (Internet Archive scan pages n52–n84, every second page). Engaged in the
// Medium Guard, each parry stops one of the six cuts (or the head cut, or the vertical cut "at the fork").
// Descriptions follow Hutton's text; poses are first drafts for the stance editor. Right side only.
(function () {
  const SRC = "Alfred Hutton, Cold Steel: A Practical Treatise on the Sabre (London, 1889), “The Parries”";
  const CREDIT = "Alfred Hutton, Cold Steel (1889) · scan: Digital Library of India via Internet Archive · Public domain";
  const P = { sabre: true, lead: "right", stance: 0.6, width: 0.2, crouch: 0.14, shift: -0.02, turn: -40, twist: -5, lean: 4 };
  const SIDE = Object.assign({}, P, { view: 155 }), FRONT = Object.assign({}, P, { view: 95 });
  const par = (key, name, plate, variants, tip, base, pose) => ({
    id: "hutton_p_" + key, name, modern: "", variants, tradition: "sabre", master: "hutton", source: SRC,
    plate: "Plate " + plate + ", “" + name + "”",
    manuscript: { src: "assets/plates/hutton_p_" + key + ".jpg", credit: CREDIT },
    tip, pose: Object.assign({}, base, pose), poses: [Object.assign({}, base, pose)], sideUse: { right: true, left: false },
  });
  window.GUARDS.push(
    par("quarte", "Parry of Quarte", "IX", ["quarte", "quarte parry"],
      "Parry of Quarte (against cut 1): hand turned to quarte and carried a little to the left, point raised slightly; the cut is taken on the forte near the shell.",
      SIDE, { hilt: [0.52, 1.1, -0.02], blade: [-12, 22], roll: 90 }),
    par("high_prime", "Parry of High Prime", "X", ["high prime"],
      "Parry of High Prime (against cut 1): hilt raised and brought over to the left front, edge up, point dropped six or eight inches; look over the right wrist.",
      SIDE, { hilt: [0.6, 1.5, -0.06], blade: [-30, -10], roll: 180, lean: 8 }),
    par("tierce", "Parry of Tierce", "XI", ["tierce", "tierce parry"],
      "Parry of Tierce (against cut 2): hand turned to tierce and carried a little to the right, point raised slightly, edge to the right front.",
      SIDE, { hilt: [0.5, 1.08, 0.24], blade: [8, 22], roll: -90 }),
    par("sixte", "Parry of Sixte", "XII", ["sixte"],
      "Parry of Sixte (against cut 2, from the guard in sixte): point raised slightly, the cut received on the back of the sword.",
      FRONT, { hilt: [0.42, 1.1, 0.26], blade: [12, 55], roll: 90 }),
    par("high_octave", "Parry of High Octave", "XIII", ["high octave"],
      "Parry of High Octave (against cut 2 and the return at the right cheek): hilt raised level with the top of the head, blade dropped forward nearly upright, edge to the right front.",
      Object.assign({}, P, { view: 230 }), { hilt: [0.38, 1.72, 0.26], blade: [10, -80], roll: -90 }),
    par("low_prime", "Parry of Low Prime", "XIV", ["low prime", "prime low"],
      "Parry of Low Prime (against cut 3): from the tierce guard, point dropped forward with the blade nearly upright, hand a little to the left, edge to the left front.",
      FRONT, { hilt: [0.4, 1.12, 0.0], blade: [-10, -78], roll: 180 }),
    par("septime", "Parry of Septime", "XV", ["septime"],
      "Parry of Septime (against cut 3 at the inside of the leg): edge turned to the left, hand carried a little to that side, point dropped.",
      FRONT, { hilt: [0.4, 1.0, 0.02], blade: [-12, -65], roll: 180 }),
    par("seconde", "Parry of Seconde", "XVI", ["seconde"],
      "Parry of Seconde (against cut 4): point dropped to the right front, the cut received on the forte.",
      FRONT, { hilt: [0.42, 1.02, 0.22], blade: [15, -65], roll: -90 }),
    par("octave", "Parry of Octave", "XVII", ["octave"],
      "Parry of Octave (against cut 4, from the guard in sixte): point dropped in octave, the cut received on the back of the sword.",
      FRONT, { hilt: [0.42, 1.0, 0.24], blade: [15, -65], roll: 90 }),
    par("low_quarte", "Parry of Low Quarte", "XVIII", ["low quarte"],
      "Parry of Low Quarte (against cut 5): hand dropped about as low as the thigh in the form of quarte.",
      SIDE, { hilt: [0.5, 0.85, 0.0], blade: [-12, 18], roll: 90 }),
    par("prime", "Parry of Prime", "XIX", ["prime", "inside half hanger"],
      "Parry of Prime (against cut 5): hilt raised to the left front about as high as the shoulder, point dropped straight down — the backswordmen’s “inside half hanger”.",
      FRONT, { hilt: [0.4, 1.42, -0.06], blade: [-8, -82], roll: 180 }),
    par("low_tierce", "Parry of Low Tierce", "XX", ["low tierce"],
      "Parry of Low Tierce (against cut 6): hand turned to tierce and dropped to the level of the thigh.",
      SIDE, { hilt: [0.5, 0.85, 0.24], blade: [8, 18], roll: -90 }),
    par("high_seconde", "Parry of High Seconde", "XXI", ["high seconde", "outside half hanger"],
      "Parry of High Seconde (against cut 6): hand raised as high as the shoulder, point lowered so the blade is nearly upright, edge to the right front — the old “outside half hanger”.",
      FRONT, { hilt: [0.45, 1.42, 0.28], blade: [12, -80], roll: -90 }),
    par("st_george_parry", "St. George’s Parry", "XXII", ["head guard", "head parry", "st george parry", "st. george's parry"],
      "St. George’s Parry, or Head Guard (against the head cut): hand raised to the front a little above the head, elbow behind the hilt, blade to the left front, point a little dropped.",
      FRONT, { hilt: [0.4, 1.85, 0.12], blade: [-70, -6], roll: 0 }),
    par("high_tierce", "Parry of High Tierce", "XXIII", ["high tierce"],
      "Parry of High Tierce: hand turned to tierce and raised to about the height of the right ear; the vertical cut at the right shoulder is taken on the forte.",
      FRONT, { hilt: [0.35, 1.62, 0.26], blade: [-35, 40], roll: -90 }),
    par("high_quarte", "Parry of High Quarte", "XXIV", ["high quarte"],
      "Parry of High Quarte: hand turned to quarte and raised about as high as the left ear, the cut taken on the forte close to the shell.",
      FRONT, { hilt: [0.32, 1.62, -0.04], blade: [20, 50], roll: 90 }),
    par("horizontal_quarte", "Parry of Horizontal Quarte", "XXV", ["horizontal quarte"],
      "Parry of Horizontal Quarte (against the vertical upward cut): hilt dropped in front of the right thigh, edge down, blade held level across the body — an Italian parry.",
      FRONT, { hilt: [0.35, 0.86, 0.24], blade: [-85, 0], roll: 0 }),
  );
  // look-alikes for Master: the same parry high or low, and the paired forms
  const T = (a, b) => window.TWINS.push(["hutton_p_" + a, "hutton_p_" + b]);
  T("quarte", "high_quarte"); T("quarte", "low_quarte"); T("quarte", "horizontal_quarte");
  T("tierce", "high_tierce"); T("tierce", "low_tierce"); T("sixte", "tierce");
  T("prime", "low_prime"); T("prime", "high_prime"); T("seconde", "high_seconde"); T("seconde", "octave");
  T("octave", "high_octave"); T("septime", "low_prime");
  // Hutton’s St. George’s Parry ("Head Guard, or St. George") is the St. George’s Guard: either answer is right
  window.EQUIVALENT.push(["hutton_st_george", "hutton_p_st_george_parry"]);
})();

// ---- Philibert de La Touche, Les Vrais Principes de l'Espée Seule (Paris, 1670): the guards ----
// Part 1, Ch. III (translation Wandrille Duchemin, Wiktenauer). The four guards are one sequence of wrist turns from the
// draw: 1st — sword on its edge, thumb outward; 2nd — on the flat, thumb underneath; 3rd — on the edge, thumb inward (the
// best and least tiring, the body upright); 4th — on the flat, thumb above. The body leans forward in the 1st, a little
// forward in the 2nd, upright in the 3rd and a little back in the 4th. He equates them with prime, seconde, tierce and
// quarte (not used as the modern names: Hutton's guards already carry Prime, Tierce and Quarte). Plates 2–5 are single
// figures ("1. Garde" … "4. Garde"; drawn and engraved by P. Brissart); Plates 6 and 8–10 show two fencers both in the
// position: the plate used is the right-hand fencer. Scans: Gallica / BnF via Wiktenauer, CC BY-NC-SA 4.0.
window.TRADITIONS.smallsword = { label: "French smallsword", color: "#8a5a1e" };
window.LOOKS.smallsword = {
  style: "fabris",
  source: "in 1670s plumed hats, long wigs, coats and petticoat breeches, after La Touche's plates",
  jackets: ["#f1e9da", "#e8dcc4", "#c9b48a", "#5a2a2a", "#2f3a4a", "#6b5a3a"],
  breeches: ["#f1e9da", "#e8dcc4", "#c9b48a", "#5a2a2a", "#2b2522"],
  hose: ["#f1e9da", "#e3d6b0", "#c9b48a", "#7a2e2e"],
  hair: ["#3b2a1d", "#5a3a22", "#2a211b", "#7a5230", "#b89a6a"],
  ruff: 0, beard: [0.85, 0.1, 0.05],
  // broad-brimmed felt hats with a plume, long wigs, lace cravats; about half in the knee-length coat (justaucorps)
  hats: ["#2b2522", "#3a2a20", "#1d1712", "#5a4a3a"], plumes: ["#f6f1e6", "#f6f1e6", "#b03a2e", "#d4a62a", "#5b6b84"], coat: 0.5,
};
window.MASTERS.push({ id: "latouche", name: "La Touche", tradition: "smallsword" });
(function () {
  const SRC = "Philibert de La Touche, Les Vrais Principes de l'Espée Seule (Paris, 1670)";
  const CREDIT = "Philibert de La Touche, Les Vrais Principes de l'Espée Seule (1670), engraving by P. Brissart · Source gallica.bnf.fr / BnF, via Wiktenauer · CC BY-NC-SA 4.0";
  const lt = (key, name, variants, plate, tip, pose) => ({
    id: "latouche_" + key, name, modern: "", variants, tradition: "smallsword", master: "latouche", source: SRC, plate,
    manuscript: { src: "assets/plates/latouche_" + key + ".jpg", credit: CREDIT },
    tip, pose, poses: [pose], sideUse: { right: true, left: false },
  });
  const S = { small: true, lead: "right", view: 155, stance: 0.72, width: 0.16, crouch: 0.18, shift: -0.08, turn: -45, twist: -5, lean: 4 };
  const P = (o) => Object.assign({}, S, o);
  window.GUARDS.push(
    lt("first", "First Guard", ["first guard", "1st guard", "premiere garde", "prime guard"],
      "Plate 2, “1. Garde”",
      "First Guard: the sword as just drawn — on its edge, thumb outward, hand high, point at the enemy; the body leans forward.",
      P({ lean: 14, hilt: [0.6, 1.62, 0.12], blade: [-4, 4], roll: -150 })),
    lt("second", "Second Guard", ["second guard", "2nd guard", "seconde garde", "seconde guard"],
      "Plate 3, “2. Garde”",
      "Second Guard: from the first by a turn of the wrist — the sword on the flat, thumb underneath; the body still leans a little forward.",
      P({ lean: 8, hilt: [0.72, 1.42, 0.1], blade: [-2, 0], roll: -90 })),
    lt("third", "Third Guard", ["third guard", "3rd guard", "troisieme garde", "tierce guard"],
      "Plate 4, “3. Garde”",
      "Third Guard: the sword on its edge, thumb inward, at a middle height, point raised at the enemy; the body upright. La Touche’s best guard.",
      P({ lean: 0, hilt: [0.55, 1.15, 0.1], blade: [-6, 24], roll: 0 })),
    lt("fourth", "Fourth Guard", ["fourth guard", "4th guard", "quatrieme garde", "quarte guard"],
      "Plate 5, “4. Garde”",
      "Fourth Guard: the sword on the flat, thumb above, arm out before you; the body leans a little back.",
      P({ lean: -5, hilt: [0.66, 1.36, 0.06], blade: [-4, 8], roll: 90 })),
    lt("quarte_low", "Quarte Guard, Point Low", ["quarte point low", "low quarte guard", "garde de quarte la pointe basse", "crossing of the swords"],
      "Plate 6, “Garde de quarte, la pointe basse, ou bien croisement d’Espée”, right figure",
      "Quarte Guard, Point Low: arm out in quarte with the point dropped, the swords crossing — La Touche faults it: too far to parry from, and it leaves the body open.",
      P({ lean: 2, hilt: [0.68, 1.3, 0.02], blade: [-8, -22], roll: 90 })),
    lt("seconde_low", "Seconde Guard, Point Low", ["seconde point low", "low seconde guard", "garde de seconde la pointe basse"],
      "Plate 8, “Garde de Seconde la pointe basse ou bien croisement d’Espée”, right figure",
      "Seconde Guard, Point Low: arm out in seconde, nails down, with the point dropped below the enemy’s, the swords crossing.",
      P({ lean: 4, hilt: [0.68, 1.36, 0.14], blade: [-6, -24], roll: -90 })),
    lt("engage_tierce", "Engagement in Tierce", ["engagement in tierce", "tierce engagement", "engagement de tierce"],
      "Plate 9, “Engagement d’Espée de Tierce, au dehors de l’Espée ennemie”, right figure",
      "Engagement in Tierce: your blade joined to the enemy’s on the outside of it, in tierce, arm out at a middle height, point in line.",
      P({ lean: 2, hilt: [0.66, 1.24, 0.18], blade: [-4, 8], roll: 0 })),
    lt("engage_quarte", "Engagement in Quarte", ["engagement in quarte", "quarte engagement", "engagement de quarte"],
      "Plate 10, “Engagement d’Espée de quarte, au dedans de l’Espée ennemie”, right figure",
      "Engagement in Quarte: your blade joined to the enemy’s on the inside of it, in quarte (nails up), arm out, point in line.",
      P({ lean: 2, hilt: [0.66, 1.26, 0.0], blade: [-10, 8], roll: 90 })),
  );
  window.TWINS.push(["latouche_first", "latouche_second"], ["latouche_third", "latouche_fourth"],
    ["latouche_quarte_low", "latouche_seconde_low"], ["latouche_engage_tierce", "latouche_engage_quarte"],
    ["latouche_fourth", "latouche_engage_quarte"], ["latouche_third", "latouche_engage_tierce"]);
})();

// ---- Player edits, thirteenth batch: Hutton dagger + La Touche (baked 2026-11-20 from Firefox stance-off-poses(3).json) ----
window.BAKED_EDITS_13 = [
  {"name":"Dagger Guard (right)","saved":"2026-11-20T09:10:20.686Z","guard":"hutton_dagger","side":"right","vi":0,"pose":{"dagger":true,"lead":"right","view":155,"stance":0.58,"width":0.22,"crouch":0.15,"shift":-0.02,"turn":-40,"twist":-5,"lean":4,"hilt":[0.502,1.1,0.122],"blade":[-5,8],"roll":-45}},
  {"name":"First Guard (right)","saved":"2026-11-20T09:13:11.037Z","guard":"latouche_first","side":"right","vi":0,"pose":{"small":true,"lead":"right","view":155,"stance":0.72,"width":0.16,"crouch":0.08,"shift":-0.1,"turn":-45,"twist":-5,"lean":14,"hilt":[0.58,1.72,0.12],"blade":[-4,4],"roll":-150,"elbowR":-100,"leftHand":[-0.15,0.827,-0.345]}},
  {"name":"Fourth Guard (right)","saved":"2026-11-20T09:16:41.973Z","guard":"latouche_fourth","side":"right","vi":0,"pose":{"small":true,"lead":"right","view":155,"stance":0.72,"width":0.16,"crouch":0.18,"shift":-0.24,"turn":-45,"twist":-5,"lean":-4,"hilt":[0.504,1.352,0.055],"blade":[-4.1,2.3],"roll":90,"leftHand":[-0.675,1.471,-0.234],"footLFwd":-0.18,"footLSide":-0.15}},
  {"name":"Quarte Guard, Point Low (right)","saved":"2026-11-20T09:19:20.465Z","guard":"latouche_quarte_low","side":"right","vi":0,"pose":{"small":true,"lead":"right","view":155,"stance":0.72,"width":0.16,"crouch":0.21,"shift":-0.26,"turn":-45,"twist":-5,"lean":2,"hilt":[0.487,1.12,0.01],"blade":[-7.4,-20.6],"roll":90,"sideLean":-2,"leftHand":[-0.384,1.346,-0.282],"footLSide":-0.12,"footLFwd":-0.12}},
  {"name":"Seconde Guard, Point Low (right)","saved":"2026-11-20T09:23:48.587Z","guard":"latouche_seconde_low","side":"right","vi":0,"pose":{"small":true,"lead":"right","view":155,"stance":0.72,"width":0.16,"crouch":0.25,"shift":-0.32,"turn":-61,"twist":-5,"lean":4,"hilt":[0.45,1.12,-0.008],"blade":[-1,-17],"roll":-90,"leftHand":[-0.456,1.16,-0.244],"kneeL":-3,"footLTurn":50,"elbowL":11,"elbowR":-74}},
  {"name":"Used in the game: Engagement in Tierce","saved":"2026-11-20T09:24:07.576Z","kind":"use","guard":"latouche_engage_tierce","used":false},
  {"name":"Used in the game: Engagement in Quarte","saved":"2026-11-20T09:24:13.508Z","kind":"use","guard":"latouche_engage_quarte","used":false},
];
for (const e of window.BAKED_EDITS_13) {
  window.BAKED_SAVED.add(e.name + "|" + e.saved); // pose-edits.js skips these
  const g = window.GUARDS.find((x) => x.id === e.guard);
  if (!g) continue;
  if (e.kind === "use") { g.unused = !e.used; continue; }
  if (e.kind === "sides") {
    g.sideUse = { right: !!e.right, left: !!e.left };
    if (e.left && !(g.sides && g.sides.left)) g.sides = Object.assign(g.sides || {}, { left: {} });
    continue;
  }
  if (!e.pose) continue;
  g.poses = g.poses || [g.pose];
  if (e.addVariant) g.poses.push(e.pose);
  else if (e.side === "left") {
    if (g.sides && g.sides.left) { (g.leftPoses = g.leftPoses || {})[e.vi || 0] = e.pose; if (!e.vi) g.sides.left.pose = e.pose; }
  } else { g.poses[e.vi || 0] = e.pose; if (!e.vi) g.pose = g.poses[0]; }
}

// ---- Pose refinement (2026-11-20): the recently imported guards the player had not edited yet, matched to their plates ----
// Feet, legs, crouch and elbows follow the engravings: Hutton's profile plates and La Touche are side views (view 180) with a
// long stance, the back leg nearly straight and the front knee over the foot; Hutton's front-on plates (view 95) stand
// narrower with the knees just bent; High Octave is seen from behind (view 300). Values are merged over each draft pose.
// Guards with player edits (Inside, Outside, Hanging, St. George's, Dagger; La Touche First, Fourth, both point-low) are not listed.
window.POSE_REFINE_1 = {
  "hutton_medium": {"view":180,"stance":0.86,"width":0.1,"crouch":0.11,"shift":0.12,"turn":-50,"twist":-8,"lean":2,"hilt":[0.5,1.05,0.1],"blade":[-4,20]},
  "hutton_p_quarte": {"view":180,"stance":0.86,"width":0.1,"crouch":0.11,"shift":0.12,"turn":-50,"twist":-8,"lean":2,"hilt":[0.46,1.1,0],"blade":[-10,36]},
  "hutton_p_high_prime": {"view":180,"stance":0.86,"width":0.1,"crouch":0.11,"shift":0.12,"turn":-50,"twist":-8,"lean":6,"hilt":[0.78,1.52,-0.02],"blade":[-14,-16]},
  "hutton_p_tierce": {"view":180,"stance":0.86,"width":0.1,"crouch":0.11,"shift":0.12,"turn":-50,"twist":-8,"lean":2,"hilt":[0.48,1.1,0.24],"blade":[6,36]},
  "hutton_p_low_quarte": {"view":180,"stance":0.86,"width":0.1,"crouch":0.11,"shift":0.12,"turn":-50,"twist":-8,"lean":2,"hilt":[0.46,0.86,0.02],"blade":[-10,34]},
  "hutton_p_low_tierce": {"view":180,"stance":0.86,"width":0.1,"crouch":0.11,"shift":0.12,"turn":-50,"twist":-8,"lean":2,"hilt":[0.46,0.86,0.22],"blade":[6,34]},
  "hutton_p_sixte": {"view":95,"stance":0.42,"width":0.17,"crouch":0.05,"shift":-0.04,"turn":-30,"twist":-5,"lean":2,"kneeR":10},
  "hutton_p_high_octave": {"view":300,"stance":0.72,"width":0.32,"crouch":0.15,"shift":0,"turn":-40,"twist":-5,"lean":4,"hilt":[0.36,1.68,0.3],"blade":[10,-80]},
  "hutton_p_low_prime": {"view":95,"stance":0.42,"width":0.17,"crouch":0.05,"shift":-0.04,"turn":-30,"twist":-5,"lean":2,"kneeR":10,"hilt":[0.36,1.14,0.02]},
  "hutton_p_septime": {"view":95,"stance":0.42,"width":0.17,"crouch":0.05,"shift":-0.04,"turn":-30,"twist":-5,"lean":2,"kneeR":10,"hilt":[0.36,0.98,0]},
  "hutton_p_seconde": {"view":95,"stance":0.42,"width":0.17,"crouch":0.05,"shift":-0.04,"turn":-30,"twist":-5,"lean":2,"kneeR":10,"hilt":[0.34,0.98,0.24]},
  "hutton_p_octave": {"view":95,"stance":0.42,"width":0.17,"crouch":0.05,"shift":-0.04,"turn":-30,"twist":-5,"lean":2,"kneeR":10,"hilt":[0.34,0.96,0.26]},
  "hutton_p_prime": {"view":95,"stance":0.42,"width":0.17,"crouch":0.05,"shift":-0.04,"turn":-30,"twist":-5,"lean":2,"kneeR":10,"hilt":[0.36,1.38,-0.22],"blade":[-12,-80]},
  "hutton_p_high_seconde": {"view":95,"stance":0.42,"width":0.17,"crouch":0.05,"shift":-0.04,"turn":-30,"twist":-5,"lean":2,"kneeR":10,"hilt":[0.46,1.42,0.5],"blade":[10,-84]},
  "hutton_p_st_george_parry": {"view":95,"stance":0.42,"width":0.17,"crouch":0.05,"shift":-0.04,"turn":-30,"twist":-5,"lean":2,"kneeR":10,"hilt":[0.3,1.68,0.4],"blade":[-75,-5]},
  "hutton_p_high_tierce": {"view":95,"stance":0.42,"width":0.17,"crouch":0.05,"shift":-0.04,"turn":-30,"twist":-5,"lean":2,"kneeR":10,"hilt":[0.3,1.6,0.3]},
  "hutton_p_high_quarte": {"view":95,"stance":0.42,"width":0.17,"crouch":0.05,"shift":-0.04,"turn":-30,"twist":-5,"lean":2,"kneeR":10},
  "hutton_p_horizontal_quarte": {"view":95,"stance":0.42,"width":0.17,"crouch":0.05,"shift":-0.04,"turn":-30,"twist":-5,"lean":2,"kneeR":10},
  "latouche_second": {"view":180,"stance":0.92,"width":0.08,"crouch":0.13,"shift":0.12,"turn":-50,"twist":-5,"lean":6,"hilt":[0.74,1.45,0.08],"blade":[-2,0]},
  "latouche_third": {"view":180,"stance":0.92,"width":0.08,"crouch":0.13,"shift":0.12,"turn":-50,"twist":-5,"lean":0,"hilt":[0.55,1.2,0.1],"blade":[-6,22]},
  "latouche_engage_tierce": {"view":180,"stance":0.92,"width":0.08,"crouch":0.13,"shift":0.12,"turn":-50,"twist":-5,"lean":2,"hilt":[0.68,1.3,0.16],"blade":[-4,-4]},
  "latouche_engage_quarte": {"view":180,"stance":0.92,"width":0.08,"crouch":0.13,"shift":0.12,"turn":-50,"twist":-5,"lean":2,"hilt":[0.68,1.3,0.02],"blade":[-8,-2]},
  "hutton_stick_quarte": {"view":120,"stance":0.62,"width":0.24,"crouch":0.1,"shift":0.02,"turn":-40,"twist":-5,"lean":4,"hilt":[0.32,0.98,0.04],"blade":[-8,8]},
  "hutton_stick_false": {"view":60,"stance":0.6,"width":0.26,"crouch":0.1,"shift":0,"turn":40,"twist":5,"lean":4,"hilt":[0.3,0.95,0.24],"blade":[12,8]},
};
for (const [id, o] of Object.entries(window.POSE_REFINE_1)) {
  const g = window.GUARDS.find((x) => x.id === id);
  if (!g) continue;
  g.pose = Object.assign({}, g.pose, o); g.poses = g.poses || [g.pose]; g.poses[0] = g.pose;
}

// ---- Player edits, fourteenth batch: La Touche Second and Third Guards (baked 2026-11-20 from Firefox stance-off-poses(4).json) ----
// Applied after POSE_REFINE_1, so the player's versions win.
window.BAKED_EDITS_14 = [
  {"name":"Second Guard (right)","saved":"2026-11-20T09:42:19.094Z","guard":"latouche_second","side":"right","vi":0,"pose":{"small":true,"lead":"right","view":180,"stance":0.92,"width":0.08,"crouch":0.13,"shift":-0.08,"turn":-50,"twist":-5,"lean":6,"hilt":[0.7,1.45,0.08],"blade":[-2,0],"roll":-90,"leftHand":[-0.196,0.765,-0.288],"elbowR":-74,"footLSide":-0.15,"kneeL":-27,"footLTurn":42,"footLFwd":0.26}},
  {"name":"Third Guard (right)","saved":"2026-11-20T09:44:52.571Z","guard":"latouche_third","side":"right","vi":0,"pose":{"small":true,"lead":"right","view":180,"stance":0.92,"width":0.08,"crouch":0.13,"shift":-0.09,"turn":-50,"twist":-5,"lean":-5,"hilt":[0.555,1.115,0.105],"blade":[-4.8,15.2],"leftHand":[-0.259,1.519,-0.212],"footLTurn":61,"footLSide":-0.13}},
];
for (const e of window.BAKED_EDITS_14) {
  window.BAKED_SAVED.add(e.name + "|" + e.saved); // pose-edits.js skips these
  const g = window.GUARDS.find((x) => x.id === e.guard);
  if (!g || !e.pose) continue;
  g.poses = g.poses || [g.pose];
  g.poses[e.vi || 0] = e.pose; if (!e.vi) g.pose = g.poses[0];
}

// ---- Player edits, fifteenth batch: Hutton Medium Guard + parries (baked 2026-11-20 from Firefox stance-off-poses(5).json) ----
// Applied after POSE_REFINE_1, so the player's versions win.
window.BAKED_EDITS_15 = [
  {"name":"Medium Guard (right)","saved":"2026-11-20T09:47:47.405Z","guard":"hutton_medium","side":"right","vi":0,"pose":{"sabre":true,"lead":"right","view":180,"stance":0.86,"width":0.1,"crouch":0.08,"shift":0.02,"turn":-50,"twist":-8,"lean":2,"hilt":[0.57,1.08,0.1],"blade":[-4,20],"roll":-45,"leftHand":[-0.165,1.101,-0.081],"elbowR":35}},
  {"name":"Parry of Quarte (right)","saved":"2026-11-20T09:49:19.729Z","guard":"hutton_p_quarte","side":"right","vi":0,"pose":{"sabre":true,"lead":"right","stance":0.86,"width":0.1,"crouch":0.11,"shift":0.12,"turn":-50,"twist":-8,"lean":2,"view":180,"hilt":[0.65,1.1,-0.13],"blade":[-10,36],"roll":90,"elbowR":14}},
  {"name":"Parry of High Prime (right)","saved":"2026-11-20T09:52:05.972Z","guard":"hutton_p_high_prime","side":"right","vi":0,"pose":{"sabre":true,"lead":"right","stance":0.86,"width":0.1,"crouch":0.05,"shift":0.12,"turn":-50,"twist":-8,"lean":6,"view":180,"hilt":[0.84,1.48,-0.16],"blade":[-14,-30],"roll":180,"elbowR":-89,"footLTurn":39,"footLFwd":0.22,"headTurn":13,"leftHand":[-0.064,1.133,-0.082]}},
  {"name":"Parry of Tierce (right)","saved":"2026-11-20T09:54:03.022Z","guard":"hutton_p_tierce","side":"right","vi":0,"pose":{"sabre":true,"lead":"right","stance":0.71,"width":0.1,"crouch":0.08,"shift":0.02,"turn":-50,"twist":-8,"lean":2,"view":180,"hilt":[0.54,1.13,0.24],"blade":[6,36],"roll":-90,"leftHand":[-0.165,1.101,-0.081],"headTurn":25}},
  {"name":"Parry of Sixte (right)","saved":"2026-11-20T09:56:23.429Z","guard":"hutton_p_sixte","side":"right","vi":0,"pose":{"sabre":true,"lead":"right","stance":0.42,"width":0.17,"crouch":0.05,"shift":-0.04,"turn":-30,"twist":-5,"lean":2,"view":95,"hilt":[0.42,1.21,0.26],"blade":[36,42],"roll":58,"kneeR":10,"elbowR":4,"headTurn":25,"leftHand":[-0.02,1.031,-0.177],"elbowL":40}},
  {"name":"Parry of High Octave (right)","saved":"2026-11-20T09:58:26.296Z","guard":"hutton_p_high_octave","side":"right","vi":0,"pose":{"sabre":true,"lead":"right","stance":0.72,"width":0.32,"crouch":0.15,"shift":-0.12,"turn":-40,"twist":-5,"lean":4,"view":300,"hilt":[0.24,1.67,0.3],"blade":[88,-71],"roll":-85,"elbowR":61,"headTurn":29,"leftHand":[-0.272,0.992,-0.161]}},
  {"name":"Parry of Low Prime (right)","saved":"2026-11-20T10:00:25.790Z","guard":"hutton_p_low_prime","side":"right","vi":0,"pose":{"sabre":true,"lead":"right","stance":0.42,"width":0.17,"crouch":0.05,"shift":-0.04,"turn":-30,"twist":-5,"lean":2,"view":95,"hilt":[0.42,0.91,-0.05],"blade":[-11,-78],"roll":180,"kneeR":10}},
];
for (const e of window.BAKED_EDITS_15) {
  window.BAKED_SAVED.add(e.name + "|" + e.saved); // pose-edits.js skips these
  const g = window.GUARDS.find((x) => x.id === e.guard);
  if (!g || !e.pose) continue;
  g.poses = g.poses || [g.pose];
  g.poses[e.vi || 0] = e.pose; if (!e.vi) g.pose = g.poses[0];
}

// ---- Player edits, sixteenth batch: the rest of Hutton's parries (baked 2026-11-20 from Firefox stance-off-poses(6).json) ----
// Applied after POSE_REFINE_1 and BAKED_EDITS_15 (this Low Prime is newer), so the player's versions win.
window.BAKED_EDITS_16 = [
  {"name":"Parry of Low Prime (right)","saved":"2026-11-20T10:03:14.391Z","guard":"hutton_p_low_prime","side":"right","vi":0,"pose":{"sabre":true,"lead":"right","stance":0.42,"width":0.17,"crouch":0.05,"shift":-0.04,"turn":-30,"twist":-5,"lean":2,"view":95,"hilt":[0.42,0.91,-0.05],"blade":[-11,-78],"roll":155,"kneeR":10,"headTurn":19,"headNod":2}},
  {"name":"Parry of Septime (right)","saved":"2026-11-20T10:04:51.503Z","guard":"hutton_p_septime","side":"right","vi":0,"pose":{"sabre":true,"lead":"right","stance":0.42,"width":0.17,"crouch":0.05,"shift":-0.04,"turn":-30,"twist":-5,"lean":2,"view":95,"hilt":[0.36,0.89,-0.13],"blade":[-12,-65],"roll":97,"kneeR":10,"headTurn":21,"headNod":2,"leftHand":[-0.179,1.081,-0.18]}},
  {"name":"Parry of Seconde (right)","saved":"2026-11-20T10:06:49.781Z","guard":"hutton_p_seconde","side":"right","vi":0,"pose":{"sabre":true,"lead":"right","stance":0.42,"width":0.17,"crouch":0.05,"shift":-0.04,"turn":-30,"twist":-5,"lean":2,"view":95,"hilt":[0.46,0.98,0.43],"blade":[15,-65],"roll":-126,"kneeR":10,"headTurn":22,"headNod":2,"leftHand":[-0.179,0.97,-0.147],"elbowL":45}},
  {"name":"Parry of Octave (right)","saved":"2026-11-20T10:08:49.271Z","guard":"hutton_p_octave","side":"right","vi":0,"pose":{"sabre":true,"lead":"right","stance":0.42,"width":0.17,"crouch":0.05,"shift":-0.04,"turn":-30,"twist":-5,"lean":2,"view":95,"hilt":[0.34,0.833,0.32],"blade":[31,-65],"roll":90,"kneeR":10,"headTurn":26,"headNod":2}},
  {"name":"Parry of Low Quarte (right)","saved":"2026-11-20T10:10:23.103Z","guard":"hutton_p_low_quarte","side":"right","vi":0,"pose":{"sabre":true,"lead":"right","stance":0.86,"width":0.1,"crouch":0.1,"shift":-0.01,"turn":-50,"twist":-8,"lean":2,"view":180,"hilt":[0.48,0.87,0.02],"blade":[-10,34],"roll":25,"leftHand":[-0.195,1.081,-0.081],"footLTurn":51,"footLSide":-0.01,"footLFwd":0.13,"elbowR":51}},
  {"name":"Parry of Prime (right)","saved":"2026-11-20T10:11:22.042Z","guard":"hutton_p_prime","side":"right","vi":0,"pose":{"sabre":true,"lead":"right","stance":0.42,"width":0.17,"crouch":0.05,"shift":-0.04,"turn":-30,"twist":-5,"lean":2,"view":95,"hilt":[0.36,1.38,-0.31],"blade":[-113,-76],"roll":113,"kneeR":10,"elbowR":-95,"headTurn":12,"headNod":2}},
  {"name":"Parry of Low Tierce (right)","saved":"2026-11-20T10:13:07.506Z","guard":"hutton_p_low_tierce","side":"right","vi":0,"pose":{"sabre":true,"lead":"right","stance":0.86,"width":0.1,"crouch":0.08,"shift":0.02,"turn":-50,"twist":-8,"lean":2,"view":180,"hilt":[0.36,0.89,0.22],"blade":[6,34],"roll":-22,"footLTurn":51,"footLFwd":0.11,"leftHand":[-0.165,1.101,-0.081],"elbowR":118,"headTurn":28,"headNod":2}},
  {"name":"Parry of High Seconde (right)","saved":"2026-11-20T10:15:17.754Z","guard":"hutton_p_high_seconde","side":"right","vi":0,"pose":{"sabre":true,"lead":"right","stance":0.42,"width":0.17,"crouch":0.05,"shift":-0.04,"turn":-30,"twist":-5,"lean":2,"view":95,"hilt":[0.54,1.24,0.5],"blade":[10,-66],"roll":-152,"kneeR":10,"headTurn":38,"headNod":2,"elbowR":-89}},
  {"name":"St. George’s Parry (right)","saved":"2026-11-20T10:16:19.687Z","guard":"hutton_p_st_george_parry","side":"right","vi":0,"pose":{"sabre":true,"lead":"right","stance":0.42,"width":0.17,"crouch":0.05,"shift":-0.04,"turn":-30,"twist":-5,"lean":2,"view":95,"hilt":[0.3,1.76,0.4],"blade":[-75,7],"roll":-118,"kneeR":10,"headTurn":34,"headNod":2}},
  {"name":"Parry of High Tierce (right)","saved":"2026-11-20T10:20:25.928Z","guard":"hutton_p_high_tierce","side":"right","vi":0,"pose":{"sabre":true,"lead":"right","stance":0.42,"width":0.17,"crouch":0.05,"shift":-0.04,"turn":-30,"twist":-5,"lean":2,"view":95,"hilt":[0.39,1.6,0.2],"blade":[-79,62],"roll":-22,"kneeR":10,"leftHand":[-0.179,1.021,-0.18],"elbowL":9,"headTurn":19,"elbowR":30}},
  {"name":"Parry of High Quarte (right)","saved":"2026-11-20T10:21:14.139Z","guard":"hutton_p_high_quarte","side":"right","vi":0,"pose":{"sabre":true,"lead":"right","stance":0.42,"width":0.17,"crouch":0.05,"shift":-0.04,"turn":-30,"twist":-5,"lean":2,"view":95,"hilt":[0.32,1.68,-0.19],"blade":[20,50],"roll":90,"kneeR":10,"headTurn":23}},
  {"name":"Parry of Horizontal Quarte (right)","saved":"2026-11-20T10:21:26.393Z","guard":"hutton_p_horizontal_quarte","side":"right","vi":0,"pose":{"sabre":true,"lead":"right","stance":0.42,"width":0.17,"crouch":0.05,"shift":-0.04,"turn":-30,"twist":-5,"lean":2,"view":95,"hilt":[0.35,0.86,0.24],"blade":[-85,0],"roll":-53,"kneeR":10}},
];
for (const e of window.BAKED_EDITS_16) {
  window.BAKED_SAVED.add(e.name + "|" + e.saved); // pose-edits.js skips these
  const g = window.GUARDS.find((x) => x.id === e.guard);
  if (!g || !e.pose) continue;
  g.poses = g.poses || [g.pose];
  g.poses[e.vi || 0] = e.pose; if (!e.vi) g.pose = g.poses[0];
}

// ---- Kept apart: guards of different masters that share a hand position (prime, seconde, tierce, quarte) ----
// They are NOT the same guard — choosing one for the other is still wrong — but showing them in the same question
// would be confusing, so two guards in one group from different masters never appear together. Within one master
// (e.g. Hutton's Quarte and High Quarte) they still can: those are deliberate look-alikes.
window.APART = [
  ["fabris_prima", "hutton_hanging", "hutton_p_prime", "hutton_p_high_prime", "hutton_p_low_prime", "latouche_first"],
  ["fabris_seconda", "hutton_p_seconde", "hutton_p_high_seconde", "latouche_second", "latouche_seconde_low"],
  ["fabris_terza", "hutton_outside", "hutton_p_tierce", "hutton_p_low_tierce", "hutton_p_high_tierce", "latouche_third", "latouche_engage_tierce"],
  ["fabris_quarta", "hutton_inside", "hutton_p_quarte", "hutton_p_low_quarte", "hutton_p_high_quarte", "hutton_p_horizontal_quarte",
   "latouche_fourth", "latouche_quarte_low", "latouche_engage_quarte"],
];

// ---- Player edits, seventeenth batch: Hutton parries switched off (baked 2026-11-20 from Firefox stance-off-poses(7).json) ----
window.BAKED_EDITS_17 = [
  {"name":"Used in the game: Parry of Low Prime","saved":"2026-11-20T10:46:16.268Z","kind":"use","guard":"hutton_p_low_prime","used":false},
  {"name":"Used in the game: Parry of Septime","saved":"2026-11-20T10:46:18.364Z","kind":"use","guard":"hutton_p_septime","used":false},
  {"name":"Used in the game: Parry of Seconde","saved":"2026-11-20T10:46:21.198Z","kind":"use","guard":"hutton_p_seconde","used":false},
  {"name":"Used in the game: Parry of Octave","saved":"2026-11-20T10:46:23.566Z","kind":"use","guard":"hutton_p_octave","used":false},
];
for (const e of window.BAKED_EDITS_17) {
  window.BAKED_SAVED.add(e.name + "|" + e.saved); // pose-edits.js skips these
  const g = window.GUARDS.find((x) => x.id === e.guard);
  if (g && e.kind === "use") g.unused = !e.used;
}
