// The Armoury: spend XP on weapons, daggers, bucklers, garb, armour, headwear, belts and guards for your own fencer,
// and set up the fencer's build, skin, hair and facial hair (free). Your fencer starts in linen braies with an oak waster,
// standing at ease. Bought things are kept per player name (players[name].owned / .kit / .spent). Spending never lowers
// the XP shown in the Hall of Masters: the purse is XP earned minus XP spent. Quiz fencers keep their historical dress.
// Prices are placeholders: everything costs PRICE for now.
(function () {
  const PRICE = 100;
  const SKIN0 = "#f0d9b8", SKIN = "skin"; // "skin" in a garb's colours = the fencer's own skin tone
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const mix = (a, b, t) => { const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
    return "#" + [16, 8, 0].map((s) => Math.round(((pa >> s) & 255) * (1 - t) + ((pb >> s) & 255) * t).toString(16).padStart(2, "0")).join(""); };
  const BRONZE_BLADE = "#b8873a";

  // ---------- colour palettes ----------
  const PALETTES = {
    skin: [["#f3dcc8", "Porcelain"], ["#f0d9b8", "Fair"], ["#e3b994", "Light"], ["#c98e62", "Tan"], ["#a86b45", "Brown"], ["#7d4a2e", "Deep brown"], ["#55331f", "Dark"]],
    hair: [["#1d1712", "Black"], ["#3b2a1d", "Dark brown"], ["#6b4a2a", "Brown"], ["#7a3a1e", "Auburn"], ["#b5602a", "Ginger"], ["#c9a66b", "Blond"],
      ["#e0c98f", "Flaxen"], ["#8f8a84", "Grey"], ["#e8e4dc", "White"], ["#2f4f8f", "Blue"], ["#3f6b3a", "Green"], ["#c06a8a", "Pink"]],
    cloth: [["#8e2b23", "Red"], ["#1d1712", "Black"], ["#f1e9da", "White"], ["#2a3d6e", "Blue"], ["#7d8fa8", "Sky"], ["#3f5a37", "Green"],
      ["#d9b85c", "Yellow"], ["#5e3a7a", "Purple"], ["#6b4a2c", "Brown"], ["#b89a6a", "Tan"], ["#c98a8a", "Rose"], ["#1f2a44", "Indigo"]],
    metal: [["#c9ccce", "Bright"], ["#9a9c99", "Steel"], ["#3b4a66", "Blued"], ["#2a2724", "Black"], ["#7a4a2a", "Russet"], ["#c9a24a", "Gilt"],
      ["#a8743a", "Bronze"], ["#8e2b23", "Red paint"], ["#3f5a37", "Green paint"], ["#f1e9da", "White paint"]],
    leather: [["#5a3a22", "Brown"], ["#9a6a3a", "Tan"], ["#1d1712", "Black"], ["#8e2b23", "Red"], ["#2a3d6e", "Blue"], ["#3f5a37", "Green"],
      ["#d9b85c", "Yellow"], ["#f1e9da", "White"], ["#5e3a7a", "Purple"], ["#c9a24a", "Gold"]],
  };

  // ---------- weapons ----------
  // Hilt finishes; every model (except a few one-offs) also comes in wood (a waster, bokken, singlestick ...).
  const FINISH = [
    { id: "steel", label: "Steel", hilt: "#8f918d" }, { id: "silver", label: "Silver", hilt: "#d5d8db" },
    { id: "black", label: "Black", hilt: "#2a2724" }, { id: "bronze", label: "Bronze", hilt: "#a8743a" },
    { id: "gold", label: "Gold", hilt: "#d4a62a" }, { id: "wood", label: "Wood", hilt: "#7a5230" },
  ];
  // Medieval blades are named by Ewart Oakeshott's typology (The Sword in the Age of Chivalry, 1964).
  const SWORD_CLASSES = [
    { id: "long", label: "Longswords", wood: "waster" },
    { id: "two", label: "Two-handers", wood: "waster" },
    { id: "arming", label: "Arming swords", wood: "waster" },
    { id: "rapier", label: "Rapiers", wood: "wooden rapier" },
    { id: "sabre", label: "Sabres", wood: "singlestick" },
    { id: "small", label: "Smallswords", wood: "wooden smallsword" },
    { id: "ancient", label: "Ancient", wood: "wooden trainer" },
    { id: "japan", label: "Japanese", wood: "bokken" },
    { id: "iberia", label: "Portuguese & Iberian", wood: "waster" },
    { id: "africa", label: "African", wood: "wooden trainer" },
    { id: "filipino", label: "Filipino & eskrima", wood: "wooden trainer" },
    { id: "axes", label: "Axes", wood: "wooden trainer" },
    { id: "maces", label: "Maces, hammers & clubs", wood: "wooden trainer" },
    { id: "spears", label: "Spears", wood: "wooden trainer" },
    { id: "polearms", label: "Polearms", wood: "wooden trainer" },
    { id: "americas", label: "Indigenous Americas", wood: "wooden trainer" },
    { id: "oceania", label: "Australia & Oceania", wood: "" },
    { id: "other", label: "Other arms", wood: "" },
  ];
  const SWORDS = [
    // longswords
    { id: "l13a", cls: "long", name: "Grete Sword", note: "Oakeshott Type XIIIa · 1300s · broad blade, rounded point",
      spec: { blade: 0.98, grip: 0.26, w: 1.12, shape: "parallel", cross: 0.14, pommelStyle: "wheel", pommel: 0.036 } },
    { id: "l15a", cls: "long", name: "Longsword XVa", note: "Oakeshott Type XVa · c. 1350–1450 · acute thrusting point",
      spec: { blade: 0.9, grip: 0.25, w: 1, shape: "acute", cross: 0.12, pommelStyle: "scent", pommel: 0.026 } },
    { id: "l17", cls: "long", name: "Longsword XVII", note: "Oakeshott Type XVII · c. 1360–1420 · stiff hexagonal blade",
      spec: { blade: 0.93, grip: 0.27, w: 0.9, shape: "acute", cross: 0.13, crossStyle: "flare", pommelStyle: "wheel", pommel: 0.034 } },
    { id: "l18a", cls: "long", name: "Longsword XVIIIa", note: "Oakeshott Type XVIIIa · late 1400s · quillons curved toward the blade",
      spec: { blade: 0.95, grip: 0.26, w: 1.05, shape: "taper", cross: 0.13, crossStyle: "droop", pommelStyle: "pear", pommel: 0.028 } },
    { id: "l18b", cls: "long", name: "Alexandria Arsenal Longsword", note: "Oakeshott Type XVIIIb · a European blade kept in the Mamluk arsenal at Alexandria, its Arabic arsenal inscription inlaid by the hilt",
      spec: { blade: 0.92, grip: 0.28, w: 1, shape: "taper", cross: 0.12, pommelStyle: "wheel", pommel: 0.032, band: true } },
    { id: "l20", cls: "long", name: "Longsword XX", note: "Oakeshott Type XX · c. 1350–1420 · broad, with two or three fullers",
      spec: { blade: 0.94, grip: 0.26, w: 1.15, shape: "taper", cross: 0.135, pommelStyle: "wheel", pommel: 0.036 } },
    { id: "feder", cls: "long", name: "Feder", note: "German fencing trainer with a schilt, as in Meyer's woodcuts (1570)",
      spec: { blade: 0.98, grip: 0.28, w: 0.75, shape: "parallel", cross: 0.14, pommelStyle: "pear", pommel: 0.026, schilt: true } },
    { id: "federtulip", cls: "long", name: "Tulip Feder", note: "Fencing trainer with a large tulip-shaped schilt, its upper corners flaring into lobes",
      spec: { blade: 0.98, grip: 0.28, w: 0.75, shape: "parallel", cross: 0.14, pommelStyle: "pear", pommel: 0.026, schilt: "tulip" } },
    { id: "squillon", cls: "long", name: "S-Quillon Longsword", note: "Late 1400s · the cross bent into an S lying flat, the blade through its middle",
      spec: { blade: 0.95, grip: 0.27, w: 1, shape: "taper", cross: 0.14, crossStyle: "s", pommelStyle: "pear", pommel: 0.03 } },
    { id: "cluny", cls: "long", name: "The Cluny Sword", note: "Oakeshott Type XVa, late 1400s · Musée de Cluny, Paris · long grip, slender point, S-shaped cross, round coin pommel",
      spec: { blade: 0.93, grip: 0.28, w: 0.95, shape: "acute", cross: 0.125, crossStyle: "s", pommelStyle: "wheel", pommel: 0.033, gripColor: "#3a2618" } },
    { id: "writhen", cls: "long", name: "The Writhen-hilt Sword", note: "Royal Armouries IX.949, c. 1480, probably German · ex Spitzer and Hearst collections · a straight writhen cross, an inverted-pyramid pommel, its original wooden grip",
      spec: { blade: 0.92, grip: 0.25, w: 1, shape: "acute", cross: 0.13, crossStyle: "straight", pommelStyle: "pyramid", pommel: 0.032, writhen: true, gripColor: "#7a5230" } },
    { id: "flamberge", cls: "long", name: "Flamberge Longsword", note: "Wavy 'flame' blade · German, late 1500s",
      spec: { blade: 0.95, grip: 0.27, w: 1, shape: "taper", cross: 0.13, crossStyle: "flare", pommelStyle: "pear", pommel: 0.028, flame: { from: 0.12, amp: 0.008, n: 8 } } },
    // two-handers
    { id: "spadone", cls: "two", name: "Spadone", note: "Italian two-hander, 1500s · as taught by Marozzo and di Grassi · ricasso and parrying hooks",
      spec: { blade: 1.2, grip: 0.36, w: 1, shape: "taper", cross: 0.2, crossStyle: "flare", ring: true, ring2: true, pommelStyle: "pear", pommel: 0.035, handB: 0.28, ricasso: 0.2, hooks: { at: 0.2, len: 0.04 } } },
    { id: "zwei", cls: "two", name: "Zweihänder", note: "German Landsknecht greatsword, c. 1550 · leather-wrapped ricasso, parrying hooks",
      spec: { blade: 1.25, grip: 0.42, w: 1.05, shape: "taper", cross: 0.24, crossStyle: "droop", ring: true, ring2: true, pommelStyle: "pear", pommel: 0.04, handB: 0.32, ricasso: 0.24, hooks: { at: 0.24, len: 0.045 } } },
    { id: "swiss2h", cls: "two", name: "Swiss Two-hander", note: "Schweizer Zweihänder, c. 1500 · straight quillons and a side ring",
      spec: { blade: 1.15, grip: 0.34, w: 1, shape: "taper", cross: 0.2, crossStyle: "flare", ring: true, pommelStyle: "scent", pommel: 0.032, handB: 0.27 } },
    { id: "richt", cls: "two", name: "Executioner's Sword", note: "Richtschwert, German, 1600s · broad, square-ended, inscribed; made for one purpose",
      spec: { blade: 0.84, grip: 0.27, w: 1.4, prof: [1, 1, 1, 0.98, 0.95, 0.92], cross: 0.11, pommelStyle: "pear", pommel: 0.032, band: true, handB: 0.2 } },
    { id: "flammen", cls: "two", name: "Flammenschwert", note: "Flamberge two-hander · German, c. 1580 · wavy blade above the ricasso",
      spec: { blade: 1.25, grip: 0.42, w: 1.05, shape: "taper", cross: 0.24, crossStyle: "droop", ring: true, ring2: true, pommelStyle: "pear", pommel: 0.04, handB: 0.32, ricasso: 0.24, hooks: { at: 0.24, len: 0.045 }, flame: { from: 0.26, amp: 0.012, n: 7 } } },
    // arming swords
    { id: "a10", cls: "arming", name: "Arming Sword X", note: "Oakeshott Type X · c. 900–1100 · the broad 'Viking' blade, brazil-nut pommel",
      spec: { blade: 0.78, grip: 0.11, w: 1.2, shape: "parallel", cross: 0.08, pommelStyle: "nut", pommel: 0.032 } },
    { id: "a11", cls: "arming", name: "Arming Sword XI", note: "Oakeshott Type XI · 1100s · long and narrow",
      spec: { blade: 0.84, grip: 0.11, w: 0.82, shape: "parallel", cross: 0.1, pommelStyle: "nut", pommel: 0.03 } },
    { id: "a12", cls: "arming", name: "Arming Sword XII", note: "Oakeshott Type XII · c. 1170–1350 · tapering, wheel pommel",
      spec: { blade: 0.8, grip: 0.12, w: 1, shape: "taper", cross: 0.1, pommelStyle: "wheel", pommel: 0.032 } },
    { id: "a14", cls: "arming", name: "Arming Sword XIV", note: "Oakeshott Type XIV · c. 1270–1340 · short broad blade, curved cross",
      spec: { blade: 0.72, grip: 0.11, w: 1.25, shape: "taper", cross: 0.11, crossStyle: "droop", pommelStyle: "wheel", pommel: 0.035 } },
    { id: "a16", cls: "arming", name: "Arming Sword XVI", note: "Oakeshott Type XVI · early 1300s · cut-and-thrust",
      spec: { blade: 0.8, grip: 0.12, w: 1.05, shape: "acute", cross: 0.1, pommelStyle: "scent", pommel: 0.026 } },
    { id: "a15", cls: "arming", name: "Alexandria Arsenal Arming Sword", note: "Oakeshott Type XV · one of the European swords in the Mamluk arsenal at Alexandria, with its inscription",
      spec: { blade: 0.78, grip: 0.12, w: 1, shape: "acute", cross: 0.1, crossStyle: "flare", pommelStyle: "wheel", pommel: 0.03, band: true } },
    { id: "messer", cls: "arming", name: "Langes Messer", note: "German long knife, 1400s · single edge, gently curved",
      spec: { blade: 0.8, grip: 0.14, w: 1.1, shape: "taper", curve: 0.025, cross: 0.1, pommelStyle: "cap", pommel: 0.02 } },
    // rapiers
    { id: "r_ring", cls: "rapier", name: "Ring-hilt Rapier", note: "Italian, c. 1600 · as Fabris fenced with it",
      spec: { blade: 1.08, grip: 0.12, w: 0.5, cross: 0.13, ring: true, bow: true, pommel: 0.028 } },
    { id: "r_swept", cls: "rapier", name: "Swept-hilt Rapier", note: "c. 1580–1620 · bars sweeping round the hand",
      spec: { blade: 1.08, grip: 0.12, w: 0.5, cross: 0.13, ring: true, bow: true, bars: true, pommelStyle: "pear", pommel: 0.024 } },
    { id: "r_cup", cls: "rapier", name: "Cup-hilt Rapier", note: "Spanish taza, mid-1600s · a deep cup and long quillons",
      spec: { blade: 1.1, grip: 0.12, w: 0.46, cross: 0.15, cup: 0.075, cupD: 0.06, bow: true, pommel: 0.025 } },
    { id: "r_papp", cls: "rapier", name: "Pappenheimer", note: "Thirty Years' War · pierced shells and swept bars",
      spec: { blade: 1.05, grip: 0.12, w: 0.55, cross: 0.13, shells: 0.045, bars: true, bow: true, pommelStyle: "pear", pommel: 0.024 } },
    { id: "r_flame", cls: "rapier", name: "Flamberge Rapier", note: "Rapier with a wavy blade · c. 1620",
      spec: { blade: 1.06, grip: 0.12, w: 0.55, cross: 0.13, ring: true, bow: true, pommelStyle: "pear", pommel: 0.024, flame: { from: 0.08, amp: 0.005, n: 12 } } },
    // sabres
    { id: "s_hutton", cls: "sabre", name: "Cavalry Sabre", note: "British pattern · as in Hutton's Cold Steel (1889)",
      spec: { blade: 0.86, grip: 0.13, w: 0.62, curve: 0.06, cross: 0.04, bow: true, pommelStyle: "cap", pommel: 0.022 } },
    { id: "s_swiss", cls: "sabre", name: "Swiss Sabre", note: "Schweizersäbel, c. 1550 · hand-and-a-half grip, knuckle bow and side ring",
      spec: { blade: 0.88, grip: 0.2, w: 0.85, curve: 0.03, cross: 0.1, ring: true, bow: true, pommelStyle: "cap", pommel: 0.02, handB: 0.15 } },
    { id: "s_karabela", cls: "sabre", name: "Karabela", note: "Polish-Lithuanian nobleman's sabre, 1600s · eagle-head pommel",
      spec: { blade: 0.8, grip: 0.12, w: 0.75, curve: 0.09, cross: 0.075, crossStyle: "flare", pommelStyle: "eagle" } },
    { id: "s_1796", cls: "sabre", name: "1796 Light Cavalry Sabre", note: "British · broad and deeply curved",
      spec: { blade: 0.83, grip: 0.13, w: 0.9, curve: 0.13, cross: 0.04, bow: true, pommelStyle: "cap", pommel: 0.022 } },
    { id: "s_shamshir", cls: "sabre", name: "Shamshir", note: "Persian, 1600s · a slender crescent",
      spec: { blade: 0.82, grip: 0.12, w: 0.6, curve: 0.2, cross: 0.07, crossStyle: "flare", pommelStyle: "cap", pommel: 0.02 } },
    // smallswords
    { id: "sm_cup", cls: "small", name: "Smallsword", note: "French, c. 1670 · round cup, as in La Touche",
      spec: { blade: 0.98, grip: 0.11, w: 0.42, cross: 0.05, cup: 0.058, bow: true, bowW: 0.032, pommel: 0.024 } },
    { id: "sm_shell", cls: "small", name: "Shell-guard Smallsword", note: "c. 1700 · twin shells",
      spec: { blade: 0.96, grip: 0.11, w: 0.42, cross: 0.05, shells: 0.04, bow: true, bowW: 0.032, pommelStyle: "pear", pommel: 0.022 } },
    { id: "sm_colich", cls: "small", name: "Colichemarde", note: "c. 1680–1720 · broad forte, slender foible",
      spec: { blade: 0.95, grip: 0.11, w: 0.36, forte: [0.28, 1.7], cross: 0.05, shells: 0.038, bow: true, bowW: 0.032, pommel: 0.022 } },
    { id: "sm_court", cls: "small", name: "Court Sword", note: "1700s dress sword · worn more than drawn",
      spec: { blade: 0.85, grip: 0.1, w: 0.4, cross: 0.05, shells: 0.03, bow: true, bowW: 0.03, pommelStyle: "pear", pommel: 0.022, gripColor: "#7e2620" } },
    // ancient
    { id: "khopesh", cls: "ancient", name: "Khopesh", note: "Egypt, c. 1300 BC · bronze sickle-sword",
      spec: { blade: 0.55, grip: 0.13, w: 1.2, prof: [0.8, 0.8, 1.2, 1.45, 1.2, 0.3], curve: 0.28, curveStart: 0.38, cross: 0.03, pommelStyle: "cap", pommel: 0.02, bladeColor: BRONZE_BLADE } },
    { id: "naue", cls: "ancient", name: "Bronze Leaf Sword", note: "Bronze Age, Naue II type · c. 1200 BC",
      spec: { blade: 0.6, grip: 0.11, prof: [0.75, 0.8, 0.95, 1.05, 0.8, 0.05], cross: 0.04, pommelStyle: "fishtail", bladeColor: BRONZE_BLADE } },
    { id: "xiphos", cls: "ancient", name: "Xiphos", note: "Greek hoplite's leaf-shaped sword · 400s BC",
      spec: { blade: 0.6, grip: 0.11, prof: [0.9, 0.8, 1.05, 1.3, 1.1, 0.5, 0.05], cross: 0.05, pommelStyle: "ball", pommel: 0.025 } },
    { id: "kopis", cls: "ancient", name: "Kopis", note: "Greek forward-curved chopper · 400s BC",
      spec: { blade: 0.62, grip: 0.11, w: 1.1, prof: [0.8, 0.9, 1.25, 1.4, 1.2, 0.1], curve: -0.06, cross: 0.04, pommelStyle: "eagle" } },
    { id: "falcata", cls: "ancient", name: "Falcata", note: "Iberian, 400s BC · forward curve, hooked bird-head hilt",
      spec: { blade: 0.55, grip: 0.1, w: 1.15, prof: [0.9, 1, 1.3, 1.35, 1, 0.05], curve: -0.07, cross: 0.02, pommelStyle: "eagle" } },
    { id: "gladius", cls: "ancient", name: "Gladius", note: "Roman, 'Pompeii' pattern · 1st century AD",
      spec: { blade: 0.5, grip: 0.1, w: 1.15, prof: [1, 1, 1, 0.98, 0.95, 0.05], cross: 0, crossStyle: "disc", tsuba: 0.042, pommelStyle: "ball", pommel: 0.03, gripColor: "#d9c9a0" } },
    { id: "spatha", cls: "ancient", name: "Spatha", note: "Late Roman cavalry sword · 300s AD",
      spec: { blade: 0.78, grip: 0.11, w: 1, prof: [1, 1, 0.95, 0.9, 0.3], cross: 0, crossStyle: "disc", tsuba: 0.04, pommelStyle: "nut", pommel: 0.028 } },
    { id: "latene", cls: "ancient", name: "La Tène Sword", note: "Celtic, c. 200 BC · long and blunt-pointed",
      spec: { blade: 0.78, grip: 0.12, w: 0.95, prof: [1, 1, 1, 0.95, 0.6], cross: 0.04, crossStyle: "droop", pommelStyle: "ball", pommel: 0.024 } },
    { id: "jian", cls: "ancient", name: "Jian", note: "Chinese straight double-edged sword",
      spec: { blade: 0.75, grip: 0.16, w: 0.8, prof: [1, 0.95, 0.9, 0.85, 0.05], cross: 0.06, crossStyle: "flare", pommelStyle: "ball", pommel: 0.025 } },
    { id: "falx", cls: "ancient", name: "Falx", note: "Dacian two-handed inward-curved blade · 100 AD",
      spec: { blade: 0.85, grip: 0.38, w: 0.95, prof: [0.9, 1, 1.1, 1.1, 0.2], curve: -0.22, curveStart: 0.3, cross: 0, pommelStyle: "cap", pommel: 0.022, handB: 0.28 } },
    // Japanese
    { id: "j_katana", cls: "japan", name: "Katana", note: "Japan, Edo period · worn edge-up through the sash",
      spec: { blade: 0.71, grip: 0.27, w: 0.75, t: 0.42, curve: 0.025, cross: 0, crossStyle: "disc", tsuba: 0.04, pommelStyle: "cap", gripR: 0.019, gripColor: "#1f2438", handB: 0.21 } },
    { id: "j_tachi", cls: "japan", name: "Tachi", note: "Japan, Kamakura period · deeper curve, slung edge-down",
      spec: { blade: 0.78, grip: 0.26, w: 0.72, t: 0.42, curve: 0.045, cross: 0, crossStyle: "disc", tsuba: 0.042, pommelStyle: "cap", gripR: 0.019, gripColor: "#3a2a20", handB: 0.2 } },
    { id: "j_waki", cls: "japan", name: "Wakizashi", note: "The short companion sword",
      spec: { blade: 0.5, grip: 0.18, w: 0.72, t: 0.42, curve: 0.018, cross: 0, crossStyle: "disc", tsuba: 0.034, pommelStyle: "cap", gripR: 0.018, gripColor: "#1f2438", handB: 0.13 } },
    { id: "j_odachi", cls: "japan", name: "Ōdachi", note: "The great field sword, carried on the back",
      spec: { blade: 1.1, grip: 0.4, w: 0.8, t: 0.42, curve: 0.05, cross: 0, crossStyle: "disc", tsuba: 0.048, pommelStyle: "cap", gripR: 0.02, gripColor: "#1f2438", handB: 0.3 } },
    // Portuguese and Iberian
    { id: "p_montante", cls: "iberia", name: "Montante", note: "Portuguese two-hander · as taught by Godinho (1599) and Figueiredo (1651)",
      spec: { blade: 1.25, grip: 0.36, w: 1.05, shape: "taper", cross: 0.2, crossStyle: "flare", ring: true, ring2: true, pommelStyle: "pear", pommel: 0.035, handB: 0.28 } },
    { id: "p_preta", cls: "iberia", name: "Espada Preta", note: "Iberian 'black sword' for practice · blunt and blackened",
      spec: { blade: 0.95, grip: 0.13, w: 0.85, shape: "parallel", cross: 0.13, ring: true, pommelStyle: "pear", pommel: 0.026, bladeColor: "#3d3a37" } },
    { id: "p_ropera", cls: "iberia", name: "Espada Ropera", note: "Iberian 'sword of the robe', c. 1500–1550 · the first rapiers",
      spec: { blade: 0.95, grip: 0.12, w: 0.72, cross: 0.12, ring: true, bow: true, pommelStyle: "scent", pommel: 0.024 } },
    // African
    { id: "shotel", cls: "africa", name: "Shotel", note: "Ethiopian sickle sword · reaches round a shield",
      spec: { blade: 0.85, grip: 0.13, w: 0.8, prof: [1, 1, 0.9, 0.05], curve: 0.42, curveStart: 0.05, cross: 0, pommelStyle: "cap", pommel: 0.02, gripColor: "#3a2618" } },
    { id: "takouba", cls: "africa", name: "Takouba", note: "Tuareg broadsword · Sahara",
      spec: { blade: 0.85, grip: 0.13, w: 0.95, prof: [1, 1, 0.95, 0.5], cross: 0.07, pommelStyle: "pear", pommel: 0.03 } },
    { id: "kaskara", cls: "africa", name: "Kaskara", note: "Sudanese straight sword with a cross hilt",
      spec: { blade: 0.9, grip: 0.13, w: 1, prof: [1, 1, 1, 0.6], cross: 0.11, pommelStyle: "wheel", pommel: 0.03 } },
    { id: "ida", cls: "africa", name: "Ida", note: "Yoruba leaf-bladed sword · Nigeria",
      spec: { blade: 0.7, grip: 0.13, prof: [0.8, 0.95, 1.2, 1.4, 1, 0.1], cross: 0, pommelStyle: "ball", pommel: 0.028 } },
    { id: "seme", cls: "africa", name: "Seme", note: "Maasai short sword · East Africa",
      spec: { blade: 0.45, grip: 0.11, prof: [0.6, 1.1, 1.5, 1.4, 0.8, 0.05], cross: 0.03, pommelStyle: "cap", pommel: 0.02, gripColor: "#8e2b23" } },
    { id: "flyssa", cls: "africa", name: "Flyssa", note: "Kabyle long thrusting sword · Algeria",
      spec: { blade: 0.85, grip: 0.13, w: 0.6, shape: "acute", cross: 0, pommelStyle: "eagle" } },
    // Filipino
    { id: "olisi", cls: "filipino", single: true, name: "Eskrima Stick", note: "Rattan olisi · Filipino martial arts, often fought in pairs",
      spec: { blade: 0.62, grip: 0.09, w: 0.75, round: true, prof: [1, 1], cross: 0, pommelStyle: "none", gripColor: "#c9a86a", bladeColor: "#c9a86a" } },
    { id: "bolo", cls: "filipino", name: "Bolo", note: "Filipino working and fighting blade",
      spec: { blade: 0.4, grip: 0.13, w: 1.2, prof: [0.8, 1, 1.3, 1.5, 1, 0.2], curve: 0.01, cross: 0, pommelStyle: "cap", pommel: 0.02 } },
    { id: "barong", cls: "filipino", name: "Barong", note: "Leaf-shaped blade of the Tausug",
      spec: { blade: 0.42, grip: 0.13, w: 1.4, prof: [0.9, 1.3, 1.6, 1.4, 0.8, 0.05], cross: 0, pommelStyle: "pear", pommel: 0.03 } },
    { id: "kampilan", cls: "filipino", name: "Kampilan", note: "Long single-edged sword of Mindanao, flaring to the tip",
      spec: { blade: 0.85, grip: 0.2, w: 1, prof: [0.6, 0.8, 1, 1.3, 1.5], cross: 0.05, crossStyle: "flare", pommelStyle: "fishtail", handB: 0.15 } },
    { id: "ginunting", cls: "filipino", name: "Ginunting", note: "Clip-pointed fighting blade",
      spec: { blade: 0.5, grip: 0.13, w: 1, curve: 0.02, prof: [1, 1, 1.05, 0.9, 0.05], cross: 0, pommelStyle: "cap", pommel: 0.02 } },
    // axes and pole-axes (blade = haft above the front hand, grip = haft below it)
    { id: "bearded", cls: "axes", name: "Bearded Axe", note: "Norse one-handed axe · 900s–1000s",
      spec: { blade: 0.6, grip: 0.12, gripColor: "#7a5230", gripR: 0.016, cross: 0, pommelStyle: "cap", pommel: 0.02, axe: { at: 0.96, len: 0.12, h: 0.07, beard: 0.09 } } },
    { id: "dane", cls: "axes", name: "Dane Axe", note: "Long-hafted two-handed axe · 1000s–1200s",
      spec: { blade: 0.95, grip: 0.45, handB: 0.4, gripColor: "#7a5230", gripR: 0.016, cross: 0, pommelStyle: "cap", pommel: 0.02, axe: { at: 0.97, len: 0.17, h: 0.2, beard: 0.06 } } },
    { id: "francisca", cls: "axes", name: "Francisca", note: "Frankish throwing axe · 500s",
      spec: { blade: 0.38, grip: 0.06, gripColor: "#7a5230", gripR: 0.016, cross: 0, pommelStyle: "cap", pommel: 0.02, axe: { at: 0.94, len: 0.13, h: 0.06, beard: 0.05 } } },
    { id: "pollaxe", cls: "polearms", name: "Pollaxe", note: "Axe, hammer and spike · 1400s, as in Le Jeu de la Hache",
      spec: { blade: 1, grip: 0.55, handB: 0.45, gripColor: "#7a5230", gripR: 0.016, cross: 0, pommelStyle: "cap", pommel: 0.02, axe: { at: 0.88, len: 0.1, h: 0.1, back: "hammer", spike: 0.18, langets: 0.3 } } },
    { id: "halberd", cls: "polearms", name: "Swiss Halberd", note: "Axe, back hook and long spike · Swiss, c. 1500",
      spec: { blade: 1.25, grip: 0.55, handB: 0.45, gripColor: "#7a5230", gripR: 0.016, cross: 0, pommelStyle: "cap", pommel: 0.02, axe: { at: 0.86, len: 0.15, h: 0.16, back: "hook", spike: 0.3, langets: 0.3 } } },
    { id: "bardiche", cls: "polearms", name: "Bardiche", note: "Long crescent blade on a pole · Muscovy, 1500s",
      spec: { blade: 0.9, grip: 0.5, handB: 0.42, gripColor: "#7a5230", gripR: 0.016, cross: 0, pommelStyle: "cap", pommel: 0.02, axe: { at: 0.78, len: 0.1, h: 0.45, crescent: true } } },
    { id: "lochaber", cls: "polearms", name: "Lochaber Axe", note: "Scottish pole-axe with a hook · 1500s–1700s",
      spec: { blade: 1.1, grip: 0.5, handB: 0.42, gripColor: "#7a5230", gripR: 0.016, cross: 0, pommelStyle: "cap", pommel: 0.02, axe: { at: 0.8, len: 0.12, h: 0.32, back: "hook", crescent: true } } },
    { id: "masakari", cls: "axes", name: "Masakari", note: "Japanese broad war axe",
      spec: { blade: 0.85, grip: 0.4, handB: 0.35, gripColor: "#7a5230", gripR: 0.016, cross: 0, pommelStyle: "cap", pommel: 0.02, axe: { at: 0.95, len: 0.14, h: 0.18 } } },
    { id: "labrys", cls: "axes", name: "Labrys", note: "Minoan double axe in bronze · c. 1500 BC",
      spec: { blade: 0.55, grip: 0.25, handB: 0.2, gripColor: "#7a5230", gripR: 0.016, cross: 0, pommelStyle: "cap", pommel: 0.02, bladeColor: BRONZE_BLADE, axe: { at: 0.9, len: 0.15, h: 0.2, back: "blade" } } },
    { id: "tomahawk", cls: "axes", name: "Pipe Tomahawk", note: "North American trade axe with a pipe bowl at the back · 1700s",
      spec: { blade: 0.42, grip: 0.06, gripColor: "#7a5230", gripR: 0.016, cross: 0, pommelStyle: "cap", pommel: 0.02, axe: { at: 0.95, len: 0.11, h: 0.05, back: "hammer" } } },
    // maces, hammers and clubs
    { id: "flanged", cls: "maces", name: "Flanged Mace", note: "Gothic, 1400s · iron flanges to bite through plate",
      spec: { blade: 0.45, grip: 0.12, gripColor: "#7a5230", gripR: 0.016, cross: 0, pommelStyle: "cap", pommel: 0.02, gripColor: "#5a3a22", mace: { type: "flanged", at: 0.9, r: 0.05, h: 0.11, n: 7 } } },
    { id: "shestopyor", cls: "maces", name: "Shestopyor", note: "Russian six-flanged mace · 1500s, a mark of command",
      spec: { blade: 0.5, grip: 0.12, gripColor: "#7a5230", gripR: 0.016, cross: 0, pommelStyle: "cap", pommel: 0.02, gripColor: "#5a3a22", mace: { type: "flanged", at: 0.9, r: 0.055, h: 0.13, n: 6 } } },
    { id: "morningstar", cls: "maces", name: "Morning Star", note: "Morgenstern, German · a spiked ball on a haft",
      spec: { blade: 0.6, grip: 0.2, handB: 0.15, gripColor: "#7a5230", gripR: 0.016, cross: 0, pommelStyle: "cap", pommel: 0.02, mace: { type: "star", at: 0.92, r: 0.06 } } },
    { id: "warhammer", cls: "maces", name: "Horseman's Hammer", note: "c. 1500 · a hammer face and a back beak to pierce armour",
      spec: { blade: 0.5, grip: 0.12, gripColor: "#7a5230", gripR: 0.016, cross: 0, pommelStyle: "cap", pommel: 0.02, axe: { at: 0.95, len: 0.05, h: 0.04, hammer: true, back: "beak", spike: 0.05 } } },
    { id: "kanabo", cls: "maces", name: "Kanabō", note: "Japanese studded iron-shod club",
      spec: { blade: 0.75, grip: 0.3, handB: 0.25, gripColor: "#7a5230", gripR: 0.016, cross: 0, pommelStyle: "cap", pommel: 0.02, gripColor: "#2a2724", bladeColor: "#3a3532", mace: { type: "club", r: 0.045, len: 0.5 } } },
    { id: "egyptmace", cls: "maces", name: "Pear-headed Mace", note: "Egypt, c. 3000 BC · a stone head on a wooden haft",
      spec: { blade: 0.45, grip: 0.12, gripColor: "#7a5230", gripR: 0.016, cross: 0, pommelStyle: "cap", pommel: 0.02, bladeColor: "#c9b48a", mace: { type: "pear", at: 0.92, r: 0.04 } } },
    { id: "knobkerrie", cls: "maces", name: "Knobkerrie", note: "Southern African fighting and throwing club",
      spec: { blade: 0.55, grip: 0.1, gripColor: "#7a5230", gripR: 0.016, cross: 0, pommelStyle: "cap", pommel: 0.02, gripColor: "#5a3a22", bladeColor: "#5a3a22", mace: { type: "knob", at: 0.95, r: 0.045 } } },
    // spears
    { id: "wingedspear", cls: "spears", name: "Winged Spear", note: "Carolingian, 800s · lugs below the blade stop it running too deep",
      spec: { blade: 0.4, prof: [0.9, 1.4, 1.2, 0.6, 0.05], hooks: { at: 0.02, len: 0.05 }, handB: 0.55, lift: 0.9, grip: 1.75, handA: 0.05, gripColor: "#7a5230", gripR: 0.016, cross: 0, pommelStyle: "cap", pommel: 0.02, socket: 0.09 } },
    { id: "boarspear", cls: "spears", name: "Boar Spear", note: "Saufeder, German, 1500s · broad blade and a cross-bar",
      spec: { blade: 0.36, w: 1.2, prof: [1, 1.5, 1.3, 0.6, 0.05], hooks: { at: 0.01, len: 0.07 }, handB: 0.55, lift: 0.9, grip: 1.65, handA: 0.05, gripColor: "#7a5230", gripR: 0.016, cross: 0, pommelStyle: "cap", pommel: 0.02, socket: 0.09 } },
    { id: "dory", cls: "spears", name: "Dory", note: "Greek hoplite spear · a bronze butt-spike (sauroter) at the other end",
      spec: { blade: 0.3, prof: [0.8, 1.2, 1, 0.5, 0.05], handB: 0.25, pommelStyle: "scent", pommel: 0.02, lift: 1.2, grip: 2.2, handA: 0.05, gripColor: "#7a5230", gripR: 0.016, cross: 0, pommelStyle: "cap", pommel: 0.02, socket: 0.09, pommelStyle: "scent" } },
    { id: "pilum", cls: "spears", name: "Pilum", note: "Roman legionary's javelin · a long iron shank behind a small point",
      spec: { blade: 0.6, w: 0.45, prof: [0.6, 0.5, 0.5, 0.5, 0.5, 1.6, 0.05], handB: 0.2, lift: 0.7, grip: 1.2, handA: 0.05, gripColor: "#7a5230", gripR: 0.016, cross: 0, pommelStyle: "cap", pommel: 0.02, socket: 0.09 } },
    { id: "yari", cls: "spears", name: "Su-yari", note: "Japanese straight spear",
      spec: { blade: 0.3, prof: [1, 0.95, 0.6, 0.05], handB: 0.55, lift: 1, grip: 1.9, handA: 0.05, gripColor: "#7a5230", gripR: 0.016, cross: 0, pommelStyle: "cap", pommel: 0.02, socket: 0.09, gripColor: "#2a2724" } },
    { id: "jumonji", cls: "spears", name: "Jūmonji Yari", note: "Japanese cross-bladed spear",
      spec: { blade: 0.3, prof: [1, 0.95, 0.6, 0.05], hooks: { at: 0.12, len: 0.1 }, handB: 0.55, lift: 1, grip: 1.9, handA: 0.05, gripColor: "#7a5230", gripR: 0.016, cross: 0, pommelStyle: "cap", pommel: 0.02, socket: 0.09, gripColor: "#2a2724" } },
    { id: "iklwa", cls: "spears", name: "Iklwa", note: "Zulu short stabbing spear · Shaka's reform, early 1800s",
      spec: { blade: 0.32, w: 1.2, prof: [0.7, 1.3, 1.2, 0.7, 0.05], lift: 0.25, grip: 0.8, handA: 0.05, gripColor: "#7a5230", gripR: 0.016, cross: 0, pommelStyle: "cap", pommel: 0.02, socket: 0.09 } },
    { id: "maasai", cls: "spears", name: "Maasai Spear", note: "Long narrow blade and a long iron butt",
      spec: { blade: 0.55, w: 0.7, prof: [0.6, 1, 1, 0.8, 0.05], handB: 0.25, lift: 0.45, grip: 1.35, handA: 0.05, gripColor: "#7a5230", gripR: 0.016, cross: 0, pommelStyle: "cap", pommel: 0.02, socket: 0.09, pommelStyle: "scent" } },
    { id: "sibat", cls: "spears", name: "Sibat", note: "Filipino spear",
      spec: { blade: 0.28, prof: [0.8, 1.3, 1.1, 0.5, 0.05], handB: 0.5, lift: 0.9, grip: 1.7000000000000002, handA: 0.05, gripColor: "#7a5230", gripR: 0.016, cross: 0, pommelStyle: "cap", pommel: 0.02, socket: 0.09 } },
    // bladed polearms
    { id: "glaive", cls: "polearms", name: "Glaive", note: "A single-edged blade on a pole · 1400s–1500s",
      spec: { blade: 0.55, w: 1.5, curve: 0.05, prof: [1, 1.15, 1.1, 0.9, 0.05], handB: 0.55, lift: 0.8, grip: 1.6, handA: 0.05, gripColor: "#7a5230", gripR: 0.016, cross: 0, pommelStyle: "cap", pommel: 0.02, socket: 0.09 } },
    { id: "bill", cls: "polearms", name: "English Bill", note: "Hooked bill of the English footman · 1500s",
      spec: { blade: 0.45, w: 1.3, curve: -0.12, prof: [1, 1.2, 1.3, 0.8, 0.1], hooks: { at: 0.3, len: 0.06 }, handB: 0.55, lift: 0.8, grip: 1.6, handA: 0.05, gripColor: "#7a5230", gripR: 0.016, cross: 0, pommelStyle: "cap", pommel: 0.02, socket: 0.09 } },
    { id: "partisan", cls: "polearms", name: "Partisan", note: "Broad spearhead with two lugs · 1500s–1600s",
      spec: { blade: 0.4, prof: [1.8, 1.2, 0.8, 0.05], hooks: { at: 0.02, len: 0.07 }, handB: 0.55, lift: 0.9, grip: 1.75, handA: 0.05, gripColor: "#7a5230", gripR: 0.016, cross: 0, pommelStyle: "cap", pommel: 0.02, socket: 0.09 } },
    { id: "ranseur", cls: "polearms", name: "Ranseur", note: "A long point with two side blades angled forward",
      spec: { blade: 0.45, w: 0.8, prof: [0.6, 0.5, 0.4, 0.05], hooks: { at: 0.15, len: 0.1 }, handB: 0.55, lift: 0.9, grip: 1.75, handA: 0.05, gripColor: "#7a5230", gripR: 0.016, cross: 0, pommelStyle: "cap", pommel: 0.02, socket: 0.09 } },
    { id: "naginata", cls: "polearms", name: "Naginata", note: "Japanese curved blade on a pole · favoured by onna-musha",
      spec: { blade: 0.55, w: 0.9, curve: 0.06, prof: [1, 1, 1.1, 0.05], crossStyle: "disc", tsuba: 0.035, handB: 0.55, lift: 0.8, grip: 1.4, handA: 0.05, gripColor: "#7a5230", gripR: 0.016, cross: 0, pommelStyle: "cap", pommel: 0.02, socket: 0.09, gripColor: "#2a2724" } },
    { id: "guandao", cls: "polearms", name: "Guandao", note: "Chinese great crescent blade on a pole",
      spec: { blade: 0.6, w: 1.8, curve: 0.12, prof: [0.8, 1.1, 1.4, 1.2, 0.05], crossStyle: "disc", tsuba: 0.04, handB: 0.55, lift: 0.8, grip: 1.5, handA: 0.05, gripColor: "#7a5230", gripR: 0.016, cross: 0, pommelStyle: "cap", pommel: 0.02, socket: 0.09, gripColor: "#7e2620" } },
    { id: "voulge", cls: "polearms", name: "Voulge", note: "A cleaver blade bound to a pole · Swiss and French, 1400s",
      spec: { blade: 1.1, grip: 0.5, handB: 0.45, gripColor: "#7a5230", gripR: 0.016, cross: 0, pommelStyle: "cap", pommel: 0.02, axe: { at: 0.82, len: 0.11, h: 0.4, crescent: true, spike: 0.05, langets: 0.2 } } },
    { id: "becdecorbin", cls: "polearms", name: "Bec de Corbin", note: "'Crow's beak' · hammer, beak and spike for fighting in harness",
      spec: { blade: 1.0, grip: 0.55, handB: 0.45, gripColor: "#7a5230", gripR: 0.016, cross: 0, pommelStyle: "cap", pommel: 0.02, axe: { at: 0.88, len: 0.05, h: 0.04, hammer: true, back: "beak", spike: 0.22, langets: 0.28 } } },
    { id: "lucerne", cls: "polearms", name: "Lucerne Hammer", note: "Swiss, 1400s–1500s · a four-pronged hammer, a long curved beak, a tall top spike and long langets",
      spec: { blade: 1.2, grip: 0.55, handB: 0.45, gripColor: "#7a5230", gripR: 0.016, cross: 0, pommelStyle: "cap", pommel: 0.02, axe: { at: 0.82, len: 0.05, h: 0.05, hammer: true, prongs: 4, back: "beak", spike: 0.38, langets: 0.4 } } },
    // other arms
    // Indigenous Americas
    { id: "gunstock", cls: "americas", name: "Gunstock War Club", note: "Great Lakes and Plains, 1700s–1800s · a wooden club shaped like a musket stock, with an iron blade",
      spec: { blade: 0.45, grip: 0.2, w: 2.2, t: 0.45, prof: [0.8, 1, 1.5, 1.8, 1.6], curve: -0.08, curveStart: 0.3, cross: 0, pommelStyle: "none", gripColor: "#5a3a22", bladeColor: "#6b4a2c", hooks: { at: 0.55, len: 0.05 } } },
    { id: "ballclub", cls: "americas", name: "Ball-headed War Club", note: "Eastern Woodlands, 1600s–1800s · carved from one piece of hardwood",
      spec: { blade: 0.5, grip: 0.1, gripColor: "#7a5230", gripR: 0.016, cross: 0, pommelStyle: "cap", pommel: 0.02, gripColor: "#5a3a22", bladeColor: "#5a3a22", mace: { type: "knob", at: 0.97, r: 0.05 } } },
    { id: "stoneclub", cls: "americas", name: "Stone-headed Club", note: "Plains · a stone head bound to a wooden handle with rawhide",
      spec: { blade: 0.45, grip: 0.1, gripColor: "#7a5230", gripR: 0.016, cross: 0, pommelStyle: "cap", pommel: 0.02, bladeColor: "#9a9488", mace: { type: "pear", at: 0.95, r: 0.04 } } },
    { id: "macuahuitl", cls: "americas", name: "Macuahuitl", note: "Aztec, 1400s–1500s · a wooden blade edged with obsidian",
      spec: { blade: 0.7, grip: 0.18, w: 2, t: 0.4, prof: [1, 1, 1, 1, 0.9], cross: 0, pommelStyle: "cap", pommel: 0.02, gripColor: "#5a3a22", bladeColor: "#6b4a2c", teeth: true, handB: 0.14 } },
    { id: "tepoztopilli", cls: "americas", name: "Tepoztopilli", note: "Aztec thrusting spear · a broad wooden head edged with obsidian",
      spec: { blade: 0.35, w: 2, t: 0.4, prof: [1, 1.3, 1.2, 0.5], teeth: true, bladeColor: "#6b4a2c", handB: 0.55, lift: 0.9, grip: 1.7, handA: 0.05, gripColor: "#7a5230", gripR: 0.016, cross: 0, pommelStyle: "cap", pommel: 0.02 } },
    // Australia & Oceania
    { id: "boomerang", cls: "oceania", single: true, name: "Boomerang", note: "Aboriginal Australian returning boomerang",
      spec: { boomerang: { a: 0.3, b: 0.3, angle: 105, w: 0.032 }, blade: 0.3, grip: 0.06, handA: 0.0, handB: 0.02, cross: 0, bladeColor: "#8a5a2b" } },
    { id: "kylie", cls: "oceania", single: true, name: "Kylie", note: "Aboriginal Australian hunting boomerang · long, flat, it does not come back",
      spec: { boomerang: { a: 0.32, b: 0.42, angle: 150, w: 0.036 }, blade: 0.45, grip: 0.06, handA: 0.0, handB: 0.02, cross: 0, bladeColor: "#6b4a2c" } },
    { id: "taiaha", cls: "oceania", name: "Taiaha", note: "Māori fighting staff · a flat blade at one end, a carved tongue at the other",
      spec: { blade: 0.5, w: 2, t: 0.45, prof: [1, 1.2, 1.2, 1, 0.6], bladeColor: "#5a3a22", handB: 0.5, lift: 0.7, grip: 1.25, handA: 0.05, gripColor: "#5a3a22", gripR: 0.017, cross: 0, pommelStyle: "pear", pommel: 0.03 } },
    { id: "twisted", cls: "other", finsAll: true,
      fins: [{ id: "steel", label: "Steel", hilt: "#9aa3ad" }, { id: "darkred", label: "Dark red", hilt: "#6e1a1a" }, { id: "black", label: "Black", hilt: "#2a2724" },
        { id: "blued", label: "Blued", hilt: "#3b4a66" }, { id: "gold", label: "Gold", hilt: "#c9a24a" }, { id: "silver", label: "Silver", hilt: "#d5d8db" }],
      name: "Twisted Sword", note: "A cursed sword of ash",
      spec: { blade: 0.88, grip: 0.24, w: 1.25, t: 0.22, prof: [0.95, 0.9, 0.85, 0.75, 0.05], twist: 2.5, bladeColor: "#9aa3ad",
        cross: 0.04, crossR: 0.008, crossStyle: "x", pommelStyle: "ring", pommel: 0.034 } },
    { id: "laser", cls: "other", name: "Laser Sword", note: "A blade of light on a metal hilt · from no century at all",
      fins: [{ id: "blue", label: "Blue", hilt: "#5fb4ff" }, { id: "green", label: "Green", hilt: "#6dff6d" }, { id: "red", label: "Red", hilt: "#ff4a3d" },
        { id: "purple", label: "Purple", hilt: "#c77dff" }, { id: "gold", label: "Gold", hilt: "#ffd23f" }, { id: "white", label: "White", hilt: "#f2f6ff" }],
      spec: { laser: true, blade: 0.9, grip: 0.27, w: 0.85, round: true, prof: [1, 1, 1, 1, 0.9], cross: 0, pommelStyle: "cap", pommel: 0.024, gripR: 0.021,
        gripColor: "#2a2724", hiltColor: "#c9ccce", handB: 0.17 } },
    { id: "bazooka", cls: "other", single: true, name: "Bazooka", note: "M1 rocket launcher, 1942 · not in any manual of arms we know of",
      spec: { bazooka: true, blade: 0.9, grip: 0.62, handA: 0, handB: -0.32, cross: 0 } },
  ];
  const swordById = Object.fromEntries(SWORDS.map((s) => [s.id, s]));

  // The spec for a weapon in a finish: the hilt colour, or the whole sword in wood
  function swordSpec(modelId, finish) {
    const m = swordById[modelId]; if (!m) return null;
    if (m.single) return Object.assign({}, m.spec);
    if (m.fins) { const lf = m.fins.find((x) => x.id === finish) || m.fins[0];
      return Object.assign({}, m.spec, m.finsAll ? { bladeColor: lf.hilt, gripColor: lf.hilt, hiltColor: lf.hilt } : { bladeColor: lf.hilt }); }
    const f = FINISH.find((x) => x.id === finish) || FINISH[0];
    const sp = Object.assign({}, m.spec, { hiltColor: f.hilt });
    if (finish === "black" && !m.spec.bladeColor) sp.gripColor = sp.gripColor || "#241c16";
    if (finish !== "wood") return sp;
    // wood: blade, hilt and grip all wooden; a thicker, blunt blade; no inlay, rings, hooks or shells
    Object.assign(sp, { bladeColor: "#b8925a", hiltColor: "#7a5230", gripColor: "#5e3d22", t: 0.6, band: false, bars: false, shells: 0,
      ring: false, ring2: false, forte: null, hooks: null, ricasso: 0 }); // (a wooden feder keeps its schilt)
    if (!sp.curve && !sp.prof && !sp.flame) sp.shape = "parallel";
    if (m.cls === "sabre") Object.assign(sp, { bow: false, cup: 0.07, cupD: 0.065, hiltColor: "#b08a4a" }); // singlestick's wicker basket
    if (m.cls === "rapier" || m.cls === "small") Object.assign(sp, { cup: 0, bow: false, cross: Math.max(sp.cross || 0, 0.07) });
    return sp;
  }

  // ---------- daggers (worn sheathed at the left hip) ----------
  const DAGGERS = [
    { id: "rondel", name: "Rondel Dagger", note: "Disc guard and disc pommel · 1300s–1500s", spec: { len: 0.3, grip: 0.11, guard: "disc", gw: 0.032, pommel: "disc", pr: 0.03 } },
    { id: "kidney", name: "Kidney Dagger", note: "Two lobes at the guard · England and Flanders, 1400s", spec: { len: 0.3, grip: 0.13, guard: "balls", pommel: "cap", gripR: 0.014 } },
    { id: "baselard", name: "Baselard", note: "I-shaped hilt · Swiss, 1300s", spec: { len: 0.32, grip: 0.1, guard: "bar", gw: 0.04, pommel: "bar", pr: 0.04 } },
    { id: "quillon", name: "Quillon Dagger", note: "A small cross-hilted sword · 1400s–1500s", spec: { len: 0.3, grip: 0.1, guard: "cross", gw: 0.05, pommel: "ball", pr: 0.02 } },
    { id: "maingauche", name: "Main Gauche", note: "Left-hand parrying dagger with a shell guard · 1600s", spec: { len: 0.4, grip: 0.1, guard: "shell", gw: 0.07, pommel: "ball", pr: 0.02 } },
    { id: "stiletto", name: "Stiletto", note: "Slender Italian thrusting dagger", spec: { len: 0.28, grip: 0.1, w: 0.014, guard: "cross", gw: 0.035, pommel: "ball", pr: 0.016 } },
    { id: "cinquedea", name: "Cinquedea", note: "Five fingers broad at the hilt · Italy, c. 1500", spec: { len: 0.36, grip: 0.1, w: 0.04, guard: "cross", gw: 0.05, pommel: "cap", gripR: 0.016 } },
    { id: "landsknecht", name: "Katzbalger Dagger", note: "Landsknecht dagger, S-shaped guard · 1500s", spec: { len: 0.3, grip: 0.1, guard: "cross", gw: 0.045, pommel: "bar", pr: 0.03 } },
    { id: "seax", name: "Seax", note: "Saxon single-edged knife · 500s–900s", spec: { len: 0.34, grip: 0.12, w: 0.03, guard: "none", pommel: "cap" } },
    { id: "dirk", name: "Highland Dirk", note: "Scottish, carved hilt · 1700s", spec: { len: 0.36, grip: 0.12, guard: "none", pommel: "ball", pr: 0.024, gripR: 0.016, gripC: "#2a1d14" } },
    { id: "pugio", name: "Pugio", note: "Roman legionary's dagger · 1st century", spec: { len: 0.24, grip: 0.1, w: 0.03, guard: "cross", gw: 0.03, pommel: "disc", pr: 0.025 } },
    { id: "tanto", name: "Tantō", note: "Japanese dagger", spec: { len: 0.3, grip: 0.12, guard: "disc", gw: 0.026, pommel: "cap", sheath: "#1d1712", gripC: "#1f2438" } },
    { id: "kris", name: "Kris", note: "Wavy-bladed dagger of Java and the Malay world", spec: { len: 0.36, grip: 0.1, guard: "none", pommel: "cap", top: 0.07, sheath: "#7a5230", gripC: "#3a2618" } },
    { id: "khanjar", name: "Khanjar", note: "Curved Arabian dagger in a J-shaped sheath", spec: { len: 0.24, grip: 0.1, guard: "none", pommel: "disc", pr: 0.026, jcurve: true, sheath: "#b08a4a", metal: "#d5d8db" } },
    { id: "telek", name: "Telek", note: "Tuareg arm dagger with a cross-shaped hilt", spec: { len: 0.26, grip: 0.08, guard: "cross", gw: 0.04, pommel: "bar", pr: 0.035, sheath: "#6b4a2c" } },
    { id: "daga", name: "Daga", note: "Eskrima knife, paired with the stick", spec: { len: 0.25, grip: 0.1, guard: "cross", gw: 0.025, pommel: "cap" } },
  ];
  const daggerById = Object.fromEntries(DAGGERS.map((o) => [o.id, o]));

  // ---------- bucklers (in the fist for sword-and-buckler guards; else hung at the right hip) ----------
  const BUCKLERS = [
    { id: "i33", name: "Round Buckler", note: "Wooden board, iron boss · as in I.33, c. 1300", spec: { r: 0.15, board: "#b8925a", metal: "#5e5a52" } },
    { id: "leather", name: "Small Leather Buckler", note: "Hardened leather · 1300s–1500s", spec: { r: 0.13, board: "#5a3a22", metal: "#5e5a52", bossR: 0.045 } },
    { id: "brocchiero", name: "Brocchiero", note: "Italian all-steel buckler with concentric rings · 1500s", spec: { r: 0.2, board: "#8f918d", metal: "#5e5a52", rings: true, bossR: 0.055 } },
    { id: "faust", name: "Faustschild", note: "German fist-shield with a spike", spec: { r: 0.17, board: "#9a9c99", metal: "#5e5a52", spike: 0.07, rings: true } },
    { id: "targe", name: "Highland Targe", note: "Leather-faced, brass studs and a spike · 1700s", spec: { r: 0.26, board: "#6b4a2c", metal: "#c9a24a", studs: true, spike: 0.08 } },
    { id: "gasha", name: "Gasha", note: "Ethiopian domed hide shield", spec: { r: 0.25, board: "#8a5a2b", metal: "#c9a24a", dome: true, depth: 0.1, bossR: 0.03, bossH: 0.03, rim: false } },
    { id: "plainsshield", name: "Plains Hide Shield", note: "Buffalo-hide shield of the Plains nations · 1800s", spec: { r: 0.24, board: "#c9a26a", metal: "#6b4a2c", boss: false, rings: true } },
    { id: "chimalli", name: "Chimalli", note: "Aztec round shield of woven cane and feathers", spec: { r: 0.25, board: "#2a3d6e", metal: "#d4a62a", boss: false, rings: true, studs: true } },
    { id: "dhal", name: "Dhal", note: "Indo-Persian domed shield with four bosses", spec: { r: 0.22, board: "#2a2724", metal: "#c9a24a", dome: true, depth: 0.06, studs: true, bossR: 0.035 } },
  ];
  const bucklerById = Object.fromEntries(BUCKLERS.map((o) => [o.id, o]));

  // ---------- garb ----------
  const OUTFITS = [
    { id: "braies", name: "Braies", note: "Linen underwear · where every scholar starts",
      look: { style: "plain", jacket: SKIN, arms: SKIN, thigh: SKIN, shin: SKIN, shoe: SKIN, braies: true } },
    { id: "fiore", name: "Fiore's Jacket", note: "White padded jacket and hose · Getty Fior di Battaglia, c. 1404",
      look: { style: "fiore", jacket: "#f1e9da", thigh: "#e9dcc2", shin: "#e9dcc2" } },
    { id: "gambeson", name: "Gambeson", note: "Quilted linen arming coat · 1300s",
      look: { style: "plain", jacket: "#d8c7a0", arms: "#cdbb92", stripes: ["#d8c7a0", "#bba77c"], stripesAcross: true, stripeRows: 4,
        thigh: "#6b4a2c", shin: "#6b4a2c", shoe: "#3a2a1d", skirtLen: 0.33, bulk: 1.1 } },
    { id: "i33", name: "Priest's Tunic", note: "Long tunic and hose · Royal Armouries Ms. I.33, c. 1300",
      look: { style: "i33", jacket: "#cfae5a", thigh: "#8ea3cf", shin: "#8ea3cf", shoe: "#8ea3cf" } },
    { id: "walpurgis", name: "Walpurgis's Kirtle", note: "Long gown of the woman fencer in I.33, c. 1300",
      look: { style: "plain", jacket: "#8ea3cf", arms: "#8ea3cf", skirtColor: "#8ea3cf", skirtLen: 0.95, skirtFlare: 1.2, thigh: "#8ea3cf", shin: "#8ea3cf", shoe: "#3a2a1d" } },
    { id: "meyer", name: "Landsknecht Doublet", note: "Slashed doublet and pluderhosen · Meyer, 1570",
      look: { style: "meyer", jacket: "#8e3b3b", thigh: "#d9b85c", shin: "#3a3532", shoe: "#1d1712" } },
    { id: "fabris", name: "Venetian Doublet", note: "Doublet, breeches and ruff · Fabris, 1606",
      look: { style: "fabris", jacket: "#5e3a7a", thigh: "#3d3149", shin: "#2b2522", shoe: "#1d1712", ruff: true } },
    { id: "fidalgo", name: "Fidalgo's Black", note: "Portuguese nobleman's black, c. 1600 · doublet, trunk hose, ruff",
      look: { style: "fabris", jacket: "#1d1712", thigh: "#2b2522", shin: "#1d1712", shoe: "#1d1712", ruff: true } },
    { id: "latouche", name: "Justaucorps", note: "Long coat and lace cravat · La Touche, 1670",
      look: { style: "fabris", jacket: "#34466e", thigh: "#34466e", shin: "#e9dcc2", shoe: "#1d1712", coat: true, cravat: true, puffs: false } },
    { id: "maupin", name: "La Maupin's Coat", note: "Julie d'Aubigny, opera singer and duellist, 1690s · scarlet coat and breeches",
      look: { style: "fabris", jacket: "#a3261d", thigh: "#1d1712", shin: "#f1e9da", shoe: "#1d1712", coat: true, cravat: true, puffs: false } },
    { id: "kilt", name: "Highland Kilt", note: "Belted plaid and shirt · Scottish broadsword, 1700s",
      look: { style: "plain", jacket: "#f1e9da", skirtStripes: ["#2f5a3a", "#1f2e5a"], skirtLen: 0.42, thigh: SKIN, shin: "#c9b48a", shoe: "#1d1712" } },
    { id: "hussar", name: "Hussar Dolman", note: "Braided jacket and red breeches, c. 1800",
      look: { style: "plain", jacket: "#2a3d6e", arms: "#2a3d6e", stripes: ["#2a3d6e", "#d4a62a"], stripesAcross: true, stripeRows: 3,
        thigh: "#8e2b23", shin: "#1d1712", shoe: "#1d1712", skirtLen: 0.08 } },
    { id: "hutton", name: "Salle Jersey", note: "Striped jersey and trousers · Hutton's salle, 1889",
      look: { style: "hutton", stripes: ["#1f2a44", "#e8dcc4"], jacket: "#1f2a44", thigh: "#2b2522", shin: "#2b2522", shoe: "#1d1712" } },
    { id: "ladysalle", name: "Lady's Fencing Dress", note: "1890s ladies' salle · blouse, knee-length skirt, dark stockings",
      look: { style: "plain", jacket: "#f6f3ec", skirtColor: "#1f2a44", skirtLen: 0.5, skirtFlare: 1.15, thigh: "#1d1712", shin: "#1d1712", shoe: "#1d1712" } },
    { id: "whites", name: "Fencing Whites", note: "Modern salle · jacket, breeches and long socks",
      look: { style: "plain", jacket: "#f6f3ec", thigh: "#f6f3ec", shin: "#f6f3ec", shoe: "#1d1712", skirtLen: 0.1 } },
    { id: "hakama", name: "Keikogi & Hakama", note: "Japanese practice jacket and pleated trousers",
      look: { style: "plain", jacket: "#26304d", skirtColor: "#1b2236", skirtLen: 0.9, skirtFlare: 1.25, thigh: "#1b2236", shin: "#1b2236", shoe: SKIN } },
    { id: "onna", name: "Onna-musha", note: "Japanese woman warrior · white kosode and red hakama",
      look: { style: "plain", jacket: "#f6f3ec", skirtColor: "#a3261d", skirtLen: 0.9, skirtFlare: 1.25, thigh: "#a3261d", shin: "#a3261d", shoe: SKIN } },
    { id: "mamluk", name: "Mamluk Qaba", note: "Robe of the Mamluk horsemen · Egypt, c. 1400",
      look: { style: "plain", jacket: "#b0472c", skirtColor: "#b0472c", skirtLen: 0.66, thigh: "#e9dcc2", shin: "#e9dcc2", shoe: "#7a2b1d" } },
    { id: "tuareg", name: "Tuareg Robe", note: "Indigo robe of the Sahara",
      look: { style: "plain", jacket: "#24304f", skirtColor: "#24304f", skirtLen: 0.85, skirtFlare: 1.15, thigh: "#24304f", shin: "#24304f", shoe: "#9a6a3a" } },
    { id: "kente", name: "Kente Wrap", note: "Woven strip cloth of the Ashanti · Ghana",
      look: { style: "plain", jacket: "#d4a62a", arms: SKIN, stripes: ["#d4a62a", "#2f5a3a"], skirtStripes: ["#d4a62a", "#a3261d"], skirtLen: 0.6, thigh: SKIN, shin: SKIN, shoe: "#6b4a2c" } },
    { id: "agojie", name: "Agojie Warrior", note: "The women soldiers of Dahomey, 1800s · sleeveless tunic and knee breeches",
      look: { style: "plain", jacket: "#2a3d6e", arms: SKIN, stripes: ["#2a3d6e", "#f1e9da"], skirtLen: 0.2, thigh: "#2a3d6e", shin: SKIN, shoe: SKIN } },
    { id: "buckskin", name: "Buckskin Shirt & Leggings", note: "Plains, 1800s · smoked hide shirt, leggings and moccasins",
      look: { style: "plain", jacket: "#c9a26a", arms: "#c9a26a", skirtLen: 0.22, thigh: "#b8925a", shin: "#b8925a", shoe: "#9a6a3a" } },
    { id: "woodlands", name: "Breechcloth & Leggings", note: "Eastern Woodlands, 1700s · wool breechcloth, leggings and moccasins",
      look: { style: "plain", jacket: SKIN, arms: SKIN, skirtColor: "#2a3d6e", skirtLen: 0.3, thigh: SKIN, shin: "#8e2b23", shoe: "#9a6a3a" } },
    { id: "barong", name: "Barong Tagalog", note: "Filipino embroidered shirt and dark trousers",
      look: { style: "plain", jacket: "#efe6cf", skirtLen: 0.16, thigh: "#1d1712", shin: "#1d1712", shoe: "#1d1712" } },
    { id: "roman", name: "Roman Tunic", note: "Legionary's red wool tunic · 1st century",
      look: { style: "plain", jacket: "#8e2b23", arms: SKIN, skirtLen: 0.3, thigh: SKIN, shin: SKIN, shoe: "#6b4a2c" } },
    { id: "chiton", name: "Greek Chiton", note: "Linen chiton · 400s BC",
      look: { style: "plain", jacket: "#f1e9da", arms: SKIN, skirtLen: 0.36, thigh: SKIN, shin: SKIN, shoe: "#9a6a3a" } },
    { id: "shendyt", name: "Shendyt", note: "Egyptian linen kilt · bare-chested, c. 1300 BC",
      look: { style: "plain", jacket: SKIN, arms: SKIN, skirtColor: "#f6f1e6", skirtLen: 0.3, thigh: SKIN, shin: SKIN, shoe: SKIN, braies: false } },
  ];

  // ---------- armour (worn over the garb; colourable) ----------
  // zones: which parts of the body the plate (or mail) covers; parts: the details drawn on top
  const ARMOURS = [
    { id: "none", name: "No Armour", note: "Just your garb" },
    { id: "plain", name: "Plain Harness", note: "Plain white armour of a man-at-arms · mid-1400s", color: "#b9bcba",
      zones: { torso: 1, arms: 1, legs: 1, feet: 1 }, skirt: 0.16, bulk: 1.1, parts: {} },
    { id: "gothic", name: "Gothic Harness", note: "German, c. 1480 · fluted, pointed sabatons, winged couters and poleyns", color: "#c9ccce",
      zones: { torso: 1, arms: 1, legs: 1, feet: 1 }, tex: "flutes", footLen: 1.35, skirt: 0.12,
      parts: { gorget: 1, ridge: 1, pauld: "round", couter: 0.065, poleyn: 0.055, cuffs: 1 } },
    { id: "milanese", name: "Milanese Harness", note: "Italian, c. 1450 · smooth plate, great left pauldron and couter wings", color: "#c9ccce",
      zones: { torso: 1, arms: 1, legs: 1, feet: 1 }, skirt: 0.12,
      parts: { gorget: 1, pauld: "milanese", couter: 0.075, poleyn: 0.05, cuffs: 1 } },
    { id: "maximilian", name: "Maximilian Harness", note: "German, c. 1520 · fluted all over, broad bear-paw sabatons", color: "#c9ccce",
      zones: { torso: 1, arms: 1, legs: 1, feet: 1 }, tex: "flutes", footLen: 1.05, skirt: 0.14, bulk: 1.06,
      parts: { gorget: 1, ridge: 1, pauld: "round", couter: 0.05, poleyn: 0.045, cuffs: 1 } },
    { id: "greenwich", name: "Greenwich Harness", note: "Royal workshop at Greenwich, c. 1580–85 · blued with etched gilt bands, after the Earl of Cumberland's armour (Metropolitan Museum)", color: "#3b4a66",
      zones: { torso: 1, arms: 1, legs: 1, feet: 1 }, tex: "gilt", skirt: 0.12,
      parts: { gorget: 1, ridge: 1, pauld: "round", couter: 0.045, poleyn: 0.04, cuffs: 1 } },
    // gilded armours, after surviving pieces
    { id: "henry8", name: "Henry VIII's Armour", note: "Greenwich, 1540 · bright steel with etched and gilt bands (Royal Armouries, Tower of London)", color: "#c9ccce",
      zones: { torso: 1, arms: 1, legs: 1, feet: 1 }, tex: "gilt", skirt: 0.14, bulk: 1.12, footLen: 1.05,
      parts: { gorget: 1, ridge: 1, pauld: "round", couter: 0.05, poleyn: 0.045, cuffs: 1 } },
    { id: "leicester", name: "Leicester Armour", note: "Greenwich, c. 1575 · made for Robert Dudley, Earl of Leicester; bright steel with gilt bands (Royal Armouries)", color: "#d5d8db",
      zones: { torso: 1, arms: 1, legs: 1, feet: 1 }, tex: "gilt", skirt: 0.12,
      parts: { gorget: 1, ridge: 1, pauld: "round", couter: 0.045, poleyn: 0.045, cuffs: 1 } },
    { id: "muhlberg", name: "Mühlberg Armour", note: "Desiderius Helmschmid, Augsburg, c. 1544 · worn by Charles V in Titian's portrait (Real Armería, Madrid)", color: "#3a3532", bands: "#c9a24a",
      zones: { torso: 1, arms: 1, legs: 1, feet: 1 }, tex: "gilt", skirt: 0.12,
      parts: { gorget: 1, ridge: 1, pauld: "round", couter: 0.05, poleyn: 0.045, cuffs: 1 } },
    { id: "henry2", name: "Armour of Henry II of France", note: "French, c. 1555 · blackened steel with gilt etched ornament (Metropolitan Museum)", color: "#2a2724", bands: "#d4a62a",
      zones: { torso: 1, arms: 1, legs: 1, feet: 1 }, tex: "gilt", skirt: 0.12,
      parts: { gorget: 1, ridge: 1, pauld: "round", couter: 0.05, poleyn: 0.045, cuffs: 1 } },
    { id: "genouilhac", name: "Genouilhac Armour", note: "French, 1527 · for Galiot de Genouilhac, Master of Artillery; etched and gilt all over (Metropolitan Museum)", color: "#c9a24a", bands: "#8a6418",
      zones: { torso: 1, arms: 1, legs: 1, feet: 1 }, tex: "gilt", skirt: 0.12,
      parts: { gorget: 1, ridge: 1, pauld: "round", couter: 0.055, poleyn: 0.05, cuffs: 1 } },
    { id: "erik14", name: "Erik XIV's Parade Armour", note: "Antwerp, c. 1563, Eliseus Libaerts · embossed and gilded for the King of Sweden (Livrustkammaren)", color: "#d4a62a", bands: "#7a5a1e",
      zones: { torso: 1, arms: 1, legs: 1, feet: 1 }, tex: "flutes", skirt: 0.14,
      parts: { gorget: 1, ridge: 1, pauld: "milanese", couter: 0.06, poleyn: 0.05, cuffs: 1 } },
    { id: "corslet", name: "Landsknecht Corslet", note: "Half armour, 1500s · breastplate, gorget, pauldrons, tassets", color: "#9a9c99",
      zones: { torso: 1 }, parts: { gorget: 1, ridge: 1, pauld: "round" } },
    { id: "munition", name: "Munition Breastplate", note: "Plain infantry breast and back", color: "#9a9c99", zones: { torso: 1 }, parts: { ridge: 1 } },
    { id: "brigandine", name: "Brigandine", note: "Cloth-covered plates held by gilt rivets · 1400s", color: "#8e2b23", paint: "cloth",
      zones: { torso: 1 }, tex: "rivets", skirt: 0.14, parts: { gorget: 1 } },
    { id: "mail", name: "Mail Hauberk", note: "Riveted mail to the knees · 1100s–1300s", color: "#8f918d",
      zones: { torso: 1, arms: 1 }, tex: "mail", skirt: 0.42, parts: {} },
    { id: "segmentata", name: "Lorica Segmentata", note: "Roman banded armour · 1st century", color: "#9a9c99",
      zones: { torso: 1 }, tex: "lames", pteruges: "#6b4a2c", parts: { pauld: "round" } },
    { id: "cuirass", name: "Bronze Cuirass", note: "Greek muscle cuirass and greaves · 400s BC", color: "#a8743a",
      zones: { torso: 1, shins: 1 }, pteruges: "#f1e9da", parts: { ridge: 1 } },
    { id: "ichcahuipilli", name: "Ichcahuipilli", note: "Aztec quilted cotton armour · soaked in brine, it stopped arrows and obsidian", color: "#efe6cf", paint: "cloth",
      zones: { torso: 1 }, tex: "lames", skirt: 0.16, parts: {} },
    { id: "tlingit", name: "Tlingit Slat Armour", note: "Northwest Coast · wooden slats bound with sinew over a hide tunic", color: "#8a5a2b", bands: "#3a2618",
      zones: { torso: 1 }, tex: "flutes", skirt: 0.3, parts: { gorget: 1 } },
    { id: "bigfoot", name: "Bigfoot", note: "Sasquatch of the Pacific Northwest woods · head-to-toe fur and very big feet", color: "#5a3a22", paint: "cloth",
      zones: { torso: 1, arms: 1, legs: 1, feet: 1 }, tex: "fur", skirt: 0.12, bulk: 1.28, footLen: 1.7, parts: { fur: 1 } },
    { id: "oyoroi", name: "Ō-yoroi", note: "Japanese laced lamellar armour with great shoulder plates", color: "#1d1712", lacing: "#a3261d", paint: "lacquer",
      zones: { torso: 1 }, tex: "lames", skirt: 0.26, parts: { pauld: "sode" } },
  ];

  // ---------- headwear ----------
  const HATS = [
    { id: "none", group: "hat", name: "Bare Head", note: "As you came", look: {} },
    { id: "beret", group: "hat", paint: "cloth", name: "Landsknecht Barett", note: "Slashed and plumed · 1500s", look: { hatType: "beret", hatColor: "#7e2620", hatTrim: "#efe2c4", plumeColor: "#f6f1e6", hatTop: 0.34 } },
    { id: "chaperone", group: "hat", paint: "cloth", name: "Chaperone", note: "Florentine padded hat · c. 1400", look: { chaperone: true, chapColor: "#7e2620", hatTop: 0.2 } },
    { id: "bonnet", group: "hat", paint: "cloth", name: "Flat Bonnet", note: "As in Meyer's woodcuts · 1570", look: { cap: true, capColor: "#1d1712" } },
    { id: "coif", group: "hat", paint: "cloth", name: "Arming Coif", note: "Linen cap worn under the helm · 1200s–1300s", look: { hatType: "coif", hatColor: "#f3ede0" } },
    { id: "cavalier", group: "hat", paint: "cloth", name: "Cavalier Hat", note: "Broad brim and plume · France, 1670", look: { hat: true, hatColor: "#2b2522", plumeColor: "#f6f1e6", hatTop: 0.27 } },
    { id: "tricorne", group: "hat", paint: "cloth", name: "Tricorne", note: "Cocked hat · 1700s", look: { hatType: "tricorne", hatColor: "#1d1712", hatTop: 0.18 } },
    { id: "bicorne", group: "hat", paint: "cloth", name: "Bicorne", note: "Worn athwart · Napoleonic", look: { hatType: "bicorne", hatColor: "#1d1712", hatTrim: "#a3261d", hatTop: 0.24 } },
    { id: "busby", group: "hat", paint: "cloth", name: "Hussar Kalpak", note: "Fur cap with a coloured bag · c. 1800", look: { hatType: "busby", hatColor: "#2a2018", hatTrim: "#a3261d", plumeColor: "#f6f1e6", hatTop: 0.42 } },
    { id: "tophat", group: "hat", paint: "cloth", name: "Top Hat", note: "Victorian silk hat · 1880s", look: { hatType: "tophat", hatColor: "#1d1712", hatTrim: "#4a3c2c", hatTop: 0.31 } },
    { id: "hennin", group: "hat", paint: "cloth", name: "Hennin", note: "Burgundian steeple headdress with a veil · 1400s", look: { hatType: "hennin", hatColor: "#5e3a7a", hatTrim: "#c9a24a", plumeColor: "#f6f1e6", hatTop: 0.46 } },
    { id: "frenchhood", group: "hat", paint: "cloth", name: "French Hood", note: "Tudor court headdress, 1530s · gold billiments, white crepine, black veil", look: { hatType: "frenchhood", hatColor: "#1d1712", hatTrim: "#d4a62a", plumeColor: "#f6f1e6", hatTop: 0.18 } },
    { id: "veil", group: "hat", paint: "cloth", name: "Wimple & Veil", note: "Linen head-dress · 1200s–1300s", look: { hatType: "veil", hatColor: "#f3ede0", hatTrim: "#f3ede0", hatTop: 0.18 } },
    { id: "imperialcrown", group: "hat", paint: "metal", name: "Royal Crown", note: "Closed crown with crossing arches, orb and cross, over a velvet cap · 1500s", look: { hatType: "imperial", hatColor: "#d4a62a", hatTrim: "#8e1b2b", plumeColor: "#e8c45a", hatTop: 0.27 } },
    { id: "crown", group: "hat", name: "Master's Crown", note: "Fiore's sign of a master", look: { crown: true, hatTop: 0.2 } },
    { id: "jingasa", group: "world", paint: "cloth", name: "Jingasa", note: "Japanese lacquered war hat", look: { hatType: "jingasa", hatColor: "#1d1712", hatTrim: "#d4a62a", hatTop: 0.17 } },
    { id: "turban", group: "world", paint: "cloth", name: "Mamluk Turban", note: "Wound about a red cap · Egypt, c. 1400", look: { hatType: "turban", hatColor: "#f3ede0", hatTrim: "#a3261d", hatTop: 0.21 } },
    { id: "tagelmust", group: "world", paint: "cloth", name: "Tagelmust", note: "Tuareg indigo turban and veil", look: { hatType: "tagelmust", hatColor: "#24304f", hatTrim: "#24304f", hatTop: 0.2 }, trimFollows: true },
    { id: "kufi", group: "world", paint: "cloth", name: "Kufi", note: "Round cap · West Africa", look: { hatType: "kufi", hatColor: "#d4a62a" } },
    { id: "fez", group: "world", paint: "cloth", name: "Fez", note: "Felt cap with a tassel · North Africa", look: { hatType: "fez", hatColor: "#a3261d", hatTrim: "#1d1712", hatTop: 0.27 } },
    { id: "furturban", group: "world", paint: "cloth", name: "Fur Turban", note: "Otter-fur turban · Great Lakes and Southeast", look: { hatType: "turban", hatColor: "#4a3424", hatTrim: "#4a3424", hatTop: 0.2 }, trimFollows: true },
    { id: "tlingithelm", group: "world", paint: "cloth", name: "Tlingit War Helmet", note: "Northwest Coast · a carved wooden helmet with a face, worn with a wooden collar", look: { helm: "grotesque", faceHidden: true, hatColor: "#7a5230", hatTop: 0.17 } },
    { id: "salakot", group: "world", paint: "cloth", name: "Salakot", note: "Filipino domed sun hat", look: { hatType: "salakot", hatColor: "#b89a6a", hatTrim: "#6b4a2c", hatTop: 0.2 } },
    { id: "kettle", group: "helm", paint: "metal", name: "Kettle Hat", note: "Chapel de fer · 1200s–1400s", look: { hatType: "kettle", hatColor: "#9a9c99", hatTop: 0.17 } },
    { id: "morion", group: "helm", paint: "metal", name: "Morion", note: "Spanish combed helmet · late 1500s", look: { hatType: "morion", hatColor: "#a7aaa8", hatTop: 0.21 } },
    { id: "sallet", group: "helm", paint: "metal", name: "Sallet & Bevor", note: "German, c. 1480 · swept tail, eye slit", look: { helm: "sallet", faceHidden: true, hatColor: "#c9ccce", hatTop: 0.17 } },
    { id: "closehelm", group: "helm", paint: "metal", name: "Close Helmet", note: "1500s · high comb, pointed visor, pierced ventail", look: { helm: "closehelm", faceHidden: true, hatColor: "#c9ccce", hatTrim: "#a7aaa8", hatTop: 0.21 } },
    { id: "greenwichhelm", group: "helm", paint: "metal", name: "Greenwich Close Helmet", note: "Greenwich, c. 1580 · blued with gilt bands, en suite with the Cumberland armour", look: { helm: "closehelm", faceHidden: true, hatColor: "#3b4a66", hatTrim: "#c9a24a", hatTop: 0.21 } },
    { id: "armetwrap", group: "helm", paint: "metal", name: "Armet with Wrapper", note: "Milanese, c. 1460–80 · a small visor and a heavy wrapper plate strapped over the lower face", look: { helm: "armetwrap", faceHidden: true, hatColor: "#c9ccce", hatTrim: "#6b4a2c", hatTop: 0.21 } },
    { id: "armet", group: "helm", paint: "metal", name: "Armet", note: "Italian closed helm, c. 1450 · hinged cheeks, rondel at the back", look: { helm: "armet", faceHidden: true, hatColor: "#c9ccce", hatTop: 0.2 } },
    { id: "barbute", group: "helm", paint: "metal", name: "Barbute", note: "Italian, c. 1450 · T-shaped face opening", look: { helm: "barbute", faceHidden: true, hatColor: "#c9ccce", hatTop: 0.17 } },
    { id: "burgonet", group: "helm", paint: "metal", name: "Burgonet", note: "Open helm with comb, peak and cheek plates · 1500s", look: { helm: "burgonet", hatColor: "#c9ccce", hatTop: 0.21 } },
    { id: "greathelm", group: "helm", paint: "metal", name: "Great Helm", note: "Flat-topped helm with a brass cross · 1200s", look: { helm: "greathelm", faceHidden: true, hatColor: "#9a9c99", hatTrim: "#c9a24a", hatTop: 0.17 } },
    { id: "kabuto", group: "helm", paint: "metal", name: "Kabuto", note: "Japanese helmet with gilt kuwagata horns", look: { helm: "kabuto", hatColor: "#1d1712", hatTop: 0.27 } },
    { id: "horned", group: "grotesque", paint: "metal", name: "Horned Helmet", note: "Henry VIII's gift from Maximilian I, 1512 · ram's horns, brass spectacles", look: { helm: "horned", faceHidden: true, hatColor: "#c9ccce", hatTrim: "#c9a24a", hatTop: 0.2 } },
    { id: "hounskull", group: "grotesque", paint: "metal", name: "Hounskull Bascinet", note: "The 'pig-faced' visor · c. 1400", look: { helm: "hounskull", faceHidden: true, hatColor: "#c9ccce", hatTop: 0.17 } },
    { id: "grotesque", group: "grotesque", paint: "metal", name: "Grotesque Visor", note: "A mocking steel face with nose and moustache · German, 1500s", look: { helm: "grotesque", faceHidden: true, hatColor: "#c9ccce", hatTop: 0.17 } },
    { id: "frogmouth", group: "helm", paint: "metal", name: "Frog-mouth Helm", note: "Stechhelm, German, c. 1500 · for the joust: a wide ridged crown, the sight a gap beneath it, the narrower lower plate bolted to the breastplate", look: { helm: "frogmouth", faceHidden: true, hatColor: "#c9ccce", hatTop: 0.22 } },
    { id: "bigfootmask", group: "grotesque", paint: "cloth", name: "Bigfoot Mask", note: "Goes with the Bigfoot suit", look: { helm: "bigfoot", faceHidden: true, hatColor: "#5a3a22", hatTrim: "#3a2a1d", hatTop: 0.18 } },
    { id: "oni", group: "grotesque", paint: "metal", name: "Oni Menpō", note: "Kabuto with a red demon face mask", look: { helm: "oni", faceHidden: true, hatColor: "#1d1712", hatTrim: "#a3261d", hatTop: 0.27 } },
  ];
  const HAT_GROUPS = [["hat", "Hats & headdresses"], ["world", "From further afield"], ["helm", "Helms"], ["grotesque", "Grotesque helms"]];

  // ---------- belts ----------
  const BELTS = [
    { id: "none", name: "No Belt", note: "" },
    { id: "belt", name: "Leather Belt", note: "With a brass buckle", look: { beltType: "belt", beltW: 0.05, beltColor: "#5a3a22" } },
    { id: "swordbelt", name: "Sword Belt", note: "Belt with a hanger strap at the left hip", look: { beltType: "swordbelt", beltW: 0.055, beltColor: "#3a2618" } },
    { id: "sash", name: "Sash", note: "Wide cloth sash, knotted at the side", look: { beltType: "sash", beltW: 0.15, beltColor: "#2a3d6e" } },
    { id: "lksash", name: "Landsknecht Sash", note: "A broad red sash · 1500s", look: { beltType: "sash", beltW: 0.2, beltColor: "#a3261d" } },
    { id: "obi", name: "Obi", note: "Japanese sash, tied at the back", look: { beltType: "obi", beltW: 0.2, beltColor: "#1d1712" } },
    { id: "baldric", name: "Baldric", note: "Shoulder belt across the chest", look: { beltType: "baldric", beltW: 0.05, beltColor: "#5a3a22" } },
    { id: "rope", name: "Rope Girdle", note: "A knotted cord, as monks wore", look: { beltType: "rope", beltW: 0.03, beltColor: "#d9c9a0" } },
  ];

  // ---------- the fencer (free) ----------
  const BODIES = [{ id: "broad", name: "Broad", note: "" }, { id: "slender", name: "Slender", note: "Narrower chest, wider hips" }];
  const HAIRS = [
    { id: "short", name: "Short" }, { id: "cropped", name: "Cropped" }, { id: "long", name: "Long" }, { id: "ponytail", name: "Ponytail" },
    { id: "bun", name: "Bun" }, { id: "braids", name: "Braids" }, { id: "topknot", name: "Topknot" }, { id: "afro", name: "Afro" },
    { id: "locs", name: "Locs" }, { id: "tonsure", name: "Tonsure" }, { id: "bald", name: "Bald" },
  ];
  const BEARDS = [
    { id: "none", name: "Clean-shaven" }, { id: "moustache", name: "Moustache" }, { id: "handlebar", name: "Handlebar" },
    { id: "goatee", name: "Goatee" }, { id: "vandyke", name: "Van Dyke" }, { id: "short", name: "Short Beard" }, { id: "full", name: "Full Beard" },
    { id: "forked", name: "Forked Beard" }, { id: "chops", name: "Mutton Chops" },
  ];
  const EYES = [
    { id: "none", name: "No Eyewear", note: "" }, { id: "spectacles", name: "Rivet Spectacles", note: "Round rims · 1400s onward" },
    { id: "pincenez", name: "Pince-nez", note: "Clipped to the nose · 1880s" }, { id: "tinted", name: "Tinted Spectacles", note: "Smoked lenses" },
    { id: "monocle", name: "Monocle", note: "On a gilt chain" }, { id: "patch", name: "Eye Patch", note: "Lost in a bout" },
  ];

  // ---------- stances ----------
  const AT_EASE = Object.assign({}, window.Fencer3D.REST, { view: 25 });
  let G = [], T = {};
  function stancePose(id, vi = 0) {
    const g = window.GUARDS.find((x) => x.id === id); // includes the Armoury's own stances (data/guards.js), as edited
    if (!g) return AT_EASE;
    const c = versionsOf(g)[vi % versionsOf(g).length];
    return window.guardPose(g, c.side, c.vi);
  }
  // every version of a guard the card arrow steps through: each variant on the right, then each on the left (sides in use only)
  function versionsOf(g) {
    const n = (g.poses || [g.pose]).length, out = [];
    for (const side of window.sidesUsedOf(g)) for (let vi = 0; vi < n; vi++) out.push({ side, vi });
    return out.length ? out : [{ side: "right", vi: 0 }];
  }
  const variantsOf = (g) => versionsOf(g).length;
  const cardVi = {}; // the variant each guard card is showing (guard id → index)
  const stanceName = (id) => id === "at_ease" ? "At Ease" : id === "bazooka_ready" ? "Shoulder Arms" : (G.find((x) => x.id === id) || {}).name || id;

  // ---------- slots and items ----------
  // item ids: "<prefix>:<id>"; weapons "sw:<model>:<finish>" (or "sw:<model>" for one-offs)
  const SLOTS = { body: "body", hair: "hair", beard: "beard", eyes: "eyes", out: "outfit", arm: "armour", hat: "hat", belt: "belt", dg: "dagger", bk: "buckler", sw: "sword", st: "stance" };
  const PREFIX = Object.fromEntries(Object.entries(SLOTS).map(([p, s]) => [s, p]));
  const DEFAULT_KIT = { body: "broad", hair: "short", beard: "none", eyes: "none", outfit: "braies", armour: "none", hat: "none", belt: "none",
    dagger: "none", buckler: "none", stance: "at_ease", stanceVi: 0, sword: "l18a:wood", colors: {} };
  // Your own looks are free: build, hair and facial hair (and every colour). Gear costs XP.
  const FREE_SLOTS = new Set(["body", "hair", "beard"]);
  const FREE = new Set(["out:braies", "st:at_ease", "sw:l18a:wood"]);
  const slotOf = (itemId) => SLOTS[itemId.split(":")[0]];
  const valueOf = (itemId) => itemId.split(":").slice(1).join(":");
  const isFree = (id) => FREE.has(id) || FREE_SLOTS.has(slotOf(id)) || valueOf(id) === "none";
  const priceOf = (id) => (isFree(id) ? 0 : PRICE);
  const itemOfKit = (slot, k) => PREFIX[slot] + ":" + k[slot];

  let api = null; // from game.js: myRecord, saveRecord
  const rec = () => api.myRecord();
  const owned = (r = rec()) => new Set(r.owned || []);
  const has = (id, set) => isFree(id) || set.has(id);
  const kitOf = (r = rec()) => { const k = Object.assign({}, DEFAULT_KIT, r.kit || {}); k.colors = Object.assign({}, (r.kit || {}).colors);
    if (k.stance === "shoulder_rest") { k.stance = "at_ease"; k.stanceVi = 1; } // "At Ease, Shouldered" is now At Ease variant 2
    return k; };
  const purse = (r = rec()) => Math.max(0, (r.xp || 0) - (r.spent || 0));

  // ---------- the look for a kit ----------
  function lookFor(k) {
    const C = k.colors || {}, skin = C.skin || SKIN0, hair = C.hair || "#3b2a1d";
    const L = { style: "plain", jacket: skin, thigh: skin, shin: skin, shoe: null, hair, skin, beard: 0, mustache: false, bulk: 1 };
    const outfit = OUTFITS.find((o) => o.id === k.outfit) || OUTFITS[0];
    for (const [key, v] of Object.entries(outfit.look)) L[key] = v === SKIN ? skin : Array.isArray(v) ? v.map((x) => (x === SKIN ? skin : x)) : v;
    if (L.shoe === SKIN) L.shoe = skin;
    // build, hair, facial hair, eyewear
    L.fem = k.body === "slender";
    if (L.fem && L.jacket === skin) L.breastband = true;
    L.hairStyle = k.hair; if (k.hair === "long") L.wig = true; if (k.hair === "tonsure") L.tonsure = true;
    L.beardColor = C.beard || hair;
    const b = k.beard;
    L.mustache = ["moustache", "vandyke", "full", "forked", "chops"].includes(b); L.beard = b === "short" ? 1 : b === "full" ? 2 : 0;
    L.goatee = b === "goatee" || b === "vandyke"; L.handlebar = b === "handlebar"; L.forked = b === "forked"; L.chops = b === "chops";
    if (k.eyes !== "none") L.eyewear = k.eyes;
    // armour over the garb
    const A = ARMOURS.find((a) => a.id === k.armour);
    if (A && A.zones) {
      const ac = C["arm:" + A.id] || A.color, dark = mix(ac, "#1d1712", 0.3), z = A.zones;
      if (z.torso) { L.breastband = false; L.noBust = true; }
      if (z.torso) { const garbArms = L.arms || L.jacket; // sleeves keep the garb's colour unless the arms are armoured too
        Object.assign(L, { jacket: ac, arms: garbArms, coat: false, cravat: false }); delete L.stripes; delete L.stripesAcross; delete L.dots; }
      if (z.arms) L.arms = ac;
      if (z.legs) { L.thigh = L.shin = ac; L.puffs = false; L.braies = false; }
      if (z.shins) { if (L.shoe == null) L.shoe = L.shin; L.shin = ac; } // greaves only: the feet keep the garb's shoes
      if (z.feet) L.shoe = ac;
      if (A.footLen) L.footLen = A.footLen;
      if (A.bulk) L.bulk = A.bulk;
      if (A.tex === "flutes") L.stripes = [ac, A.bands || mix(ac, "#1d1712", 0.18)];
      if (A.tex === "gilt") { L.stripes = [ac, A.bands || "#c9a24a"]; L.stripesSparse = true; } // etched and gilt bands running down the plate
      if (A.tex === "lames") { L.stripes = [ac, A.lacing || dark]; L.stripesAcross = true; L.stripeRows = 5; }
      if (A.tex === "rivets") { L.dots = [ac, "#d4a62a", "dot"]; L.dotsJacketOnly = true; }
      if (A.tex === "mail") L.dots = [ac, dark, "ring"];
      if (A.tex === "fur") { L.dots = [ac, dark, "fur"]; if (A.skirt) L.skirtDots = [ac, dark, "fur"]; }
      if (A.skirt) { L.skirtLen = A.skirt; L.skirtColor = ac; delete L.skirtStripes; L.braies = false;
        if (A.tex === "mail" || A.tex === "fur") L.skirtDots = [ac, dark, A.tex === "fur" ? "fur" : "ring"]; else if (A.tex === "rivets") L.skirtDots = [ac, "#d4a62a", "dot"];
        else { L.skirtStripes = [ac, A.lacing || dark]; L.skirtAcross = true; } }
      if (A.pteruges) { L.skirtLen = 0.26; L.skirtStripes = [A.pteruges, mix(A.pteruges, "#1d1712", 0.35)]; L.skirtAcross = false; L.braies = false; }
      L.armourParts = A.parts; L.armourColor = ac;
    }
    // headwear
    const H = HATS.find((h) => h.id === k.hat) || HATS[0];
    Object.assign(L, H.look);
    const hc = C["hat:" + H.id];
    if (hc) { if (H.look.chaperone) L.chapColor = hc; else if (H.look.cap) L.capColor = hc; else L.hatColor = hc; if (H.trimFollows) L.hatTrim = hc; }
    // belt
    const Bt = BELTS.find((x) => x.id === k.belt);
    if (Bt && Bt.look) { Object.assign(L, Bt.look); if (C["belt:" + Bt.id]) L.beltColor = C["belt:" + Bt.id]; L.noBelt = false; } else L.noBelt = true;
    // dagger, buckler
    const D = daggerById[k.dagger]; if (D) L.dagger = D.spec;
    const Bk = bucklerById[k.buckler]; if (Bk) L.buckler = Bk.spec;
    return L;
  }

  function itemName(itemId) {
    const slot = slotOf(itemId), v = valueOf(itemId);
    const find = (list) => (list.find((x) => x.id === v) || {}).name || v;
    if (slot === "outfit") return find(OUTFITS);
    if (slot === "armour") return find(ARMOURS);
    if (slot === "hat") return find(HATS);
    if (slot === "belt") return find(BELTS);
    if (slot === "dagger") return v === "none" ? "No Dagger" : find(DAGGERS);
    if (slot === "buckler") return v === "none" ? "No Buckler" : find(BUCKLERS);
    if (slot === "body") return find(BODIES) + " build";
    if (slot === "hair") return find(HAIRS) + " hair";
    if (slot === "beard") return find(BEARDS);
    if (slot === "eyes") return find(EYES);
    if (slot === "stance") return stanceName(v);
    const [m, f] = v.split(":"), model = swordById[m], fin = model && (model.fins || FINISH).find((x) => x.id === f);
    if (!model) return v;
    if (model.fins && fin) return model.name + " — " + fin.label.toLowerCase() + (model.finsAll ? "" : " blade");
    if (model.single || !fin) return model.name;
    if (f === "wood") return model.name + " — " + SWORD_CLASSES.find((c) => c.id === model.cls).wood;
    return model.name + " — " + fin.label.toLowerCase() + " hilt";
  }

  // ---------- 2D pictures for weapon, dagger and buckler cards ----------
  function drawSword(cv, spec) {
    const W = cv.width, Hh = cv.height, x = cv.getContext("2d");
    x.clearRect(0, 0, W, Hh);
    const S = (W - 16) / Math.max(1.8, (spec.grip || 0) + (spec.blade || 0) + 0.08), cy = Hh * 0.55, ink = "#1d1712";
    x.lineWidth = 1.4; x.strokeStyle = ink; x.lineJoin = "round";
    const hiltC = spec.hiltColor || "#5e5a52", bladeC = spec.bladeColor || "#d9d6cf", gripC = spec.gripColor || "#5a3a22";
    const shape = (pts, fill) => { x.beginPath(); pts.forEach(([a, b], i) => (i ? x.lineTo(a, b) : x.moveTo(a, b))); x.closePath(); x.fillStyle = fill; x.fill(); x.stroke(); };
    const oval = (cx, cyy, rx, ry, fill) => { x.beginPath(); x.ellipse(cx, cyy, Math.max(rx, 0.5), Math.max(ry, 0.5), 0, 0, Math.PI * 2); x.fillStyle = fill; x.fill(); x.stroke(); };
    if (spec.boomerang) { const bm = spec.boomerang, S2 = (W - 16) / 0.8, w2 = bm.w * S2, x0 = 12, y0 = Hh * 0.8;
      const turn = (180 - bm.angle) * Math.PI / 180, ex = x0 + bm.a * S2, ey = y0, tx = ex + Math.cos(turn) * bm.b * S2, ty = ey - Math.sin(turn) * bm.b * S2;
      x.lineCap = "round"; x.lineJoin = "round";
      x.strokeStyle = ink; x.lineWidth = w2 + 3; x.beginPath(); x.moveTo(x0, y0); x.lineTo(ex, ey); x.lineTo(tx, ty); x.stroke();
      x.strokeStyle = spec.bladeColor || "#8a5a2b"; x.lineWidth = w2; x.beginPath(); x.moveTo(x0, y0); x.lineTo(ex, ey); x.lineTo(tx, ty); x.stroke();
      x.lineWidth = 1.4; x.strokeStyle = ink; return; }
    if (spec.mace) { // a mace or club: the haft and its head
      const mc = spec.mace, len = spec.grip + spec.blade, x0 = 8, xh = x0 + (spec.grip + (mc.at || 1) * spec.blade) * S, gr = Math.max(2.5, (spec.gripR || 0.016) * S * 1.6), headC = spec.bladeColor || "#d9d6cf";
      shape([[x0, cy - gr], [x0 + len * S, cy - gr], [x0 + len * S, cy + gr], [x0, cy + gr]], gripC);
      if (mc.type === "club") { const cl = (mc.len || 0.45) * S, xe = x0 + len * S; oval(xe - cl / 2, cy, cl / 2, mc.r * S, headC);
        for (let i = 0; i < 6; i++) oval(xe - cl * (0.15 + i * 0.14), cy + (i % 2 ? -1 : 1) * mc.r * S * 0.55, 2, 2, ink); }
      else if (mc.type === "flanged") { for (const sg of [-1, 1]) shape([[xh - mc.h * S / 2, cy], [xh - mc.h * S * 0.35, cy + sg * mc.r * S * 1.2], [xh + mc.h * S * 0.35, cy + sg * mc.r * S * 1.2], [xh + mc.h * S / 2, cy]], headC);
        oval(xh, cy, mc.h * S * 0.45, mc.r * S * 0.5, headC); shape([[xh + mc.h * S * 0.4, cy - 3], [xh + mc.h * S * 0.4 + 0.035 * S, cy], [xh + mc.h * S * 0.4, cy + 3]], headC); }
      else if (mc.type === "star") { for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, r1 = mc.r * S, r2 = (mc.r + 0.045) * S;
          shape([[xh + Math.cos(a + 0.25) * r1, cy + Math.sin(a + 0.25) * r1], [xh + Math.cos(a) * r2, cy + Math.sin(a) * r2], [xh + Math.cos(a - 0.25) * r1, cy + Math.sin(a - 0.25) * r1]], headC); }
        oval(xh, cy, mc.r * S, mc.r * S, headC); }
      else oval(xh, cy, (mc.type === "pear" ? 1.25 : 1) * mc.r * S, mc.r * S, headC);
      return;
    }
    if (spec.axe) { // an axe: the haft, the head below it (the bit is on the edge side), socket, spike, back
      const a = spec.axe, len = spec.grip + spec.blade, x0 = 8, xh = x0 + (spec.grip + a.at * spec.blade) * S, gr = Math.max(2.5, (spec.gripR || 0.016) * S * 1.6);
      shape([[x0, cy - gr], [x0 + len * S, cy - gr], [x0 + len * S, cy + gr], [x0, cy + gr]], gripC);
      if (a.langets) shape([[xh - a.langets * S, cy - gr * 1.2], [xh, cy - gr * 1.2], [xh, cy + gr * 1.2], [xh - a.langets * S, cy + gr * 1.2]], hiltC);
      const bitC = spec.bladeColor || "#d9d6cf", hl = a.len * S, hh = a.h * S;
      const bd = (a.beard || 0) * S, fanPic = (sg) => { x.beginPath(); x.moveTo(xh - 3, cy); x.lineTo(xh - hh / 2 - bd, cy + sg * hl);
        x.quadraticCurveTo(xh - bd / 2, cy + sg * hl * 1.18, xh + hh / 2, cy + sg * hl); x.lineTo(xh + 3, cy); x.closePath(); x.fillStyle = bitC; x.fill(); x.stroke(); };
      if (a.hammer) { shape([[xh - 7, cy + gr], [xh + 7, cy + gr], [xh + 7, cy + 0.07 * S], [xh - 7, cy + 0.07 * S]], bitC);
        if (a.prongs) for (const dx of [-4.5, 4.5]) shape([[xh + dx - 3, cy + 0.07 * S], [xh + dx, cy + 0.11 * S], [xh + dx + 3, cy + 0.07 * S]], bitC); }
      else if (a.crescent) { x.beginPath(); x.ellipse(xh, cy + hl * 0.55, hh / 2, hl * 0.58, 0, 0, Math.PI * 2); x.fillStyle = bitC; x.fill(); x.stroke(); } else fanPic(1);
      if (a.back === "blade") fanPic(-1);
      if (a.back === "hammer") shape([[xh - 6, cy - 4], [xh + 6, cy - 4], [xh + 6, cy - 0.045 * S - 4], [xh - 6, cy - 0.045 * S - 4]], bitC);
      if (a.back === "beak") shape([[xh - 4, cy - gr], [xh - 0.05 * S, cy - 0.17 * S], [xh - 0.03 * S, cy - 0.16 * S], [xh + 4, cy - gr]], bitC);
      if (a.back === "hook" || a.back === "spike") shape([[xh - 3, cy - gr], [xh - (a.back === "hook" ? 0.03 : 0) * S, cy - 0.12 * S], [xh + 3, cy - gr]], bitC);
      if (a.spike) shape([[xh + 3, cy - gr], [xh + (0.04 + a.spike) * S, cy], [xh + 3, cy + gr]], bitC);
      shape([[xh - 0.045 * S, cy - gr * 1.45], [xh + 0.045 * S, cy - gr * 1.45], [xh + 0.045 * S, cy + gr * 1.45], [xh - 0.045 * S, cy + gr * 1.45]], hiltC);
      return;
    }
    if (spec.bazooka) {
      const x0 = 14, len = 1.5 * S;
      shape([[x0, cy - 7], [x0 + len, cy - 7], [x0 + len, cy + 7], [x0, cy + 7]], "#55603a");
      shape([[x0 + len - 10, cy - 9], [x0 + len + 2, cy - 9], [x0 + len + 2, cy + 9], [x0 + len - 10, cy + 9]], "#55603a");
      shape([[x0 + 0.62 * S - 3, cy + 7], [x0 + 0.62 * S + 3, cy + 7], [x0 + 0.62 * S - 1, cy + 20], [x0 + 0.62 * S - 7, cy + 20]], "#5a3a22");
      shape([[x0 + 0.85 * S, cy - 7], [x0 + 0.85 * S + 2, cy - 15], [x0 + 0.85 * S + 4, cy - 7]], ink);
      return;
    }
    const pommelLen = spec.pommelStyle === "none" ? 0 : (spec.pommel || 0.03) * 2;
    const x0 = 8 + pommelLen * S, xc = x0 + spec.grip * S, L = spec.blade * S;
    const bw = 0.021 * (spec.w || 1) * S * 1.7;
    const prof = spec.prof || (spec.shape === "parallel" ? [1, 0.67] : spec.shape === "acute" ? [1, 0.07] : [1, 0.19]);
    const offY = (t) => Fencer3D.bladeOffset(spec, t) * S * (spec.flame ? 1.6 : 1.2);
    // blade outline (edge below, spine above), sampled so curved, wavy and leaf blades show
    const top = [], bot = [], N = 40;
    for (let i = 0; i <= N; i++) {
      const t = i / N, half = bw * Fencer3D.profAt(prof, t) * (spec.twist ? 0.25 + 0.75 * Math.abs(Math.cos(spec.twist * 2 * Math.PI * t)) : 1);
      const fw = spec.forte && t * spec.blade < spec.forte[0] ? spec.forte[1] : 1;
      top.push([xc + t * L, cy + offY(t) - half * fw]); bot.push([xc + t * L, cy + offY(t) + half * fw]);
    }
    const tipX = xc + L + (spec.shape === "parallel" ? bw * 0.4 : 0);
    shape([...top, [tipX, cy + offY(1)], ...bot.reverse()], bladeC);
    if (spec.ricasso) shape([[xc, cy - bw * 0.9], [xc + spec.ricasso * L, cy - bw * 0.9], [xc + spec.ricasso * L, cy + bw * 0.9], [xc, cy + bw * 0.9]], gripC);
    if (spec.hooks) { const hx = xc + spec.hooks.at * L, hl = (spec.hooks.len || 0.05) * S * 1.4; // parrying hooks, angled toward the point
      shape([[hx - 3, cy - bw], [hx + 2, cy - bw - hl], [hx + 4.5, cy - bw - hl], [hx, cy - bw]], hiltC);
      shape([[hx - 3, cy + bw], [hx + 2, cy + bw + hl], [hx + 4.5, cy + bw + hl], [hx, cy + bw]], hiltC); }
    if (spec.band) shape([[xc + 0.06 * S, cy - bw * 0.9], [xc + 0.15 * S, cy - bw * 0.9], [xc + 0.15 * S, cy + bw * 0.9], [xc + 0.06 * S, cy + bw * 0.9]], "#d4a62a");
    if (spec.schilt === "tulip") { shape([[xc, cy - bw * 2.6], [xc + 0.1 * S, cy - bw * 3.6], [xc + 0.13 * S, cy - bw * 2.4], [xc + 0.12 * S, cy - bw],
        [xc + 0.12 * S, cy + bw], [xc + 0.13 * S, cy + bw * 2.4], [xc + 0.1 * S, cy + bw * 3.6], [xc, cy + bw * 2.6]], bladeC); }
    else if (spec.schilt) shape([[xc, cy - bw * 2.2], [xc + 0.08 * S, cy - bw], [xc + 0.08 * S, cy + bw], [xc, cy + bw * 2.2]], bladeC);
    // grip
    const gr = (spec.gripR || 0.017) * S * 1.6;
    shape([[x0, cy - gr], [xc, cy - gr], [xc, cy + gr], [x0, cy + gr]], gripC);
    // knuckle bow (below the grip, on the edge side) and swept bars
    if (spec.bow || spec.bars) { x.beginPath(); x.lineWidth = 3.2; x.strokeStyle = hiltC;
      x.moveTo(xc, cy); x.quadraticCurveTo((x0 + xc) / 2, cy + (spec.bowW || 0.045) * S * 2.6, x0, cy + 2); x.stroke();
      if (spec.bars) { x.moveTo(xc, cy); x.quadraticCurveTo((x0 + xc) / 2, cy + 0.07 * S * 2, x0 + 4, cy + 3); x.stroke(); }
      x.lineWidth = 1.4; x.strokeStyle = ink; }
    if (spec.ring || spec.ring2) { x.beginPath(); x.lineWidth = 2.6; x.strokeStyle = hiltC; x.ellipse(xc + 0.03 * S, cy, 0.03 * S, 0.034 * S * 0.6, 0, 0, Math.PI * 2); x.stroke(); x.lineWidth = 1.4; x.strokeStyle = ink; }
    // cross / tsuba / cup / shells
    const c = (spec.cross || 0) * S, cr = Math.max(2.4, (spec.crossR || 0.011) * S * 1.6);
    if (spec.crossStyle === "disc") oval(xc, cy, 3, (spec.tsuba || 0.04) * S, hiltC);
    else if (c > 0) {
      if (spec.crossStyle === "x") { x.lineWidth = Math.max(2.5, cr * 1.4); x.strokeStyle = hiltC; x.lineCap = "round";
        x.beginPath(); x.moveTo(xc - c * 0.6, cy - c); x.lineTo(xc + c * 0.6, cy + c); x.moveTo(xc - c * 0.6, cy + c); x.lineTo(xc + c * 0.6, cy - c); x.stroke();
        x.lineWidth = 1.4; x.strokeStyle = ink; }
      else if (spec.crossStyle === "s") { shape([[xc - cr, cy - c * 0.85], [xc + cr, cy - c * 0.85], [xc + cr, cy + c * 0.85], [xc - cr, cy + c * 0.85]], hiltC);
        oval(xc, cy - c * 0.92, cr * 1.9, cr * 1.3, hiltC); oval(xc, cy + c * 0.92, cr * 1.9, cr * 1.3, hiltC); }
      else if (spec.crossStyle === "droop") shape([[xc - cr, cy], [xc + 0.035 * S, cy - c], [xc + 0.035 * S + cr, cy - c + 1], [xc + cr, cy], [xc + 0.035 * S + cr, cy + c - 1], [xc + 0.035 * S, cy + c]], hiltC);
      else shape([[xc - cr, cy - c], [xc + cr, cy - c], [xc + cr, cy + c], [xc - cr, cy + c]], hiltC);
      if (spec.crossStyle === "flare" || spec.crossKnobs) { const dx = spec.crossKnobs ? 0.035 * S : 0; oval(xc + dx, cy - c, cr * 1.6, cr * 1.6, hiltC); oval(xc + dx, cy + c, cr * 1.6, cr * 1.6, hiltC); }
    }
    if (spec.cup) { x.beginPath(); x.ellipse(xc, cy, spec.cupD * S * 1.4, spec.cup * S, 0, -Math.PI / 2, Math.PI / 2); x.closePath(); x.fillStyle = hiltC; x.fill(); x.stroke(); }
    if (spec.shells) oval(xc + 2, cy, spec.shells * S * 0.45, spec.shells * S, hiltC);
    // pommel
    const pr = (spec.pommel || 0.03) * S, ps = spec.pommelStyle || "ball";
    if (ps === "none") return;
    if (ps === "wheel") oval(x0 - pr * 0.75, cy, pr * 0.75, pr, hiltC);
    else if (ps === "nut") oval(x0 - pr * 1.1, cy, pr * 1.3, pr * 0.8, hiltC);
    else if (ps === "scent") { shape([[x0, cy - pr * 0.5], [x0 - pr * 2.6, cy - pr * 0.4], [x0 - pr * 2.6, cy + pr * 0.4], [x0, cy + pr * 0.5]], hiltC); oval(x0 - pr * 0.4, cy, pr * 0.9, pr * 0.9, hiltC); }
    else if (ps === "pear") oval(x0 - pr * 1.1, cy, pr * 1.25, pr * 0.95, hiltC);
    else if (ps === "cap") shape([[x0, cy - gr * 1.2], [x0 - 4, cy - gr * 1.1], [x0 - 4, cy + gr * 1.1], [x0, cy + gr * 1.2]], hiltC);
    else if (ps === "fishtail") shape([[x0, cy - gr], [x0 - 7, cy - gr * 2.4], [x0 - 7, cy + gr * 2.4], [x0, cy + gr]], hiltC);
    else if (ps === "pyramid") shape([[x0 + 2, cy], [x0 - pr * 2.1, cy - pr * 1.15], [x0 - pr * 2.1, cy + pr * 1.15]], hiltC);
    else if (ps === "ring") oval(x0 - pr * 1.0, cy, pr * 1.05, pr * 0.32, hiltC); // the ring seen edge-on, across the grip
    else if (ps === "eagle") { oval(x0 - 4, cy + 2, 5, 4, hiltC); shape([[x0 - 6, cy + 4], [x0 - 13, cy + 9], [x0 - 7, cy + 7]], hiltC); }
    else oval(x0 - pr * 0.8, cy, pr, pr, hiltC);
    if (spec.writhen) { x.save(); x.strokeStyle = "rgba(29,23,18,.55)"; x.lineWidth = 1.2; x.beginPath(); x.rect(x0 - pr * 2.4, cy - pr * 1.2, pr * 2.4, pr * 2.4); x.clip();
      for (let i = -20; i < 20; i += 3.5) { x.beginPath(); x.moveTo(x0 - pr * 2.4 + i, cy - pr * 1.2); x.lineTo(x0 - pr * 2.4 + i + pr * 2.4, cy + pr * 1.2); x.stroke(); } x.restore(); }
  }
  // a dagger in its sheath, hilt to the left
  function drawDagger(cv, d) {
    const W = cv.width, Hh = cv.height, x = cv.getContext("2d"); x.clearRect(0, 0, W, Hh);
    const S = (W - 30) / 0.55, cy = Hh * 0.5, ink = "#1d1712"; x.lineWidth = 1.4; x.strokeStyle = ink; x.lineJoin = "round";
    const metal = d.metal || "#9a9c99", sheath = d.sheath || "#3a2618", grip = d.gripC || "#5a3a22";
    const shape = (pts, fill) => { x.beginPath(); pts.forEach(([a, b], i) => (i ? x.lineTo(a, b) : x.moveTo(a, b))); x.closePath(); x.fillStyle = fill; x.fill(); x.stroke(); };
    const oval = (cx, cyy, rx, ry, fill) => { x.beginPath(); x.ellipse(cx, cyy, rx, ry, 0, 0, Math.PI * 2); x.fillStyle = fill; x.fill(); x.stroke(); };
    const xg = 16 + d.grip * S, w = (d.w || 0.022) * S, gr = (d.gripR || 0.013) * S;
    if (d.jcurve) { x.beginPath(); x.moveTo(xg, cy - w); x.lineTo(xg + d.len * 0.55 * S, cy - w);
      x.quadraticCurveTo(xg + d.len * S, cy - w, xg + d.len * 0.95 * S, cy + w * 3.5); x.lineTo(xg + d.len * 0.85 * S, cy + w * 3);
      x.quadraticCurveTo(xg + d.len * 0.8 * S, cy + w, xg + d.len * 0.5 * S, cy + w); x.lineTo(xg, cy + w); x.closePath(); x.fillStyle = sheath; x.fill(); x.stroke(); }
    else shape([[xg, cy - w], [xg + d.len * S, cy - w * 0.25], [xg + d.len * S, cy + w * 0.25], [xg, cy + w]], sheath);
    if (d.top) shape([[xg, cy - d.top * S * 0.6], [xg + 10, cy - w], [xg + 10, cy + w], [xg, cy + d.top * S * 0.6]], sheath);
    shape([[16, cy - gr], [xg, cy - gr], [xg, cy + gr], [16, cy + gr]], grip);
    const gw = (d.gw || 0.04) * S;
    if (d.guard === "cross" || d.guard === "bar") shape([[xg - 2, cy - gw], [xg + 2, cy - gw], [xg + 2, cy + gw], [xg - 2, cy + gw]], metal);
    if (d.guard === "disc") oval(xg, cy, 3, gw, metal);
    if (d.guard === "shell") { x.beginPath(); x.ellipse(xg, cy, gw * 0.5, gw, 0, -Math.PI / 2, Math.PI / 2); x.closePath(); x.fillStyle = metal; x.fill(); x.stroke(); }
    if (d.guard === "balls") { oval(xg, cy - gr * 1.6, gr * 1.4, gr * 1.4, grip); oval(xg, cy + gr * 1.6, gr * 1.4, gr * 1.4, grip); }
    const pr = (d.pr || 0.02) * S;
    if (d.pommel === "ball") oval(16 - pr * 0.6, cy, pr, pr, metal);
    if (d.pommel === "disc") oval(16 - 2, cy, 3, pr, metal);
    if (d.pommel === "bar") shape([[14, cy - pr], [18, cy - pr], [18, cy + pr], [14, cy + pr]], metal);
    if (d.pommel === "cap") shape([[16, cy - gr * 1.3], [12, cy - gr * 1.2], [12, cy + gr * 1.2], [16, cy + gr * 1.3]], metal);
  }
  // a buckler seen face-on
  function drawBuckler(cv, b) {
    const W = cv.width, Hh = cv.height, x = cv.getContext("2d"); x.clearRect(0, 0, W, Hh);
    const S = Math.min(W, Hh) * 0.46 / 0.26, cx = W / 2, cy = Hh / 2, ink = "#1d1712", r = b.r * S;
    const circ = (rr, fill, stroke = ink, lw = 1.4) => { x.beginPath(); x.arc(cx, cy, rr, 0, Math.PI * 2); if (fill) { x.fillStyle = fill; x.fill(); } x.lineWidth = lw; x.strokeStyle = stroke; x.stroke(); };
    circ(r, b.board);
    if (b.dome) { const g = x.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 2, cx, cy, r); g.addColorStop(0, "rgba(255,255,255,.35)"); g.addColorStop(1, "rgba(0,0,0,0)"); x.fillStyle = g; x.beginPath(); x.arc(cx, cy, r, 0, Math.PI * 2); x.fill(); }
    if (b.rim !== false) circ(r - 2, null, b.metal, 3);
    if (b.rings) circ(r * 0.66, null, b.metal, 2.5);
    if (b.studs) for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4; x.beginPath(); x.arc(cx + Math.cos(a) * r * 0.6, cy + Math.sin(a) * r * 0.6, Math.max(2.5, 0.016 * S), 0, Math.PI * 2); x.fillStyle = b.metal; x.fill(); x.stroke(); }
    if (b.boss !== false) circ((b.bossR || 0.05) * S, b.metal);
    if (b.spike) circ(3, ink);
  }

  // ---------- screen ----------
  const TABS = [["fencer", "Fencer"], ["weapons", "Weapons"], ["daggers", "Daggers"], ["bucklers", "Bucklers"], ["garb", "Garb"],
    ["armour", "Armour"], ["head", "Head"], ["belts", "Belts"], ["guards", "Guards"]];
  let stageFig = null, thumbFig = null, tab = "weapons", preview = null, stageYaw = null, confirmFor = null, confirmTimer = 0;
  const thumbCache = new Map();

  function init(a) {
    api = a; G = a.guards; T = a.traditions;
    const tabs = $("#arm-tabs"); tabs.innerHTML = "";
    for (const [id, label] of TABS) { const b = document.createElement("button"); b.dataset.v = id; b.textContent = label;
      b.addEventListener("click", () => { tab = id; window.Sfx && Sfx.card(); renderGrid(); paintTabs(); $("#arm-scroll").scrollTop = 0; }); tabs.appendChild(b); }
    $("#arm-buy").addEventListener("click", onAction);
    $("#arm-reset").addEventListener("click", () => { preview = null; window.Sfx && Sfx.quill(); paintStage(); paintAction(); markCards(); });
    // drag to turn (and, zoomed in, up/down to move the view); pinch or mouse wheel or + − to zoom; ⟲ puts the view back
    const st = $("#arm-stage"), ptrs = new Map(); let pinch = null;
    const dist = () => { const [a, b] = [...ptrs.values()]; return Math.hypot(a.x - b.x, a.y - b.y) || 1; };
    st.addEventListener("pointerdown", (e) => { if (e.target.closest("button")) return; if (e.isPrimary) { ptrs.clear(); pinch = null; }
      ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
      st.setPointerCapture(e.pointerId); if (ptrs.size === 2) pinch = { d: dist(), z: cam.zoom || 1 }; });
    st.addEventListener("pointermove", (e) => {
      const p = ptrs.get(e.pointerId); if (!p || !stageFig) return;
      const dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY;
      if (ptrs.size >= 2 && pinch) cam.zoom = pinch.z * dist() / pinch.d;
      else { cam.yaw = (cam.yaw || 0) + dx * 0.6; cam.pan = (cam.pan || 0) + dy * 0.004 / (cam.zoom || 1); }
      applyCam();
    });
    const up = (e) => { ptrs.delete(e.pointerId); if (ptrs.size < 2) pinch = null; saveCam(); };
    st.addEventListener("lostpointercapture", up);
    const turn = (deg) => { cam.yaw = (cam.yaw || 0) + deg; window.Sfx && Sfx.quill(); applyCam(); saveCam(); };
    $("#arm-rl").addEventListener("click", () => turn(-30));
    // move the view up or down (most useful zoomed in, to look at the head or the feet)
    const lift = (m) => { cam.pan = (cam.pan || 0) + m / Math.sqrt(cam.zoom || 1); window.Sfx && Sfx.quill(); applyCam(); saveCam(); };
    $("#arm-up").addEventListener("click", () => lift(0.15));
    $("#arm-down").addEventListener("click", () => lift(-0.15));
    $("#arm-rr").addEventListener("click", () => turn(30));
    st.addEventListener("pointerup", up); st.addEventListener("pointercancel", up);
    st.addEventListener("wheel", (e) => { e.preventDefault(); cam.zoom = (cam.zoom || 1) * Math.exp(-e.deltaY * 0.0015); applyCam(); saveCam(); }, { passive: false });
    $("#arm-zin").addEventListener("click", () => { cam.zoom = (cam.zoom || 1) * 1.35; applyCam(); saveCam(); });
    $("#arm-zout").addEventListener("click", () => { cam.zoom = (cam.zoom || 1) / 1.35; applyCam(); saveCam(); });
    $("#arm-zreset").addEventListener("click", () => { cam = {}; saveCam(); window.Sfx && Sfx.quill(); paintStage(); });
  }
  const paintTabs = () => document.querySelectorAll("#arm-tabs button").forEach((b) => { b.classList.toggle("on", b.dataset.v === tab);
    if (b.dataset.v === tab) { const strip = b.parentElement; strip.scrollLeft = Math.max(0, b.offsetLeft - (strip.clientWidth - b.offsetWidth) / 2); } });

  // the kit as worn, with the item being looked at tried on in its slot
  function shownKit() {
    const k = kitOf();
    if (preview) k[slotOf(preview)] = valueOf(preview);
    if (preview && slotOf(preview) === "stance") k.stanceVi = cardVi[k.stance] || 0;
    if (preview === "st:bazooka_ready") k.sword = "bazooka"; // try the stance with the launcher it was made for
    return k;
  }
  function dress(fig, k, pose) {
    fig.setLook(lookFor(k));
    const [m, f] = k.sword.split(":"), C = k.colors || {}, sp = swordSpec(m, f);
    if (sp && C["swgrip:" + m]) sp.gripColor = C["swgrip:" + m];
    fig.setSword(sp);
    fig.set(pose || stancePose(k.stance, k.stanceVi));
  }
  // the Armoury camera (turn, zoom, height) is kept between visits and while trying things on; ⟲ resets it
  let cam = (() => { try { return JSON.parse(localStorage.getItem("so.armCam")) || {}; } catch (e) { return {}; } })();
  const saveCam = () => { try { localStorage.setItem("so.armCam", JSON.stringify(cam)); } catch (e) { /* private mode */ } };
  function applyCam() {
    if (!stageFig) return;
    cam.zoom = Math.min(5, Math.max(1, cam.zoom || 1));
    const lim = 0.3 + 0.45 * (cam.zoom - 1); cam.pan = Math.min(lim, Math.max(-lim, cam.pan || 0));
    stageFig.setZoom(cam.zoom, cam.pan); stageFig.setView(cam.yaw); stageFig.render();
  }
  function paintStage() {
    if (!stageFig) stageFig = Fencer3D.makeFigure($("#arm-fig"), "#a3261d");
    const k = shownKit(), p = stancePose(k.stance, k.stanceVi);
    if (cam.yaw == null) cam.yaw = p.view != null ? p.view : 25;
    dress(stageFig, k, p);
    applyCam();
  }
  function paintAction() {
    const btn = $("#arm-buy"), cap = $("#arm-cap"), r = rec(), mine = owned(r), k = kitOf(r);
    $("#arm-purse").textContent = purse(r).toLocaleString();
    $("#arm-reset").classList.toggle("hidden", !preview);
    clearTimeout(confirmTimer);
    if (!preview) { cap.textContent = ""; btn.classList.add("hidden"); return; }
    cap.textContent = itemName(preview);
    btn.classList.remove("hidden"); btn.disabled = false; btn.classList.remove("confirm");
    const worn = itemOfKit(slotOf(preview), k) === preview;
    if (worn) { btn.textContent = "Worn"; btn.disabled = true; }
    else if (has(preview, mine)) btn.textContent = slotOf(preview) === "stance" ? "Take this guard" : priceOf(preview) ? "Wear it" : "Choose";
    else if (purse(r) < priceOf(preview)) { btn.textContent = `${priceOf(preview)} XP · need ${(priceOf(preview) - purse(r)).toLocaleString()} more`; btn.disabled = true; }
    else btn.textContent = confirmFor === preview ? `Tap again · ${priceOf(preview)} XP` : `Buy · ${priceOf(preview)} XP`;
    if (confirmFor === preview && !has(preview, mine)) btn.classList.add("confirm");
  }
  function saveKit(mut) { const r = rec(), k = kitOf(r); mut(k, r); r.kit = k; api.saveRecord(r); }
  function onAction() {
    if (!preview) return;
    const r = rec(), mine = owned(r);
    const take = () => { saveKit((k) => { k[slotOf(preview)] = valueOf(preview); if (slotOf(preview) === "stance") k.stanceVi = cardVi[k.stance] || 0; }); };
    if (has(preview, mine)) { take(); window.Sfx && Sfx.quill(); preview = null; paintAll(); return; }
    const cost = priceOf(preview);
    if (purse(r) < cost) return;
    if (confirmFor !== preview) { // two taps to buy, so a stray tap never spends XP
      confirmFor = preview; window.Sfx && Sfx.quill(); paintAction();
      confirmTimer = setTimeout(() => { confirmFor = null; paintAction(); }, 3500); return;
    }
    confirmFor = null;
    saveKit((k, rr) => { rr.spent = (rr.spent || 0) + cost; rr.owned = [...new Set([...(rr.owned || []), preview])]; k[slotOf(preview)] = valueOf(preview);
      if (slotOf(preview) === "stance") k.stanceVi = cardVi[k.stance] || 0; });
    window.Sfx && Sfx.coin && Sfx.coin();
    preview = null; paintAll();
  }
  function pick(itemId) {
    // free looks (build, hair, facial hair, "none") are put on at once; anything else is tried on first
    if (isFree(itemId) && slotOf(itemId) !== "stance" && slotOf(itemId) !== "sword" && slotOf(itemId) !== "outfit") {
      saveKit((k) => { k[slotOf(itemId)] = valueOf(itemId); }); preview = null; window.Sfx && Sfx.quill(); paintStage(); paintAction(); renderGrid(); return;
    }
    preview = itemOfKit(slotOf(itemId), kitOf()) === itemId && preview === itemId ? null : itemId;
    if (itemOfKit(slotOf(itemId), kitOf()) === itemId) preview = null;
    if (confirmFor !== preview) confirmFor = null;
    window.Sfx && Sfx.quill();
    paintStage(); paintAction();
    if (tab === "weapons") { const sc = $("#arm-scroll"), y = sc.scrollTop; renderGrid(); sc.scrollTop = y; } // the colour rows follow the weapon tried
    else markCards();
  }

  function stateOf(itemId, mine, k) {
    if (itemOfKit(slotOf(itemId), k) === itemId) return { cls: "worn", tag: "Worn" };
    if (has(itemId, mine)) return { cls: "owned", tag: priceOf(itemId) ? "Owned" : "Free" };
    return { cls: "", tag: priceOf(itemId) + " XP" };
  }
  function markCards() {
    const mine = owned(), k = kitOf();
    document.querySelectorAll("#arm-grid [data-item]").forEach((el) => {
      const id = el.dataset.item, st = stateOf(id, mine, k);
      el.classList.toggle("worn", st.cls === "worn"); el.classList.toggle("owned", st.cls === "owned");
      el.classList.toggle("sel", id === preview);
      const tag = el.querySelector(".arm-tag"); if (tag) tag.textContent = st.tag;
    });
    document.querySelectorAll("#arm-grid .arm-sword").forEach((card) => {
      const sel = card.querySelector(".fin.sel") || card.querySelector(".fin.worn") || card.querySelector(".fin");
      const name = card.querySelector(".arm-fin-name"); if (name && sel) { const st = stateOf(sel.dataset.item, mine, k); name.textContent = sel.title + " · " + st.tag; }
      card.classList.toggle("sel", !!card.querySelector(".fin.sel"));
      card.classList.toggle("worn", !!card.querySelector(".fin.worn"));
    });
  }

  // 3D card pictures (one shared off-screen figure), cached per item and the rest of the kit
  function picture(kit, opts = {}) {
    const key = JSON.stringify(kit) + "|" + (opts.focus || "") + "|" + (opts.pose ? "p" : "");
    if (thumbCache.has(key)) return thumbCache.get(key);
    if (!thumbFig) thumbFig = Fencer3D.makeFigure(document.createElement("div"), "#a3261d", { preserve: true, size: [220, 260] });
    const p = opts.pose || stancePose(kit.stance, kit.stanceVi);
    thumbFig.setFocus(opts.focus || null);
    dress(thumbFig, kit, p);
    thumbFig.setView(opts.focus === "head" ? 40 : p.view != null ? p.view : 25);
    thumbFig.render();
    const src = thumbFig.canvas.toDataURL("image/png");
    thumbFig.setFocus(null);
    if (thumbCache.size > 400) thumbCache.clear();
    thumbCache.set(key, src); return src;
  }
  const kitWith = (slot, v) => { const k = kitOf(); k[slot] = v; return k; };
  function card(itemId, name, note, img) {
    const b = document.createElement("button"); b.className = "arm-item"; b.dataset.item = itemId;
    b.innerHTML = `${img ? `<img alt="" src="${img}">` : ""}<span class="arm-name">${esc(name)}</span>` +
      (note ? `<small>${esc(note)}</small>` : "") + `<span class="arm-tag"></span>`;
    b.addEventListener("click", () => pick(itemId));
    return b;
  }
  const canvasPic = (draw, w = 240, h = 64) => { const cv = document.createElement("canvas"); cv.width = w; cv.height = h; draw(cv); return cv.toDataURL(); };
  function heading(txt, color) { const h = document.createElement("h4"); h.textContent = txt; if (color) h.style.color = color; return h; }
  // a row of colour swatches; key = where the choice is kept in kit.colors
  // the weapon's own finishes (steel, silver, black, bronze, gold, wood — or its own list) as colour circles at the top;
  // tapping one tries that finish on, exactly like the circles on the weapon's card (finishes are bought, not free)
  function finishRow(W) {
    const row = document.createElement("div"); row.className = "arm-colors";
    row.innerHTML = `<span class="arm-colors-l">${esc((W.finsAll ? "Colour: " : "Hilt: ") + W.name)}</span>`;
    const sw = document.createElement("div"); sw.className = "arm-swatches";
    const k = kitOf(), mine = owned();
    const shown = preview && preview.startsWith("sw:" + W.id + ":") ? preview : k.sword.split(":")[0] === W.id ? "sw:" + k.sword : null;
    for (const fz of W.fins || FINISH) {
      const id = `sw:${W.id}:${fz.id}`, b = document.createElement("button");
      b.className = "csw fin-" + fz.id + (id === shown ? " on" : "") + (has(id, mine) ? " owned" : "");
      b.style.background = fz.id === "wood" ? "" : fz.hilt;
      b.title = fz.id === "wood" ? "Wood (" + SWORD_CLASSES.find((c) => c.id === W.cls).wood + ")" : fz.label + (W.fins ? "" : " hilt");
      b.setAttribute("aria-label", W.name + ", " + b.title);
      b.addEventListener("click", () => pick(id));
      sw.appendChild(b);
    }
    row.appendChild(sw); return row;
  }
  function colorRow(label, key, palette, current) {
    const row = document.createElement("div"); row.className = "arm-colors";
    row.innerHTML = `<span class="arm-colors-l">${esc(label)}</span>`;
    const sw = document.createElement("div"); sw.className = "arm-swatches";
    const mk = (hex, name) => { const b = document.createElement("button"); b.className = "csw" + (hex === current ? " on" : "") + (hex ? "" : " orig");
      if (hex) b.style.background = hex; b.title = name; b.setAttribute("aria-label", label + ": " + name);
      b.addEventListener("click", () => { saveKit((k) => { if (hex) k.colors[key] = hex; else delete k.colors[key]; }); window.Sfx && Sfx.quill(); paintStage(); renderGrid(); });
      sw.appendChild(b); };
    if (key !== "skin" && key !== "hair" && key !== "beard") mk(null, "Original");
    for (const [hex, name] of PALETTES[palette]) mk(hex, name);
    row.appendChild(sw); return row;
  }

  function renderGrid() {
    const grid = $("#arm-grid"); grid.innerHTML = "";
    const k = kitOf(), C = k.colors, hint = $("#arm-hint");
    const add = (el) => grid.appendChild(el);
    if (tab === "fencer") {
      hint.textContent = "Your fencer's looks are free. Glasses and patches cost XP.";
      add(heading("Build"));
      for (const o of BODIES) add(card("body:" + o.id, o.name, o.note, picture(kitWith("body", o.id), { pose: stancePose("at_ease") })));
      add(colorRow("Skin", "skin", "skin", C.skin || SKIN0));
      add(heading("Hair"));
      add(colorRow("Hair colour", "hair", "hair", C.hair || "#3b2a1d"));
      for (const o of HAIRS) add(card("hair:" + o.id, o.name, "", picture(Object.assign(kitWith("hair", o.id), { hat: "none" }), { focus: "head", pose: stancePose("at_ease") })));
      add(heading("Facial hair"));
      add(colorRow("Beard colour", "beard", "hair", C.beard || C.hair || "#3b2a1d"));
      for (const o of BEARDS) add(card("beard:" + o.id, o.name, "", picture(Object.assign(kitWith("beard", o.id), { hat: "none" }), { focus: "head", pose: stancePose("at_ease") })));
      add(heading("Eyewear"));
      for (const o of EYES) add(card("eyes:" + o.id, o.name, o.note, picture(Object.assign(kitWith("eyes", o.id), { hat: "none" }), { focus: "head", pose: stancePose("at_ease") })));
    } else if (tab === "weapons") {
      hint.textContent = "Every weapon comes in five hilts and in wood. Tap a finish to try it.";
      // colours for the weapon in hand (or being tried): the grip on its own, and the hilt metal
      const wm = (preview && slotOf(preview) === "sword" ? valueOf(preview) : k.sword).split(":")[0], W = swordById[wm];
      if (W && !W.spec.bazooka) {
        add(colorRow("Grip colour: " + W.name, "swgrip:" + wm, "leather", C["swgrip:" + wm]));
        if (!W.single) add(finishRow(W));
      }
      for (const c of SWORD_CLASSES) {
        add(heading(c.label));
        for (const m of SWORDS.filter((s) => s.cls === c.id)) add(m.single ? card("sw:" + m.id, m.name, m.note, canvasPic((cv) => drawSword(cv, swordSpec(m.id)))) : swordCard(m));
      }
    } else if (tab === "daggers") {
      hint.textContent = "Worn sheathed on the belt, at the left hip.";
      add(card("dg:none", "No Dagger", "", null));
      for (const o of DAGGERS) add(card("dg:" + o.id, o.name, o.note, canvasPic((cv) => drawDagger(cv, o.spec), 240, 64)));
    } else if (tab === "bucklers") {
      hint.textContent = "Held in the fist for sword-and-buckler guards; otherwise hung at the right hip.";
      add(card("bk:none", "No Buckler", "", null));
      for (const o of BUCKLERS) add(card("bk:" + o.id, o.name, o.note, canvasPic((cv) => drawBuckler(cv, o.spec), 160, 120)));
    } else if (tab === "garb") {
      hint.textContent = "Garb for your fencer. Quiz fencers keep their masters' dress.";
      for (const o of OUTFITS) add(card("out:" + o.id, o.name, o.note, picture(kitWith("outfit", o.id), { pose: stancePose("at_ease") })));
    } else if (tab === "armour") {
      hint.textContent = "Armour goes over your garb.";
      const A = ARMOURS.find((a) => a.id === k.armour);
      if (A && A.zones) add(colorRow("Colour: " + A.name, "arm:" + A.id, A.paint === "cloth" ? "cloth" : A.paint === "lacquer" ? "cloth" : "metal", C["arm:" + A.id]));
      for (const o of ARMOURS) add(card("arm:" + o.id, o.name, o.note, picture(kitWith("armour", o.id), { pose: stancePose("at_ease") })));
    } else if (tab === "head") {
      hint.textContent = "Hats, headdresses and helms.";
      const H = HATS.find((h) => h.id === k.hat);
      if (H && H.paint) add(colorRow("Colour: " + H.name, "hat:" + H.id, H.paint, C["hat:" + H.id]));
      for (const [g, label] of HAT_GROUPS) {
        add(heading(label));
        for (const o of HATS.filter((h) => h.group === g)) add(card("hat:" + o.id, o.name, o.note, picture(kitWith("hat", o.id), { focus: "head", pose: stancePose("at_ease") })));
      }
    } else if (tab === "belts") {
      hint.textContent = "Belts and sashes.";
      const Bt = BELTS.find((b) => b.id === k.belt);
      if (Bt && Bt.look) add(colorRow("Colour: " + Bt.name, "belt:" + Bt.id, "leather", C["belt:" + Bt.id]));
      for (const o of BELTS) add(card("belt:" + o.id, o.name, o.note, picture(kitWith("belt", o.id), { focus: "waist", pose: stancePose("at_ease") })));
    } else if (tab === "guards") {
      hint.textContent = "Guards your fencer can stand in. Every guard stays in the quiz either way.";
      add(heading("Rest"));
      for (const g of window.GUARDS.filter((x) => x.armoury)) add(guardCard(g));
      for (const [tk, t] of Object.entries(T)) {
        const list = G.filter((g) => g.tradition === tk); if (!list.length) continue;
        add(heading(t.label, t.color));
        for (const g of list) add(guardCard(g));
      }
    }
    markCards();
  }
  // a guard's card; with several variants, a small arrow at the top steps through them
  function guardCard(g) {
    const n = variantsOf(g), k0 = kitOf();
    if (cardVi[g.id] == null) cardVi[g.id] = k0.stance === g.id ? (k0.stanceVi || 0) % n : 0;
    const kitFor = () => Object.assign(kitWith("stance", g.id), { stanceVi: cardVi[g.id] }, g.id === "bazooka_ready" ? { sword: "bazooka" } : {});
    const c = card("st:" + g.id, g.name, g.note || g.modern || "", picture(kitFor()));
    if (n > 1) {
      const b = document.createElement("button"); b.className = "arm-var"; b.setAttribute("aria-label", "Next version of " + g.name + " (variants and sides)");
      const paint = () => { const c = versionsOf(g)[cardVi[g.id]]; b.innerHTML = `<span>${c.side === "left" ? "L " : ""}${cardVi[g.id] + 1}/${n}</span>›`; };
      paint();
      b.addEventListener("click", (e) => {
        e.stopPropagation(); cardVi[g.id] = (cardVi[g.id] + 1) % n; paint(); window.Sfx && Sfx.card();
        c.querySelector("img").src = picture(kitFor());
        if (kitOf().stance === g.id) saveKit((k) => { k.stanceVi = cardVi[g.id]; }); // the guard you stand in follows the card
        if (preview === "st:" + g.id || kitOf().stance === g.id) paintStage();
      });
      c.appendChild(b);
    }
    return c;
  }
  function swordCard(m) {
    const wrap = document.createElement("div"); wrap.className = "arm-sword";
    const cv = document.createElement("canvas"); cv.width = 240; cv.height = 64;
    const shownFin = () => { const sel = wrap.querySelector(".fin.sel") || wrap.querySelector(".fin.worn"); return sel ? sel.dataset.fin : m.fins ? m.fins[0].id : "steel"; };
    wrap.innerHTML = `<span class="arm-name">${esc(m.name)}</span><small>${esc(m.note)}</small>`;
    wrap.prepend(cv);
    const row = document.createElement("div"); row.className = "fins";
    for (const f of m.fins || FINISH) {
      const id = `sw:${m.id}:${f.id}`, b = document.createElement("button");
      b.className = "fin fin-" + f.id; b.dataset.item = id; b.dataset.fin = f.id; b.style.setProperty("--fin", f.hilt);
      b.title = m.fins ? f.label + (m.finsAll ? "" : " blade") : f.id === "wood" ? "Wood (" + SWORD_CLASSES.find((c) => c.id === m.cls).wood + ")" : f.label + " hilt";
      b.setAttribute("aria-label", m.name + ", " + b.title);
      b.addEventListener("click", (e) => { e.stopPropagation(); pick(id); drawSword(cv, swordSpec(m.id, f.id)); });
      row.appendChild(b);
    }
    const nm = document.createElement("span"); nm.className = "arm-fin-name";
    wrap.append(row, nm);
    wrap.addEventListener("click", () => pick(`sw:${m.id}:${shownFin()}`));
    const k = kitOf(), worn = k.sword.split(":")[0] === m.id ? k.sword.split(":")[1] : null;
    const pv = preview && preview.startsWith("sw:" + m.id + ":") ? preview.split(":")[2] : null;
    drawSword(cv, swordSpec(m.id, pv || worn || (m.fins ? m.fins[0].id : "steel")));
    return wrap;
  }
  function paintAll() { paintStage(); paintAction(); renderGrid(); paintTabs(); }
  function render() { preview = null; confirmFor = null; paintAll(); }

  window.Armoury = { init, render, swordSpec, lookFor, stancePose, kitOf, SWORDS, OUTFITS, HATS, ARMOURS, BELTS, DAGGERS, BUCKLERS, HAIRS, BEARDS, EYES, FINISH, PRICE,
    setTab: (t) => { tab = t; } };
})();
