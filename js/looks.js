// Random fencer looks, drawn from the costume rosters in data/guards.js (window.LOOKS).
(function () {
  const PARCH = "#efe2c4";
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const chance = (p) => Math.random() < p;
  const pickWeighted = (w) => { let r = Math.random(); for (let i = 0; i < w.length; i++) { r -= w[i]; if (r < 0) return i; } return 0; };
  function mix(a, b, t) {
    const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
    return "#" + [16, 8, 0].map((s) => Math.round(((pa >> s) & 255) * (1 - t) + ((pb >> s) & 255) * t)
      .toString(16).padStart(2, "0")).join("");
  }
  function randomLook(tradition) {
    const R = (window.LOOKS || {})[tradition];
    const base = { style: "fiore", jacket: "#f1e9da", thigh: "#f1e9da", shin: "#f1e9da", shoe: null, hair: "#3b2a1d",
                   beard: 0, mustache: false, crown: false, garter: false, chaperone: false, ruff: false, cap: false, hood: false, tonsure: false, bulk: 1, source: "" };
    if (!R) return base;
    const look = Object.assign({}, base, { style: R.style, source: R.source, hair: pick(R.hair),
      beard: pickWeighted(R.beard), mustache: chance(0.4), bulk: 0.92 + Math.random() * 0.2 });
    if (R.style === "fiore") {
      look.jacket = pick(R.jackets); look.thigh = look.shin = mix(look.jacket, PARCH, 0.25);
      look.crown = chance(R.crown);
      // Fiore marks masters with a crown and scholars with a gold garter below the left knee: one or the other
      look.garter = !look.crown && chance(R.garter == null ? 1 : R.garter);
      // some of the uncrowned wear a chaperone, the padded hat of early-1400s Italy, in a muted cloth colour
      look.chaperone = !look.crown && chance(R.chaperone || 0);
      if (look.chaperone) look.chapColor = pick(R.chapColors || ["#7e2620"]);
    } else if (R.style === "fabris") {
      // early 1600s: doublet, Venetian breeches, hose and shoes, a small ruff or falling band, pointed beard
      look.jacket = pick(R.jackets);
      look.thigh = chance(0.5) ? look.jacket : pick(R.breeches);
      look.shin = pick(R.hose); look.shoe = "#1d1712";
      look.ruff = chance(R.ruff); look.mustache = chance(0.75);
      // La Touche (1670s France): always the broad plumed hat, long curled wig and lace cravat; some wear the long coat
      if (R.hats) {
        look.hat = true; look.hatColor = pick(R.hats); look.plumeColor = pick(R.plumes);
        look.wig = true; look.cravat = true; look.coat = chance(R.coat || 0); look.beard = 0; look.mustache = chance(0.5);
      }
    } else if (R.style === "hutton") {
      // Hutton (Victorian salle): a striped jersey, plain dark trousers, black shoes; most wear a moustache
      look.stripes = pick(R.stripes); look.jacket = look.stripes[0];
      look.thigh = look.shin = pick(R.trousers); look.shoe = "#1d1712"; look.mustache = chance(0.85);
    } else if (R.style === "i33") {
      // I.33: long washed-colour tunic, hose of another colour, bare-soled hose on the feet; half are the tonsured
      // priest, the rest the hooded scholar; mostly clean-shaven
      look.jacket = pick(R.jackets);
      look.thigh = look.shin = look.shoe = pick(R.hose.filter((c) => c !== look.jacket));
      look.tonsure = chance(R.priest);
      look.hood = !look.tonsure;
      look.beard = chance(0.15) ? 1 : 0; look.mustache = chance(0.1);
    } else {
      look.jacket = pick(R.jackets);
      look.thigh = pick(R.breeches.filter((c) => c !== look.jacket));
      look.shin = pick(R.hose); look.shoe = "#1d1712";
      look.ruff = chance(R.ruff); look.cap = chance(R.cap);
    }
    return look;
  }
  window.Looks = { randomLook };
})();
