// Sound effects: synthesised steel clash, wooden-waster thud and quill tick; a recorded coin toss (assets/audio).
window.Sfx = (function () {
  let coinAudio = null; // the recorded coin toss, loaded on first use
  let cardAudio = null; // the card flip, loaded on first use
  let ctx = null;
  const ac = () => {
    if (!ctx) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; ctx = new C(); }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  };
  function noise(c, dur) {
    const b = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const s = c.createBufferSource(); s.buffer = b; return s;
  }
  function env(c, peak, attack, decay) {
    const g = c.createGain(), t = c.currentTime;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
    g.connect(c.destination); return g;
  }
  return {
    enabled: true,
    clash() {
      const c = this.enabled && ac(); if (!c) return;
      const n = noise(c, 0.15), bp = c.createBiquadFilter(); bp.type = "highpass"; bp.frequency.value = 3000;
      n.connect(bp).connect(env(c, 0.35, 0.002, 0.12)); n.start();
      for (const [f, a] of [[1870, 0.12], [2690, 0.1], [4130, 0.07], [5520, 0.04]]) {
        const o = c.createOscillator(); o.type = "sine"; o.frequency.value = f * (0.98 + Math.random() * 0.04);
        o.connect(env(c, a, 0.002, 0.7)); o.start(); o.stop(c.currentTime + 0.8);
      }
    },
    thud() {
      const c = this.enabled && ac(); if (!c) return;
      const o = c.createOscillator(); o.type = "triangle";
      o.frequency.setValueAtTime(140, c.currentTime); o.frequency.exponentialRampToValueAtTime(60, c.currentTime + 0.15);
      o.connect(env(c, 0.5, 0.003, 0.18)); o.start(); o.stop(c.currentTime + 0.25);
      const n = noise(c, 0.1), lp = c.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 600;
      n.connect(lp).connect(env(c, 0.3, 0.002, 0.08)); n.start();
    },
    // Coin toss: a bright gold "ping" off the thumb, a fluttering whirr while it spins, two clinks on landing.
    // Coin toss: the recorded sound (floraphonic, "Wood Surface Single Coin Payout", Pixabay Content License —
    // free to use, no credit required), 1.13 s like the flip. Falls back to the synthesised toss if it can't play.
    coin() {
      if (!this.enabled) return;
      try {
        const a = coinAudio || (coinAudio = new Audio("assets/audio/coin.mp3"));
        a.currentTime = 0; a.volume = 0.9;
        const p = a.play(); if (p && p.catch) p.catch(() => this.coinSynth());
      } catch (e) { this.coinSynth(); }
    },
    // card flip in The Salle's decks: the player's clip (assets/audio/card.mp3, 0.29 s, from a Pixabay "card mixing"
    // sound — Pixabay Content License). A fresh copy each time so quick flips can overlap.
    card() {
      if (!this.enabled) return;
      try { const a = (cardAudio || (cardAudio = new Audio("assets/audio/card.mp3"))).cloneNode(); a.volume = 0.8;
        const p = a.play(); if (p && p.catch) p.catch(() => this.quill()); } catch (e) { this.quill(); }
    },
    preloadCoin() { if (!coinAudio) { coinAudio = new Audio("assets/audio/coin.mp3"); coinAudio.preload = "auto"; } },
    coinSynth() {
      const c = this.enabled && ac(); if (!c) return;
      const ring = (at, gain, partials, decay) => {
        for (const [f, a] of partials) {
          const o = c.createOscillator(), g = c.createGain(), t = c.currentTime + at;
          o.type = "sine"; o.frequency.value = f * (0.99 + Math.random() * 0.02);
          g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain * a, t + 0.003);
          g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
          o.connect(g).connect(c.destination); o.start(t); o.stop(t + decay + 0.05);
        }
      };
      ring(0, 0.22, [[2860, 1], [4210, 0.7], [6120, 0.45], [7930, 0.25]], 0.9);
      // whirr: band-passed noise chopped by a fast tremolo, slowing as it falls
      const n = noise(c, 0.95), bp = c.createBiquadFilter(), trem = c.createGain(), lfo = c.createOscillator(), depth = c.createGain(), out = c.createGain();
      bp.type = "bandpass"; bp.frequency.value = 5200; bp.Q.value = 3;
      lfo.frequency.setValueAtTime(28, c.currentTime); lfo.frequency.linearRampToValueAtTime(16, c.currentTime + 0.95);
      depth.gain.value = 0.5; trem.gain.value = 0.5; lfo.connect(depth).connect(trem.gain);
      out.gain.setValueAtTime(0.0001, c.currentTime + 0.05); out.gain.exponentialRampToValueAtTime(0.05, c.currentTime + 0.2);
      out.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.95);
      n.connect(bp).connect(trem).connect(out).connect(c.destination); n.start(); lfo.start(); lfo.stop(c.currentTime + 1);
      ring(1.01, 0.16, [[3320, 1], [4870, 0.6], [7020, 0.3]], 0.35);
      ring(1.09, 0.08, [[3320, 1], [4870, 0.6]], 0.25);
    },
    quill() {
      const c = this.enabled && ac(); if (!c) return;
      const n = noise(c, 0.06), bp = c.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 5000; bp.Q.value = 2;
      n.connect(bp).connect(env(c, 0.06, 0.005, 0.05)); n.start();
    },
  };
})();
