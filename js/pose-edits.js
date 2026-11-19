// Saved stances from the stance editor (editor.html), kept in this browser's localStorage.
// A saved stance can be tied to a guard/side/variant; those replace the guard's pose everywhere
// (game, review sheet, contact sheet). Load this script right after data/guards.js.
// To make edits permanent in the shipped app, export them from the editor and bake them into guards.js.
window.PoseEdits = (function () {
  const KEY = "so.poseEdits";
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) { return {}; } };
  const write = (all) => { try { localStorage.setItem(KEY, JSON.stringify(all)); return true; } catch (e) { return false; } };

  // Snapshot of the poses as written in guards.js, before any edits are applied.
  const ORIGINAL = {};
  for (const g of window.GUARDS) {
    ORIGINAL[g.id] = {
      poses: clone(g.poses || [g.pose]),
      left: g.sides && g.sides.left && g.sides.left.pose ? clone(g.sides.left.pose) : null,
      leftPoses: clone(g.leftPoses || {}),
      manuscript: g.manuscript ? clone(g.manuscript) : null,
      leftManuscript: g.sides && g.sides.left && g.sides.left.manuscript ? clone(g.sides.left.manuscript) : null,
    };
  }

  // Apply edits that are tied to a guard. Left-side edits replace the mirrored left version
  // for that variant (g.leftPoses[vi]; variant 0 also updates g.sides.left.pose).
  // "addVariant" entries add an extra right-side variant (oldest first); g.addedVariantNames lists them.
  const all = read();
  const names = Object.keys(all).sort((a, b) => String(all[a].saved || "").localeCompare(String(all[b].saved || "")));
  for (const name of names) {
    const e = all[name];
    if (!e || !e.guard) continue;
    // already baked into data/guards.js (same save): applying it again would add its variant twice
    if (window.BAKED_SAVED && window.BAKED_SAVED.has(name + "|" + e.saved)) continue;
    if (e.kind === "use") {
      // a guard switched off in the editor is never used in the game
      const ug = window.GUARDS.find((x) => x.id === e.guard);
      if (ug) ug.unused = !e.used;
      continue;
    }
    if (e.kind === "sides") {
      // which sides of a guard are used (an unused side is never asked in the game)
      const sg = window.GUARDS.find((x) => x.id === e.guard);
      if (sg) {
        sg.sideUse = { right: !!e.right, left: !!e.left };
        if (e.left && !(sg.sides && sg.sides.left)) sg.sides = Object.assign(sg.sides || {}, { left: {} });
      }
      continue;
    }
    if (!e.pose) continue;
    const g = window.GUARDS.find((x) => x.id === e.guard);
    if (!g) continue;
    g.poses = g.poses || [g.pose];
    if (e.addVariant) {
      g.poses.push(clone(e.pose));
      (g.addedVariantNames = g.addedVariantNames || []).push(name);
    } else if (e.side === "left") {
      if (g.sides && g.sides.left) {
        (g.leftPoses = g.leftPoses || {})[e.vi || 0] = clone(e.pose);
        if (!e.vi) g.sides.left.pose = g.leftPoses[0];
      }
    } else {
      g.poses[e.vi || 0] = clone(e.pose);
      if (!e.vi) g.pose = g.poses[0];
    }
  }

  // Plates chosen in the editor (built-in, one of the player's own images, or none) per guard|side.
  const readJ = (k) => { try { return JSON.parse(localStorage.getItem(k) || "{}") || {}; } catch (e) { return {}; } };
  const userPlates = readJ("so.userPlates"), choice = readJ("so.plateChoice");
  // a stance with no built-in plate and no explicit choice uses the player's first plate
  for (const key in userPlates) {
    const [id, s] = key.split("|"), g = window.GUARDS.find((x) => x.id === id), list = userPlates[key] || [];
    const hasBuiltin = g && (s === "left" ? g.sides && g.sides.left && g.sides.left.manuscript : g.manuscript);
    if (g && list.length && !hasBuiltin && !(key in choice)) choice[key] = list[0].id || list[0].added;
  }
  for (const key in choice) {
    const [id, s] = key.split("|"), g = window.GUARDS.find((x) => x.id === id), c = choice[key];
    if (!g || c === "builtin") continue;
    let m;
    if (c !== "none") {
      const p = (userPlates[key] || []).find((x) => (x.id || x.added) === c);
      if (!p) continue;
      m = { src: p.src, credit: "Player's plate" + (p.name ? " (" + p.name + ")" : ""), player: true };
    }
    if (s === "left") {
      if (!(g.sides && g.sides.left)) g.sideUse = g.sideUse || { right: true, left: false }; // a plate doesn't switch a side on
      g.sides = g.sides || {}; g.sides.left = g.sides.left || {}; g.sides.left.manuscript = m;
    } else g.manuscript = m;
  }

  return { KEY, read, write, ORIGINAL, clone };
})();
