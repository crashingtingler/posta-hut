// Debug sheet: each extracted glyph (selected ink) over its faint source crop, labelled.
window.debugSheet = async function (ex) {
  const T = 120, cols = 10, o = document.createElement("canvas"); o.width = cols * T; o.height = Math.ceil(ex.length / cols) * (T + 16);
  const x = o.getContext("2d"); x.fillStyle = "#fff"; x.fillRect(0, 0, o.width, o.height); x.font = "bold 13px Arial";
  for (let j = 0; j < ex.length; j++) { const e = ex[j], gx = (j % cols) * T, gy = Math.floor(j / cols) * (T + 16);
    const im = await load(LINES[e.gl[1]].src), s = Math.min((T - 8) / e.W, (T - 8) / e.H);
    x.globalAlpha = 0.25; x.drawImage(im, e.X0, e.Y0, e.W, e.H, gx + 4, gy + 16, e.W * s, e.H * s); x.globalAlpha = 1;
    const t = document.createElement("canvas"); t.width = e.HW; t.height = e.HH; const tx = t.getContext("2d"), id = tx.createImageData(e.HW, e.HH);
    for (let i = 0; i < e.HW * e.HH; i++) if (e.hb[i]) { id.data[i*4] = 200; id.data[i*4+1] = 20; id.data[i*4+2] = 20; id.data[i*4+3] = 200; }
    tx.putImageData(id, 0, 0); x.drawImage(t, gx + 4, gy + 16, e.W * s, e.H * s);
    // the box
    x.strokeStyle = "#08f"; x.strokeRect(gx + 4 + 14 * s, gy + 16 + 14 * s, (e.W - 28) * s, (e.H - 28) * s);
    x.fillStyle = "#000"; x.fillText(j + ": " + (e.gl[0] || "(ref)") + " " + e.gl[1], gx + 2, gy + 12); }
  document.body.appendChild(o);
};
