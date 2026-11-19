window.inkMask = function (d, W, H, ink, k, blur) {
  const v = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) { const r = d[i*4], g = d[i*4+1], b = d[i*4+2];
    v[i] = ink === "red" ? Math.max(0, (r - g) - 0.35 * (r - b) ) : Math.max(0, 200 - (r + g + b) / 3); }
  // box blur (separable), radius blur
  const t = new Float32Array(W * H), u = new Float32Array(W * H), R = blur;
  for (let y = 0; y < H; y++) { let s = 0; for (let x = -R; x < W + R; x++) { const xa = Math.min(W - 1, Math.max(0, x + R)), xr = Math.min(W - 1, Math.max(0, x - R - 1));
      s += v[y * W + xa]; if (x - R - 1 >= 0 || true) s -= (x - R - 1 >= -R ? v[y * W + xr] : 0); if (x >= 0 && x < W) t[y * W + x] = s / (2 * R + 1); } }
  for (let x = 0; x < W; x++) { let s = 0; for (let y = -R; y < H + R; y++) { const ya = Math.min(H - 1, Math.max(0, y + R)), yr = Math.min(H - 1, Math.max(0, y - R - 1));
      s += t[ya * W + x]; s -= (y - R - 1 >= -R ? t[yr * W + x] : 0); if (y >= 0 && y < H) u[y * W + x] = s / (2 * R + 1); } }
  const m = new Uint8Array(W * H); for (let i = 0; i < W * H; i++) m[i] = u[i] > k ? 1 : 0; return m;
};
