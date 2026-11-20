// 3D manuscript-style fencer (Three.js). Built from simple shapes, posed from guard data
// with 3D two-bone IK, drawn with toon shading and ink outlines over the parchment page.
//
// World frame: metres, y up, +x toward the opponent, +z = the fencer's right side.
// Pose data (all optional except hilt/blade):
//   lead: "left" | "right"   which foot is forward
//   stance: front–back distance between the feet; width: sideways distance
//   crouch: how far the hips drop; turn: hips turned (deg, + = right side back)
//   twist: extra chest rotation on top of the hips; lean: forward lean (deg)
//   hilt: [x, y, z] crossguard position; blade: [yaw, pitch] (deg; yaw + = toward the right side)
//   buckler: [x, y, z] the left fist holding a buckler (sword and buckler, I.33). With it the sword is a
//            one-handed arming sword held in the right hand only; bucklerFace: [yaw, pitch] the way the
//            buckler's face points (default: toward the opponent).
//   rapier: true   a one-handed rapier (long thin blade, ringed hilt); leftHand: [x, y, z] where the free left hand is
//   sabre: true    a one-handed sabre (Hutton 1889: shorter, broader blade, knuckle-bow guard); leftHand as for the rapier,
//                  default: the left hand rests on the left hip
//   stick: true    Hutton's "great stick": a five-foot rattan cane held in both hands (right hand above the left)
//   dagger: true   a short sword-bayonet held overhand in the right hand; leftHand as above, default: the open left
//                  hand held close to the left breast
//   small: true    a smallsword (La Touche 1670): long slender blade, round cup hilt and small knuckle bow; leftHand as
//                  above, default: the open left hand raised to about head height
(function () {
  const T = window.THREE;
  const V = (x, y, z) => new T.Vector3(x, y, z);
  const DEG = Math.PI / 180, UP = V(0, 1, 0);
  const INK = 0x1d1712;
  const B = { thigh: 0.45, shin: 0.44, upper: 0.30, fore: 0.29, hipW: 0.095, shW: 0.185, torso: 0.52, waist: 0.2,
              neck: 0.07, headR: 0.1, pelvisH: 0.96, ankleH: 0.07, grip: 0.25, blade: 0.96, cross: 0.12,
              handA: 0.045, handB: 0.19 };
  // one-handed arming sword (sword and buckler): shorter blade and grip, narrower cross, one hand
  const ARMING = { blade: 0.78, grip: 0.13, cross: 0.095, handA: 0.055, pommel: 0.026 };
  const LONG = { blade: B.blade, grip: B.grip, cross: B.cross, handA: B.handA, pommel: 0.032 };
  // rapier (Fabris 1606): long narrow blade, short grip, long quillons and side rings, one hand
  const RAPIER = { blade: 1.08, grip: 0.12, cross: 0.13, handA: 0.05, pommel: 0.028, rapier: true };
  // sabre (Hutton, Cold Steel 1889): about 34-inch blade, short cross (the bow is the guard), one hand
  // curve: how far the tip sweeps back toward the spine (m) — a gently curved blade, the edge on the convex side
  const SABRE = { blade: 0.86, grip: 0.13, cross: 0.04, handA: 0.05, pommel: 0.022, sabre: true, curve: 0.06 };
  // Hutton's great stick (5 ft rattan, both hands) and the short sword-bayonet used as a dagger
  const STICK = { blade: 1.25, grip: 0.27, cross: 0, handA: 0.05, pommel: 0.016, stick: true };
  const DAGGER = { blade: 0.3, grip: 0.11, cross: 0.05, handA: 0.05, pommel: 0.02, dagger: true };
  // smallsword (La Touche, 1670): a long slender blade, a round cup hilt, a small knuckle bow and short quillons
  const SMALL = { blade: 0.98, grip: 0.11, cross: 0.05, handA: 0.05, pommel: 0.024, small: true };
  const swordOf = (p) => (p && p.small ? SMALL : p && p.stick ? STICK : p && p.dagger ? DAGGER : p && p.sabre ? SABRE : p && p.rapier ? RAPIER : p && p.buckler ? ARMING : LONG);
  const BUCKLER_R = 0.15;
  const REST = { lead: "left", stance: 0.34, width: 0.22, crouch: 0.02, turn: 25, twist: 0, lean: 2,
                 hilt: [0.28, 0.86, 0.2], blade: [5, -62] };

  // ---------- shared materials ----------
  const gradient = (() => {
    const d = new Uint8Array([120, 120, 120, 255, 200, 200, 200, 255, 255, 255, 255, 255]);
    const t = new T.DataTexture(d, 3, 1, T.RGBAFormat);
    t.minFilter = t.magFilter = T.NearestFilter; t.needsUpdate = true; return t;
  })();
  const toon = (color, extra) => new T.MeshToonMaterial(Object.assign({ color, gradientMap: gradient }, extra || {}));
  const outlineMat = (w) => new T.ShaderMaterial({
    uniforms: { color: { value: new T.Color(INK) }, w: { value: w } },
    side: T.BackSide,
    vertexShader: "uniform float w; void main(){ vec3 n = normalize(normalMatrix * normal);" +
      " vec4 mv = modelViewMatrix * vec4(position, 1.0); mv.xyz += n * w; gl_Position = projectionMatrix * mv; }",
    fragmentShader: "uniform vec3 color; void main(){ gl_FragColor = vec4(color, 1.0); }",
  });
  const OUTLINE = outlineMat(0.011), OUTLINE_THIN = outlineMat(0.006);

  const GEO = {
    seg: new T.CylinderGeometry(1, 1, 1, 14, 1),
    ball: new T.SphereGeometry(1, 18, 12),
    cone: new T.ConeGeometry(1, 1, 10),
    ring: new T.CylinderGeometry(1, 1, 1, 18, 1, true),
    torus: new T.TorusGeometry(1, 0.35, 8, 20),
    // lower torso (hips → waist) and chest (waist → shoulders) as lathed profiles
    hips: new T.LatheGeometry([[0, 0], [0.9, 0], [1, 0.35], [0.88, 1], [0, 1]].map(([r, y]) => new T.Vector2(r, y)), 18),
    chest: new T.LatheGeometry([[0, 0], [0.82, 0], [0.92, 0.45], [1, 0.82], [0.72, 1], [0, 1]].map(([r, y]) => new T.Vector2(r, y)), 18),
    skirt: new T.CylinderGeometry(1, 1.25, 1, 18, 1, true),
    blade: new T.CylinderGeometry(0.004, 0.021, 1, 4),
    disc: new T.CylinderGeometry(1, 1, 1, 28, 1), // buckler board (unit radius and thickness)
    dome: new T.SphereGeometry(1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), // buckler boss
    rim: new T.TorusGeometry(1, 0.07, 6, 28), // buckler iron rim
    bseg: new T.CylinderGeometry(1, 1, 1, 4, 1, true), // one piece of a curved (sabre) blade: same diamond section as the blade
    // Armoury swords: blade outlines other than the plain taper
    bladePar: new T.CylinderGeometry(0.014, 0.021, 1, 4), // broad to the end (Oakeshott X, XIIIa, wasters)
    bladeAcute: new T.CylinderGeometry(0.0015, 0.024, 1, 4), // strongly tapering thrusting blade (XV, XVII)
    // Armoury hats: a kettle-hat brim (sloping down), a morion brim (sweeping up), a tricorne's three cocked sides
    frust: new T.CylinderGeometry(0.55, 1, 1, 24, 1, true),
    frustUp: new T.CylinderGeometry(1, 0.55, 1, 24, 1, true),
    tri: new T.CylinderGeometry(1, 0.62, 1, 3, 1, true),
    bsegR: new T.CylinderGeometry(1, 1, 1, 10, 1, true), // a piece of a round "blade" (rattan stick)
    pyr: new T.ConeGeometry(1, 1, 4), // a four-sided pyramid (inverted-pyramid pommel)
  };
  GEO.bsegR.translate(0, 0.5, 0); GEO.pyr.translate(0, 0.5, 0);
  GEO.seg.translate(0, 0.5, 0); GEO.blade.translate(0, 0.5, 0); GEO.bseg.translate(0, 0.5, 0); GEO.cone.translate(0, 0.5, 0); GEO.skirt.translate(0, -0.5, 0);
  GEO.bladePar.translate(0, 0.5, 0); GEO.bladeAcute.translate(0, 0.5, 0); GEO.frust.translate(0, -0.5, 0); GEO.frustUp.translate(0, 0.5, 0); GEO.tri.translate(0, 0.5, 0);

  // ---------- helpers ----------
  function ik(a, b, l1, l2, pole) {
    const ab = b.clone().sub(a);
    let d = ab.length();
    const u = d > 1e-6 ? ab.divideScalar(d) : V(0, -1, 0);
    d = Math.min(Math.max(d, Math.abs(l1 - l2) + 1e-3), l1 + l2 - 1e-3);
    const along = (l1 * l1 - l2 * l2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, l1 * l1 - along * along));
    let p = pole.clone().addScaledVector(u, -pole.dot(u));
    if (p.lengthSq() < 1e-6) p = Math.abs(u.y) < 0.9 ? V(0, -1, 0).addScaledVector(u, u.y) : V(1, 0, 0);
    p.normalize();
    return { joint: a.clone().addScaledVector(u, along).addScaledVector(p, h), end: a.clone().addScaledVector(u, d) };
  }
  // Armoury blades: the edge-wise offset of the blade's centre line at t (0 hilt .. 1 tip): a sabre-like curve that may
  // start partway along (khopesh, shotel; negative = forward-curved kopis/falcata) and the waves of a flamberge
  function bladeOffset(sw, t) {
    let o = 0;
    if (sw.curve) { const cs = sw.curveStart || 0, u = t > cs ? (t - cs) / (1 - cs) : 0; o -= sw.curve * u * u; }
    const fl = sw.flame;
    if (fl && t > fl.from) o += fl.amp * Math.sin(2 * Math.PI * fl.n * (t - fl.from) / (1 - fl.from)) * (1 - 0.4 * t);
    return o;
  }
  // width profile: relative half-widths at evenly spaced points from the hilt to the tip
  const profAt = (prof, t) => { const x = t * (prof.length - 1), i = Math.min(prof.length - 2, Math.floor(x)); return prof[i] + (prof[i + 1] - prof[i]) * (x - i); };
  const bladeDir = ([yaw, pitch]) => V(Math.cos(pitch * DEG) * Math.cos(yaw * DEG), Math.sin(pitch * DEG), Math.cos(pitch * DEG) * Math.sin(yaw * DEG));

  function stripes(a, b, across, sparse) {
    const c = document.createElement("canvas"); c.width = across ? 8 : 64; c.height = across ? 64 : 8;
    const x = c.getContext("2d");
    // across: bands round the body (hussar frogging, quilting) instead of up and down it; sparse: thin bands of b far apart
    for (let i = 0; i < 8; i++) { x.fillStyle = (sparse ? i % 4 === 0 : i % 2) ? b : a; if (across) x.fillRect(0, i * 8, 8, 8); else x.fillRect(i * 8, 0, 8, 8); }
    const t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; t.colorSpace = T.SRGBColorSpace; return t;
  }
  // writhen (spirally fluted) metal: diagonal bands that wrap round a part as a twist
  function twisted(a, b) {
    const c = document.createElement("canvas"); c.width = c.height = 32;
    const x = c.getContext("2d"); x.fillStyle = a; x.fillRect(0, 0, 32, 32); x.strokeStyle = b; x.lineWidth = 4;
    for (let i = -32; i < 64; i += 10) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i + 32, 32); x.stroke(); }
    const t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(2, 2); t.colorSpace = T.SRGBColorSpace; return t;
  }
  // mail rings ("ring") or rivet heads ("dot") on a ground colour
  function dots(a, b, kind) {
    const c = document.createElement("canvas"); c.width = c.height = 16;
    const x = c.getContext("2d"); x.fillStyle = a; x.fillRect(0, 0, 16, 16);
    if (kind === "fur") { x.strokeStyle = b; x.lineWidth = 1.3; for (const [px, py, dx] of [[2, 3, 2], [9, 1, -1], [6, 8, 2], [13, 7, -2], [3, 12, 1], [11, 13, 2]]) { x.beginPath(); x.moveTo(px, py); x.lineTo(px + dx, py + 4); x.stroke(); } }
    else if (kind === "ring") { x.strokeStyle = b; x.lineWidth = 1.6; for (const [px, py] of [[4, 4], [12, 12], [12, 4], [4, 12]]) { x.beginPath(); x.arc(px, py, 3, 0, Math.PI * 2); x.stroke(); } }
    else { x.fillStyle = b; x.beginPath(); x.arc(8, 8, 2.2, 0, Math.PI * 2); x.fill(); }
    const t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; t.colorSpace = T.SRGBColorSpace; return t;
  }
  function groundTexture() {
    const c = document.createElement("canvas"); c.width = c.height = 256;
    const x = c.getContext("2d");
    const g = x.createRadialGradient(128, 128, 10, 128, 128, 128);
    g.addColorStop(0, "rgba(60,40,20,.28)"); g.addColorStop(1, "rgba(60,40,20,0)");
    x.fillStyle = g; x.fillRect(0, 0, 256, 256);
    x.strokeStyle = "rgba(29,23,18,.35)"; x.lineWidth = 2;
    for (let i = -256; i < 256; i += 14) { x.beginPath(); x.moveTo(i, 256); x.lineTo(i + 256, 0); x.stroke(); }
    x.globalCompositeOperation = "destination-in";
    const m = x.createRadialGradient(128, 128, 30, 128, 128, 128);
    m.addColorStop(0, "rgba(0,0,0,1)"); m.addColorStop(1, "rgba(0,0,0,0)");
    x.fillStyle = m; x.fillRect(0, 0, 256, 256);
    const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; return t;
  }

  // A drawable part: filled toon mesh + ink outline sharing one transform.
  function part(scene, geo, mat, outline = OUTLINE) {
    const o = new T.Object3D();
    const fill = new T.Mesh(geo, mat);
    o.add(fill);
    if (outline) o.add(new T.Mesh(geo, outline));
    o.mat = mat;
    scene.add(o);
    return o;
  }
  // Place a unit segment (y 0..1) from a to b with radii (ra at a, rb at b via scale of a taper-free cylinder).
  const tmpQ = new T.Quaternion();
  function seg(o, a, b, r) {
    const d = b.clone().sub(a), len = d.length() || 1e-4;
    o.position.copy(a);
    o.quaternion.copy(tmpQ.setFromUnitVectors(UP, d.divideScalar(len)));
    o.scale.set(r, len, r);
  }
  function ball(o, p, rx, ry = rx, rz = rx, q) {
    o.position.copy(p); o.scale.set(rx, ry, rz);
    if (q) o.quaternion.copy(q); else o.quaternion.identity();
  }
  function frame(o, origin, xAxis, yAxis, zAxis, sx, sy, sz) {
    o.position.copy(origin);
    o.quaternion.setFromRotationMatrix(new T.Matrix4().makeBasis(xAxis, yAxis, zAxis));
    o.scale.set(sx, sy, sz);
  }

  // ---------- solve the body from pose data ----------
  // ov: an Armoury sword (see makeFigure's setSword) drawn in place of the guard's own weapon; the hands still follow the guard
  function solve(p, ov) {
    const qH = new T.Quaternion().setFromAxisAngle(UP, -p.turn * DEG);
    const hipFwd = V(1, 0, 0).applyQuaternion(qH), hipRight = V(0, 0, 1).applyQuaternion(qH);
    const pel = V(p.shift || 0, B.pelvisH - p.crouch, 0);
    const qC = new T.Quaternion().setFromAxisAngle(UP, -(p.turn + p.twist) * DEG);
    const right = V(0, 0, 1).applyQuaternion(qC);
    const qLean = new T.Quaternion().setFromAxisAngle(right, -p.lean * DEG);
    const spine = UP.clone().applyQuaternion(qLean);
    const fwd = V(1, 0, 0).applyQuaternion(qC).applyQuaternion(qLean);
    // side lean (deg, + = toward the right side): tilt the chest about its forward axis; shoulders tilt with it
    if (p.sideLean) {
      const qSide = new T.Quaternion().setFromAxisAngle(V(1, 0, 0).applyQuaternion(qC), p.sideLean * DEG);
      spine.applyQuaternion(qSide); fwd.applyQuaternion(qSide); right.applyQuaternion(qSide);
    }
    const waist = pel.clone().addScaledVector(UP, B.waist);
    const neck = waist.clone().addScaledVector(spine, B.torso - B.waist);
    const shR = neck.clone().addScaledVector(spine, -0.05).addScaledVector(right, B.shW);
    const shL = neck.clone().addScaledVector(spine, -0.05).addScaledVector(right, -B.shW);
    const head = neck.clone().addScaledVector(spine, B.neck + B.headR * 0.9);
    // the head looks at the opponent, a little toward the camera side
    const look = V(1, 0, 0).addScaledVector(V(fwd.x, 0, fwd.z), 0.6).add(V(0, -0.05, 0)).normalize(); // toward the opponent, following the chest
    // head turn / nod / lean (deg): + turn = toward the right side, + nod = chin down, + lean = toward the right shoulder
    const headUp = UP.clone().addScaledVector(look, -UP.dot(look)).normalize();
    if (p.headTurn) { look.applyAxisAngle(UP, -p.headTurn * DEG); headUp.applyAxisAngle(UP, -p.headTurn * DEG); }
    if (p.headNod) { const ax = look.clone().cross(headUp).normalize(); look.applyAxisAngle(ax, -p.headNod * DEG); headUp.applyAxisAngle(ax, -p.headNod * DEG); }
    if (p.headLean) headUp.applyAxisAngle(look, p.headLean * DEG);

    const d = bladeDir(p.blade), H = V(...p.hilt), sw = ov ? Object.assign({ handA: 0.05, pommel: 0.03, cross: 0.1 }, ov) : swordOf(p);
    // pose.handA / handB: where the right / left hand sits on the grip, measured from the cross toward the pommel (m);
    // left out, the weapon's own grip positions are used. pose.freeLeft: the left hand lets go of the weapon (pose.leftHand)
    const handR = H.clone().addScaledVector(d, -(p.handA != null ? p.handA : sw.handA));
    // sword and buckler: the left fist holds the buckler's grip behind the boss; otherwise both hands on the grip
    // rapier: the free left hand is held up before the body (pose.leftHand places it)
    // sabre: the left hand rests on the left hip unless pose.leftHand places it
    const handL = p.buckler ? V(...p.buckler) : p.leftHand && (p.rapier || p.sabre || p.dagger || p.small || p.freeLeft) ? V(...p.leftHand)
      : p.small ? neck.clone().addScaledVector(fwd, 0.12).addScaledVector(right, -0.26).addScaledVector(spine, 0.16)
      : p.dagger ? neck.clone().addScaledVector(fwd, 0.2).addScaledVector(right, -0.14).addScaledVector(spine, -0.16)
      : p.sabre ? waist.clone().addScaledVector(right, -0.2).addScaledVector(fwd, -0.03).addScaledVector(spine, 0.02)
      : p.rapier ? neck.clone().addScaledVector(fwd, 0.28).addScaledVector(right, -0.08).addScaledVector(spine, -0.12)
      : H.clone().addScaledVector(d, -(p.handB != null ? p.handB : sw.handB != null ? sw.handB : B.handB));
    const bFace = p.buckler ? bladeDir(p.bucklerFace || [0, 0]) : null;
    const Hs = sw.lift ? H.clone().addScaledVector(d, sw.lift) : H; // where the head (blade base) is drawn
    // elbow direction hints; a pose can override them (world vectors) when an arm must cross in front of the body
    const poleR = p.poleR ? V(...p.poleR) : V(0, -1, 0).addScaledVector(right, 0.7).addScaledVector(fwd, -0.2);
    const poleL = p.poleL ? V(...p.poleL) : V(0, -1, 0).addScaledVector(right, -0.7).addScaledVector(fwd, -0.2);
    const armR = ik(shR, handR, B.upper, B.fore, poleR), armL = ik(shL, handL, B.upper, B.fore, poleL);
    // elbow swing (deg): turn the elbow about the shoulder-to-hand line; the hand stays on the grip
    const swing = (sh, arm, deg) => { if (deg) arm.joint.sub(sh).applyAxisAngle(arm.end.clone().sub(sh).normalize(), deg * DEG).add(sh); };
    swing(shR, armR, p.elbowR); swing(shL, armL, p.elbowL);

    const leftLead = p.lead !== "right";
    const hipL = pel.clone().addScaledVector(hipRight, -B.hipW), hipR = pel.clone().addScaledVector(hipRight, B.hipW);
    const front = V(p.stance / 2, B.ankleH, (leftLead ? -1 : 1) * p.width / 2);
    const back = V(-p.stance / 2, B.ankleH, (leftLead ? 1 : -1) * p.width / 2);
    const toeFront = V(1, 0, leftLead ? -0.15 : 0.15).normalize();
    const toeBack = V(0.55, 0, leftLead ? 0.85 : -0.85).normalize();
    const footL = (leftLead ? front : back).clone(), footR = (leftLead ? back : front).clone();
    const toeL = (leftLead ? toeFront : toeBack).clone(), toeR = (leftLead ? toeBack : toeFront).clone();
    // per-foot controls: Fwd (m, toward the opponent), Side (m, + = outward), Turn (deg, + = toes outward)
    footL.x += p.footLFwd || 0; footL.z -= p.footLSide || 0; footR.x += p.footRFwd || 0; footR.z += p.footRSide || 0;
    if (p.footLTurn) toeL.applyAxisAngle(UP, p.footLTurn * DEG);
    if (p.footRTurn) toeR.applyAxisAngle(UP, -p.footRTurn * DEG);
    const legL = ik(hipL, footL, B.thigh, B.shin, toeL.clone().addScaledVector(UP, 0.1));
    const legR = ik(hipR, footR, B.thigh, B.shin, toeR.clone().addScaledVector(UP, 0.1));
    // knee swing (deg): turn the knee about the hip-to-ankle line; the foot stays planted
    swing(hipL, legL, p.kneeL); swing(hipR, legR, p.kneeR);
    return { pel, waist, neck, head, spine, right, fwd, hipFwd, hipRight, shR, shL, look, headUp, d, H: Hs, handR, handL, sw, bFace,
             armR, armL, hipL, hipR, legL, legR, toeL, toeR };
  }

  // ---------- figure ----------
  function makeFigure(container, accent, opts = {}) {
    const renderer = opts.renderer || new T.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: !!opts.preserve });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = T.SRGBColorSpace;
    if (!opts.renderer) container.appendChild(renderer.domElement);
    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(28, 1, 0.1, 50);
    scene.add(new T.HemisphereLight(0xfff6e6, 0x8a7558, 1.6));
    const sun = new T.DirectionalLight(0xffffff, 2.2); sun.position.set(2, 4, 3); scene.add(sun);

    const ground = new T.Mesh(new T.PlaneGeometry(2.6, 1.4), new T.MeshBasicMaterial({ map: groundTexture(), transparent: true, depthWrite: false }));
    ground.rotation.x = -Math.PI / 2; ground.position.set(0.1, 0.001, 0); scene.add(ground);

    // materials that change with the look
    const M = {
      jacket: toon(0xf1e9da), jacketFar: toon(0xd9cfbd), armL: toon(0xf1e9da), armR: toon(0xf1e9da), thighL: toon(0xf1e9da), thighR: toon(0xf1e9da),
      shin: toon(0xf1e9da), shoe: toon(0x1d1712), skin: toon(0xf0d9b8), hair: toon(0x3b2a1d),
      belt: toon(accent || 0x8e3b3b), white: toon(0xf6f1e6), gold: toon(0xd4a62a), ink: toon(0x1d1712),
      steel: toon(0xd9d6cf), iron: toon(0x5e5a52), grip: toon(0x5a3a22), cane: toon(0xc9a86a),
      chap: toon(0x7e2620), // the chaperone's cloth
      hat: toon(0x2b2522), plume: toon(0xf6f1e6), // La Touche: the broad-brimmed hat and its plume
      // Armoury: linen braies (the starting underwear), a skirt/hakama/kilt cloth of its own, a hat's trim,
      // the blade and hilt (recoloured per sword), the bazooka's olive drab
      braies: toon(0xf3ede0), skirt: toon(0xf1e9da), hat2: toon(0xa3261d), blade: toon(0xd9d6cf), hilt: toon(0x5e5a52), olive: toon(0x55603a),
    };
    const setFill = (o, mat) => { o.children[0].material = mat; };
    const setGeo = (o, geo) => { for (const c of o.children) c.geometry = geo; };
    const P = {};
    const add = (k, geo, mat, ol) => (P[k] = part(scene, geo, mat, ol));
    // legs
    for (const s of ["L", "R"]) {
      add("thigh" + s, GEO.seg, s === "L" ? M.thighL : M.thighR); add("knee" + s, GEO.ball, M.shin);
      add("puff" + s, GEO.ball, s === "L" ? M.thighL : M.thighR);
      add("shin" + s, GEO.seg, M.shin); add("foot" + s, GEO.ball, M.shoe);
    }
    add("hips", GEO.hips, M.jacket); add("skirt", GEO.skirt, M.jacket); add("belt", GEO.torus, M.belt, OUTLINE_THIN);
    add("chest", GEO.chest, M.jacket);
    add("neck", GEO.seg, M.skin); add("ruff", GEO.torus, M.white, OUTLINE_THIN);
    add("head", GEO.ball, M.skin); add("nose", GEO.cone, M.skin, OUTLINE_THIN);
    add("hair", GEO.ball, M.hair); add("beard", GEO.ball, M.hair, null); // no ink outline: an outlined beard reads as an open mouth
    add("mustL", GEO.ball, M.hair, null); add("mustR", GEO.ball, M.hair, null); // moustache halves, no outline either
    add("eyeL", GEO.ball, M.ink, null); add("eyeR", GEO.ball, M.ink, null);
    add("cap", GEO.ring, M.ink); add("capTop", GEO.ball, M.ink, null);
    add("crown", GEO.ring, M.gold, OUTLINE_THIN);
    // chaperone (early-1400s Italian hat): padded roll, cloth puffed on top, a drape down one side, a long tail behind
    add("chapRoll", GEO.torus, M.chap, OUTLINE_THIN); add("chapTop", GEO.ball, M.chap, OUTLINE_THIN);
    add("chapPatte", GEO.ball, M.chap, OUTLINE_THIN); add("chapTail", GEO.seg, M.chap, OUTLINE_THIN);
    for (let i = 0; i < 5; i++) add("spike" + i, GEO.cone, M.gold, OUTLINE_THIN);
    add("garter", GEO.seg, M.gold, OUTLINE_THIN); // Fiore's scholars: a gold garter just below the left knee
    // I.33 (c. 1300): the scholar wears a hood with a shoulder cape and a pointed tail; the priest a tonsure
    // La Touche (1670s France): broad-brimmed hat with a plume, a long curled wig falling to the shoulders, a lace cravat
    add("hatBrim", GEO.disc, M.hat, OUTLINE_THIN); add("hatCrown", GEO.ball, M.hat, OUTLINE_THIN); add("plume", GEO.ball, M.plume, OUTLINE_THIN);
    add("wigL", GEO.ball, M.hair, OUTLINE_THIN); add("wigR", GEO.ball, M.hair, OUTLINE_THIN); add("wigB", GEO.ball, M.hair, OUTLINE_THIN);
    add("cravat", GEO.ball, M.white, OUTLINE_THIN);
    add("hood", GEO.ball, M.jacket, OUTLINE_THIN); add("hoodCape", GEO.ball, M.jacket, OUTLINE_THIN);
    add("hoodTip", GEO.cone, M.jacket, OUTLINE_THIN); add("tonsure", GEO.ball, M.skin, null);
    // arms
    for (const s of ["L", "R"]) {
      add("shoulder" + s, GEO.ball, M["arm" + s]); add("upper" + s, GEO.seg, M["arm" + s]);
      add("elbow" + s, GEO.ball, M["arm" + s]); add("fore" + s, GEO.seg, M["arm" + s]); add("hand" + s, GEO.ball, M.skin);
    }
    // sword
    const BSEGS = 24; // a curved (or wavy, or leaf-shaped) blade is drawn as this many short pieces along its length
    for (let i = 0; i < BSEGS; i++) add("bs" + i, GEO.bseg, M.steel, OUTLINE_THIN);
    for (let i = 0; i < BSEGS; i++) setFill(P["bs" + i], M.blade);
    add("blade", GEO.blade, M.blade, OUTLINE_THIN); add("grip", GEO.seg, M.grip, OUTLINE_THIN);
    add("cross", GEO.seg, M.hilt, OUTLINE_THIN); add("pommel", GEO.ball, M.hilt, OUTLINE_THIN);
    // buckler (sword and buckler guards only): a small round board with a domed iron boss and an iron rim
    add("buckler", GEO.disc, M.wood = toon(0xb8925a), OUTLINE_THIN); add("boss", GEO.dome, M.iron, OUTLINE_THIN);
    add("rim", GEO.rim, M.iron, null);
    // rapier hilt: a side ring beside the blade and a knuckle bow in front of the hand
    add("ring", GEO.rim, M.hilt, OUTLINE_THIN); add("bow", GEO.rim, M.hilt, OUTLINE_THIN);
    // smallsword hilt: a round cup (a shallow dish around the blade, rounded toward the point)
    add("cup", GEO.dome, M.hilt, OUTLINE_THIN);
    // Armoury sword pieces (hidden unless setSword gave a sword): bent quillons, quillon-end knobs, a tsuba, wheel and
    // scent-stopper pommels, an inscription band, a feder's schilt, smallsword shells, swept-hilt bars, a second side
    // ring, the colichemarde's broad forte — and the bazooka
    const CX = { cxA: [GEO.seg, M.hilt], cxB: [GEO.seg, M.hilt], cxEndA: [GEO.ball, M.hilt], cxEndB: [GEO.ball, M.hilt],
      tsuba: [GEO.disc, M.hilt], cxWheel: [GEO.disc, M.hilt], cxCone: [GEO.cone, M.hilt], cxBand: [GEO.bseg, M.gold],
      cxSchilt: [GEO.ball, M.blade], cxShellA: [GEO.dome, M.hilt], cxShellB: [GEO.dome, M.hilt],
      cxBar0: [GEO.rim, M.hilt], cxBar1: [GEO.rim, M.hilt], cxBar2: [GEO.rim, M.hilt], cxRing2: [GEO.rim, M.hilt],
      cxForte: [GEO.bladePar, M.blade], cxTube: [GEO.seg, M.olive], cxMouth: [GEO.seg, M.olive], cxPistol: [GEO.seg, M.grip],
      cxSight: [GEO.seg, M.ink], cxRear: [GEO.ring, M.ink],
      cxHookA: [GEO.seg, M.hilt], cxHookB: [GEO.seg, M.hilt], cxA2: [GEO.seg, M.hilt], cxB2: [GEO.seg, M.hilt], cxA3: [GEO.seg, M.hilt], cxB3: [GEO.seg, M.hilt], cxRingP: [GEO.torus, M.hilt], cxPyr: [GEO.pyr, M.hilt], cxTulipA: [GEO.ball, M.blade], cxTulipB: [GEO.ball, M.blade],
      th0: [GEO.cone, M.ink], th1: [GEO.cone, M.ink], th2: [GEO.cone, M.ink], th3: [GEO.cone, M.ink], th4: [GEO.cone, M.ink], th5: [GEO.cone, M.ink],
      bmA: [GEO.ball, M.blade], bmB: [GEO.ball, M.blade], bmE: [GEO.ball, M.blade],
      th6: [GEO.cone, M.ink], th7: [GEO.cone, M.ink], th8: [GEO.cone, M.ink], th9: [GEO.cone, M.ink], cxRic: [GEO.seg, M.grip], mcBall: [GEO.ball, M.blade], mcTop: [GEO.cone, M.blade],
      mcF0: [GEO.ball, M.blade], mcF1: [GEO.ball, M.blade], mcF2: [GEO.ball, M.blade], mcF3: [GEO.ball, M.blade], mcF4: [GEO.ball, M.blade], mcF5: [GEO.ball, M.blade], mcF6: [GEO.ball, M.blade], mcF7: [GEO.ball, M.blade],
      mcS0: [GEO.cone, M.blade], mcS1: [GEO.cone, M.blade], mcS2: [GEO.cone, M.blade], mcS3: [GEO.cone, M.blade], mcS4: [GEO.cone, M.blade], mcS5: [GEO.cone, M.blade], mcS6: [GEO.cone, M.blade], mcS7: [GEO.cone, M.blade],
      axHead: [GEO.ball, M.blade], axBeard: [GEO.ball, M.blade], axBack: [GEO.ball, M.blade], axFan: [GEO.cone, M.blade], axFan2: [GEO.cone, M.blade], axBit2: [GEO.ball, M.blade], axSpike: [GEO.cone, M.blade],
      axHook: [GEO.cone, M.blade], axSocket: [GEO.seg, M.hilt], axLangets: [GEO.seg, M.hilt],
      axBeak: [GEO.seg, M.blade], axP0: [GEO.cone, M.blade], axP1: [GEO.cone, M.blade], axP2: [GEO.cone, M.blade], axP3: [GEO.cone, M.blade] };
    for (const [k, [g, m]] of Object.entries(CX)) { add(k, g, m, OUTLINE_THIN); P[k].visible = false; }
    // Armoury hats (look.hatType): generic shapes placed differently per hat
    const HX = { hxBrim: [GEO.disc, M.hat], hxDome: [GEO.dome, M.hat], hxFrust: [GEO.frust, M.hat], hxFrustUp: [GEO.frustUp, M.hat],
      hxTri: [GEO.tri, M.hat], hxCyl: [GEO.seg, M.hat], hxBall: [GEO.ball, M.hat], hxBall2: [GEO.ball, M.hat2],
      hxTorus: [GEO.torus, M.hat], hxTorus2: [GEO.torus, M.hat], hxBand: [GEO.seg, M.hat2], hxFeather1: [GEO.ball, M.plume],
      hxFeather2: [GEO.ball, M.hat2], hxTail: [GEO.seg, M.hat2], hxCone: [GEO.cone, M.hat] };
    // French hood: a row of gold billiment beads and a white pleated crepine framing the face, and a hanging black veil
    for (let i = 0; i < 9; i++) { HX["frB" + i] = [GEO.ball, M.hat2]; HX["frC" + i] = [GEO.ball, M.plume]; }
    HX.hxVeil = [GEO.ball, M.hat];
    for (const [k, [g, m]] of Object.entries(HX)) { add(k, g, m, k.startsWith("fr") ? null : OUTLINE_THIN); P[k].visible = false; }
    const HAT_PARTS = {
      beret: ["hxBrim", "hxBall", "hxFeather1", "hxFeather2"], kettle: ["hxDome", "hxFrust"], morion: ["hxDome", "hxBall", "hxFrustUp"],
      tricorne: ["hxBall", "hxTri"], bicorne: ["hxBall", "hxBall2"], tophat: ["hxBrim", "hxCyl", "hxBand"],
      busby: ["hxCyl", "hxTail", "hxFeather1"], jingasa: ["hxCone", "hxBall2"], turban: ["hxTorus", "hxTorus2", "hxBall2"], coif: ["hxBall"],
      fez: ["hxFrust", "hxBrim", "hxTail"], kufi: ["hxDome"], tagelmust: ["hxTorus", "hxTorus2", "hxBall", "hxBall2"], salakot: ["hxCone", "hxBall2"],
      hennin: ["hxCone", "hxFeather1", "hxBand"],
      frogrivets: [0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => "frB" + i),
      imperial: ["hxCyl", "hxBall2", "hxTorus", "hxTorus2", "hxBall", "hxFeather1", "frC0", ...[0, 1, 2, 3, 4, 5, 6, 7].flatMap((i) => ["frB" + i, "frC" + (i + 1)])], frenchhood: ["hxBall", "hxVeil", ...[0, 1, 2, 3, 4, 5, 6, 7, 8].flatMap((i) => ["frB" + i, "frC" + i])], veil: ["hxBall", "hxBall2"],
    };
    let custom = null; // the Armoury sword, if any (setSword)

    let look = { style: "fiore", bulk: 1 }, viewYaw = 22, w = 0, h = 0;
    let camZoom = 1, camPan = 0; // Armoury: zoom in on the framed guard, and move the view up or down (m)
    const armNear = new T.Color(0xf1e9da), armFar = new T.Color(0xd9cfbd);
    const fig = { pose: Object.assign({}, REST), _raf: 0, renderer, canvas: renderer.domElement, scene, camera, parts: P }; // scene/camera: used by the stance editor

    // Auto-framing: the camera centres on, and zooms to, the extent of the current guard
    // (body, sword tip and pommel), so every pose fills the frame from any angle.
    let fitPts = null;
    function framePose(p) {
      const s = solve(p, custom), tip = s.H.clone().addScaledVector(s.d, s.sw.blade), pom = s.H.clone().addScaledVector(s.d, -s.sw.grip);
      fitPts = [s.head.clone().addScaledVector(UP, Math.max(0.16, look.hatTop || 0)), tip, pom, s.handR, s.handL, s.armR.joint, s.armL.joint,
                s.shR, s.shL, s.legL.end, s.legR.end, s.legL.joint, s.legR.joint,
                s.legL.end.clone().addScaledVector(s.toeL, 0.2).setY(0), s.legR.end.clone().addScaledVector(s.toeR, 0.2).setY(0)];
      if (s.bFace) for (const v of [V(0, 1, 0), V(0, -1, 0), V(0, 0, 1), V(0, 0, -1)]) fitPts.push(s.handL.clone().addScaledVector(v, BUCKLER_R));
      if (focus === "head") { const top = Math.max(0.16, look.hatTop || 0) + 0.02, wide = look.hatType === "bicorne" || look.hatType === "jingasa" ? 0.25 : 0.19;
        fitPts = [V(0, -0.16, 0), V(0, top, 0), V(wide, 0, 0), V(-wide, 0, 0), V(0, 0, wide), V(0, 0, -wide)].map((v) => s.head.clone().add(v)); }
      if (focus === "waist") fitPts = [V(0.3, 0, 0), V(-0.3, 0, 0), V(0, 0.32, 0), V(0, -0.3, 0), V(0, 0, 0.3), V(0, 0, -0.3)].map((v) => s.waist.clone().add(v));
      if (focus === "hilt") fitPts = [V(0.13, 0, 0), V(-0.13, 0, 0), V(0, 0.13, 0), V(0, -0.13, 0), V(0, 0, 0.13), V(0, 0, -0.13)]
        .map((v) => s.H.clone().addScaledVector(s.d, -s.sw.grip * 0.4).add(v)); // (test pictures of a hilt)
    }
    function setCamera() {
      const dist = 6.0, yaw = viewYaw * DEG;
      const pts = fitPts || [V(-0.6, 0, 0), V(1.2, 2.6, 0)];
      const box = new T.Box3().setFromPoints(pts), target = box.getCenter(V(0, 0, 0));
      target.y += camPan;
      camera.position.set(target.x + Math.sin(yaw) * dist, target.y + 0.3, target.z + Math.cos(yaw) * dist);
      camera.lookAt(target);
      sun.position.copy(camera.position).add(V(1.5, 3, 0)); // light from the viewer's side, so left-side guards aren't in shadow
      camera.aspect = w && h ? w / h : 1;
      camera.updateMatrixWorld();
      let tx = 0, ty = 0;
      for (const p of pts) {
        const v = p.clone().applyMatrix4(camera.matrixWorldInverse);
        tx = Math.max(tx, Math.abs(v.x / -v.z)); ty = Math.max(ty, Math.abs(v.y / -v.z));
      }
      const tanV = Math.max(ty, tx / camera.aspect) * 1.12; // small margin
      camera.fov = 2 * Math.atan(tanV / camZoom) / DEG;
      camera.updateProjectionMatrix();
    }
    function resize() {
      const r = container.getBoundingClientRect();
      const nw = Math.round(opts.size ? opts.size[0] : r.width), nh = Math.round(opts.size ? opts.size[1] : r.height);
      if (nw && nh && (nw !== w || nh !== h)) { w = nw; h = nh; renderer.setSize(w, h, false); setCamera(); }
    }
    fig.render = () => { resize(); if (w && h) renderer.render(scene, camera); };
    if (!opts.renderer && window.ResizeObserver) new ResizeObserver(() => fig.render()).observe(container);

    fig.setZoom = (z, pan = 0) => { camZoom = z; camPan = pan; setCamera(); fig.set(fig.pose, { frame: false }); };
    fig.setView = (yawDeg) => { viewYaw = yawDeg; setCamera(); fig.set(fig.pose, { frame: false }); };
    fig.setAccent = (c) => { M.belt.color.set(c); fig.render(); };
    fig.setLook = (lk) => {
      look = lk;
      const meyer = lk.style === "meyer";
      M.jacket.color.set(lk.jacket);
      // sleeves: the arm farther from the viewer is drawn darker (like the hatched far limbs in the plates),
      // so crossed arms (Schlüssel, Ochs, Schrankhut) read as two separate arms
      // (Armoury garb may give the sleeves their own colour: lk.arms, e.g. bare arms with the braies)
      const sleeve = lk.arms || lk.jacket;
      armNear.set(sleeve); armFar.set(sleeve).lerp(new T.Color(INK), 0.38);
      // Hutton: a striped jersey — the stripes are a texture on the jacket and sleeves (white base colour so the
      // texture shows true; the far sleeve is still shaded darker). lk.stripesAcross: bands round the body on the
      // jacket only (hussar frogging, gambeson quilting)
      const across = !!lk.stripesAcross;
      for (const mk of ["jacket", "armL", "armR"]) {
        if (M[mk].map) { M[mk].map.dispose(); M[mk].map = null; }
        if (lk.stripes && (!across || mk === "jacket")) {
          M[mk].map = stripes(lk.stripes[0], lk.stripes[1], across, lk.stripesSparse);
          if (across) M[mk].map.repeat.set(1, lk.stripeRows || 2.5); else M[mk].map.repeat.set(mk === "jacket" ? 3 : 1.5, 1);
        } else if (lk.dots && (mk === "jacket" || !lk.dotsJacketOnly)) {
          // mail (rings) or a brigandine's rivets
          M[mk].map = dots(lk.dots[0], lk.dots[1], lk.dots[2]); M[mk].map.repeat.set(mk === "jacket" ? 6 : 3, mk === "jacket" ? 5 : 4);
        }
        M[mk].needsUpdate = true;
      }
      if (lk.stripes) { M.jacket.color.set("#ffffff"); if (!across) { armNear.set("#ffffff"); armFar.set("#ffffff").lerp(new T.Color(INK), 0.38); } }
      else if (lk.dots) { M.jacket.color.set("#ffffff"); if (!lk.dotsJacketOnly) { armNear.set("#ffffff"); armFar.set("#ffffff").lerp(new T.Color(INK), 0.38); } }
      // skirt cloth of its own (hakama, kilt, robe); else the skirt is part of the jacket. Braies: linen hips, no skirt
      if (M.skirt.map) { M.skirt.map.dispose(); M.skirt.map = null; }
      M.skirt.color.set(lk.skirtStripes || lk.skirtDots ? "#ffffff" : lk.skirtColor || lk.jacket);
      if (lk.skirtStripes) { M.skirt.map = stripes(lk.skirtStripes[0], lk.skirtStripes[1], lk.skirtAcross); M.skirt.map.repeat.set(lk.skirtAcross ? 1 : 6, lk.skirtAcross ? 2 : 1); }
      else if (lk.skirtDots) { M.skirt.map = dots(lk.skirtDots[0], lk.skirtDots[1], lk.skirtDots[2]); M.skirt.map.repeat.set(8, 3); }
      M.skirt.needsUpdate = true;
      const ownSkirt = !!(lk.skirtColor || lk.skirtStripes || lk.skirtDots);
      setFill(P.skirt, ownSkirt ? M.skirt : M.jacket);
      setFill(P.hips, lk.braies ? M.braies : ownSkirt ? M.skirt : M.jacket);
      setFill(P.puffL, lk.braies ? M.braies : M.thighL); setFill(P.puffR, lk.braies ? M.braies : M.thighR);
      P.belt.visible = !lk.noBelt;
      for (const k of ["thighL", "thighR"]) {
        if (M[k].map) { M[k].map.dispose(); M[k].map = null; }
        M[k].color.set(meyer ? "#ffffff" : lk.thigh);
        if (meyer) M[k].map = stripes(lk.thigh, lk.jacket);
        M[k].needsUpdate = true;
      }
      M.shin.color.set(lk.shin); M.shoe.color.set(lk.shoe || lk.shin); M.hair.color.set(lk.hair);
      P.puffL.visible = P.puffR.visible = lk.braies || (lk.puffs != null ? !!lk.puffs : meyer || lk.style === "fabris"); // Meyer's pluderhosen; Fabris-era Venetian breeches
      P.beard.visible = lk.beard > 0; P.ruff.visible = !!lk.ruff;
      P.mustL.visible = P.mustR.visible = !!lk.mustache;
      P.cap.visible = P.capTop.visible = !!lk.cap;
      P.crown.visible = !!lk.crown; for (let i = 0; i < 5; i++) P["spike" + i].visible = !!lk.crown;
      for (const k of ["chapRoll", "chapTop", "chapPatte", "chapTail"]) P[k].visible = !!lk.chaperone;
      M.chap.color.set(lk.chapColor || "#7e2620");
      P.garter.visible = !!lk.garter;
      P.hood.visible = P.hoodCape.visible = P.hoodTip.visible = !!lk.hood;
      P.tonsure.visible = !!lk.tonsure;
      P.hatBrim.visible = P.hatCrown.visible = P.plume.visible = !!lk.hat;
      if (lk.hat) { M.hat.color.set(lk.hatColor || "#2b2522"); M.plume.color.set(lk.plumeColor || "#f6f1e6"); }
      P.wigL.visible = P.wigR.visible = P.wigB.visible = !!lk.wig; P.cravat.visible = !!lk.cravat;
      const hp = HAT_PARTS[lk.hatType] || [];
      for (const k of Object.keys(HX)) P[k].visible = hp.includes(k);
      if (hp.length || lk.helm) { M.hat.color.set(lk.hatColor || "#2b2522"); M.hat2.color.set(lk.hatTrim || "#a3261d"); M.plume.color.set(lk.plumeColor || "#f6f1e6"); }
      kitLook(lk);
      fig.set(fig.pose);
    };
    // Armoury sword drawn in place of the guard's weapon (null = the guard's own). spec: blade, grip (m), w/t (blade width /
    // thickness factors), shape taper|parallel|acute, curve (m), cross (half length), crossStyle straight|droop|flare|disc|none,
    // pommel (radius), pommelStyle ball|nut|wheel|scent|pear|fishtail|cap|eagle, ring, ring2, bow, bars, cup, shells, schilt,
    // band (inscription), forte (colichemarde), bazooka; bladeColor, hiltColor, gripColor; handB (left hand from the cross)
    fig.setSword = (spec) => {
      custom = spec || null;
      M.blade.color.set((spec && spec.bladeColor) || 0xd9d6cf);
      // a laser sword's blade glows: unshaded, full colour
      if (!M.glow) M.glow = new T.MeshBasicMaterial({ color: 0xffffff });
      const laser = !!(spec && spec.laser);
      if (laser) M.glow.color.set(spec.bladeColor || 0x5fb4ff);
      for (let i = 0; i < BSEGS; i++) setFill(P["bs" + i], laser ? M.glow : M.blade);
      M.hilt.color.set((spec && spec.hiltColor) || 0x5e5a52);
      if (M.hilt.map) { M.hilt.map.dispose(); M.hilt.map = null; }
      // a twisted blade: the spiral flutes run all down the blade
      if (M.blade.map) { M.blade.map.dispose(); M.blade.map = null; }
      if (spec && spec.twistBlade && !spec.twist) { const bc = new T.Color(spec.bladeColor || 0xd9d6cf), dk = bc.clone().lerp(new T.Color(INK), 0.5);
        M.blade.map = twisted("#" + bc.getHexString(), "#" + dk.getHexString()); M.blade.map.repeat.set(1, 6); M.blade.color.set(0xffffff); }
      M.blade.needsUpdate = true;
      if (spec && spec.writhen) { const hc = new T.Color(spec.hiltColor || 0x5e5a52), lt = hc.clone().lerp(new T.Color(0xffffff), 0.45), dk = hc.clone().lerp(new T.Color(INK), 0.75);
        M.hilt.map = twisted("#" + lt.getHexString(), "#" + dk.getHexString()); M.hilt.color.set(0xffffff); }
      M.hilt.needsUpdate = true;
      M.grip.color.set((spec && spec.gripColor) || 0x5a3a22);
      fig.set(fig.pose);
    };
    // the camera can be told to frame only the head (Armoury hat pictures); null = the whole guard
    let focus = null;
    fig.setFocus = (f) => { focus = f; fig.set(fig.pose); };

    // ---------- Armoury kit: hair styles, facial hair, eyewear, build, helms, plate detail, belts, daggers, bucklers ----------
    Object.assign(M, { beard: toon(0x3b2a1d), armour: toon(0x9a9c99), sheath: toon(0x3a2618), dgGrip: toon(0x5a3a22), dgMetal: toon(0x9a9c99),
      lens: toon(0x2b3440), beltX: toon(0x5a3a22) });
    setFill(P.beard, M.beard); setFill(P.mustL, M.beard); setFill(P.mustR, M.beard);
    const KIT = {};
    const kadd = (k, geo, mat, ol = OUTLINE_THIN) => { add(k, geo, mat, ol); P[k].visible = false; KIT[k] = 1; };
    // hair and facial hair
    for (const k of ["hrBun", "hrTop", "hrAfro"]) kadd(k, GEO.ball, M.hair);
    for (const k of ["hrTail", "hrPlaitL", "hrPlaitR", "hrLoc0", "hrLoc1", "hrLoc2", "hrLoc3", "hrLoc4", "hrLoc5"]) kadd(k, GEO.seg, M.hair);
    for (const k of ["fhGoatee", "fhChopL", "fhChopR", "fhForkL", "fhForkR", "fhBarL", "fhBarR"]) kadd(k, GEO.ball, M.beard, null);
    // eyewear
    kadd("glRimL", GEO.rim, M.ink, null); kadd("glRimR", GEO.rim, M.ink, null); kadd("glLensL", GEO.disc, M.lens, null); kadd("glLensR", GEO.disc, M.lens, null);
    kadd("glBridge", GEO.seg, M.ink, null); kadd("glArmL", GEO.seg, M.ink, null); kadd("glArmR", GEO.seg, M.ink, null); kadd("glChain", GEO.seg, M.gold, null);
    kadd("patch", GEO.disc, M.ink); kadd("patchStrap", GEO.seg, M.ink, null);
    // feminine build
    kadd("bustL", GEO.ball, M.jacket); kadd("bustR", GEO.ball, M.jacket); kadd("breastBand", GEO.ball, M.braies);
    // helms
    for (const k of ["hmShell", "hmTail", "hmVisor", "hmComb", "hmPeak", "hmCheekL", "hmCheekR", "hmBrowL", "hmBrowR", "hmMustL", "hmMustR"]) kadd(k, GEO.ball, M.hat);
    kadd("hmDome", GEO.dome, M.hat); kadd("hmSnout", GEO.cone, M.hat); kadd("hmNose", GEO.cone, M.hat); kadd("hmCyl", GEO.seg, M.hat);
    kadd("hmTop", GEO.disc, M.hat); kadd("hmRondel", GEO.disc, M.hat); kadd("hmNeck", GEO.frust, M.hat);
    kadd("hmFace", GEO.ball, M.hat2); kadd("hmCross", GEO.ball, M.hat2); kadd("hmRimL", GEO.rim, M.hat2); kadd("hmRimR", GEO.rim, M.hat2);
    kadd("hmHornL", GEO.torus, M.hat); kadd("hmHornR", GEO.torus, M.hat); kadd("hmKuwaL", GEO.seg, M.gold); kadd("hmKuwaR", GEO.seg, M.gold);
    for (const k of ["hmSlit", "hmSlit2", "hmEyeL", "hmEyeR", "hmMouth"]) kadd(k, GEO.ball, M.ink, null);
    for (let i = 0; i < 6; i++) kadd("hmDot" + i, GEO.ball, M.ink, null); // breaths (air holes) and rivets
    kadd("hmBand", GEO.ball, M.hat2); kadd("hmHornL2", GEO.torus, M.hat); kadd("hmHornR2", GEO.torus, M.hat);
    const HELM_PARTS = {
      sallet: ["hmShell", "hmTail", "hmSlit", "hmVisor", "hmComb", "hmDot0", "hmDot1", "hmNeck"],
      armet: ["hmShell", "hmSnout", "hmVisor", "hmSlit", "hmRondel", "hmComb", "hmDot0", "hmDot1", "hmDot2", "hmDot3", "hmNeck"],
      hounskull: ["hmShell", "hmSnout", "hmEyeL", "hmEyeR", "hmNeck", "hmComb", "hmDot0", "hmDot1", "hmDot2", "hmDot3"],
      greathelm: ["hmCyl", "hmTop", "hmSlit", "hmSlit2", "hmCross", "hmBand", "hmDot0", "hmDot1", "hmDot2", "hmDot3", "hmDot4", "hmDot5"],
      barbute: ["hmShell", "hmSlit", "hmSlit2", "hmComb", "hmDot0", "hmDot1", "hmNeck"],
      closehelm: ["hmShell", "hmComb", "hmBand", "hmSnout", "hmSlit", "hmVisor", "hmNeck", "hmDot0", "hmDot1", "hmDot2", "hmDot3", "hmDot4", "hmDot5"], burgonet: ["hmDome", "hmComb", "hmPeak", "hmCheekL", "hmCheekR", "hmTail"],
      kabuto: ["hmDome", "hmNeck", "hmKuwaL", "hmKuwaR", "hmPeak"],
      horned: ["hmShell", "hmFace", "hmRimL", "hmRimR", "hmNose", "hmMustL", "hmMustR", "hmHornL", "hmHornR", "hmHornL2", "hmHornR2", "hmEyeL", "hmEyeR", "hmMouth", "hmComb", "hmNeck"],
      grotesque: ["hmShell", "hmFace", "hmNose", "hmBrowL", "hmBrowR", "hmMustL", "hmMustR", "hmEyeL", "hmEyeR", "hmMouth", "hmComb", "hmNeck"],
      frogmouth: ["hmShell", "hmSnout", "hmVisor", "hmSlit", "hmNeck", "hmDot0", "hmDot1", "hmDot2", "hmDot3"],
      armetwrap: ["hmShell", "hmSnout", "hmVisor", "hmSlit", "hmRondel", "hmComb", "hmBand", "hmNeck", "hmDot0", "hmDot1", "hmDot2", "hmDot3"],
      bigfoot: ["hmShell", "hmFace", "hmNose", "hmBrowL", "hmBrowR", "hmEyeL", "hmEyeR", "hmMouth", "hmNeck"],
      oni: ["hmDome", "hmNeck", "hmFace", "hmKuwaL", "hmKuwaR", "hmEyeL", "hmEyeR", "hmMouth", "hmBrowL", "hmBrowR"],
    };
    // plate armour detail (couters and poleyns carry a fan-shaped wing on the outside of the joint)
    kadd("arGorget", GEO.torus, M.armour); kadd("arRidge", GEO.ball, M.armour);
    for (const s of ["L", "R"]) {
      kadd("arPauld" + s, GEO.ball, M.armour); kadd("arLame" + s, GEO.ball, M.armour); kadd("arSode" + s, GEO.ball, M.armour);
      kadd("arCouter" + s, GEO.ball, M.armour); kadd("arWing" + s, GEO.ball, M.armour); kadd("arPoleyn" + s, GEO.ball, M.armour);
      kadd("arPWing" + s, GEO.ball, M.armour); kadd("arCuff" + s, GEO.cone, M.armour); kadd("arTasset" + s, GEO.ball, M.armour);
    }
    // belts and sashes
    kadd("buckle", GEO.ball, M.gold); kadd("beltKnot", GEO.ball, M.beltX); kadd("beltTail1", GEO.seg, M.beltX); kadd("beltTail2", GEO.seg, M.beltX);
    kadd("baldric", GEO.torus, M.beltX); kadd("hanger", GEO.seg, M.beltX);
    // a sheathed dagger at the left hip
    kadd("dgSheath", GEO.cone, M.sheath); kadd("dgSheath2", GEO.cone, M.sheath); kadd("dgTop", GEO.ball, M.sheath); kadd("dgGrip", GEO.seg, M.dgGrip);
    kadd("dgGuard", GEO.seg, M.dgMetal); kadd("dgDisc", GEO.disc, M.dgMetal); kadd("dgBallL", GEO.ball, M.dgGrip); kadd("dgBallR", GEO.ball, M.dgGrip);
    kadd("dgShell", GEO.dome, M.dgMetal); kadd("dgPommel", GEO.ball, M.dgMetal); kadd("dgPDisc", GEO.disc, M.dgMetal); kadd("dgPBar", GEO.seg, M.dgMetal);
    // buckler extras (domed body, spike, inner ring, studs)
    kadd("bkDome", GEO.dome, M.wood); kadd("bkSpike", GEO.cone, M.iron); kadd("bkRing2", GEO.rim, M.iron, null);
    for (let i = 0; i < 4; i++) kadd("bkStud" + i, GEO.ball, M.iron, null);
    const BK_EXTRA = ["bkDome", "bkSpike", "bkRing2", "bkStud0", "bkStud1", "bkStud2", "bkStud3"];

    // visibility and colours for the kit, from the look (called at the end of setLook)
    function kitLook(lk) {
      for (const k of Object.keys(KIT)) if (!BK_EXTRA.includes(k)) P[k].visible = false;
      M.skin.color.set(lk.skin || 0xf0d9b8);
      M.beard.color.set(lk.beardColor || lk.hair || "#3b2a1d");
      const helm = HELM_PARTS[lk.helm], hatOn = !!(lk.hat || lk.hatType || lk.chaperone || lk.cap || lk.crown || helm), hs = lk.hairStyle || "short";
      // hair
      P.hair.visible = !helm && hs !== "bald" && !(hs === "afro" && !hatOn);
      if (lk.hatType === "veil") { P.hair.visible = false; P.wigL.visible = P.wigR.visible = P.wigB.visible = false; } // a wimple and veil cover the hair
      if (helm) { P.wigL.visible = P.wigR.visible = P.wigB.visible = false; P.tonsure.visible = false; }
      if (!helm) {
        P.hrBun.visible = hs === "bun" && !hatOn; P.hrTop.visible = hs === "topknot" && !hatOn; P.hrAfro.visible = hs === "afro" && !hatOn;
        const veiled = lk.hatType === "veil";
        P.hrTail.visible = hs === "ponytail" && !veiled; P.hrPlaitL.visible = P.hrPlaitR.visible = hs === "braids" && !veiled;
        for (let i = 0; i < 6; i++) P["hrLoc" + i].visible = hs === "locs" && !veiled;
      }
      // face: a closed helm hides it
      const face = !lk.faceHidden;
      P.nose.visible = P.eyeL.visible = P.eyeR.visible = face;
      // inside a closed helm the head and neck are drawn in shadow, so no skin shows through the sights and gaps
      setFill(P.head, face ? M.skin : M.ink); setFill(P.neck, face ? M.skin : M.ink);
      if (!face) { P.beard.visible = P.mustL.visible = P.mustR.visible = false; }
      if (face) {
        P.fhGoatee.visible = !!lk.goatee; P.fhChopL.visible = P.fhChopR.visible = !!lk.chops;
        P.fhForkL.visible = P.fhForkR.visible = !!lk.forked; P.fhBarL.visible = P.fhBarR.visible = !!lk.handlebar;
        if (lk.handlebar) P.mustL.visible = P.mustR.visible = false;
        const ew = lk.eyewear;
        if (ew === "spectacles" || ew === "tinted" || ew === "pincenez") {
          P.glRimL.visible = P.glRimR.visible = P.glBridge.visible = true;
          P.glArmL.visible = P.glArmR.visible = ew !== "pincenez";
          P.glLensL.visible = P.glLensR.visible = ew === "tinted";
        } else if (ew === "monocle") { P.glRimR.visible = P.glChain.visible = true; }
        else if (ew === "patch") { P.patch.visible = P.patchStrap.visible = true; }
        setFill(P.glRimL, ew === "pincenez" ? M.gold : M.ink); setFill(P.glRimR, ew === "pincenez" || ew === "monocle" ? M.gold : M.ink);
      }
      P.bustL.visible = P.bustR.visible = !!lk.fem && !lk.noBust; // no shaped breastplates: armour over the chest is plain
      // a bare-chested slender fencer wears a linen breast band (after the 1400s Lengberg Castle finds)
      P.breastBand.visible = !!(lk.fem && lk.breastband); setFill(P.bustL, lk.breastband ? M.braies : M.jacket); setFill(P.bustR, lk.breastband ? M.braies : M.jacket);
      if (helm) for (const k of helm) P[k].visible = true;
      setFill(P.hmFace, lk.helm === "oni" || lk.helm === "bigfoot" ? M.hat2 : M.hat); // a steel face plate, except the oni's red lacquer mask and Bigfoot's leathery face
      setFill(P.hmNose, lk.helm === "bigfoot" ? M.hat2 : M.hat);
      // plate armour detail
      const ap = lk.armourParts || {};
      M.armour.color.set(lk.armourColor || "#9a9c99");
      P.arGorget.visible = !!ap.gorget; P.arRidge.visible = !!ap.ridge;
      for (const s of ["L", "R"]) {
        P["arPauld" + s].visible = P["arLame" + s].visible = ap.pauld === "round" || ap.pauld === "milanese";
        P["arSode" + s].visible = ap.pauld === "sode";
        P["arCouter" + s].visible = !!ap.couter; P["arWing" + s].visible = ap.couter > 0.01;
        P["arPoleyn" + s].visible = !!ap.poleyn; P["arPWing" + s].visible = ap.poleyn > 0.01;
        P["arCuff" + s].visible = !!ap.cuffs; P["arTasset" + s].visible = !!ap.tassets;
        setFill(P["hand" + s], ap.cuffs || ap.fur ? M.armour : M.skin);
      }
      // belt / sash
      const bt = lk.beltType;
      setFill(P.belt, bt ? M.beltX : M.belt);
      if (bt) {
        M.beltX.color.set(lk.beltColor || "#5a3a22");
        P.belt.visible = true;
        P.buckle.visible = bt === "belt" || bt === "swordbelt" || bt === "baldric";
        P.beltKnot.visible = bt === "sash" || bt === "obi" || bt === "rope";
        P.beltTail1.visible = P.beltTail2.visible = bt === "sash" || bt === "rope";
        P.baldric.visible = bt === "baldric"; P.hanger.visible = bt === "swordbelt";
      }
      // dagger
      const dg = lk.dagger;
      if (dg) {
        M.sheath.color.set(dg.sheath || "#3a2618"); M.dgGrip.color.set(dg.gripC || "#5a3a22"); M.dgMetal.color.set(dg.metal || "#9a9c99");
        P.dgSheath.visible = P.dgGrip.visible = true; P.dgSheath2.visible = !!dg.jcurve; P.dgTop.visible = !!dg.top;
        P.dgGuard.visible = dg.guard === "cross" || dg.guard === "bar" || dg.guard === "shell";
        P.dgDisc.visible = dg.guard === "disc"; P.dgBallL.visible = P.dgBallR.visible = dg.guard === "balls"; P.dgShell.visible = dg.guard === "shell";
        P.dgPommel.visible = dg.pommel === "ball" || dg.pommel === "cap"; P.dgPDisc.visible = dg.pommel === "disc"; P.dgPBar.visible = dg.pommel === "bar";
      }
      // buckler colours (shapes are placed in set, by the pose)
      const bs = lk.buckler;
      M.wood.color.set(bs ? bs.board : 0xb8925a); M.iron.color.set(bs ? bs.metal : 0x5e5a52);
      // bonnet colour
      setFill(P.cap, lk.cap && lk.capColor ? M.hat : M.ink); setFill(P.capTop, lk.cap && lk.capColor ? M.hat : M.ink);
      if (lk.cap && lk.capColor) M.hat.color.set(lk.capColor);
    }

    // place the kit on the solved body (called from set)
    function placeKit(s, at, hU, side, hq, chestBase) {
      const lk = look, L = s.look;
      const qChest = new T.Quaternion().setFromRotationMatrix(new T.Matrix4().makeBasis(s.fwd, s.spine, s.right));
      const qHip = new T.Quaternion().setFromRotationMatrix(new T.Matrix4().makeBasis(s.hipFwd, UP, s.hipRight));
      const qFace = new T.Quaternion().setFromRotationMatrix(new T.Matrix4().makeBasis(side.clone().negate(), hU, L)); // rings facing forward
      const hf = (o, origin, sx, sy, sz) => frame(o, origin, L, hU, side, sx, sy, sz);
      const sideRot = (q, a) => q.clone().multiply(new T.Quaternion().setFromAxisAngle(V(1, 0, 0), a));
      // hair
      const hs = lk.hairStyle || "short";
      if (hs === "cropped" && !lk.helm && !(lk.hat || lk.hatType)) ball(P.hair, at(-0.025, 0.02), 0.1, 0.1, 0.099, hq);
      if (P.hrBun.visible) ball(P.hrBun, at(-0.1, 0.07), 0.045, 0.042, 0.05, hq);
      if (P.hrTop.visible) ball(P.hrTop, at(-0.04, 0.125), 0.03, 0.035, 0.026, hq);
      if (P.hrAfro.visible) ball(P.hrAfro, at(-0.05, 0.05), 0.125, 0.135, 0.138, hq);
      if (P.hrTail.visible) seg(P.hrTail, at(-0.1, 0.02), at(-0.18, -0.2), 0.024);
      if (P.hrPlaitL.visible) for (const [k, sg] of [["hrPlaitL", -1], ["hrPlaitR", 1]])
        seg(P[k], at(-0.03, -0.03, sg * 0.085), s.neck.clone().addScaledVector(s.fwd, 0.05).addScaledVector(s.right, sg * 0.12).addScaledVector(s.spine, -0.2), 0.017);
      if (P.hrLoc0.visible) for (let i = 0; i < 6; i++) {
        const a = -1.3 + i * 0.52, c = Math.cos(a), sn = Math.sin(a);
        seg(P["hrLoc" + i], at(-0.085 * c, 0.02, 0.085 * sn), at(-0.1 * c, -0.2, 0.105 * sn), 0.016);
      }
      // facial hair
      if (P.fhGoatee.visible) ball(P.fhGoatee, at(0.072, -0.095), 0.022, 0.032, 0.026, hq);
      if (P.fhChopL.visible) for (const [k, sg] of [["fhChopL", -1], ["fhChopR", 1]]) ball(P[k], at(0.02, -0.04, sg * 0.08), 0.035, 0.06, 0.02, hq);
      if (P.fhForkL.visible) for (const [k, sg] of [["fhForkL", -1], ["fhForkR", 1]]) ball(P[k], at(0.05, -0.125, sg * 0.022), 0.025, 0.05, 0.02, hq);
      if (P.fhBarL.visible) for (const [k, sg] of [["fhBarL", -1], ["fhBarR", 1]])
        ball(P[k], at(B.headR * 0.88, -0.028, sg * 0.04), 0.011, 0.009, 0.042, sideRot(hq, sg * -0.55));
      // eyewear
      const eye = (sg, f = 0.098) => at(f, 0.02, sg * 0.036);
      if (P.glRimR.visible) for (const [k, sg] of [["glRimL", -1], ["glRimR", 1]]) if (P[k].visible) {
        const r = lk.eyewear === "pincenez" ? 0.016 : 0.019;
        P[k].position.copy(eye(sg)); P[k].quaternion.copy(qFace); P[k].scale.set(r, r, 0.12);
      }
      if (P.glLensL.visible) for (const [k, sg] of [["glLensL", -1], ["glLensR", 1]]) {
        const c = eye(sg); seg(P[k], c.clone().addScaledVector(L, -0.002), c.clone().addScaledVector(L, 0.002), 0.018); }
      if (P.glBridge.visible) seg(P.glBridge, eye(-1).addScaledVector(side, 0.02), eye(1).addScaledVector(side, -0.02), 0.003);
      if (P.glArmL.visible) for (const [k, sg] of [["glArmL", -1], ["glArmR", 1]])
        seg(P[k], eye(sg).addScaledVector(side, sg * 0.022), at(-0.01, 0.025, sg * 0.093), 0.003);
      if (P.glChain.visible) seg(P.glChain, eye(1).addScaledVector(hU, -0.022), s.neck.clone().addScaledVector(s.fwd, 0.1).addScaledVector(s.right, 0.06).addScaledVector(s.spine, -0.12), 0.002);
      if (P.patch.visible) {
        const c = eye(-1, 0.095); seg(P.patch, c, c.clone().addScaledVector(L, 0.008), 0.026);
        seg(P.patchStrap, at(0.085, 0.03, -0.055), at(-0.03, 0.05, -0.098), 0.004); // the strap runs back over the left ear
      }
      // feminine build: the bust
      if (P.breastBand.visible) ball(P.breastBand, chestBase.clone().addScaledVector(s.spine, 0.24).addScaledVector(s.fwd, 0.01), 0.125, 0.06, 0.17, qChest);
      if (P.bustL.visible) for (const [k, sg] of [["bustL", -1], ["bustR", 1]])
        ball(P[k], chestBase.clone().addScaledVector(s.spine, 0.24).addScaledVector(s.fwd, 0.095).addScaledVector(s.right, sg * 0.062), 0.05, 0.05, 0.055, qChest);
      // helms
      const hm = lk.helm;
      if (hm) {
        const shell = (y = 0.012, sy = 0.132) => ball(P.hmShell, at(-0.008, y), 0.12, sy, 0.114, hq);
        const dome = () => hf(P.hmDome, at(0, 0.035), 0.112, 0.11, 0.108);
        const eyes = (f, y, w, sz = 0.016) => { for (const [k, sg] of [["hmEyeL", -1], ["hmEyeR", 1]]) ball(P[k], at(f, y, sg * w), 0.008, 0.011, sz, hq); };
        const kuwa = () => { for (const [k, sg] of [["hmKuwaL", -1], ["hmKuwaR", 1]]) seg(P[k], at(0.1, 0.08, sg * 0.02), at(0.13, 0.25, sg * 0.1), 0.008); };
        const neck = (y = 0.045, r = 0.17, h = 0.1, f = -0.01) => hf(P.hmNeck, at(f, y), r, h, r);
        const skull = (f = -0.02, y = 0.02, sx = 0.115, sy = 0.125, sz = 0.11) => ball(P.hmShell, at(f, y), sx, sy, sz, hq);
        const comb = (f = -0.025, y = 0.138, len = 0.1) => ball(P.hmComb, at(f, y), len, 0.026, 0.006, hq);
        const dot = (i, p, r = 0.0055) => ball(P["hmDot" + i], p, r, r, r * 0.6, hq);
        // tip a part about the head's side axis (+ = front up / back down)
        const tilt = (a) => hq.clone().multiply(new T.Quaternion().setFromAxisAngle(V(0, 0, 1), a));
        if (hm === "sallet") { // German sallet: a skull drawn down into a long swept tail, a sight cut across the brow, a bevor at the chin
          skull(-0.012, 0.025, 0.12, 0.122, 0.113); comb(-0.03, 0.14, 0.11); neck(-0.07, 0.13, 0.08);
          ball(P.hmTail, at(-0.125, -0.05), 0.1, 0.028, 0.118, tilt(0.42));
          ball(P.hmSlit, at(0.096, 0.035), 0.008, 0.0055, 0.082, hq);
          ball(P.hmVisor, at(-0.005, -0.068), 0.104, 0.072, 0.11, hq); // the bevor: a smooth chin piece, flush with the skull (no lump at the mouth)
          dot(0, at(0.07, 0.07, -0.07)); dot(1, at(0.07, 0.07, 0.07));
        } else if (hm === "armet") { // Italian armet: a sharp 'sparrow-beak' visor with a sight above it and breaths below, a rondel at the back
          skull(-0.01, 0.02, 0.12, 0.125, 0.112); comb(-0.02, 0.138, 0.1); neck(-0.075, 0.13, 0.08);
          seg(P.hmSnout, at(0.03, 0.008), at(0.165, -0.004), 0.082);
          ball(P.hmSlit, at(0.093, 0.055), 0.007, 0.006, 0.072, hq);
          ball(P.hmVisor, at(-0.005, -0.07), 0.104, 0.07, 0.11, hq); // the bevor, flush with the skull (no bulge at the mouth)
          for (let i = 0; i < 4; i++) dot(i, at(0.118 - i * 0.004, -0.008 - (i % 2) * 0.016, 0.026 + Math.floor(i / 2) * 0.012), 0.005);
          seg(P.hmRondel, at(-0.118, -0.05), at(-0.14, -0.05), 0.032);
        } else if (hm === "hounskull") { // the 'pig-faced' bascinet: a pointed skull and a long conical snout full of breaths
          skull(-0.015, 0.03, 0.115, 0.135, 0.11); comb(-0.02, 0.15, 0.09);
          seg(P.hmSnout, at(0.04, -0.012), at(0.23, -0.035), 0.075); eyes(0.104, 0.048, 0.042, 0.024);
          for (let i = 0; i < 4; i++) dot(i, at(0.13 + i * 0.018, -0.03 - i * 0.002, 0.03 - i * 0.004), 0.005);
          neck(-0.06, 0.15, 0.12);
        } else if (hm === "greathelm") { // flat-topped great helm: twin sights either side of a brass cross, breaths on the right
          seg(P.hmCyl, at(-0.005, -0.15), at(-0.005, 0.11), 0.128); seg(P.hmTop, at(-0.005, 0.11), at(-0.005, 0.124), 0.118);
          for (const [k, sg] of [["hmSlit", -1], ["hmSlit2", 1]]) ball(P[k], at(0.117, 0.032, sg * 0.045), 0.008, 0.006, 0.033, hq);
          ball(P.hmCross, at(0.124, -0.01), 0.005, 0.085, 0.011, hq); ball(P.hmBand, at(0.123, 0.012), 0.005, 0.009, 0.075, hq);
          for (let i = 0; i < 6; i++) { const sd = 0.045 + (i % 2) * 0.02, f = Math.sqrt(0.128 * 0.128 - sd * sd) - 0.003; dot(i, at(f, -0.05 - Math.floor(i / 2) * 0.022, sd)); }
        } else if (hm === "closehelm") { // close helmet (Greenwich style, 1500s): a high roped comb, a gilt band over the skull,
          // a pointed upper visor with the sight, a lower visor (the ventail) pierced with breaths, gorget plates at the neck
          skull(-0.012, 0.025, 0.12, 0.125, 0.113); neck(-0.075, 0.13, 0.08);
          ball(P.hmComb, at(-0.025, 0.148), 0.105, 0.042, 0.007, hq);
          ball(P.hmBand, at(-0.012, 0.025), 0.123, 0.128, 0.018, hq);
          seg(P.hmSnout, at(0.035, 0.03), at(0.15, 0.012), 0.07);
          ball(P.hmSlit, at(0.088, 0.066), 0.007, 0.0055, 0.07, hq);
          ball(P.hmVisor, at(-0.005, -0.064), 0.105, 0.074, 0.111, hq); // the lower visor, flush with the skull (no bulge at the mouth)
          for (let i = 0; i < 6; i++) dot(i, at(0.094 - (i % 3) * 0.006, -0.045 - (i % 3) * 0.014, 0.03 + Math.floor(i / 3) * 0.014), 0.0045);
        } else if (hm === "frogmouth") { // frog-mouthed jousting helm (Stechhelm, c. 1500), after a museum photograph:
          // a big crown shell, much wider than the head, ridged down the middle to a point at the front and edged with brass
          // rivets; under it the sight, a dark crescent gap; below that a narrower lower plate tapering down into the breastplate
          ball(P.hmShell, at(-0.045, 0.075), 0.13, 0.112, 0.152, tilt(-0.12));
          ball(P.hmComb, at(0.015, 0.16), 0.14, 0.035, 0.006, tilt(-0.3)); // the medial ridge, running forward to the prow
          // the crown narrows forward to a pointed prow: a flattened cone running forward out of the shell
          frame(P.hmSnout, at(-0.04, 0.058), side.clone().negate(), L, hU.clone().negate(), 0.148, 0.215, 0.095);
          ball(P.hmSlit, at(0.06, 0.012), 0.072, 0.026, 0.115, hq); // the sight
          ball(P.hmVisor, at(0.035, -0.07), 0.085, 0.065, 0.1, hq); // the lower plate: a close chin piece, as on an armet
          neck(-0.075, 0.13, 0.08); // a short collar at the neck
          for (let i = 0; i < 4; i++) dot(i, at(0.112, -0.055 - Math.floor(i / 2) * 0.02, 0.028 + (i % 2) * 0.014), 0.005); // breaths
        } else if (hm === "armetwrap") { // armet with a wrapper (Milanese, c. 1460–80): a small rounded visor, and over the
          // lower face a heavy wrapper plate strapped round the helm, pierced with breaths; a rondel at the back
          skull(-0.012, 0.03, 0.12, 0.13, 0.113); comb(-0.02, 0.152, 0.1); neck(-0.085, 0.14, 0.08);
          seg(P.hmSnout, at(0.04, 0.035), at(0.135, 0.032), 0.058);
          ball(P.hmSlit, at(0.092, 0.07), 0.007, 0.006, 0.07, hq);
          ball(P.hmVisor, at(0.0, -0.06), 0.11, 0.075, 0.118, hq); // the wrapper, close over the lower face (no bulge at the mouth)
          ball(P.hmBand, at(-0.02, -0.03), 0.122, 0.012, 0.118, hq); // the wrapper's strap round the back of the helm
          seg(P.hmRondel, at(-0.12, -0.05), at(-0.14, -0.05), 0.034);
          for (let i = 0; i < 4; i++) dot(i, at(0.104 - Math.floor(i / 2) * 0.006, -0.04 - (i % 2) * 0.018, 0.035 + Math.floor(i / 2) * 0.014), 0.0045);
        } else if (hm === "bigfoot") { // a Bigfoot mask: a shaggy head, a leathery face, heavy brows, a broad flat nose
          skull(-0.03, 0.03, 0.125, 0.14, 0.12); neck(-0.08, 0.15, 0.1);
          ball(P.hmFace, at(0.04, -0.02), 0.08, 0.095, 0.082, hq); eyes(0.112, 0.022, 0.033);
          for (const [k, sg] of [["hmBrowL", -1], ["hmBrowR", 1]]) ball(P[k], at(0.11, 0.05, sg * 0.032), 0.02, 0.016, 0.038, sideRot(hq, sg * 0.2));
          seg(P.hmNose, at(0.112, 0.0), at(0.135, -0.03), 0.028);
          ball(P.hmMouth, at(0.112, -0.065), 0.008, 0.009, 0.042, hq);
        } else if (hm === "barbute") { // barbute: a tall close skull with a Y-shaped face opening
          skull(-0.006, -0.005, 0.12, 0.15, 0.114); comb(-0.02, 0.143, 0.1); neck(-0.1, 0.13, 0.07);
          ball(P.hmSlit, at(0.106, -0.035), 0.012, 0.055, 0.024, hq); ball(P.hmSlit2, at(0.1, 0.03), 0.012, 0.022, 0.058, hq);
          dot(0, at(0.04, 0.0, -0.11)); dot(1, at(0.04, 0.0, 0.11));
        }
        else if (hm === "burgonet") { dome(); ball(P.hmComb, at(-0.01, 0.13), 0.1, 0.06, 0.008, hq); ball(P.hmPeak, at(0.1, 0.045), 0.06, 0.008, 0.1, hq);
          for (const [k, sg] of [["hmCheekL", -1], ["hmCheekR", 1]]) ball(P[k], at(0.03, -0.04, sg * 0.1), 0.06, 0.075, 0.012, hq);
          ball(P.hmTail, at(-0.1, 0), 0.06, 0.045, 0.11, hq); }
        else if (hm === "kabuto" || hm === "oni") { dome(); neck(0.04, 0.15, 0.09, -0.07); kuwa(); /* the shikoro (neck guard) sits back, clear of the eyes */ if (hm === "kabuto") ball(P.hmPeak, at(0.1, 0.05), 0.05, 0.006, 0.09, hq);
          else { ball(P.hmFace, at(0.06, -0.035), 0.072, 0.085, 0.086, hq); eyes(0.125, 0.025, 0.035); ball(P.hmMouth, at(0.125, -0.07), 0.008, 0.012, 0.045, hq);
            for (const [k, sg] of [["hmBrowL", -1], ["hmBrowR", 1]]) ball(P[k], at(0.118, 0.055, sg * 0.04), 0.015, 0.013, 0.035, sideRot(hq, sg * 0.4)); } }
        else if (hm === "horned" || hm === "grotesque") {
          skull(-0.015, 0.025, 0.118, 0.125, 0.112); comb(-0.03, 0.14, 0.1); neck(-0.08, 0.13, 0.08);
          ball(P.hmFace, at(0.045, -0.015), 0.078, 0.102, 0.09, hq); eyes(0.12, 0.03, 0.035);
          ball(P.hmMouth, at(0.116, -0.072), 0.007, 0.01, 0.04, hq);
          const big = hm === "grotesque";
          seg(P.hmNose, at(0.112, big ? 0.005 : 0), at(big ? 0.18 : 0.15, big ? -0.045 : -0.03), big ? 0.03 : 0.018);
          for (const [k, sg] of [["hmMustL", -1], ["hmMustR", 1]]) ball(P[k], at(0.122, -0.038, sg * (big ? 0.038 : 0.026)), 0.013, 0.011, big ? 0.042 : 0.03, sideRot(hq, sg * -0.5));
          if (big) { for (const [k, sg] of [["hmBrowL", -1], ["hmBrowR", 1]]) ball(P[k], at(0.118, 0.058, sg * 0.036), 0.016, 0.013, 0.036, sideRot(hq, sg * 0.35));
          }
          else {
            for (const [k, sg] of [["hmRimL", -1], ["hmRimR", 1]]) { P[k].position.copy(at(0.124, 0.03, sg * 0.035)); P[k].quaternion.copy(qFace); P[k].scale.set(0.024, 0.024, 0.4); }
            // ram's horns curling down beside the temples: a large and a small turn, so they read as a spiral
            // each coil is turned out from the head about 50°, so it shows as a curl from the front as well as the side
            for (const [k, k2, sg] of [["hmHornL", "hmHornL2", -1], ["hmHornR", "hmHornR2", 1]]) {
              const x = L.clone().multiplyScalar(Math.cos(0.9)).addScaledVector(side, sg * Math.sin(0.9)).normalize(), z = x.clone().cross(hU).normalize();
              frame(P[k], at(-0.025, 0.1, sg * 0.12), x, hU, z, 0.052, 0.052, 0.085);
              frame(P[k2], at(0.0, 0.075, sg * 0.15), x, hU, z, 0.026, 0.026, 0.07);
            }
          }
        }
      }
      // plate armour detail
      // a wing: a shallow fan-shaped plate, its face along n, standing a little proud of the joint (longer toward "along")
      const wing = (o, c, n, along, r) => { const a = along.clone().addScaledVector(n, -along.dot(n)).normalize(), b = n.clone().cross(a).normalize();
        o.position.copy(c); o.quaternion.setFromRotationMatrix(new T.Matrix4().makeBasis(a, b, n)); o.scale.set(r * 1.15, r * 0.85, 0.014); };
      const ap = lk.armourParts;
      if (ap) {
        if (ap.gorget) frame(P.arGorget, s.neck.clone().addScaledVector(s.spine, -0.035), s.fwd, s.right.clone().negate(), s.spine, 0.085, 0.085, 0.11);
        if (ap.ridge) ball(P.arRidge, chestBase.clone().addScaledVector(s.spine, 0.2).addScaledVector(s.fwd, 0.118), 0.012, 0.16, 0.01, qChest);
        for (const [k, sg] of [["L", -1], ["R", 1]]) {
          const sh = s["sh" + k], arm = s["arm" + k], out = s.right.clone().multiplyScalar(sg);
          const big = ap.pauld === "milanese" && k === "L" ? 1.3 : 1;
          if (P["arPauld" + k].visible) {
            ball(P["arPauld" + k], sh.clone().addScaledVector(out, 0.015).addScaledVector(s.spine, 0.02), 0.085 * big, 0.07 * big, 0.08 * big, qChest);
            ball(P["arLame" + k], sh.clone().addScaledVector(out, 0.03).addScaledVector(s.spine, -0.06), 0.07 * big, 0.04, 0.075 * big, qChest);
          }
          if (P["arSode" + k].visible) ball(P["arSode" + k], sh.clone().addScaledVector(out, 0.075).addScaledVector(s.spine, -0.09), 0.085, 0.1, 0.012, qChest);
          if (ap.couter) {
            const up = arm.joint.clone().sub(sh), fo = arm.end.clone().sub(arm.joint);
            let hinge = up.clone().cross(fo); if (hinge.lengthSq() < 1e-6) hinge = out.clone(); hinge.normalize(); if (hinge.dot(out) < 0) hinge.negate();
            let tip = up.clone().normalize().sub(fo.clone().normalize()); if (tip.lengthSq() < 1e-4) tip = s.fwd.clone().negate(); tip.normalize();
            ball(P["arCouter" + k], arm.joint.clone().addScaledVector(tip, 0.012), 0.06);
            if (ap.couter > 0.01) wing(P["arWing" + k], arm.joint.clone().addScaledVector(hinge, 0.055).addScaledVector(tip, 0.02), hinge, tip, ap.couter);
          }
          if (ap.cuffs) { const h = arm.end, j = arm.joint; seg(P["arCuff" + k], h.clone().lerp(j, 0.4), h.clone().lerp(j, 0.06), 0.058); }
          const leg = s["leg" + k], hip = s["hip" + k], legOut = s.hipRight.clone().multiplyScalar(sg);
          if (ap.poleyn) {
            const th = leg.joint.clone().sub(hip), sn = leg.end.clone().sub(leg.joint);
            let hinge = th.clone().cross(sn); if (hinge.lengthSq() < 1e-6) hinge = legOut.clone(); hinge.normalize(); if (hinge.dot(legOut) < 0) hinge.negate();
            const front = th.clone().normalize().sub(sn.clone().normalize()); if (front.lengthSq() > 1e-6) front.normalize();
            ball(P["arPoleyn" + k], leg.joint.clone().addScaledVector(front, 0.016), 0.064);
            if (ap.poleyn > 0.01) wing(P["arPWing" + k], leg.joint.clone().addScaledVector(hinge, 0.06).addScaledVector(front, 0.012), hinge, front, ap.poleyn);
          }
          if (ap.tassets) ball(P["arTasset" + k], s.waist.clone().addScaledVector(s.hipFwd, 0.115).addScaledVector(s.hipRight, sg * 0.075).addScaledVector(UP, -0.14), 0.014, 0.1, 0.07, qHip);
        }
      }
      // belt / sash
      const bt = lk.beltType;
      if (bt) {
        if (P.buckle.visible) ball(P.buckle, s.waist.clone().addScaledVector(s.hipFwd, 0.13), 0.008, 0.024, 0.03, qHip);
        if (bt === "sash" || bt === "rope") {
          const kn = s.waist.clone().addScaledVector(s.hipRight, bt === "rope" ? 0 : -0.1).addScaledVector(s.hipFwd, bt === "rope" ? 0.13 : 0.09);
          const r = bt === "rope" ? 0.012 : 0.03;
          ball(P.beltKnot, kn, r, r * 1.2, r, qHip);
          seg(P.beltTail1, kn, kn.clone().addScaledVector(UP, bt === "rope" ? -0.32 : -0.22).addScaledVector(s.hipFwd, 0.02), bt === "rope" ? 0.007 : 0.018);
          seg(P.beltTail2, kn, kn.clone().addScaledVector(UP, bt === "rope" ? -0.26 : -0.18).addScaledVector(s.hipRight, -0.04), bt === "rope" ? 0.007 : 0.016);
        }
        if (bt === "obi") ball(P.beltKnot, s.waist.clone().addScaledVector(s.hipFwd, -0.14), 0.03, 0.05, 0.085, qHip);
        if (bt === "swordbelt") seg(P.hanger, s.waist.clone().addScaledVector(s.hipRight, -0.1).addScaledVector(s.hipFwd, 0.06),
          s.waist.clone().addScaledVector(s.hipRight, -0.165).addScaledVector(UP, -0.18).addScaledVector(s.hipFwd, -0.06), 0.011);
        if (bt === "baldric") {
          const a = s.shR.clone().addScaledVector(s.spine, 0.03), b = s.waist.clone().addScaledVector(s.hipRight, -0.15).addScaledVector(UP, -0.06);
          const c = a.clone().add(b).multiplyScalar(0.5), yv = a.clone().sub(b), half = yv.length() / 2; yv.normalize();
          const z = s.fwd.clone().cross(yv).normalize(), x = yv.clone().cross(z).normalize();
          frame(P.baldric, c, x, yv, z, 0.14, half + 0.02, 0.13);
        }
      }
      // dagger, sheathed at the left hip: hilt up and forward, the sheath slanting down and back
      const dg = lk.dagger;
      if (dg) {
        const bp = s.waist.clone().addScaledVector(s.hipRight, -0.2).addScaledVector(s.hipFwd, 0.035).addScaledVector(UP, 0.01);
        const sd = UP.clone().multiplyScalar(-0.8).addScaledVector(s.hipFwd, -0.5).addScaledVector(s.hipRight, -0.18).normalize();
        const e = s.hipFwd.clone().addScaledVector(sd, -s.hipFwd.dot(sd)).normalize(), w = dg.w || 0.022;
        if (dg.jcurve) { const m = bp.clone().addScaledVector(sd, dg.len * 0.55);
          seg(P.dgSheath, bp, m, w); seg(P.dgSheath2, m.clone().addScaledVector(sd, -0.005), m.clone().addScaledVector(sd, 0.06).addScaledVector(e, 0.1), w * 0.8); }
        else seg(P.dgSheath, bp, bp.clone().addScaledVector(sd, dg.len), w);
        if (dg.top) ball(P.dgTop, bp.clone().addScaledVector(sd, 0.01), w * 1.2, 0.022, dg.top, new T.Quaternion().setFromRotationMatrix(new T.Matrix4().makeBasis(sd.clone().cross(e).normalize(), sd, e)));
        const pe = bp.clone().addScaledVector(sd, -dg.grip), gw = dg.gw || 0.04;
        seg(P.dgGrip, bp, pe, dg.gripR || 0.013);
        if (P.dgGuard.visible) seg(P.dgGuard, bp.clone().addScaledVector(e, -gw), bp.clone().addScaledVector(e, gw), 0.008);
        if (P.dgDisc.visible) seg(P.dgDisc, bp.clone().addScaledVector(sd, -0.004), bp.clone().addScaledVector(sd, 0.004), gw);
        if (P.dgBallL.visible) { ball(P.dgBallL, bp.clone().addScaledVector(e, 0.022), 0.02); ball(P.dgBallR, bp.clone().addScaledVector(e, -0.022), 0.02); }
        if (P.dgShell.visible) ball(P.dgShell, bp.clone().addScaledVector(sd, 0.004), gw * 0.9, 0.025, gw * 0.9, new T.Quaternion().setFromUnitVectors(UP, sd.clone().negate()));
        const pr = dg.pr || 0.02;
        if (dg.pommel === "ball") ball(P.dgPommel, pe, pr);
        if (dg.pommel === "cap") ball(P.dgPommel, pe, (dg.gripR || 0.013) * 1.3, 0.01, (dg.gripR || 0.013) * 1.3, new T.Quaternion().setFromUnitVectors(UP, sd));
        if (dg.pommel === "disc") seg(P.dgPDisc, pe.clone().addScaledVector(sd, 0.004), pe.clone().addScaledVector(sd, -0.004), pr);
        if (dg.pommel === "bar") seg(P.dgPBar, pe.clone().addScaledVector(e, -pr), pe.clone().addScaledVector(e, pr), 0.009);
      }
    }

    // a buckler in the left fist (sword-and-buckler guards), or the Armoury buckler hung at the right hip
    function placeBuckler(s) {
      const bs = look.buckler || null, inHand = !!s.bFace, hasB = inHand || !!bs;
      for (const k of BK_EXTRA) P[k].visible = false;
      P.buckler.visible = P.boss.visible = P.rim.visible = hasB;
      if (!hasB) return;
      const r = bs ? bs.r : BUCKLER_R;
      let c, f;
      if (inHand) { f = s.bFace; c = s.handL.clone().addScaledVector(f, 0.045); }
      else { f = s.hipRight.clone().addScaledVector(s.hipFwd, -0.25).normalize();
        c = s.waist.clone().addScaledVector(s.hipRight, 0.2).addScaledVector(s.hipFwd, -0.1).addScaledVector(UP, -0.16); }
      const qf = new T.Quaternion().setFromUnitVectors(UP, f);
      let front = 0.009;
      if (bs && bs.dome) { P.buckler.visible = false; P.bkDome.visible = true; front = bs.depth || 0.06; ball(P.bkDome, c, r, front, r, qf); }
      else seg(P.buckler, c.clone().addScaledVector(f, -0.009), c.clone().addScaledVector(f, 0.009), r);
      const bR = bs ? bs.bossR || 0.05 : 0.05, bH = bs ? bs.bossH || 0.045 : 0.045;
      P.boss.visible = !bs || bs.boss !== false;
      if (P.boss.visible) ball(P.boss, c.clone().addScaledVector(f, front - 0.001), bR, bH, bR, qf);
      P.rim.visible = !bs || bs.rim !== false;
      P.rim.position.copy(c).addScaledVector(f, bs && bs.dome ? 0 : 0); P.rim.quaternion.setFromUnitVectors(V(0, 0, 1), f); P.rim.scale.set(r, r, 0.25);
      if (bs && bs.spike) { P.bkSpike.visible = true; seg(P.bkSpike, c.clone().addScaledVector(f, front + bH * 0.7), c.clone().addScaledVector(f, front + bH + bs.spike), 0.014); }
      if (bs && bs.rings) { P.bkRing2.visible = true; P.bkRing2.position.copy(c).addScaledVector(f, front * 0.5 + 0.004); P.bkRing2.quaternion.setFromUnitVectors(V(0, 0, 1), f); P.bkRing2.scale.set(r * 0.66, r * 0.66, 0.25); }
      if (bs && bs.studs) {
        const u = Math.abs(f.y) < 0.9 ? f.clone().cross(UP).normalize() : f.clone().cross(V(1, 0, 0)).normalize();
        for (let i = 0; i < 4; i++) { const k = "bkStud" + i, dir = u.clone().applyAxisAngle(f, i * Math.PI / 2 + Math.PI / 4);
          P[k].visible = true; ball(P[k], c.clone().addScaledVector(f, (bs.dome ? front * 0.55 : front)).addScaledVector(dir, r * 0.6), 0.016); }
      }
    }

    // ---------- Armoury hats ----------
    // at(f, u, side) is a point in the head's frame (forward, up, right); hq turns a part into that frame
    function placeHat(type, s, at, hU, side, hq) {
      const L = s.look;
      const hf = (o, origin, sx, sy, sz, up = hU) => frame(o, origin, L, up, L.clone().cross(up).normalize(), sx, sy, sz);
      const qDir = (dir) => new T.Quaternion().setFromUnitVectors(UP, dir.clone().normalize());
      const dirOf = (f, u, sd) => L.clone().multiplyScalar(f).addScaledVector(hU, u).addScaledVector(side, sd);
      if (type === "beret") { // Landsknecht Barett: a broad flat slashed cap worn tilted, with ostrich plumes
        const up = hU.clone().addScaledVector(side, 0.32).normalize();
        hf(P.hxBrim, at(-0.01, 0.092, 0.025), 0.175, 0.016, 0.165, up);
        hf(P.hxBall, at(-0.01, 0.1, 0.025), 0.14, 0.035, 0.13, up);
        ball(P.hxFeather1, at(-0.07, 0.2, 0.1), 0.028, 0.15, 0.018, qDir(dirOf(-0.7, 1, 0.45)));
        ball(P.hxFeather2, at(-0.1, 0.17, 0.12), 0.024, 0.13, 0.016, qDir(dirOf(-1, 0.6, 0.6)));
      } else if (type === "kettle") { // chapel de fer: a steel cap with a wide sloping brim
        // worn tipped back a little, the brim raised at the front so the eyes show beneath it
        const tip = 22 * DEG, up = hU.clone().multiplyScalar(Math.cos(tip)).addScaledVector(L, -Math.sin(tip)).normalize();
        const fw = L.clone().multiplyScalar(Math.cos(tip)).addScaledVector(hU, Math.sin(tip)).normalize(), sd = fw.clone().cross(up).normalize();
        frame(P.hxDome, at(-0.016, 0.035), fw, up, sd, 0.106, 0.118, 0.102);
        frame(P.hxFrust, at(-0.014, 0.045), fw, up, sd, 0.205, 0.055, 0.2);
      } else if (type === "morion") { // Spanish morion: high comb, brim sweeping up fore and aft
        hf(P.hxDome, at(0, 0.02), 0.106, 0.13, 0.102);
        ball(P.hxBall, at(-0.008, 0.125), 0.095, 0.07, 0.008, hq);
        hf(P.hxFrustUp, at(0, 0.012), 0.22, 0.06, 0.17);
      } else if (type === "tricorne") { // 18th century: the brim cocked up on three sides, a point to the front
        ball(P.hxBall, at(-0.01, 0.1), 0.098, 0.06, 0.1, hq);
        // the triangle's first corner lies on local z: point it forward
        frame(P.hxTri, at(-0.01, 0.068), side.clone().negate(), hU, L.clone(), 0.19, 0.06, 0.19);
      } else if (type === "bicorne") { // Napoleonic, worn athwart (en bataille), with a cockade
        ball(P.hxBall, at(-0.015, 0.13), 0.04, 0.088, 0.235, hq);
        ball(P.hxBall2, at(0.022, 0.15, 0.07), 0.022, 0.022, 0.01, hq);
      } else if (type === "tophat") { // Victorian silk hat
        hf(P.hxBrim, at(-0.005, 0.078), 0.135, 0.01, 0.128);
        seg(P.hxCyl, at(-0.005, 0.078), at(-0.012, 0.29), 0.086);
        seg(P.hxBand, at(-0.005, 0.082), at(-0.006, 0.112), 0.089);
      } else if (type === "busby") { // hussar fur kalpak with its coloured bag and an upright plume
        seg(P.hxCyl, at(-0.005, 0.04), at(-0.012, 0.235), 0.104);
        seg(P.hxTail, at(-0.012, 0.225, 0.03), at(-0.07, 0.1, 0.1), 0.03);
        ball(P.hxFeather1, at(0.0, 0.29, -0.03), 0.026, 0.075, 0.026, hq);
      } else if (type === "jingasa") { // Japanese lacquered conical hat
        hf(P.hxCone, at(0, 0.075), 0.235, 0.075, 0.235);
        ball(P.hxBall2, at(0.12, 0.08), 0.022, 0.022, 0.006, hq);
      } else if (type === "turban") { // Mamluk turban wound about a red cap
        frame(P.hxTorus, at(-0.012, 0.055), L, side.clone().negate(), hU, 0.112, 0.106, 0.13);
        frame(P.hxTorus2, at(-0.015, 0.098), L, side.clone().negate(), hU, 0.094, 0.09, 0.11);
        ball(P.hxBall2, at(-0.015, 0.125), 0.075, 0.05, 0.072, hq);
      } else if (type === "coif") { // linen arming cap
        ball(P.hxBall, at(-0.028, 0.02), 0.104, 0.126, 0.101, hq);
      } else if (type === "fez") { // tall felt cap with a tassel (North Africa, Ottoman lands)
        hf(P.hxFrust, at(0, 0.2), 0.106, 0.145, 0.106);
        hf(P.hxBrim, at(0, 0.2), 0.06, 0.004, 0.06);
        seg(P.hxTail, at(0, 0.205), at(-0.07, 0.11, 0.05), 0.008);
      } else if (type === "kufi") { // close round cap (West Africa)
        hf(P.hxDome, at(0, 0.045), 0.104, 0.075, 0.1);
      } else if (type === "tagelmust") { // Tuareg indigo turban and veil, wound over the mouth and nose
        frame(P.hxTorus, at(-0.012, 0.05), L, side.clone().negate(), hU, 0.112, 0.106, 0.13);
        frame(P.hxTorus2, at(-0.015, 0.095), L, side.clone().negate(), hU, 0.096, 0.092, 0.11);
        ball(P.hxBall, at(-0.015, 0.115), 0.08, 0.05, 0.078, hq);
        ball(P.hxBall2, at(0.045, -0.055), 0.075, 0.07, 0.098, hq);
      } else if (type === "salakot") { // Filipino domed sun hat with a finial
        hf(P.hxCone, at(0, 0.07), 0.2, 0.095, 0.2);
        ball(P.hxBall2, at(0, 0.17), 0.018, 0.022, 0.018, hq);
      } else if (type === "hennin") { // Burgundian steeple headdress with a trailing veil
        seg(P.hxCone, at(-0.02, 0.07), at(-0.2, 0.43), 0.085);
        ball(P.hxFeather1, at(-0.22, 0.17), 0.03, 0.24, 0.08, hq);
        seg(P.hxBand, at(-0.005, 0.055), at(-0.012, 0.085), 0.101);
      } else if (type === "frenchhood") { // Tudor French hood (1530s): worn set back, showing the parted hair in front;
        // a black velvet hood over the back of the head, a crescent of gold billiment beads from ear to ear with a white
        // pleated crepine just inside it, and the black veil hanging straight down behind
        ball(P.hxBall, at(-0.05, 0.032), 0.09, 0.124, 0.116, hq);
        ball(P.hxVeil, at(-0.115, -0.1), 0.035, 0.16, 0.1, hq);
        for (let i = 0; i < 9; i++) {
          const a = (-100 + i * 25) * DEG;
          ball(P["frB" + i], at(-0.01, 0.014 + Math.cos(a) * 0.128, Math.sin(a) * 0.124), 0.012, 0.012, 0.012, hq);
          ball(P["frC" + i], at(0.006, 0.01 + Math.cos(a) * 0.115, Math.sin(a) * 0.113), 0.013, 0.017, 0.017, hq);
        }
      } else if (type === "frogrivets") { // the frog-mouth helm's brass rivets, round the front of the crown's lower edge
        for (let i = 0; i < 9; i++) { const a = (-80 + i * 20) * DEG;
          ball(P["frB" + i], at(-0.01 + Math.cos(a) * 0.15, 0.028, Math.sin(a) * 0.146), 0.011, 0.011, 0.011, hq); }
      } else if (type === "imperial") { // an arched royal crown: a gold circlet set with stones and topped with points,
        // a red velvet cap, two arches crossing over it, an orb and a cross on top
        seg(P.hxCyl, at(0, 0.06), at(0, 0.1), 0.102);
        ball(P.hxBall2, at(0, 0.1), 0.088, 0.065, 0.088, hq);
        frame(P.hxTorus, at(0, 0.1), L, hU, side, 0.092, 0.085, 0.05);
        frame(P.hxTorus2, at(0, 0.1), side.clone().negate(), hU, L, 0.092, 0.085, 0.05);
        ball(P.hxBall, at(0, 0.2), 0.022, 0.022, 0.022, hq);
        ball(P.hxFeather1, at(0, 0.238), 0.006, 0.02, 0.006, hq); ball(P.frC0, at(0, 0.24), 0.006, 0.006, 0.016, hq);
        for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, c = Math.cos(a), sn = Math.sin(a);
          ball(P["frB" + i], at(c * 0.104, 0.08, sn * 0.104), 0.01, 0.012, 0.01, hq); // stones round the circlet
          ball(P["frC" + (i + 1)], at(c * 0.098, 0.112, sn * 0.098), 0.011, 0.018, 0.011, hq); } // points along the rim
      } else if (type === "veil") { // wimple and veil: the head and neck wrapped in linen, the face left open
        ball(P.hxBall, at(-0.045, -0.002), 0.1, 0.142, 0.11, hq); // set back so it frames the face and leaves the eyes clear
        ball(P.hxBall2, at(-0.09, -0.1), 0.06, 0.15, 0.1, hq);
      }
    }

    // ---------- Armoury maces and clubs ----------
    // mace: { type: flanged | star | pear | knob | club, at (along the haft above the hand), r, h (flange height), n, len (club) }
    function drawMace(sw, H, d, edge) {
      const mc = sw.mace, p = H.clone().addScaledVector(d, mc.at * sw.blade), n = mc.n || 6, qd = new T.Quaternion().setFromUnitVectors(UP, d);
      const around = (i, k = n, a0 = 0) => edge.clone().applyAxisAngle(d, a0 + i * 2 * Math.PI / k).normalize();
      P.mcBall.visible = true;
      if (mc.type === "flanged") { // radiating iron flanges round a small core
        ball(P.mcBall, p, 0.022, mc.h * 0.45, 0.022, qd);
        for (let i = 0; i < Math.min(n, 8); i++) { const o = P["mcF" + i], u = around(i); o.visible = true;
          const q = new T.Quaternion().setFromRotationMatrix(new T.Matrix4().makeBasis(u, d, u.clone().cross(d).normalize()));
          ball(o, p.clone().addScaledVector(u, mc.r * 0.6), mc.r * 0.62, mc.h / 2, 0.006, q); }
        P.mcTop.visible = true; seg(P.mcTop, p.clone().addScaledVector(d, mc.h * 0.4), p.clone().addScaledVector(d, mc.h * 0.4 + 0.035), 0.012);
      } else if (mc.type === "star") { // morning star: a ball set with spikes, one more on top
        ball(P.mcBall, p, mc.r);
        for (let i = 0; i < 8; i++) { const o = P["mcS" + i], u = around(i % 4, 4, i < 4 ? 0 : Math.PI / 4).addScaledVector(d, i < 4 ? 0.45 : -0.45).normalize(); o.visible = true;
          seg(o, p.clone().addScaledVector(u, mc.r * 0.8), p.clone().addScaledVector(u, mc.r + 0.04), 0.012); }
        P.mcTop.visible = true; seg(P.mcTop, p.clone().addScaledVector(d, mc.r * 0.8), p.clone().addScaledVector(d, mc.r + 0.05), 0.012);
      } else if (mc.type === "pear") ball(P.mcBall, p, mc.r, mc.r * 1.25, mc.r, qd);
      else if (mc.type === "knob") ball(P.mcBall, p, mc.r);
      else if (mc.type === "club") { // a long thickened head set with studs (kanabō)
        const len = mc.len || 0.45, c = H.clone().addScaledVector(d, sw.blade - len / 2);
        ball(P.mcBall, c, mc.r, len / 2, mc.r, qd);
        for (let i = 0; i < 8; i++) { const o = P["mcS" + i], u = around(i, 4, i % 2 ? Math.PI / 4 : 0), at = c.clone().addScaledVector(d, (i - 3.5) * len * 0.1); o.visible = true;
          seg(o, at.clone().addScaledVector(u, mc.r * 0.85), at.clone().addScaledVector(u, mc.r + 0.018), 0.008); }
      }
    }

    // ---------- Armoury swords ----------
    function drawCustomSword(s, edge, flat) {
      const sw = s.sw, H = s.H, d = s.d;
      for (const k of Object.keys(CX)) P[k].visible = false;
      if (sw.boomerang) { // two flat wooden arms meeting at an elbow; the hand holds the end of the first arm
        for (let i = 0; i < BSEGS; i++) P["bs" + i].visible = false;
        for (const k of ["blade", "grip", "pommel", "cross", "ring", "bow", "cup"]) P[k].visible = false;
        const bm = sw.boomerang, th = 0.007, wd = bm.w || 0.032;
        const arm = (o, a, b) => { const dir = b.clone().sub(a), len = dir.length(); dir.normalize();
          const side = flat.clone().cross(dir).normalize();
          o.visible = true; o.position.copy(a).add(b).multiplyScalar(0.5);
          o.quaternion.setFromRotationMatrix(new T.Matrix4().makeBasis(dir, side, flat)); o.scale.set(len / 2 + wd * 0.6, wd, th); };
        const a0 = H.clone().addScaledVector(d, -0.06), E = H.clone().addScaledVector(d, bm.a - 0.06);
        const turn = (180 - bm.angle) * DEG, d2 = d.clone().multiplyScalar(Math.cos(turn)).addScaledVector(edge, Math.sin(turn)).normalize();
        arm(P.bmA, a0, E); arm(P.bmB, E, E.clone().addScaledVector(d2, bm.b));
        P.bmE.visible = true; ball(P.bmE, E, wd * 1.05, wd * 1.05, th, new T.Quaternion().setFromUnitVectors(V(0, 0, 1), flat));
        return;
      }
      const baz = !!sw.bazooka, curved = !!sw.curve && !baz, axe = sw.axe || sw.mace; // axe/mace: a haft with a head
      const wx = sw.w || 1, tz = sw.t || 0.28;
      // blade
      P.blade.visible = false;
      const prof = sw.prof || (sw.shape === "parallel" ? [1, 0.67] : sw.shape === "acute" ? [1, 0.07] : [1, 0.19]);
      const at = (t) => H.clone().addScaledVector(d, t * sw.blade).addScaledVector(edge, bladeOffset(sw, t));
      for (let i = 0; i < BSEGS; i++) {
        const o = P["bs" + i]; o.visible = !baz && !axe; if (baz || axe) continue;
        setGeo(o, sw.round ? GEO.bsegR : GEO.bseg);
        const t0 = i / BSEGS, t1 = (i + 1) / BSEGS, a = at(t0), b = at(t1), dir = b.clone().sub(a), len = dir.length();
        dir.normalize();
        const ex = edge.clone().addScaledVector(dir, -edge.dot(dir)).normalize();
        if (sw.twist) ex.applyAxisAngle(dir, sw.twist * 2 * Math.PI * (t0 + t1) / 2);
        const ez = ex.clone().cross(dir).normalize();
        const r = 0.021 * profAt(prof, (t0 + t1) / 2);
        frame(o, a, ex, dir, ez, wx * r, len * (sw.twist ? 1.08 : 1.03), (sw.round ? wx : tz) * r);
      }
      if (sw.ricasso && !baz) { P.cxRic.visible = true; seg(P.cxRic, H.clone().addScaledVector(d, 0.005), at(sw.ricasso), 0.021 * wx * 0.9); }
      if (sw.hooks && !baz) { const p0 = at(sw.hooks.at), hl = sw.hooks.len || 0.06;
        for (const [k, sg] of [["cxHookA", 1], ["cxHookB", -1]]) { P[k].visible = true;
          seg(P[k], p0.clone().addScaledVector(edge, sg * 0.012 * wx), p0.clone().addScaledVector(edge, sg * (0.012 * wx + hl)).addScaledVector(d, 0.025), 0.0055); } }
      if (sw.teeth && !baz) for (let i = 0; i < 10; i++) { // obsidian blades set in both edges
        const sg = i % 2 ? 1 : -1, t = 0.12 + Math.floor(i / 2) * 0.19, c0 = at(t), r = 0.021 * wx * profAt(prof, t);
        P["th" + i].visible = true; seg(P["th" + i], c0.clone().addScaledVector(edge, sg * r * 0.85), c0.clone().addScaledVector(edge, sg * (r + 0.022)).addScaledVector(d, 0.006), 0.012);
      }
      if (sw.forte && !baz) { P.cxForte.visible = true; frame(P.cxForte, H, edge, d, flat, wx * sw.forte[1], sw.forte[0], tz * 1.1); }
      if (sw.band && !baz) { P.cxBand.visible = true; frame(P.cxBand, H.clone().addScaledVector(d, 0.09), edge, d, flat, 0.0205 * wx * 1.12, 0.075, 0.0062 * 1.6); }
      if (sw.schilt) { P.cxSchilt.visible = true; const qB = new T.Quaternion().setFromRotationMatrix(new T.Matrix4().makeBasis(edge, d, flat));
        if (sw.schilt === "tulip") { // a large tulip schilt: a broad flared plate whose upper corners swell out into two lobes
          ball(P.cxSchilt, H.clone().addScaledVector(d, 0.048), 0.028, 0.05, 0.006, qB);
          for (const [k, sg] of [["cxTulipA", 1], ["cxTulipB", -1]]) { P[k].visible = true;
            ball(P[k], H.clone().addScaledVector(d, 0.068).addScaledVector(edge, sg * 0.028), 0.02, 0.045, 0.006, qB.clone().multiply(new T.Quaternion().setFromAxisAngle(V(0, 0, 1), -sg * 0.42))); } // petals leaning outward
        } else ball(P.cxSchilt, H.clone().addScaledVector(d, 0.045), 0.032, 0.045, 0.006, qB); }
      // grip and pommel
      const gr = sw.gripR || 0.017, pr = sw.pommel || 0.03, pe = H.clone().addScaledVector(d, -sw.grip);
      P.grip.visible = !baz; P.pommel.visible = !baz && sw.pommelStyle !== "wheel" && sw.pommelStyle !== "none";
      if (axe) seg(P.grip, H.clone().addScaledVector(d, -sw.grip), H.clone().addScaledVector(d, sw.blade), gr); // the whole haft
      else if (!baz) seg(P.grip, H.clone().addScaledVector(d, -sw.grip + 0.02), H, gr);
      const qS = new T.Quaternion().setFromRotationMatrix(new T.Matrix4().makeBasis(edge, d, flat));
      const ps = sw.pommelStyle || "ball";
      const along = (k) => pe.clone().addScaledVector(d, k);
      if (!baz) {
        if (ps === "ball") ball(P.pommel, pe, pr, pr, pr * 0.65, qS);
        else if (ps === "nut") ball(P.pommel, along(-pr * 0.4), pr * 0.8, pr * 1.45, pr * 0.62, qS);
        else if (ps === "cap") ball(P.pommel, pe, gr * 1.15, 0.012, gr * 1.15, qS);
        else if (ps === "button") ball(P.pommel, pe, 0.017, 0.017, 0.017, qS);
        else if (ps === "wheel") { P.cxWheel.visible = true;
          seg(P.cxWheel, along(-pr * 0.75).addScaledVector(flat, -0.011), along(-pr * 0.75).addScaledVector(flat, 0.011), pr); }
        else if (ps === "scent") { ball(P.pommel, along(-pr * 0.3), pr * 0.9, pr, pr * 0.8, qS);
          P.cxCone.visible = true; seg(P.cxCone, along(-pr * 0.9), along(-pr * 2.6), pr * 0.62); }
        else if (ps === "pear") { ball(P.pommel, along(-pr * 0.9), pr, pr * 1.15, pr * 0.8, qS);
          P.cxCone.visible = true; seg(P.cxCone, along(-pr * 0.5), along(pr * 0.4), pr * 0.75); }
        else if (ps === "fishtail") { P.pommel.visible = false; P.cxCone.visible = true;
          frame(P.cxCone, along(-0.04), edge, d, flat, 0.036, 0.05, 0.011); }
        else if (ps === "pyramid") { P.pommel.visible = false; P.cxPyr.visible = true;
          const ph = pr * 2.1, e45 = edge.clone().applyAxisAngle(d, Math.PI / 4), f45 = e45.clone().cross(d).normalize();
          frame(P.cxPyr, along(0.03 - ph), e45, d, f45, pr * 1.15, ph, pr * 1.15); }
        else if (ps === "ring") { P.pommel.visible = false; P.cxRingP.visible = true;
          frame(P.cxRingP, along(0.02 - pr * 1.02), d, flat, edge, pr, pr, pr * 0.9); } // turned 90° about the grip from the blade plane
        else if (ps === "eagle") { ball(P.pommel, pe.clone().addScaledVector(edge, 0.012), 0.02, 0.026, 0.015, qS);
          P.cxCone.visible = true;
          seg(P.cxCone, along(-0.012).addScaledVector(edge, 0.022), along(-0.002).addScaledVector(edge, 0.048), 0.009); }
      }
      // cross / tsuba
      const c = sw.cross || 0, cs = sw.crossStyle || "straight", cr = sw.crossR || 0.011;
      P.cross.visible = !baz && c > 0 && (cs === "straight" || cs === "flare");
      if (P.cross.visible) seg(P.cross, H.clone().addScaledVector(edge, -c), H.clone().addScaledVector(edge, c), cr);
      if (!baz && cs === "droop") { P.cxA.visible = P.cxB.visible = true;
        seg(P.cxA, H, H.clone().addScaledVector(edge, c).addScaledVector(d, 0.035), cr);
        seg(P.cxB, H, H.clone().addScaledVector(edge, -c).addScaledVector(d, 0.035), cr);
        if (sw.crossKnobs) { P.cxEndA.visible = P.cxEndB.visible = true; // knobbed quillon ends
          ball(P.cxEndA, H.clone().addScaledVector(edge, c).addScaledVector(d, 0.035), cr * 1.7); ball(P.cxEndB, H.clone().addScaledVector(edge, -c).addScaledVector(d, 0.035), cr * 1.7); } }
      if (!baz && cs === "x") { // two small quillons crossing each other at the blade, in an X
        P.cxA.visible = P.cxB.visible = true;
        seg(P.cxA, H.clone().addScaledVector(edge, -c).addScaledVector(d, -c * 0.6), H.clone().addScaledVector(edge, c).addScaledVector(d, c * 0.6), cr);
        seg(P.cxB, H.clone().addScaledVector(edge, -c).addScaledVector(d, c * 0.6), H.clone().addScaledVector(edge, c).addScaledVector(d, -c * 0.6), cr);
      }
      if (!baz && cs === "s") { // S-shaped cross: an S lying flat, the blade passing through its middle — each quillon runs out
        // along the edge and curls round toward a different flat of the blade (as on the Cluny sword), ending in a knob
        for (const [k, k2, k3, kE, sg] of [["cxA", "cxA2", "cxA3", "cxEndA", 1], ["cxB", "cxB2", "cxB3", "cxEndB", -1]]) {
          const a1 = H.clone().addScaledVector(edge, sg * c * 0.55);
          const a2 = a1.clone().addScaledVector(edge, sg * c * 0.35).addScaledVector(flat, sg * c * 0.22);
          const a3 = a2.clone().addScaledVector(edge, sg * c * 0.02).addScaledVector(flat, sg * c * 0.32);
          P[k].visible = P[k2].visible = P[k3].visible = P[kE].visible = true;
          seg(P[k], H, a1, cr); seg(P[k2], a1, a2, cr); seg(P[k3], a2, a3, cr); ball(P[kE], a3, cr * 1.6); }
      }
      if (!baz && cs === "flare") { P.cxEndA.visible = P.cxEndB.visible = true;
        ball(P.cxEndA, H.clone().addScaledVector(edge, c), cr * 1.9); ball(P.cxEndB, H.clone().addScaledVector(edge, -c), cr * 1.9); }
      if (!baz && cs === "disc") { P.tsuba.visible = true;
        seg(P.tsuba, H.clone().addScaledVector(d, -0.004), H.clone().addScaledVector(d, 0.006), sw.tsuba || 0.04); }
      // rings, knuckle bow, swept bars, cup, shells
      P.ring.visible = !baz && !!sw.ring; P.bow.visible = !baz && !!sw.bow; P.cup.visible = !baz && !!sw.cup;
      const rq = new T.Quaternion().setFromRotationMatrix(new T.Matrix4().makeBasis(d, flat, edge));
      if (P.ring.visible) { P.ring.position.copy(H).addScaledVector(d, 0.03).addScaledVector(flat, 0.034); P.ring.quaternion.copy(rq); P.ring.scale.set(0.032, 0.032, 0.5); }
      if (!baz && sw.ring2) { P.cxRing2.visible = true;
        P.cxRing2.position.copy(H).addScaledVector(d, 0.03).addScaledVector(flat, -0.034); P.cxRing2.quaternion.copy(rq); P.cxRing2.scale.set(0.032, 0.032, 0.5); }
      const bw = sw.bowW || 0.045;
      if (P.bow.visible) { const bq = new T.Quaternion().setFromRotationMatrix(new T.Matrix4().makeBasis(d, edge, flat.clone().negate()));
        P.bow.position.copy(H).addScaledVector(d, -sw.grip / 2).addScaledVector(edge, bw); P.bow.quaternion.copy(bq); P.bow.scale.set(sw.grip / 2 + 0.01, bw, 0.5); }
      if (!baz && sw.bars) for (const i of [0, 2]) {
        // two bars sweeping from the cross toward the pommel, either side of the knuckle bow
        const o = P["cxBar" + i]; o.visible = true;
        const ek = edge.clone().applyAxisAngle(d, i === 1 ? Math.PI : (i - 1) * 0.75).normalize(), nk = d.clone().cross(ek).normalize();
        o.quaternion.setFromRotationMatrix(new T.Matrix4().makeBasis(d, ek, nk));
        const len = i === 1 ? 0.07 : sw.grip / 2 + 0.03, wd = i === 1 ? 0.04 : 0.05;
        o.position.copy(H).addScaledVector(d, i === 1 ? 0.035 : -sw.grip / 2 + 0.03).addScaledVector(ek, wd);
        o.scale.set(len, wd, 0.16);
      }
      if (P.cup.visible) ball(P.cup, H.clone().addScaledVector(d, 0.004), sw.cup, sw.cupD || 0.03, sw.cup, new T.Quaternion().setFromUnitVectors(UP, d));
      if (!baz && sw.shells) { const qd = new T.Quaternion().setFromUnitVectors(UP, d);
        for (const [k, sg] of [["cxShellA", 1], ["cxShellB", -1]]) { P[k].visible = true;
          ball(P[k], H.clone().addScaledVector(d, 0.006).addScaledVector(flat, sg * 0.024), sw.shells, sw.shells * 0.35, sw.shells, qd); } }
      // axe: a head on the haft — the bit on the edge side (len out from the haft, h tall), an optional beard below it,
      // a back (hammer, hook, spike or a second bit), a top spike, a socket and langets down the haft
      if (sw.socket && !baz) { P.axSocket.visible = true; seg(P.axSocket, H.clone().addScaledVector(d, -sw.socket), H.clone().addScaledVector(d, 0.005), gr * 1.4); }
      if (sw.mace) drawMace(sw, H, d, edge);
      if (sw.axe) {
        const hd = sw.axe, qS2 = new T.Quaternion().setFromRotationMatrix(new T.Matrix4().makeBasis(edge, d, flat));
        const p = H.clone().addScaledVector(d, hd.at * sw.blade), th = hd.t || 0.009;
        P.axHead.visible = P.axSocket.visible = true;
        // a fan: flattened cone from the haft out to the bit, its base being the cutting edge; a flat ellipse rounds the edge.
        // A beard drops the bit below the eye. Crescent heads (bardiche, Lochaber) are one long ellipse beside the haft.
        const fan = (o, bit, sg) => {
          const tall = hd.h + (hd.beard || 0), mid = p.clone().addScaledVector(d, -(hd.beard || 0) / 2);
          o.visible = bit.visible = true;
          frame(o, mid.clone().addScaledVector(edge, sg * hd.len), d, edge.clone().multiplyScalar(-sg), flat.clone().multiplyScalar(sg), tall / 2, hd.len * 0.92, th);
          ball(bit, mid.clone().addScaledVector(edge, sg * hd.len), hd.len * 0.14, tall / 2, th, qS2);
        };
        if (hd.hammer) { // a hammer instead of a bit: a short neck and a squared head; a Lucerne hammer's face is split into prongs
          ball(P.axHead, p.clone().addScaledVector(edge, 0.048), 0.036, 0.036, 0.036, qS2);
          for (let i = 0; i < 4; i++) { const o = P["axP" + i]; o.visible = i < (hd.prongs || 0); if (!o.visible) continue;
            const b = p.clone().addScaledVector(edge, 0.07).addScaledVector(d, (i % 2 ? 1 : -1) * 0.018).addScaledVector(flat, (i < 2 ? 1 : -1) * 0.018);
            seg(o, b, b.clone().addScaledVector(edge, 0.055), 0.015); }
        }
        else if (hd.crescent) ball(P.axHead, p.clone().addScaledVector(edge, hd.len * 0.55), hd.len * 0.58, hd.h / 2, th, qS2);
        else fan(P.axFan, P.axHead, 1);
        seg(P.axSocket, p.clone().addScaledVector(d, -0.045), p.clone().addScaledVector(d, 0.045), gr * 1.45);
        if (hd.back === "hammer") { P.axBack.visible = true; ball(P.axBack, p.clone().addScaledVector(edge, -0.045), 0.038, 0.026, 0.026, qS2); }
        if (hd.back === "blade") fan(P.axFan2, P.axBit2, -1);
        if (hd.back === "beak") { // a long beak (the 'crow's bill') sweeping back and down toward the hands
          const k1 = p.clone().addScaledVector(edge, -0.085).addScaledVector(d, -0.008);
          P.axBeak.visible = P.axHook.visible = true; seg(P.axBeak, p.clone().addScaledVector(edge, -0.01), k1, 0.016);
          seg(P.axHook, k1, k1.clone().addScaledVector(edge, -0.09).addScaledVector(d, -0.07), 0.016);
        }
        if (hd.back === "hook" || hd.back === "spike") { P.axHook.visible = true;
          seg(P.axHook, p.clone().addScaledVector(edge, -0.01), p.clone().addScaledVector(edge, hd.back === "hook" ? -0.12 : -0.09).addScaledVector(d, hd.back === "hook" ? -0.03 : 0), 0.016); }
        if (hd.spike) { P.axSpike.visible = true; seg(P.axSpike, p.clone().addScaledVector(d, 0.04), p.clone().addScaledVector(d, 0.04 + hd.spike), 0.015); }
        if (hd.langets) { P.axLangets.visible = true; seg(P.axLangets, p, p.clone().addScaledVector(d, -hd.langets), gr * 1.12); }
      }
      // bazooka: a launcher tube over the hand, a pistol grip under it, a sight and a wire guard at the back end
      if (baz) {
        const up = edge.clone().negate(), ax = H.clone().addScaledVector(up, 0.085);
        for (const k of ["cxTube", "cxMouth", "cxPistol", "cxSight", "cxRear"]) P[k].visible = true;
        seg(P.cxTube, ax.clone().addScaledVector(d, -0.62), ax.clone().addScaledVector(d, 0.86), 0.042);
        seg(P.cxMouth, ax.clone().addScaledVector(d, 0.8), ax.clone().addScaledVector(d, 0.9), 0.05);
        seg(P.cxPistol, H.clone().addScaledVector(up, 0.05), H.clone().addScaledVector(up, -0.05).addScaledVector(d, -0.02), 0.016);
        seg(P.cxSight, ax.clone().addScaledVector(d, 0.25).addScaledVector(up, 0.035), ax.clone().addScaledVector(d, 0.25).addScaledVector(up, 0.08), 0.006);
        seg(P.cxRear, ax.clone().addScaledVector(d, -0.64), ax.clone().addScaledVector(d, -0.6), 0.058);
      }
    }

    fig.set = (p, opt) => {
      fig.pose = p;
      if (!opt || opt.frame !== false) { framePose(p); setCamera(); }
      const s = solve(p, custom), bk = look.bulk || 1, meyer = look.style === "meyer";
      // legs
      for (const k of ["L", "R"]) {
        const leg = s["leg" + k], hip = s["hip" + k], toe = s["toe" + k];
        seg(P["thigh" + k], hip, leg.joint, 0.068 * bk);
        ball(P["knee" + k], leg.joint, 0.056 * bk);
        seg(P["shin" + k], leg.joint, leg.end, 0.05 * bk);
        if (k === "L") { const dn = leg.end.clone().sub(leg.joint).normalize(); // the garter band, a hand below the knee
          seg(P.garter, leg.joint.clone().addScaledVector(dn, 0.075), leg.joint.clone().addScaledVector(dn, 0.115), 0.057 * bk); }
        const mid = hip.clone().lerp(leg.joint, 0.45);
        const q = tmpQ.setFromUnitVectors(UP, leg.joint.clone().sub(hip).normalize()).clone();
        const pr = look.style === "fabris" ? 0.095 : 0.12; // Venetian breeches: slimmer than pluderhosen, down to the knee
        if (look.braies) ball(P["puff" + k], hip.clone().lerp(leg.joint, 0.27), 0.085 * bk, 0.15, 0.085 * bk, q); // linen braies, short and loose
        else ball(P["puff" + k], look.style === "fabris" ? hip.clone().lerp(leg.joint, 0.55) : mid, pr * bk, look.style === "fabris" ? 0.24 : 0.21, pr * bk, q);
        const footQ = new T.Quaternion().setFromUnitVectors(V(1, 0, 0), toe);
        ball(P["foot" + k], leg.end.clone().addScaledVector(toe, 0.07 * (look.footLen || 1)).setY(0.04), 0.13 * (look.footLen || 1), 0.042, 0.055, footQ);
      }
      // torso: hips follow the pelvis turn, chest adds twist and lean
      const fem = look.fem ? 1 : 0; // the feminine build: wider hips, narrower chest (and a bust, placed with the kit)
      frame(P.hips, s.pel.clone().addScaledVector(UP, -0.06), s.hipFwd, UP, s.hipRight, 0.12 * bk, B.waist + 0.06, 0.16 * bk * (fem ? 1.1 : 1));
      const skirtLen = look.skirtLen != null ? look.skirtLen : look.braies ? 0 : null;
      P.skirt.visible = skirtLen !== 0;
      frame(P.skirt, s.waist, s.hipFwd, UP, s.hipRight, 0.135 * bk * (look.skirtFlare || 1), skirtLen || (look.coat ? 0.4 : meyer || look.style === "fabris" || look.style === "hutton" ? 0.12 : look.style === "i33" ? 0.52 : 0.27), 0.165 * bk * (look.skirtFlare || 1));
      frame(P.belt, s.waist, s.hipFwd, s.hipRight.clone().negate(), UP, 0.1 * bk * (fem ? 1.05 : 1), 0.122 * bk, look.beltW || 0.05);
      const chestBase = s.waist.clone().addScaledVector(s.spine, -0.03);
      frame(P.chest, chestBase, s.fwd, s.spine, s.right, 0.13 * bk * (fem ? 0.95 : 1), B.torso - B.waist + 0.04, 0.2 * bk * (fem ? 0.9 : 1));
      seg(P.neck, s.neck.clone().addScaledVector(s.spine, -0.04), s.head, 0.045);
      frame(P.ruff, s.neck.clone().addScaledVector(s.spine, 0.01), s.fwd, s.right.clone().negate(), s.spine, 0.08, 0.08, 0.05);
      // head: its own frame (forward = s.look, up = s.headUp) so turn / nod / lean move everything on it
      const hU = s.headUp, side = s.look.clone().cross(hU).normalize();
      const hq = new T.Quaternion().setFromRotationMatrix(new T.Matrix4().makeBasis(s.look, hU, side));
      const at = (f, u, sd = 0) => s.head.clone().addScaledVector(s.look, f).addScaledVector(hU, u).addScaledVector(side, sd);
      ball(P.head, s.head, B.headR * 0.95, B.headR * 1.12, B.headR * 0.9, hq);
      const nose = at(B.headR * 0.85, -0.005);
      seg(P.nose, nose, nose.clone().addScaledVector(s.look, 0.035).addScaledVector(hU, -0.02), 0.016);
      for (const [k, sg] of [["eyeL", -1], ["eyeR", 1]]) ball(P[k], at(B.headR * 0.82, 0.02, sg * 0.035), 0.011);
      // under a hat the hair is tucked lower so it never pokes up through the crown or brim
      if (look.hat || (look.hatType && look.hatType !== "frenchhood")) ball(P.hair, at(-0.03, -0.012), B.headR * 1.02, B.headR * 0.98, B.headR * 1.04, hq);
      else ball(P.hair, at(-0.03, 0.025), B.headR * 1.04, B.headR * 1.08, B.headR * 1.06, hq);
      const full = look.beard === 2;
      // beard follows the jaw and chin: centred below the mouth and mostly inside the head, so only the jawline,
      // chin and (full beard) a little under the chin show — the mouth area stays skin
      if (full) ball(P.beard, at(0.0, -0.08), 0.075, 0.075, 0.09, hq);
      else ball(P.beard, at(0.0, -0.072), 0.068, 0.052, 0.082, hq);
      // moustache: two short drooping strands under the nose, lying on the face
      for (const [k, sg] of [["mustL", -1], ["mustR", 1]]) {
        const mq = hq.clone().multiply(new T.Quaternion().setFromAxisAngle(new T.Vector3(1, 0, 0), sg * 0.45));
        ball(P[k], at(B.headR * 0.86, -0.036, sg * 0.022), 0.014, 0.01, 0.028, mq);
      }
      const top = at(0, B.headR * 1.05);
      frame(P.cap, top, s.look, hU, side, 0.13, 0.03, 0.13);
      ball(P.capTop, top.clone().addScaledVector(hU, 0.012), 0.12, 0.03, 0.12, hq);
      frame(P.crown, top.clone().addScaledVector(hU, -0.005), s.look, hU, side, 0.092, 0.035, 0.092);
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        const base = top.clone().addScaledVector(s.look, Math.cos(a) * 0.085).addScaledVector(side, Math.sin(a) * 0.085).addScaledVector(hU, 0.012);
        P["spike" + i].position.copy(base); P["spike" + i].quaternion.copy(hq); P["spike" + i].scale.set(0.018, 0.045, 0.018);
      }
      // chaperone: the padded roll sits round the crown of the head, cloth puffs up inside it, the patte hangs
      // down the left side of the face and the liripipe (tail) falls behind the right shoulder
      if (look.chaperone) {
        frame(P.chapRoll, at(-0.014, 0.07), s.look, side.clone().negate(), hU, 0.1, 0.096, 0.105);
        ball(P.chapTop, at(-0.02, 0.1), 0.085, 0.06, 0.082, hq);
        ball(P.chapPatte, at(-0.03, -0.02, -0.1), 0.05, 0.085, 0.02, hq);
        seg(P.chapTail, at(-0.1, 0.06, 0.05), at(-0.18, -0.22, 0.1), 0.018);
      }
      // I.33 hood: covers the crown, back and sides of the head (face left open), a cape over the shoulders and
      // the pointed tail (liripipe) sticking out behind; the priest has a shaved crown inside a ring of curls
      if (look.hood) {
        ball(P.hood, at(-0.078, 0.016), 0.092, 0.124, 0.108, hq);
        ball(P.hoodCape, s.neck.clone().addScaledVector(s.spine, -0.06), 0.15 * bk, 0.07, 0.22 * bk,
          new T.Quaternion().setFromRotationMatrix(new T.Matrix4().makeBasis(s.fwd, s.spine, s.right)));
        const tb = at(-0.13, 0.0), tt = at(-0.25, -0.03);
        P.hoodTip.position.copy(tb); P.hoodTip.quaternion.setFromUnitVectors(UP, tt.clone().sub(tb).normalize());
        P.hoodTip.scale.set(0.03, tt.distanceTo(tb), 0.03);
      }
      if (look.tonsure) ball(P.tonsure, at(-0.025, 0.092), 0.058, 0.05, 0.058, hq);
      // La Touche: the brim is cocked up a little on the left, the plume curls back over the crown;
      // the wig hangs in curls either side of the face and down the back to the shoulders
      if (look.hat) {
        const brimUp = hU.clone().addScaledVector(side, -0.22).normalize(), hTop = at(-0.01, B.headR * 0.95);
        frame(P.hatBrim, hTop, s.look, brimUp, s.look.clone().cross(brimUp).normalize(), 0.2, 0.012, 0.2);
        ball(P.hatCrown, hTop.clone().addScaledVector(brimUp, 0.03), 0.098, 0.068, 0.1, hq);
        ball(P.plume, at(-0.05, B.headR * 1.7, -0.05), 0.13, 0.045, 0.06, hq.clone().multiply(new T.Quaternion().setFromAxisAngle(V(0, 0, 1), 0.35)));
      }
      if (look.wig) {
        ball(P.wigL, at(-0.03, -0.06, -0.085), 0.055, 0.13, 0.05, hq);
        ball(P.wigR, at(-0.03, -0.06, 0.085), 0.055, 0.13, 0.05, hq);
        ball(P.wigB, at(-0.075, -0.05), 0.07, 0.14, 0.1, hq);
      }
      if (look.cravat) ball(P.cravat, s.neck.clone().addScaledVector(s.fwd, 0.1).addScaledVector(s.spine, -0.025), 0.03, 0.05, 0.045,
        new T.Quaternion().setFromRotationMatrix(new T.Matrix4().makeBasis(s.fwd, s.spine, s.right)));
      if (look.hatType) placeHat(look.hatType, s, at, hU, side, hq);
      // arms (near/far shading decided from the camera position)
      const farL = camera.position.distanceTo(s.shL) > camera.position.distanceTo(s.shR);
      M.armL.color.copy(farL ? armFar : armNear); M.armR.color.copy(farL ? armNear : armFar);
      for (const k of ["L", "R"]) {
        const sh = s["sh" + k], arm = s["arm" + k];
        ball(P["shoulder" + k], sh, 0.062 * bk);
        seg(P["upper" + k], sh, arm.joint, 0.052 * bk);
        ball(P["elbow" + k], arm.joint, 0.047 * bk);
        seg(P["fore" + k], arm.joint, arm.end, 0.043 * bk);
        ball(P["hand" + k], arm.end, 0.043);
      }
      placeKit(s, at, hU, side, hq, chestBase);
      // sword: blade flats face the camera side, crossguard across the edges
      let edge = s.d.clone().cross(V(0, 0, 1));
      if (edge.lengthSq() < 0.01) edge = s.d.clone().cross(V(1, 0, 0));
      edge.normalize();
      // roll: turn the sword about its own length (e.g. 90° = crossguard turned for a thumb grip)
      if (p.roll) edge.applyAxisAngle(s.d, p.roll * DEG).normalize();
      const flat = edge.clone().cross(s.d).normalize();
      const sw = s.sw;
      if (custom) drawCustomSword(s, edge, flat); else {
      for (const k of Object.keys(CX)) P[k].visible = false;
      setGeo(P.blade, GEO.blade); P.grip.visible = P.pommel.visible = true;
      for (let i = 0; i < BSEGS; i++) setGeo(P["bs" + i], GEO.bseg);
      frame(P.blade, s.H, edge, s.d, flat, sw.rapier ? 0.5 : sw.small ? 0.42 : sw.sabre ? 0.62 : p.buckler ? 0.85 : 1, sw.blade, 0.28);
      seg(P.grip, s.H.clone().addScaledVector(s.d, -sw.grip + 0.03), s.H, 0.017);
      seg(P.cross, s.H.clone().addScaledVector(edge, -sw.cross), s.H.clone().addScaledVector(edge, sw.cross), 0.011);
      ball(P.pommel, s.H.clone().addScaledVector(s.d, -sw.grip), sw.pommel, sw.pommel, sw.pommel * 0.65,
        new T.Quaternion().setFromRotationMatrix(new T.Matrix4().makeBasis(edge, s.d, flat)));
      // the great stick is one round cane from butt to point: no blade, no cross
      P.blade.visible = P.cross.visible = !sw.stick; P.grip.children[0].material = sw.stick ? M.cane : M.grip;
      if (sw.stick) seg(P.grip, s.H.clone().addScaledVector(s.d, -sw.grip), s.H.clone().addScaledVector(s.d, sw.blade), 0.014);
      // curved blade (sabre): the straight blade is replaced by short pieces following p(t) = H + d·tL − edge·c·t²,
      // so the tip sweeps back toward the spine and the cutting edge (the knuckle-bow side) is convex
      const curved = !!sw.curve && !sw.stick;
      if (curved) P.blade.visible = false;
      for (let i = 0; i < BSEGS; i++) {
        const o = P["bs" + i]; o.visible = curved; if (!curved) continue;
        const at = (t) => s.H.clone().addScaledVector(s.d, t * sw.blade).addScaledVector(edge, -sw.curve * t * t);
        const t0 = i / BSEGS, t1 = (i + 1) / BSEGS, a = at(t0), b = at(t1), dir = b.clone().sub(a), len = dir.length();
        dir.normalize();
        const ex = edge.clone().addScaledVector(dir, -edge.dot(dir)).normalize(), ez = ex.clone().cross(dir).normalize();
        const r = 0.021 + (0.004 - 0.021) * (t0 + t1) / 2; // the straight blade's taper, sampled mid-piece
        frame(o, a, ex, dir, ez, 0.62 * r, len * 1.02, 0.28 * r);
      }
      // rapier rings: one ring flat beside the blade just above the cross, and a bow from the cross to the pommel
      // a sabre has the knuckle bow only; the smallsword a small knuckle bow and a round cup
      P.ring.visible = !!sw.rapier; P.bow.visible = !!(sw.rapier || sw.sabre || sw.small); P.cup.visible = !!sw.small;
      if (sw.small) {
        const cr = 0.058; // cup radius
        ball(P.cup, s.H.clone().addScaledVector(s.d, 0.004), cr, 0.03, cr, new T.Quaternion().setFromUnitVectors(UP, s.d));
      }
      if (sw.rapier || sw.sabre || sw.small) {
        const bw = sw.small ? 0.032 : 0.045; // bow width out from the grip
        const rq = new T.Quaternion().setFromRotationMatrix(new T.Matrix4().makeBasis(s.d, flat, edge));
        P.ring.position.copy(s.H).addScaledVector(s.d, 0.03).addScaledVector(flat, 0.034); P.ring.quaternion.copy(rq); P.ring.scale.set(0.032, 0.032, 0.5);
        const bq = new T.Quaternion().setFromRotationMatrix(new T.Matrix4().makeBasis(s.d, edge, flat.clone().negate()));
        P.bow.position.copy(s.H).addScaledVector(s.d, -sw.grip / 2).addScaledVector(edge, bw); P.bow.quaternion.copy(bq); P.bow.scale.set(sw.grip / 2 + 0.01, bw, 0.5);
      }
      } // (end of the guard's own sword)
      // buckler: in the fist for sword-and-buckler guards (its face along bFace), else an Armoury buckler at the hip
      placeBuckler(s);
      fig.render();
    };

    fig.animateTo = (to, ms, done) => {
      cancelAnimationFrame(fig._raf);
      if (!ms) { fig.set(to); done && done(); return; }
      const from = fig.pose, t0 = performance.now();
      framePose(to); setCamera(); // frame the destination guard; the move happens inside that frame
      const dYaw = ((to.blade[0] - from.blade[0]) % 360 + 540) % 360 - 180;
      const step = (now) => {
        const t = Math.min(1, (now - t0) / ms), e = 1 - Math.pow(1 - t, 3);
        const l = (a, b) => a + (b - a) * e;
        fig.set(t >= 1 ? to : {
          lead: to.lead, poleL: to.poleL, poleR: to.poleR, elbowR: l(from.elbowR || 0, to.elbowR || 0), elbowL: l(from.elbowL || 0, to.elbowL || 0), sideLean: l(from.sideLean || 0, to.sideLean || 0), kneeL: l(from.kneeL || 0, to.kneeL || 0), kneeR: l(from.kneeR || 0, to.kneeR || 0), footLFwd: l(from.footLFwd || 0, to.footLFwd || 0), footRFwd: l(from.footRFwd || 0, to.footRFwd || 0), footLSide: l(from.footLSide || 0, to.footLSide || 0), footRSide: l(from.footRSide || 0, to.footRSide || 0), footLTurn: l(from.footLTurn || 0, to.footLTurn || 0), footRTurn: l(from.footRTurn || 0, to.footRTurn || 0), headTurn: l(from.headTurn || 0, to.headTurn || 0), headNod: l(from.headNod || 0, to.headNod || 0), headLean: l(from.headLean || 0, to.headLean || 0), shift: l(from.shift || 0, to.shift || 0), stance: l(from.stance, to.stance), width: l(from.width, to.width), crouch: l(from.crouch, to.crouch),
          turn: l(from.turn, to.turn), twist: l(from.twist, to.twist), lean: l(from.lean, to.lean),
          hilt: from.hilt.map((v, i) => l(v, to.hilt[i])),
          blade: [from.blade[0] + dYaw * e, l(from.blade[1], to.blade[1])], roll: l(from.roll || 0, to.roll || 0),
          buckler: to.buckler && (from.buckler ? from.buckler.map((v, i) => l(v, to.buckler[i])) : to.buckler),
          bucklerFace: to.bucklerFace && (from.bucklerFace ? from.bucklerFace.map((v, i) => l(v, to.bucklerFace[i])) : to.bucklerFace),
          rapier: to.rapier, sabre: to.sabre, stick: to.stick, dagger: to.dagger, small: to.small, freeLeft: to.freeLeft, handA: to.handA, handB: to.handB, leftHand: to.leftHand && (from.leftHand ? from.leftHand.map((v, i) => l(v, to.leftHand[i])) : to.leftHand),
        }, { frame: false });
        if (t < 1) fig._raf = requestAnimationFrame(step); else done && done();
      };
      fig._raf = requestAnimationFrame(step);
    };

    fig.setLook({ style: "fiore", jacket: "#f1e9da", thigh: "#f1e9da", shin: "#f1e9da", hair: "#3b2a1d", bulk: 1 });
    fig.set(REST);
    return fig;
  }

  // Left version of a guard: mirror across the body's midline (the right hand stays at the cross).
  function mirrorPose(p) {
    return Object.assign({}, p, { lead: p.lead === "right" ? "left" : "right", turn: -p.turn, twist: -(p.twist || 0),
      hilt: [p.hilt[0], p.hilt[1], -p.hilt[2]], blade: [-p.blade[0], p.blade[1]], roll: -(p.roll || 0),
      poleL: p.poleR && [p.poleR[0], p.poleR[1], -p.poleR[2]], poleR: p.poleL && [p.poleL[0], p.poleL[1], -p.poleL[2]],
      elbowR: -(p.elbowL || 0), elbowL: -(p.elbowR || 0), sideLean: -(p.sideLean || 0),
      headTurn: -(p.headTurn || 0), headNod: p.headNod || 0, headLean: -(p.headLean || 0),
      kneeR: -(p.kneeL || 0), kneeL: -(p.kneeR || 0),
      footLFwd: p.footRFwd || 0, footRFwd: p.footLFwd || 0, footLSide: p.footRSide || 0, footRSide: p.footLSide || 0,
      footLTurn: p.footRTurn || 0, footRTurn: p.footLTurn || 0,
      buckler: p.buckler && [p.buckler[0], p.buckler[1], -p.buckler[2]],
      bucklerFace: p.bucklerFace && [-p.bucklerFace[0], p.bucklerFace[1]],
      leftHand: p.leftHand && [p.leftHand[0], p.leftHand[1], -p.leftHand[2]] });
  }

  window.Fencer3D = { makeFigure, mirrorPose, REST, solve, B, swordOf, bladeOffset, profAt };
})();
