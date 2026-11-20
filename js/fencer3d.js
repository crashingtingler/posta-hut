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
  };
  GEO.seg.translate(0, 0.5, 0); GEO.blade.translate(0, 0.5, 0); GEO.bseg.translate(0, 0.5, 0); GEO.cone.translate(0, 0.5, 0); GEO.skirt.translate(0, -0.5, 0);

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
  const bladeDir = ([yaw, pitch]) => V(Math.cos(pitch * DEG) * Math.cos(yaw * DEG), Math.sin(pitch * DEG), Math.cos(pitch * DEG) * Math.sin(yaw * DEG));

  function stripes(a, b) {
    const c = document.createElement("canvas"); c.width = 64; c.height = 8;
    const x = c.getContext("2d");
    for (let i = 0; i < 8; i++) { x.fillStyle = i % 2 ? b : a; x.fillRect(i * 8, 0, 8, 8); }
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
  function solve(p) {
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

    const d = bladeDir(p.blade), H = V(...p.hilt), sw = swordOf(p);
    const handR = H.clone().addScaledVector(d, -sw.handA);
    // sword and buckler: the left fist holds the buckler's grip behind the boss; otherwise both hands on the grip
    // rapier: the free left hand is held up before the body (pose.leftHand places it)
    // sabre: the left hand rests on the left hip unless pose.leftHand places it
    const handL = p.buckler ? V(...p.buckler) : p.leftHand && (p.rapier || p.sabre || p.dagger || p.small) ? V(...p.leftHand)
      : p.small ? neck.clone().addScaledVector(fwd, 0.12).addScaledVector(right, -0.26).addScaledVector(spine, 0.16)
      : p.dagger ? neck.clone().addScaledVector(fwd, 0.2).addScaledVector(right, -0.14).addScaledVector(spine, -0.16)
      : p.sabre ? waist.clone().addScaledVector(right, -0.2).addScaledVector(fwd, -0.03).addScaledVector(spine, 0.02)
      : p.rapier ? neck.clone().addScaledVector(fwd, 0.28).addScaledVector(right, -0.08).addScaledVector(spine, -0.12)
      : H.clone().addScaledVector(d, -B.handB);
    const bFace = p.buckler ? bladeDir(p.bucklerFace || [0, 0]) : null;
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
    return { pel, waist, neck, head, spine, right, fwd, hipFwd, hipRight, shR, shL, look, headUp, d, H, handR, handL, sw, bFace,
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
    };
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
    const BSEGS = 8; // a curved blade is drawn as this many short pieces along the arc
    for (let i = 0; i < BSEGS; i++) add("bs" + i, GEO.bseg, M.steel, OUTLINE_THIN);
    add("blade", GEO.blade, M.steel, OUTLINE_THIN); add("grip", GEO.seg, M.grip, OUTLINE_THIN);
    add("cross", GEO.seg, M.iron, OUTLINE_THIN); add("pommel", GEO.ball, M.iron, OUTLINE_THIN);
    // buckler (sword and buckler guards only): a small round board with a domed iron boss and an iron rim
    add("buckler", GEO.disc, M.wood = toon(0xb8925a), OUTLINE_THIN); add("boss", GEO.dome, M.iron, OUTLINE_THIN);
    add("rim", GEO.rim, M.iron, null);
    // rapier hilt: a side ring beside the blade and a knuckle bow in front of the hand
    add("ring", GEO.rim, M.iron, OUTLINE_THIN); add("bow", GEO.rim, M.iron, OUTLINE_THIN);
    // smallsword hilt: a round cup (a shallow dish around the blade, rounded toward the point)
    add("cup", GEO.dome, M.iron, OUTLINE_THIN);

    let look = { style: "fiore", bulk: 1 }, viewYaw = 22, w = 0, h = 0;
    const armNear = new T.Color(0xf1e9da), armFar = new T.Color(0xd9cfbd);
    const fig = { pose: Object.assign({}, REST), _raf: 0, renderer, canvas: renderer.domElement, scene, camera }; // scene/camera: used by the stance editor

    // Auto-framing: the camera centres on, and zooms to, the extent of the current guard
    // (body, sword tip and pommel), so every pose fills the frame from any angle.
    let fitPts = null;
    function framePose(p) {
      const s = solve(p), tip = s.H.clone().addScaledVector(s.d, s.sw.blade), pom = s.H.clone().addScaledVector(s.d, -s.sw.grip);
      fitPts = [s.head.clone().addScaledVector(UP, 0.16), tip, pom, s.handR, s.handL, s.armR.joint, s.armL.joint,
                s.shR, s.shL, s.legL.end, s.legR.end, s.legL.joint, s.legR.joint,
                s.legL.end.clone().addScaledVector(s.toeL, 0.2).setY(0), s.legR.end.clone().addScaledVector(s.toeR, 0.2).setY(0)];
      if (s.bFace) for (const v of [V(0, 1, 0), V(0, -1, 0), V(0, 0, 1), V(0, 0, -1)]) fitPts.push(s.handL.clone().addScaledVector(v, BUCKLER_R));
    }
    function setCamera() {
      const dist = 6.0, yaw = viewYaw * DEG;
      const pts = fitPts || [V(-0.6, 0, 0), V(1.2, 2.6, 0)];
      const box = new T.Box3().setFromPoints(pts), target = box.getCenter(V(0, 0, 0));
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
      camera.fov = 2 * Math.atan(tanV) / DEG;
      camera.updateProjectionMatrix();
    }
    function resize() {
      const r = container.getBoundingClientRect();
      const nw = Math.round(opts.size ? opts.size[0] : r.width), nh = Math.round(opts.size ? opts.size[1] : r.height);
      if (nw && nh && (nw !== w || nh !== h)) { w = nw; h = nh; renderer.setSize(w, h, false); setCamera(); }
    }
    fig.render = () => { resize(); if (w && h) renderer.render(scene, camera); };
    if (!opts.renderer && window.ResizeObserver) new ResizeObserver(() => fig.render()).observe(container);

    fig.setView = (yawDeg) => { viewYaw = yawDeg; setCamera(); fig.set(fig.pose, { frame: false }); };
    fig.setAccent = (c) => { M.belt.color.set(c); fig.render(); };
    fig.setLook = (lk) => {
      look = lk;
      const meyer = lk.style === "meyer";
      M.jacket.color.set(lk.jacket);
      // sleeves: the arm farther from the viewer is drawn darker (like the hatched far limbs in the plates),
      // so crossed arms (Schlüssel, Ochs, Schrankhut) read as two separate arms
      armNear.set(lk.jacket); armFar.set(lk.jacket).lerp(new T.Color(INK), 0.38);
      // Hutton: a striped jersey — the stripes are a texture on the jacket and sleeves (white base colour so the
      // texture shows true; the far sleeve is still shaded darker)
      for (const mk of ["jacket", "armL", "armR"]) {
        if (M[mk].map) { M[mk].map.dispose(); M[mk].map = null; }
        if (lk.stripes) { M[mk].map = stripes(lk.stripes[0], lk.stripes[1]); M[mk].map.repeat.set(mk === "jacket" ? 3 : 1.5, 1); }
        M[mk].needsUpdate = true;
      }
      if (lk.stripes) { M.jacket.color.set("#ffffff"); armNear.set("#ffffff"); armFar.set("#ffffff").lerp(new T.Color(INK), 0.38); }
      for (const k of ["thighL", "thighR"]) {
        if (M[k].map) { M[k].map.dispose(); M[k].map = null; }
        M[k].color.set(meyer ? "#ffffff" : lk.thigh);
        if (meyer) M[k].map = stripes(lk.thigh, lk.jacket);
        M[k].needsUpdate = true;
      }
      M.shin.color.set(lk.shin); M.shoe.color.set(lk.shoe || lk.shin); M.hair.color.set(lk.hair);
      P.puffL.visible = P.puffR.visible = meyer || lk.style === "fabris"; // Meyer's pluderhosen; Fabris-era Venetian breeches
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
      fig.set(fig.pose);
    };

    fig.set = (p, opt) => {
      fig.pose = p;
      if (!opt || opt.frame !== false) { framePose(p); setCamera(); }
      const s = solve(p), bk = look.bulk || 1, meyer = look.style === "meyer";
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
        ball(P["puff" + k], look.style === "fabris" ? hip.clone().lerp(leg.joint, 0.55) : mid, pr * bk, look.style === "fabris" ? 0.24 : 0.21, pr * bk, q);
        const footQ = new T.Quaternion().setFromUnitVectors(V(1, 0, 0), toe);
        ball(P["foot" + k], leg.end.clone().addScaledVector(toe, 0.07).setY(0.04), 0.13, 0.042, 0.055, footQ);
      }
      // torso: hips follow the pelvis turn, chest adds twist and lean
      frame(P.hips, s.pel.clone().addScaledVector(UP, -0.06), s.hipFwd, UP, s.hipRight, 0.12 * bk, B.waist + 0.06, 0.16 * bk);
      frame(P.skirt, s.waist, s.hipFwd, UP, s.hipRight, 0.135 * bk, look.coat ? 0.4 : meyer || look.style === "fabris" || look.style === "hutton" ? 0.12 : look.style === "i33" ? 0.52 : 0.27, 0.165 * bk);
      frame(P.belt, s.waist, s.hipFwd, s.hipRight.clone().negate(), UP, 0.1 * bk, 0.122 * bk, 0.05);
      const chestBase = s.waist.clone().addScaledVector(s.spine, -0.03);
      frame(P.chest, chestBase, s.fwd, s.spine, s.right, 0.13 * bk, B.torso - B.waist + 0.04, 0.2 * bk);
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
      if (look.hat) ball(P.hair, at(-0.03, -0.012), B.headR * 1.02, B.headR * 0.98, B.headR * 1.04, hq);
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
      // sword: blade flats face the camera side, crossguard across the edges
      let edge = s.d.clone().cross(V(0, 0, 1));
      if (edge.lengthSq() < 0.01) edge = s.d.clone().cross(V(1, 0, 0));
      edge.normalize();
      // roll: turn the sword about its own length (e.g. 90° = crossguard turned for a thumb grip)
      if (p.roll) edge.applyAxisAngle(s.d, p.roll * DEG).normalize();
      const flat = edge.clone().cross(s.d).normalize();
      const sw = s.sw;
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
      // buckler: its face points along bFace, the fist sits behind the boss
      const hasB = !!s.bFace;
      P.buckler.visible = P.boss.visible = P.rim.visible = hasB;
      if (hasB) {
        const c = s.handL.clone().addScaledVector(s.bFace, 0.045);
        seg(P.buckler, c.clone().addScaledVector(s.bFace, -0.009), c.clone().addScaledVector(s.bFace, 0.009), BUCKLER_R);
        ball(P.boss, c.clone().addScaledVector(s.bFace, 0.008), 0.05, 0.045, 0.05, new T.Quaternion().setFromUnitVectors(UP, s.bFace));
        P.rim.position.copy(c); P.rim.quaternion.setFromUnitVectors(V(0, 0, 1), s.bFace); P.rim.scale.set(BUCKLER_R, BUCKLER_R, 0.25);
      }
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
          rapier: to.rapier, sabre: to.sabre, stick: to.stick, dagger: to.dagger, small: to.small, leftHand: to.leftHand && (from.leftHand ? from.leftHand.map((v, i) => l(v, to.leftHand[i])) : to.leftHand),
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

  window.Fencer3D = { makeFigure, mirrorPose, REST, solve, B, swordOf };
})();
