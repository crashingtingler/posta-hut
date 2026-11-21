(function () {
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  // guards switched off in the stance editor ("Use this guard in the game") are left out entirely
  const G = window.GUARDS.filter((g) => !g.unused && !g.armoury), T = window.TRADITIONS; // (Armoury stances are not guards to quiz on)
  const byId = Object.fromEntries(G.map((g) => [g.id, g]));
  // Same guard, or listed as equivalent (e.g. Langort = Posta Longa): either answer is right.
  const sameGuard = (a, b) => a === b || (window.EQUIVALENT || []).some((grp) => grp.includes(a) && grp.includes(b));
  // guards of different masters that share a hand position (window.APART) are never shown in the same question
  const apart = (a, b) => a !== b && (window.APART || []).some((grp) => grp.includes(a) && grp.includes(b)) &&
    (ALL[a] || {}).master !== (ALL[b] || {}).master;
  const ALL = Object.fromEntries(window.GUARDS.map((g) => [g.id, g])); // includes guards switched off

  // Storage: localStorage for the prototype; swap for Capacitor Preferences when packaging.
  const store = {
    get(k, def) { try { const v = localStorage.getItem("so." + k); return v == null ? def : JSON.parse(v); } catch (e) { return def; } },
    set(k, v) { try { localStorage.setItem("so." + k, JSON.stringify(v)); } catch (e) { /* private mode */ } },
  };

  const TIERS = { novice: { time: 8, label: "Novice" }, scholar: { time: 5, label: "Scholar" }, master: { time: 2, label: "Master" } };
  const RANKS = [[0, "Scholar"], [1500, "Free Scholar"], [5000, "Provost"], [15000, "Master of Defence"]];
  const BOUT_LEN = 10, REVEAL_MS = 400;
  // Scoreboard names: up to 12 characters (letters in any alphabet, digits, space . ' - _).
  const NAME_MAX = 12;
  // Basic local filter. Substrings are caught anywhere; short/ambiguous words only as whole words
  // (so "Cassandra", "Dickens" or "Hancock" are fine). An online board must re-check server-side.
  const BLOCK_ANY = ["fuck", "shit", "cunt", "nigg", "bitch", "whore", "slut", "nazi", "hitler", "kike", "wank",
                     "twat", "pussy", "retard", "tranny", "faggot", "jizz", "dildo", "rapist"];
  const BLOCK_WORD = ["fag", "cum", "dick", "cock", "rape", "spic", "chink", "porn", "penis", "vagina", "sex", "ass",
                      "tit", "tits", "hoe", "kkk", "fuk", "fck", "wtf", "xxx", "anal", "anus", "nig", "coon", "gook"];
  function nameProblem(name) {
    if (!name) return "Sign a name, if you please.";
    if ([...name].length > NAME_MAX) return `No more than ${NAME_MAX} characters.`;
    if (!/^[\p{L}\p{M}\p{N} .'\-_]+$/u.test(name)) return "Letters, numbers and spaces only.";
    const leet = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
      .replace(/[0@4]/g, (c) => ({ 0: "o", "@": "a", 4: "a" }[c])).replace(/[1!|]/g, "i").replace(/3/g, "e")
      .replace(/5|\$/g, "s").replace(/7/g, "t");
    const squashed = leet(name).replace(/[^a-z]/g, "");
    const words = leet(name).split(/[^a-z]+/).filter(Boolean);
    if (BLOCK_ANY.some((w) => squashed.includes(w)) || words.some((w) => BLOCK_WORD.includes(w)) || BLOCK_WORD.includes(squashed))
      return "The Hall will not record that name.";
    return "";
  }

  const settings = Object.assign(
    { method: "choice", tier: "novice", view: "drawn", sound: true, reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches },
    store.get("settings", {}));
  const saveSettings = () => store.set("settings", settings);
  settings.method = "choice"; // the typed (Scribe) way of answering was dropped; older saved settings may still say "scribe"
  const M = window.MASTERS, allMasterIds = M.map((m) => m.id);
  settings.masters = (Array.isArray(settings.masters) ? settings.masters : []).filter((id) => allMasterIds.includes(id));
  if (!settings.masters.length) settings.masters = allMasterIds.slice();
  const allMastersOn = (list) => allMasterIds.every((id) => list.includes(id));

  const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z]/g, "");
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const rankFor = (xp) => { let r = RANKS[0]; for (const x of RANKS) if (xp >= x[0]) r = x; return r; };
  const accent = (g) => T[g.tradition].color;
  // Costume for a fencer in the game. With "Mixed outfits" (Settings, "unfairly hard") any fencer may wear either tradition's
  // clothes and sash colour, so a German guard can't be told from an Italian one by dress. Extra hard.
  function costumeFor(g) {
    const keys = Object.keys(T), t = settings.mixLooks ? keys[Math.floor(Math.random() * keys.length)] : g.tradition;
    const look = Looks.randomLook(t);
    // with Mixed outfits, German-style fencers sometimes wear the Italian chaperone (in place of a cap)
    if (settings.mixLooks && look.style === "meyer" && Math.random() < 0.3) {
      Object.assign(look, { chaperone: true, cap: false, chapColor: ["#7e2620", "#2b2522", "#34466e", "#3f5a37", "#6b3550"][Math.floor(Math.random() * 5)] });
    }
    return { look, accent: T[t].color };
  }

  // ---------- screens ----------
  let settingsFrom = "title";
  function show(id) {
    // Settings' Back goes to where Settings was opened from; coming back from the name screen (Change name) doesn't
    // count, or Back would loop Settings -> name -> Settings
    if (id === "settings") { const cur = document.querySelector(".screen.active"); if (cur && cur.id !== "settings" && cur.id !== "name-screen") settingsFrom = cur.id; }
    $("#vzoom").classList.add("hidden");
    // Page turn: deeper screens turn forward (from the right), going back towards the menu turns back.
    const prev = document.querySelector(".screen.active"), depth = { title: 0, "name-screen": 0, play: 2, result: 3 };
    const dOf = (s) => (s in depth ? depth[s] : 1);
    $$(".screen").forEach((s) => s.classList.toggle("active", s.id === id));
    const next = document.getElementById(id);
    if (next && prev && prev !== next && !settings.reducedMotion) {
      const cls = dOf(id) >= dOf(prev.id) ? "turn-fwd" : "turn-back";
      next.classList.remove("turn-fwd", "turn-back"); void next.offsetWidth; next.classList.add(cls);
      next.addEventListener("animationend", function done(e) { if (e.target === next) { next.classList.remove(cls); next.removeEventListener("animationend", done); } });
    }
    if (id === "title") renderTitle();
    if (id === "hall") renderHall();
    if (id === "salle") renderSalle();
    if (id === "support") { renderSupport(); Sfx.preloadCoin && Sfx.preloadCoin(); }
    if (id === "settings") { $("#settings-name").textContent = me() || "—"; paintOnlineRow(); }
    if (id === "setup") renderSetup();
    if (id === "armoury") Armoury.render();
  }
  document.addEventListener("click", (e) => {
    const go = e.target.closest("[data-go]"); if (go) { Sfx.quill(); show(go.dataset.go); }
    const su = e.target.closest("[data-setup]"); if (su) { setupMode = su.dataset.setup; Sfx.quill(); show("setup"); }
    const st = e.target.closest("[data-start]"); if (st) startRun(st.dataset.start);
  });

  function bindToggle(el, get, set) {
    const btns = Array.from(el.querySelectorAll("button"));
    const paint = () => btns.forEach((b) => b.classList.toggle("on", b.dataset.v === get()));
    btns.forEach((b) => b.addEventListener("click", () => { Sfx.quill(); set(b.dataset.v); paint(); }));
    paint();
  }
  $$("#setup .toggle").forEach((el) => bindToggle(el, () => settings[el.dataset.setting], (v) => { settings[el.dataset.setting] = v; saveSettings(); renderSetup(); }));

  // Setup screen (after Bout / Survival): difficulty and masters. "Again" on the results skips it.
  let setupMode = "bout";
  const TIER_NOTES = {
    novice: "8 seconds a guard · one wrong answer from another tradition · the plate's own viewpoint",
    scholar: "5 seconds a guard · wrong answers from the same tradition · three camera angles",
    master: "2 seconds a guard · look-alike guards as wrong answers · any camera angle",
  };
  function renderSetup() {
    $("#setup-title").textContent = setupMode === "bout" ? "Bout" : "Survival";
    $("#setup-sub").textContent = setupMode === "bout" ? "10 guards, speed and accuracy" : "3 misses and you're out · the clock shortens every 5 guards";
    $("#setup-begin").dataset.start = setupMode;
    $$("#setup .toggle button").forEach((b) => b.classList.toggle("on", b.dataset.v === settings.tier));
    $("#tier-note").textContent = (TIER_NOTES[settings.tier] || "").replace(/^\d+ seconds a guard/, settings.untimed ? "No timer" : "$&");
    $("#opt-untimed").checked = !!settings.untimed;
    renderMasters();
    renderNameModes();
    $$("#quiz-modes button").forEach((b) => b.classList.toggle("on", b.dataset.v === (settings.quiz || "name")));
  }
  $$("#quiz-modes button").forEach((b) => b.addEventListener("click", () => { settings.quiz = b.dataset.v; Sfx.quill(); saveSettings(); renderSetup(); }));
  // No timer: take as long as you like; the run earns 30% of the XP
  $("#opt-untimed").addEventListener("change", (e) => { settings.untimed = e.target.checked; Sfx.quill(); saveSettings(); renderSetup(); });
  const UNTIMED_XP = 0.3;

  // Guard names on the answer buttons: historical, modern (English / HEMA), or both. At least one stays on.
  // After a hit (and on the "Not quite" sheet) both names always show.
  const nameModes = () => (settings.names = Object.assign({ hist: true, modern: false }, settings.names || {}));
  function tileLabel(o) {
    const n = nameModes();
    if (!o.modern || (n.hist && !n.modern)) return o.name;
    if (!n.hist) return o.modern;
    return `${o.name}<small class="modern">${o.modern}</small>`;
  }
  function renderNameModes() {
    const n = nameModes();
    $$("#name-modes button").forEach((b) => { const on = !!n[b.dataset.v]; b.classList.toggle("on", on); b.setAttribute("aria-pressed", String(on)); });
    $("#names-note").textContent = n.hist && n.modern ? "Both names on each button" : n.modern ? "English / HEMA names on the buttons" : "The masters’ own names on the buttons";
  }
  $$("#name-modes button").forEach((b) => b.addEventListener("click", () => {
    const n = nameModes(), k = b.dataset.v, other = k === "hist" ? "modern" : "hist";
    if (n[k] && !n[other]) return; // keep at least one
    n[k] = !n[k]; Sfx.quill(); saveSettings(); renderNameModes();
  }));
  const optSound = $("#opt-sound"), optMotion = $("#opt-motion");
  optSound.checked = settings.sound; optMotion.checked = settings.reducedMotion; Sfx.enabled = settings.sound;
  optSound.onchange = () => { settings.sound = Sfx.enabled = optSound.checked; saveSettings(); };
  optMotion.onchange = () => { settings.reducedMotion = optMotion.checked; saveSettings(); };
  // "Only play with plates" (Settings) = the manuscript view: questions use the original plates
  // "Mixed outfits" (extra hard): costumes no longer reveal the tradition
  const optMix = $("#opt-mixlooks");
  optMix.checked = !!settings.mixLooks;
  optMix.onchange = () => { settings.mixLooks = optMix.checked; saveSettings(); };
  const optPlates = $("#opt-plates");
  optPlates.checked = settings.view === "manuscript";
  optPlates.onchange = () => { settings.view = optPlates.checked ? "manuscript" : "drawn"; saveSettings(); renderMasters(); };

  // Master picker: at least one must stay selected; the Hall only counts runs with all of them.
  function renderMasters() {
    const box = $("#masters");
    if (!box.childElementCount) {
      for (const m of M) {
        const b = document.createElement("button");
        // medallion: Meyer from his own woodcut, Fiore's crowned master (Getty), Liechtenauer a wax seal (no likeness survives); I.33 the priest from fol. 17r
        const pic = { liechtenauer: "assets/ui/master_liechtenauer.png", fiore: "assets/ui/master_fiore.jpg", meyer: "assets/ui/master_meyer.jpg", i33: "assets/ui/master_i33.jpg", fabris: "assets/ui/master_fabris.jpg", hutton: "assets/ui/master_hutton.jpg", latouche: "assets/ui/master_latouche.jpg" }[m.id];
        b.dataset.id = m.id; b.className = "master-medal";
        b.innerHTML = (pic ? `<img src="${pic}" alt="">` : "") + `<span>${m.name}</span>`; // names are fixed data
        b.setAttribute("aria-pressed", "false");
        b.addEventListener("click", () => {
          const on = settings.masters.includes(m.id);
          if (on && settings.masters.length === 1) return; // keep at least one
          settings.masters = on ? settings.masters.filter((x) => x !== m.id) : settings.masters.concat(m.id);
          Sfx.quill(); saveSettings(); renderMasters();
        });
        box.appendChild(b);
      }
    }
    for (const b of box.children) {
      const on = settings.masters.includes(b.dataset.id);
      b.classList.toggle("on", on); b.setAttribute("aria-pressed", String(on));
      const m = M.find((x) => x.id === b.dataset.id);
      b.style.borderColor = T[m.tradition].color;
    }
    const all = allMastersOn(settings.masters), note = $("#masters-note");
    const plates = G.filter((g) => settings.masters.includes(g.master) && hasPlate(g)).length;
    const startable = settings.view !== "manuscript" || plates >= 2;
    // XP no longer depends on which masters are ticked (only "No timer" lowers it); streaks always count.
    const n = poolFor(settings.masters, settings.view).length;
    if (settings.view === "manuscript" && plates < 2) {
      note.textContent = "Not enough plates for these masters — pick another master, or turn off “Only play with plates”";
      note.classList.add("practice");
    } else {
      const xpNote = settings.untimed ? `${Math.round(UNTIMED_XP * 100)}% XP (no timer)` : "full XP";
      note.textContent = (all ? "All masters · " : "") + `${n} guards · ${xpNote}`;
      note.classList.remove("practice");
    }
    $$("[data-start]").forEach((b) => b.classList.toggle("disabled", !startable));
  }
  // A run is ranked only with every master selected, and (manuscript view) every guard having its plate.
  // XP share: always full, whichever masters are ticked (only "No timer" lowers XP, in the results).
  // (Ranked runs and best streaks still need every master.)
  const poolFor = (masters, view) => G.filter((g) => masters.includes(g.master) && (view !== "manuscript" || hasPlate(g)));
  const xpShareFor = () => 1;
  const isRanked = () => allMastersOn(settings.masters) &&
    true; // manuscript runs use only guards with plates and have their own boards, so every-master runs count

  function renderTitle() {
    // (difficulty and masters live on the setup screen now)
    const xp = myRecord().xp, r = rankFor(xp), i = RANKS.indexOf(r), next = RANKS[i + 1];
    $("#player-name").textContent = me();
    $("#rank-name").textContent = r[1];
    $("#rank-xp").textContent = xp.toLocaleString() + " XP" + (next ? " / " + next[0].toLocaleString() : "");
    $("#xp-fill").style.width = (next ? ((xp - r[0]) / (next[0] - r[0])) * 100 : 100) + "%";
    $("#best-streak").textContent = myRecord().streak;
  }

  // ---------- play ----------
  const stageFig = Fencer3D.makeFigure($("#stage-svg"), "#a3261d");
  const cmpPicked = Fencer3D.makeFigure($("#cmp-picked .c3d"), "#a3261d");
  const cmpRight = Fencer3D.makeFigure($("#cmp-right .c3d"), "#a3261d");
  // "Not quite": drag either fencer to turn both together, so the two guards can be compared from any angle
  const cmpYaw = new Map();
  { let dragX = null;
    for (const el of [$("#cmp-picked .c3d"), $("#cmp-right .c3d")]) {
      el.addEventListener("pointerdown", (e) => { dragX = e.clientX; el.setPointerCapture(e.pointerId); e.preventDefault(); });
      el.addEventListener("pointermove", (e) => { if (dragX == null) return; const dx = (e.clientX - dragX) * 0.6; dragX = e.clientX;
        for (const [rig, y] of cmpYaw) { cmpYaw.set(rig, y + dx); rig.setView(y + dx); rig.render(); } });
      const up = () => { dragX = null; }; el.addEventListener("pointerup", up); el.addEventListener("pointercancel", up);
    } }
  let run = null, timerRaf = 0;

  function startRun(mode) {
    Sfx.quill();
    run = { mode, method: settings.method, tier: settings.tier, q: 0, score: 0, combo: 0, bestCombo: 0,
            correct: 0, answered: 0, misses: 0, missed: [], fastest: null, totalTime: 0, last: null,
            masters: settings.masters.slice(), ranked: isRanked(), view: settings.view, xpShare: xpShareFor(settings.masters, settings.view),
            quiz: settings.quiz === "find" ? "find" : "name", untimed: !!settings.untimed };
    $(".margin-timer").classList.toggle("hidden", run.untimed); // no ink stroke without a clock
    run.pool = G.filter((g) => run.masters.includes(g.master) && (run.view !== "manuscript" || hasPlate(g)));
    if (run.pool.length < 2) { run = null; return; }
    $("#stage-svg").classList.toggle("hidden", run.view === "manuscript" || run.quiz === "find");
    $("#stage-plate").classList.toggle("hidden", run.view !== "manuscript" || run.quiz === "find");
    $("#stage-credit").textContent = "";
    $("#answers").classList.remove("hidden");
    show("play");
    stageFig.set(Fencer3D.REST);
    nextQuestion();
  }

  function pickGuard() {
    const deck = store.get("review", {});
    const pool = run.pool.length > 1 ? run.pool.filter((g) => g.id !== run.last) : run.pool;
    const w = pool.map((g) => (deck[g.id] ? 3 : 1));
    let r = Math.random() * w.reduce((a, b) => a + b, 0);
    for (let i = 0; i < pool.length; i++) { r -= w[i]; if (r <= 0) return pool[i]; }
    return pool[pool.length - 1];
  }

  function distractors(g) {
    // Wrong options come from the selected masters; only top up from the rest if the pool is too small.
    // Equivalent guards (window.EQUIVALENT) are never offered alongside the answer: that would be two right tiles.
    // Guards that share a name (Fabris's Prima/Quarta and the I.33 Prima/Quarta) never appear together either.
    const others = run.pool.filter((x) => !sameGuard(x.id, g.id) && x.name !== g.name && !apart(x.id, g.id));
    let first = [];
    // Novice: two from the same tradition and one from the other (an easier one to rule out)
    if (run.tier === "novice") first = shuffle(others.filter((x) => x.tradition === g.tradition)).slice(0, 2)
      .concat(shuffle(others.filter((x) => x.tradition !== g.tradition)).slice(0, 1));
    else if (run.tier === "scholar") first = others.filter((x) => x.tradition === g.tradition);
    else {
      const twins = window.TWINS.filter((t) => t.includes(g.id)).flat().filter((id) => id !== g.id).map((id) => byId[id]).filter(Boolean);
      first = twins.concat(shuffle(others.filter((x) => x.tradition === g.tradition && !twins.includes(x))));
    }
    const picks = [], ok = (x) => !picks.includes(x) && x.name !== g.name && !apart(x.id, g.id) && !picks.some((p) => p.name === x.name || apart(p.id, x.id));
    for (const x of (run.tier === "master" ? first : shuffle(first))) if (picks.length < 3 && ok(x)) picks.push(x);
    for (const x of shuffle(others)) if (picks.length < 3 && ok(x)) picks.push(x);
    for (const x of shuffle(G.filter((x) => !sameGuard(x.id, g.id)))) if (picks.length < 3 && ok(x)) picks.push(x);
    // Every tier: at least two wrong options share the answer's tradition (a German guard gets 3–4 German options),
    // as far as the selected masters allow.
    const same = shuffle(others.filter((x) => x.tradition === g.tradition && !picks.includes(x)));
    while (picks.filter((x) => x.tradition === g.tradition).length < 2 && same.length) {
      let i = -1; for (let k = picks.length - 1; k >= 0; k--) if (picks[k].tradition !== g.tradition) { i = k; break; }
      if (i < 0) break;
      const nx = same.shift(); if (picks.some((p, k) => k !== i && (p.name === nx.name || apart(p.id, nx.id)))) continue;
      picks[i] = nx;
    }
    return picks;
  }

  // Camera angle: Novice always sees the same three-quarter view; higher tiers vary it (GDD difficulty lever).
  function viewFor() {
    if (run.tier === "novice") return 25;
    if (run.tier === "scholar") return [25, 55, -5][Math.floor(Math.random() * 3)];
    return -20 + Math.random() * 90;
  }

  function timeFor() {
    let t = TIERS[run.tier].time;
    if (run.mode === "survival") t = Math.max(2, t * Math.pow(0.85, Math.floor(run.correct / 5)));
    return t;
  }

  function hud() {
    $("#hud-progress").textContent = run.mode === "bout"
      ? `${Math.min(run.q + 1, BOUT_LEN)} / ${BOUT_LEN}`
      : "♥".repeat(3 - run.misses) + "♡".repeat(run.misses);
    const m = comboMult();
    $("#hud-combo").textContent = run.combo >= 2 ? `combo ${run.combo}${m > 1 ? " ×" + m : ""}` : "";
    $("#hud-score").textContent = run.score.toLocaleString();
  }
  const comboMult = () => (run.combo >= 6 ? 2 : run.combo >= 3 ? 1.5 : 1);

  // ---------- left / right versions ----------
  // A guard's base pose/plate is its right-side version; g.sides.left adds a left version
  // (its own pose/plate/tip if the source draws it differently, otherwise the mirror image).
  const sidesOf = (g) => window.sidesUsedOf(g); // sides switched off in the stance editor are never asked
  const leftOf = (g) => (g.sides && g.sides.left) || {};
  // vi picks one of the guard's pose variants (e.g. Vom Tag at the shoulder or overhead).
  const poseFor = (g, side, vi = 0) => window.guardPose(g, side, vi); // data/guards.js: own left version, else mirrored
  const randomVariant = (g) => Math.floor(Math.random() * (g.poses || [g.pose]).length);
  // a variant can have its own plate (g.variantPlates[vi], right side), e.g. Dente di Zenghiaro Mezano
  const plateFor = (g, side, vi = 0) => {
    const vp = side !== "left" && vi && g.variantPlates && g.variantPlates[vi];
    if (vp) return { src: vp.src, credit: (g.manuscript && g.manuscript.credit) || "" };
    return side === "left" ? leftOf(g).manuscript || null : g.manuscript || null;
  };
  const plateRef = (g, side, vi = 0) => (side !== "left" && vi && g.variantPlates && g.variantPlates[vi] ? g.variantPlates[vi].plate : side === "left" ? leftOf(g).plate : g.plate);
  const tipFor = (g, side) => (side === "left" && leftOf(g).tip) || g.tip;
  const hasPlate = (g) => sidesOf(g).some((s) => plateFor(g, s));
  const sideName = (g, side) => g.name + (sidesOf(g).length > 1 ? ` (${side})` : "");
  // Left versions are seen from the fencer's left, so the camera mirrors around too.
  const yawFor = (side, v) => (side === "left" ? 180 - v : v);

  function nextQuestion() {
    const g = pickGuard();
    run.guard = g; run.last = g.id; run.locked = true;
    const sides = sidesOf(g).filter((s) => run.view !== "manuscript" || plateFor(g, s));
    run.side = sides[Math.floor(Math.random() * sides.length)];
    run.vi = randomVariant(g);
    hud();
    $("#fb-correct").classList.add("hidden");
    $("#fb-wrong").classList.add("hidden");
    stageFig.setAccent(accent(g));
    $("#find-prompt").classList.toggle("hidden", run.quiz !== "find");
    $("#answers").classList.toggle("find", run.quiz === "find");
    if (run.quiz === "find") return findQuestion(g);
    // Answers render immediately so the thumb can get ready; the clock starts after the reveal.
    {
      const opts = shuffle([g].concat(distractors(g)));
      const box = $("#answers"); box.innerHTML = "";
      for (const o of opts) {
        const b = document.createElement("button");
        b.className = "tile"; b.innerHTML = tileLabel(o); b.dataset.id = o.id; // names are fixed data
        b.addEventListener("pointerdown", (e) => { e.preventDefault(); answer(o.id); });
        box.appendChild(b);
      }
    }
    setTimer(1);
    const startClock = () => { run.tMax = timeFor(); run.t0 = performance.now(); run.locked = false; tickTimer(); };
    if (run.view === "manuscript") {
      // The original plate inks in; the clock starts once it is decoded and revealed.
      const img = $("#stage-plate"), thisRun = run;
      img.classList.remove("reveal"); img.style.visibility = "hidden";
      const plate = plateFor(g, run.side, run.vi);
      img.src = plate.src;
      $("#stage-credit").textContent = plate.credit;
      img.decode().catch(() => {}).then(() => {
        if (run !== thisRun || run.guard !== g) return;
        img.style.visibility = ""; if (!settings.reducedMotion) { void img.offsetWidth; img.classList.add("reveal"); }
        setTimeout(() => { if (run === thisRun && run.guard === g) startClock(); }, settings.reducedMotion ? 0 : REVEAL_MS);
      });
    } else {
      { const c = costumeFor(g); run.look = c.look; run.lookAccent = c.accent; stageFig.setAccent(c.accent); }
      stageFig.setLook(run.look);
      // A pose may name the camera angle its source plate is drawn from (pose.view); Novice always uses it.
      const qPose = poseFor(g, run.side, run.vi);
      stageFig.setView(yawFor(run.side, run.tier === "novice" && qPose.view != null ? qPose.view : viewFor()));
      stageFig.animateTo(poseFor(g, run.side, run.vi), settings.reducedMotion ? 0 : REVEAL_MS, startClock);
    }
  }

  // "Find the guard": the stage shows the guard's name; the four buttons show fencers (or plates), one of them right.
  // Each option gets its own random side, variant and costume; difficulty picks the wrong ones as usual.
  let quizFig = null;
  function findQuestion(g) {
    const n = nameModes(), showHist = n.hist || !g.modern, showModern = n.modern && g.modern;
    $("#find-name").textContent = showHist ? g.name : g.modern;
    $("#find-modern").textContent = showHist && showModern ? g.modern : "";
    const box = $("#answers"); box.innerHTML = "";
    if (run.view !== "manuscript" && !quizFig) quizFig = Fencer3D.makeFigure(document.createElement("div"), "#8e3b3b", { preserve: true, size: [300, 340] });
    for (const o of shuffle([g].concat(distractors(g)))) {
      const sides = sidesOf(o).filter((s) => run.view !== "manuscript" || plateFor(o, s));
      const side = sides[Math.floor(Math.random() * sides.length)] || "right", vi = run.view === "manuscript" ? 0 : randomVariant(o);
      let src;
      if (run.view === "manuscript") src = plateFor(o, side, vi).src;
      else {
        const c = costumeFor(o), look = c.look, p = poseFor(o, side, vi);
        quizFig.setAccent(c.accent); quizFig.setLook(look);
        quizFig.setView(yawFor(side, run.tier === "novice" && p.view != null ? p.view : viewFor())); quizFig.set(p);
        src = quizFig.canvas.toDataURL("image/png");
        if (o === g) { run.side = side; run.vi = vi; run.look = look; run.lookAccent = c.accent; } // so "Not quite" shows the same fencer
      }
      if (o === g && run.view === "manuscript") { run.side = side; run.vi = vi; }
      const b = document.createElement("button");
      b.className = "tile pic"; b.dataset.id = o.id; b.setAttribute("aria-label", "A fencer in a guard");
      b.innerHTML = `<img alt="" src="${src}">`;
      b.addEventListener("pointerdown", (e) => { e.preventDefault(); answer(o.id); });
      box.appendChild(b);
    }
    setTimer(1);
    // looking over four fencers takes longer than reading four names: 1.5 s extra
    run.tMax = timeFor() + 1.5; run.t0 = performance.now(); run.locked = false; tickTimer();
  }

  function setTimer(frac) {
    const ink = $("#timer-ink");
    const f = Math.max(0, Math.min(1, frac));
    ink.style.transform = `scaleY(${f})`;
    ink.classList.toggle("low", f < 0.3);
    $(".margin-timer").classList.toggle("low", f < 0.3);
    $("#timer-drop").style.top = (1 - f) * 100 + "%"; // the drop of ink rides the head of the stroke down
  }
  function tickTimer() {
    cancelAnimationFrame(timerRaf);
    if (run.untimed) return; // no timer: the clock never runs out (answers still score faster = more points)
    const step = () => {
      if (run.locked) return;
      const left = run.tMax - (performance.now() - run.t0) / 1000;
      setTimer(left / run.tMax);
      if (left <= 0) answer(null); else timerRaf = requestAnimationFrame(step);
    };
    timerRaf = requestAnimationFrame(step);
  }

  function answer(id) {
    if (!run || run.locked) return;
    run.locked = true;
    $("#find-prompt").classList.add("hidden"); // the feedback takes the stage
    cancelAnimationFrame(timerRaf);
    const g = run.guard, elapsed = (performance.now() - run.t0) / 1000;
    const tLeft = Math.max(0, run.tMax - elapsed);
    run.answered++;
    const deck = store.get("review", {});
    if (sameGuard(id, g.id)) {
      const pts = Math.round(100 + 100 * (tLeft / run.tMax) * comboMult());
      run.score += pts; run.combo++; run.correct++; run.totalTime += elapsed;
      run.bestCombo = Math.max(run.bestCombo, run.combo);
      run.fastest = run.fastest == null ? elapsed : Math.min(run.fastest, elapsed);
      if (deck[g.id]) { deck[g.id].streak++; if (deck[g.id].streak >= 2) delete deck[g.id]; }
      store.set("review", deck);
      Sfx.clash();
      if (navigator.vibrate) navigator.vibrate(12); // a light tap as the seal comes down
      { const st = $(".stage"); st.classList.remove("thump"); void st.offsetWidth; st.classList.add("thump"); }
      markTile(id, "right");
      // Picking the equivalent guard is right; say what this master calls it.
      $("#fb-name").textContent = id === g.id ? sideName(g, run.side) : `${byId[id].name} = ${g.name}`;
      $("#fb-modern").textContent = g.modern ? (id === g.id || !byId[id].modern ? g.modern : `${byId[id].modern} = ${g.modern}`) : ""; // after a hit both names always show
      $("#fb-pts").textContent = "+" + pts;
      $("#fb-name").style.color = accent(g);
      const fb = $("#fb-correct"); fb.classList.remove("hidden"); fb.classList.remove("pop"); void fb.offsetWidth; fb.classList.add("pop");
      run.q++; hud();
      setTimeout(advance, 750);
    } else {
      run.combo = 0; run.misses++;
      if (!run.missed.includes(g.id)) run.missed.push(g.id);
      deck[g.id] = { streak: 0 }; store.set("review", deck);
      Sfx.thud();
      if (navigator.vibrate) navigator.vibrate([70, 40, 110]); // a double buzz on phones that support it
      // ink splashes across the stage, at a random angle each time
      { const sp = $("#splat"); sp.style.setProperty("--r", Math.round(Math.random() * 360) + "deg");
        sp.classList.remove("go"); void sp.getBoundingClientRect(); sp.classList.add("go"); }
      markTile(id, "wrong"); markTile(g.id, "right");
      run.q++; hud();
      setTimeout(() => showWrong(id, g), 280);
    }
  }

  function markTile(id, cls) {
    const b = $$("#answers .tile").find((t) => t.dataset.id === id); if (b) b.classList.add(cls);
  }

  function showWrong(id, g) {
    cmpYaw.clear(); // only the fencers shown on this sheet turn
    const picked = byId[id];
    $("#fbw-title").textContent = id == null ? "Too slow" : "Not quite";
    const pf = $("#cmp-picked"), rf = $("#cmp-right");
    const ms = run.view === "manuscript";
    // Show each guard as the player saw it: the plate in manuscript mode (if it has one), else a drawn fencer.
    const fill = (figEl, rig, guard, side, look, vi = 0) => {
      const img = figEl.querySelector(".cmp-plate"), plate = ms && plateFor(guard, side, vi);
      figEl.querySelector(".c3d").classList.toggle("hidden", !!plate);
      img.classList.toggle("hidden", !plate);
      if (plate) img.src = plate.src;
      else {
        if (look) { rig.setAccent(guard === run.guard && run.lookAccent ? run.lookAccent : accent(guard)); rig.setLook(look); }
        else { const c = costumeFor(guard); rig.setAccent(c.accent); rig.setLook(c.look); }
        const p = poseFor(guard, side, vi);
        const yaw = yawFor(side, p.view != null ? p.view : 25); cmpYaw.set(rig, yaw);
        rig.setView(yaw); rig.set(p);
      }
    };
    // Compare on the same side as the question, if the guard you picked has that side.
    const pickedSide = picked && sidesOf(picked).includes(run.side) && (!ms || plateFor(picked, run.side)) ? run.side : "right";
    pf.classList.toggle("hidden", !picked);
    if (picked) {
      fill(pf, cmpPicked, picked, pickedSide);
      pf.querySelector("figcaption").innerHTML = `<small>You said</small>${picked.name}${picked.modern ? `<em class="modern">${picked.modern}</em>` : ""}`;
    }
    fill(rf, cmpRight, g, run.side, run.look, run.vi);
    rf.querySelector("figcaption").innerHTML = `<small>${picked || id == null ? "It was" : "You wrote “" + esc(String(id).replace("?typed:", "")) + "” — it was"}</small>${sideName(g, run.side)}${g.modern ? `<em class="modern">${g.modern}</em>` : ""}`;
    $("#fbw-tip").textContent = tipFor(g, run.side);
    $("#fbw-cite").textContent = citeLine(g, run.side, run.vi);
    // In drawn mode, also show the original plate the pose was taken from.
    showSourcePlate($("#fbw-plate"), ms ? null : g, run.side, run.vi);
    $("#fb-wrong").classList.remove("hidden");
  }
  function citeLine(g, side = "right", vi = 0) {
    const ref = plateRef(g, side, vi);
    return g.source + (ref ? ", " + ref : side === "left" ? " · left version mirrored from the right" : " · plate reference pending");
  }
  function showSourcePlate(figEl, g, side = "right", vi = 0) {
    const plate = g && plateFor(g, side, vi);
    figEl.classList.toggle("hidden", !plate);
    if (!plate) return;
    figEl.querySelector("img").src = plate.src;
    figEl.querySelector("img").alt = sideName(g, side) + " in the original manuscript";
    figEl.querySelector("figcaption").textContent = "The original plate · " + plate.credit;
  }
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  $("#fbw-next").addEventListener("click", () => { $("#fb-wrong").classList.add("hidden"); advance(); });

  function advance() {
    if (run.mode === "bout" && run.q >= BOUT_LEN) return finish();
    if (run.mode === "survival" && run.misses >= 3) return finish();
    nextQuestion();
  }

  $("#quit").addEventListener("click", () => { if (run) run.locked = true; cancelAnimationFrame(timerRaf); show("title"); });

  // ---------- players + Hall of Masters ----------
  // The app asks for a name at first launch (changeable in Settings). Each name keeps its own XP and best
  // streak on this device; the Hall of Masters ranks them: Celerity = total XP, Fortitude = best streak
  // (most correct answers in a row). Only runs with every master selected count.
  const players = () => store.get("players", {});
  const me = () => store.get("player", "");
  const myRecord = () => Object.assign({ xp: 0, streak: 0 }, players()[me()] || {});
  function saveRecord(rec) { const all = players(); all[me()] = Object.assign({}, rec, { updated: new Date().toISOString() }); store.set("players", all);
    Online.push(me(), all[me()]); } // (sent to the online Hall a moment later, when it's set up)
  function setPlayer(name) {
    const all = players();
    if (!all[name]) {
      // the first name on this device inherits the progress made before names were asked
      const first = !Object.keys(all).length;
      all[name] = { xp: first ? store.get("xp", 0) : 0, streak: first ? store.get("bestStreak", 0) : 0, updated: new Date().toISOString() };
      store.set("players", all);
    }
    store.set("player", name);
    Online.push(name, players()[name]);
  }

  Armoury.init({ myRecord, saveRecord, guards: G, traditions: T });

  function finish() {
    const acc = run.answered ? Math.round((run.correct / run.answered) * 100) : 0;
    $("#res-title").textContent = run.mode === "bout" ? "Bout complete" : `Survival: ${run.correct} guards`;
    $("#res-score").textContent = run.score.toLocaleString();
    $("#res-acc").textContent = acc + "%";
    $("#res-combo").textContent = run.bestCombo;
    $("#res-fast").textContent = run.fastest == null ? "–" : run.fastest.toFixed(2) + "s";

    // XP always counts in full (30% with no timer); best streaks count with any masters.
    const rec = myRecord(), rb = rankFor(rec.xp), share = run.xpShare == null ? 1 : run.xpShare;
    const gained = Math.round(run.score * share * (run.untimed ? UNTIMED_XP : 1));
    rec.xp += gained;
    const newBest = run.bestCombo > rec.streak;
    if (newBest) rec.streak = run.bestCombo;
    saveRecord(rec);
    const ra = rankFor(rec.xp);
    const line = `+${gained.toLocaleString()} XP` + (share < 1 ? ` (${Math.round(share * 100)}% for ${run.masters.length} of ${M.length} masters)` : "") +
      (run.untimed ? ` (${Math.round(UNTIMED_XP * 100)}% with no timer)` : "") +
      (ra !== rb ? ` — promoted to ${ra[1]}!` : "") + (newBest ? ` · new best streak: ${rec.streak}!` : "");
    $("#res-xp").textContent = line;
    $("#res-practice").classList.add("hidden"); // (no practice runs any more: XP is scaled instead)

    const missed = $("#res-missed");
    missed.innerHTML = run.missed.length
      ? `<h3>Added to your review deck</h3><ul>${run.missed.map((id) => `<li>${byId[id].name}</li>`).join("")}</ul>`
      : run.answered ? `<p class="clean">A clean bout — no guards missed.</p>` : "";
    show("result");
  }
  $("#res-again").addEventListener("click", () => startRun(run.mode));

  let hallTab = "celerity";
  bindToggle($("#hall-tab"), () => hallTab, (v) => { hallTab = v; renderHall(); });
  function renderHall() {
    $$("#hall-tab button").forEach((b) => b.classList.toggle("on", b.dataset.v === hallTab));
    const key = hallTab === "celerity" ? "xp" : "streak";
    $("#hall-col").textContent = hallTab === "celerity" ? "XP" : "Best streak";
    $("#hall-note").textContent = hallTab === "celerity" ? "Celerity — total XP earned." : "Fortitude — the most correct answers in a row.";
    // this device's players at once; then, with the online Hall set up, the world's top players replace them
    const all = players();
    drawHall(Object.entries(all).map(([name, r]) => ({ name, rec: r, v: r[key] || 0, patron: r.patron, mine: name === me() }))
      .filter((r) => r.v > 0 || r.mine).sort((a, b) => b.v - a.v || a.name.localeCompare(b.name)).slice(0, 20), null);
    if (!Online.enabled || /demo=/.test(location.hash)) return; // (screenshot demos keep their sample players)
    const asked = hallTab;
    $("#hall-online").textContent = "Fetching the Hall…";
    Online.hall(key).then((list) => {
      if (asked !== hallTab) return; // the tab changed meanwhile: that tab's own call draws
      if (!list) { $("#hall-online").textContent = "Offline: showing the players on this device."; return; }
      const myId = Online.myId(me());
      drawHall(list.map((r) => ({ name: r.name, rec: r, v: r[key] || 0, mine: !!myId && r.id === myId, online: true })), list);
    });
  }
  // one odd record must never blank the Hall: draw a default fencer for it instead
  const safePortrait = (rec) => { try { return Armoury.portrait(rec); } catch (e) { return Armoury.portrait({}); } };
  function drawHall(rows, online) {
    const st = Online.status(me()), out = Online.optedOut(me());
    $("#hall-online").textContent = !Online.enabled ? "" : !online ? "" :
      out ? "The world's best fencers. You've left the online Hall (Settings)." :
      st === "banned" ? "The world's best fencers. You've been removed from the online Hall." :
      st === "name" ? "The world's best fencers. Your name wasn't accepted online: change it in Settings." : "The world's best fencers.";
    $("#hall-body").innerHTML = rows.length
      ? rows.map((r, i) => `<tr class="hall-row ${i === 0 && r.v > 0 ? "gold" : ""} ${r.mine ? "me" : ""}" data-i="${i}"><td>${i + 1}</td>` +
        `<td class="face"><button class="hall-face" aria-label="See ${esc(r.name)}'s fencer"><img alt="" src="${safePortrait(r.rec)}"></button></td>` +
        `<td class="mk">${esc(r.name)}${r.patron ? '<span class="patron" title="Patron of the Salle"></span>' : ""}<small class="hall-rank">${esc(rankFor(r.rec.xp || 0)[1])}</small></td><td>${r.v.toLocaleString()}</td></tr>`).join("")
      : `<tr><td colspan="4" class="empty">No names yet. Fight a bout.</td></tr>`;
    // the whole row opens that player's fencer (the face is still a button, for keyboard and screen readers)
    $$("#hall-body .hall-row").forEach((tr) => { const r = rows[+tr.dataset.i]; tr.addEventListener("click", () => openFencer(r.name, r.online ? r.rec : null)); });
  }

  // ---------- your name (asked at launch, changeable in Settings) ----------
  let nameReturn = "title";
  function askName(returnTo) {
    nameReturn = returnTo || "title";
    $("#player-in").value = me(); $("#player-err").textContent = ""; updateNameCount();
    $("#name-cancel").classList.toggle("hidden", !me());
    show("name-screen"); setTimeout(() => $("#player-in").focus(), 50);
  }
  function updateNameCount() {
    const n = [...$("#player-in").value].length;
    $("#player-count").textContent = `${n} / ${NAME_MAX}`;
    $("#player-count").classList.toggle("over", n > NAME_MAX);
  }
  $("#player-in").addEventListener("input", () => { $("#player-err").textContent = ""; updateNameCount(); });
  $("#name-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = $("#player-in").value.normalize("NFC").replace(/\s+/g, " ").trim();
    const problem = nameProblem(name);
    if (problem) { $("#player-err").textContent = problem; return; }
    setPlayer(name); Sfx.quill(); show(nameReturn);
  });
  $("#name-cancel").addEventListener("click", () => show(nameReturn));
  $("#change-name").addEventListener("click", () => askName("settings"));
  // the online Hall: on by default; unticking deletes this name's online record and stops sending it
  function paintOnlineRow() {
    $("#online-row").classList.toggle("hidden", !Online.enabled || !me());
    $("#opt-online").checked = !Online.optedOut(me());
    $("#online-hint").textContent = "Shows your name, fencer, XP and best streak to everyone. Untick to delete your online record.";
  }
  $("#opt-online").addEventListener("change", async (e) => {
    const box = e.target; Sfx.quill(); box.disabled = true;
    if (box.checked) { Online.join(me(), myRecord()); $("#online-hint").textContent = "You're back in the online Hall."; }
    else { $("#online-hint").textContent = "Deleting your online record…";
      const ok = await Online.leave(me());
      if (!ok) box.checked = true;
      $("#online-hint").textContent = ok ? "Your online record is deleted. Your progress on this device is kept." : "Couldn't reach the Hall. Try again when you're online."; }
    box.disabled = false;
  });
  $("#settings-back").addEventListener("click", () => { Sfx.quill(); show(settingsFrom); }); // back to where Settings was opened

  // ---------- support / tip jar ----------
  let tipBusy = false;
  async function renderSupport(justTipped) {
    $("#tip-test").classList.toggle("hidden", !Tips.testMode);
    $("#tip-err").textContent = "";
    $("#tip-thanks").classList.toggle("hidden", !justTipped);
    $("#patron-note").classList.toggle("hidden", justTipped || !store.get("patron", false));
    const box = $("#tips");
    let products = [];
    try { products = await Tips.getProducts(); } catch (e) { $("#tip-err").textContent = "The tip jar couldn't reach the store. Try again later."; }
    box.innerHTML = "";
    for (const p of products) {
      const b = document.createElement("button");
      b.className = "tip-btn"; b.dataset.id = p.id;
      b.innerHTML = `<span class="t">${esc(p.title)}<small>${esc(p.blurb)}</small></span><span class="p">${esc(p.price)}</span>`;
      b.addEventListener("click", () => buyTip(p.id));
      box.appendChild(b);
    }
  }
  // Tapping the coin tosses it, just for fun (same flip and sound as a tip)
  $(".coin-wrap").addEventListener("click", () => { if (tipBusy) return; const coin = $("#coin");
    Sfx.coin(); coin.classList.remove("flip"); void coin.offsetWidth; coin.classList.add("flip"); });
  // A tip went through (here, or on Stripe and the player just came back): grant the seal and say thanks.
  function thankTipper() {
    store.set("patron", true);
    if (me()) { const rec = myRecord(); rec.patron = true; saveRecord(rec); } // the patron seal shows beside this name in the Hall
    store.set("tips", store.get("tips", 0) + 1);
    // The half Portugalöser is tossed: flip animation + coin sound, then the thanks.
    // The toss always plays, even with Reduced motion on: it is the one moment of thanks, and short.
    Sfx.coin();
    const coin = $("#coin");
    coin.classList.remove("flip"); void coin.offsetWidth; coin.classList.add("flip");
    setTimeout(() => renderSupport(true), 1150);
  }
  async function buyTip(id) {
    if (tipBusy) return;
    tipBusy = true;
    $$("#tips .tip-btn").forEach((b) => (b.disabled = true));
    try {
      await Tips.purchase(id);
      thankTipper();
    } catch (e) {
      $("#tip-err").textContent = e && e.message === "cancelled" ? "" : "The purchase didn't go through. You weren't charged.";
      $$("#tips .tip-btn").forEach((b) => (b.disabled = false));
    } finally {
      tipBusy = false;
    }
  }

  // Back from the Stripe page without paying (the browser may restore this page as it was): free the buttons.
  window.addEventListener("pageshow", (e) => { if (!e.persisted) return; tipBusy = false;
    $$("#tips .tip-btn").forEach((b) => (b.disabled = false)); });

  // ---------- salle ----------
  let salleId = G[0].id;
  function renderSalle() {
    const list = $("#salle-list");
    if (!list.childElementCount) {
      for (const [tk, t] of Object.entries(T)) {
        const h = document.createElement("h4"); h.textContent = t.label; h.style.color = t.color; list.appendChild(h);
        for (const g of G.filter((x) => x.tradition === tk)) {
          const b = document.createElement("button"); b.textContent = g.name; b.dataset.id = g.id;
          b.addEventListener("click", () => { salleId = g.id; Sfx.quill(); renderSalle(); });
          list.appendChild(b);
        }
      }
    }
    const g = byId[salleId];
    salleSide = sidesOf(g)[0]; // the main figure shows the first used side; the strip below shows every side and variant
    $$("#salle-list button").forEach((b) => b.classList.toggle("on", b.dataset.id === salleId));
    // Right / left switch, only for guards that have both versions.
    const sw = $("#salle-sides");
    sw.classList.add("hidden"); // both sides are shown together in the variants strip
    $$("#salle-sides button").forEach((b) => b.classList.toggle("on", b.dataset.v === salleSide));
    salleLook = Looks.randomLook(g.tradition); // one costume for all of this guard's pictures
    $("#salle-name").innerHTML = g.name + (g.modern ? `<small class="salle-modern">${g.modern}</small>` : ""); // fixed data $("#salle-name").style.color = accent(g);
    $("#salle-tip").textContent = tipFor(g, salleSide);
    const vars = g.variants.length ? " · Also written: " + g.variants.join(", ") : "";
    const look = (window.LOOKS[g.tradition] || {}).source;
    $("#salle-cite").textContent = citeLine(g, salleSide) + vars + (look ? " · Fencer drawn " + look : "");
    showSourcePlate($("#salle-plate"), g, salleSide);
    renderVariantThumbs(g);
  }
  let salleSide = "right";
  // Every variant of the selected guard as a still picture; tap one to see it large.
  // One shared off-screen figure draws them (keeps the number of WebGL views down).
  let thumbFig = null;
  let salleLook = null;
  function renderVariantThumbs(g) {
    const box = $("#vthumbs"); box.innerHTML = "";
    if (!thumbFig) thumbFig = Fencer3D.makeFigure(document.createElement("div"), "#8e3b3b", { preserve: true, size: [480, 560] });
    thumbFig.setAccent(accent(g)); thumbFig.setLook(salleLook || Looks.randomLook(g.tradition));
    const sides = sidesOf(g), n = (g.poses || [g.pose]).length;
    box.classList.add("decks"); // every guard uses the same card size, with or without variants
    // One column per side. With several variants the side's pictures are stacked like a deck of cards:
    // swipe (or ‹ ›) brings the next variant to the top; tapping the top card opens it full screen.
    for (const side of sides) {
      const cards = [];
      for (let vi = 0; vi < n; vi++) {
        const p = poseFor(g, side, vi);
        thumbFig.setView(yawFor(side, p.view != null ? p.view : 25)); thumbFig.set(p);
        const label = [n > 1 ? "Variant " + (vi + 1) : "", sides.length > 1 ? side : ""].filter(Boolean).join(" · ") || g.name;
        cards.push({ src: thumbFig.canvas.toDataURL("image/png"), p, label });
      }
      box.appendChild(makeDeck(g, side, cards));
    }
  }
  function makeDeck(g, side, cards) {
    const wrap = document.createElement("div"); wrap.className = "vdeck";
    const deck = document.createElement("div"); deck.className = "deck";
    const els = cards.map((c, i) => { const b = document.createElement("button"); b.className = "vthumb card";
      b.innerHTML = `<img alt="" src="${c.src}"><span>${esc(c.label)}</span>`; deck.appendChild(b); return b; });
    const nav = document.createElement("div"); nav.className = "deck-nav";
    nav.innerHTML = `<button class="dprev" aria-label="Previous variant">‹</button><span class="dpos"></span><button class="dnext" aria-label="Next variant">›</button>`;
    wrap.append(deck, nav);
    let top = 0;
    const lay = () => els.forEach((b, i) => { const k = (i - top + els.length) % els.length; // 0 = top card
      b.style.zIndex = String(els.length - k); b.style.transform = `translate(${k * 7}px, ${-k * 6}px) rotate(${k * 2.5}deg)`;
      b.style.filter = k ? `brightness(${1 - k * 0.06})` : ""; b.tabIndex = k ? -1 : 0;
      b.setAttribute("aria-label", cards[i].label + (k ? "" : " — tap to zoom")); });
    const go = (d) => { top = (top + d + els.length) % els.length; Sfx.card(); lay(); nav.querySelector(".dpos").textContent = `${top + 1} / ${els.length}`; };
    nav.querySelector(".dprev").onclick = () => go(-1); nav.querySelector(".dnext").onclick = () => go(1);
    // swipe the deck: a horizontal flick changes card; a tap opens the top card
    let sx = null, moved = false, swiped = false;
    deck.addEventListener("pointerdown", (e) => { sx = e.clientX; moved = false; swiped = false; });
    deck.addEventListener("pointermove", (e) => { if (sx != null && Math.abs(e.clientX - sx) > 12) moved = true; });
    deck.addEventListener("pointerup", (e) => { if (sx == null) return; const dx = e.clientX - sx; sx = null;
      if (moved && Math.abs(dx) > 30 && els.length > 1) { swiped = true; go(dx < 0 ? 1 : -1); } });
    // a click (tap, mouse or keyboard) on the deck opens its top card — unless it was the end of a swipe
    deck.addEventListener("click", () => { if (swiped) { swiped = false; return; } const c = cards[top]; openZoom(g, side, c.p, g.name + (c.label !== g.name ? " — " + c.label : "")); });
    lay(); nav.querySelector(".dpos").textContent = `1 / ${els.length}`;
    if (els.length < 2) nav.style.visibility = "hidden"; // one card: same size and place as a deck, no variant controls
    return wrap;
  }
  // Full-screen view of one variant: a live figure the player can drag to rotate; X (or Esc) closes it.
  let zoomFig = null, zoomYaw = 0;
  function openZoom(g, side, p, caption) {
    const z = $("#vzoom"); z.classList.remove("hidden"); Sfx.quill();
    if (!zoomFig) zoomFig = Fencer3D.makeFigure($("#vzoom-stage"), "#a3261d");
    zoomFig.setAccent(accent(g)); zoomFig.setSword(null); zoomFig.setLook(salleLook || Looks.randomLook(g.tradition));
    zoomYaw = yawFor(side, p.view != null ? p.view : 25);
    zoomFig.setView(zoomYaw); zoomFig.set(p); zoomFig.render();
    z.querySelector(".vzoom-cap").textContent = caption;
  }
  // Hall of Masters: a player's whole fencer, in their own garb and guard; drag to turn
  function openFencer(name, online) { // online: that player's row from the online Hall
    const r = online ? online : players()[name]; if (!r) return;
    const z = $("#vzoom"); z.classList.remove("hidden"); Sfx.quill();
    // a name in the online Hall (not your own) can be reported
    const rep = $("#vzoom-report"), canReport = !!(online && online.id && online.id !== Online.myId(me()));
    rep.classList.toggle("hidden", !canReport); rep.disabled = false; rep.textContent = "Report this name";
    rep.onclick = canReport ? async () => { rep.disabled = true; rep.textContent = "Sending…";
      const ok = await Online.report(me(), online.id, name); rep.textContent = ok ? "Reported. Thank you." : "Couldn't send. Try again later."; rep.disabled = ok; } : null;
    if (!zoomFig) zoomFig = Fencer3D.makeFigure($("#vzoom-stage"), "#a3261d");
    zoomFig.setAccent("#a3261d");
    let p; try { p = Armoury.showFencer(zoomFig, r); } catch (e) { p = Armoury.showFencer(zoomFig, {}); }
    zoomYaw = p.view != null ? p.view : 25; zoomFig.setView(zoomYaw); zoomFig.render();
    z.querySelector(".vzoom-cap").textContent = `${name} · ${rankFor(r.xp || 0)[1]} · ${(r.xp || 0).toLocaleString()} XP · best streak ${r.streak || 0}`;
  }
  const closeZoom = () => { $("#vzoom").classList.add("hidden"); $("#vzoom-report").classList.add("hidden"); };
  $("#vzoom-x").addEventListener("click", closeZoom);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeZoom(); });
  { let dragX = null;
    const st = $("#vzoom-stage");
    st.addEventListener("pointerdown", (e) => { dragX = e.clientX; st.setPointerCapture(e.pointerId); });
    st.addEventListener("pointermove", (e) => { if (dragX == null || !zoomFig) return; zoomYaw += (e.clientX - dragX) * 0.6; dragX = e.clientX; zoomFig.setView(zoomYaw); zoomFig.render(); });
    const up = () => { dragX = null; }; st.addEventListener("pointerup", up); st.addEventListener("pointercancel", up); }
  $$("#salle-sides button").forEach((b) => b.addEventListener("click", () => { salleSide = b.dataset.v; Sfx.quill(); renderSalle(); }));
  // Report an error: from the Salle it carries the open guard; from Settings it is about the game in general
  $("#report-salle").addEventListener("click", () => { const g = byId[salleId], m = M.find((x) => x.id === g.master);
    Report.open({ label: g.name + " — " + (m ? m.name : g.master) + (g.plate ? " · " + g.plate : ""), guard: g.id, guardName: g.name, master: g.master, plate: g.plate || "" }); });
  $("#report-settings").addEventListener("click", () => Report.open({}));
  // ‹ › beside the cards: previous / next guard in the Salle list (wraps around)
  const salleStep = (d) => { const ids = $$("#salle-list button").map((b) => b.dataset.id); if (!ids.length) return;
    salleId = ids[(ids.indexOf(salleId) + d + ids.length) % ids.length]; Sfx.card(); renderSalle(); };
  $("#salle-prev").addEventListener("click", () => salleStep(-1));
  $("#salle-next").addEventListener("click", () => salleStep(1));

  // Drop caps: wrap each menu button's label so its first letter can be set in red blackletter.
  $$(".big").forEach((b) => { if (b.querySelector(".lbl")) return;
    const t = [...b.childNodes].find((n) => n.nodeType === 3 && n.textContent.trim()); if (!t) return;
    const s = document.createElement("span"); s.className = "lbl"; s.textContent = t.textContent.trim(); b.replaceChild(s, t); });
  if (me()) { show("title"); Online.push(me(), myRecord()); } else askName("title"); // first launch: ask the player's name (else sync it online)
  if (Tips.returned()) { show("support"); thankTipper(); } // back from paying a tip on Stripe
  window.__stanceOff = { show, startRun, answer, finish, distractors, get run() { return run; } }; // debug hook
  // Screenshot hook: index.html#demo=play|wrong|result|salle|hall
  const demo = (location.hash.match(/demo=(\w+)/) || [])[1];
  if (demo && demo !== "hall" && !me()) setPlayer("Tester"); // screenshot hooks need a player
  if (/practice/.test(location.hash)) settings.masters = [M[1].id]; // not saved
  { const only = (location.hash.match(/only=(\w+)/) || [])[1]; if (only) settings.masters = [only]; } // screenshot hook, not saved
  if (/[&#]ms/.test(location.hash)) settings.view = "manuscript"; // not saved
  if (/narrow/.test(location.hash)) $("#app").style.maxWidth = "360px"; // ~phone width for screenshots
  if (demo === "names") {
    const tests = ["Cassandra", "Dickens", "Hancock", "Grapes", "Zoë Ångström", "李小龍", "Jean-Luc", "O'Brien",
      "fuck", "FuCk1ng", "sh1t", "big dick", "ASS", "n1gga", "Thirteenchars", "<script>", "🙂", "   "];
    document.body.innerHTML = "<pre id=out>" + tests.map((t) => JSON.stringify(t) + " → " + (nameProblem(t.trim()) || "OK")).join("\n") + "</pre>";
  }
  if (demo === "hall") {
    store.set("players", {
      "Fiore dei Lib": { xp: 9200, streak: 14, kit: { outfit: "fiore", hat: "crown", beard: "full", hair: "short", sword: "l18a:gold", stance: "posta_di_donna" } },
      "Liechtenauer": { xp: 15400, streak: 9, patron: true, kit: { outfit: "meyer", armour: "gothic", hat: "sallet", sword: "zwei:steel", stance: "vom_tag" } },
      "Zoë": { xp: 1200, streak: 21, kit: { body: "slender", hair: "braids", outfit: "onna", sword: "naginata:black", stance: "at_ease", stanceVi: 1, colors: { hair: "#7a3a1e" } } } });
    store.set("player", "Zoë");
    const open = (location.hash.match(/open=([^&]+)/) || [])[1];
    if (open) setTimeout(() => { const b = document.querySelector(`.hall-row[data-name="${decodeURIComponent(open)}"] .mk`); if (b) b.click(); }, 300); // (clicks the name, not the face)
  }
  if (demo === "play" || demo === "wrong" || demo === "result") {
    settings.reducedMotion = true; startRun("bout");
    if (demo === "wrong") setTimeout(() => { const g = run.guard; answer(run.pool.find((x) => x.id !== g.id).id); }, run.view === "manuscript" ? 600 : 0);
    if (demo === "wrong" && /measure/.test(location.hash)) setTimeout(() => { $("#fb-wrong").style.animation = "none"; const r = $("#fb-wrong").getBoundingClientRect(), b = $("#fbw-next").getBoundingClientRect(), p = $("#play");
      document.title = "sheet top=" + Math.round(r.top) + " h=" + Math.round(r.height) + " scrollH=" + $("#fb-wrong").scrollHeight + " btn=" + Math.round(b.top) + "-" + Math.round(b.bottom) + " vh=" + innerHeight + " playScroll=" + p.scrollTop + "/" + p.scrollHeight; }, 1500);
    if (demo === "result") { run.score = 1840; run.answered = 10; run.correct = 9; run.bestCombo = 6; run.fastest = 1.12; run.missed = ["ochs"]; finish(); }
  } else if (demo === "equiv") {
    // Test hook: Langort question answered with Posta Longa must count as correct;
    // and 200 Langort option sets must never contain Posta Longa.
    settings.reducedMotion = true; settings.masters = allMasterIds.slice(); startRun("bout");
    let clash = 0; for (let i = 0; i < 200; i++) if (distractors(byId.langort).some((x) => sameGuard(x.id, "langort"))) clash++;
    run.guard = byId.langort; run.locked = false; run.t0 = performance.now(); run.tMax = 8;
    answer("posta_longa");
    document.title = `equiv correct=${run.correct} combo=${run.combo} clash=${clash} fb="${$("#fb-name").textContent}"`;
  } else if (demo === "names2") {
    // Test hook: option sets must never hold two guards with the same name (Fabris Prima/Quarta vs I.33 Prima/Quarta)
    settings.reducedMotion = true; settings.masters = allMasterIds.slice(); startRun("bout");
    let bad = 0, n = 0;
    for (const tier of ["novice", "scholar", "master"]) {
      run.tier = tier;
      for (const g of G) for (let i = 0; i < 40; i++) {
        const names = [g].concat(distractors(g)).map((x) => x.name); n++;
        if (new Set(names).size !== names.length) bad++;
      }
    }
    document.title = `names2 sets=${n} dupes=${bad}`;
  } else if (demo === "thanks") { show("support"); renderSupport(true); }
  else if (demo === "zoom") {
    // Test hook: open the first Salle variant full screen, then drag it 150px (≈90° turn)
    show("salle"); $(".vthumb").click();
    const st = $("#vzoom-stage"), ev = (t, x) => st.dispatchEvent(new PointerEvent(t, { clientX: x, pointerId: 1, bubbles: true }));
    try { ev("pointerdown", 100); ev("pointermove", 250); ev("pointerup", 250); } catch (e) {}
    document.title = `zoom open=${!$("#vzoom").classList.contains("hidden")} yaw=${Math.round(zoomYaw)}`;
  }
  else if (demo === "armoury") {
    // Screenshot hook: index.html#demo=armoury[&tab=swords|garb|hats|guards|odd][&try=<item id>][&xp=N]
    const r = myRecord(), xp = +(location.hash.match(/xp=(\d+)/) || [])[1];
    if (xp) { r.xp = xp; saveRecord(r); }
    const t = (location.hash.match(/tab=(\w+)/) || [])[1]; if (t) Armoury.setTab(t);
    settings.reducedMotion = true; show("armoury");
    const tr = (location.hash.match(/try=([\w:]+)/) || [])[1];
    if (tr) { const el = document.querySelector(`#arm-grid [data-item="${tr}"]`); if (el) el.click(); }
    if (/vartest/.test(location.hash)) { const c = document.querySelector("#arm-grid [data-item=\"st:ochs\"]"); const b = c.querySelector(".arm-var"); const t = [b.textContent]; b.click(); t.push(b.textContent); c.click(); document.title = "var " + t.join(" -> "); }
    if (/zoomtest/.test(location.hash)) { $("#arm-zin").click(); $("#arm-zin").click(); if (/up3/.test(location.hash)) for (let i = 0; i < 3; i++) $("#arm-up").click(); show("title"); show("armoury"); document.title = "zoom cam=" + localStorage.getItem("so.armCam"); }
    if (/buy/.test(location.hash)) { // test: two taps buy the tried item, then report the record
      const p0 = myRecord(); $("#arm-buy").click(); const one = myRecord(); $("#arm-buy").click(); const r2 = myRecord();
      document.title = `buy spent0=${p0.spent || 0} after1tap=${one.spent || 0} after2=${r2.spent} owned=${(r2.owned || []).join(",")} kit=${JSON.stringify(r2.kit)} purse=${$("#arm-purse").textContent} btn=${$("#arm-buy").textContent}`;
    }
  }
  else if (demo) show(demo);
})();
