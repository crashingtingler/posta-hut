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
