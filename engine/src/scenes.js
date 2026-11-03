// Pop-up 3D ink scenes for each lesson. Local frame: x across right page (gutter at −0.51),
// z from top edge (−0.7) to bottom edge (+0.7), y up from the page surface.
export const SCENES = {};

/* ---------- 1. Vectors ---------- */
SCENES.vectors = (S) => {
  const { THREE, V, gsap, ink, glow, arrow, label, jar, show } = S;
  const g = new THREE.Group(), u = 0.09, Y = 0.05;
  const O = V(-0.2, Y, 0.38);
  const Aend = O.clone().add(V(3 * u, 0, 0));
  const Bs = V(0.33, Y, 0.5), Bend = (tail) => tail.clone().add(V(0, 0, -4 * u));
  const A = arrow('#e8590c', 0.011, { posts: true }); A.point(O, Aend); g.add(A);
  const B = arrow('#1c7ed6', 0.011, { posts: true }); B.point(Bs, Bend(Bs)); g.add(B);
  const R = arrow('#2b8a3e', 0.014, { posts: true }); R.visible = false; g.add(R);
  const la = label('A = 3', { color: '#c2410c' }); la.position.copy(O).add(V(1.5 * u, 0.04, 0.03)); la.visible = false; g.add(la);
  const lb = label('B = 4', { color: '#1864ab' }); lb.visible = false; g.add(lb);
  const lr = label('R = 5 , θ ≈ 53°', { color: '#2b8a3e' }); lr.visible = false; g.add(lr);
  // R token (paper disc with a standing card)
  const token = new THREE.Group(); token.position.set(0.34, 0, -0.42);
  token.add(ink(new THREE.CylinderGeometry(0.05, 0.055, 0.03, 32).translate(0, 0.015, 0), '#e9f3e4', { thresh: 20 }));
  const card = ink(new THREE.BoxGeometry(0.08, 0.07, 0.004).translate(0, 0.065, 0), '#f6f0e1'); token.add(card);
  const tl = label('R ?', { size: 0.04, color: '#2b8a3e' }); tl.position.set(0, 0.11, 0); token.add(tl);
  g.add(token);
  // protractor arc
  const arc = ink(new THREE.TorusGeometry(0.1, 0.004, 6, 40, Math.atan2(4, 3)).rotateX(-Math.PI / 2), '#f4ecda', { edges: false });
  arc.position.copy(O); arc.visible = false; glow(arc, '#2b8a3e', 1, 0); g.add(arc);
  const J = jar({ max: 7, color: '#2f9e44', name: '|R| =', digits: 0 }); J.position.set(0.36, 0, -0.08); g.add(J);
  let bMoved = false, busy = false;
  const actA = () => { glow(A, '#e8590c', 1); show(la); S.sfx.pop(); };
  const actB = () => new Promise((res) => {
    glow(B, '#1c7ed6', 1);
    if (bMoved) { show(lb); res(); return; }
    const o = { k: 0 }, from = Bs.clone();
    const go = () => { const tail = from.clone().lerp(Aend, o.k); tail.y = Y + Math.sin(Math.PI * o.k) * 0.12; B.point(tail, Bend(tail)); };
    gsap.to(o, { k: 1, duration: S.reduced ? 0 : 1.1, ease: 'power2.inOut', onUpdate: go, onComplete: () => { go(); bMoved = true; lb.position.copy(Aend).add(V(0.05, 0.04, -2 * u)); show(lb); res(); } });
    if (S.reduced) { o.k = 1; go(); bMoved = true; lb.position.copy(Aend).add(V(0.05, 0.04, -2 * u)); show(lb); res(); }
  });
  const actR = async () => {
    if (busy) return; busy = true;
    if (!bMoved) await actB();
    const end = Bend(Aend); R.visible = true; glow(R, '#2b8a3e', 1);
    const o = { k: 0.02 };
    await new Promise((res) => gsap.to(o, { k: 1, duration: S.reduced ? 0 : 1.2, ease: 'power1.out', onUpdate: () => R.point(O, O.clone().lerp(end, o.k)), onComplete: () => { R.point(O, end); res(); } }));
    if (S.reduced) R.point(O, end);
    show(arc); lr.position.copy(O).lerp(end, 0.5).add(V(-0.04, 0.05, 0)); show(lr); J.set(5); glow(token, '#2b8a3e', 0.8); S.sfx.good(); busy = false;
  };
  return {
    group: g,
    targets: [
      { obj: A, hint: O.clone().add(V(1.5 * u, 0, 0)), act: actA },
      { obj: B, hint: Bs.clone().add(V(0, 0, -2 * u)), act: () => actB() },
      { obj: token, hint: token.position.clone(), act: actR },
    ],
    print(x, { P, inkLine, inkText }) {
      for (let i = -1; i <= 8; i++) { const a = P(O.x + i * u - 0.03, -0.62), b = P(O.x + i * u - 0.03, 0.62); inkLine(x, [a, b], { w: 1, color: 'rgba(60,100,140,0.25)', wob: 0 }); }
      for (let j = -13; j <= 3; j++) { const zz = O.z + j * u; if (zz < -0.62 || zz > 0.62) continue; inkLine(x, [P(-0.33, zz), P(0.47, zz)], { w: 1, color: 'rgba(60,100,140,0.25)', wob: 0 }); }
      inkLine(x, [P(O.x - 0.08, O.z), P(0.47, O.z)], { w: 2.4 }); inkLine(x, [P(O.x, O.z + 0.08), P(O.x, -0.6)], { w: 2.4 });
      inkText(x, 'شرق', ...P(0.44, O.z + 0.04), { size: 28 }); inkText(x, 'شمال', ...P(O.x + 0.06, -0.58), { size: 28 });
      inkText(x, 'O', ...P(O.x - 0.03, O.z + 0.04), { size: 30 });
      for (let i = 1; i <= 4; i++) inkText(x, String(i), ...P(O.x + i * u, O.z + 0.035), { size: 22, color: '#6b6155' });
      inkText(x, 'المحصلة = الخط من ذيل A إلى رأس B', ...P(0.02, 0.6), { size: 28, color: '#2b8a3e', weight: 600 });
    },
    notes: [{ t: 'انقل B إلى رأس A', at: [0.3, 0.62], to: [0.33, 0.52] }, { t: 'رمز المحصلة', at: [0.08, -0.55], to: [0.28, -0.43] }],
  };
};

/* ---------- 2. Free fall ---------- */
SCENES.freefall = (S) => {
  const { THREE, V, gsap, ink, glow, label, jar, show } = S;
  const g = new THREE.Group();
  const TX = -0.18, TZ = -0.08;
  for (let i = 0; i < 5; i++) {
    const r = 0.075 - i * 0.004, tier = ink(new THREE.CylinderGeometry(r, r + 0.003, 0.092, 18), '#f1e8d4', { thresh: 30 });
    tier.position.set(TX, 0.046 + i * 0.1, TZ); g.add(tier);
    const ledge = ink(new THREE.CylinderGeometry(r + 0.01, r + 0.01, 0.008, 18), '#e8dcc2', { thresh: 30 }); ledge.position.set(TX, 0.096 + i * 0.1, TZ); g.add(ledge);
  }
  const beam = ink(new THREE.BoxGeometry(0.36, 0.014, 0.05), '#efe4cc'); beam.position.set(TX + 0.18, 0.5, TZ); g.add(beam);
  const balls = [{ r: 0.032, x: 0.04, c: '#e6d0a6' }, { r: 0.016, x: 0.13, c: '#f2e4c6' }].map((b) => {
    const m = ink(new THREE.SphereGeometry(b.r, 22, 16), b.c, { thresh: 60 }); const y0 = 0.493 - 0.05 - b.r; m.position.set(b.x, y0, TZ); g.add(m);
    const str = new THREE.Line(new THREE.BufferGeometry().setFromPoints([V(b.x, 0.493, TZ), V(b.x, y0 + b.r, TZ)]), S.LINE_MAT); g.add(str);
    return { ...b, m, y0, str };
  });
  const lk = label('5 kg', { size: 0.032 }); lk.position.set(0.04, 0.505, TZ + 0.035); g.add(lk);
  const ll = label('0.5 kg', { size: 0.032 }); ll.position.set(0.15, 0.505, TZ + 0.035); g.add(ll);
  const lt = label('t = 3.03 s', { color: '#2b8a3e' }); lt.position.set(0.09, 0.08, TZ + 0.1); lt.visible = false; g.add(lt);
  // strobe lamp
  const lamp = new THREE.Group(); lamp.position.set(0.33, 0, 0.32);
  lamp.add(ink(new THREE.BoxGeometry(0.08, 0.02, 0.06).translate(0, 0.01, 0), '#e5dccb'));
  lamp.add(ink(new THREE.CylinderGeometry(0.006, 0.006, 0.12).translate(0, 0.08, 0)));
  const head = ink(new THREE.CylinderGeometry(0.025, 0.04, 0.06, 18).rotateZ(Math.PI / 2.4), '#f0e6d2', { thresh: 30 }); head.position.set(-0.01, 0.15, 0); lamp.add(head);
  g.add(lamp);
  const ghosts = new THREE.Group(); g.add(ghosts); ghosts.visible = false;
  const b0 = balls[0];
  for (let k = 0; k <= 6; k++) {
    const t = k / 6, y = b0.y0 - (b0.y0 - b0.r) * t * t;
    const gm = new THREE.Mesh(new THREE.SphereGeometry(b0.r * 0.9, 16, 12), new THREE.MeshBasicMaterial({ color: '#ffd43b', transparent: true, opacity: 0.55, toneMapped: false }));
    gm.position.set(b0.x - 0.08, y, TZ + 0.06); ghosts.add(gm);
  }
  const J = jar({ max: 30, color: '#e8590c', name: 'v =', unit: 'm/s', digits: 1 }); J.position.set(0.36, 0, -0.32); g.add(J);
  let falling = false;
  const drop = () => {
    if (falling) return; falling = true;
    balls.forEach((b) => { b.str.visible = false; glow(b.m, '#f08c00', 0.9); });
    const T = S.reduced ? 0.001 : 1.5, o = { t: 0 };
    gsap.to(o, { t: 1, duration: T, ease: 'none', onUpdate: () => {
      balls.forEach((b) => b.m.position.setY(b.y0 - (b.y0 - b.r) * o.t * o.t));
      J.set(29.7 * o.t, 0.05);
    }, onComplete: () => {
      S.sfx.click(); setTimeout(() => S.sfx.click(), 25); show(lt); J.set(29.7, 0.2);
      setTimeout(() => { balls.forEach((b) => { b.m.position.setY(b.y0); b.str.visible = true; glow(b.m, null, 0); }); lt.visible = false; lt.userData._shown = false; falling = false; }, 2600);
    } });
  };
  return {
    group: g,
    targets: [
      { obj: balls[0].m, hint: V(0.04, 0, TZ + 0.06), act: drop },
      { obj: balls[1].m, hint: V(0.13, 0, TZ + 0.06), act: drop },
      { obj: lamp, hint: V(0.33, 0, 0.32), act: () => { ghosts.visible = !ghosts.visible; glow(head, '#ffd43b', ghosts.visible ? 1 : 0); if (ghosts.visible && !S.reduced) ghosts.children.forEach((m, i) => { m.scale.setScalar(0.01); gsap.to(m.scale, { x: 1, y: 1, z: 1, duration: 0.3, delay: i * 0.12 }); }); } },
    ],
    print(x, { P, inkLine, inkText, inkArrowHead }) {
      inkLine(x, [P(-0.3, 0.05), P(0.45, 0.05)], { w: 3 });
      const a = P(-0.3, -0.5), b = P(-0.3, 0.02); inkLine(x, [a, b], { w: 2 }); inkArrowHead(x, [a[0], a[1] + 30], a); inkArrowHead(x, [b[0], b[1] - 30], b);
      inkText(x, 'y = 45 m', ...P(-0.27, -0.24), { size: 26 });
      inkText(x, '(ارتفاع مفترض)', ...P(-0.27, -0.2), { size: 22, color: '#6b6155' });
      inkText(x, 'g = 9.8 m/s²', ...P(0.12, 0.22), { size: 32, color: '#c2410c', weight: 600 });
      inkText(x, 'الوميض: صور متتالية بفترات زمنية متساوية', ...P(0.08, 0.48), { size: 26 });
      inkText(x, 'المسافات تتزايد: 1 : 3 : 5 : 7 …', ...P(0.08, 0.54), { size: 26, color: '#6b6155' });
    },
    notes: [{ t: 'أفلت الكرتين', at: [0.22, -0.55], to: [0.12, -0.36] }],
  };
};

/* ---------- 3. Newton's second law ---------- */
SCENES.newton2 = (S) => {
  const { THREE, V, gsap, ink, glow, arrow, label, jar, show } = S;
  const g = new THREE.Group();
  const lanes = [-0.16, 0.24], X0 = -0.27, X1 = 0.27;
  lanes.forEach((z) => { const tr = ink(new THREE.BoxGeometry(0.76, 0.012, 0.11), '#ece3d1'); tr.position.set(0.06, 0.006, z); g.add(tr);
    const stop = ink(new THREE.BoxGeometry(0.012, 0.04, 0.11), '#e2d6bd'); stop.position.set(0.44, 0.02, z); g.add(stop); });
  const carts = lanes.map((z, i) => {
    const c = new THREE.Group(); c.position.set(X0, 0.012, z);
    const body = ink(new THREE.BoxGeometry(0.12, 0.045, 0.08).translate(0, 0.04, 0), i ? '#efe0c2' : '#f4ead6'); c.add(body);
    for (const [wx, wz] of [[-0.04, -0.045], [0.04, -0.045], [-0.04, 0.045], [0.04, 0.045]]) { const w = ink(new THREE.CylinderGeometry(0.017, 0.017, 0.01, 16).rotateX(Math.PI / 2), '#d8ccb4', { thresh: 30 }); w.position.set(wx, 0.017, wz); c.add(w); }
    if (i) { const blk = ink(new THREE.BoxGeometry(0.08, 0.05, 0.06).translate(0, 0.088, 0), '#e2cfa8'); c.add(blk); }
    const F = arrow('#e8590c', 0.009); F.point(V(0.062, 0.04, 0), V(0.2, 0.04, 0)); F.visible = false; c.add(F);
    const lm = label(i ? '2m = 4 kg' : 'm = 2 kg', { size: 0.033 }); lm.position.set(0, i ? 0.13 : 0.085, 0); c.add(lm);
    g.add(c); return { c, F, body, a: i ? 2.5 : 5, moving: false };
  });
  const lf = label('F = 10 N', { color: '#c2410c', size: 0.035 }); lf.position.set(-0.05, 0.12, 0.04); lf.visible = false; g.add(lf);
  // force token: a paper spring scale
  const tok = new THREE.Group(); tok.position.set(-0.24, 0, 0.5);
  tok.add(ink(new THREE.BoxGeometry(0.16, 0.03, 0.05).translate(0, 0.015, 0), '#f3ead8'));
  const coil = ink(new THREE.TorusKnotGeometry(0.012, 0.003, 60, 6, 1, 8).scale(3.2, 1, 1), '#f4ecda', { edges: false }); coil.position.set(0, 0.045, 0); tok.add(coil);
  const tl = label('F', { size: 0.035, color: '#c2410c' }); tl.position.set(0, 0.07, 0); tok.add(tl);
  g.add(tok);
  const jars = carts.map((c, i) => { const j = jar({ max: 6, color: i ? '#1c7ed6' : '#e8590c', name: i ? 'a₂ =' : 'a₁ =', unit: 'm/s²', digits: 1 }); j.position.set(0.16 + i * 0.16, 0, -0.45); g.add(j); return j; });
  const run = (i) => {
    const C = carts[i]; if (C.moving) return; C.moving = true; C.F.visible = true; glow(C.F, '#e8590c', 1); glow(C.body, i ? '#1c7ed6' : '#e8590c', 0.6);
    const T = S.reduced ? 0.001 : Math.sqrt(2 * (X1 - X0) / (C.a * 0.11)), o = { k: 0 };
    gsap.to(o, { k: 1, duration: T, ease: 'none', onUpdate: () => { C.c.position.x = X0 + (X1 - X0) * o.k * o.k; jars[i].set(C.a * Math.min(1, o.k * 4), 0.05); }, onComplete: () => {
      jars[i].set(C.a, 0.2); S.sfx.click();
      setTimeout(() => gsap.to(C.c.position, { x: X0, duration: S.reduced ? 0 : 0.7, ease: 'power2.inOut', onComplete: () => { C.moving = false; glow(C.body, null, 0); if (!forceOn) C.F.visible = false; } }), 1400);
    } });
  };
  let forceOn = false;
  return {
    group: g,
    targets: [
      { obj: carts[0].c, hint: V(X0, 0, lanes[0] + 0.09), act: () => run(0) },
      { obj: carts[1].c, hint: V(X0, 0, lanes[1] + 0.09), act: () => run(1) },
      { obj: tok, hint: tok.position.clone(), act: () => { forceOn = !forceOn; carts.forEach((c) => { c.F.visible = forceOn || c.moving; glow(c.F, '#e8590c', forceOn ? 1 : 0); }); glow(coil, '#e8590c', forceOn ? 1 : 0); show(lf, forceOn); } },
    ],
    print(x, { P, inkLine, inkText }) {
      [-0.16, 0.24].forEach((z) => { for (let i = 0; i <= 6; i++) { const xx = X0 + (i * (X1 - X0)) / 6; inkLine(x, [P(xx, z + 0.065), P(xx, z + 0.085)], { w: 2, wob: 0 }); } });
      inkText(x, 'سطح أملس (الاحتكاك مهمل)', ...P(0.06, 0.37), { size: 26, color: '#6b6155' });
      inkText(x, 'a = F / m', ...P(0.25, 0.6), { size: 38, color: '#c2410c', weight: 600 });
      inkText(x, 'القوة نفسها، الكتلة مضاعفة', ...P(-0.08, 0.6), { size: 26 });
    },
    notes: [{ t: 'قوة السحب', at: [-0.05, 0.62], to: [-0.2, 0.52] }],
  };
};

/* ---------- 4. Torque / seesaw ---------- */
SCENES.seesaw = (S) => {
  const { THREE, V, gsap, ink, glow, label, jar, show } = S;
  const g = new THREE.Group(), FX = 0.06, M = 0.34;
  const tri = new THREE.Shape(); tri.moveTo(-0.06, 0); tri.lineTo(0.06, 0); tri.lineTo(0, 0.12); tri.closePath();
  const ful = ink(new THREE.ExtrudeGeometry(tri, { depth: 0.12, bevelEnabled: false }).translate(0, 0, -0.06), '#ede2c9'); ful.position.set(FX, 0, 0.05); g.add(ful);
  const piv = new THREE.Group(); piv.position.set(FX, 0.122, 0.05); g.add(piv);
  piv.add(ink(new THREE.BoxGeometry(0.8, 0.016, 0.12), '#f3ead8'));
  const wL = ink(new THREE.BoxGeometry(0.07, 0.07, 0.07), '#f0dfc0'); wL.position.set(-M, 0.043, 0); piv.add(wL);
  const wR = ink(new THREE.BoxGeometry(0.09, 0.09, 0.09), '#e7d1a8'); wR.position.set(M, 0.053, 0); piv.add(wR);
  const l1 = label('20 N', { size: 0.034 }); l1.position.set(-M, 0.09, 0); piv.add(l1);
  const l2 = label('40 N', { size: 0.034 }); l2.position.set(M, 0.11, 0); piv.add(l2);
  const ds = [1, 0.5, 0.25]; let di = 0, arcsOn = false;
  const arcs = [-1, 1].map((s) => { const a = ink(new THREE.TorusGeometry(0.08, 0.006, 6, 30, Math.PI * 0.7).rotateZ(s < 0 ? Math.PI * 0.15 : Math.PI * 0.15), '#f4ecda', { edges: false }); a.position.set(s * 0.2, 0.06, 0.08); a.visible = false; glow(a, s < 0 ? '#e8590c' : '#1c7ed6', 1, 0); piv.add(a); return a; });
  const jL = jar({ max: 45, color: '#e8590c', name: 'τ₁ =', unit: 'N·m' }); jL.position.set(-0.2, 0, -0.42); g.add(jL);
  const jR = jar({ max: 45, color: '#1c7ed6', name: 'τ₂ =', unit: 'N·m' }); jR.position.set(0.28, 0, -0.42); g.add(jR);
  const lb = label('Στ = 0', { color: '#2b8a3e', size: 0.04 }); lb.position.set(FX, 0.3, 0.05); lb.visible = false; g.add(lb);
  const tilt = () => {
    const tL = 20 * 1, tR = 40 * ds[di], ang = S.clamp(-(tR - tL) * 0.012, -0.2, 0.2);
    gsap.to(piv.rotation, { z: ang, duration: S.reduced ? 0 : 1.4, ease: 'elastic.out(1,0.4)' });
    jR.set(tR, 0.6, `τ₂ = 40 × ${ds[di]} = ${tR} N·m`);
    const bal = Math.abs(tR - tL) < 1e-6; show(lb, bal); glow(piv.children[0], '#2b8a3e', bal ? 0.7 : 0);
    if (bal) S.sfx.good();
    arcs[1].scale.setScalar(Math.sqrt(tR / 20));
  };
  piv.rotation.z = -0.2;
  return {
    group: g,
    targets: [
      { obj: wL, hint: V(FX - M, 0, 0.17), act: () => { glow(wL, '#e8590c', 0.9); jL.set(20, 0.6, 'τ₁ = 20 × 1 = 20 N·m'); } },
      { obj: wR, hint: V(FX + M, 0, 0.17), act: () => { di = (di + 1) % ds.length; glow(wR, '#1c7ed6', 0.9); gsap.to(wR.position, { x: M * ds[di], duration: S.reduced ? 0 : 0.6, ease: 'power2.inOut', onUpdate: () => l2.position.setX(wR.position.x) }); tilt(); } },
      { obj: ful, hint: V(FX, 0, 0.2), act: () => { arcsOn = !arcsOn; arcs.forEach((a) => S.show(a, arcsOn)); glow(ful, '#f08c00', arcsOn ? 0.7 : 0); jL.set(20, 0.6, 'τ₁ = 20 × 1 = 20 N·m'); tilt(); } },
    ],
    print(x, { P, inkLine, inkText }) {
      const zz = 0.24;
      inkLine(x, [P(FX - M, zz), P(FX + M, zz)], { w: 1.8 });
      [[-M, '1 m'], [M * 0.25, '0.25'], [M * 0.5, '0.5'], [M, '1 m']].forEach(([d, t]) => { inkLine(x, [P(FX + d, zz - 0.015), P(FX + d, zz + 0.015)], { w: 2, wob: 0 }); inkText(x, t, ...P(FX + d, zz + 0.045), { size: 24 }); });
      inkText(x, 'المحور', ...P(FX, zz + 0.045), { size: 24, color: '#c2410c' });
      inkText(x, 'τ = F ℓ sin θ', ...P(0.1, 0.45), { size: 40, color: '#c2410c', weight: 600 });
      inkText(x, '(θ = 90° هنا، فيكون τ = F ℓ)', ...P(0.1, 0.5), { size: 24, color: '#6b6155' });
      inkText(x, 'عزم مع عقارب الساعة = عزم عكسها', ...P(0.06, 0.58), { size: 27 });
    },
    notes: [{ t: 'حرّك الثقل 40 N', at: [0.33, 0.62], to: [0.4, 0.42] }],
  };
};

/* ---------- 5. Work ---------- */
SCENES.work = (S) => {
  const { THREE, V, gsap, ink, glow, arrow, label, jar, show } = S;
  const g = new THREE.Group(), X0 = -0.26, Z = 0.22, D = 0.5;
  const crate = new THREE.Group(); crate.position.set(X0, 0, Z); g.add(crate);
  const box = ink(new THREE.BoxGeometry(0.1, 0.1, 0.1).translate(0, 0.05, 0), '#e9c99a'); crate.add(box);
  for (const s of [1, -1]) { const p = ink(new THREE.BoxGeometry(0.13, 0.012, 0.004), '#d6ae78', { thresh: 40 }); p.rotation.z = s * Math.PI / 4; p.position.set(0, 0.05, 0.052); crate.add(p); }
  const pin = V(0.05, 0.05, 0), L = 0.2;
  const F = arrow('#e8590c', 0.009); crate.add(F); glow(F, '#e8590c', 0.85, 0);
  const handle = ink(new THREE.TorusGeometry(0.02, 0.006, 8, 20), '#f0e3c8', { edges: false }); crate.add(handle);
  const Fx = arrow('#1c7ed6', 0.007); Fx.visible = false; crate.add(Fx);
  const angs = [0, 37, 60, 90]; let ai = 0, th = 0;
  const setTh = (deg) => { th = deg; const r = (deg * Math.PI) / 180, tip = pin.clone().add(V(Math.cos(r) * L, Math.sin(r) * L, 0)); F.point(pin, tip); handle.position.copy(tip); handle.rotation.y = Math.PI / 2; Fx.point(pin.clone().add(V(0, -0.03, 0.03)), pin.clone().add(V(Math.cos(r) * L + 1e-4, -0.03, 0.03))); };
  setTh(0);
  const lt = label('θ = 0°', { size: 0.035, color: '#c2410c' }); lt.position.set(0.03, 0.2, 0); crate.add(lt);
  const J = jar({ max: 50, color: '#e8590c', name: 'W =', unit: 'J' }); J.position.set(0.36, 0, -0.3); g.add(J);
  const lw = label('', { size: 0.036, color: '#1864ab' }); lw.position.set(0.05, 0.3, -0.3); lw.visible = false; g.add(lw);
  const W = () => Math.round(10 * 5 * Math.cos((th * Math.PI) / 180));
  let moving = false;
  return {
    group: g,
    targets: [
      { obj: handle, hit: [handle, F], hint: V(X0 + 0.25, 0, Z), act: () => { ai = (ai + 1) % angs.length; const o = { d: th }; gsap.to(o, { d: angs[ai], duration: S.reduced ? 0 : 0.7, ease: 'back.out(2)', onUpdate: () => setTh(o.d), onComplete: () => setTh(angs[ai]) }); if (S.reduced) setTh(angs[ai]); lt.setText(`θ = ${angs[ai]}°`); } },
      { obj: box, hint: V(X0, 0, Z + 0.1), act: () => {
        if (moving) return; moving = true; J.set(0, 0.1); const w = W(), o = { k: 0 };
        gsap.to(o, { k: 1, duration: S.reduced ? 0.001 : 1.8, ease: 'power1.inOut', onUpdate: () => { crate.position.x = X0 + D * o.k; J.set(w * o.k, 0.05); }, onComplete: () => {
          J.set(w, 0.2); S.sfx.click(); setTimeout(() => gsap.to(crate.position, { x: X0, duration: S.reduced ? 0 : 0.8, ease: 'power2.inOut', onComplete: () => { moving = false; } }), 1500);
        } });
      } },
      { obj: J, hit: J.hit, hint: V(0.36, 0, -0.2), act: () => { Fx.visible = true; glow(Fx, '#1c7ed6', 1); lw.setText(`W = 10 × 5 × cos ${th}° = ${W()} J`); show(lw); glow(J.hit[0], '#e8590c', 0.6); } },
    ],
    print(x, { P, inkLine, inkText }) {
      const zz = Z + 0.08; inkLine(x, [P(X0 - 0.05, zz), P(X0 + D + 0.05, zz)], { w: 2.2 });
      for (let i = 0; i <= 5; i++) { const xx = X0 + (i * D) / 5; inkLine(x, [P(xx, zz - 0.012), P(xx, zz + 0.012)], { w: 2, wob: 0 }); inkText(x, `${i} m`, ...P(xx, zz + 0.04), { size: 22 }); }
      inkText(x, 'F = 10 N   ،   x = 5 m', ...P(0.05, 0.45), { size: 32, weight: 600 });
      inkText(x, 'نفترض أن الصندوق يقطع 5 m في كل حالة', ...P(0.05, 0.52), { size: 25, color: '#6b6155' });
      inkText(x, 'المركبة F cos θ هي التي تنجز الشغل', ...P(0.05, 0.6), { size: 27, color: '#1864ab' });
    },
    notes: [{ t: 'غيّر الزاوية θ', at: [-0.1, -0.15], to: [-0.08, 0.12] }, { t: 'اسحب الصندوق', at: [-0.27, -0.02], to: [-0.27, 0.15] }],
  };
};

/* ---------- 6. Thermodynamics ---------- */
SCENES.thermo = (S) => {
  const { THREE, V, gsap, ink, glow, label, jar, dots, show } = S;
  const g = new THREE.Group(), CX = -0.1, CZ = 0.02, R = 0.09, YB = 0.11;
  const burner = ink(new THREE.CylinderGeometry(0.06, 0.07, 0.035, 24).translate(0, 0.0175, 0), '#dcd2bf', { thresh: 20 }); burner.position.set(CX, 0, CZ); g.add(burner);
  const flame = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.07, 18).translate(0, 0.035, 0), new THREE.MeshBasicMaterial({ color: '#ff8c1a', transparent: true, opacity: 0.85, toneMapped: false }));
  flame.position.set(CX, 0.035, CZ); flame.scale.setScalar(0.35); g.add(flame);
  for (let i = 0; i < 3; i++) { const a = (i / 3) * Math.PI * 2 + 0.5, leg = ink(new THREE.BoxGeometry(0.008, YB, 0.008).translate(0, YB / 2, 0), '#e6dccb'); leg.position.set(CX + Math.cos(a) * 0.085, 0, CZ + Math.sin(a) * 0.085); g.add(leg); }
  const plate = ink(new THREE.CylinderGeometry(R + 0.012, R + 0.012, 0.012, 32), '#e9dfcb', { thresh: 20 }); plate.position.set(CX, YB, CZ); g.add(plate);
  const glassG = new THREE.CylinderGeometry(R, R, 0.32, 32, 1, true);
  const glass = new THREE.Mesh(glassG, new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.18, roughness: 0.05, side: THREE.DoubleSide, depthWrite: false }));
  glass.position.set(CX, YB + 0.16, CZ); glass.renderOrder = 3; g.add(glass);
  const ge = new THREE.LineSegments(new THREE.EdgesGeometry(glassG, 20), S.LINE_MAT); ge.position.copy(glass.position); g.add(ge);
  const gasMat = new THREE.MeshStandardMaterial({ color: '#f783ac', transparent: true, opacity: 0.22, depthWrite: false });
  const gas = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.97, R * 0.97, 1, 32).translate(0, 0.5, 0), gasMat); gas.position.set(CX, YB + 0.006, CZ); g.add(gas);
  const piston = new THREE.Group(); g.add(piston);
  const pd = ink(new THREE.CylinderGeometry(R * 0.96, R * 0.96, 0.026, 32), '#efe4cf', { thresh: 20 }); piston.add(pd);
  const rod = ink(new THREE.CylinderGeometry(0.008, 0.008, 0.16).translate(0, 0.09, 0)); piston.add(rod);
  const knob = ink(new THREE.SphereGeometry(0.018, 14, 10), '#e2d3b5', { thresh: 60 }); knob.position.y = 0.17; piston.add(knob);
  let PY = 0.24; const setP = (y) => { PY = y; piston.position.set(CX, y, CZ); gas.scale.y = y - 0.013 - (YB + 0.006); };
  setP(0.24);
  const mol = dots(26, '#c2255c', 0.0075), mv = [];
  for (let i = 0; i < 26; i++) mv.push({ p: V((Math.random() - 0.5) * 0.12, YB + 0.02 + Math.random() * 0.1, (Math.random() - 0.5) * 0.12), v: V(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize() });
  mol.position.set(CX, 0, CZ); g.add(mol);
  const heat = dots(22, '#ff922b', 0.007); heat.position.set(CX, 0, CZ); g.add(heat); const hp = [...Array(22)].map(() => Math.random());
  const names = [['ΔQ =', '#f08c00'], ['ΔW =', '#1c7ed6'], ['ΔU =', '#2b8a3e']];
  const jars = names.map(([n, c], i) => { const j = jar({ max: 2500, color: c, name: n, unit: 'J', h: 0.2 }); j.position.set(0.24 + (i % 2) * 0.17, 0, -0.5 + i * 0.2); g.add(j); return j; });
  const lu = label('', { size: 0.036, color: '#2b8a3e' }); lu.position.set(0.2, 0.3, -0.02); lu.visible = false; g.add(lu);
  let temp = 1, heating = 0, Q = 0, W = 0;
  return {
    group: g,
    targets: [
      { obj: burner, hit: [burner, flame], hint: V(CX + 0.12, 0, CZ + 0.08), act: () => { heating = S.reduced ? 0.01 : 2.4; Q = 1500; gsap.to(flame.scale, { x: 1, y: 1.3, z: 1, duration: 0.4 }); jars[0].set(1500, 2.2); gsap.to({ t: temp }, { t: temp + 0.9, duration: 2.2, onUpdate() { temp = this.targets()[0].t; } }); S.sfx.whoosh(); } },
      { obj: piston, hint: V(CX, 0, CZ - 0.13), act: () => {
        if (W) { W = 0; Q = 0; gsap.to({ y: PY }, { y: 0.24, duration: S.reduced ? 0 : 1, onUpdate() { setP(this.targets()[0].y); } }); jars.forEach((j) => j.set(0)); lu.visible = false; lu.userData._shown = false; temp = 1; glow(pd, null, 0); return; }
        W = 2200; glow(pd, '#1c7ed6', 0.8); jars[1].set(2200, 1.8);
        gsap.to({ y: PY }, { y: 0.34, duration: S.reduced ? 0 : 1.8, ease: 'power2.out', onUpdate() { setP(this.targets()[0].y); } }); if (S.reduced) setP(0.34);
        gsap.to({ t: temp }, { t: Math.max(0.45, temp - 0.8), duration: 1.8, onUpdate() { temp = this.targets()[0].t; } });
      } },
      { obj: jars[2], hit: jars[2].hit, hint: V(0.24, 0, -0.02), act: () => { const U = Q - W; jars[2].set(U, 1); lu.setText(`ΔU = ${Q} − ${W} = ${U < 0 ? '−' : ''}${Math.abs(U)} J`); show(lu); glow(jars[2].hit[0], '#2b8a3e', 0.6); } },
    ],
    update(dt, t) {
      const top = PY - 0.02, sp = 0.08 * temp;
      mv.forEach((m, i) => { m.p.addScaledVector(m.v, sp * dt);
        const rr = Math.hypot(m.p.x, m.p.z); if (rr > R * 0.85) { const nx = m.p.x / rr, nz = m.p.z / rr, d = m.v.x * nx + m.v.z * nz; if (d > 0) { m.v.x -= 2 * d * nx; m.v.z -= 2 * d * nz; } }
        if (m.p.y < YB + 0.015 && m.v.y < 0) m.v.y *= -1; if (m.p.y > top) { m.p.y = top; if (m.v.y > 0) m.v.y *= -1; }
        mol.setAt(i, m.p.x, m.p.y, m.p.z); });
      mol.commit();
      if (heating > 0) heating -= dt;
      const on = heating > 0;
      hp.forEach((p, i) => { hp[i] = (p + dt * 0.9) % 1; const a = i * 2.4; heat.setAt(i, Math.cos(a) * 0.025 * (1 - hp[i]), 0.04 + hp[i] * 0.08, Math.sin(a) * 0.025, on ? 1 : 0); });
      heat.commit();
      flame.scale.y = (on ? 1.3 : 0.35) * (1 + 0.12 * Math.sin(t * 23)); if (!on && flame.scale.x > 0.36) { flame.scale.x = flame.scale.z = Math.max(0.35, flame.scale.x - dt); }
    },
    print(x, { P, inkLine, inkText }) {
      const pts = []; for (let i = 0; i <= 60; i++) { const a = (i / 60) * Math.PI * 2; pts.push(P(CX + Math.cos(a) * 0.17, CZ + Math.sin(a) * 0.17)); }
      inkLine(x, pts, { w: 2, dash: [10, 8], color: '#6b6155' });
      inkText(x, 'حدود النظام', ...P(CX, CZ + 0.21), { size: 26, color: '#6b6155' });
      inkText(x, 'المحيط', ...P(CX - 0.2, -0.3), { size: 28, color: '#6b6155' });
      inkText(x, 'ΔU = ΔQ − ΔW', ...P(0.1, 0.45), { size: 40, color: '#c2410c', weight: 600 });
      inkText(x, 'ΔQ موجبة: حرارة داخلة · ΔW موجب: شغل ينجزه النظام', ...P(0.06, 0.55), { size: 25 });
    },
    notes: [{ t: 'سخّن الغاز', at: [-0.27, 0.36], to: [-0.13, 0.08] }, { t: 'المكبس', at: [-0.3, -0.4], to: [-0.14, -0.08] }],
  };
};

/* ---------- 7. Circular motion ---------- */
SCENES.circular = (S) => {
  const { THREE, V, gsap, ink, glow, arrow, label, jar, dots, show } = S;
  const g = new THREE.Group(), C = V(0.03, 0, 0.0), R = 0.24, Y = 0.07;
  const disk = ink(new THREE.CylinderGeometry(0.31, 0.31, 0.012, 64).translate(0, 0.006, 0), '#efe6d3', { thresh: 20 }); disk.position.copy(C); g.add(disk);
  const post = ink(new THREE.CylinderGeometry(0.014, 0.016, 0.14, 16).translate(0, 0.07, 0), '#e6d8bd', { thresh: 30 }); post.position.copy(C); g.add(post);
  const cap = ink(new THREE.SphereGeometry(0.022, 14, 10), '#e0cfae', { thresh: 60 }); cap.position.copy(C).setY(0.145); g.add(cap);
  const ball = ink(new THREE.SphereGeometry(0.026, 20, 14), '#f1d79e', { thresh: 60 }); g.add(ball);
  const str = ink(new THREE.CylinderGeometry(0.0025, 0.0025, 1, 6).rotateZ(-Math.PI / 2).translate(0.5, 0, 0), '#2a241c', { edges: false }); g.add(str);
  const Fc = arrow('#e03131', 0.009); g.add(Fc); glow(Fc, '#e03131', 1, 0);
  const Vv = arrow('#2b8a3e', 0.008); g.add(Vv); glow(Vv, '#2b8a3e', 1, 0);
  const trail = dots(14, '#f59f00', 0.008); g.add(trail);
  const knob = new THREE.Group(); knob.position.set(0.38, 0, 0.5);
  knob.add(ink(new THREE.CylinderGeometry(0.045, 0.05, 0.02, 24).translate(0, 0.01, 0), '#ede2cb', { thresh: 20 }));
  const ptr = ink(new THREE.BoxGeometry(0.05, 0.012, 0.012).translate(0.02, 0.026, 0), '#d9480f'); knob.add(ptr); g.add(knob);
  const lv = label('v', { size: 0.03, color: '#2b8a3e' }); lv.position.set(0, 0.05, 0); knob.add(lv);
  const sc = new THREE.Group(); sc.position.set(0.38, 0.01, -0.5);
  for (const s of [1, -1]) { const b = ink(new THREE.BoxGeometry(0.12, 0.006, 0.016).translate(0.05, 0, 0), '#dfe3e8'); b.rotation.y = s * 0.3; b.position.y = s > 0 ? 0.012 : 0.004; sc.add(b);
    const ring = ink(new THREE.TorusGeometry(0.018, 0.005, 8, 18).rotateX(Math.PI / 2), '#f0e3c8', { edges: false }); ring.position.set(-Math.cos(s * 0.3) * 0.03, 0.008, Math.sin(s * 0.3) * 0.03 * -1); sc.add(ring); }
  g.add(sc);
  const lf = label('v = 2 m/s , Fc = 2 N', { size: 0.033, color: '#e03131' }); lf.position.set(0.03, 0.27, -0.05); lf.visible = false; g.add(lf);
  const J = jar({ max: 8, color: '#e03131', name: 'Fc =', unit: 'N' }); J.position.set(-0.24, 0, -0.5); g.add(J);
  let spin = false, vf = 1, phi = 0, flying = null;
  const place = () => {
    const p = C.clone().add(V(Math.cos(phi) * R, Y, Math.sin(phi) * R)), tg = V(-Math.sin(phi), 0, Math.cos(phi));
    ball.position.copy(p); const c0 = C.clone().setY(Y); str.position.copy(c0); str.scale.x = R; str.rotation.y = -phi;
    Fc.point(p, p.clone().lerp(c0, (0.05 * vf * vf) / R)); Vv.point(p, p.clone().addScaledVector(tg, 0.07 * vf));
  };
  place();
  const start = () => { if (!spin) { spin = true; glow(post, '#f08c00', 0.7); J.set(2 * vf * vf); } };
  return {
    group: g,
    targets: [
      { obj: post, hit: [post, cap], hint: C.clone().add(V(0.06, 0, 0.06)), act: () => { if (spin && !flying) { spin = false; glow(post, null, 0); } else start(); } },
      { obj: knob, hint: knob.position.clone(), act: () => { vf = vf === 1 ? 2 : 1; gsap.to(ptr.rotation, { y: vf === 2 ? -1.2 : 0, duration: 0.4 }); lf.setText(vf === 2 ? 'v = 4 m/s , Fc = 8 N' : 'v = 2 m/s , Fc = 2 N'); show(lf); J.set(2 * vf * vf); start(); if (!flying) place(); } },
      { obj: sc, hint: sc.position.clone().setY(0), act: () => {
        if (flying) return; const cut = () => { const p = ball.position.clone(), tg = V(-Math.sin(phi), 0, Math.cos(phi)); flying = { p, tg, t: 0 }; str.visible = false; Fc.visible = false; S.sfx.whoosh(); };
        if (!spin) { start(); setTimeout(cut, S.reduced ? 0 : 1200); } else cut(); } },
    ],
    update(dt) {
      if (flying) {
        flying.t += dt; const sp = 0.32 * vf * 0.6; const p = flying.p.clone().addScaledVector(flying.tg, sp * flying.t);
        ball.position.copy(p); Vv.point(p, p.clone().addScaledVector(flying.tg, 0.07 * vf));
        const k = Math.min(13, Math.floor(flying.t / 0.12)); for (let i = 0; i <= k; i++) { const q = flying.p.clone().addScaledVector(flying.tg, sp * i * 0.12); trail.setAt(i, q.x, 0.01, q.z, 1); } trail.commit();
        if (flying.t > (S.reduced ? 0.6 : 2.4)) { flying = null; for (let i = 0; i < 14; i++) trail.setAt(i, 0, -9, 0, 0); trail.commit(); str.visible = true; Fc.visible = true; place(); ball.scale.setScalar(0.01); gsap.to(ball.scale, { x: 1, y: 1, z: 1, duration: 0.5, ease: 'back.out(3)' }); }
        return;
      }
      if (spin) { phi += dt * 1.25 * vf; place(); }
    },
    print(x, { P, inkLine, inkText }) {
      const pts = []; for (let i = 0; i <= 90; i++) { const a = (i / 90) * Math.PI * 2; pts.push(P(C.x + Math.cos(a) * R, C.z + Math.sin(a) * R)); }
      inkLine(x, pts, { w: 2, dash: [12, 9], color: '#6b6155' });
      inkText(x, 'المركز', ...P(C.x + 0.07, C.z + 0.05), { size: 24, color: '#6b6155' });
      inkText(x, 'Fc = m v² / r', ...P(-0.06, 0.45), { size: 40, color: '#c2410c', weight: 600 });
      inkText(x, 'r = 1 m ، m = 0.5 kg', ...P(-0.06, 0.53), { size: 28 });
      inkText(x, 'القوة المركزية (أحمر) · السرعة المماسية (أخضر)', ...P(0.0, 0.61), { size: 25 });
    },
    notes: [{ t: 'المقص', at: [0.25, -0.62], to: [0.36, -0.52] }, { t: 'ضاعف v', at: [0.2, 0.36], to: [0.35, 0.47] }],
  };
};

/* ---------- 8. Waves ---------- */
SCENES.waves = (S) => {
  const { THREE, V, gsap, ink, glow, label, show } = S;
  const g = new THREE.Group(), N = 38, XA = -0.25, XB = 0.43, Z = 0.26, Y = 0.1, A = 0.035;
  const posts = [XA - 0.04, XB + 0.01].map((x) => { const p = ink(new THREE.BoxGeometry(0.012, Y, 0.012).translate(0, Y / 2, 0), '#e6dccb'); p.position.set(x, 0, Z); g.add(p); return p; });
  const beads = []; for (let i = 0; i < N; i++) { const b = ink(new THREE.SphereGeometry(0.011, 12, 8), '#f2e4c6', { edges: false }); b.position.set(XA + ((XB - XA) * i) / (N - 1), Y, Z); g.add(b); beads.push(b); }
  const rope = new THREE.Line(new THREE.BufferGeometry().setFromPoints(beads.map((b) => b.position)), S.LINE_MAT); g.add(rope);
  const osc = new THREE.Group(); osc.position.set(XA - 0.06, 0, Z); g.add(osc);
  osc.add(ink(new THREE.BoxGeometry(0.07, 0.06, 0.09).translate(0, 0.03, 0), '#ece0c7'));
  const wheel = ink(new THREE.CylinderGeometry(0.035, 0.035, 0.012, 24).rotateX(Math.PI / 2), '#f1e6cf', { thresh: 20 }); wheel.position.set(0, Y, 0.05); osc.add(wheel);
  const crank = ink(new THREE.BoxGeometry(0.008, 0.03, 0.008).translate(0, 0.02, 0), '#c2410c'); wheel.add(crank);
  const lf = label('f = 2 Hz , λ = 1.0 m', { size: 0.034, color: '#7048e8' }); lf.position.set(-0.02, 0.29, Z - 0.05); lf.visible = false; g.add(lf);
  // spring mass
  const SX = 0.24, SZ = -0.3;
  const stand = ink(new THREE.BoxGeometry(0.16, 0.012, 0.1).translate(0, 0.006, 0), '#ece2cc'); stand.position.set(SX, 0, SZ); g.add(stand);
  const pole = ink(new THREE.CylinderGeometry(0.007, 0.007, 0.42).translate(0, 0.21, 0)); pole.position.set(SX + 0.06, 0, SZ); g.add(pole);
  const arm = ink(new THREE.BoxGeometry(0.1, 0.01, 0.012), '#e6dccb'); arm.position.set(SX + 0.02, 0.415, SZ); g.add(arm);
  const pts = []; for (let i = 0; i <= 220; i++) { const a = (i / 220) * Math.PI * 2 * 11; pts.push(V(Math.cos(a) * 0.018, -i / 220, Math.sin(a) * 0.018)); }
  const spring = ink(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 400, 0.0022, 5), '#3a3127', { edges: false }); spring.position.set(SX - 0.02, 0.41, SZ); g.add(spring);
  const mass = ink(new THREE.BoxGeometry(0.05, 0.05, 0.05), '#e7cf9f'); g.add(mass);
  const lm = label('T = 2π√(m/k)', { size: 0.03 }); lm.visible = false; g.add(lm);
  // ruler
  const ruler = ink(new THREE.BoxGeometry(0.62, 0.008, 0.035).translate(0, 0.004, 0), '#f3e9cf'); ruler.position.set(0.1, 0, 0.44); g.add(ruler);
  const mk = [0, 1].map(() => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.12, 0.005), new THREE.MeshBasicMaterial({ color: '#7048e8', toneMapped: false })); m.visible = false; g.add(m); return m; });
  const br = new THREE.Mesh(new THREE.BoxGeometry(1, 0.004, 0.004), new THREE.MeshBasicMaterial({ color: '#7048e8', toneMapped: false })); br.visible = false; g.add(br);
  const ll = label('λ', { size: 0.034, color: '#7048e8' }); ll.visible = false; g.add(ll);
  let f = 1, lam = 0.34, ph = 0, springOn = 0, sAmp = 0, showL = false;
  const VV = 0.34 * 0.55; // visual speed constant
  return {
    group: g,
    targets: [
      { obj: osc, hint: V(XA - 0.06, 0, Z + 0.1), act: () => { f = f === 1 ? 2 : 1; lam = 0.34 / f; lf.setText(f === 2 ? 'f = 4 Hz , λ = 0.5 m' : 'f = 2 Hz , λ = 1.0 m'); show(lf); beads.forEach((b, i) => glow(b, '#7048e8', 0.8)); setTimeout(() => beads.forEach((b) => glow(b, null, 0.15)), 1200); } },
      { obj: mass, hit: [mass, spring], hint: V(SX - 0.02, 0, SZ + 0.1), act: () => { springOn = 1; sAmp = 1; glow(mass, '#f08c00', 0.7); show(lm); } },
      { obj: ruler, hint: V(0.1, 0, 0.5), act: () => { showL = !showL; [...mk, br].forEach((m) => (m.visible = showL)); show(ll, showL); glow(ruler, '#7048e8', showL ? 0.6 : 0); } },
    ],
    update(dt, t) {
      const w = (2 * Math.PI * VV) / lam; ph += w * dt; const k = (2 * Math.PI) / lam;
      const pos = rope.geometry.attributes.position;
      beads.forEach((b, i) => { const x = b.position.x, d = x - XA, env = Math.min(1, d / 0.04 + 0.2); b.position.y = Y + A * env * Math.sin(ph - k * d); pos.setXYZ(i, x, b.position.y, Z); });
      pos.needsUpdate = true; wheel.rotation.z = ph;
      if (showL) {
        // crests: ph - k d = π/2 + 2πn  ->  d = (ph - π/2 - 2πn)/k
        let n = Math.floor((ph - Math.PI / 2 - k * 0.12) / (2 * Math.PI)); let d1 = (ph - Math.PI / 2 - 2 * Math.PI * n) / k;
        while (d1 < 0.12) { n--; d1 = (ph - Math.PI / 2 - 2 * Math.PI * n) / k; }
        const x1 = XA + d1, x2 = x1 + lam; mk[0].position.set(x1, Y + 0.08, Z); mk[1].position.set(x2, Y + 0.08, Z);
        br.position.set((x1 + x2) / 2, Y + 0.12, Z); br.scale.x = lam; ll.position.set((x1 + x2) / 2, Y + 0.13, Z);
        const vis = x2 < XB; mk[1].visible = vis; br.visible = vis; ll.visible = vis && ll.userData._shown;
      }
      sAmp = Math.max(0, sAmp - dt * 0.06);
      const s = 1 + 0.32 * sAmp * Math.sin(t * 4.2) * springOn; spring.scale.y = 0.17 * s; mass.position.set(SX - 0.02, 0.41 - 0.17 * s - 0.025, SZ); lm.position.set(SX - 0.12, 0.3, SZ);
    },
    print(x, { P, inkLine, inkText, inkArrowHead }) {
      inkLine(x, [P(XA, Z), P(XB, Z)], { w: 1.6, dash: [8, 8], color: '#8a7f70' });
      inkText(x, 'موضع الاستقرار', ...P(0.3, Z + 0.06), { size: 24, color: '#6b6155' });
      const a = P(-0.05, Z - 0.17), b = P(0.25, Z - 0.17); inkLine(x, [a, b], { w: 2.2 }); inkArrowHead(x, a, b);
      inkText(x, 'اتجاه الانتشار', ...P(0.1, Z - 0.2), { size: 25 });
      inkText(x, 'v = f λ', ...P(-0.15, -0.3), { size: 44, color: '#c2410c', weight: 600 });
      inkText(x, 'v = 2 m/s ثابتة في الحبل', ...P(-0.15, -0.22), { size: 26 });
      for (let i = 0; i <= 12; i++) { const xx = 0.1 - 0.3 + i * 0.05; inkLine(x, [P(xx, 0.48), P(xx, i % 2 ? 0.49 : 0.5)], { w: 1.5, wob: 0 }); }
    },
    notes: [{ t: 'المذبذب', at: [-0.2, 0.55], to: [-0.3, 0.36] }, { t: 'المسطرة', at: [0.36, 0.6], to: [0.3, 0.47] }],
  };
};

/* ---------- 9. Electric circuit ---------- */
SCENES.circuit = (S) => {
  const { THREE, V, gsap, ink, glow, arrow, label, jar, dots, show } = S;
  const g = new THREE.Group(), Y = 0.03, xl = -0.27, xr = 0.4, zt = -0.42, zb = 0.42;
  const path = new THREE.CurvePath();
  const ptsP = [V(xl, Y, -0.09), V(xl, Y, zt), V(xr, Y, zt), V(xr, Y, zb), V(xl, Y, zb), V(xl, Y, 0.09)];
  for (let i = 0; i < ptsP.length - 1; i++) path.add(new THREE.LineCurve3(ptsP[i], ptsP[i + 1]));
  for (let i = 0; i < ptsP.length - 1; i++) { const a = ptsP[i], b = ptsP[i + 1], L = a.distanceTo(b); const w = ink(new THREE.CylinderGeometry(0.007, 0.007, L, 8), '#c9b48a', { edges: false }); w.position.copy(a).lerp(b, 0.5); w.quaternion.setFromUnitVectors(V(0, 1, 0), b.clone().sub(a).normalize()); g.add(w); }
  const bat = new THREE.Group(); bat.position.set(xl, 0.05, 0); g.add(bat);
  bat.add(ink(new THREE.CylinderGeometry(0.045, 0.045, 0.17, 24).rotateX(Math.PI / 2), '#e6d6ad', { thresh: 20 }));
  const band = ink(new THREE.CylinderGeometry(0.046, 0.046, 0.05, 24).rotateX(Math.PI / 2), '#c99712', { thresh: 20 }); band.position.z = -0.06; bat.add(band);
  const term = ink(new THREE.CylinderGeometry(0.015, 0.015, 0.02, 12).rotateX(Math.PI / 2), '#bfb39b', { thresh: 20 }); term.position.z = -0.095; bat.add(term);
  const lp = label('+', { size: 0.04, color: '#c92a2a', border: false }); lp.position.set(0.06, 0.02, -0.07); bat.add(lp);
  const ln = label('−', { size: 0.04, color: '#1864ab', border: false }); ln.position.set(0.06, 0.02, 0.07); bat.add(ln);
  // bulb on top wire
  const BX = 0.06; const bb = ink(new THREE.CylinderGeometry(0.024, 0.028, 0.045, 18).translate(0, 0.022, 0), '#bfb39b', { thresh: 30 }); bb.position.set(BX, Y - 0.008, zt); g.add(bb);
  const bulb = ink(new THREE.SphereGeometry(0.048, 24, 18), '#f6f0de', { thresh: 60 }); bulb.position.set(BX, Y + 0.08, zt); g.add(bulb);
  const bl = new THREE.PointLight(0xffd36a, 0, 0.9, 2); bl.position.copy(bulb.position); g.add(bl);
  // switch on right wire
  const swb = ink(new THREE.BoxGeometry(0.05, 0.014, 0.14).translate(0, 0.007, 0), '#ece0c7'); swb.position.set(xr, Y - 0.01, 0); g.add(swb);
  const sw = new THREE.Group(); sw.position.set(xr, Y + 0.012, -0.06); g.add(sw);
  const lever = ink(new THREE.BoxGeometry(0.014, 0.012, 0.13).translate(0, 0, 0.065), '#d9480f'); sw.add(lever); sw.rotation.x = -0.6;
  // resistor + bridge on bottom wire
  const res = new THREE.Group(); const RX = 0.08; res.position.set(RX, 0.04, 0.58); g.add(res);
  res.add(ink(new THREE.CylinderGeometry(0.022, 0.022, 0.11, 18).rotateZ(Math.PI / 2), '#e9d8b4', { thresh: 20 }));
  ['#8b4513', '#111', '#c92a2a'].forEach((c, i) => { const r = ink(new THREE.CylinderGeometry(0.0235, 0.0235, 0.008, 18).rotateZ(Math.PI / 2), c, { edges: false }); r.position.x = -0.03 + i * 0.022; res.add(r); });
  const bridge = ink(new THREE.CylinderGeometry(0.008, 0.008, 0.13, 8).rotateZ(Math.PI / 2), '#d9480f', { edges: false }); bridge.position.set(RX, Y + 0.004, zb); g.add(bridge);
  const lr = label('R = 3 Ω', { size: 0.03 }); lr.position.set(0, 0.04, 0); res.add(lr);
  // current direction cones on top wire
  const cones = [-0.14, 0.24].map((xx) => { const c = ink(new THREE.ConeGeometry(0.016, 0.04, 14).rotateZ(-Math.PI / 2), '#f4ecda', { edges: false }); c.position.set(xx, Y + 0.035, zt); glow(c, '#e03131', 0.3, 0); g.add(c); return c; });
  const el = dots(30, '#1971c2', 0.009); g.add(el); const es = [...Array(30)].map((_, i) => i / 30);
  const J = jar({ max: 2.5, color: '#f08c00', name: 'I =', unit: 'A', digits: 1 }); J.position.set(0.17, 0, 0.06); g.add(J);
  const li = label('', { size: 0.034, color: '#1864ab' }); li.position.set(0.08, 0.3, 0.06); li.visible = false; g.add(li);
  let closed = false, inserted = false, I = 0;
  const upd = () => {
    I = closed ? (inserted ? 1 : 2) : 0; J.set(I, 0.7);
    const br = (I / 2) ** 2; glow(bulb, '#ffd43b', br); gsap.to(bl, { intensity: 0.9 * br, duration: 0.5 }); cones.forEach((c) => glow(c, '#e03131', I ? 1 : 0.3));
  };
  return {
    group: g,
    targets: [
      { obj: sw, hit: [sw, swb], hint: V(xr - 0.08, 0, 0), act: () => { closed = !closed; gsap.to(sw.rotation, { x: closed ? 0 : -0.6, duration: S.reduced ? 0 : 0.35, ease: 'back.out(2)' }); upd(); } },
      { obj: res, hint: V(RX, 0, 0.58), act: () => { inserted = !inserted; gsap.to(res.position, { z: inserted ? zb : 0.58, y: inserted ? Y + 0.02 : 0.04, duration: S.reduced ? 0 : 0.6, ease: 'power2.inOut' }); bridge.visible = !inserted; upd(); } },
      { obj: J, hit: J.hit, hint: V(0.17, 0, 0.16), act: () => { li.setText(closed ? `I = V / R = 6 / ${inserted ? 6 : 3} = ${I} A` : 'I = 0 A (open)'); show(li); glow(J.hit[0], '#f08c00', 0.6); } },
    ],
    update(dt) {
      const sp = I * 0.045;
      es.forEach((s, i) => { es[i] = (s - sp * dt + 1) % 1; const p = path.getPoint(es[i]); el.setAt(i, p.x, p.y + 0.012, p.z, 1); });
      el.commit();
    },
    print(x, { P, inkLine, inkText, inkArrowHead }) {
      inkText(x, 'البطارية 6 V', ...P(xl + 0.02, 0.17), { size: 26 });
      inkText(x, 'المصباح 3 Ω', ...P(BX, zt + 0.1), { size: 26 });
      inkText(x, 'المفتاح', ...P(xr - 0.08, 0.12), { size: 26 });
      const a = P(-0.12, -0.3), b = P(0.16, -0.3); inkLine(x, [a, b], { w: 2.4, color: '#c92a2a' }); inkArrowHead(x, a, b, '#c92a2a');
      inkText(x, 'التيار الاصطلاحي I', ...P(0.02, -0.26), { size: 25, color: '#c92a2a' });
      const c = P(0.16, -0.2), d = P(-0.12, -0.2); inkLine(x, [c, d], { w: 2.4, color: '#1864ab' }); inkArrowHead(x, c, d, '#1864ab');
      inkText(x, 'حركة الإلكترونات', ...P(0.02, -0.16), { size: 25, color: '#1864ab' });
      inkText(x, 'I = Δq / Δt', ...P(0.06, 0.3), { size: 38, color: '#c2410c', weight: 600 });
      inkText(x, 'أضف المقاومة إلى الدائرة', ...P(0.12, 0.65), { size: 25, color: '#6b6155' });
    },
    notes: [],
  };
};

/* ---------- 10. Magnetism ---------- */
SCENES.magnet = (S) => {
  const { THREE, V, gsap, ink, glow, arrow, label, jar, show } = S;
  const g = new THREE.Group(), M = V(-0.07, 0.03, -0.32);
  const mag = new THREE.Group(); mag.position.copy(M); g.add(mag);
  const nH = ink(new THREE.BoxGeometry(0.12, 0.04, 0.06).translate(0.06, 0, 0), '#f3b5ab'); mag.add(nH);
  const sH = ink(new THREE.BoxGeometry(0.12, 0.04, 0.06).translate(-0.06, 0, 0), '#b8cdf0'); mag.add(sH);
  const lN = label('N', { size: 0.035, color: '#c92a2a' }); lN.position.set(0.09, 0.025, 0); mag.add(lN);
  const lS = label('S', { size: 0.035, color: '#1864ab' }); lS.position.set(-0.09, 0.025, 0); mag.add(lS);
  let pol = 1;
  const field = (x, z) => {
    let bx = 0, bz = 0;
    [[M.x + 0.1 * pol, 1], [M.x - 0.1 * pol, -1]].forEach(([px, q]) => { const dx = x - px, dz = z - M.z, r3 = Math.pow(dx * dx + dz * dz, 1.5) + 1e-6; bx += (q * dx) / r3; bz += (q * dz) / r3; });
    return [bx, bz];
  };
  const comps = [];
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + 0.31, cx = M.x + Math.cos(a) * 0.24, cz = M.z + Math.sin(a) * 0.17;
    const c = new THREE.Group(); c.position.set(cx, 0, cz); g.add(c);
    c.add(ink(new THREE.CylinderGeometry(0.025, 0.027, 0.01, 22).translate(0, 0.005, 0), '#f1e8d6', { thresh: 20 }));
    const nd = new THREE.Group(); nd.position.y = 0.016; c.add(nd);
    const red = ink(new THREE.ConeGeometry(0.007, 0.024, 4).rotateZ(-Math.PI / 2).translate(0.012, 0, 0), '#e03131', { edges: false }); nd.add(red);
    const wht = ink(new THREE.ConeGeometry(0.007, 0.024, 4).rotateZ(Math.PI / 2).translate(-0.012, 0, 0), '#e9ecef', { edges: false }); nd.add(wht);
    glow(red, '#e03131', 0.7, 0);
    const [bx, bz] = field(cx, cz); nd.rotation.y = -Math.atan2(bz, bx); comps.push({ c, nd, cx, cz });
  }
  // charge
  const S0 = V(-0.25, 0.08, 0.16);
  const q = ink(new THREE.SphereGeometry(0.018, 18, 12), '#fbe1ec', { thresh: 60 }); q.position.copy(S0); glow(q, '#e64980', 0.6, 0); g.add(q);
  const lq = label('+q', { size: 0.03, color: '#c2255c' }); lq.position.set(S0.x, S0.y + 0.03, S0.z); g.add(lq);
  const vA = arrow('#2b8a3e', 0.007); g.add(vA); glow(vA, '#2b8a3e', 1, 0);
  const fA = arrow('#e8590c', 0.007); g.add(fA); glow(fA, '#e8590c', 1, 0); fA.visible = false;
  const tg = new THREE.BufferGeometry(); const tp = new Float32Array(400 * 3); tg.setAttribute('position', new THREE.BufferAttribute(tp, 3)); tg.setDrawRange(0, 0);
  const trail = new THREE.Line(tg, new THREE.LineBasicMaterial({ color: '#e64980', toneMapped: false })); g.add(trail);
  // dial
  const dial = new THREE.Group(); dial.position.set(0.37, 0, 0.6); g.add(dial);
  dial.add(ink(new THREE.CylinderGeometry(0.045, 0.05, 0.016, 28).translate(0, 0.008, 0), '#ede2cb', { thresh: 20 }));
  const dp = ink(new THREE.BoxGeometry(0.045, 0.01, 0.01).translate(0.022, 0.022, 0), '#c2255c'); dial.add(dp);
  const thetas = [0, 30, 90]; let ti = 0;
  const J = jar({ max: 1, color: '#e64980', name: 'sin θ =', digits: 2 }); J.position.set(0.37, 0, 0.3); g.add(J);
  const lt = label('θ = 0° → F = 0', { size: 0.032, color: '#c2255c' }); lt.position.set(0.12, 0.3, 0.42); lt.visible = false; g.add(lt);
  const vdir = (th) => V(Math.cos(th), 0, Math.sin(th));
  const setV = () => { const th = (thetas[ti] * Math.PI) / 180; vA.point(q.position, q.position.clone().addScaledVector(vdir(th), 0.08)); };
  setV();
  let fly = null;
  const W = 2.4, V0 = 0.12 * W;
  return {
    group: g,
    targets: [
      { obj: mag, hint: V(M.x, 0, M.z + 0.07), act: () => {
        pol *= -1; gsap.to(mag.rotation, { y: mag.rotation.y + Math.PI, duration: S.reduced ? 0 : 0.8, ease: 'power2.inOut' });
        comps.forEach((c) => { const [bx, bz] = field(c.cx, c.cz); let tgt = -Math.atan2(bz, bx); while (tgt - c.nd.rotation.y > Math.PI) tgt -= 2 * Math.PI; while (tgt - c.nd.rotation.y < -Math.PI) tgt += 2 * Math.PI; gsap.to(c.nd.rotation, { y: tgt, duration: S.reduced ? 0 : 1.2, ease: 'elastic.out(1,0.5)', delay: S.reduced ? 0 : 0.3 }); });
        S.reprint();
      } },
      { obj: q, hint: V(S0.x, 0, S0.z + 0.06), act: () => { if (fly) return; fly = { t: 0, th: (thetas[ti] * Math.PI) / 180, n: 0 }; fA.visible = thetas[ti] !== 0; tg.setDrawRange(0, 0); S.sfx.whoosh(); } },
      { obj: dial, hint: V(0.37, 0, 0.6), act: () => {
        ti = (ti + 1) % thetas.length; const d = thetas[ti]; gsap.to(dp.rotation, { y: -(d * Math.PI) / 180, duration: 0.4 });
        const s = Math.sin((d * Math.PI) / 180); J.set(s, 0.6, `sin ${d}° = ${s.toFixed(2)}`); lt.setText(d === 0 ? 'θ = 0° → F = 0' : d === 90 ? 'θ = 90° → F = qvB' : 'θ = 30° → F = 0.5 qvB'); show(lt); if (!fly) setV();
      } },
    ],
    update(dt) {
      if (!fly) return;
      fly.t += dt; const t = fly.t, th = fly.th, vpar = V0 * Math.cos(th), r = (V0 * Math.sin(th)) / W;
      const p = S0.clone().add(V(vpar * t, r * (1 - Math.cos(W * t)), r * Math.sin(W * t)));
      const v = V(vpar, r * W * Math.sin(W * t), r * W * Math.cos(W * t));
      q.position.copy(p); lq.position.set(p.x, p.y + 0.03, p.z);
      vA.point(p, p.clone().addScaledVector(v.clone().normalize(), 0.08));
      if (r > 1e-6) { const f = V(0, Math.cos(W * t), -Math.sin(W * t)); fA.point(p, p.clone().addScaledVector(f, 0.07 * Math.sin(th) + 0.01)); }
      if (fly.n < 400) { tp.set([p.x, p.y, p.z], fly.n * 3); fly.n++; tg.setDrawRange(0, fly.n); tg.attributes.position.needsUpdate = true; }
      const maxT = S.reduced ? 0.01 : th > 1.5 ? (2 * Math.PI * 2) / W : 4;
      if (p.x > 0.42 || t > maxT) {
        const done = fly; fly = null;
        setTimeout(() => { if (fly) return; q.position.copy(S0); lq.position.set(S0.x, S0.y + 0.03, S0.z); fA.visible = false; setV(); tg.setDrawRange(0, 0); }, 1800);
      }
    },
    print(x, { P, inkLine, inkText, inkArrowHead }) {
      // traced field lines of the bar magnet
      const np = M.x + 0.1 * pol, sp = M.x - 0.1 * pol;
      for (let k = 0; k < 14; k++) {
        const a = (k / 14) * Math.PI * 2; let cx = np + Math.cos(a) * 0.018, cz = M.z + Math.sin(a) * 0.018; const pts = [P(cx, cz)];
        for (let s = 0; s < 700; s++) { const [bx, bz] = field(cx, cz), m = Math.hypot(bx, bz); cx += (bx / m) * 0.004; cz += (bz / m) * 0.004; pts.push(P(cx, cz)); if (Math.hypot(cx - sp, cz - M.z) < 0.02 || cx < -0.4 || cx > 0.46 || cz < -0.64 || cz > -0.02) break; }
        if (pts.length > 8) { inkLine(x, pts, { w: 1.6, color: 'rgba(40,60,110,0.55)', wob: 0.6, seed: k }); const m = Math.floor(pts.length / 2); inkArrowHead(x, pts[m - 2], pts[m], 'rgba(40,60,110,0.8)', 12); }
      }
      // uniform field region
      inkLine(x, [P(-0.33, 0.02), P(0.46, 0.02), P(0.46, 0.66), P(-0.33, 0.66), P(-0.33, 0.02)], { w: 2, dash: [10, 7], color: '#6b6155' });
      for (let r = 0; r < 5; r++) { const zz = 0.08 + r * 0.115; for (let c = 0; c < 3; c++) { const a = P(-0.28 + c * 0.26, zz), b = P(-0.12 + c * 0.26, zz); inkLine(x, [a, b], { w: 1.8, color: 'rgba(40,60,110,0.5)' }); inkArrowHead(x, a, b, 'rgba(40,60,110,0.6)', 12); } }
      inkText(x, 'مجال منتظم B', ...P(0.06, 0.045), { size: 26, color: '#1864ab', weight: 600 });
      inkText(x, 'F = |q| v B sin θ', ...P(0.04, -0.08), { size: 36, color: '#c2410c', weight: 600 });
    },
    notes: [],
  };
};

/* ---------- shared: a paper token disc with a printed symbol ---------- */
function token(S, sym, color, pos) {
  const { THREE, ink, label } = S;
  const t = new THREE.Group(); t.position.copy(pos);
  t.add(ink(new THREE.CylinderGeometry(0.042, 0.047, 0.026, 32).translate(0, 0.013, 0), '#f3ecdc', { thresh: 20 }));
  const l = label(sym, { size: 0.036, color }); l.position.set(0, 0.035, 0); t.add(l);
  return t;
}
function dashed(S, a, b, color = '#5b4f42') {
  const { THREE } = S;
  const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints([a, b]), new THREE.LineDashedMaterial({ color, dashSize: 0.012, gapSize: 0.008 }));
  l.computeLineDistances(); l.setEnds = (p, q) => { l.geometry.setFromPoints([p, q]); l.computeLineDistances(); }; return l;
}

/* ---------- 1-1, 1-2 Coordinate systems ---------- */
SCENES.coords = (S) => {
  const { THREE, V, gsap, ink, glow, arrow, label, show } = S;
  const g = new THREE.Group(), u = 0.075, O = V(-0.02, 0, 0.08), Y = 0.07;
  const pts = [[3, 4], [-3.5, -2.5], [-3, 2], [2.5, -3]];
  let pi = 0, cart = false, polar = false;
  const W = (x, y, h = 0) => V(O.x + x * u, h, O.z - y * u);
  const post = ink(new THREE.CylinderGeometry(0.004, 0.004, Y).translate(0, Y / 2, 0), '#efe5d0', { edges: false }); g.add(post);
  const P = ink(new THREE.SphereGeometry(0.022, 20, 14), '#f6d2c4', { thresh: 60 }); glow(P, '#e8590c', 0.7, 0); g.add(P);
  const lp = label('P(3 , 4)', { size: 0.036, color: '#c2410c' }); g.add(lp);
  const dx = dashed(S, V(), V()), dy = dashed(S, V(), V()); dx.visible = dy.visible = false; g.add(dx, dy);
  const lx = label('x = 3', { size: 0.032, color: '#1864ab' }), ly = label('y = 4', { size: 0.032, color: '#1864ab' }); lx.visible = ly.visible = false; g.add(lx, ly);
  const R = arrow('#2b8a3e', 0.009); R.visible = false; g.add(R);
  let arc = null; const lr = label('', { size: 0.034, color: '#2b8a3e' }); lr.visible = false; g.add(lr);
  const tC = token(S, '(x , y)', '#1864ab', V(0.38, 0, -0.5)); g.add(tC);
  const tP = token(S, '(r , θ)', '#2b8a3e', V(0.38, 0, -0.3)); g.add(tP);
  const place = (instant) => {
    const [x, y] = pts[pi], p = W(x, y, Y), r = Math.hypot(x, y); let th = Math.atan2(y, x); if (th < 0) th += 2 * Math.PI;
    const go = () => { post.position.set(p.x, 0, p.z); P.position.copy(p); lp.position.set(p.x, Y + 0.035, p.z); };
    if (instant || S.reduced) go(); else { const from = P.position.clone(), o = { k: 0 }; gsap.to(o, { k: 1, duration: 0.8, ease: 'power2.inOut', onUpdate: () => { const q = from.clone().lerp(p, o.k); q.y = Y + Math.sin(Math.PI * o.k) * 0.12; P.position.copy(q); post.position.set(q.x, 0, q.z); lp.position.set(q.x, q.y + 0.035, q.z); }, onComplete: go }); }
    lp.setText(`P(${x} , ${y})`);
    dx.setEnds(W(x, y, 0.004), W(x, 0, 0.004)); dy.setEnds(W(x, y, 0.004), W(0, y, 0.004));
    lx.position.copy(W(x / 2, 0, 0.01)).add(V(0, 0, 0.04)); lx.setText(`x = ${x}`);
    ly.position.copy(W(0, y / 2, 0.01)).add(V(-0.06, 0, 0)); ly.setText(`y = ${y}`);
    R.point(W(0, 0, 0.012), W(x, y, 0.012));
    if (arc) { g.remove(arc); arc.geometry.dispose(); }
    arc = ink(new THREE.TorusGeometry(0.06, 0.004, 6, 48, th).rotateX(-Math.PI / 2), '#f4ecda', { edges: false });
    arc.position.copy(W(0, 0, 0.014)); glow(arc, '#2b8a3e', 1, 0); arc.visible = polar; g.add(arc);
    lr.setText(`r = ${r.toFixed(2)} , θ = ${(th * 180 / Math.PI).toFixed(1)}°`); lr.position.copy(W(x * 0.5, y * 0.5, 0.06));
  };
  place(true);
  return {
    group: g,
    targets: [
      { obj: P, hit: [P, post], hint: W(3, 4).add(V(0, 0, 0.05)), act: () => { pi = (pi + 1) % pts.length; place(false); } },
      { obj: tC, hint: tC.position.clone(), act: () => { cart = !cart; dx.visible = dy.visible = cart; show(lx, cart); show(ly, cart); glow(tC, '#1864ab', cart ? 0.6 : 0); } },
      { obj: tP, hint: tP.position.clone(), act: () => { polar = !polar; R.visible = polar; glow(R, '#2b8a3e', 1); if (arc) arc.visible = polar; show(lr, polar); glow(tP, '#2b8a3e', polar ? 0.6 : 0); } },
    ],
    print(x, { P: Pc, inkLine, inkText, inkArrowHead }) {
      for (let i = -5; i <= 5; i++) { inkLine(x, [Pc(O.x + i * u, O.z - 5 * u), Pc(O.x + i * u, O.z + 5 * u)], { w: 1, color: 'rgba(60,100,140,0.22)', wob: 0 }); inkLine(x, [Pc(O.x - 5 * u, O.z + i * u), Pc(O.x + 5 * u, O.z + i * u)], { w: 1, color: 'rgba(60,100,140,0.22)', wob: 0 }); }
      const a = Pc(O.x - 5.3 * u, O.z), b = Pc(O.x + 5.3 * u, O.z), c = Pc(O.x, O.z + 5.3 * u), d = Pc(O.x, O.z - 5.3 * u);
      inkLine(x, [a, b], { w: 2.4 }); inkArrowHead(x, a, b); inkLine(x, [c, d], { w: 2.4 }); inkArrowHead(x, c, d);
      inkText(x, 'x', b[0] - 6, b[1] + 26, { size: 30 }); inkText(x, 'y', d[0] + 20, d[1] + 8, { size: 30 }); inkText(x, 'O', ...Pc(O.x - 0.025, O.z + 0.03), { size: 28 });
      for (let i = -4; i <= 4; i++) if (i) { inkText(x, String(i), ...Pc(O.x + i * u, O.z + 0.028), { size: 20, color: '#6b6155' }); inkText(x, String(i), ...Pc(O.x - 0.025, O.z - i * u), { size: 20, color: '#6b6155' }); }
      [['الربع الأول', 2.5, 4.5], ['الربع الثاني', -2.5, 4.5], ['الربع الثالث', -2.5, -4.5], ['الربع الرابع', 2.5, -4.5]].forEach(([t, qx, qy]) => inkText(x, t, ...Pc(O.x + qx * u, O.z - qy * u), { size: 24, color: '#8a7f70' }));
      inkText(x, 'x = r cos θ   ،   y = r sin θ', ...Pc(0.0, 0.56), { size: 30, color: '#c2410c', weight: 600 });
    },
    notes: [{ t: 'انقر P لتغيير موقعها', at: [-0.25, -0.55], to: [0.18, -0.24] }],
  };
};

/* ---------- 1-3, 1-4 Scalars, vectors, properties ---------- */
SCENES.vecprops = (S) => {
  const { THREE, V, gsap, ink, glow, arrow, label, show } = S;
  const g = new THREE.Group(), u = 0.08, Y = 0.05;
  const A0 = V(-0.3, Y, 0.38);
  const A = arrow('#e8590c', 0.011, { posts: true }); A.point(A0, A0.clone().add(V(3 * u, 0, 0))); glow(A, '#e8590c', 0.9, 0); g.add(A);
  const la = label('A ، |A| = 3', { size: 0.034, color: '#c2410c' }); la.position.copy(A0).add(V(1.5 * u, 0.04, 0)); g.add(la);
  const Ac = arrow('#e8590c', 0.011, { posts: true }); Ac.visible = false; g.add(Ac);
  const lac = label('A′ = A', { size: 0.034, color: '#c2410c' }); lac.visible = false; g.add(lac);
  const N = arrow('#1c7ed6', 0.011, { posts: true }); N.visible = false; g.add(N);
  const ln = label('−A', { size: 0.036, color: '#1864ab' }); ln.visible = false; g.add(ln);
  const K = arrow('#2b8a3e', 0.011, { posts: true }); K.visible = false; g.add(K);
  const lk = label('', { size: 0.034, color: '#2b8a3e' }); lk.visible = false; g.add(lk);
  const tE = token(S, '=', '#c2410c', V(0.38, 0, -0.5)), tN = token(S, '−', '#1864ab', V(0.38, 0, -0.28)), tK = token(S, 'k', '#2b8a3e', V(0.38, 0, -0.06));
  g.add(tE, tN, tK);
  const ks = [2, 0.5, -1.5]; let ki = -1;
  return {
    group: g,
    targets: [
      { obj: tE, hint: tE.position.clone(), act: () => {
        Ac.visible = true; glow(Ac, '#e8590c', 0.9); const from = A0.clone(), to = V(-0.12, Y, 0.0), o = { k: 0 };
        const go = () => { const t = from.clone().lerp(to, o.k); t.y = Y + Math.sin(Math.PI * o.k) * 0.1; Ac.point(t, t.clone().add(V(3 * u, 0, 0))); };
        gsap.to(o, { k: 1, duration: S.reduced ? 0 : 1, ease: 'power2.inOut', onUpdate: go, onComplete: () => { o.k = 1; go(); lac.position.copy(to).add(V(1.5 * u, 0.04, 0)); show(lac); } });
        glow(tE, '#e8590c', 0.6);
      } },
      { obj: tN, hint: tN.position.clone(), act: () => { N.visible = true; const s = V(0.2, Y, -0.22); N.point(s, s.clone().add(V(-3 * u, 0, 0))); glow(N, '#1c7ed6', 0.9); show(N); ln.position.copy(s).add(V(-1.5 * u, 0.04, 0)); show(ln); glow(tN, '#1864ab', 0.6); } },
      { obj: tK, hint: tK.position.clone(), act: () => {
        ki = (ki + 1) % ks.length; const k = ks[ki], s = V(k > 0 ? -0.3 : 0.18, Y, -0.45), L = Math.abs(k) * 3 * u;
        K.visible = true; glow(K, '#2b8a3e', 0.9);
        const o = { L: K.len || 0.01 }; gsap.to(o, { L, duration: S.reduced ? 0 : 0.6, ease: 'back.out(1.6)', onUpdate: () => K.point(s, s.clone().add(V(Math.sign(k) * o.L, 0, 0))), onComplete: () => K.point(s, s.clone().add(V(Math.sign(k) * L, 0, 0))) });
        lk.setText(`${k}A ، |${k}A| = ${Math.abs(k) * 3}`); lk.position.copy(s).add(V(Math.sign(k) * L / 2, 0.04, 0)); show(lk); glow(tK, '#2b8a3e', 0.6);
      } },
    ],
    print(x, { P, inkLine, inkText }) {
      for (let i = -4; i <= 9; i++) inkLine(x, [P(-0.3 + i * u, -0.62), P(-0.3 + i * u, 0.62)], { w: 1, color: 'rgba(60,100,140,0.2)', wob: 0 });
      for (let j = -7; j <= 7; j++) inkLine(x, [P(-0.33, j * u), P(0.47, j * u)], { w: 1, color: 'rgba(60,100,140,0.2)', wob: 0 });
      inkText(x, 'كمية قياسية: كتلة 5 kg ، زمن 3 s', ...P(-0.05, 0.53), { size: 26, color: '#6b6155' });
      inkText(x, 'كمية متجهة: إزاحة 3 m نحو الشرق', ...P(-0.05, 0.6), { size: 26, color: '#c2410c' });
      inkText(x, 'المتجهان المتساويان: المقدار والاتجاه نفسهما أينما كانا', ...P(0.02, -0.62), { size: 23, color: '#6b6155' });
    },
    notes: [],
  };
};

/* ---------- 1-6 Multiplication of vectors ---------- */
SCENES.vecmult = (S) => {
  const { THREE, V, gsap, ink, glow, arrow, label, jar, show } = S;
  const g = new THREE.Group(), u = 0.075, Y = 0.05, O = V(-0.2, Y, 0.25);
  const A = arrow('#e8590c', 0.011, { posts: true }); A.point(O, O.clone().add(V(3 * u, 0, 0))); glow(A, '#e8590c', 0.9, 0); g.add(A);
  const B = arrow('#1c7ed6', 0.011, { posts: true }); glow(B, '#1c7ed6', 0.9, 0); g.add(B);
  const la = label('A = 3', { size: 0.032, color: '#c2410c' }); la.position.copy(O).add(V(3 * u + 0.05, 0.02, 0.03)); g.add(la);
  const lb = label('B = 4', { size: 0.032, color: '#1864ab' }); g.add(lb);
  const lt = label('θ = 37°', { size: 0.032, color: '#5b4f42' }); g.add(lt);
  const proj = new THREE.Mesh(new THREE.BoxGeometry(1, 0.006, 0.014).translate(0.5, 0, 0), new THREE.MeshBasicMaterial({ color: '#fab005', toneMapped: false, transparent: true, opacity: 0.9 }));
  proj.position.copy(O).add(V(0, -0.02, 0.02)); proj.visible = false; g.add(proj);
  const drop = dashed(S, V(), V(), '#e67700'); drop.visible = false; g.add(drop);
  const C = arrow('#7048e8', 0.011); C.visible = false; glow(C, '#7048e8', 1, 0); g.add(C);
  const lc = label('A × B', { size: 0.034, color: '#5f3dc4' }); lc.visible = false; g.add(lc);
  const plMat = new THREE.MeshBasicMaterial({ color: '#9775fa', transparent: true, opacity: 0.32, side: THREE.DoubleSide, depthWrite: false, toneMapped: false });
  const plate = new THREE.Mesh(new THREE.BufferGeometry(), plMat); plate.visible = false; g.add(plate);
  const tD = token(S, 'A · B', '#e67700', V(0.38, 0, -0.52)), tX = token(S, 'A × B', '#5f3dc4', V(0.38, 0, -0.3)); g.add(tD, tX);
  const jD = jar({ max: 12, color: '#f59f00', name: 'A·B =', digits: 1 }); jD.position.set(0.12, 0, -0.5); g.add(jD);
  const jX = jar({ max: 12, color: '#7048e8', name: '|A×B| =', digits: 1 }); jX.position.set(-0.12, 0, -0.5); g.add(jX);
  const ths = [37, 60, 90, 180, 0]; let ti = 0, th = 37, dOn = false, xOn = false;
  const upd = () => {
    const r = (th * Math.PI) / 180, tip = O.clone().add(V(Math.cos(r) * 4 * u, 0, -Math.sin(r) * 4 * u));
    B.point(O, tip); lb.position.copy(O).lerp(tip, 1.08).add(V(0, 0.03, 0)); lt.setText(`θ = ${Math.round(th)}°`); lt.position.copy(O).add(V(0.07, 0.03, -0.05));
    const c = Math.cos(r), s = Math.sin(r), dot = 12 * c, crs = 12 * s;
    proj.scale.x = Math.max(0.001, Math.abs(4 * c * u)); proj.rotation.y = c < 0 ? Math.PI : 0;
    drop.setEnds(tip.clone().setY(Y), V(O.x + 4 * c * u, Y, O.z));
    const h = Math.max(0.002, crs * 0.025); C.point(O, O.clone().add(V(0, h, 0))); C.visible = xOn && crs > 0.05; lc.position.copy(O).add(V(-0.04, h + 0.02, 0));
    const a = O.clone(), b = O.clone().add(V(3 * u, 0, 0)), d = tip.clone(), e = b.clone().add(d.clone().sub(O));
    plate.geometry.setAttribute('position', new THREE.Float32BufferAttribute([a, b, e, a, e, d].flatMap((v) => [v.x, v.y - 0.004, v.z]), 3)); plate.geometry.attributes.position.needsUpdate = true;
    if (dOn) jD.set(dot, 0.5, `A·B = 3×4×cos${Math.round(th)}° = ${Math.abs(dot) < 0.05 ? 0 : dot.toFixed(1)}`);
    if (xOn) jX.set(crs, 0.5, `|A×B| = 3×4×sin${Math.round(th)}° = ${crs < 0.05 ? 0 : crs.toFixed(1)}`);
  };
  upd();
  return {
    group: g,
    targets: [
      { obj: B, hint: O.clone().add(V(0.15, 0, -0.14)), act: () => { ti = (ti + 1) % ths.length; const o = { t: th }; gsap.to(o, { t: ths[ti], duration: S.reduced ? 0 : 0.8, ease: 'power2.inOut', onUpdate: () => { th = o.t; upd(); }, onComplete: () => { th = ths[ti]; upd(); } }); if (S.reduced) { th = ths[ti]; upd(); } } },
      { obj: tD, hint: tD.position.clone(), act: () => { dOn = !dOn; proj.visible = drop.visible = dOn; glow(tD, '#f59f00', dOn ? 0.6 : 0); if (dOn) upd(); else jD.set(0, 0.3, 'A·B'); } },
      { obj: tX, hint: tX.position.clone(), act: () => { xOn = !xOn; plate.visible = xOn; show(lc, xOn); glow(tX, '#7048e8', xOn ? 0.6 : 0); if (xOn) upd(); else { C.visible = false; jX.set(0, 0.3, '|A×B|'); } } },
    ],
    print(x, { P, inkLine, inkText, inkArrowHead }) {
      const a = P(O.x - 0.08, O.z), b = P(0.46, O.z); inkLine(x, [a, b], { w: 1.6, color: '#8a7f70', dash: [8, 8] });
      inkText(x, 'الضرب القياسي: ناتجه عدد', ...P(0.08, 0.47), { size: 27, color: '#e67700', weight: 600 });
      inkText(x, 'الضرب الاتجاهي: ناتجه متجه عمودي على المستوي', ...P(0.06, 0.54), { size: 25, color: '#5f3dc4', weight: 600 });
      inkText(x, 'قاعدة اليد اليمنى: من A نحو B ← الإبهام إلى الأعلى', ...P(0.06, 0.61), { size: 23, color: '#6b6155' });
    },
    notes: [{ t: 'دوّر B', at: [0.0, -0.08], to: [-0.05, 0.08] }],
  };
};

/* ---------- shared: standing paper panel with a redrawable canvas ---------- */
function panel(S, w, h, pos, draw) {
  const { THREE, ink } = S;
  const g = new THREE.Group(); g.position.copy(pos);
  const c = document.createElement('canvas'); c.width = 768; c.height = Math.round(768 * h / w);
  const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; tx.anisotropy = 8;
  const board = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tx, roughness: 0.9, side: THREE.DoubleSide }));
  board.position.y = h / 2 + 0.012; board.castShadow = true; g.add(board);
  const frame = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(w, h)), S.LINE_MAT); frame.position.copy(board.position); g.add(frame);
  g.add(ink(new THREE.BoxGeometry(w + 0.02, 0.012, 0.05).translate(0, 0.006, 0), '#e9dfca'));
  const x = c.getContext('2d');
  g.redraw = (...a) => { x.fillStyle = '#fbf6ea'; x.fillRect(0, 0, c.width, c.height); draw(x, c.width, c.height, ...a); tx.needsUpdate = true; };
  g.board = board; return g;
}
function axes2d(x, W, H, { xl = 't (s)', yl = 'x (m)', m = 70 } = {}) {
  x.strokeStyle = '#2a241c'; x.lineWidth = 3; x.beginPath(); x.moveTo(m, 20); x.lineTo(m, H - m); x.lineTo(W - 20, H - m); x.stroke();
  x.font = "600 30px 'Newsreader',serif"; x.fillStyle = '#2a241c'; x.textAlign = 'left'; x.fillText(yl, m + 10, 44); x.textAlign = 'right'; x.fillText(xl, W - 24, H - m + 40);
  return { ox: m, oy: H - m, w: W - m - 30, h: H - m - 40 };
}
function car(S, color = '#f1ddb8') {
  const { THREE, ink } = S; const c = new THREE.Group();
  c.add(ink(new THREE.BoxGeometry(0.1, 0.035, 0.06).translate(0, 0.032, 0), color));
  c.add(ink(new THREE.BoxGeometry(0.05, 0.025, 0.05).translate(-0.01, 0.06, 0), '#f6efe0'));
  for (const [wx, wz] of [[-0.032, -0.033], [0.032, -0.033], [-0.032, 0.033], [0.032, 0.033]]) { const w = ink(new THREE.CylinderGeometry(0.014, 0.014, 0.01, 14).rotateX(Math.PI / 2), '#cfc3aa', { thresh: 30 }); w.position.set(wx, 0.014, wz); c.add(w); }
  return c;
}

/* ---------- 2-1, 2-2 Frames of reference ---------- */
SCENES.frames = (S) => {
  const { THREE, V, gsap, ink, glow, label, show } = S;
  const g = new THREE.Group();
  const rail = ink(new THREE.BoxGeometry(0.8, 0.008, 0.12).translate(0, 0.004, 0), '#e6dccb'); rail.position.set(0.06, 0, 0.12); g.add(rail);
  const train = new THREE.Group(); train.position.set(-0.2, 0, 0.12); g.add(train);
  const body = ink(new THREE.BoxGeometry(0.26, 0.09, 0.1).translate(0, 0.06, 0), '#f1dfbf'); train.add(body);
  for (const wx of [-0.09, 0.09]) for (const wz of [-0.05, 0.05]) { const w = ink(new THREE.CylinderGeometry(0.02, 0.02, 0.01, 16).rotateX(Math.PI / 2), '#cfc3aa', { thresh: 30 }); w.position.set(wx, 0.02, wz); train.add(w); }
  const pas = new THREE.Group(); pas.position.set(0.02, 0.105, 0); train.add(pas);
  pas.add(ink(new THREE.CylinderGeometry(0.014, 0.018, 0.05, 12).translate(0, 0.025, 0), '#f6c9a8', { thresh: 40 }));
  const head = ink(new THREE.SphereGeometry(0.016, 12, 10), '#f6d8bf', { thresh: 60 }); head.position.y = 0.065; pas.add(head);
  const tree = new THREE.Group(); tree.position.set(0.25, 0, -0.12); g.add(tree);
  tree.add(ink(new THREE.CylinderGeometry(0.01, 0.014, 0.12).translate(0, 0.06, 0), '#d9c09a', { thresh: 40 }));
  const crown = ink(new THREE.ConeGeometry(0.06, 0.14, 10).translate(0, 0.18, 0), '#d8ead0', { thresh: 40 }); tree.add(crown);
  const obs = ink(new THREE.CylinderGeometry(0.014, 0.018, 0.06, 12).translate(0, 0.03, 0), '#cfe0f5', { thresh: 40 }); obs.position.set(-0.2, 0, -0.32); g.add(obs);
  const tok = new THREE.Group(); tok.position.set(0.38, 0, -0.5); g.add(tok);
  tok.add(ink(new THREE.CylinderGeometry(0.045, 0.05, 0.026, 32).translate(0, 0.013, 0), '#f3ecdc', { thresh: 20 }));
  const lfr = label('إطار: الأرض', { size: 0.034, color: '#1864ab' }); lfr.position.set(-0.05, 0.05, 0); tok.add(lfr);
  const lv = label('', { size: 0.034, color: '#c2410c' }); lv.visible = false; g.add(lv);
  let frame = 'ground', run = false, s = 0;
  const X0 = -0.2, X1 = 0.32, T0 = 0.25;
  const setFrame = () => { lfr.setText(frame === 'ground' ? 'إطار: الأرض' : 'إطار: القطار'); };
  const speedTxt = () => frame === 'ground' ? 'v = 20 m/s (بالنسبة للأرض)' : 'v = 0 (بالنسبة للقطار)';
  return {
    group: g,
    targets: [
      { obj: train, hit: [body], hint: V(-0.2, 0, 0.24), act: () => { run = !run; glow(body, '#e8590c', run ? 0.5 : 0); } },
      { obj: tok, hint: tok.position.clone(), act: () => { frame = frame === 'ground' ? 'train' : 'ground'; setFrame(); glow(tok, '#1864ab', frame === 'train' ? 0.6 : 0); train.position.x = X0; tree.position.x = T0; s = 0; if (lv.visible) lv.setText(speedTxt()); } },
      { obj: pas, hint: V(-0.18, 0, 0.0), act: () => { lv.setText(speedTxt()); show(lv); glow(head, '#e8590c', 0.8); } },
    ],
    update(dt) {
      if (run) {
        s += dt * 0.12; if (s > X1 - X0) s = 0;
        if (frame === 'ground') { train.position.x = X0 + s; tree.position.x = T0; }
        else { train.position.x = X0; tree.position.x = T0 - s; obs.position.x = -0.2 - s; }
      }
      if (frame === 'ground') obs.position.x = -0.2;
      lv.position.set(train.position.x + 0.02, 0.24, 0.12);
    },
    print(x, { P, inkText }) {
      inkText(x, 'الكينماتيك: يصف الحركة', ...P(0.06, 0.42), { size: 30, color: '#c2410c', weight: 600 });
      inkText(x, 'الديناميك: يبحث في أسبابها', ...P(0.06, 0.5), { size: 30, color: '#1864ab', weight: 600 });
      inkText(x, 'مراقب على الأرض', ...P(-0.2, -0.24), { size: 24, color: '#6b6155' });
    },
    notes: [],
  };
};

/* ---------- 2-3 Position, displacement, distance ---------- */
SCENES.position = (S) => {
  const { THREE, V, gsap, ink, glow, arrow, label, jar, show } = S;
  const g = new THREE.Group(), Z = 0.15, u = 0.034, X = (m) => -0.3 + m * u;
  const track = ink(new THREE.BoxGeometry(0.74, 0.008, 0.09).translate(0, 0.004, 0), '#ece3d1'); track.position.set(0.06, 0, Z); g.add(track);
  const run = new THREE.Group(); g.add(run);
  run.add(ink(new THREE.CylinderGeometry(0.012, 0.016, 0.06, 12).translate(0, 0.03, 0), '#f6c9a8', { thresh: 40 }));
  const hd = ink(new THREE.SphereGeometry(0.015, 12, 10), '#f6d8bf', { thresh: 60 }); hd.position.y = 0.075; run.add(hd);
  run.position.set(X(5), 0.008, Z);
  const D = arrow('#e8590c', 0.009); D.visible = false; g.add(D); glow(D, '#e8590c', 1, 0);
  const ld = label('', { size: 0.034, color: '#c2410c' }); ld.visible = false; g.add(ld);
  const jD = jar({ max: 20, color: '#e8590c', name: 'Δx =', unit: 'm' }); jD.position.set(0.05, 0, -0.42); g.add(jD);
  const jd = jar({ max: 30, color: '#1c7ed6', name: 'd =', unit: 'm' }); jd.position.set(0.3, 0, -0.42); g.add(jd);
  const trips = [[5, 12], [5, 1], [5, 20, 5]]; let ti = -1, cur = trips[0], showD = false, showd = false, odo = 0;
  const tD = (() => { const t = new THREE.Group(); t.position.set(-0.22, 0, -0.42); t.add(ink(new THREE.CylinderGeometry(0.045, 0.05, 0.026, 32).translate(0, 0.013, 0), '#f3ecdc', { thresh: 20 })); const l = label('Δx', { size: 0.036, color: '#c2410c' }); l.position.y = 0.035; t.add(l); g.add(t); return t; })();
  const td = (() => { const t = new THREE.Group(); t.position.set(-0.22, 0, -0.2); t.add(ink(new THREE.CylinderGeometry(0.045, 0.05, 0.026, 32).translate(0, 0.013, 0), '#f3ecdc', { thresh: 20 })); const l = label('d', { size: 0.036, color: '#1864ab' }); l.position.y = 0.035; t.add(l); g.add(t); return t; })();
  const disp = () => { const a = cur[0], b = cur[cur.length - 1]; D.point(V(X(a), 0.11, Z), V(X(b) + (b === a ? 0.0005 : 0), 0.11, Z)); ld.setText(`Δx = ${b} − ${a} = ${b - a} m`); ld.position.set((X(a) + X(b)) / 2, 0.14, Z); jD.set(b - a, 0.6); };
  const dist = () => { let d = 0; for (let i = 1; i < cur.length; i++) d += Math.abs(cur[i] - cur[i - 1]); return d; };
  return {
    group: g,
    targets: [
      { obj: run, hint: V(X(5), 0, Z + 0.08), act: async () => {
        ti = (ti + 1) % trips.length; cur = trips[ti]; run.position.x = X(cur[0]); odo = 0; jd.set(0, 0.1); D.visible = false; ld.visible = false; ld.userData._shown = false;
        for (let i = 1; i < cur.length; i++) {
          const a = cur[i - 1], b = cur[i];
          await new Promise((r) => gsap.to(run.position, { x: X(b), duration: S.reduced ? 0 : Math.abs(b - a) * 0.12, ease: 'none', onUpdate: () => { const now = (run.position.x + 0.3) / u; jd.set(odo + Math.abs(now - a), 0.05); }, onComplete: () => { odo += Math.abs(b - a); r(); } }));
        }
        jd.set(odo, 0.2); if (showD) { D.visible = true; disp(); show(ld); }
      } },
      { obj: tD, hint: tD.position.clone(), act: () => { showD = true; D.visible = true; disp(); show(ld); glow(tD, '#e8590c', 0.6); } },
      { obj: td, hint: td.position.clone(), act: () => { showd = true; jd.set(dist(), 0.6, `d = ${dist()} m`); glow(td, '#1c7ed6', 0.6); } },
    ],
    print(x, { P, inkLine, inkText }) {
      for (let m = 0; m <= 20; m++) { const xx = X(m); inkLine(x, [P(xx, Z + 0.05), P(xx, Z + (m % 5 ? 0.065 : 0.08))], { w: 2, wob: 0 }); if (m % 5 === 0) inkText(x, `${m}`, ...P(xx, Z + 0.105), { size: 24 }); }
      inkText(x, 'x (m)', ...P(0.42, Z + 0.105), { size: 24, color: '#6b6155' }); inkText(x, 'O', ...P(X(0), Z + 0.14), { size: 26 });
      inkText(x, 'الإزاحة متجهة: قد تكون سالبة أو صفراً', ...P(0.05, 0.42), { size: 27, color: '#c2410c', weight: 600 });
      inkText(x, 'المسافة قياسية: طول المسار كله', ...P(0.05, 0.5), { size: 27, color: '#1864ab', weight: 600 });
    },
    notes: [],
  };
};

/* ---------- 2-4, 2-5 Average velocity and speed ---------- */
SCENES.avgvel = (S) => {
  const { THREE, V, gsap, ink, glow, arrow, label, jar, show } = S;
  const g = new THREE.Group(), Z = 0.12, u = 0.0011, X = (m) => -0.3 + m * u; // 600 m -> 0.66
  const road = ink(new THREE.BoxGeometry(0.76, 0.008, 0.11).translate(0, 0.004, 0), '#e2dccf'); road.position.set(0.05, 0, Z); g.add(road);
  const c = car(S); c.position.set(X(0), 0.008, Z); g.add(c);
  const lt = label('t = 0 s', { size: 0.032 }); lt.position.set(0.05, 0.2, Z); g.add(lt);
  const jS = jar({ max: 10, color: '#1c7ed6', name: 'speed =', unit: 'm/s', digits: 1 }); jS.position.set(-0.05, 0, -0.42); g.add(jS);
  const jV = jar({ max: 10, color: '#e8590c', name: 'v_avg =', unit: 'm/s', digits: 1 }); jV.position.set(0.25, 0, -0.42); g.add(jV);
  const D = arrow('#e8590c', 0.009); D.visible = false; g.add(D); glow(D, '#e8590c', 1, 0);
  const ld = label('Δx = 400 m', { size: 0.032, color: '#c2410c' }); ld.visible = false; g.add(ld);
  const odo = new THREE.Group(); odo.position.set(-0.24, 0, -0.42); g.add(odo);
  odo.add(ink(new THREE.CylinderGeometry(0.045, 0.05, 0.026, 32).translate(0, 0.013, 0), '#f3ecdc', { thresh: 20 }));
  const lo = label('d = 0 m', { size: 0.03, color: '#1864ab' }); lo.position.y = 0.035; odo.add(lo);
  const tokD = new THREE.Group(); tokD.position.set(-0.24, 0, -0.2); g.add(tokD);
  tokD.add(ink(new THREE.CylinderGeometry(0.045, 0.05, 0.026, 32).translate(0, 0.013, 0), '#f3ecdc', { thresh: 20 }));
  const lD = label('Δx', { size: 0.034, color: '#c2410c' }); lD.position.y = 0.035; tokD.add(lD);
  let busy = false, d = 0, t = 0, pos = 0;
  const refresh = () => { lt.setText(`t = ${t.toFixed(0)} s`); lo.setText(`d = ${d.toFixed(0)} m`); if (t > 0.01) { jS.set(d / t, 0.05); jV.set(pos / t, 0.05); } };
  return {
    group: g,
    targets: [
      { obj: c, hint: V(X(0), 0, Z + 0.08), act: async () => {
        if (busy) return; busy = true; d = 0; t = 0; pos = 0; c.position.x = X(0); jS.set(0, 0.1); jV.set(0, 0.1);
        const leg = (to, dur, real) => new Promise((r) => { const from = pos, o = { k: 0 }; gsap.to(o, { k: 1, duration: S.reduced ? 0.001 : dur, ease: 'none', onUpdate: () => { const p = from + (to - from) * o.k; d += Math.abs(p - pos); pos = p; t = (real[0] + (real[1] - real[0]) * o.k); c.position.x = X(pos); refresh(); }, onComplete: r }); });
        c.rotation.y = 0; await leg(600, 2.4, [0, 80]); c.rotation.y = Math.PI; await leg(400, 0.8, [80, 100]); c.rotation.y = 0;
        jS.set(8, 0.3, 'speed = 800/100 = 8 m/s'); jV.set(4, 0.3, 'v_avg = 400/100 = 4 m/s'); busy = false;
      } },
      { obj: odo, hint: odo.position.clone(), act: () => { lo.setText(d ? `d = ${d.toFixed(0)} m` : 'd = 600 + 200 = 800 m'); glow(odo, '#1c7ed6', 0.6); } },
      { obj: tokD, hint: tokD.position.clone(), act: () => { D.visible = true; D.point(V(X(0), 0.12, Z), V(X(400), 0.12, Z)); ld.position.set(X(200), 0.15, Z); show(ld); glow(tokD, '#e8590c', 0.6); } },
    ],
    print(x, { P, inkLine, inkText }) {
      [['A', 0], ['B', 400], ['C', 600]].forEach(([n, m]) => { inkLine(x, [P(X(m), Z + 0.06), P(X(m), Z + 0.09)], { w: 3, wob: 0 }); inkText(x, n, ...P(X(m), Z + 0.12), { size: 32, weight: 700 }); });
      inkText(x, '600 m', ...P(X(300), Z + 0.17), { size: 24, color: '#6b6155' }); inkText(x, '200 m', ...P(X(500), Z - 0.09), { size: 24, color: '#6b6155' });
      inkText(x, 'الانطلاق المتوسط = المسافة ÷ الزمن', ...P(0.05, 0.42), { size: 27, color: '#1864ab', weight: 600 });
      inkText(x, 'السرعة المتوسطة = الإزاحة ÷ الزمن', ...P(0.05, 0.5), { size: 27, color: '#c2410c', weight: 600 });
    },
    notes: [],
  };
};

/* ---------- 2-6, 2-7 Instantaneous and constant velocity ---------- */
SCENES.instvel = (S) => {
  const { THREE, V, gsap, ink, glow, label, show } = S;
  const g = new THREE.Group();
  const f = (t) => 2 + 0.45 * t * t; // x(t) on 0..6
  const dts = [3, 1.5, 0.7, 0.2]; let di = 0;
  const pan = panel(S, 0.5, 0.36, V(0.02, 0, -0.32), (x, W, H, dt) => {
    const A = axes2d(x, W, H); const sx = (t) => A.ox + (t / 6) * A.w, sy = (v) => A.oy - (v / 20) * A.h;
    x.strokeStyle = '#c2255c'; x.lineWidth = 4; x.beginPath(); for (let t = 0; t <= 6; t += 0.05) { t ? x.lineTo(sx(t), sy(f(t))) : x.moveTo(sx(t), sy(f(t))); } x.stroke();
    const ta = 2, tb = ta + dt, m = (f(tb) - f(ta)) / dt;
    x.strokeStyle = '#1971c2'; x.lineWidth = 3; x.beginPath(); x.moveTo(sx(0.2), sy(f(ta) + m * (0.2 - ta))); x.lineTo(sx(6), sy(f(ta) + m * (6 - ta))); x.stroke();
    x.strokeStyle = 'rgba(43,138,62,.6)'; x.setLineDash([8, 8]); x.beginPath(); x.moveTo(sx(0.5), sy(f(ta) + 1.8 * (0.5 - ta))); x.lineTo(sx(5), sy(f(ta) + 1.8 * (5 - ta))); x.stroke(); x.setLineDash([]);
    [[ta, 'A'], [tb, 'B']].forEach(([t, n]) => { x.fillStyle = '#2a241c'; x.beginPath(); x.arc(sx(t), sy(f(t)), 8, 0, 7); x.fill(); x.font = "700 30px 'Newsreader',serif"; x.fillText(n, sx(t) - 34, sy(f(t)) - 8); });
    x.font = "600 28px 'Newsreader',serif"; x.fillStyle = '#1971c2'; x.textAlign = 'left'; x.fillText(`slope = ${m.toFixed(2)} m/s`, A.ox + 20, 90); x.fillStyle = '#2b8a3e'; x.fillText('tangent at A: 1.80 m/s', A.ox + 20, 126);
  });
  pan.redraw(dts[0]); g.add(pan);
  const ptB = ink(new THREE.SphereGeometry(0.02, 14, 10), '#f6d2c4', { thresh: 60 }); ptB.position.set(0.2, 0.05, -0.27); glow(ptB, '#1971c2', 0.7, 0); g.add(ptB);
  const lb = label('B', { size: 0.03, color: '#1971c2' }); lb.position.set(0.2, 0.08, -0.27); g.add(lb);
  const road = ink(new THREE.BoxGeometry(0.76, 0.008, 0.1).translate(0, 0.004, 0), '#e2dccf'); road.position.set(0.05, 0, 0.3); g.add(road);
  const c = car(S); c.position.set(-0.3, 0.008, 0.3); g.add(c);
  const ghosts = new THREE.Group(); g.add(ghosts);
  const sp = new THREE.Group(); sp.position.set(0.38, 0, 0.0); g.add(sp);
  sp.add(ink(new THREE.CylinderGeometry(0.05, 0.055, 0.02, 32).translate(0, 0.01, 0), '#f3ecdc', { thresh: 20 }));
  const needle = ink(new THREE.BoxGeometry(0.04, 0.006, 0.006).translate(0.02, 0.024, 0), '#c92a2a'); needle.rotation.y = Math.PI; sp.add(needle);
  const ls = label('0 m/s', { size: 0.03 }); ls.position.y = 0.05; sp.add(ls);
  let busy = false;
  return {
    group: g,
    targets: [
      { obj: ptB, hint: V(0.2, 0, -0.18), act: () => { di = (di + 1) % dts.length; pan.redraw(dts[di]); glow(ptB, '#1971c2', 0.9); } },
      { obj: c, hint: V(-0.3, 0, 0.4), act: () => {
        if (busy) return; busy = true; ghosts.clear(); const o = { k: 0 }; let last = -1;
        gsap.to(o, { k: 1, duration: S.reduced ? 0.001 : 3, ease: 'none', onUpdate: () => { c.position.x = -0.3 + 0.6 * o.k; const step = Math.floor(o.k * 3 + 1e-6); if (step !== last) { last = step; const gh = car(S, '#f7e9c8'); gh.position.copy(c.position); gh.traverse((m) => { if (m.material && m.material.uniforms) m.material.uniforms.uOpacity.value = 1; }); ghosts.add(gh); } }, onComplete: () => { busy = false; } });
        ls.setText('10 m/s'); gsap.to(needle.rotation, { y: Math.PI * 0.4, duration: 0.5 });
      } },
      { obj: sp, hint: sp.position.clone(), act: () => { ls.setText('10 m/s'); show(ls); glow(sp, '#c92a2a', 0.5); gsap.to(needle.rotation, { y: Math.PI * 0.4, duration: 0.5 }); } },
    ],
    print(x, { P, inkLine, inkText }) {
      [0, 150, 300, 450].forEach((m, i) => { const xx = -0.3 + m / 450 * 0.6; inkLine(x, [P(xx, 0.36), P(xx, 0.39)], { w: 3, wob: 0 }); inkText(x, `${m} m`, ...P(xx, 0.42), { size: 22 }); inkText(x, `${i * 15} s`, ...P(xx, 0.46), { size: 22, color: '#6b6155' }); });
      inkText(x, 'إزاحات متساوية في أزمنة متساوية ← سرعة ثابتة', ...P(0.05, 0.56), { size: 26, color: '#c2410c', weight: 600 });
    },
    notes: [{ t: 'قرّب B من A', at: [0.32, -0.62], to: [0.21, -0.3] }],
  };
};

/* ---------- 2-8 Acceleration ---------- */
SCENES.accel = (S) => {
  const { THREE, V, gsap, ink, glow, label, jar } = S;
  const g = new THREE.Group(), lanes = [-0.12, 0.08, 0.28], kinds = [[0.2, 0], [0.04, 0.32], [0.36, -0.3]], cols = ['#f1ddb8', '#cfe3f7', '#f7cfc7'], names = ['a = 0', 'a = +2 m/s²', 'a = −2 m/s²'];
  const J = jar({ max: 3, color: '#e8590c', name: 'a =', unit: 'm/s²', digits: 0 }); J.position.set(0.36, 0, -0.42); g.add(J);
  const cars = lanes.map((z, i) => {
    const r = ink(new THREE.BoxGeometry(0.74, 0.008, 0.11).translate(0, 0.004, 0), '#e8e1d2'); r.position.set(0.05, 0, z); g.add(r);
    const c = car(S, cols[i]); c.position.set(-0.3, 0.008, z); g.add(c);
    const l = label(names[i], { size: 0.03 }); l.position.set(-0.3, 0.12, z); c.add(l); l.position.set(0, 0.11, 0);
    const gh = new THREE.Group(); g.add(gh); return { c, gh, z, busy: false };
  });
  const run = (i) => {
    const C = cars[i]; if (C.busy) return; C.busy = true; C.gh.clear(); const [v0, a] = kinds[i], T = 2.4, o = { t: 0 }; let last = -1;
    const xAt = (t) => -0.3 + v0 * t + 0.5 * a * t * t * 0.5;
    gsap.to(o, { t: T, duration: S.reduced ? 0.001 : T, ease: 'none', onUpdate: () => { C.c.position.x = xAt(o.t); const k = Math.floor(o.t / 0.4 + 1e-6); if (k !== last) { last = k; const m = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.05, 0.06), new THREE.MeshBasicMaterial({ color: '#fab005', transparent: true, opacity: 0.35, toneMapped: false })); m.position.set(C.c.position.x, 0.035, C.z); C.gh.add(m); } }, onComplete: () => { setTimeout(() => { C.c.position.x = -0.3; C.busy = false; }, 1200); } });
    J.set([0, 2, -2][i], 0.6, ['a = 0 (سرعة ثابتة)', 'a = +2 m/s²', 'a = −2 m/s²'][i]);
  };
  return {
    group: g,
    targets: cars.map((C, i) => ({ obj: C.c, hint: V(-0.3, 0, C.z + 0.08), act: () => run(i) })),
    print(x, { P, inkText }) {
      inkText(x, 'a = Δv / Δt', ...P(0.0, 0.46), { size: 40, color: '#c2410c', weight: 600 });
      inkText(x, 'المربعات الصفراء: موقع السيارة كل فترة زمنية متساوية', ...P(0.05, 0.54), { size: 24, color: '#6b6155' });
      ['سرعة ثابتة', 'تتسارع', 'تتباطأ'].forEach((t, i) => inkText(x, t, ...P(0.38, lanes[i] + 0.075), { size: 24 }));
    },
    notes: [],
  };
};

/* ---------- 2-9 Kinematic equations ---------- */
SCENES.kineq = (S) => {
  const { THREE, V, gsap, ink, glow, label, jar, show } = S;
  const g = new THREE.Group(); const as = [2, 1, 3]; let ai = 0, tNow = 0, area = false;
  const pan = panel(S, 0.5, 0.36, V(0.0, 0, -0.32), (x, W, H, a, t, ar) => {
    const A = axes2d(x, W, H, { yl: 'v (m/s)' }); const sx = (q) => A.ox + (q / 5) * A.w, sy = (v) => A.oy - (v / 15) * A.h;
    if (ar && t > 0) { x.fillStyle = 'rgba(250,176,5,.45)'; x.beginPath(); x.moveTo(sx(0), sy(0)); x.lineTo(sx(t), sy(a * t)); x.lineTo(sx(t), sy(0)); x.closePath(); x.fill(); }
    x.strokeStyle = '#1971c2'; x.lineWidth = 4; x.beginPath(); x.moveTo(sx(0), sy(0)); x.lineTo(sx(t), sy(a * t)); x.stroke();
    x.font = "600 26px 'Newsreader',serif"; x.fillStyle = '#2a241c'; x.textAlign = 'left'; x.fillText(`a = ${a} m/s²   t = ${t.toFixed(1)} s   v = ${(a * t).toFixed(1)} m/s`, A.ox + 14, 86);
    if (ar) { x.fillStyle = '#b07600'; x.fillText(`area = ½ × ${t.toFixed(1)} × ${(a * t).toFixed(1)} = ${(0.5 * a * t * t).toFixed(1)} m`, A.ox + 14, 122); }
  });
  pan.redraw(as[0], 0, false); g.add(pan);
  const road = ink(new THREE.BoxGeometry(0.76, 0.008, 0.1).translate(0, 0.004, 0), '#e2dccf'); road.position.set(0.05, 0, 0.25); g.add(road);
  const c = car(S); c.position.set(-0.3, 0.008, 0.25); g.add(c);
  const J = jar({ max: 40, color: '#f59f00', name: 'Δx =', unit: 'm', digits: 1 }); J.position.set(0.37, 0, -0.42); g.add(J);
  const dial = new THREE.Group(); dial.position.set(0.37, 0, 0.0); g.add(dial);
  dial.add(ink(new THREE.CylinderGeometry(0.045, 0.05, 0.02, 28).translate(0, 0.01, 0), '#ede2cb', { thresh: 20 }));
  const la = label('a = 2', { size: 0.03, color: '#c2410c' }); la.position.y = 0.04; dial.add(la);
  const tA = new THREE.Group(); tA.position.set(0.37, 0, -0.2); g.add(tA);
  tA.add(ink(new THREE.CylinderGeometry(0.045, 0.05, 0.026, 32).translate(0, 0.013, 0), '#f3ecdc', { thresh: 20 }));
  const lA = label('area', { size: 0.03, color: '#b07600' }); lA.position.y = 0.035; tA.add(lA);
  let busy = false;
  const draw = () => pan.redraw(as[ai], tNow, area);
  return {
    group: g,
    targets: [
      { obj: c, hint: V(-0.3, 0, 0.35), act: () => { if (busy) return; busy = true; const a = as[ai], o = { t: 0 };
        gsap.to(o, { t: 5, duration: S.reduced ? 0.001 : 3, ease: 'none', onUpdate: () => { tNow = o.t; const dx = 0.5 * a * o.t * o.t; c.position.x = -0.3 + dx * (0.66 / 37.5); J.set(dx, 0.05); draw(); }, onComplete: () => { tNow = 5; draw(); J.set(0.5 * a * 25, 0.2, `Δx = ½ × ${a} × 5² = ${0.5 * a * 25} m`); setTimeout(() => { c.position.x = -0.3; busy = false; }, 1500); } }); } },
      { obj: dial, hint: dial.position.clone(), act: () => { ai = (ai + 1) % as.length; la.setText(`a = ${as[ai]}`); tNow = 0; draw(); J.set(0, 0.2); } },
      { obj: tA, hint: tA.position.clone(), act: () => { area = !area; draw(); glow(tA, '#f59f00', area ? 0.6 : 0); } },
    ],
    print(x, { P, inkText }) {
      inkText(x, 'v_f = v_i + aΔt', ...P(-0.12, 0.42), { size: 30, color: '#c2410c', weight: 600 });
      inkText(x, 'Δx = v_iΔt + ½ a (Δt)²', ...P(-0.12, 0.49), { size: 30, color: '#c2410c', weight: 600 });
      inkText(x, 'v_f² = v_i² + 2aΔx', ...P(-0.12, 0.56), { size: 30, color: '#c2410c', weight: 600 });
      inkText(x, 'الإزاحة = المساحة تحت منحنى v–t', ...P(0.05, 0.62), { size: 24, color: '#6b6155' });
    },
    notes: [],
  };
};

/* ---------- 2-12 Horizontal projectile ---------- */
SCENES.projh = (S) => {
  const { THREE, V, gsap, ink, glow, arrow, label, show } = S;
  const g = new THREE.Group(), H = 0.42, X0 = -0.26, Z = 0.05;
  const tower = ink(new THREE.BoxGeometry(0.12, H, 0.12).translate(0, H / 2, 0), '#ede2cb'); tower.position.set(X0 - 0.06, 0, Z); g.add(tower);
  const launcher = ink(new THREE.BoxGeometry(0.07, 0.025, 0.04).translate(0.035, 0.0125, 0), '#d9480f'); launcher.position.set(X0 - 0.03, H, Z); g.add(launcher);
  const bK = ink(new THREE.SphereGeometry(0.02, 18, 12), '#f6d2c4', { thresh: 60 }); glow(bK, '#e8590c', 0.6, 0);
  const bL = ink(new THREE.SphereGeometry(0.02, 18, 12), '#cfe3f7', { thresh: 60 }); glow(bL, '#1c7ed6', 0.6, 0);
  g.add(bK, bL);
  const start = () => { bK.position.set(X0, H + 0.02, Z); bL.position.set(X0 - 0.02, H + 0.02, Z - 0.09); };
  start();
  const ghosts = new THREE.Group(); ghosts.visible = false; g.add(ghosts);
  const vx = arrow('#2b8a3e', 0.007), vy = arrow('#1c7ed6', 0.007), vf = arrow('#e8590c', 0.008); [vx, vy, vf].forEach((a, i) => { a.visible = false; glow(a, ['#2b8a3e', '#1c7ed6', '#e8590c'][i], 1, 0); g.add(a); });
  const lv = label('v_x = 40 , v_y = 0', { size: 0.03 }); lv.visible = false; g.add(lv);
  const T = 3, vX = 40, gg = 10, sc = H / 45, xs = 0.6 / (vX * T) * 1; // 120 m -> 0.6
  const lamp = new THREE.Group(); lamp.position.set(0.38, 0, -0.45); g.add(lamp);
  lamp.add(ink(new THREE.BoxGeometry(0.08, 0.02, 0.06).translate(0, 0.01, 0), '#e5dccb'));
  const lh = ink(new THREE.CylinderGeometry(0.022, 0.035, 0.05, 16).rotateZ(Math.PI / 2.4), '#f0e6d2', { thresh: 30 }); lh.position.set(0, 0.06, 0); lamp.add(lh);
  const tC = new THREE.Group(); tC.position.set(0.38, 0, -0.22); g.add(tC);
  tC.add(ink(new THREE.CylinderGeometry(0.045, 0.05, 0.026, 32).translate(0, 0.013, 0), '#f3ecdc', { thresh: 20 }));
  const lc = label('v_x , v_y', { size: 0.03, color: '#2b8a3e' }); lc.position.y = 0.035; tC.add(lc);
  let busy = false, comp = false;
  const posAt = (t) => ({ x: X0 + vX * t * xs, y: H + 0.02 - 0.5 * gg * t * t * sc });
  const setComp = (t) => { const p = posAt(t), vyv = gg * t, s = 0.0016; const P = V(p.x, p.y, Z); vx.point(P, P.clone().add(V(vX * s, 0, 0))); vy.point(P, P.clone().add(V(0, -Math.max(0.001, vyv * s), 0))); vf.point(P, P.clone().add(V(vX * s, -vyv * s, 0))); lv.setText(`v_x = 40 , v_y = ${vyv.toFixed(0)} , v = ${Math.hypot(vX, vyv).toFixed(0)} m/s`); lv.position.set(p.x, p.y + 0.05, Z); };
  for (let k = 0; k <= 6; k++) { const t = k * T / 6, p = posAt(t); [[p.x, Z, '#ffd8a8'], [X0 - 0.02, Z - 0.09, '#a5d8ff']].forEach(([gx, gz, col]) => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.017, 12, 8), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.6, toneMapped: false })); m.position.set(gx, p.y, gz); ghosts.add(m); }); }
  return {
    group: g,
    targets: [
      { obj: launcher, hit: [launcher, tower], hint: V(X0 + 0.05, 0, Z + 0.1), act: () => {
        if (busy) return; busy = true; start(); const o = { t: 0 };
        gsap.to(o, { t: T, duration: S.reduced ? 0.001 : 2.2, ease: 'none', onUpdate: () => { const p = posAt(o.t); bK.position.set(p.x, p.y, Z); bL.position.set(X0 - 0.02, p.y, Z - 0.09); if (comp) setComp(o.t); }, onComplete: () => { S.sfx.click(); setTimeout(() => { start(); busy = false; if (comp) setComp(0); }, 1800); } });
      } },
      { obj: lamp, hint: lamp.position.clone(), act: () => { ghosts.visible = !ghosts.visible; glow(lh, '#ffd43b', ghosts.visible ? 1 : 0); } },
      { obj: tC, hint: tC.position.clone(), act: () => { comp = !comp; [vx, vy, vf].forEach((a) => (a.visible = comp)); show(lv, comp); if (comp) setComp(busy ? 0 : 0); glow(tC, '#2b8a3e', comp ? 0.6 : 0); } },
    ],
    print(x, { P, inkLine, inkText }) {
      inkLine(x, [P(X0 - 0.12, Z + 0.06), P(0.46, Z + 0.06)], { w: 3 });
      inkText(x, 'h = 45 m', ...P(X0 - 0.06, Z + 0.1), { size: 24 });
      inkText(x, 'المدى = 40 m/s × 3 s = 120 m', ...P(0.12, Z + 0.12), { size: 24, color: '#6b6155' });
      inkText(x, 'v_f² = v_x² + v_y²', ...P(0.05, 0.42), { size: 36, color: '#c2410c', weight: 600 });
      inkText(x, 'g = 10 m/s² كما في أمثلة الكتاب', ...P(0.05, 0.5), { size: 24, color: '#6b6155' });
    },
    notes: [],
  };
};

/* ---------- 2-12 Angled projectile ---------- */
SCENES.proja = (S) => {
  const { THREE, V, gsap, ink, glow, arrow, label, show } = S;
  const g = new THREE.Group(), X0 = -0.28, Z = 0.05, sc = 0.0165; // 40 m -> 0.66
  const base = ink(new THREE.CylinderGeometry(0.04, 0.05, 0.03, 20).translate(0, 0.015, 0), '#e2d3b5', { thresh: 30 }); base.position.set(X0, 0, Z); g.add(base);
  const barrelG = new THREE.Group(); barrelG.position.set(X0, 0.035, Z); g.add(barrelG);
  const barrel = ink(new THREE.CylinderGeometry(0.014, 0.018, 0.09, 16).rotateZ(-Math.PI / 2).translate(0.045, 0, 0), '#d9c6a0', { thresh: 30 }); barrelG.add(barrel);
  const ball = ink(new THREE.SphereGeometry(0.016, 16, 12), '#f6d2c4', { thresh: 60 }); glow(ball, '#e8590c', 0.6, 0); g.add(ball);
  const tg = new THREE.BufferGeometry(); const tp = new Float32Array(300 * 3); tg.setAttribute('position', new THREE.BufferAttribute(tp, 3)); tg.setDrawRange(0, 0);
  g.add(new THREE.Line(tg, new THREE.LineBasicMaterial({ color: '#e8590c', toneMapped: false })));
  const mkH = new THREE.Mesh(new THREE.BoxGeometry(0.004, 1, 0.004).translate(0, 0.5, 0), new THREE.MeshBasicMaterial({ color: '#7048e8', toneMapped: false })); mkH.visible = false; g.add(mkH);
  const lH = label('', { size: 0.03, color: '#5f3dc4' }); lH.visible = false; g.add(lH);
  const lR = label('', { size: 0.03, color: '#c2410c' }); lR.visible = false; g.add(lR);
  const vx = arrow('#2b8a3e', 0.007), vy = arrow('#1c7ed6', 0.007); [vx, vy].forEach((a, i) => { a.visible = false; glow(a, i ? '#1c7ed6' : '#2b8a3e', 1, 0); g.add(a); });
  const dial = new THREE.Group(); dial.position.set(0.38, 0, 0.45); g.add(dial);
  dial.add(ink(new THREE.CylinderGeometry(0.045, 0.05, 0.02, 28).translate(0, 0.01, 0), '#ede2cb', { thresh: 20 }));
  const ld = label('θ = 37°', { size: 0.03, color: '#c2410c' }); ld.position.y = 0.04; dial.add(ld);
  const tC = new THREE.Group(); tC.position.set(0.38, 0, 0.24); g.add(tC);
  tC.add(ink(new THREE.CylinderGeometry(0.045, 0.05, 0.026, 32).translate(0, 0.013, 0), '#f3ecdc', { thresh: 20 }));
  const lc = label('v_x , v_y', { size: 0.03, color: '#2b8a3e' }); lc.position.y = 0.035; tC.add(lc);
  const ths = [37, 45, 60, 30]; let ti = 0, busy = false, comp = false;
  const TRIG = { 37: [0.8, 0.6], 45: [Math.SQRT1_2, Math.SQRT1_2], 60: [0.5, Math.sqrt(3) / 2], 30: [Math.sqrt(3) / 2, 0.5] }; // book uses sin37 = 0.6, cos37 = 0.8
  const v0 = 20, gg = 10, P0 = () => V(X0, 0.035, Z);
  const aim = () => { barrelG.rotation.z = (ths[ti] * Math.PI) / 180; ld.setText(`θ = ${ths[ti]}°`); };
  aim(); ball.position.copy(P0());
  const setComp = (p, vxv, vyv) => { const s = 0.006; vx.point(p, p.clone().add(V(vxv * s, 0, 0))); vy.point(p, p.clone().add(V(0, Math.abs(vyv) < 0.2 ? 0.001 : vyv * s, 0))); };
  return {
    group: g,
    targets: [
      { obj: barrelG, hit: [barrel, base], hint: V(X0, 0, Z + 0.1), act: () => {
        if (busy) return; busy = true; const th = (ths[ti] * Math.PI) / 180, [cs, sn] = TRIG[ths[ti]], vxv = v0 * cs, vyv = v0 * sn, T = (2 * vyv) / gg, R = vxv * T, h = (vyv * vyv) / (2 * gg);
        tg.setDrawRange(0, 0); let n = 0; const o = { t: 0 }; mkH.visible = false; lH.visible = lR.visible = false; lH.userData._shown = lR.userData._shown = false;
        gsap.to(o, { t: T, duration: S.reduced ? 0.001 : 1.2 + T * 0.4, ease: 'none', onUpdate: () => {
          const p = P0().add(V(vxv * o.t * sc, (vyv * o.t - 0.5 * gg * o.t * o.t) * sc, 0)); ball.position.copy(p);
          const nn = Math.min(299, Math.ceil((o.t / T) * 150)); for (let i = 0; i <= nn; i++) { const q = (i / 150) * T; tp.set([X0 + vxv * q * sc, 0.035 + (vyv * q - 0.5 * gg * q * q) * sc, Z], i * 3); } n = nn + 1; tg.setDrawRange(0, n); tg.attributes.position.needsUpdate = true;
          if (comp) { vx.visible = vy.visible = true; setComp(p, vxv, vyv - gg * o.t); }
        }, onComplete: () => {
          mkH.visible = true; mkH.position.set(X0 + (R / 2) * sc, 0.035, Z); mkH.scale.y = h * sc; lH.setText(`h_max = ${h.toFixed(1)} m`); lH.position.set(X0 + (R / 2) * sc, 0.06 + h * sc, Z); show(lH);
          lR.setText(`R = ${R.toFixed(1)} m , t = ${T.toFixed(1)} s`); lR.position.set(X0 + R * sc, 0.06, Z + 0.05); show(lR); S.sfx.click();
          setTimeout(() => { ball.position.copy(P0()); busy = false; }, 1500);
        } });
      } },
      { obj: dial, hint: dial.position.clone(), act: () => { ti = (ti + 1) % ths.length; aim(); } },
      { obj: tC, hint: tC.position.clone(), act: () => { comp = !comp; vx.visible = vy.visible = comp; if (comp) { const th = (ths[ti] * Math.PI) / 180; setComp(ball.position.clone(), v0 * Math.cos(th), v0 * Math.sin(th)); } glow(tC, '#2b8a3e', comp ? 0.6 : 0); } },
    ],
    print(x, { P, inkLine, inkText }) {
      inkLine(x, [P(X0 - 0.04, Z + 0.04), P(0.46, Z + 0.04)], { w: 2.5 });
      for (let m = 0; m <= 40; m += 10) { const xx = X0 + m * sc; inkLine(x, [P(xx, Z + 0.03), P(xx, Z + 0.055)], { w: 2, wob: 0 }); inkText(x, `${m} m`, ...P(xx, Z + 0.085), { size: 22 }); }
      inkText(x, 'v_i = 20 m/s ، g = 10 m/s²', ...P(0.0, -0.45), { size: 28, weight: 600 });
      inkText(x, 'R = (v_i² / g) sin 2θ', ...P(0.0, -0.37), { size: 34, color: '#c2410c', weight: 600 });
      inkText(x, 'المدى الأعظم عند 45°', ...P(0.0, -0.3), { size: 26, color: '#6b6155' });
    },
    notes: [{ t: 'غيّر الزاوية', at: [0.2, 0.62], to: [0.33, 0.48] }],
  };
};

/* ---------- small helpers for chapter 3 ---------- */
function tok(S, sym, color, pos) { return token(S, sym, color, pos); }
function block(S, w, h, d, color) { return S.ink(new S.THREE.BoxGeometry(w, h, d).translate(0, h / 2, 0), color); }

/* ---------- 3-1 Forces ---------- */
SCENES.forces = (S) => {
  const { THREE, V, gsap, ink, glow, arrow, label, show } = S;
  const g = new THREE.Group();
  const cube = block(S, 0.12, 0.12, 0.12, '#cfe3f7'); cube.position.set(-0.2, 0, -0.3); g.add(cube);
  const pushA = arrow('#e8590c', 0.009); pushA.visible = false; g.add(pushA); glow(pushA, '#e8590c', 1, 0);
  const pushB = arrow('#e8590c', 0.009); pushB.visible = false; g.add(pushB); glow(pushB, '#e8590c', 1, 0);
  const bar = new THREE.Group(); bar.position.set(-0.05, 0.05, 0.12); g.add(bar);
  const segs = []; for (let i = 0; i < 8; i++) { const s = ink(new THREE.BoxGeometry(0.04, 0.03, 0.05), '#f0dcc0'); s.position.x = -0.16 + i * 0.045; bar.add(s); segs.push(s); }
  const mag = new THREE.Group(); mag.position.set(0.32, 0, 0.4); g.add(mag);
  const mN = block(S, 0.05, 0.04, 0.05, '#f3b5ab'); mN.position.x = -0.025; mag.add(mN);
  const mS = block(S, 0.05, 0.04, 0.05, '#b8cdf0'); mS.position.x = 0.025; mag.add(mS);
  const iron = block(S, 0.05, 0.05, 0.05, '#d6d0c4'); iron.position.set(0.08, 0, 0.4); g.add(iron);
  const scale = new THREE.Group(); scale.position.set(0.3, 0, -0.35); g.add(scale);
  scale.add(block(S, 0.03, 0.2, 0.03, '#ede2cb'));
  const ls = label('0 N', { size: 0.032 }); ls.position.y = 0.23; scale.add(ls);
  const lab = label('', { size: 0.032, color: '#c2410c' }); lab.visible = false; g.add(lab);
  let pressed = false, twisted = false, pulled = false;
  return {
    group: g,
    targets: [
      { obj: cube, hint: V(-0.2, 0, -0.18), act: () => { pressed = !pressed; gsap.to(cube.scale, { x: pressed ? 0.7 : 1, z: pressed ? 1.15 : 1, y: pressed ? 1.1 : 1, duration: S.reduced ? 0 : 0.5, ease: 'back.out(2)' }); pushA.visible = pushB.visible = pressed; pushA.point(V(-0.36, 0.06, -0.3), V(-0.26, 0.06, -0.3)); pushB.point(V(-0.04, 0.06, -0.3), V(-0.14, 0.06, -0.3)); ls.setText(pressed ? '12 N' : '0 N'); lab.setText('كبس: تغيّر الشكل'); lab.position.set(-0.2, 0.2, -0.3); show(lab, pressed); } },
      { obj: bar, hit: segs, hint: V(-0.05, 0, 0.22), act: () => { twisted = !twisted; segs.forEach((s, i) => gsap.to(s.rotation, { x: twisted ? i * 0.18 : 0, duration: S.reduced ? 0 : 0.6, ease: 'power2.out' })); lab.setText('لي: تغيّر الشكل'); lab.position.set(-0.05, 0.15, 0.12); show(lab, twisted); } },
      { obj: mag, hit: [mN, mS], hint: V(0.32, 0, 0.5), act: () => { pulled = !pulled; gsap.to(iron.position, { x: pulled ? 0.25 : 0.08, duration: S.reduced ? 0 : 0.7, ease: pulled ? 'power3.in' : 'power2.out' }); glow(mN, '#e03131', pulled ? 0.7 : 0); lab.setText('جذب دون تماس'); lab.position.set(0.2, 0.12, 0.4); show(lab, pulled); } },
    ],
    print(x, { P, inkText, inkLine }) {
      inkText(x, 'قوى التماس: دفع، سحب، شد، كبس، تدوير، لي', ...P(0.05, -0.08), { size: 26, color: '#c2410c', weight: 600 });
      inkText(x, 'قوى أساسية: الجاذبية، الكهربائية والمغناطيسية، النووية', ...P(0.05, -0.02), { size: 24, color: '#1864ab', weight: 600 });
      inkText(x, 'قبان حلزوني', ...P(0.3, -0.21), { size: 24, color: '#6b6155' });
      inkText(x, '1 N = 1 kg · m/s²', ...P(0.05, 0.58), { size: 34, color: '#c2410c', weight: 600 });
    },
    notes: [],
  };
};

/* ---------- 3-2, 3-3 Inertia and first law ---------- */
SCENES.inertia = (S) => {
  const { THREE, V, gsap, ink, glow, label, show } = S;
  const g = new THREE.Group(), Z = -0.15, H = 0.16, L1 = 0.24, X0 = -0.3;
  const shape = (pts) => { const s = new THREE.Shape(); s.moveTo(pts[0][0], pts[0][1]); pts.slice(1).forEach((p) => s.lineTo(p[0], p[1])); s.closePath(); return ink(new THREE.ExtrudeGeometry(s, { depth: 0.08, bevelEnabled: false }).translate(0, 0, -0.04), '#efe2c8'); };
  const ramp1 = shape([[X0, 0], [X0, H], [X0 + L1, 0]]); ramp1.position.z = Z; g.add(ramp1);
  const ramp2 = new THREE.Group(); g.add(ramp2); ramp2.position.z = Z;
  const slopes = [0.22, 0.42, 0]; let si = 0; // run lengths of second ramp (0 = flat)
  const build2 = () => { ramp2.clear(); const run = slopes[si]; const x1 = X0 + L1; if (run) ramp2.add(shape([[x1, 0], [x1 + run, 0], [x1 + run, H]])); else ramp2.add(shape([[x1, 0], [0.46, 0], [0.46, 0.008], [x1, 0.008]])); };
  build2();
  const hit2 = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.16, 0.1), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })); hit2.position.set(X0 + L1 + 0.11, 0.08, Z); g.add(hit2);
  const ball = ink(new THREE.SphereGeometry(0.018, 16, 12), '#f3b5ab', { thresh: 60 }); glow(ball, '#e03131', 0.5, 0); g.add(ball);
  const r = 0.018, start = () => ball.position.set(X0 + 0.01, H + r, Z); start();
  const lh = label('', { size: 0.03, color: '#1864ab' }); lh.visible = false; g.add(lh);
  // ring-pen-bottle activity
  const bot = new THREE.Group(); bot.position.set(0.2, 0, 0.32); g.add(bot);
  const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 0.16, 20, 1, true), new THREE.MeshPhysicalMaterial({ color: 0xbfe3d0, transparent: true, opacity: 0.35, roughness: 0.1, side: THREE.DoubleSide, depthWrite: false }));
  glass.position.y = 0.08; bot.add(glass); bot.add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.CylinderGeometry(0.03, 0.035, 0.16, 20, 1, true), 20), S.LINE_MAT).translateY(0.08));
  const ring = ink(new THREE.TorusGeometry(0.05, 0.004, 8, 32), '#e8590c', { edges: false }); ring.position.y = 0.21; bot.add(ring);
  const pen = ink(new THREE.CylinderGeometry(0.005, 0.005, 0.06, 8), '#1c7ed6', { edges: false }); pen.position.y = 0.285; bot.add(pen);
  let busy = false;
  const roll = () => {
    if (busy) return; busy = true; start(); const run = slopes[si], x1 = X0 + L1, o = { s: 0 };
    const len1 = Math.hypot(L1, H), up = run ? Math.hypot(run, H) : 0.46 - x1, total = len1 + up;
    gsap.to(o, { s: total, duration: S.reduced ? 0.001 : 2.2, ease: run ? 'sine.inOut' : 'none', onUpdate: () => {
      if (o.s < len1) { const k = o.s / len1; ball.position.set(X0 + 0.01 + k * (L1 - 0.01), H * (1 - k) + r, Z); }
      else { const k = (o.s - len1) / (up || 1); if (run) ball.position.set(x1 + k * run, k * H + r, Z); else ball.position.set(x1 + k * (0.46 - x1), r + 0.008, Z); }
    }, onComplete: () => { lh.setText(run ? 'يعود إلى الارتفاع نفسه تقريباً' : 'تستمر في الحركة بلا احتكاك'); lh.position.set(0.15, 0.24, Z); show(lh); setTimeout(() => { start(); busy = false; lh.visible = false; lh.userData._shown = false; }, 1800); } });
  };
  return {
    group: g,
    targets: [
      { obj: ball, hint: V(X0 + 0.02, 0, Z + 0.08), act: roll },
      { obj: hit2, hint: V(0.15, 0, Z + 0.08), act: () => { si = (si + 1) % slopes.length; build2(); } },
      { obj: bot, hit: [ring, glass, pen], hint: V(0.2, 0, 0.42), act: () => { gsap.to(ring.position, { x: 0.4, duration: S.reduced ? 0 : 0.25, ease: 'power3.out' }); gsap.to(pen.position, { y: 0.06, duration: S.reduced ? 0 : 0.5, delay: 0.15, ease: 'power2.in', onComplete: () => setTimeout(() => { ring.position.x = 0; pen.position.y = 0.285; }, 1800) }); } },
    ],
    print(x, { P, inkText, inkLine }) {
      inkLine(x, [P(X0, Z - 0.06 + H * 0 - 0.0), P(0.46, Z - 0.06)], { w: 1.5, dash: [8, 8], color: '#c2410c' });
      inkText(x, 'مستويا غاليليو', ...P(0.06, Z - 0.13), { size: 26, color: '#6b6155' });
      inkText(x, 'نشاط: الحلقة والقلم فوق فوهة القنينة', ...P(-0.1, 0.48), { size: 25, color: '#6b6155' });
      inkText(x, 'ΣF = 0  ⇒  سرعة ثابتة أو سكون', ...P(0.04, 0.58), { size: 30, color: '#c2410c', weight: 600 });
    },
    notes: [],
  };
};

/* ---------- 3-3 Gravitation ---------- */
SCENES.gravity = (S) => {
  const { THREE, V, gsap, ink, glow, arrow, label, jar, show } = S;
  const g = new THREE.Group(), EX = -0.25, Z = 0.0, R = 0.07, Y = 0.08;
  const earth = ink(new THREE.SphereGeometry(R, 28, 20), '#cfe3f7', { thresh: 60 }); earth.position.set(EX, Y, Z); g.add(earth);
  const rod = ink(new THREE.BoxGeometry(0.62, 0.006, 0.02).translate(0.31, 0.003, 0), '#ede2cb'); rod.position.set(EX, 0, Z + 0.1); g.add(rod);
  const body = block(S, 0.04, 0.04, 0.04, '#f6d2c4'); g.add(body);
  const W = arrow('#e03131', 0.008); g.add(W); glow(W, '#e03131', 1, 0);
  const J = jar({ max: 1200, color: '#e03131', name: 'F =', unit: 'N' }); J.position.set(0.37, 0, -0.42); g.add(J);
  const moon = ink(new THREE.SphereGeometry(0.025, 18, 12), '#e9e4da', { thresh: 60 }); moon.position.set(0.18, Y, -0.38); g.add(moon);
  const pa = arrow('#7048e8', 0.006), pb = arrow('#7048e8', 0.006); [pa, pb].forEach((a) => { a.visible = false; glow(a, '#7048e8', 1, 0); g.add(a); });
  const lm = label('F₁₂ = − F₂₁', { size: 0.03, color: '#5f3dc4' }); lm.visible = false; g.add(lm);
  const ds = [1, 2, 3]; let di = 0, mm = 1;
  const place = () => {
    const d = ds[di], x = EX + d * 0.13 + 0.0, F = (600 * mm) / (d * d);
    gsap.to(body.position, { x: x - 0.02 * 0, y: 0, z: Z + 0.1, duration: S.reduced ? 0 : 0.6, ease: 'power2.inOut', onUpdate: () => { const p = body.position.clone().add(V(0, 0.02, 0)); const dir = earth.position.clone().sub(p).normalize(); W.point(p, p.clone().addScaledVector(dir, 0.04 + F / 1200 * 0.2)); } });
    body.scale.set(1, mm, 1);
    J.set(F, 0.6, `F = ${Math.round(F)} N (d = ${d}R)`);
  };
  body.position.set(EX + 0.13, 0, Z + 0.1); place();
  return {
    group: g,
    targets: [
      { obj: body, hint: V(EX + 0.13, 0, Z + 0.2), act: () => { di = (di + 1) % ds.length; place(); } },
      { obj: rod, hint: V(EX + 0.45, 0, Z + 0.2), act: () => { mm = mm === 1 ? 2 : 1; place(); } },
      { obj: moon, hint: V(0.18, 0, -0.3), act: () => { pa.visible = pb.visible = true; const e = earth.position, m = moon.position, dir = m.clone().sub(e).normalize(); pa.point(m, m.clone().addScaledVector(dir, -0.1)); pb.point(e.clone().addScaledVector(dir, R), e.clone().addScaledVector(dir, R + 0.1)); lm.position.copy(e).lerp(m, 0.5).add(V(0, 0.05, 0)); show(lm); } },
    ],
    print(x, { P, inkText, inkLine }) {
      [1, 2, 3].forEach((d) => { const xx = EX + d * 0.13; inkLine(x, [P(xx, Z + 0.15), P(xx, Z + 0.18)], { w: 2, wob: 0 }); inkText(x, `${d}R`, ...P(xx, Z + 0.21), { size: 24 }); });
      inkText(x, '600 N  ←  150 N  ←  67 N', ...P(0.0, Z + 0.28), { size: 26, color: '#6b6155' });
      inkText(x, 'F = G m₁ m₂ / d²', ...P(0.0, 0.46), { size: 38, color: '#c2410c', weight: 600 });
      inkText(x, 'G = 6.67 × 10⁻¹¹ N·m²/kg²', ...P(0.0, 0.54), { size: 26 });
    },
    notes: [],
  };
};

/* ---------- 3-3 Third law ---------- */
SCENES.law3 = (S) => {
  const { THREE, V, gsap, ink, glow, arrow, label, jar, show, dots } = S;
  const g = new THREE.Group(), Z = 0.2;
  const track = block(S, 0.76, 0.008, 0.1, '#e6dccb'); track.position.set(0.06, 0, Z); g.add(track);
  const c1 = car(S, '#f6d2c4'), c2 = car(S, '#cfe3f7'); c1.position.set(0.0, 0.008, Z); c2.position.set(0.14, 0.008, Z); c2.add(block(S, 0.06, 0.04, 0.05, '#bcd2ee').translateY(0.07)); g.add(c1, c2);
  const spring = ink(new THREE.TorusKnotGeometry(0.01, 0.003, 50, 6, 1, 6).scale(2.2, 1, 1), '#555', { edges: false }); spring.position.set(0.07, 0.035, Z); g.add(spring);
  const f1 = arrow('#e8590c', 0.008), f2 = arrow('#1c7ed6', 0.008); [f1, f2].forEach((a, i) => { a.visible = false; glow(a, i ? '#1c7ed6' : '#e8590c', 1, 0); g.add(a); });
  const l1 = label('m = 1 kg', { size: 0.028 }); l1.position.set(0, 0.1, 0); c1.add(l1);
  const l2 = label('m = 2 kg', { size: 0.028 }); l2.position.set(0, 0.14, 0); c2.add(l2);
  const lp = label('F₁₂ = − F₂₁', { size: 0.032, color: '#5f3dc4' }); lp.visible = false; g.add(lp);
  const rocket = new THREE.Group(); rocket.position.set(0.3, 0, -0.35); g.add(rocket);
  rocket.add(ink(new THREE.CylinderGeometry(0.025, 0.025, 0.14, 18).translate(0, 0.09, 0), '#ede6da', { thresh: 30 }));
  rocket.add(ink(new THREE.ConeGeometry(0.025, 0.05, 18).translate(0, 0.185, 0), '#e03131', { thresh: 30 }));
  const pad = block(S, 0.1, 0.012, 0.1, '#d9cdb4'); pad.position.set(0.3, 0, -0.35); g.add(pad);
  const gas = dots(30, '#ffa94d', 0.009); g.add(gas); const gp = [...Array(30)].map(() => ({ t: Math.random(), a: Math.random() * 6.28 }));
  const ra = arrow('#2b8a3e', 0.008), rg = arrow('#e8590c', 0.008); [ra, rg].forEach((a, i) => { a.visible = false; glow(a, i ? '#e8590c' : '#2b8a3e', 1, 0); g.add(a); });
  const tP = token(S, 'F₁₂ , F₂₁', '#5f3dc4', V(-0.22, 0, -0.2)); g.add(tP);
  let busy = false, fly = 0, pairs = false;
  const reset = () => { c1.position.x = 0.0; c2.position.x = 0.14; spring.visible = true; };
  return {
    group: g,
    targets: [
      { obj: spring, hit: [spring, c1, c2], hint: V(0.07, 0, Z + 0.09), act: () => {
        if (busy) return; busy = true; reset(); spring.visible = false; const o = { t: 0 };
        gsap.to(o, { t: 1, duration: S.reduced ? 0.001 : 1.6, ease: 'power2.out', onUpdate: () => { c1.position.x = 0.0 - 0.26 * o.t; c2.position.x = 0.14 + 0.13 * o.t; if (pairs) { f1.point(V(c1.position.x + 0.05, 0.05, Z), V(c1.position.x - 0.05, 0.05, Z)); f2.point(V(c2.position.x - 0.05, 0.05, Z), V(c2.position.x + 0.05, 0.05, Z)); } }, onComplete: () => setTimeout(() => { reset(); busy = false; }, 1400) });
      } },
      { obj: rocket, hit: rocket.children, hint: V(0.3, 0, -0.24), act: () => { fly = S.reduced ? 0.01 : 2.4; ra.visible = rg.visible = true; } },
      { obj: tP, hint: tP.position.clone(), act: () => { pairs = true; f1.visible = f2.visible = true; f1.point(V(c1.position.x + 0.05, 0.05, Z), V(c1.position.x - 0.06, 0.05, Z)); f2.point(V(c2.position.x - 0.05, 0.05, Z), V(c2.position.x + 0.06, 0.05, Z)); lp.position.set(0.07, 0.2, Z); show(lp); } },
    ],
    update(dt) {
      const on = fly > 0; if (on) { fly -= dt; rocket.position.y = Math.min(0.25, rocket.position.y + dt * 0.12); } else if (rocket.position.y > 0) { rocket.position.y = Math.max(0, rocket.position.y - dt * 0.3); if (rocket.position.y === 0) ra.visible = rg.visible = false; }
      gp.forEach((p, i) => { p.t = (p.t + dt * 2.5) % 1; gas.setAt(i, 0.3 + Math.cos(p.a) * 0.02 * p.t, rocket.position.y + 0.02 - p.t * 0.1, -0.35 + Math.sin(p.a) * 0.02 * p.t, on ? 1 : 0); }); gas.commit();
      if (ra.visible) { const b = rocket.position.clone(); ra.point(b.clone().add(V(0.05, 0.1, 0)), b.clone().add(V(0.05, 0.2, 0))); rg.point(b.clone().add(V(-0.05, 0.05, 0)), b.clone().add(V(-0.05, -0.05, 0))); }
    },
    print(x, { P, inkText }) {
      inkText(x, 'لكل فعل رد فعل يساويه مقداراً ويعاكسه اتجاهاً', ...P(0.05, 0.42), { size: 26, color: '#c2410c', weight: 600 });
      inkText(x, 'وتؤثر القوتان في جسمين مختلفين', ...P(0.05, 0.49), { size: 25, color: '#6b6155' });
      inkText(x, 'دفع الغازات ← دفع الصاروخ', ...P(0.3, -0.18), { size: 23, color: '#6b6155' });
    },
    notes: [],
  };
};

/* ---------- 3-4 Normal force ---------- */
SCENES.normal = (S) => {
  const { THREE, V, gsap, ink, glow, arrow, label, jar, show } = S;
  const g = new THREE.Group(), C = V(-0.08, 0, 0.0);
  const tilt = new THREE.Group(); tilt.position.copy(C); g.add(tilt);
  const plat = block(S, 0.36, 0.014, 0.16, '#e6dccb'); tilt.add(plat);
  const box = block(S, 0.09, 0.09, 0.09, '#f1ddb8'); box.position.y = 0.014; tilt.add(box);
  const N = arrow('#2b8a3e', 0.009), Wv = arrow('#e03131', 0.009), F = arrow('#e8590c', 0.009), T = arrow('#7048e8', 0.008);
  [N, Wv, F, T].forEach((a, i) => { glow(a, ['#2b8a3e', '#e03131', '#e8590c', '#7048e8'][i], 1, 0); g.add(a); }); F.visible = false; T.visible = false;
  const lN = label('N', { size: 0.03, color: '#2b8a3e' }), lW = label('W = 50 N', { size: 0.03, color: '#c92a2a' }); g.add(lN, lW);
  const J = jar({ max: 70, color: '#2b8a3e', name: 'N =', unit: 'N', digits: 1 }); J.position.set(0.36, 0, -0.42); g.add(J);
  const rope = new THREE.Group(); rope.position.set(0.3, 0, 0.35); g.add(rope); rope.add(token(S, 'T', '#7048e8', V()));
  const cases = [['none', 0], ['down', 10], ['up', 10]]; let ci = 0, ang = 0, rp = false;
  const upd = () => {
    tilt.rotation.z = ang; tilt.updateMatrixWorld(true);
    const top = g.worldToLocal(box.localToWorld(V(0, 0.09, 0))), mid = g.worldToLocal(box.localToWorld(V(0, 0.045, 0))), nrm = V(-Math.sin(ang), Math.cos(ang), 0);
    const [kind, f] = cases[ci]; const Nv = (50 + (kind === 'down' ? f : kind === 'up' ? -f : 0)) * Math.cos(ang);
    N.point(mid.clone().addScaledVector(nrm, 0.045), mid.clone().addScaledVector(nrm, 0.045 + Nv * 0.0035)); lN.position.copy(mid).addScaledVector(nrm, 0.07 + Nv * 0.0035); lN.setText(`N = ${Nv.toFixed(Nv % 1 ? 1 : 0)} N`);
    Wv.point(mid.clone().add(V(0.0, 0, 0.05)), mid.clone().add(V(0, -50 * 0.0035, 0.05))); lW.position.copy(mid).add(V(0.09, -0.06, 0.05));
    F.visible = kind !== 'none'; if (F.visible) { if (kind === 'down') F.point(top.clone().add(V(0.03, 0.08, 0)), top.clone().add(V(0.03, 0.005, 0))); else F.point(top.clone().add(V(0.03, 0.005, 0)), top.clone().add(V(0.03, 0.08, 0))); }
    T.visible = rp; if (rp) T.point(mid.clone().add(V(0.045, 0, 0)), mid.clone().add(V(0.16, 0, 0)));
    J.set(Nv, 0.5, `N = ${Nv.toFixed(1)} N`);
  };
  upd();
  return {
    group: g,
    targets: [
      { obj: box, hint: V(C.x, 0, 0.12), act: () => { ci = (ci + 1) % cases.length; upd(); } },
      { obj: plat, hint: V(C.x + 0.15, 0, 0.12), act: () => { const to = ang ? 0 : (30 * Math.PI) / 180, o = { a: ang }; gsap.to(o, { a: to, duration: S.reduced ? 0 : 0.8, ease: 'power2.inOut', onUpdate: () => { ang = o.a; upd(); }, onComplete: () => { ang = to; upd(); } }); } },
      { obj: rope, hint: V(0.3, 0, 0.45), act: () => { rp = !rp; upd(); } },
    ],
    print(x, { P, inkText }) {
      inkText(x, 'N = W  ،  N = W + F  ،  N = W − F', ...P(0.04, 0.44), { size: 28, color: '#c2410c', weight: 600 });
      inkText(x, 'على مستوٍ مائل: N = W cos θ', ...P(0.04, 0.51), { size: 28, color: '#c2410c', weight: 600 });
      inkText(x, 'القوة العمودية عمودية على السطح دائماً', ...P(0.04, 0.58), { size: 24, color: '#6b6155' });
    },
    notes: [],
  };
};

/* ---------- 3-5 Free body diagram (Atwood) ---------- */
SCENES.fbd = (S) => {
  const { THREE, V, gsap, ink, glow, arrow, label, jar, show } = S;
  const g = new THREE.Group(), PX = -0.05, PY = 0.46, Z = 0.0, r = 0.05;
  g.add(block(S, 0.2, 0.012, 0.1, '#e6dccb').translateX(PX).translateZ(Z));
  const post = block(S, 0.014, PY, 0.014, '#e6dccb'); post.position.set(PX - 0.09, 0, Z); g.add(post);
  const arm = ink(new THREE.BoxGeometry(0.1, 0.01, 0.01), '#e6dccb'); arm.position.set(PX - 0.04, PY, Z); g.add(arm);
  const wheel = ink(new THREE.CylinderGeometry(r, r, 0.016, 28).rotateX(Math.PI / 2), '#e2d3b5', { thresh: 20 }); wheel.position.set(PX, PY, Z); g.add(wheel);
  const m1 = block(S, 0.045, 0.045, 0.045, '#cfe3f7'), m2 = block(S, 0.055, 0.055, 0.055, '#f6d2c4'); g.add(m1, m2);
  const s1 = new THREE.Line(new THREE.BufferGeometry().setFromPoints([V(), V()]), S.LINE_MAT), s2 = s1.clone(); s2.geometry = new THREE.BufferGeometry().setFromPoints([V(), V()]); g.add(s1, s2);
  const l1 = label('m₁ = 2 kg', { size: 0.028, color: '#1864ab' }), l2 = label('m₂ = 3 kg', { size: 0.028, color: '#c92a2a' }); g.add(l1, l2);
  const arrs = [0, 1, 2, 3].map((i) => { const a = arrow(['#7048e8', '#e03131', '#7048e8', '#e03131'][i], 0.006); a.visible = false; glow(a, ['#7048e8', '#e03131', '#7048e8', '#e03131'][i], 1, 0); g.add(a); return a; });
  const jA = jar({ max: 5, color: '#e8590c', name: 'a =', unit: 'm/s²', digits: 1 }); jA.position.set(0.25, 0, -0.42); g.add(jA);
  const jT = jar({ max: 40, color: '#7048e8', name: 'T =', unit: 'N', digits: 0 }); jT.position.set(0.38, 0, -0.2); g.add(jT);
  let y1 = 0.2, y2 = 0.2, M1 = 2, M2 = 3, showF = false, busy = false;
  const place = () => {
    m1.position.set(PX - r, y1, Z); m2.position.set(PX + r, y2, Z); m1.scale.y = M1 === 3 ? 1.2 : 1;
    s1.geometry.setFromPoints([V(PX - r, PY, Z), V(PX - r, y1 + 0.045 * m1.scale.y, Z)]); s2.geometry.setFromPoints([V(PX + r, PY, Z), V(PX + r, y2 + 0.055, Z)]);
    l1.position.set(PX - r - 0.09, y1 + 0.03, Z); l2.position.set(PX + r + 0.09, y2 + 0.03, Z); l1.setText(`m₁ = ${M1} kg`);
    const a = (10 * (M2 - M1)) / (M1 + M2), T = M1 * (10 + a);
    if (showF) { const k = 0.0035; arrs[0].point(V(PX - r, y1 + 0.05, Z + 0.04), V(PX - r, y1 + 0.05 + T * k, Z + 0.04)); arrs[1].point(V(PX - r, y1, Z + 0.04), V(PX - r, y1 - M1 * 10 * k, Z + 0.04)); arrs[2].point(V(PX + r, y2 + 0.06, Z + 0.04), V(PX + r, y2 + 0.06 + T * k, Z + 0.04)); arrs[3].point(V(PX + r, y2, Z + 0.04), V(PX + r, y2 - M2 * 10 * k, Z + 0.04)); }
    return { a, T };
  };
  place();
  return {
    group: g,
    targets: [
      { obj: wheel, hint: V(PX, 0, Z + 0.1), act: () => { if (busy) return; busy = true; const { a, T } = place(); jA.set(a, 0.5, `a = ${a.toFixed(1)} m/s²`); jT.set(T, 0.5, `T = ${T.toFixed(0)} N`); const o = { t: 0 }, Tm = 1.2;
        gsap.to(o, { t: Tm, duration: S.reduced ? 0.001 : 1.6, ease: 'none', onUpdate: () => { const d = 0.5 * a * o.t * o.t * 0.06; y1 = 0.2 + d; y2 = 0.2 - d; wheel.rotation.z = -d / r; place(); }, onComplete: () => setTimeout(() => { y1 = y2 = 0.2; place(); busy = false; }, 1400) }); } },
      { obj: jT, hit: jT.hit, hint: V(0.38, 0, -0.1), act: () => { showF = !showF; arrs.forEach((a) => (a.visible = showF)); place(); } },
      { obj: m1, hint: V(PX - r, 0, Z + 0.1), act: () => { M1 = M1 === 2 ? 3 : 2; const { a, T } = place(); jA.set(a, 0.5, `a = ${a.toFixed(1)} m/s²`); jT.set(T, 0.5, `T = ${T.toFixed(0)} N`); } },
    ],
    print(x, { P, inkText }) {
      inkText(x, 'T − m₁g = m₁a', ...P(-0.1, 0.38), { size: 30, color: '#1864ab', weight: 600 });
      inkText(x, 'm₂g − T = m₂a', ...P(-0.1, 0.45), { size: 30, color: '#c92a2a', weight: 600 });
      inkText(x, 'g = 10 m/s²  ،  البكرة ملساء مهملة الكتلة', ...P(0.0, 0.53), { size: 24, color: '#6b6155' });
      inkText(x, 'انقر الجرّة T لرسم مخطط الجسم الحر', ...P(0.06, 0.6), { size: 22, color: '#6b6155' });
    },
    notes: [],
  };
};

/* ---------- 3-6 Friction ---------- */
SCENES.friction = (S) => {
  const { THREE, V, gsap, ink, glow, arrow, label, jar, show } = S;
  const g = new THREE.Group(), Z = 0.08, X0 = -0.2;
  const floor = block(S, 0.76, 0.012, 0.16, '#d9c6a0'); floor.position.set(0.06, 0, Z); g.add(floor);
  const crate = new THREE.Group(); crate.position.set(X0, 0.012, Z); g.add(crate);
  const cb = block(S, 0.1, 0.08, 0.1, '#e9c99a'); crate.add(cb);
  const extra = block(S, 0.08, 0.06, 0.08, '#c9b089'); extra.position.y = 0.08; extra.visible = false; crate.add(extra);
  const scale = new THREE.Group(); g.add(scale); scale.add(ink(new THREE.CylinderGeometry(0.012, 0.012, 0.12, 12).rotateZ(Math.PI / 2), '#f0e3c8', { thresh: 30 }));
  const Fa = arrow('#e8590c', 0.008), fa = arrow('#2b8a3e', 0.008); [Fa, fa].forEach((a, i) => { glow(a, i ? '#2b8a3e' : '#e8590c', 1, 0); g.add(a); });
  const lF = label('F = 0', { size: 0.03, color: '#c2410c' }), lf = label('f = 0', { size: 0.03, color: '#2b8a3e' }); g.add(lF, lf);
  const J = jar({ max: 110, color: '#2b8a3e', name: 'f =', unit: 'N' }); J.position.set(0.36, 0, -0.42); g.add(J);
  const lens = new THREE.Group(); lens.position.set(-0.1, 0, -0.38); g.add(lens);
  lens.add(ink(new THREE.TorusGeometry(0.05, 0.008, 8, 32).rotateX(-Math.PI / 2).translate(0, 0.02, 0), '#adb5bd', { edges: false }));
  const micro = new THREE.Group(); micro.visible = false; micro.position.set(0.12, 0, -0.38); g.add(micro);
  for (let i = 0; i < 9; i++) { const a = ink(new THREE.ConeGeometry(0.012, 0.03 + (i % 3) * 0.008, 6).translate(0, 0.02, 0), '#d9c6a0', { edges: false }); a.position.set(-0.12 + i * 0.03, 0, 0); micro.add(a); const b = ink(new THREE.ConeGeometry(0.012, 0.03 + ((i + 1) % 3) * 0.008, 6).rotateX(Math.PI).translate(0, 0.07, 0), '#e9c99a', { edges: false }); b.position.set(-0.105 + i * 0.03, 0, 0); micro.add(b); }
  const steps = [0, 20, 40, 50, 'slide']; let si = 0, heavy = 1, sliding = false;
  const fmax = () => 50 * heavy, fk = () => 30 * heavy;
  const upd = () => {
    const st = steps[si]; let F = st === 'slide' ? fmax() : st * heavy, f = F;
    if (st === 'slide') f = fk();
    const p = crate.position, k = 0.0025;
    scale.position.set(p.x + 0.12, 0.05, Z);
    Fa.point(V(p.x + 0.05, 0.05, Z + 0.06), V(p.x + 0.05 + Math.max(0.001, F * k), 0.05, Z + 0.06)); fa.point(V(p.x - 0.05, 0.01, Z + 0.06), V(p.x - 0.05 - Math.max(0.001, f * k), 0.01, Z + 0.06));
    lF.setText(`F = ${F} N`); lF.position.set(p.x + 0.1, 0.1, Z + 0.06); lf.setText(st === 'slide' ? `f_k = ${f} N` : `f_s = ${f} N`); lf.position.set(p.x - 0.1, 0.06, Z + 0.06);
    J.set(f, 0.5, st === 'slide' ? `f_k = μ_k N = ${f} N` : (F >= fmax() ? `f_s max = μ_s N = ${f} N` : `f_s = ${f} N`));
    if (st === 'slide' && !sliding) { sliding = true; gsap.to(crate.position, { x: X0 + 0.4, duration: S.reduced ? 0 : 1.8, ease: 'power1.in', onUpdate: upd, onComplete: () => setTimeout(() => { crate.position.x = X0; sliding = false; si = 0; upd(); }, 1200) }); }
  };
  upd();
  return {
    group: g,
    targets: [
      { obj: scale, hint: V(X0 + 0.14, 0, Z + 0.12), act: () => { if (sliding) return; si = (si + 1) % steps.length; upd(); } },
      { obj: crate, hit: [cb, extra], hint: V(X0, 0, Z - 0.12), act: () => { if (sliding) return; heavy = heavy === 1 ? 2 : 1; extra.visible = heavy === 2; si = 0; upd(); } },
      { obj: lens, hint: V(-0.1, 0, -0.28), act: () => { micro.visible = !micro.visible; } },
    ],
    print(x, { P, inkText }) {
      inkText(x, 'μ_s = 0.5  ،  μ_k = 0.3  ،  N = 100 N', ...P(0.05, 0.36), { size: 26 });
      inkText(x, 'f_s max = μ_s N   ،   f_k = μ_k N', ...P(0.05, 0.44), { size: 32, color: '#c2410c', weight: 600 });
      inkText(x, 'الاحتكاك الانزلاقي أصغر من السكوني الأعظم', ...P(0.05, 0.52), { size: 24, color: '#6b6155' });
      inkText(x, 'نقاط التماس المجهرية', ...P(0.12, -0.3), { size: 22, color: '#6b6155' });
    },
    notes: [],
  };
};

/* ---------- 4-1, 4-2 Translational equilibrium ---------- */
SCENES.equil = (S) => {
  const { THREE, V, gsap, ink, glow, arrow, label, show } = S;
  const g = new THREE.Group(), PX = -0.1, PY = 0.42, Z = -0.05, L = 0.26;
  g.add(block(S, 0.2, 0.012, 0.1, '#e6dccb').translateX(PX + 0.06).translateZ(Z));
  const post = block(S, 0.014, PY, 0.014, '#e6dccb'); post.position.set(PX - 0.03, 0, Z); g.add(post);
  const beam = ink(new THREE.BoxGeometry(0.14, 0.012, 0.02), '#e6dccb'); beam.position.set(PX + 0.04, PY, Z); g.add(beam);
  const ball = ink(new THREE.SphereGeometry(0.025, 18, 12), '#f6d2c4', { thresh: 60 }); g.add(ball);
  const str = new THREE.Line(new THREE.BufferGeometry().setFromPoints([V(), V()]), S.LINE_MAT); g.add(str);
  const T = arrow('#7048e8', 0.007), W = arrow('#e03131', 0.007), F = arrow('#e8590c', 0.007), Tx = arrow('#9775fa', 0.005), Ty = arrow('#9775fa', 0.005);
  [T, W, F, Tx, Ty].forEach((a, i) => { glow(a, ['#7048e8', '#e03131', '#e8590c', '#9775fa', '#9775fa'][i], 1, 0); g.add(a); });
  const hand = token(S, 'F', '#e8590c', V(0.3, 0, Z + 0.25)); g.add(hand);
  const lt = label('', { size: 0.028, color: '#5f3dc4' }), lw = label('w = 20 N', { size: 0.028, color: '#c92a2a' }), lf = label('F = 15 N', { size: 0.028, color: '#c2410c' }); g.add(lt, lw, lf);
  const tri = new THREE.Group(); tri.visible = false; tri.position.set(0.28, 0.02, -0.4); g.add(tri);
  const t1 = arrow('#e8590c', 0.006), t2 = arrow('#e03131', 0.006), t3 = arrow('#7048e8', 0.006); [t1, t2, t3].forEach((a, i) => { glow(a, ['#e8590c', '#e03131', '#7048e8'][i], 1, 0); tri.add(a); });
  const k = 0.006; t1.point(V(0, 0.2, 0), V(15 * k, 0.2, 0)); t2.point(V(15 * k, 0.2, 0), V(15 * k, 0.2 - 20 * k, 0)); t3.point(V(15 * k, 0.2 - 20 * k, 0), V(0, 0.2, 0));
  const ltri = label('ΣF = 0', { size: 0.03, color: '#2b8a3e' }); ltri.position.set(0.05, 0.24, 0); tri.add(ltri);
  const compTok = token(S, 'Tₓ , T_y', '#7048e8', V(0.3, 0, Z + 0.05)); g.add(compTok);
  let ang = 0, pull = false, comp = false;
  const upd = () => {
    const top = V(PX + 0.08, PY, Z), b = top.clone().add(V(Math.sin(ang) * L, -Math.cos(ang) * L, 0));
    ball.position.copy(b); str.geometry.setFromPoints([top, b.clone().add(V(-Math.sin(ang) * 0.025, Math.cos(ang) * 0.025, 0))]);
    const Tm = pull ? 25 : 20, dir = top.clone().sub(b).normalize();
    T.point(b, b.clone().addScaledVector(dir, Tm * k)); W.point(b, b.clone().add(V(0, -20 * k, 0))); F.visible = pull; F.point(b, b.clone().add(V(15 * k, 0, 0)));
    lt.setText(`T = ${Tm} N`); lt.position.copy(b).addScaledVector(dir, Tm * k + 0.03); lw.position.copy(b).add(V(0.04, -20 * k - 0.02, 0)); lf.visible = pull; lf.position.copy(b).add(V(15 * k + 0.05, 0, 0));
    Tx.visible = Ty.visible = comp && pull; Tx.point(b.clone().add(V(0, 0, 0.03)), b.clone().add(V(-15 * k, 0, 0.03))); Ty.point(b.clone().add(V(0, 0, 0.03)), b.clone().add(V(0, 20 * k, 0.03)));
  };
  upd();
  return {
    group: g,
    targets: [
      { obj: hand, hint: hand.position.clone(), act: () => { pull = !pull; const o = { a: ang }; gsap.to(o, { a: pull ? (37 * Math.PI) / 180 : 0, duration: S.reduced ? 0 : 0.9, ease: 'elastic.out(1,0.6)', onUpdate: () => { ang = o.a; upd(); } }); if (S.reduced) { ang = pull ? (37 * Math.PI) / 180 : 0; upd(); } } },
      { obj: compTok, hint: compTok.position.clone(), act: () => { comp = !comp; upd(); } },
      { obj: ball, hint: V(PX + 0.1, 0, Z + 0.1), act: () => { tri.visible = !tri.visible; } },
    ],
    print(x, { P, inkText }) {
      inkText(x, '53°', ...P(PX + 0.1, Z - 0.05), { size: 24 });
      inkText(x, 'Tₓ = T cos53° = F   ،   T_y = T sin53° = w', ...P(0.04, 0.44), { size: 26, color: '#c2410c', weight: 600 });
      inkText(x, 'مضلع القوى المغلق', ...P(0.3, -0.48), { size: 22, color: '#6b6155' });
    },
    notes: [],
  };
};

/* ---------- 4-4 Wrench activity ---------- */
SCENES.wrench = (S) => {
  const { THREE, V, gsap, ink, glow, arrow, label, jar, show } = S;
  const g = new THREE.Group(), O = V(-0.2, 0.03, 0.05);
  const plate = block(S, 0.14, 0.03, 0.14, '#e6dccb'); plate.position.set(O.x, 0, O.z); g.add(plate);
  const bolt = new THREE.Group(); bolt.position.copy(O); g.add(bolt);
  bolt.add(ink(new THREE.CylinderGeometry(0.03, 0.03, 0.03, 6).translate(0, 0.015, 0), '#c9c3b6', { thresh: 20 }));
  const wr = new THREE.Group(); wr.position.copy(O).add(V(0, 0.03, 0)); g.add(wr);
  wr.add(ink(new THREE.TorusGeometry(0.04, 0.012, 8, 6).rotateX(Math.PI / 2), '#adb5bd', { edges: false }));
  wr.add(ink(new THREE.BoxGeometry(0.5, 0.014, 0.04).translate(0.27, 0, 0), '#ced4da'));
  const Fa = arrow('#e8590c', 0.009); g.add(Fa); glow(Fa, '#e8590c', 1, 0);
  const pin = ink(new THREE.SphereGeometry(0.014, 12, 10), '#e8590c', { thresh: 60 }); g.add(pin);
  const lever = arrow('#2b8a3e', 0.005); g.add(lever); glow(lever, '#2b8a3e', 1, 0);
  const lF = label('', { size: 0.03, color: '#c2410c' }); g.add(lF);
  const J = jar({ max: 6, color: '#e8590c', name: 'τ =', unit: 'N·m', digits: 1 }); J.position.set(0.36, 0, -0.42); g.add(J);
  const dial = token(S, 'θ', '#c2410c', V(0.36, 0, 0.45)); g.add(dial);
  const Fs = [20, 10], ls = [0.2, 0.1], ths = [90, 37, 0]; let fi = 0, li = 0, ti = 0, tau = 0;
  const sc = 0.45 / 0.2;
  const upd = () => {
    const F = Fs[fi], l = ls[li], th = ths[ti], s = th === 37 ? 0.6 : Math.sin((th * Math.PI) / 180);
    tau = F * l * s; const p = O.clone().add(V(l * sc + 0.02, 0.04, 0)); pin.position.copy(p);
    const ang = (th * Math.PI) / 180, dir = V(-Math.cos(ang), 0, -Math.sin(ang)), Lg = F * 0.008;
    Fa.point(p.clone().addScaledVector(dir, -Lg).add(V(0, 0.002, 0)), p); Fa.point(p, p.clone().addScaledVector(V(Math.cos(Math.PI - ang), 0, -Math.sin(ang)), Lg));
    lever.visible = s > 0.01; const foot = O.clone().add(V(0, 0.045, 0)); const fd = V(Math.cos(Math.PI - ang), 0, -Math.sin(ang)); const proj = p.clone().sub(foot).dot(fd); const perp = p.clone().sub(fd.clone().multiplyScalar(proj)).setY(0.045); lever.point(foot, perp.lengthSq() > 0 ? perp : foot);
    lF.setText(`F = ${F} N , ℓ = ${l} m , θ = ${th}°`); lF.position.copy(p).add(V(0.0, 0.08, 0.06));
    J.set(tau, 0.5, `τ = ${F}×${l}×sin${th}° = ${tau.toFixed(1)} N·m`);
  };
  upd();
  return {
    group: g,
    targets: [
      { obj: Fa, hint: V(0.1, 0, 0.17), act: () => { fi = (fi + 1) % Fs.length; upd(); } },
      { obj: pin, hit: [pin, wr.children[1]], hint: V(-0.02, 0, 0.17), act: () => { li = (li + 1) % ls.length; upd(); } },
      { obj: dial, hint: dial.position.clone(), act: () => { ti = (ti + 1) % ths.length; upd(); } },
    ],
    update(dt) { bolt.rotation.y += dt * tau * 0.35; wr.rotation.y = bolt.rotation.y * 0.0; },
    print(x, { P, inkText, inkLine }) {
      inkText(x, 'τ = F ℓ sin θ', ...P(0.04, 0.4), { size: 40, color: '#c2410c', weight: 600 });
      inkText(x, 'الأخضر: ذراع القوة ℓ sin θ', ...P(0.04, 0.48), { size: 25, color: '#2b8a3e' });
      inkText(x, 'نشاط مفتاح الربط والقبان (الشكل 7)', ...P(0.04, 0.56), { size: 24, color: '#6b6155' });
    },
    notes: [],
  };
};

/* ---------- 4-5 Torque as a vector (door) ---------- */
SCENES.torquevec = (S) => {
  const { THREE, V, gsap, ink, glow, arrow, label, jar, show } = S;
  const g = new THREE.Group(), H = 0.3, Wd = 0.4, HX = -0.22, HZ = 0.1;
  const frame = block(S, 0.02, H + 0.02, 0.02, '#d9c6a0'); frame.position.set(HX - 0.012, 0, HZ); g.add(frame);
  const door = new THREE.Group(); door.position.set(HX, 0.01, HZ); g.add(door);
  const leaf = ink(new THREE.BoxGeometry(Wd, H, 0.012).translate(Wd / 2, H / 2, 0), '#f1dfbf'); door.add(leaf);
  const knob = ink(new THREE.SphereGeometry(0.012, 10, 8), '#c99712', { thresh: 60 }); knob.position.set(Wd - 0.03, H / 2, 0.015); door.add(knob);
  const F = arrow('#e8590c', 0.008); door.add(F); glow(F, '#e8590c', 1, 0);
  const tv = arrow('#7048e8', 0.011); g.add(tv); glow(tv, '#7048e8', 1, 0);
  const lt = label('τ', { size: 0.034, color: '#5f3dc4' }); g.add(lt);
  const J = jar({ max: 8, color: '#7048e8', name: '|τ| =', unit: 'N·m', digits: 1 }); J.position.set(0.36, 0, -0.42); g.add(J);
  const dirTok = token(S, '∠F', '#c2410c', V(0.36, 0, 0.45)); g.add(dirTok);
  const ps = [0.9, 0.5, 0.2], dirs = [90, 45, 0]; let pi = 0, di = 0, sign = 1, omega = 0;
  const upd = () => {
    const l = ps[pi] * Wd, th = (dirs[di] * Math.PI) / 180, Fm = 20, tau = Fm * (l / Wd) * Math.sin(th) * sign * 0.4;
    const p = V(l, H / 2, sign * 0.03), d = V(-Math.cos(th), 0, -Math.sin(th) * sign);
    F.point(p.clone().addScaledVector(d, -0.12), p);
    tv.visible = Math.abs(tau) > 0.01; const base = V(HX, H + 0.03, HZ); tv.point(base, base.clone().add(V(0, Math.sign(tau) * Math.max(0.02, Math.abs(tau) * 0.03), 0)));
    lt.position.copy(base).add(V(0.03, Math.sign(tau) * Math.abs(tau) * 0.03 + 0.02, 0));
    J.set(Math.abs(tau), 0.5, `|τ| = ${Math.abs(tau).toFixed(1)} N·m ${tau > 0.01 ? '(عكس عقارب الساعة)' : tau < -0.01 ? '(مع عقارب الساعة)' : ''}`);
    omega = tau * 0.25;
  };
  upd();
  return {
    group: g,
    targets: [
      { obj: knob, hit: [knob, leaf], hint: V(HX + Wd * 0.7, 0, HZ + 0.12), act: () => { pi = (pi + 1) % ps.length; upd(); } },
      { obj: dirTok, hint: dirTok.position.clone(), act: () => { di = (di + 1) % dirs.length; upd(); } },
      { obj: frame, hint: V(HX, 0, HZ + 0.1), act: () => { sign = -sign; upd(); } },
    ],
    update(dt) { door.rotation.y = Math.max(-1.2, Math.min(1.2, door.rotation.y + omega * dt)); if (Math.abs(door.rotation.y) >= 1.2) door.rotation.y *= 0.0; },
    print(x, { P, inkText }) {
      inkText(x, 'τ = r × F', ...P(0.04, 0.42), { size: 40, color: '#c2410c', weight: 600 });
      inkText(x, 'متجه العزم على محور المفصلات (قاعدة الكف اليمنى)', ...P(0.04, 0.5), { size: 24, color: '#5f3dc4' });
      inkText(x, 'عكس عقارب الساعة موجب ، مع عقارب الساعة سالب', ...P(0.04, 0.57), { size: 23, color: '#6b6155' });
    },
    notes: [],
  };
};

/* ---------- 4-6 Net torque (double cylinder) ---------- */
SCENES.nettorque = (S) => {
  const { THREE, V, gsap, ink, glow, arrow, label, jar } = S;
  const g = new THREE.Group(), O = V(-0.05, 0.2, -0.05), R1 = 0.13, R2 = 0.065;
  const stand = block(S, 0.02, 0.2, 0.02, '#e6dccb'); stand.position.set(O.x, 0, O.z - 0.06); g.add(stand);
  const cyl = new THREE.Group(); cyl.position.copy(O); g.add(cyl);
  const big = ink(new THREE.CylinderGeometry(R1, R1, 0.04, 40).rotateX(Math.PI / 2).translate(0, 0, -0.02), '#e9ecef', { thresh: 20 }); cyl.add(big);
  const small = ink(new THREE.CylinderGeometry(R2, R2, 0.05, 30).rotateX(Math.PI / 2).translate(0, 0, 0.025), '#ced4da', { thresh: 20 }); cyl.add(small);
  const mark = ink(new THREE.BoxGeometry(R1 * 0.9, 0.01, 0.005).translate(R1 * 0.45, 0, -0.042), '#e03131', { edges: false }); cyl.add(mark);
  const F1 = arrow('#e03131', 0.008), F2 = arrow('#1c7ed6', 0.008); [F1, F2].forEach((a, i) => { a.visible = false; glow(a, i ? '#1c7ed6' : '#e03131', 1, 0); g.add(a); });
  F1.point(O.clone().add(V(-0.0, R1, -0.02)), O.clone().add(V(0.2, R1, -0.02)));
  F2.point(O.clone().add(V(-0.0, -R2, 0.03)), O.clone().add(V(0.0, -R2 - 0.0001, 0.03)));
  F2.point(O.clone().add(V(0, -R2, 0.03)), O.clone().add(V(0, -R2 - 0.16, 0.03)));
  // F2 drawn downward on the left side to make it counter-clockwise
  F2.point(O.clone().add(V(-R2, 0, 0.03)), O.clone().add(V(-R2, -0.16, 0.03)));
  const t1 = token(S, 'F₁ = 5 N', '#c92a2a', V(0.32, 0, 0.3)), t2 = token(S, 'F₂ = 6 N', '#1864ab', V(0.32, 0, 0.08)); g.add(t1, t2);
  const J = jar({ max: 6, color: '#2b8a3e', name: 'Στ =', unit: 'N·m', digits: 0 }); J.position.set(0.36, 0, -0.42); g.add(J);
  let on1 = false, on2 = false, w = 0;
  const upd = () => { F1.visible = on1; F2.visible = on2; const tau = (on1 ? -5 : 0) + (on2 ? 3 : 0); J.set(tau, 0.5, `Στ = ${on1 ? '−5' : '0'} + ${on2 ? '3' : '0'} = ${tau} N·m`); w = tau * 0.25; };
  upd();
  return {
    group: g,
    targets: [
      { obj: t1, hint: t1.position.clone(), act: () => { on1 = !on1; upd(); } },
      { obj: t2, hint: t2.position.clone(), act: () => { on2 = !on2; upd(); } },
      { obj: cyl, hit: [big, small], hint: V(O.x, 0, O.z + 0.18), act: () => { on1 = on2 = true; upd(); } },
    ],
    update(dt) { cyl.rotation.z += w * dt; },
    print(x, { P, inkText }) {
      inkText(x, 'R₁ = 1 m ، R₂ = 0.5 m', ...P(0.0, 0.42), { size: 28, weight: 600 });
      inkText(x, 'τ_net = −R₁F₁ + R₂F₂ = −5 + 3 = −2 N·m', ...P(0.04, 0.5), { size: 26, color: '#c2410c', weight: 600 });
      inkText(x, 'الإشارة السالبة: دوران مع عقارب الساعة', ...P(0.04, 0.57), { size: 23, color: '#6b6155' });
    },
    notes: [],
  };
};

/* ---------- 4-7 Couple ---------- */
SCENES.couple = (S) => {
  const { THREE, V, gsap, ink, glow, arrow, label, jar } = S;
  const g = new THREE.Group(), Y = 0.04, Z = 0.1, u = 0.12; // 1 m = 0.12
  const piv = new THREE.Group(); piv.position.set(0, Y, Z); g.add(piv);
  const bar = ink(new THREE.BoxGeometry(4 * u, 0.016, 0.04), '#f1dfbf'); piv.add(bar);
  const axis = ink(new THREE.CylinderGeometry(0.012, 0.012, 0.06, 14).translate(0, 0, 0), '#e03131', { thresh: 30 }); g.add(axis);
  const FA = arrow('#e8590c', 0.008), FB = arrow('#e8590c', 0.008); [FA, FB].forEach((a) => { a.visible = false; glow(a, '#e8590c', 1, 0); piv.add(a); });
  const lA = label('A', { size: 0.03 }), lB = label('B', { size: 0.03 }); piv.add(lA, lB); lA.position.set(-2 * u, 0.03, 0); lB.position.set(2 * u, 0.03, 0);
  const J = jar({ max: 30, color: '#e8590c', name: 'τ =', unit: 'N·m' }); J.position.set(0.36, 0, -0.42); g.add(J);
  const pair = token(S, 'F , −F', '#c2410c', V(-0.28, 0, -0.35)); g.add(pair);
  const wheel = new THREE.Group(); wheel.position.set(0.1, 0.03, -0.38); g.add(wheel);
  wheel.add(ink(new THREE.TorusGeometry(0.07, 0.01, 8, 36).rotateX(Math.PI / 2), '#495057', { edges: false }));
  wheel.add(ink(new THREE.BoxGeometry(0.14, 0.01, 0.015), '#495057', { edges: false }));
  const axes = [[2, 'C (المنتصف)'], [1, 'D'], [0, 'A']]; let ai = 0, on = false, spin = 0, wspin = 0;
  const upd = () => {
    const a = axes[ai][0], xA = -2 * u, xB = 2 * u, ax = -2 * u + a * u;
    piv.position.x = ax; bar.position.x = -ax; lA.position.x = xA - ax; lB.position.x = xB - ax; FA.position.x = 0; FB.position.x = 0;
    FA.point(V(xA - ax, 0, 0.03), V(xA - ax, 0, 0.03 + 0.12)); FB.point(V(xB - ax, 0, -0.03), V(xB - ax, 0, -0.03 - 0.12));
    FA.visible = FB.visible = on; axis.position.set(ax, Y, Z);
    const d1 = a, d2 = 4 - a; J.set(on ? 24 : 0, 0.5, on ? `τ = 6×${d1} + 6×${d2} = 24 N·m` : 'τ = 0');
    spin = on ? 0.6 : 0;
  };
  upd();
  return {
    group: g,
    targets: [
      { obj: pair, hint: pair.position.clone(), act: () => { on = !on; upd(); } },
      { obj: axis, hit: [axis, bar], hint: V(0, 0, Z + 0.1), act: () => { ai = (ai + 1) % axes.length; piv.rotation.y = 0; upd(); } },
      { obj: wheel, hint: V(0.1, 0, -0.27), act: () => { wspin = wspin ? 0 : 1.5; } },
    ],
    update(dt) { piv.rotation.y += spin * dt; wheel.rotation.y += wspin * dt; },
    print(x, { P, inkText, inkLine }) {
      for (let i = 0; i <= 4; i++) { inkLine(x, [P(-2 * u + i * u, Z + 0.06), P(-2 * u + i * u, Z + 0.08)], { w: 2, wob: 0 }); inkText(x, `${i} m`, ...P(-2 * u + i * u, Z + 0.11), { size: 22 }); }
      inkText(x, 'τ_couple = F × AB = 6 × 4 = 24 N·m', ...P(0.04, 0.42), { size: 30, color: '#c2410c', weight: 600 });
      inkText(x, 'عزم المزدوج لا يتغير بتغير موضع المحور', ...P(0.04, 0.5), { size: 25, color: '#6b6155' });
    },
    notes: [],
  };
};

/* ---------- 4-8, 4-9 Center of mass and gravity ---------- */
SCENES.cm = (S) => {
  const { THREE, V, gsap, ink, glow, arrow, label, show } = S;
  const g = new THREE.Group(), Z0 = 0.2, X0 = -0.25;
  const db = new THREE.Group(); db.position.set(X0, 0.035, Z0); g.add(db);
  // heavy ball at +x (mass 2), light at -x (mass 1); rod 0.24, cm at x = +0.04 from centre
  const heavy = ink(new THREE.SphereGeometry(0.035, 18, 12), '#cfe9d6', { thresh: 60 }); heavy.position.x = 0.12; db.add(heavy);
  const light = ink(new THREE.SphereGeometry(0.024, 16, 12), '#f3c4b9', { thresh: 60 }); light.position.x = -0.12; db.add(light);
  db.add(ink(new THREE.CylinderGeometry(0.005, 0.005, 0.24, 8).rotateZ(Math.PI / 2), '#868e96', { edges: false }));
  const cmMark = ink(new THREE.TorusGeometry(0.014, 0.004, 6, 20).rotateX(Math.PI / 2), '#1c7ed6', { edges: false }); cmMark.position.x = 0.04; db.add(cmMark);
  const lcm = label('C_m', { size: 0.026, color: '#1864ab' }); lcm.position.set(0.04, 0.04, 0); db.add(lcm);
  const F = arrow('#e8590c', 0.008); g.add(F); glow(F, '#e8590c', 1, 0);
  const pts = [[-0.12, 'عند الكرة الأخف'], [0.04, 'عند مركز الكتلة'], [0.12, 'عند الكرة الأثقل']]; let pi = 0, busy = false;
  const pTok = token(S, 'نقطة F', '#c2410c', V(0.36, 0, 0.45)); g.add(pTok);
  const lp = label('', { size: 0.028, color: '#c2410c' }); g.add(lp);
  const aimF = () => { const lx = pts[pi][0], p = db.localToWorld(V(lx, 0, 0)); g.worldToLocal(p); F.point(p.clone().add(V(0, 0, 0.13)), p.clone().add(V(0, 0, 0.03))); lp.setText(`F ${pts[pi][1]}`); lp.position.copy(p).add(V(0, 0.06, 0.15)); };
  aimF();
  // hanging plate
  const hang = new THREE.Group(); hang.position.set(0.2, 0, -0.3); g.add(hang);
  const pole = block(S, 0.012, 0.36, 0.012, '#e6dccb'); pole.position.set(-0.1, 0, 0); hang.add(pole);
  const arm = ink(new THREE.BoxGeometry(0.16, 0.01, 0.01), '#e6dccb'); arm.position.set(-0.03, 0.36, 0); hang.add(arm);
  const shape = new THREE.Shape(); shape.moveTo(-0.07, -0.05); shape.bezierCurveTo(-0.09, 0.05, -0.02, 0.09, 0.03, 0.06); shape.bezierCurveTo(0.09, 0.04, 0.08, -0.06, 0.02, -0.07); shape.bezierCurveTo(-0.02, -0.08, -0.05, -0.07, -0.07, -0.05);
  const plateG = new THREE.Group(); hang.add(plateG); plateG.position.set(0.02, 0.36, 0.0);
  const plate = ink(new THREE.ExtrudeGeometry(shape, { depth: 0.006, bevelEnabled: false }), '#fff3bf'); plateG.add(plate);
  const holes = [V(-0.05, 0.04, 0), V(0.06, 0.02, 0)], cg = V(0.005, -0.01, 0);
  const lines = holes.map(() => { const l = dashed(S, V(), V(), '#c92a2a'); l.visible = false; plateG.add(l); return l; });
  const cgDot = ink(new THREE.SphereGeometry(0.008, 10, 8), '#c92a2a', { edges: false }); cgDot.position.copy(cg).setZ(0.008); cgDot.visible = false; plateG.add(cgDot);
  let hi = -1;
  const hangFrom = () => { const h = holes[hi], rz = -Math.PI / 2 - Math.atan2(cg.y - h.y, cg.x - h.x), c = Math.cos(rz), s = Math.sin(rz); plateG.rotation.z = rz; plateG.position.set(0.02 - (h.x * c - h.y * s), 0.36 - (h.x * s + h.y * c), 0); lines[hi].setEnds(h.clone().setZ(0.008), h.clone().add(cg.clone().sub(h).multiplyScalar(2.2)).setZ(0.008)); lines[hi].visible = true; if (lines.every((l) => l.visible)) cgDot.visible = true; };
  return {
    group: g,
    targets: [
      { obj: db, hit: [heavy, light], hint: V(X0, 0, Z0 + 0.1), act: () => {
        if (busy) return; busy = true; const lx = pts[pi][0], o = { t: 0 }, start = db.position.clone(), r0 = db.rotation.y;
        const off = lx - 0.04; // lever arm from cm
        gsap.to(o, { t: 1, duration: S.reduced ? 0.001 : 1.8, ease: 'power1.out', onUpdate: () => { db.position.set(start.x, start.y, start.z - 0.3 * o.t); db.rotation.y = r0 - off * 18 * o.t; aimF(); }, onComplete: () => setTimeout(() => { db.position.copy(start); db.rotation.y = 0; aimF(); busy = false; }, 1200) });
      } },
      { obj: pTok, hint: pTok.position.clone(), act: () => { pi = (pi + 1) % pts.length; aimF(); } },
      { obj: plateG, hit: [plate], hint: V(0.2, 0, -0.2), act: () => { hi = (hi + 1) % holes.length; hangFrom(); } },
    ],
    print(x, { P, inkText }) {
      inkText(x, 'قوة في مركز الكتلة: انتقال دون دوران', ...P(0.0, 0.48), { size: 26, color: '#1864ab', weight: 600 });
      inkText(x, 'مركز الثقل: تقاطع الخطين الشاقوليين', ...P(0.0, 0.55), { size: 26, color: '#c92a2a', weight: 600 });
      inkText(x, 'كتلة الكرة الخضراء ضعف كتلة الحمراء', ...P(0.0, 0.61), { size: 22, color: '#6b6155' });
    },
    notes: [],
  };
};

/* ---------- 5-2 Graphical work ---------- */
SCENES.workgraph = (S) => {
  const { THREE, V, gsap, ink, glow, arrow, label, jar, show } = S;
  const g = new THREE.Group(), X0 = -0.28, Z = 0.25, D = 0.5;
  const floor = block(S, 0.76, 0.01, 0.14, '#d9c6a0'); floor.position.set(0.06, 0, Z); g.add(floor);
  const crate = block(S, 0.09, 0.09, 0.09, '#e9c99a'); crate.position.set(X0, 0.01, Z); g.add(crate);
  const F = arrow('#e8590c', 0.008), Fx = arrow('#1c7ed6', 0.006), Fy = arrow('#1c7ed6', 0.006), fk = arrow('#2b8a3e', 0.007);
  [F, Fx, Fy, fk].forEach((a, i) => { glow(a, ['#e8590c', '#1c7ed6', '#1c7ed6', '#2b8a3e'][i], 1, 0); g.add(a); }); Fx.visible = Fy.visible = false; fk.visible = false;
  let x = 0, comp = false, fric = false, busy = false;
  const pan = panel(S, 0.46, 0.3, V(0.0, 0, -0.33), (c, W, H, xx, fr) => {
    const A = axes2d(c, W, H, { xl: 'x (m)', yl: 'F (N)' }); const sx = (m) => A.ox + (m / 6) * A.w, sy = (f) => A.oy - ((f + 25) / 50) * A.h;
    c.strokeStyle = '#999'; c.lineWidth = 1; c.beginPath(); c.moveTo(A.ox, sy(0)); c.lineTo(A.ox + A.w, sy(0)); c.stroke();
    c.fillStyle = 'rgba(250,176,5,.5)'; c.fillRect(sx(0), sy(20), sx(xx) - sx(0), sy(0) - sy(20));
    c.strokeStyle = '#1971c2'; c.lineWidth = 4; c.beginPath(); c.moveTo(sx(0), sy(20)); c.lineTo(sx(5), sy(20)); c.stroke();
    if (fr) { c.fillStyle = 'rgba(43,138,62,.35)'; c.fillRect(sx(0), sy(0), sx(xx) - sx(0), sy(-20) - sy(0)); c.strokeStyle = '#2b8a3e'; c.beginPath(); c.moveTo(sx(0), sy(-20)); c.lineTo(sx(5), sy(-20)); c.stroke(); }
    c.font = "600 26px 'Newsreader',serif"; c.fillStyle = '#2a241c'; c.textAlign = 'left'; c.fillText(`F cos37° = 20 N   x = ${xx.toFixed(1)} m   W = ${(20 * xx).toFixed(0)} J`, A.ox + 10, 50);
  });
  pan.redraw(0, false); g.add(pan);
  const J = jar({ max: 110, color: '#f59f00', name: 'W =', unit: 'J' }); J.position.set(0.37, 0, -0.1); g.add(J);
  const tC = token(S, 'Fₓ , F_y', '#1864ab', V(0.36, 0, 0.47)), tF = token(S, 'f_k', '#2b8a3e', V(0.18, 0, 0.47)); g.add(tC, tF);
  const upd = () => { const p = V(X0 + (x / 5) * D, 0.05, Z), r = (37 * Math.PI) / 180; crate.position.x = p.x; F.point(p.clone().add(V(0.045, 0, 0)), p.clone().add(V(0.045 + 0.14 * Math.cos(r), 0.14 * Math.sin(r), 0))); Fx.point(p.clone().add(V(0.045, -0.02, 0.05)), p.clone().add(V(0.045 + 0.112, -0.02, 0.05))); Fy.point(p.clone().add(V(0.045, -0.02, 0.05)), p.clone().add(V(0.045, 0.064, 0.05))); fk.point(p.clone().add(V(-0.045, -0.04, 0)), p.clone().add(V(-0.155, -0.04, 0))); pan.redraw(x, fric); };
  upd();
  return {
    group: g,
    targets: [
      { obj: crate, hint: V(X0, 0, Z + 0.1), act: () => { if (busy) return; busy = true; const o = { x: 0 }; gsap.to(o, { x: 5, duration: S.reduced ? 0.001 : 2.5, ease: 'none', onUpdate: () => { x = o.x; upd(); J.set(20 * x, 0.05); }, onComplete: () => { J.set(100, 0.2, fric ? 'W_F = 100 J ، W_f = −100 J' : 'W = 20 × 5 = 100 J'); setTimeout(() => { x = 0; upd(); busy = false; }, 1500); } }); } },
      { obj: tC, hint: tC.position.clone(), act: () => { comp = !comp; Fx.visible = Fy.visible = comp; } },
      { obj: tF, hint: tF.position.clone(), act: () => { fric = !fric; fk.visible = fric; upd(); } },
    ],
    print(x2, { P, inkText }) { inkText(x2, 'الشغل = المساحة تحت منحنى القوة–الإزاحة', ...P(0.04, 0.4), { size: 26, color: '#c2410c', weight: 600 }); inkText(x2, 'F = 25 N بزاوية 37° ، الاحتكاك 20 N', ...P(0.04, 0.6), { size: 24, color: '#6b6155' }); },
    notes: [],
  };
};

/* ---------- 5-3 Power ---------- */
SCENES.power = (S) => {
  const { THREE, V, gsap, ink, glow, label, jar } = S;
  const g = new THREE.Group();
  const rig = (x, z, name) => {
    const r = new THREE.Group(); r.position.set(x, 0, z); g.add(r);
    const post = block(S, 0.012, 0.3, 0.012, '#e6dccb'); post.position.x = -0.05; r.add(post);
    const arm = ink(new THREE.BoxGeometry(0.09, 0.01, 0.01), '#e6dccb'); arm.position.set(-0.01, 0.3, 0); r.add(arm);
    const wheel = ink(new THREE.CylinderGeometry(0.025, 0.025, 0.012, 20).rotateX(Math.PI / 2), '#cfc3aa', { thresh: 20 }); wheel.position.set(0.03, 0.3, 0); r.add(wheel);
    const load = block(S, 0.05, 0.05, 0.05, '#e7cf9f'); load.position.set(0.055, 0.0, 0); r.add(load);
    const rope = new THREE.Line(new THREE.BufferGeometry().setFromPoints([V(), V()]), S.LINE_MAT); r.add(rope);
    const lb = label(name, { size: 0.03 }); lb.position.set(0, 0.36, 0); r.add(lb);
    const set = () => rope.geometry.setFromPoints([V(0.055, 0.3, 0), V(0.055, load.position.y + 0.05, 0)]); set();
    return { r, load, set, wheel };
  };
  const man = rig(-0.22, 0.25, 'الرجل'), horse = rig(0.05, 0.25, 'الحصان');
  const J = jar({ max: 600, color: '#e8590c', name: 'P =', unit: 'W' }); J.position.set(0.36, 0, 0.15); g.add(J);
  const shaft = block(S, 0.14, 0.012, 0.14, '#e6dccb'); shaft.position.set(-0.05, 0, -0.35); g.add(shaft);
  const cab = block(S, 0.1, 0.12, 0.1, '#dbe4ee'); cab.position.set(-0.05, 0.012, -0.35); g.add(cab);
  const cable = new THREE.Line(new THREE.BufferGeometry().setFromPoints([V(-0.05, 0.45, -0.35), V(-0.05, 0.13, -0.35)]), S.LINE_MAT); g.add(cable);
  const JE = jar({ max: 30000, color: '#7048e8', name: 'T =', unit: 'N' }); JE.position.set(0.25, 0, -0.42); g.add(JE);
  const lift = (R, T) => { const o = { k: 0 }; gsap.to(o, { k: 1, duration: S.reduced ? 0.001 : T * 0.6, ease: 'none', onUpdate: () => { R.load.position.y = o.k * 0.2; R.wheel.rotation.z = -o.k * 6; R.set(); }, onComplete: () => setTimeout(() => { R.load.position.y = 0; R.set(); }, 1200) }); };
  let up = false;
  return {
    group: g,
    targets: [
      { obj: man.load, hint: V(-0.17, 0, 0.35), act: () => { lift(man, 4); J.set(125, 0.6, 'P = 500 × 1 / 4 = 125 W'); } },
      { obj: horse.load, hint: V(0.1, 0, 0.35), act: () => { lift(horse, 1); J.set(500, 0.6, 'P = 500 × 1 / 1 = 500 W'); } },
      { obj: cab, hint: V(-0.05, 0, -0.24), act: () => { up = !up; gsap.to(cab.position, { y: up ? 0.3 : 0.012, duration: S.reduced ? 0 : 3, ease: 'none', onUpdate: () => cable.geometry.setFromPoints([V(-0.05, 0.45, -0.35), V(-0.05, cab.position.y + 0.12, -0.35)]) }); JE.set(29000, 0.6, 'T = 20300 / 0.7 = 29000 N'); } },
    ],
    print(x, { P, inkText }) {
      inkText(x, 'الحمل 500 N ، الإزاحة 1 m ، الشغل 500 J لكليهما', ...P(-0.04, 0.42), { size: 24, color: '#6b6155' });
      inkText(x, 'P = W / t   ،   1 hp = 746 W', ...P(-0.04, 0.5), { size: 32, color: '#c2410c', weight: 600 });
      inkText(x, 'المصعد: υ = 0.7 m/s ، P = 20300 W', ...P(-0.05, -0.18), { size: 23, color: '#5f3dc4' });
      inkText(x, '(زمنا الرجل والحصان مفترضان)', ...P(-0.04, 0.57), { size: 21, color: '#8a7f70' });
    },
    notes: [],
  };
};

/* ---------- 5-4 Kinetic and potential energy ---------- */
SCENES.energy = (S) => {
  const { THREE, V, gsap, ink, glow, label, jar } = S;
  const g = new THREE.Group(), Z = 0.3;
  const wall = block(S, 0.02, 0.08, 0.1, '#d9c6a0'); wall.position.set(-0.32, 0, Z); g.add(wall);
  const floor = block(S, 0.7, 0.008, 0.1, '#ece3d1'); floor.position.set(0.02, 0, Z); g.add(floor);
  const pts = []; for (let i = 0; i <= 160; i++) { const a = (i / 160) * Math.PI * 2 * 9; pts.push(V(i / 160, Math.cos(a) * 0.016, Math.sin(a) * 0.016)); }
  const spring = ink(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 300, 0.0022, 5), '#495057', { edges: false }); spring.position.set(-0.31, 0.03, Z); g.add(spring);
  const blk = block(S, 0.05, 0.05, 0.05, '#e9a06b'); g.add(blk);
  const L0 = 0.18, Lc = 0.09; const setS = (L) => { spring.scale.x = L; blk.position.set(-0.31 + L + 0.025, 0.008, Z); }; setS(Lc);
  const jK = jar({ max: 70, color: '#e8590c', name: 'KE =', unit: 'J', digits: 0 }); jK.position.set(-0.05, 0, -0.45); g.add(jK);
  const jG = jar({ max: 70, color: '#1c7ed6', name: 'GPE =', unit: 'J', digits: 0 }); jG.position.set(0.15, 0, -0.45); g.add(jG);
  const jE = jar({ max: 70, color: '#2b8a3e', name: 'EPE =', unit: 'J', digits: 0 }); jE.position.set(0.35, 0, -0.45); g.add(jE);
  jE.set(4, 0.1, 'EPE = 4 J');
  const shelf = block(S, 0.03, 0.3, 0.03, '#e6dccb'); shelf.position.set(0.3, 0, -0.1); g.add(shelf);
  const book = block(S, 0.08, 0.025, 0.06, '#c5d8f2'); book.position.set(0.24, 0, -0.1); g.add(book);
  const road = block(S, 0.5, 0.008, 0.09, '#e2dccf'); road.position.set(-0.1, 0, -0.15); g.add(road);
  const c = car(S); c.position.set(-0.32, 0.008, -0.15); g.add(c);
  let busy = false, bookUp = false;
  return {
    group: g,
    targets: [
      { obj: blk, hit: [blk, spring], hint: V(-0.18, 0, Z + 0.09), act: () => { if (busy) return; busy = true; setS(Lc); const o = { k: 0 };
        gsap.to(o, { k: 1, duration: S.reduced ? 0.001 : 0.35, ease: 'power2.out', onUpdate: () => { setS(Lc + (L0 - Lc) * o.k); jE.set(4 * (1 - o.k * o.k), 0.03); jK.set(4 * o.k * o.k, 0.03); }, onComplete: () => {
          jE.set(0, 0.1, 'EPE = 0'); jK.set(4, 0.1, 'KE = ½ × 2 × 2² = 4 J'); gsap.to(blk.position, { x: 0.3, duration: S.reduced ? 0 : 1.2, ease: 'none', onComplete: () => setTimeout(() => { setS(Lc); jE.set(4, 0.2, 'EPE = 4 J'); jK.set(0, 0.2); busy = false; }, 900) }); } }); } },
      { obj: book, hint: V(0.24, 0, 0.0), act: () => { bookUp = !bookUp; gsap.to(book.position, { y: bookUp ? 0.28 : 0, duration: S.reduced ? 0 : 1, ease: 'power2.inOut' }); jG.set(bookUp ? 60 : 0, 1, bookUp ? 'GPE = 3 × 10 × 2 = 60 J' : 'GPE = 0'); } },
      { obj: c, hint: V(-0.32, 0, -0.05), act: () => { const o = { t: 0 }; c.position.x = -0.32; gsap.to(o, { t: 1, duration: S.reduced ? 0.001 : 2, ease: 'none', onUpdate: () => { c.position.x = -0.32 + 0.42 * (2 * o.t - o.t * o.t); jK.set(40 * (1 - o.t) * (1 - o.t), 0.03, `KE = ${(400 * (1 - o.t) * (1 - o.t)).toFixed(0)} kJ`); }, onComplete: () => { jK.set(0, 0.2, 'W_f = ΔKE = −400000 J'); setTimeout(() => (c.position.x = -0.32), 1500); } }); } },
    ],
    print(x, { P, inkText }) {
      inkText(x, 'K = 200 N/m ، x = 0.2 m ، m = 2 kg', ...P(-0.05, Z + 0.1), { size: 22, color: '#6b6155' });
      inkText(x, 'كتاب 3 kg يُرفع 2 m', ...P(0.24, 0.05), { size: 22, color: '#6b6155' });
      inkText(x, 'سيارة 2000 kg بسرعة 20 m/s تتوقف خلال 100 m', ...P(-0.1, -0.05), { size: 21, color: '#6b6155' });
      inkText(x, 'KE = ½ m υ²  ،  GPE = m g h  ،  EPE = ½ K x²', ...P(0.02, 0.5), { size: 26, color: '#c2410c', weight: 600 });
    },
    notes: [],
  };
};

/* ---------- 5-5 Conservation of mechanical energy ---------- */
SCENES.mechcons = (S) => {
  const { THREE, V, gsap, ink, glow, label, jar, show } = S;
  const g = new THREE.Group(), sc = 0.06, Z = 0.1; // 1 m = 0.06
  const H = (x) => { // track height in metres along x in [0,1]
    const pts = [[0, 5], [0.18, 4.6], [0.35, 2.4], [0.5, 3.2], [0.65, 1.2], [0.8, 2.0], [1, 0.6]];
    for (let i = 0; i < pts.length - 1; i++) { const [a, ha] = pts[i], [b, hb] = pts[i + 1]; if (x <= b) { const k = (x - a) / (b - a), s = (1 - Math.cos(Math.PI * k)) / 2; return ha + (hb - ha) * s; } } return 0.6; };
  const X = (u) => -0.3 + u * 0.68;
  const cp = []; for (let i = 0; i <= 120; i++) { const u = i / 120; cp.push(V(X(u), H(u) * sc + 0.02, Z)); }
  const track = ink(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(cp), 240, 0.008, 8), '#e8a15b', { edges: false }); g.add(track);
  for (let i = 0; i <= 10; i++) { const u = i / 10, p = block(S, 0.006, H(u) * sc + 0.02, 0.006, '#d9c6a0'); p.position.set(X(u), 0, Z); g.add(p); }
  const ball = ink(new THREE.SphereGeometry(0.018, 16, 12), '#cfe3f7', { thresh: 60 }); glow(ball, '#1c7ed6', 0.6, 0); g.add(ball);
  const place = (u) => ball.position.set(X(u), H(u) * sc + 0.02 + 0.024, Z); place(0);
  const m = 5, gg = 10, E = m * gg * 5;
  const jP = jar({ max: 260, color: '#1c7ed6', name: 'PE =', unit: 'J' }), jK = jar({ max: 260, color: '#e8590c', name: 'KE =', unit: 'J' }), jE = jar({ max: 260, color: '#2b8a3e', name: 'E =', unit: 'J' });
  [jP, jK, jE].forEach((j, i) => { j.position.set(-0.1 + i * 0.17, 0, -0.42); g.add(j); });
  const lv = label('υ = 0', { size: 0.03, color: '#c2410c' }); g.add(lv);
  const upd = (u) => { const h = H(u), PE = m * gg * h, KE = E - PE; jP.set(PE, 0.03); jK.set(KE, 0.03); jE.set(E, 0.03, 'E = 250 J'); lv.setText(`h = ${h.toFixed(1)} m , υ = ${Math.sqrt(2 * KE / m).toFixed(2)} m/s`); lv.position.copy(ball.position).add(V(0, 0.06, 0)); };
  upd(0);
  let busy = false;
  return {
    group: g,
    targets: [
      { obj: ball, hint: V(X(0), 0, Z + 0.1), act: () => { if (busy) return; busy = true; const o = { u: 0 }; gsap.to(o, { u: 0.8, duration: S.reduced ? 0.001 : 4, ease: 'power1.inOut', onUpdate: () => { place(o.u); upd(o.u); }, onComplete: () => setTimeout(() => { place(0); upd(0); busy = false; }, 1500) }); } },
      { obj: jE, hit: jE.hit, hint: V(0.24, 0, -0.32), act: () => { glow(jE.hit[0], '#2b8a3e', 0.7); upd(0); } },
      { obj: track, hint: V(X(0.8), 0, Z + 0.1), act: () => { place(0.8); upd(0.8); } },
    ],
    print(x, { P, inkText }) {
      [['a', 0, 5], ['b', 0.5, 3.2], ['c', 0.8, 2.0]].forEach(([n, u, h]) => { inkText(x, `${n} (${h} m)`, ...P(X(u), Z + 0.08), { size: 24, weight: 700 }); });
      inkText(x, 'KE_i + PE_i = KE_f + PE_f', ...P(0.04, 0.42), { size: 32, color: '#c2410c', weight: 600 });
      inkText(x, 'm = 5 kg ، g = 10 m/s² ، الكرة تبدأ من السكون', ...P(0.04, 0.5), { size: 24, color: '#6b6155' });
      inkText(x, 'υ_b = 6 m/s ، υ_c = 7.746 m/s', ...P(0.04, 0.57), { size: 24, color: '#1864ab' });
    },
    notes: [],
  };
};

/* ---------- 5-6, 5-7 Non-conservative work ---------- */
SCENES.nonconserv = (S) => {
  const { THREE, V, gsap, ink, glow, label, jar } = S;
  const g = new THREE.Group(), PV = V(-0.08, 0.42, 0.05), L = 0.3;
  g.add(block(S, 0.3, 0.012, 0.1, '#e6dccb').translateX(PV.x).translateZ(PV.z));
  const post = block(S, 0.014, 0.44, 0.014, '#e6dccb'); post.position.set(PV.x - 0.14, 0, PV.z); g.add(post);
  const bar = ink(new THREE.BoxGeometry(0.16, 0.012, 0.012), '#e6dccb'); bar.position.set(PV.x - 0.07, 0.43, PV.z); g.add(bar);
  const arm = new THREE.Group(); arm.position.copy(PV); g.add(arm);
  const str = new THREE.Line(new THREE.BufferGeometry().setFromPoints([V(0, 0, 0), V(0, -L, 0)]), S.LINE_MAT); arm.add(str);
  const bob = ink(new THREE.SphereGeometry(0.03, 18, 14), '#f6d2c4', { thresh: 60 }); bob.position.y = -L; arm.add(bob);
  const jM = jar({ max: 1, color: '#1c7ed6', name: 'E_mech', digits: 2 }), jH = jar({ max: 1, color: '#e03131', name: 'Q', digits: 2 }), jT = jar({ max: 1, color: '#2b8a3e', name: 'E_total', digits: 2 });
  [jM, jH, jT].forEach((j, i) => { j.position.set(-0.1 + i * 0.17, 0, -0.42); g.add(j); });
  const fan = token(S, 'مقاومة الهواء', '#c92a2a', V(0.3, 0, 0.35)); g.add(fan);
  let th = 0, w = 0, run = false, damp = 0, A0 = 0.7;
  const show3 = () => { const E = 0.5 * w * w / 9 + (1 - Math.cos(th)), E0 = 1 - Math.cos(A0), em = E / E0; jM.set(em, 0.03, `E_mech = ${(em * 100).toFixed(0)}%`); jH.set(1 - em, 0.03, `Q = ${((1 - em) * 100).toFixed(0)}%`); jT.set(1, 0.03, 'E_total = 100%'); };
  return {
    group: g,
    targets: [
      { obj: bob, hit: [bob], hint: V(PV.x, 0, PV.z + 0.12), act: () => { th = A0; w = 0; run = true; } },
      { obj: fan, hint: fan.position.clone(), act: () => { damp = damp ? 0 : 0.35; glow(fan, '#c92a2a', damp ? 0.6 : 0); } },
      { obj: jT, hit: jT.hit, hint: V(0.24, 0, -0.32), act: () => { glow(jT.hit[0], '#2b8a3e', 0.7); show3(); } },
    ],
    update(dt) { if (!run) return; const n = 4; for (let i = 0; i < n; i++) { const a = -9 * Math.sin(th) - damp * w; w += a * dt / n; th += w * dt / n; } arm.rotation.z = th; show3(); },
    print(x, { P, inkText }) {
      inkText(x, 'W_nc = E_f − E_i', ...P(0.04, 0.44), { size: 38, color: '#c2410c', weight: 600 });
      inkText(x, 'الطاقة لا تستحدث، وتتحول من صورة إلى أخرى', ...P(0.04, 0.52), { size: 25, color: '#2b8a3e', weight: 600 });
      inkText(x, 'Q: الطاقة المتحولة إلى حرارة', ...P(0.04, 0.59), { size: 22, color: '#6b6155' });
    },
    notes: [],
  };
};

/* ---------- 5-8 Impulse ---------- */
SCENES.impulse = (S) => {
  const { THREE, V, gsap, ink, glow, arrow, label, jar, show } = S;
  const g = new THREE.Group(), Z = 0.15, XW = 0.3;
  const road = block(S, 0.76, 0.008, 0.12, '#e2dccf'); road.position.set(0.05, 0, Z); g.add(road);
  const wall = block(S, 0.03, 0.12, 0.14, '#ced4da'); wall.position.set(XW + 0.03, 0, Z); g.add(wall);
  const cush = ink(new THREE.CylinderGeometry(0.05, 0.05, 0.12, 20).rotateX(Math.PI / 2).translate(0, 0.05, 0), '#ffd8a8', { thresh: 30 }); cush.position.set(XW - 0.03, 0, Z); cush.visible = false; g.add(cush);
  const c = car(S); c.scale.setScalar(1.2); g.add(c);
  const pA = arrow('#7048e8', 0.009); g.add(pA); glow(pA, '#7048e8', 1, 0); pA.visible = false;
  const lp = label('P = 24 × 10³ kg·m/s', { size: 0.03, color: '#5f3dc4' }); lp.visible = false; g.add(lp);
  const J = jar({ max: 170000, color: '#e03131', name: 'F =', unit: 'N' }); J.position.set(0.36, 0, -0.42); g.add(J);
  const tP = token(S, 'P = mυ', '#5f3dc4', V(-0.2, 0, -0.2)); g.add(tP);
  let soft = false, busy = false, showP = false;
  const X0 = -0.3, Xs = () => (soft ? XW - 0.14 : XW - 0.08);
  const setP = (frac) => { pA.visible = showP && frac > 0.02; const p = c.position.clone().add(V(0, 0.09, 0)); pA.point(p, p.clone().add(V(0.14 * frac, 0, 0))); lp.position.copy(p).add(V(0.05, 0.04, 0)); lp.setText(`P = ${(24 * frac).toFixed(0)} × 10³ kg·m/s`); };
  c.position.set(X0, 0.008, Z); setP(1);
  return {
    group: g,
    targets: [
      { obj: c, hint: V(X0, 0, Z + 0.1), act: () => { if (busy) return; busy = true; c.position.x = X0; const tStop = soft ? 0.6 : 0.15, o = { k: 0 };
        gsap.to(o, { k: 1, duration: S.reduced ? 0.001 : 1.4, ease: 'none', onUpdate: () => { c.position.x = X0 + (Xs() - 0.07 - X0) * o.k; setP(1); }, onComplete: () => { const o2 = { k: 0 }; gsap.to(o2, { k: 1, duration: S.reduced ? 0.001 : tStop * 3, ease: 'power2.out', onUpdate: () => { c.position.x = Xs() - 0.07 + 0.07 * o2.k; setP(1 - o2.k); if (soft) cush.scale.z = 1 - 0.4 * o2.k; }, onComplete: () => { const F = 24000 / tStop; J.set(F, 0.4, `F = −24000 / ${tStop} = −${(F / 1e4).toFixed(1)} × 10⁴ N`); S.sfx.click(); setTimeout(() => { c.position.x = X0; cush.scale.z = 1; setP(1); busy = false; }, 1600); } }); } }); } },
      { obj: cush, hit: [wall, cush], hint: V(XW, 0, Z + 0.12), act: () => { soft = !soft; cush.visible = soft; } },
      { obj: tP, hint: tP.position.clone(), act: () => { showP = !showP; setP(1); lp.visible = showP; } },
    ],
    print(x, { P, inkText }) {
      inkText(x, 'F t = m υ_f − m υ_i', ...P(0.04, 0.42), { size: 36, color: '#c2410c', weight: 600 });
      inkText(x, 'm = 1200 kg ، υ = 20 m/s ، t = 0.15 s', ...P(0.04, 0.5), { size: 25 });
      inkText(x, 'الوسادة: زمن أطول ← قوة أصغر (الزمن 0.6 s مفترض)', ...P(0.04, 0.57), { size: 22, color: '#6b6155' });
    },
    notes: [],
  };
};

/* ---------- 5-9 Collisions ---------- */
SCENES.collisions = (S) => {
  const { THREE, V, gsap, ink, glow, label, jar } = S;
  const g = new THREE.Group(), Z = 0.15;
  const rail = block(S, 0.76, 0.008, 0.11, '#cfc3aa'); rail.position.set(0.05, 0, Z); g.add(rail);
  const wagon = (col, w) => { const c = new THREE.Group(); c.add(block(S, w, 0.06, 0.08, col).translateY(0.016)); for (const wx of [-w / 3, w / 3]) for (const wz of [-0.04, 0.04]) { const wh = ink(new THREE.CylinderGeometry(0.014, 0.014, 0.01, 14).rotateX(Math.PI / 2), '#868e96', { thresh: 30 }); wh.position.set(wx, 0.014, wz); c.add(wh); } return c; };
  const A = wagon('#e9c99a', 0.14), B = wagon('#cfe3f7', 0.1); g.add(A, B);
  const lA = label('A: 2.5 × 10⁴ kg', { size: 0.026 }), lB = label('B: 1.5 × 10⁴ kg', { size: 0.026 }); lA.position.y = 0.12; lB.position.y = 0.12; A.add(lA); B.add(lB);
  const lv = label('', { size: 0.03, color: '#c2410c' }); g.add(lv);
  const jP = jar({ max: 25, color: '#7048e8', name: 'P_total =', unit: '× 10⁴', digits: 0 }); jP.position.set(0.1, 0, -0.42); g.add(jP);
  const jK = jar({ max: 90, color: '#e8590c', name: 'KE_total =', unit: '× 10⁴ J', digits: 0 }); jK.position.set(0.32, 0, -0.42); g.add(jK);
  const mode = token(S, 'عديم المرونة', '#c2410c', V(-0.25, 0, -0.35)); g.add(mode);
  let elastic = false, busy = false;
  const reset = () => { A.position.set(-0.28, 0.008, Z); B.position.set(0.05, 0.008, Z); jP.set(20, 0.2, 'P = 20 × 10⁴ kg·m/s'); jK.set(80, 0.2, 'KE = 80 × 10⁴ J'); lv.setText('υ_A = 8 m/s ، υ_B = 0'); lv.position.set(-0.1, 0.22, Z); };
  reset();
  return {
    group: g,
    targets: [
      { obj: A, hint: V(-0.28, 0, Z + 0.1), act: () => { if (busy) return; busy = true; reset(); const sv = 0.04; const o = { t: 0 }, gap = 0.05 - 0.12 - (-0.28);
        gsap.to(o, { t: gap / (8 * sv), duration: S.reduced ? 0.001 : 1.2, ease: 'none', onUpdate: () => { A.position.x = -0.28 + 8 * sv * o.t; }, onComplete: () => {
          const vA = elastic ? 2 : 5, vB = elastic ? 10 : 5, KE = elastic ? 80 : 50; jP.set(20, 0.3, 'P = 20 × 10⁴ (ثابت)'); jK.set(KE, 0.3, `KE = ${KE} × 10⁴ J`); lv.setText(elastic ? 'υ_A = 2 m/s ، υ_B = 10 m/s' : 'υ_mix = 5 m/s ، ΔKE = −30 × 10⁴ J');
          const o2 = { t: 0 }, xa = A.position.x, xb = B.position.x; gsap.to(o2, { t: 1.4, duration: S.reduced ? 0.001 : 1.6, ease: 'none', onUpdate: () => { A.position.x = xa + vA * sv * o2.t; B.position.x = Math.min(0.42, xb + vB * sv * o2.t); }, onComplete: () => setTimeout(() => { reset(); busy = false; }, 1600) }); } }); } },
      { obj: mode, hint: mode.position.clone(), act: () => { elastic = !elastic; mode.children[1].setText(elastic ? 'مرن تام' : 'عديم المرونة'); } },
      { obj: jK, hit: jK.hit, hint: V(0.32, 0, -0.32), act: () => { glow(jK.hit[0], '#e8590c', 0.6); } },
    ],
    print(x, { P, inkText }) {
      inkText(x, 'm₁υ₁ + m₂υ₂ = (m₁ + m₂) υ_mix', ...P(0.04, 0.42), { size: 32, color: '#c2410c', weight: 600 });
      inkText(x, '2.5 × 10⁴ × 8 = 4 × 10⁴ × υ  ⇒  υ = 5 m/s', ...P(0.04, 0.5), { size: 25 });
      inkText(x, 'الزخم ثابت دائماً، والطاقة الحركية تُحفظ في المرن فقط', ...P(0.04, 0.57), { size: 22, color: '#6b6155' });
    },
    notes: [],
  };
};

/* ---------- shared: gas cylinder with piston ---------- */
function cylinderRig(S, pos) {
  const { THREE, V, ink } = S;
  const g = new THREE.Group(); g.position.copy(pos);
  const R = 0.075, base = block(S, 0.2, 0.014, 0.2, '#e6dccb'); g.add(base);
  const glassG = new THREE.CylinderGeometry(R, R, 0.3, 32, 1, true);
  const glass = new THREE.Mesh(glassG, new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.18, roughness: 0.05, side: THREE.DoubleSide, depthWrite: false }));
  glass.position.y = 0.164; glass.renderOrder = 3; g.add(glass);
  const ge = new THREE.LineSegments(new THREE.EdgesGeometry(glassG, 20), S.LINE_MAT); ge.position.y = 0.164; g.add(ge);
  const gasMat = new THREE.MeshStandardMaterial({ color: '#f783ac', transparent: true, opacity: 0.25, depthWrite: false });
  const gas = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.97, R * 0.97, 1, 32).translate(0, 0.5, 0), gasMat); gas.position.y = 0.016; g.add(gas);
  const piston = new THREE.Group(); g.add(piston);
  piston.add(ink(new THREE.CylinderGeometry(R * 0.96, R * 0.96, 0.022, 32), '#efe4cf', { thresh: 20 }));
  piston.add(ink(new THREE.CylinderGeometry(0.007, 0.007, 0.12).translate(0, 0.07, 0)));
  const set = (h) => { piston.position.y = 0.016 + h + 0.011; gas.scale.y = h; }; // h: gas column height
  set(0.12);
  return { g, piston, gas, gasMat, set, R };
}
function pvPanel(S, pos) {
  return panel(S, 0.44, 0.32, pos, (c, W, H, path, shade, title) => {
    const A = axes2d(c, W, H, { xl: 'V', yl: 'P' }); const sx = (v) => A.ox + v * A.w, sy = (p) => A.oy - p * A.h;
    if (path && path.length > 1) {
      if (shade) { c.fillStyle = 'rgba(250,176,5,.45)'; c.beginPath(); c.moveTo(sx(path[0][0]), sy(0)); path.forEach(([v, p]) => c.lineTo(sx(v), sy(p))); c.lineTo(sx(path[path.length - 1][0]), sy(0)); c.closePath(); c.fill(); }
      c.strokeStyle = '#c2255c'; c.lineWidth = 5; c.beginPath(); path.forEach(([v, p], i) => (i ? c.lineTo(sx(v), sy(p)) : c.moveTo(sx(v), sy(p)))); c.stroke();
      const [v, p] = path[path.length - 1]; c.fillStyle = '#c2255c'; c.beginPath(); c.arc(sx(v), sy(p), 8, 0, 7); c.fill();
    }
    c.font = "600 30px 'Amiri','Newsreader',serif"; c.fillStyle = '#2a241c'; c.textAlign = 'right'; c.direction = 'rtl'; c.fillText(title || '', W - 20, 50);
  });
}
const PROC = {
  iso_p: { name: 'أيزوبارية (ضغط ثابت)', f: (k) => [0.25 + 0.5 * k, 0.6] },
  iso_v: { name: 'أيزوكورية (حجم ثابت)', f: (k) => [0.4, 0.3 + 0.5 * k] },
  iso_t: { name: 'أيزوثرمية (حرارة ثابتة)', f: (k) => { const v = 0.25 + 0.5 * k; return [v, (0.25 * 0.8) / v]; } },
  adia: { name: 'كظيمة (لا تبادل حراري)', f: (k) => { const v = 0.25 + 0.5 * k; return [v, 0.8 * Math.pow(0.25 / v, 1.67)]; } },
};

/* ---------- 6-1, 6-2 System, work, processes ---------- */
SCENES.thermosys = (S) => {
  const { THREE, V, gsap, ink, glow, label } = S;
  const g = new THREE.Group();
  const cyl = cylinderRig(S, V(-0.2, 0, 0.25)); g.add(cyl.g);
  const pan = pvPanel(S, V(0.08, 0, -0.32)); g.add(pan);
  const keys = ['iso_p', 'iso_v', 'iso_t', 'adia']; let ki = 0, shade = false, path = [], busy = false;
  const dial = token(S, 'العملية', '#c2255c', V(0.36, 0, 0.2)); g.add(dial);
  const area = token(S, 'W', '#f59f00', V(0.36, 0, 0.42)); g.add(area);
  const lp = label(PROC.iso_p.name, { size: 0.03, color: '#c2255c' }); lp.position.set(-0.2, 0.45, 0.25); g.add(lp);
  const bound = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.003, 6, 60).rotateX(Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#868e96', toneMapped: false })); bound.position.set(-0.2, 0.004, 0.25); g.add(bound);
  const draw = () => pan.redraw(path, shade, PROC[keys[ki]].name);
  draw();
  return {
    group: g,
    targets: [
      { obj: cyl.piston, hit: [cyl.piston.children[0]], hint: V(-0.2, 0, 0.37), act: () => { if (busy) return; busy = true; path = []; const P = PROC[keys[ki]], o = { k: 0 };
        gsap.to(o, { k: 1, duration: S.reduced ? 0.001 : 2, ease: 'none', onUpdate: () => { path = []; for (let i = 0; i <= 40; i++) path.push(P.f((o.k * i) / 40)); const [v, p] = P.f(o.k); cyl.set(0.06 + v * 0.24); cyl.gasMat.color.setHSL(0.92 - p * 0.1, 0.7, 0.5 + 0.2 * (1 - p)); draw(); }, onComplete: () => { path = []; for (let i = 0; i <= 40; i++) path.push(P.f(i / 40)); draw(); busy = false; } }); } },
      { obj: dial, hint: dial.position.clone(), act: () => { ki = (ki + 1) % keys.length; lp.setText(PROC[keys[ki]].name); path = []; cyl.set(0.12); draw(); } },
      { obj: area, hint: area.position.clone(), act: () => { shade = !shade; draw(); } },
    ],
    print(x, { P, inkText }) {
      inkText(x, 'حدود النظام', ...P(-0.2, 0.44), { size: 24, color: '#6b6155' });
      inkText(x, 'الوسط المحيط', ...P(-0.2, 0.55), { size: 24, color: '#6b6155' });
      inkText(x, 'الشغل = المساحة تحت منحنى P–V', ...P(0.08, -0.04), { size: 28, color: '#c2410c', weight: 600 });
    },
    notes: [],
  };
};

/* ---------- 6-4 Applications ---------- */
SCENES.thermoapp = (S) => {
  const { THREE, V, gsap, ink, glow, label, jar } = S;
  const g = new THREE.Group();
  const cyl = cylinderRig(S, V(-0.2, 0, 0.25)); g.add(cyl.g);
  const weight = block(S, 0.06, 0.04, 0.06, '#868e96'); weight.position.y = 0.13; weight.visible = false; cyl.piston.add(weight);
  const bath = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.16, 32, 1, true), new THREE.MeshStandardMaterial({ color: '#74c0fc', transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false })); bath.position.y = 0.09; bath.visible = false; cyl.g.add(bath);
  const jacket = ink(new THREE.CylinderGeometry(0.09, 0.09, 0.3, 32, 1, true), '#f1e3c8', { thresh: 20 }); jacket.material.side = THREE.DoubleSide; jacket.position.y = 0.164; jacket.visible = false; cyl.g.add(jacket);
  const pan = pvPanel(S, V(0.08, 0, -0.32)); g.add(pan);
  const jW = jar({ max: 1, color: '#1c7ed6', name: 'W', digits: 0 }), jU = jar({ max: 1, color: '#e03131', name: 'ΔU', digits: 0 });
  jW.position.set(0.22, 0, 0.3); jU.position.set(0.38, 0, 0.3); g.add(jW, jU);
  const tP = token(S, 'P ثابت', '#495057', V(0.0, 0, 0.47)), tT = token(S, 'T ثابتة', '#1971c2', V(0.13, 0, 0.47)), tA = token(S, 'عازل', '#c2410c', V(0.26, 0, 0.47));
  g.add(tP, tT, tA);
  let busy = false;
  const run = (key, txtW, txtU, valU) => {
    if (busy) return; busy = true; weight.visible = key === 'iso_p'; bath.visible = key === 'iso_t'; jacket.visible = key === 'adia';
    const P = PROC[key], o = { k: 0 }; const samp = (k) => { const a = []; for (let i = 0; i <= 40; i++) a.push(P.f((k * i) / 40)); return a; };
    gsap.to(o, { k: 1, duration: S.reduced ? 0.001 : 2, ease: 'none', onUpdate: () => { const [v] = P.f(o.k); cyl.set(0.06 + v * 0.24); pan.redraw(samp(o.k), true, P.name); }, onComplete: () => { pan.redraw(samp(1), true, P.name); jW.set(1, 0.4, txtW); jU.set(valU, 0.4, txtU); busy = false; } });
  };
  return {
    group: g,
    targets: [
      { obj: tP, hint: tP.position.clone(), act: () => run('iso_p', 'ΔW = PΔV = 10⁵ × 500×10⁻⁶ = 50 J', 'ΔU = ΔQ − ΔW', 0.6) },
      { obj: tT, hint: tT.position.clone(), act: () => run('iso_t', 'W = PᵢVᵢ ln(Vf/Vᵢ) ≈ 2.2 × 10⁵ J', 'ΔU = 0', 0) },
      { obj: tA, hint: tA.position.clone(), act: () => run('adia', 'ΔW موجب (تمدد)', 'ΔU = −ΔW', -0.8) },
    ],
    print(x, { P, inkText }) {
      inkText(x, 'ΔW = P ΔV', ...P(0.08, -0.06), { size: 30, color: '#c2410c', weight: 600 });
      inkText(x, 'W = PᵢVᵢ ln(V_f / Vᵢ)  ،  ΔW = −ΔU', ...P(0.08, 0.0), { size: 26, color: '#c2410c', weight: 600 });
      inkText(x, 'المثال 1: رئتان ، المثال 2: من 0.2 m³ إلى 0.6 m³ عند 10⁶ N/m²', ...P(0.04, 0.6), { size: 21, color: '#6b6155' });
    },
    notes: [],
  };
};

/* ---------- 6-5 Heat engine ---------- */
SCENES.engine = (S) => {
  const { THREE, V, gsap, ink, glow, label, jar, dots } = S;
  const g = new THREE.Group(), X = -0.12;
  const hot = block(S, 0.3, 0.06, 0.14, '#ff8787'); hot.position.set(X, 0, -0.42); g.add(hot);
  const cold = block(S, 0.3, 0.06, 0.14, '#74c0fc'); cold.position.set(X, 0, 0.42); g.add(cold);
  const lh = label('T_H', { size: 0.03, color: '#c92a2a' }); lh.position.set(X, 0.09, -0.42); g.add(lh);
  const lc = label('T_C', { size: 0.03, color: '#1864ab' }); lc.position.set(X, 0.09, 0.42); g.add(lc);
  const eng = ink(new THREE.CylinderGeometry(0.08, 0.08, 0.04, 30).translate(0, 0.02, 0), '#dee2e6', { thresh: 20 }); eng.position.set(X, 0, 0); g.add(eng);
  const wheel = new THREE.Group(); wheel.position.set(X + 0.2, 0.09, 0); g.add(wheel);
  wheel.add(ink(new THREE.TorusGeometry(0.06, 0.008, 8, 30).rotateY(Math.PI / 2), '#495057', { edges: false }));
  wheel.add(ink(new THREE.BoxGeometry(0.01, 0.12, 0.01), '#495057', { edges: false }));
  const wt = block(S, 0.04, 0.04, 0.04, '#e7cf9f'); wt.position.set(X + 0.2, 0, 0.12); g.add(wt);
  const qh = dots(18, '#ff6b6b', 0.01), qc = dots(12, '#4dabf7', 0.01), wq = dots(8, '#2b8a3e', 0.009); g.add(qh, qc, wq);
  const ph = [...Array(18)].map(() => Math.random()), pc = [...Array(12)].map(() => Math.random()), pw = [...Array(8)].map(() => Math.random());
  const jH = jar({ max: 1600, color: '#e03131', name: 'Q_H =', unit: 'J' }), jW = jar({ max: 1600, color: '#2b8a3e', name: 'W =', unit: 'J' }), jC = jar({ max: 1600, color: '#1c7ed6', name: 'Q_C =', unit: 'J' });
  [jH, jW, jC].forEach((j, i) => { j.position.set(0.36, 0, -0.42 + i * 0.27); g.add(j); });
  const eta = token(S, 'η', '#7048e8', V(0.2, 0, 0.42)); g.add(eta);
  const le = label('', { size: 0.032, color: '#5f3dc4' }); le.visible = false; g.add(le);
  const QHs = [1200, 1500]; let qi = 0, run = 0;
  const vals = () => { const QH = QHs[qi], W = 400; return { QH, W, QC: QH - W, e: (W / QH) * 100 }; };
  return {
    group: g,
    targets: [
      { obj: eng, hint: V(X, 0, 0.1), act: () => { run = S.reduced ? 0.01 : 3; const v = vals(); jH.set(v.QH, 1.5); jW.set(v.W, 1.5); jC.set(v.QC, 1.5); gsap.to(wt.position, { y: 0.12, duration: S.reduced ? 0 : 2.5, onComplete: () => setTimeout(() => (wt.position.y = 0), 1500) }); } },
      { obj: hot, hint: V(X, 0, -0.32), act: () => { qi = (qi + 1) % QHs.length; lh.setText(`T_H : Q_H = ${QHs[qi]} J`); } },
      { obj: eta, hint: eta.position.clone(), act: () => { const v = vals(); le.setText(`η = ${v.W}/${v.QH} × 100% = ${v.e.toFixed(0)}%`); le.position.set(0.1, 0.2, 0.3); S.show(le); } },
    ],
    update(dt) {
      const on = run > 0; if (on) { run -= dt; wheel.rotation.x += dt * 4; }
      ph.forEach((p, i) => { ph[i] = (p + dt * 0.6) % 1; qh.setAt(i, X + Math.sin(i * 2.3) * 0.03, 0.05, -0.36 + ph[i] * 0.34, on ? 1 : 0); }); qh.commit();
      pc.forEach((p, i) => { pc[i] = (p + dt * 0.6) % 1; qc.setAt(i, X + Math.sin(i * 1.7) * 0.03, 0.05, 0.03 + pc[i] * 0.33, on ? 1 : 0); }); qc.commit();
      pw.forEach((p, i) => { pw[i] = (p + dt * 0.8) % 1; wq.setAt(i, X + 0.08 + pw[i] * 0.1, 0.06, Math.sin(i) * 0.02, on ? 1 : 0); }); wq.commit();
    },
    print(x, { P, inkText }) {
      inkText(x, 'η = (W / Q_H) × 100%', ...P(0.04, -0.15), { size: 30, color: '#c2410c', weight: 600 });
      inkText(x, 'W = Q_H − Q_C', ...P(0.04, -0.08), { size: 28, color: '#c2410c', weight: 600 });
      inkText(x, 'الماكنة', ...P(X - 0.13, 0.0), { size: 24, color: '#6b6155' });
    },
    notes: [],
  };
};

/* ---------- 6-6 Second law ---------- */
SCENES.secondlaw = (S) => {
  const { THREE, V, gsap, ink, glow, label, dots } = S;
  const g = new THREE.Group();
  const A = block(S, 0.09, 0.09, 0.09, '#ff8787'), B = block(S, 0.09, 0.09, 0.09, '#74c0fc'); A.position.set(-0.25, 0, 0.35); B.position.set(-0.02, 0, 0.35); g.add(A, B);
  const lA = label('80 °C', { size: 0.03, color: '#c92a2a' }), lB = label('20 °C', { size: 0.03, color: '#1864ab' }); lA.position.set(-0.25, 0.13, 0.35); lB.position.set(-0.02, 0.13, 0.35); g.add(lA, lB);
  const heat = dots(12, '#ff922b', 0.009); g.add(heat); const hp = [...Array(12)].map(() => Math.random());
  const engHot = block(S, 0.16, 0.04, 0.1, '#ff8787'); engHot.position.set(-0.2, 0, -0.42); g.add(engHot);
  const eng = ink(new THREE.CylinderGeometry(0.05, 0.05, 0.03, 24).translate(0, 0.015, 0), '#dee2e6', { thresh: 20 }); eng.position.set(-0.2, 0, -0.22); g.add(eng);
  const cross = label('✕ لا تعمل', { size: 0.034, color: '#c92a2a' }); cross.visible = false; cross.position.set(-0.2, 0.1, -0.22); g.add(cross);
  const fHot = block(S, 0.14, 0.04, 0.1, '#ff8787'), fCold = block(S, 0.14, 0.04, 0.1, '#74c0fc'), fridge = ink(new THREE.CylinderGeometry(0.045, 0.045, 0.03, 24).translate(0, 0.015, 0), '#d0bfff', { thresh: 20 });
  fHot.position.set(0.25, 0, -0.42); fridge.position.set(0.25, 0, -0.22); fCold.position.set(0.25, 0, -0.02); g.add(fHot, fridge, fCold);
  const pump = dots(10, '#4dabf7', 0.008); g.add(pump); const pp = [...Array(10)].map(() => Math.random());
  const lw = label('W', { size: 0.03, color: '#7048e8' }); lw.position.set(0.38, 0.06, -0.22); lw.visible = false; g.add(lw);
  let contact = false, Ta = 80, Tb = 20, pumpOn = 0;
  return {
    group: g,
    targets: [
      { obj: A, hit: [A, B], hint: V(-0.14, 0, 0.47), act: () => { contact = true; Ta = 80; Tb = 20; gsap.to(B.position, { x: -0.16, duration: S.reduced ? 0 : 0.6 }); lB.position.x = -0.16; } },
      { obj: eng, hit: [eng, engHot], hint: V(-0.2, 0, -0.12), act: () => { cross.visible = true; glow(eng, '#e03131', 0.8); gsap.fromTo(eng.rotation, { y: 0 }, { y: 0.4, duration: 0.15, yoyo: true, repeat: 5 }); setTimeout(() => { cross.visible = false; glow(eng, null, 0); }, 2000); } },
      { obj: fridge, hit: [fridge, fCold, fHot], hint: V(0.25, 0, -0.12), act: () => { pumpOn = S.reduced ? 0.01 : 3; lw.visible = true; } },
    ],
    update(dt) {
      if (contact && Ta - Tb > 0.5) { const d = (Ta - Tb) * dt * 0.5; Ta -= d; Tb += d; lA.setText(`${Ta.toFixed(0)} °C`); lB.setText(`${Tb.toFixed(0)} °C`); A.material.uniforms.uColor.value.setHSL(0, 0.8, 0.85 - (Ta - 50) / 200); B.material.uniforms.uColor.value.setHSL(0.58, 0.8, 0.85 - (50 - Tb) / 200); }
      const flow = contact && Ta - Tb > 0.5; hp.forEach((p, i) => { hp[i] = (p + dt) % 1; heat.setAt(i, -0.25 + hp[i] * 0.12, 0.05 + Math.sin(i) * 0.02, 0.35 + Math.cos(i) * 0.02, flow ? 1 : 0); }); heat.commit();
      if (pumpOn > 0) pumpOn -= dt; else lw.visible = false;
      pp.forEach((p, i) => { pp[i] = (p + dt * 0.8) % 1; pump.setAt(i, 0.25 + Math.sin(i * 2) * 0.03, 0.05, -0.02 - pp[i] * 0.38, pumpOn > 0 ? 1 : 0); }); pump.commit();
    },
    print(x, { P, inkText }) {
      inkText(x, 'صيغة كلفن–بلانك: لا ماكنة تحول الحرارة كلها إلى شغل', ...P(0.02, 0.17), { size: 23, color: '#c92a2a', weight: 600 });
      inkText(x, 'صيغة كلاوزيوس: لا تنتقل الحرارة تلقائياً من البارد إلى الحار', ...P(0.02, 0.24), { size: 23, color: '#1864ab', weight: 600 });
      inkText(x, 'ماكنة', ...P(-0.2, -0.13), { size: 22, color: '#6b6155' }); inkText(x, 'ثلاجة', ...P(0.25, 0.05 - 0.0), { size: 22, color: '#6b6155' });
      inkText(x, 'الحرارة تنتقل من الحار إلى البارد حتى الاتزان', ...P(-0.1, 0.5), { size: 23, color: '#6b6155' });
    },
    notes: [],
  };
};

/* ================= Chapter 7 ================= */
function flatDisk(S, R, color = '#efe6d3', h = 0.014) {
  const { THREE, ink } = S; const g = new THREE.Group();
  g.add(ink(new THREE.CylinderGeometry(R, R, h, 64).translate(0, h / 2, 0), color, { thresh: 20 }));
  return g;
}
function curlArrow(S, r, color, sweep = 4.6) {
  const { THREE, ink } = S; const g = new THREE.Group();
  const t = ink(new THREE.TorusGeometry(r, 0.006, 8, 40, sweep).rotateX(Math.PI / 2), color, { edges: false }); g.add(t);
  const c = ink(new THREE.ConeGeometry(0.016, 0.04, 12), color, { edges: false });
  c.position.set(Math.cos(sweep) * r, 0, -Math.sin(sweep) * r); c.rotation.set(0, sweep, -Math.PI / 2); c.rotateZ(Math.PI); g.add(c);
  return g;
}
const DEG = (r) => (r * 180 / Math.PI);

/* ---------- 7-1, 7-2 Angular displacement ---------- */
SCENES.angular = (S) => {
  const { THREE, V, gsap, ink, glow, label, dots, show } = S;
  const g = new THREE.Group(), C = V(0.02, 0, -0.02), R = 0.27, Y = 0.016;
  const base = flatDisk(S, R, '#efe6d3'); base.position.copy(C); g.add(base);
  const rot = new THREE.Group(); rot.position.copy(C); g.add(rot);
  rot.add(ink(new THREE.CylinderGeometry(0.03, 0.03, 0.03, 20).translate(0, 0.015, 0), '#e0cfae', { thresh: 30 }));
  const rad = ink(new THREE.BoxGeometry(R, 0.008, 0.012).translate(R / 2, Y + 0.004, 0), '#e03131'); rot.add(rad);
  const ref = dashed(S, C.clone().setY(Y + 0.006), C.clone().add(V(R + 0.08, Y + 0.006, 0))); g.add(ref);
  const secMat = new THREE.MeshBasicMaterial({ color: '#ff922b', transparent: true, opacity: 0.55, toneMapped: false, depthWrite: false });
  const secGeo = new THREE.CircleGeometry(R * 0.98, 96).rotateX(-Math.PI / 2);
  const sector = new THREE.Mesh(secGeo, secMat); sector.position.copy(C).setY(Y + 0.002); sector.renderOrder = 2; g.add(sector);
  const arc = dots(48, '#d9480f', 0.006); g.add(arc);
  const radii = [0.1, 0.2, 0.3]; let ri = 2;
  const pt = ink(new THREE.SphereGeometry(0.018, 16, 12), '#f59f00', { thresh: 60 }); rot.add(pt);
  const lab = label('', { size: 0.034, color: '#c2410c' }); lab.position.set(C.x, 0.12, C.z - R - 0.08); g.add(lab);
  const t2 = token(S, '2π', '#5f3dc4', V(-0.3, 0, 0.3)); g.add(t2);
  let phi = 0.9, spin = false, full = false;
  const set = () => {
    rot.rotation.y = phi; const n = Math.floor(96 * Math.min(phi, 2 * Math.PI - 1e-6) / (2 * Math.PI)); secGeo.setDrawRange(0, n * 3);
    const rw = radii[ri] / 0.3 * R * 0.95; pt.position.set(rw, Y + 0.02, 0);
    for (let i = 0; i < 48; i++) { const a = (i / 47) * phi; arc.setAt(i, C.x + Math.cos(a) * rw, Y + 0.012, C.z - Math.sin(a) * rw, 1); } arc.commit();
    const r = radii[ri]; lab.setText(`θ = ${phi.toFixed(2)} rad = ${DEG(phi).toFixed(0)}°  ·  r = ${r} m  ·  S = rθ = ${(r * phi).toFixed(2)} m`);
  };
  set();
  return {
    group: g,
    targets: [
      { obj: rot, hit: [base.children[0], rad], hint: C.clone().add(V(-0.12, 0, 0.12)), act: () => { spin = !spin; full = false; glow(rad, '#e03131', spin ? 0.8 : 0); } },
      { obj: pt, hint: C.clone().add(V(0.2, 0, 0.14)), act: () => { ri = (ri + 1) % 3; gsap.fromTo(pt.scale, { x: 1.6, y: 1.6, z: 1.6 }, { x: 1, y: 1, z: 1, duration: 0.5 }); set(); } },
      { obj: t2, hint: t2.position.clone(), act: () => { spin = false; full = true; const o = { p: 0 }; gsap.to(o, { p: 2 * Math.PI, duration: S.reduced ? 0.001 : 2.2, ease: 'power1.inOut', onUpdate: () => { phi = o.p; set(); }, onComplete: () => { lab.setText('دورة كاملة: θ = 2πr / r = 2π rad = 360°'); S.sfx.good(); } }); } },
    ],
    update(dt) { if (spin) { phi += dt * 0.8; if (phi > 2 * Math.PI) phi -= 2 * Math.PI; set(); } },
    print(x, { P, inkText }) {
      inkText(x, 'θ = S / r', ...P(0.04, 0.42), { size: 40, color: '#c2410c', weight: 600 });
      inkText(x, 'خط الإسناد (متقطع) · نصف القطر (أحمر) · القوس S (برتقالي)', ...P(0.04, 0.5), { size: 23 });
      inkText(x, '1 rad ≈ 57.3°  ،  2π rad = 360°', ...P(0.04, 0.57), { size: 25, color: '#6b6155' });
    },
    notes: [],
  };
};

/* ---------- 7-3 Linear vs angular speed ---------- */
SCENES.linang = (S) => {
  const { THREE, V, gsap, ink, glow, arrow, label, jar } = S;
  const g = new THREE.Group(), C = V(-0.04, 0, 0.0), R = 0.27;
  const disk = flatDisk(S, R, '#e9eef3'); disk.position.copy(C); g.add(disk);
  const rot = new THREE.Group(); rot.position.copy(C); g.add(rot);
  rot.add(ink(new THREE.BoxGeometry(R, 0.006, 0.01).translate(R / 2, 0.017, 0), '#868e96'));
  const rs = [0.09, 0.18, 0.26], rm = [0.1, 0.2, 0.3], cols = ['#74c0fc', '#4dabf7', '#1c7ed6'];
  const P = rs.map((r, i) => { const p = ink(new THREE.SphereGeometry(0.017, 14, 10), cols[i], { thresh: 60 }); p.position.set(r, 0.03, 0); rot.add(p); return p; });
  const A = rs.map(() => { const a = arrow('#2b8a3e', 0.007); g.add(a); glow(a, '#2b8a3e', 1, 0); return a; });
  const knob = new THREE.Group(); knob.position.set(0.37, 0, 0.26);
  knob.add(ink(new THREE.CylinderGeometry(0.045, 0.05, 0.02, 24).translate(0, 0.01, 0), '#ede2cb', { thresh: 20 }));
  const ptr = ink(new THREE.BoxGeometry(0.05, 0.012, 0.012).translate(0.02, 0.026, 0), '#d9480f'); knob.add(ptr); g.add(knob);
  const lk = label('ω', { size: 0.03 }); lk.position.y = 0.05; knob.add(lk);
  const lab = label('', { size: 0.032, color: '#1c7ed6' }); lab.position.set(C.x, 0.1, C.z - R - 0.08); g.add(lab);
  const J = jar({ max: 1.3, color: '#2b8a3e', name: 'υ =', unit: 'm/s', digits: 1 }); J.position.set(0.38, 0, -0.3); g.add(J);
  let w = 2, spin = false, phi = 0;
  const txt = () => lab.setText(`ω = ${w} rad/s  ·  υ = rω = ${rm.map((r) => (r * w).toFixed(1)).join(' ، ')} m/s`);
  const place = () => { rot.rotation.y = phi; rs.forEach((r, i) => { const p = C.clone().add(V(Math.cos(phi) * r, 0.03, -Math.sin(phi) * r)); const tg = V(-Math.sin(phi), 0, -Math.cos(phi)); A[i].point(p, p.clone().addScaledVector(tg, 0.12 * rm[i] * w)); }); };
  txt(); place(); J.set(0.3 * w);
  return {
    group: g,
    targets: [
      { obj: rot, hit: [disk.children[0]], hint: C.clone().add(V(-0.1, 0, 0.14)), act: () => { spin = !spin; } },
      { obj: knob, hint: knob.position.clone(), act: () => { w = w === 2 ? 4 : 2; gsap.to(ptr.rotation, { y: w === 4 ? -1.2 : 0, duration: 0.4 }); txt(); place(); J.set(0.3 * w); spin = true; } },
      { obj: P[2], hint: V(C.x + 0.27, 0, C.z + 0.1), act: () => { glow(P[2], '#f08c00', 0.9); J.set(0.3 * w, 0.6, `υ = 0.3 × ${w} = ${(0.3 * w).toFixed(1)} m/s`); } },
    ],
    update(dt) { if (spin) { phi += dt * 0.35 * w; place(); } },
    print(x, { P: PP, inkText }) {
      inkText(x, 'υ = r ω  ،  ω = 2π / T = 2π f', ...PP(0.04, 0.42), { size: 36, color: '#c2410c', weight: 600 });
      inkText(x, 'مثال 1: 5400 rpm ⇒ f = 90 Hz ، T = 1/90 s ، ω = 180π rad/s', ...PP(0.04, 0.5), { size: 23 });
      inkText(x, 'النقاط كلها ω واحدة، والأبعد عن المحور أسرع خطياً', ...PP(0.04, 0.57), { size: 23, color: '#6b6155' });
    },
    notes: [],
  };
};

/* ---------- 7-5 Non-uniform circular motion ---------- */
SCENES.nonuniform = (S) => {
  const { THREE, V, ink, glow, arrow, label, show } = S;
  const g = new THREE.Group(), C = V(0.0, 0, -0.04), R = 0.24, Y = 0.03;
  { const pp = ink(new THREE.CylinderGeometry(0.012, 0.014, 0.05, 12).translate(0, 0.025, 0), '#e0cfae'); pp.position.copy(C); g.add(pp); }
  const ball = ink(new THREE.SphereGeometry(0.024, 18, 12), '#f1d79e', { thresh: 60 }); g.add(ball);
  const Ac = arrow('#e03131', 0.008), At = arrow('#1c7ed6', 0.008), Aa = arrow('#7048e8', 0.009);
  [[Ac, '#e03131'], [At, '#1c7ed6'], [Aa, '#7048e8']].forEach(([a, c]) => { g.add(a); glow(a, c, 1, 0); }); Aa.visible = false;
  const lab = label('', { size: 0.03, color: '#5f3dc4' }); lab.position.set(C.x, 0.12, C.z - R - 0.09); g.add(lab);
  const tT = token(S, 'a_T', '#1c7ed6', V(-0.32, 0, 0.3)), tA = token(S, 'a', '#7048e8', V(-0.2, 0, 0.3)); g.add(tT, tA);
  let run = false, acc = true, phi = 0, v = 1, showA = false; const aT = 1, rm = 1;
  const place = () => {
    const p = C.clone().add(V(Math.cos(phi) * R, Y, -Math.sin(phi) * R)), tg = V(-Math.sin(phi), 0, -Math.cos(phi)), inw = C.clone().setY(Y).sub(p).normalize();
    ball.position.copy(p); const ac = v * v / rm, at = acc ? aT : 0, k = 0.035;
    Ac.point(p, p.clone().addScaledVector(inw, ac * k)); At.visible = at > 0; if (at) At.point(p, p.clone().addScaledVector(tg, at * k * 1.5));
    Aa.visible = showA; Aa.point(p, p.clone().addScaledVector(inw, ac * k).addScaledVector(tg, at * k * 1.5));
    lab.setText(`υ = ${v.toFixed(1)} m/s · a_c = ${ac.toFixed(1)} · a_T = ${at} · a = ${Math.hypot(ac, at).toFixed(1)} m/s²`);
  };
  place();
  return {
    group: g,
    targets: [
      { obj: ball, hint: C.clone().add(V(R, 0, 0.08)), act: () => { run = !run; if (run && v > 2.6) v = 1; } },
      { obj: tT, hint: tT.position.clone(), act: () => { acc = !acc; glow(tT, '#1c7ed6', acc ? 0.6 : 0); run = true; place(); } },
      { obj: tA, hint: tA.position.clone(), act: () => { showA = !showA; glow(tA, '#7048e8', showA ? 0.7 : 0); place(); } },
    ],
    update(dt) { if (!run) return; if (acc) { v += aT * dt * 0.5; if (v > 2.8) v = 1; } phi += (v / rm) * dt * 0.6; place(); },
    print(x, { P, inkLine, inkText }) {
      const pts = []; for (let i = 0; i <= 90; i++) { const a = (i / 90) * Math.PI * 2; pts.push(P(C.x + Math.cos(a) * R, C.z + Math.sin(a) * R)); }
      inkLine(x, pts, { w: 2, dash: [12, 9], color: '#6b6155' });
      inkText(x, 'a = √(a_c² + a_T²)  ،  tanθ = a_c / a_T', ...P(0.04, 0.42), { size: 34, color: '#c2410c', weight: 600 });
      inkText(x, 'مركزي (أحمر) · مماسي (أزرق) · محصل (بنفسجي) · r = 1 m', ...P(0.04, 0.5), { size: 23 });
      inkText(x, 'a_T يغيّر مقدار السرعة، و a_c يغيّر اتجاهها', ...P(0.04, 0.57), { size: 23, color: '#6b6155' });
    },
    notes: [],
  };
};

/* ---------- 7-6 Flat curve ---------- */
SCENES.flatcurve = (S) => {
  const { THREE, V, gsap, ink, glow, arrow, label, dots } = S;
  const g = new THREE.Group(), C = V(0.0, 0, -0.05), R = 0.23;
  const road = ink(new THREE.RingGeometry(R - 0.065, R + 0.065, 72).rotateX(-Math.PI / 2).translate(0, 0.004, 0), '#dcd6c8', { thresh: 10 }); road.position.copy(C); g.add(road);
  const c = car(S); c.scale.setScalar(1.1); g.add(c);
  const F = arrow('#e03131', 0.008); g.add(F); glow(F, '#e03131', 1, 0);
  const trail = dots(16, '#f59f00', 0.007); g.add(trail);
  const pedal = token(S, 'υ', '#2b8a3e', V(0.36, 0, 0.26)), wet = token(S, 'μ_s', '#1c7ed6', V(-0.34, 0, 0.26)); g.add(pedal, wet);
  const lab = label('', { size: 0.03, color: '#c2410c' }); lab.position.set(C.x, 0.14, C.z - R - 0.11); g.add(lab);
  const speeds = [8, 10, 12]; let si = 0, mu = 0.5, run = false, phi = 0, slide = null; const rr = 20;
  const vmax = () => Math.sqrt(mu * 10 * rr);
  const txt = () => { const v = speeds[si]; lab.setText(`υ = ${v} m/s · υ_max = √(μ_s g r) = ${vmax().toFixed(1)} m/s${v > vmax() + 1e-6 ? ' ⇒ انزلاق!' : ''}`); };
  const place = () => { const p = C.clone().add(V(Math.cos(phi) * R, 0.006, -Math.sin(phi) * R)); c.position.copy(p); c.rotation.y = phi + Math.PI / 2; const inw = C.clone().setY(0.006).sub(p).normalize(); F.visible = true; const pf = p.clone().setY(0.05); F.point(pf, pf.clone().addScaledVector(inw, 0.07 * Math.min(speeds[si] ** 2 / rr, mu * 10) / 5)); };
  txt(); place();
  return {
    group: g,
    targets: [
      { obj: c, hint: C.clone().add(V(R, 0, 0.1)), act: () => { if (!slide) run = !run; } },
      { obj: pedal, hint: pedal.position.clone(), act: () => { si = (si + 1) % 3; txt(); run = true; } },
      { obj: wet, hint: wet.position.clone(), act: () => { mu = mu === 0.5 ? 0.3 : 0.5; road.material.uniforms.uColor.value.set(mu === 0.5 ? '#dcd6c8' : '#a5d8ff'); txt(); } },
    ],
    update(dt) {
      if (slide) {
        slide.t += dt; const p = slide.p.clone().addScaledVector(slide.tg, 0.35 * slide.t); c.position.copy(p); c.rotation.y += dt * 2;
        for (let i = 0; i < 16; i++) { const q = slide.p.clone().addScaledVector(slide.tg, 0.35 * slide.t * i / 15); trail.setAt(i, q.x, 0.01, q.z, 1); } trail.commit();
        if (slide.t > (S.reduced ? 0.5 : 1.8)) { slide = null; for (let i = 0; i < 16; i++) trail.setAt(i, 0, -9, 0, 0); trail.commit(); si = 0; txt(); run = false; place(); }
        return;
      }
      if (!run) return; phi += dt * 0.1 * speeds[si]; place();
      if (speeds[si] > vmax() + 1e-6 && phi % (2 * Math.PI) > 1.2 && phi % (2 * Math.PI) < 1.4) { slide = { p: c.position.clone(), tg: V(-Math.sin(phi), 0, -Math.cos(phi)).add(V(Math.cos(phi), 0, -Math.sin(phi)).multiplyScalar(0.4)).normalize(), t: 0 }; F.visible = false; S.sfx.whoosh(); }
    },
    print(x, { P, inkText }) {
      inkText(x, 'f_s = m υ² / r ≤ μ_s m g  ⇒  υ_max = √(μ_s g r)', ...P(0.04, 0.44), { size: 31, color: '#c2410c', weight: 600 });
      inkText(x, 'r = 20 m ، g = 10 m/s² ، جاف μ_s = 0.5 ، مبلل 0.3 (قيمة توضيحية)', ...P(0.04, 0.52), { size: 22 });
      inkText(x, 'الكتلة لا تظهر: الشاحنة والسيارة الصغيرة لهما سرعة الأمان نفسها', ...P(0.04, 0.59), { size: 22, color: '#6b6155' });
    },
    notes: [],
  };
};

/* ---------- 7-7 Banked curve ---------- */
SCENES.banked = (S) => {
  const { THREE, V, ink, glow, arrow, label, show } = S;
  const g = new THREE.Group(), C = V(0.0, 0, -0.06), R0 = 0.15, R1 = 0.3, Rm = 0.225;
  const angs = [20, 30, 45]; let ai = 1, road = null, run = false, phi = 0, showN = false;
  const rig = new THREE.Group(); rig.position.copy(C); g.add(rig);
  const tilt = new THREE.Group(); rig.add(tilt); const c = car(S); c.rotation.y = Math.PI / 2; c.scale.setScalar(0.95); tilt.add(c);
  const N = arrow('#2b8a3e', 0.007), Nh = arrow('#e03131', 0.006), Nv = arrow('#1c7ed6', 0.006), W = arrow('#495057', 0.007);
  [[N, '#2b8a3e'], [Nh, '#e03131'], [Nv, '#1c7ed6'], [W, '#495057']].forEach(([a, col]) => { rig.add(a); glow(a, col, 1, 0); });
  const lab = label('', { size: 0.03, color: '#c2410c' }); lab.position.set(C.x, 0.2, C.z - R1 - 0.06); g.add(lab);
  const hitRing = new THREE.Mesh(new THREE.RingGeometry(R0, R1, 48).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ visible: false })); hitRing.position.copy(C).setY(0.05); g.add(hitRing);
  const tTh = token(S, 'θ', '#c2410c', V(0.37, 0, 0.27)), tN = token(S, 'N', '#2b8a3e', V(-0.36, 0, 0.27)); g.add(tTh, tN);
  const build = () => {
    const th = angs[ai] * Math.PI / 180, tn = Math.tan(th);
    if (road) { g.remove(road); road.geometry.dispose(); }
    const geo = new THREE.RingGeometry(R0, R1, 72, 3).rotateX(-Math.PI / 2); const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) { const r = Math.hypot(p.getX(i), p.getZ(i)); p.setY(i, 0.006 + (r - R0) * tn * 0.6); }
    geo.computeVertexNormals(); road = ink(geo, '#dcd6c8', { thresh: 10 }); road.position.copy(C); g.add(road);
    const y = 0.006 + (Rm - R0) * tn * 0.6, th2 = Math.atan(tn * 0.6);
    tilt.position.set(Rm, y, 0); tilt.rotation.z = th2;
    const p0 = V(Rm, y + 0.04, 0), L = 0.13;
    N.point(p0, p0.clone().add(V(-Math.sin(th) * L, Math.cos(th) * L, 0))); Nh.point(p0, p0.clone().add(V(-Math.sin(th) * L, 0, 0))); Nv.point(p0, p0.clone().add(V(0, Math.cos(th) * L, 0))); W.point(p0, p0.clone().add(V(0, -Math.cos(th) * L, 0)));
    [N, Nh, Nv, W].forEach((a) => (a.visible = showN));
    lab.setText(`θ = ${angs[ai]}° · r = 40 m ⇒ υ = √(r g tanθ) = ${Math.sqrt(40 * 10 * tn).toFixed(1)} m/s`);
  };
  build();
  return {
    group: g,
    targets: [
      { obj: tilt, hit: [hitRing], hint: C.clone().add(V(Rm, 0, 0.1)), act: () => { run = !run; } },
      { obj: tTh, hint: tTh.position.clone(), act: () => { ai = (ai + 1) % 3; build(); run = true; } },
      { obj: tN, hint: tN.position.clone(), act: () => { showN = !showN; [N, Nh, Nv, W].forEach((a) => (a.visible = showN)); glow(tN, '#2b8a3e', showN ? 0.6 : 0); } },
    ],
    update(dt) { if (run) { phi += dt * 0.25 * Math.sqrt(Math.tan(angs[ai] * Math.PI / 180) * 4); rig.rotation.y = phi; } },
    print(x, { P, inkText }) {
      inkText(x, 'N sinθ = m υ² / r  ،  N cosθ = m g  ⇒  tanθ = υ² / (r g)', ...P(0.04, 0.44), { size: 29, color: '#c2410c', weight: 600 });
      inkText(x, 'N (أخضر) · N sinθ قوة مركزية (أحمر) · N cosθ (أزرق) · الوزن (رمادي)', ...P(0.04, 0.52), { size: 21 });
      inkText(x, 'r = 40 m ، g = 10 m/s² (قيم توضيحية) · ميل الرسم مخفف', ...P(0.04, 0.59), { size: 22, color: '#6b6155' });
    },
    notes: [],
  };
};

/* ---------- 7-8 True and apparent weight ---------- */
SCENES.elevator = (S) => {
  const { THREE, V, gsap, ink, glow, arrow, label, jar, show } = S;
  const g = new THREE.Group(), X = -0.04, Z = -0.05, BW = 0.24, BD = 0.2, BH = 0.3;
  for (const [px, pz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const p = block(S, 0.012, 0.62, 0.012, '#ced4da'); p.position.set(X + px * (BW / 2 + 0.02), 0, Z + pz * (BD / 2 + 0.02)); g.add(p); }
  const cab = new THREE.Group(); cab.position.set(X, 0.02, Z); g.add(cab);
  cab.add(block(S, BW, 0.012, BD, '#e9dfca'));
  const back = block(S, BW, BH, 0.008, '#f3ecdc'); back.position.z = -BD / 2; cab.add(back);
  const roof = block(S, BW, 0.01, BD, '#e9dfca'); roof.position.y = BH; cab.add(roof);
  const sc = block(S, 0.1, 0.02, 0.08, '#dee2e6'); sc.position.set(0, 0.012, 0.02); cab.add(sc);
  const dial = ink(new THREE.CylinderGeometry(0.024, 0.024, 0.006, 24).rotateX(Math.PI / 2), '#fbf6ea', { thresh: 20 }); dial.position.set(0, 0.022, 0.063); cab.add(dial);
  const needle = ink(new THREE.BoxGeometry(0.003, 0.02, 0.003).translate(0, 0.009, 0), '#e03131', { edges: false }); needle.position.set(0, 0.022, 0.067); cab.add(needle);
  const man = new THREE.Group(); man.position.set(0, 0.032, 0.02); cab.add(man);
  man.add(ink(new THREE.CylinderGeometry(0.022, 0.026, 0.13, 16).translate(0, 0.065, 0), '#a5d8ff', { thresh: 30 }));
  const head = ink(new THREE.SphereGeometry(0.022, 16, 12), '#ffe8cc', { thresh: 60 }); head.position.y = 0.155; man.add(head);
  const Na = arrow('#2b8a3e', 0.007), Wa = arrow('#e03131', 0.007); cab.add(Na, Wa); glow(Na, '#2b8a3e', 1, 0); glow(Wa, '#e03131', 1, 0);
  const lN = label('N', { size: 0.026, color: '#2b8a3e' }), lW = label('mg = 600 N', { size: 0.026, color: '#e03131' }); cab.add(lN, lW);
  const btn = token(S, '▲▼', '#c2410c', V(0.32, 0, 0.27)), tF = token(S, 'FBD', '#2b8a3e', V(-0.33, 0, 0.27)); g.add(btn, tF);
  const J = jar({ max: 800, color: '#2b8a3e', name: 'الميزان', unit: 'N' }); J.position.set(0.33, 0, -0.25); g.add(J);
  const lab = label('', { size: 0.03, color: '#c2410c' }); lab.position.set(X, 0.66, Z); g.add(lab);
  const ST = [{ n: 'ساكن', a: 0, d: 0 }, { n: 'ينزل بتعجيل 2 m/s²', a: -2, d: -1 }, { n: 'يصعد بتعجيل 2 m/s²', a: 2, d: 1 }, { n: 'سقوط حر', a: -10, d: -1 }];
  let si = 0, fbd = true;
  const setForces = (Nv) => {
    const p = V(0.06, 0.032, 0.02), k = 0.00016; Na.point(p, p.clone().add(V(0, Nv * k, 0))); Na.visible = fbd && Nv > 1; const q = V(-0.06, 0.12, 0.02); Wa.point(q, q.clone().add(V(0, -600 * k, 0))); Wa.visible = fbd;
    lN.position.set(0.09, 0.04 + Nv * k, 0.02); lN.setText(`N = ${Nv} N`); lN.visible = fbd && Nv > 1; lW.position.set(-0.09, 0.0, 0.02); lW.visible = fbd;
    gsap.to(needle.rotation, { z: -Nv / 800 * 4.5, duration: 0.5 });
  };
  const apply = () => {
    const s = ST[si], Nv = 60 * (10 + s.a); lab.setText(`${s.n}: N = m(g ${s.a >= 0 ? '+' : '−'} ${Math.abs(s.a)}) = ${Nv} N`); J.set(Nv); setForces(Nv);
    gsap.killTweensOf(cab.position);
    if (s.d) { cab.position.y = s.d > 0 ? 0.02 : 0.28; gsap.to(cab.position, { y: s.d > 0 ? 0.28 : 0.02, duration: S.reduced ? 0.001 : (si === 3 ? 0.9 : 2.2), ease: 'power2.in' }); }
    else gsap.to(cab.position, { y: 0.02, duration: 0.5 });
  };
  apply();
  return {
    group: g,
    targets: [
      { obj: btn, hint: btn.position.clone(), act: () => { si = (si + 1) % 4; apply(); } },
      { obj: sc, hit: [sc, dial], hint: V(X + 0.1, 0, Z + 0.16), act: () => { glow(sc, '#f08c00', 0.8); J.set(J.value, 0.3, `القراءة = الوزن الظاهري = ${J.value} N`); } },
      { obj: tF, hint: tF.position.clone(), act: () => { fbd = !fbd; setForces(J.value); glow(tF, '#2b8a3e', fbd ? 0.6 : 0); } },
    ],
    print(x, { P, inkText }) {
      inkText(x, 'W_real = m g  ،  W_app = N = m (g ± a)', ...P(0.04, 0.44), { size: 33, color: '#c2410c', weight: 600 });
      inkText(x, 'مثال 2: m = 60 kg ، a = 2 m/s² ⇒ 600 / 480 / 720 N', ...P(0.04, 0.52), { size: 24 });
      inkText(x, 'في السقوط الحر a = g فتصبح القراءة صفراً (انعدام الوزن)', ...P(0.04, 0.59), { size: 22, color: '#6b6155' });
    },
    notes: [],
  };
};

/* ---------- 7-9, 7-10 Angular acceleration ---------- */
SCENES.rotaccel = (S) => {
  const { THREE, V, ink, glow, arrow, label, jar } = S;
  const g = new THREE.Group(), C = V(0.04, 0, -0.04), R = 0.22;
  const ax = ink(new THREE.CylinderGeometry(0.01, 0.01, 0.1, 12).translate(0, 0.05, 0), '#ced4da'); ax.position.copy(C); g.add(ax);
  const rot = new THREE.Group(); rot.position.copy(C).setY(0.05); g.add(rot);
  const disk = flatDisk(S, R, '#f3d9fa'); disk.position.y = -0.007; rot.add(disk);
  rot.add(ink(new THREE.BoxGeometry(R, 0.006, 0.014).translate(R / 2, 0.01, 0), '#ae3ec9'));
  const Wv = arrow('#7048e8', 0.01); g.add(Wv); glow(Wv, '#7048e8', 1, 0);
  const curl = curlArrow(S, R + 0.03, '#ae3ec9'); curl.position.copy(C).setY(0.065); g.add(curl);
  const hand = new THREE.Group(); hand.position.set(-0.33, 0, -0.28); g.add(hand);
  hand.add(ink(new THREE.CylinderGeometry(0.035, 0.04, 0.06, 16).translate(0, 0.03, 0), '#ffe8cc', { thresh: 30 }));
  const thumb = ink(new THREE.CylinderGeometry(0.009, 0.01, 0.07, 10).translate(0, 0.035, 0), '#ffd8a8'); thumb.position.y = 0.06; hand.add(thumb);
  const hc = curlArrow(S, 0.055, '#ae3ec9', 4.2); hc.position.y = 0.035; hand.add(hc);
  const lh = label('الكف اليمنى', { size: 0.026 }); lh.position.y = 0.16; hand.add(lh);
  const tR = token(S, '⟲', '#c2410c', V(0.35, 0, 0.27)); g.add(tR);
  const J = jar({ max: 12, color: '#7048e8', name: 'ω =', unit: 'rad/s', digits: 1 }); J.position.set(0.36, 0, -0.28); g.add(J);
  const lab = label('', { size: 0.03, color: '#5f3dc4' }); lab.position.set(C.x, 0.4, C.z - 0.1); g.add(lab);
  let run = false, w = 0, t = 0, dir = 1, phi = 0; const al = 2;
  const set = () => { const p = C.clone().setY(0.06); Wv.point(dir > 0 ? p : p.clone().setY(0.06 + 0.02 * w + 0.03), dir > 0 ? p.clone().setY(0.06 + 0.02 * w + 0.03) : p); curl.scale.set(1, dir, dir); hc.scale.set(1, dir, dir); hand.rotation.x = dir > 0 ? 0 : Math.PI; hand.position.y = dir > 0 ? 0 : 0.14; lh.position.y = dir > 0 ? 0.16 : -0.03;
    lab.setText(`α = Δω/Δt = ${al} rad/s² · t = ${t.toFixed(1)} s · ω = ${w.toFixed(1)} rad/s · a_T(r = 0.5 m) = ${(0.5 * al)} m/s²`); J.set(w, 0.1); };
  set();
  return {
    group: g,
    targets: [
      { obj: rot, hit: [disk.children[0]], hint: C.clone().add(V(-0.12, 0, 0.14)), act: () => { run = !run; if (run && w >= 12) { w = 0; t = 0; } } },
      { obj: tR, hint: tR.position.clone(), act: () => { dir = -dir; w = 0; t = 0; run = true; set(); } },
      { obj: hand, hint: hand.position.clone(), act: () => { glow(hand, '#f08c00', 0.8); lh.setText('الأصابع مع الدوران ← الإبهام باتجاه ω'); } },
    ],
    update(dt) { if (!run) return; t += dt; w = Math.min(12, al * t); if (w >= 12) run = false; phi += dir * w * dt * 0.35; rot.rotation.y = phi; set(); },
    print(x, { P, inkText }) {
      inkText(x, 'α = (ω_f − ω_i) / (t_f − t_i)  ،  a_T = r α', ...P(0.04, 0.44), { size: 33, color: '#c2410c', weight: 600 });
      inkText(x, 'دوران عكس عقارب الساعة (من الأعلى) ← ω نحو الأعلى', ...P(0.04, 0.52), { size: 23 });
      inkText(x, 'الجسم الجاسئ: نقاطه كلها تقطع الإزاحة الزاوية نفسها', ...P(0.04, 0.59), { size: 22, color: '#6b6155' });
    },
    notes: [],
  };
};

/* ---------- 7-11 Angular kinematic equations ---------- */
SCENES.angeq = (S) => {
  const { THREE, V, gsap, ink, glow, label } = S;
  const g = new THREE.Group(), C = V(-0.12, 0, -0.02), R = 0.2;
  const wheel = new THREE.Group(); wheel.position.copy(C); g.add(wheel);
  wheel.add(ink(new THREE.TorusGeometry(R, 0.014, 10, 64).rotateX(Math.PI / 2).translate(0, 0.02, 0), '#e9c99a', { thresh: 30 }));
  for (let i = 0; i < 6; i++) { const s = ink(new THREE.BoxGeometry(R, 0.006, 0.006).translate(R / 2, 0.02, 0), i ? '#cfc3aa' : '#e03131', { edges: false }); s.rotation.y = i * Math.PI / 3; wheel.add(s); }
  wheel.add(ink(new THREE.CylinderGeometry(0.025, 0.025, 0.03, 16).translate(0, 0.015, 0), '#e0cfae'));
  const hit = new THREE.Mesh(new THREE.CylinderGeometry(R, R, 0.04, 24), new THREE.MeshBasicMaterial({ visible: false })); hit.position.copy(C).setY(0.02); g.add(hit);
  const ref = dashed(S, C.clone().setY(0.03), C.clone().add(V(R + 0.06, 0.03, 0))); g.add(ref);
  const knob = new THREE.Group(); knob.position.set(-0.36, 0, 0.27);
  knob.add(ink(new THREE.CylinderGeometry(0.045, 0.05, 0.02, 24).translate(0, 0.01, 0), '#ede2cb', { thresh: 20 }));
  const ptr = ink(new THREE.BoxGeometry(0.05, 0.012, 0.012).translate(0.02, 0.026, 0), '#d9480f'); knob.add(ptr); g.add(knob);
  const lk = label('α', { size: 0.03 }); lk.position.y = 0.05; knob.add(lk);
  const rows = [['x = υ_i t + ½ a t²', 'θ = ω_i t + ½ α t²'], ['υ_f = υ_i + a t', 'ω_f = ω_i + α t'], ['υ_f² = υ_i² + 2 a x', 'ω_f² = ω_i² + 2 α θ'], ['x = ½(υ_i + υ_f) t', 'θ = ½(ω_i + ω_f) t']];
  const pan = panel(S, 0.3, 0.34, V(0.25, 0, -0.24), (c, W, H, hi) => {
    c.font = "600 30px 'Amiri',serif"; c.fillStyle = '#2a241c'; c.textAlign = 'center'; c.direction = 'rtl'; c.fillText('خطية  ↔  زاوية', W / 2, 46);
    rows.forEach(([a, b], i) => { const y = 120 + i * 175; if (i === hi) { c.fillStyle = 'rgba(250,176,5,.4)'; c.fillRect(10, y - 50, W - 20, 150); } c.direction = 'ltr'; c.fillStyle = '#495057'; c.font = "500 36px 'Newsreader',serif"; c.fillText(a, W / 2, y); c.fillStyle = '#c2410c'; c.font = "600 40px 'Newsreader',serif"; c.fillText(b, W / 2, y + 60); });
  });
  pan.redraw(-1); g.add(pan);
  const lab = label('ω_i = 2 rad/s · α = 3.5 rad/s²', { size: 0.03, color: '#c2410c' }); lab.position.set(C.x, 0.12, C.z - R - 0.1); g.add(lab);
  let al = 3.5, busy = false, hi = -1;
  return {
    group: g,
    targets: [
      { obj: wheel, hit: [hit], hint: C.clone().add(V(0, 0, R + 0.06)), act: () => { if (busy) return; busy = true; wheel.rotation.y = 0; const o = { t: 0 };
        gsap.to(o, { t: 2, duration: S.reduced ? 0.001 : 2, ease: 'none', onUpdate: () => { const th = 2 * o.t + 0.5 * al * o.t * o.t; wheel.rotation.y = th; lab.setText(`t = ${o.t.toFixed(1)} s · θ = ${th.toFixed(1)} rad · ω = ${(2 + al * o.t).toFixed(1)} rad/s`); },
          onComplete: () => { const th = 4 + 2 * al; lab.setText(`θ = ${th} rad = ${(th / (2 * Math.PI)).toFixed(2)} rev · ω_f = ${2 + 2 * al} rad/s`); S.sfx.good(); busy = false; } }); } },
      { obj: knob, hint: knob.position.clone(), act: () => { al = al === 3.5 ? 2 : 3.5; gsap.to(ptr.rotation, { y: al === 2 ? -1.2 : 0, duration: 0.4 }); lab.setText(`ω_i = 2 rad/s · α = ${al} rad/s²`); } },
      { obj: pan, hit: [pan.board], hint: V(0.25, 0, -0.12), act: () => { hi = (hi + 1) % 4; pan.redraw(hi); } },
    ],
    print(x, { P, inkText }) {
      inkText(x, 'θ = ω_i t + ½ α t²  ،  ω_f = ω_i + α t', ...P(0.04, 0.44), { size: 33, color: '#c2410c', weight: 600 });
      inkText(x, 'مثال 3: θ = 2 × 2 + ½ × 3.5 × 4 = 11 rad ≈ 1.75 rev', ...P(0.04, 0.52), { size: 24 });
      inkText(x, 'الشعاع الأحمر يعدّ الدورات من خط الإسناد', ...P(0.04, 0.59), { size: 22, color: '#6b6155' });
    },
    notes: [],
  };
};

/* ---------- 7-12 Moment of inertia ---------- */
SCENES.inertiaI = (S) => {
  const { THREE, V, gsap, ink, glow, label } = S;
  const g = new THREE.Group(), R = 0.1, Z = -0.02;
  const mk = (geo, color, x, yc) => { const o = new THREE.Group(); o.position.set(x, 0, Z); g.add(o);
    o.add(ink(new THREE.CylinderGeometry(0.006, 0.006, yc + 0.06, 8).translate(0, (yc + 0.06) / 2, 0), '#adb5bd'));
    const r = new THREE.Group(); r.position.y = yc; o.add(r); const m = ink(geo, color, { thresh: 30 }); r.add(m);
    const mark = ink(new THREE.BoxGeometry(0.03, 0.03, 0.012), '#e03131', { edges: false }); mark.position.set(R, 0, 0); r.add(mark);
    const cu = curlArrow(S, R + 0.03, '#e8590c', 3.6); cu.position.y = yc + 0.04; o.add(cu);
    const hb = new THREE.Mesh(new THREE.CylinderGeometry(R + 0.02, R + 0.02, 0.2, 16), new THREE.MeshBasicMaterial({ visible: false })); hb.position.y = yc; o.add(hb);
    const lb = label('', { size: 0.027 }); lb.position.y = yc + 0.12; o.add(lb); return { o, r, lb, hb }; };
  const ring = mk(new THREE.TorusGeometry(R, 0.016, 12, 48).rotateX(Math.PI / 2), '#ffc078', -0.27, 0.06);
  const disk = mk(new THREE.CylinderGeometry(R, R, 0.03, 48), '#a5d8ff', 0.0, 0.06);
  const ball = mk(new THREE.SphereGeometry(R, 32, 20), '#b2f2bb', 0.27, 0.11);
  const items = [[ring, 'حلقة: I = MR²', 1], [disk, 'قرص: I = ½MR²', 2], [ball, 'كرة: I = ⅖MR²', 2.5]];
  items.forEach(([it, t]) => it.lb.setText(t));
  const lab = label('العزم نفسه τ على كل جسم (M و R متساويان)', { size: 0.03, color: '#c2410c' }); lab.position.set(0, 0.36, Z - 0.1); g.add(lab);
  const spin = (k) => { const [it, t, a] = items[k]; glow(it.r, '#f08c00', 0.7); it.r.rotation.y = 0; const o = { t: 0 };
    gsap.to(o, { t: 2.5, duration: S.reduced ? 0.001 : 2.5, ease: 'none', onUpdate: () => { it.r.rotation.y = 0.5 * a * o.t * o.t; }, onComplete: () => { glow(it.r, null, 0); it.lb.setText(`${t} · α ∝ ${a === 1 ? '1' : a === 2 ? '2' : '2.5'}`); } }); };
  return {
    group: g,
    targets: items.map(([it], k) => ({ obj: it.r, hit: [it.hb], hint: V(it.o.position.x, 0, Z + 0.16), act: () => spin(k) })),
    print(x, { P, inkText }) {
      inkText(x, 'I = Σ m r²  ،  I = m r² لجسيم نقطي', ...P(0.04, 0.44), { size: 34, color: '#c2410c', weight: 600 });
      inkText(x, 'الجدول 1 ص 150: حلقة MR² · أسطوانة مصمتة ½MR² · كرة مصمتة ⅖MR²', ...P(0.04, 0.52), { size: 22 });
      inkText(x, 'كلما ابتعدت الكتلة عن المحور كبر I وقلّ التعجيل الزاوي', ...P(0.04, 0.59), { size: 22, color: '#6b6155' });
    },
    notes: [],
  };
};

/* ---------- 7-13 Rolling ---------- */
SCENES.rolling = (S) => {
  const { THREE, V, gsap, ink, glow, label, jar } = S;
  const g = new THREE.Group(), th = 0.26, L = 0.66, X0 = -0.4, Zc = -0.02, D = 0.24, r = 0.035;
  const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(L * Math.cos(th), 0); sh.lineTo(0, L * Math.sin(th)); sh.closePath();
  const wedge = ink(new THREE.ExtrudeGeometry(sh, { depth: D, bevelEnabled: false }).translate(0, 0, -D / 2), '#e9dfca', { thresh: 20 }); wedge.position.set(X0, 0, Zc); g.add(wedge);
  const top = V(X0, L * Math.sin(th), Zc), dirv = V(Math.cos(th), -Math.sin(th), 0), nrm = V(Math.sin(th), Math.cos(th), 0);
  const ball = ink(new THREE.SphereGeometry(r, 24, 16), '#ffc9c9', { thresh: 60 }); g.add(ball);
  const stripe = ink(new THREE.TorusGeometry(r * 1.01, 0.004, 6, 32), '#c92a2a', { edges: false }); ball.add(stripe);
  const cube = block(S, 0.06, 0.06, 0.06, '#d0ebff'); g.add(cube);
  const zb = Zc - 0.06, zc = Zc + 0.06;
  const place = (sb, sc2) => { ball.position.copy(top).addScaledVector(dirv, 0.03 + sb).addScaledVector(nrm, r).setZ(zb); ball.rotation.z = -(sb) / r;
    cube.position.copy(top).addScaledVector(dirv, 0.04 + sc2).setZ(zc); cube.rotation.z = -th; };
  place(0, 0);
  const jT = jar({ max: 0.33, color: '#e8590c', name: 'انتقالية', unit: 'J', digits: 3 }), jR = jar({ max: 0.33, color: '#7048e8', name: 'دورانية', unit: 'J', digits: 3 });
  jT.position.set(0.18, 0, -0.33); jR.position.set(0.36, 0, -0.33); g.add(jT, jR);
  const lab = label('', { size: 0.03, color: '#c2410c' }); lab.position.set(0, 0.36, Zc); g.add(lab);
  let busy = false; const span = L - 0.12;
  const race = () => { if (busy) return; busy = true; const o = { t: 0 }, Tc = 1.6, Tb = Tc * Math.sqrt(7 / 5);
    gsap.to(o, { t: Tb, duration: S.reduced ? 0.001 : Tb, ease: 'none', onUpdate: () => { const sb = span * Math.min(1, (o.t / Tb) ** 2), scc = span * Math.min(1, (o.t / Tc) ** 2); place(sb, scc); const f = (o.t / Tb) ** 2; jT.set(0.225 * Math.min(1, f), 0.05); jR.set(0.09 * Math.min(1, f), 0.05); },
      onComplete: () => { lab.setText('المكعب الأملس وصل أولاً: طاقته كلها انتقالية'); jT.set(0.225, 0.2, 'انتقالية 0.225 J'); jR.set(0.09, 0.2, 'دورانية 0.09 J'); S.sfx.good(); setTimeout(() => { place(0, 0); busy = false; }, 1800); } }); };
  return {
    group: g,
    targets: [
      { obj: ball, hint: V(X0 + 0.05, 0, zb - 0.1), act: () => { lab.setText('الكرة تتدحرج: انتقال + دوران'); race(); } },
      { obj: cube, hint: V(X0 + 0.05, 0, zc + 0.12), act: () => { lab.setText('المكعب الأملس ينزلق دون دوران'); race(); } },
      { obj: jR, hit: jR.hit, hint: V(0.36, 0, -0.22), act: () => { glow(jR.hit[0], '#7048e8', 0.6); jR.set(0.09, 0.3, '½Iω² = ½ × 0.0008 × 15² = 0.09 J'); } },
    ],
    print(x, { P, inkText }) {
      inkText(x, 'KE = ½ m υ² + ½ I ω²  ،  υ = r ω', ...P(0.04, 0.44), { size: 34, color: '#c2410c', weight: 600 });
      inkText(x, 'مثال 4: m = 0.2 kg ، r = 0.1 m ، υ = 1.5 m/s ⇒ KE = 0.225 + 0.09 = 0.315 J', ...P(0.04, 0.52), { size: 21 });
      inkText(x, 'الجرّتان تعرضان قيم المثال 4 · المستوى المائل للمقارنة النوعية', ...P(0.04, 0.59), { size: 21, color: '#6b6155' });
    },
    notes: [],
  };
};

/* ---------- 7-14 Torque and angular acceleration ---------- */
SCENES.torqueI = (S) => {
  const { THREE, V, gsap, ink, glow, arrow, label, jar } = S;
  const g = new THREE.Group(), C = V(-0.1, 0, -0.04), R = 0.13;
  const ax = ink(new THREE.CylinderGeometry(0.008, 0.008, 0.2, 10).translate(0, 0.1, 0), '#adb5bd'); ax.position.copy(C); g.add(ax);
  const rot = new THREE.Group(); rot.position.copy(C).setY(0.02); g.add(rot);
  let cyl = null; const mkCyl = (heavy) => { if (cyl) { rot.remove(cyl); } cyl = ink(new THREE.CylinderGeometry(R, R, heavy ? 0.12 : 0.06, 48).translate(0, heavy ? 0.06 : 0.03, 0), heavy ? '#ffa94d' : '#ffd8a8', { thresh: 20 }); rot.add(cyl);
    const m = ink(new THREE.BoxGeometry(0.02, heavy ? 0.122 : 0.062, 0.02).translate(R, heavy ? 0.061 : 0.031, 0), '#c92a2a', { edges: false }); cyl.add(m); };
  mkCyl(false);
  const hb = new THREE.Mesh(new THREE.CylinderGeometry(R, R, 0.14, 24), new THREE.MeshBasicMaterial({ visible: false })); hb.position.copy(C).setY(0.09); g.add(hb);
  const rope = ink(new THREE.CylinderGeometry(0.003, 0.003, 1, 6).rotateZ(-Math.PI / 2).translate(0.5, 0, 0), '#5c4a32', { edges: false }); g.add(rope);
  const handle = ink(new THREE.CylinderGeometry(0.008, 0.008, 0.06, 10).rotateX(Math.PI / 2), '#868e96'); g.add(handle);
  const Fa = arrow('#e03131', 0.008); g.add(Fa); glow(Fa, '#e03131', 1, 0);
  const tF = token(S, '2F', '#e03131', V(0.36, 0, 0.27)), tI = token(S, 'I', '#e8590c', V(-0.36, 0, 0.27)); g.add(tF, tI);
  const J = jar({ max: 220, color: '#7048e8', name: 'α =', unit: 'rad/s²' }); J.position.set(0.36, 0, -0.3); g.add(J);
  const lab = label('', { size: 0.03, color: '#c2410c' }); lab.position.set(0, 0.34, C.z - 0.12); g.add(lab);
  let F = 10, heavy = false, busy = false; const Y = 0.05;
  const I = () => (heavy ? 0.04 : 0.02), al = () => (0.2 * F) / I();
  const setRope = (pull) => { const a = C.clone().add(V(0, Y, R)), b = a.clone().add(V(0.25 + pull, 0, 0)); rope.position.copy(a); rope.scale.x = b.x - a.x; handle.position.copy(b); Fa.point(b, b.clone().add(V(0.004 * F, 0, 0))); };
  const txt = () => { lab.setText(`τ = rF = 0.2 × ${F} = ${0.2 * F} N·m · I = ${I()} kg·m² ⇒ α = ${al()} rad/s²`); J.set(al()); };
  setRope(0); txt();
  const pull = () => { if (busy) return; busy = true; const o = { t: 0 }, a = al() / 100;
    gsap.to(o, { t: 1.5, duration: S.reduced ? 0.001 : 1.5, ease: 'none', onUpdate: () => { const th = 0.5 * a * 2.2 * o.t * o.t; rot.rotation.y = -th; setRope(Math.min(0.16, th * R * 0.25)); }, onComplete: () => setTimeout(() => { setRope(0); busy = false; }, 900) }); };
  return {
    group: g,
    targets: [
      { obj: handle, hit: [handle, rope, hb], hint: C.clone().add(V(0.3, 0, R + 0.06)), act: () => { txt(); pull(); } },
      { obj: tF, hint: tF.position.clone(), act: () => { F = F === 10 ? 20 : 10; glow(tF, '#e03131', F === 20 ? 0.6 : 0); txt(); setRope(0); pull(); } },
      { obj: tI, hint: tI.position.clone(), act: () => { heavy = !heavy; mkCyl(heavy); glow(tI, '#e8590c', heavy ? 0.6 : 0); txt(); pull(); } },
    ],
    print(x, { P, inkText }) {
      inkText(x, 'Στ = I α', ...P(0.04, 0.44), { size: 42, color: '#c2410c', weight: 600 });
      inkText(x, 'مثال 5: m = 1 kg ، r = 0.2 m ، F = 10 N ⇒ α = 100 rad/s² ، ω(5 s) = 500 rad/s', ...P(0.04, 0.52), { size: 21 });
      inkText(x, 'الأسطوانة الأثقل (2 kg) قيمة توضيحية: I يتضاعف و α ينتصف', ...P(0.04, 0.59), { size: 21, color: '#6b6155' });
    },
    notes: [],
  };
};

/* ---------- 7-15 Rotational work and power ---------- */
SCENES.rotwork = (S) => {
  const { THREE, V, gsap, ink, glow, arrow, label, jar } = S;
  const g = new THREE.Group(), C = V(-0.2, 0, -0.06), R = 0.11;
  const ax = ink(new THREE.CylinderGeometry(0.008, 0.008, 0.12, 10).translate(0, 0.06, 0), '#adb5bd'); ax.position.copy(C); g.add(ax);
  const pul = new THREE.Group(); pul.position.copy(C).setY(0.02); g.add(pul);
  pul.add(ink(new THREE.CylinderGeometry(R, R, 0.05, 40).translate(0, 0.025, 0), '#e9c99a', { thresh: 20 }));
  pul.add(ink(new THREE.BoxGeometry(0.02, 0.052, 0.02).translate(R, 0.026, 0), '#c92a2a', { edges: false }));
  const rope = ink(new THREE.CylinderGeometry(0.003, 0.003, 1, 6).rotateZ(-Math.PI / 2).translate(0.5, 0, 0), '#5c4a32', { edges: false }); g.add(rope);
  const handle = ink(new THREE.CylinderGeometry(0.008, 0.008, 0.06, 10).rotateX(Math.PI / 2), '#868e96'); g.add(handle);
  const Fa = arrow('#e03131', 0.008); g.add(Fa); glow(Fa, '#e03131', 1, 0);
  const setRope = (d) => { const a = C.clone().add(V(0, 0.045, R)), b = a.clone().add(V(0.12 + d, 0, 0)); rope.position.copy(a); rope.scale.x = b.x - a.x; handle.position.copy(b); Fa.point(b, b.clone().add(V(0.06, 0, 0))); };
  setRope(0);
  const motor = new THREE.Group(); motor.position.set(0.2, 0, 0.16); g.add(motor);
  motor.add(block(S, 0.1, 0.08, 0.08, '#ced4da'));
  const shaft = ink(new THREE.CylinderGeometry(0.008, 0.008, 0.08, 10).rotateZ(Math.PI / 2).translate(-0.09, 0.04, 0), '#868e96'); motor.add(shaft);
  const fly = new THREE.Group(); fly.position.set(-0.14, 0.04, 0); motor.add(fly);
  fly.add(ink(new THREE.CylinderGeometry(0.06, 0.06, 0.02, 32).rotateZ(Math.PI / 2), '#b2f2bb', { thresh: 20 }));
  fly.add(ink(new THREE.BoxGeometry(0.022, 0.05, 0.012).translate(0, 0.03, 0), '#2b8a3e', { edges: false }));
  const ctr = token(S, 'rev', '#5f3dc4', V(-0.35, 0, 0.27)); g.add(ctr);
  const jW = jar({ max: 7, color: '#e8590c', name: 'W =', unit: 'J', digits: 2 }), jP = jar({ max: 1.8e5, color: '#2b8a3e', name: 'P', unit: 'W' });
  jW.position.set(0.2, 0, -0.3); jP.position.set(0.38, 0, -0.3); g.add(jW, jP);
  const lab = label('', { size: 0.03, color: '#c2410c' }); lab.position.set(0, 0.34, -0.15); g.add(lab);
  let busy = false, on = false;
  return {
    group: g,
    targets: [
      { obj: handle, hit: [handle, rope, pul.children[0]], hint: C.clone().add(V(0.15, 0, R + 0.06)), act: () => { if (busy) return; busy = true; const o = { th: 0 };
        gsap.to(o, { th: 2 * Math.PI, duration: S.reduced ? 0.001 : 2.4, ease: 'power1.in', onUpdate: () => { pul.rotation.y = -o.th; setRope(Math.min(0.2, o.th * 0.03)); jW.set(o.th, 0.05, `W = τθ = 1 × ${o.th.toFixed(2)} J`); },
          onComplete: () => { lab.setText('F = 5 N ، r = 0.2 m ⇒ τ = 1 N·m ؛ دورة θ = 2π ⇒ W = 6.28 J'); setTimeout(() => { setRope(0); busy = false; }, 1200); } }); } },
      { obj: motor, hint: V(0.2, 0, 0.3), act: () => { on = !on; glow(motor, '#2b8a3e', on ? 0.5 : 0); jP.set(on ? 1.72e5 : 0, 0.8, on ? 'P = 1.72 × 10⁵ W' : 'P 0 W'); lab.setText(on ? 'P = τ ω ⇒ τ = P / ω ≈ 3286 N·m' : ''); } },
      { obj: ctr, hint: ctr.position.clone(), act: () => { lab.setText('ω = 500 rev/min × 2π / 60 ≈ 52.4 rad/s'); glow(ctr, '#5f3dc4', 0.6); } },
    ],
    update(dt) { if (on) fly.rotation.x += dt * 6; },
    print(x, { P, inkText }) {
      inkText(x, 'W = τ θ = ½ I (ω_f² − ω_i²)  ،  P = τ ω_avg', ...P(0.04, 0.44), { size: 32, color: '#c2410c', weight: 600 });
      inkText(x, 'مثال 6: P = 1.72 × 10⁵ W ، 500 rev/min ⇒ τ ≈ 3286 N·m', ...P(0.04, 0.52), { size: 23 });
      inkText(x, 'البكرة: F = 5 N و r = 0.2 m قيم توضيحية', ...P(0.04, 0.59), { size: 22, color: '#6b6155' });
    },
    notes: [],
  };
};

/* ---------- 7-16, 7-17 Angular momentum ---------- */
SCENES.angmom = (S) => {
  const { THREE, V, gsap, ink, glow, arrow, label, jar } = S;
  const g = new THREE.Group(), C = V(-0.1, 0, -0.04);
  const plate = flatDisk(S, 0.16, '#e9eef3', 0.02); plate.position.copy(C); g.add(plate);
  const sk = new THREE.Group(); sk.position.copy(C).setY(0.02); g.add(sk);
  sk.add(ink(new THREE.CylinderGeometry(0.025, 0.03, 0.17, 16).translate(0, 0.085, 0), '#eebefa', { thresh: 30 }));
  const hd = ink(new THREE.SphereGeometry(0.025, 16, 12), '#ffe8cc', { thresh: 60 }); hd.position.y = 0.2; sk.add(hd);
  const arms = [1, -1].map((s) => { const p = new THREE.Group(); p.position.set(s * 0.025, 0.15, 0); sk.add(p); const a = ink(new THREE.CylinderGeometry(0.008, 0.008, 0.12, 8).translate(0, -0.06, 0), '#ffd8a8'); p.add(a); p.rotation.z = s * Math.PI / 2; p.userData.s = s; return p; });
  const hb = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.24, 12), new THREE.MeshBasicMaterial({ visible: false })); hb.position.copy(C).setY(0.12); g.add(hb);
  const La = arrow('#7048e8', 0.01); g.add(La); glow(La, '#7048e8', 1, 0); const p0 = C.clone().setY(0.25); La.point(p0, p0.clone().setY(0.36));
  const wh = new THREE.Group(); wh.position.set(0.27, 0.12, 0.1); g.add(wh);
  const wr = new THREE.Group(); wh.add(wr); wr.rotation.z = Math.PI / 2;
  wr.add(ink(new THREE.TorusGeometry(0.07, 0.008, 8, 40), '#495057', { thresh: 30 }));
  for (let i = 0; i < 4; i++) { const s = ink(new THREE.BoxGeometry(0.14, 0.003, 0.003), '#adb5bd', { edges: false }); s.rotation.z = i * Math.PI / 4; wr.add(s); }
  wh.add(ink(new THREE.CylinderGeometry(0.005, 0.005, 0.2, 8).rotateZ(Math.PI / 2), '#868e96'));
  const st = block(S, 0.014, 0.12, 0.014, '#ced4da'); st.position.set(0.27, 0, 0.1); g.add(st);
  const Lw = arrow('#7048e8', 0.008); g.add(Lw); glow(Lw, '#7048e8', 1, 0); Lw.visible = false;
  const jI = jar({ max: 2.2, color: '#e8590c', name: 'I', unit: '', digits: 1 }), jw = jar({ max: 4.4, color: '#1c7ed6', name: 'ω', unit: 'rev/s', digits: 0 });
  jI.position.set(0.18, 0, -0.32); jw.position.set(0.36, 0, -0.32); g.add(jI, jw);
  const lab = label('', { size: 0.03, color: '#5f3dc4' }); lab.position.set(C.x, 0.44, C.z); g.add(lab);
  let run = false, tuck = false, w = 2, wrun = false;
  const txt = () => { const I = tuck ? 1 : 2; lab.setText(`L = Iω = ${I} × ${w} = 4 (ثابت)`); jI.set(I, 0.6, `I = ${I} I₀`); jw.set(w, 0.6, `ω = ${w} rev/s`); };
  txt();
  return {
    group: g,
    targets: [
      { obj: sk, hit: [hb, plate.children[0]], hint: C.clone().add(V(0, 0, 0.2)), act: () => { run = !run; } },
      { obj: arms[0], hit: [arms[0].children[0], arms[1].children[0]], hint: C.clone().add(V(0.15, 0, 0.1)), act: () => { tuck = !tuck; w = tuck ? 4 : 2; run = true; arms.forEach((p) => gsap.to(p.rotation, { z: p.userData.s * (tuck ? 0.15 : Math.PI / 2), duration: 0.6 })); txt(); } },
      { obj: wr, hit: [wr.children[0]], hint: V(0.27, 0, 0.24), act: () => { wrun = !wrun; Lw.visible = wrun; const a = V(0.38, 0.12, 0.1); Lw.point(a, a.clone().add(V(0.09, 0, 0))); } },
    ],
    update(dt) { if (run) sk.rotation.y += dt * w * 1.2; if (wrun) wr.rotation.x += dt * 8; },
    print(x, { P, inkText }) {
      inkText(x, 'L = I ω  ،  I₁ ω₁ = I₂ ω₂', ...P(0.04, 0.44), { size: 38, color: '#c2410c', weight: 600 });
      inkText(x, 'ضم الذراعين يقلل I إلى النصف فيتضاعف ω (مثال توضيحي)', ...P(0.04, 0.52), { size: 23 });
      inkText(x, 'يُحفظ الزخم الزاوي عند انعدام محصلة العزوم الخارجية', ...P(0.04, 0.59), { size: 22, color: '#6b6155' });
    },
    notes: [],
  };
};

/* ================= Chapter 8 ================= */
function beadRope(S, N, xa, xb, y, z, color = '#f2e4c6', r = 0.009) {
  const { THREE, V, ink } = S;
  const g = new THREE.Group(), beads = [], xs = [];
  for (let i = 0; i < N; i++) { const x = xa + ((xb - xa) * i) / (N - 1); xs.push(x); const b = ink(new THREE.SphereGeometry(r, 10, 8), color, { edges: false }); b.position.set(x, y, z); g.add(b); beads.push(b); }
  const geo = new THREE.BufferGeometry().setFromPoints(beads.map((b) => b.position)); const line = new THREE.Line(geo, S.LINE_MAT); g.add(line);
  const hit = new THREE.Mesh(new THREE.BoxGeometry(xb - xa, 0.12, 0.06), new THREE.MeshBasicMaterial({ visible: false })); hit.position.set((xa + xb) / 2, y, z); g.add(hit);
  g.set = (fn) => { const p = geo.attributes.position; beads.forEach((b, i) => { const d = fn(i, xs[i]); b.position.y = y + d; p.setY(i, y + d); }); p.needsUpdate = true; };
  g.setX = (fn) => { const p = geo.attributes.position; beads.forEach((b, i) => { const d = fn(i, xs[i]); b.position.x = xs[i] + d; p.setX(i, xs[i] + d); }); p.needsUpdate = true; };
  g.beads = beads; g.xs = xs; g.hit = hit; return g;
}
function ringSet(S, n, color, y = 0.006) {
  const { THREE } = S; const g = new THREE.Group(), pts = [];
  for (let i = 0; i <= 72; i++) { const a = (i / 72) * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(a), 0, Math.sin(a))); }
  const geo = new THREE.BufferGeometry().setFromPoints(pts); const rings = [];
  for (let i = 0; i < n; i++) { const l = new THREE.Line(geo, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.9 })); l.visible = false; l.position.y = y; g.add(l); rings.push(l); }
  g.setRing = (i, x, z, r, op = 0.9) => { const l = rings[i]; l.visible = r > 0.001 && op > 0.02; l.position.x = x; l.position.z = z; l.scale.setScalar(Math.max(r, 0.001)); l.material.opacity = op; };
  g.hideAll = () => rings.forEach((l) => (l.visible = false)); g.n = n; return g;
}
function springLine(S, coils = 12, rad = 0.018, axis = 'x') {
  const { THREE } = S; const n = coils * 16; const pts = [];
  for (let i = 0; i <= n; i++) { const u = i / n, a = u * coils * Math.PI * 2; pts.push(axis === 'x' ? new THREE.Vector3(u, Math.sin(a) * rad, Math.cos(a) * rad) : new THREE.Vector3(Math.sin(a) * rad, -u, Math.cos(a) * rad)); }
  const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: '#5c4a32' }));
  l.setLen = (L) => { if (axis === 'x') l.scale.x = Math.max(0.001, L); else l.scale.y = Math.max(0.001, L); }; return l;
}
function hitBox(S, w, h, d, pos) { const m = new S.THREE.Mesh(new S.THREE.BoxGeometry(w, h, d), new S.THREE.MeshBasicMaterial({ visible: false })); m.position.copy(pos); return m; }
function knobT(S, sym, pos) {
  const { THREE, ink, label } = S; const k = new THREE.Group(); k.position.copy(pos);
  k.add(ink(new THREE.CylinderGeometry(0.045, 0.05, 0.02, 24).translate(0, 0.01, 0), '#ede2cb', { thresh: 20 }));
  const ptr = ink(new THREE.BoxGeometry(0.05, 0.012, 0.012).translate(0.02, 0.026, 0), '#d9480f'); k.add(ptr);
  const l = label(sym, { size: 0.03 }); l.position.y = 0.05; k.add(l); k.ptr = ptr; return k;
}
const GAUSS = (u, w = 0.045) => Math.exp(-(u * u) / (2 * w * w));

/* ---------- 8-1, 8-2 Periodic & vibratory ---------- */
SCENES.oscill = (S) => {
  const { THREE, V, ink, glow, label } = S;
  const g = new THREE.Group(), PZ = -0.12, TOP = 0.34;
  for (const x of [-0.36, 0.14]) { const p = block(S, 0.014, TOP, 0.014, '#ced4da'); p.position.set(x, 0, PZ); g.add(p); }
  const beam = block(S, 0.52, 0.014, 0.03, '#dee2e6'); beam.position.set(-0.11, TOP, PZ); g.add(beam);
  const pv = new THREE.Group(); pv.position.set(-0.24, TOP, PZ); g.add(pv);
  pv.add(ink(new THREE.CylinderGeometry(0.0025, 0.0025, 0.22, 6).translate(0, -0.11, 0), '#5c4a32', { edges: false }));
  const bob = ink(new THREE.SphereGeometry(0.024, 18, 12), '#ffa94d', { thresh: 60 }); bob.position.y = -0.22; pv.add(bob);
  const sp = springLine(S, 10, 0.016, 'y'); sp.position.set(0.02, TOP, PZ); g.add(sp);
  const mass = block(S, 0.05, 0.05, 0.05, '#e03131'); g.add(mass);
  const XA = 0.12, XB = 0.42, ZS = 0.18;
  for (const x of [XA, XB]) { const p = block(S, 0.012, 0.09, 0.012, '#adb5bd'); p.position.set(x, 0, ZS); g.add(p); }
  const rope = beadRope(S, 22, XA, XB, 0.085, ZS, '#ffe066', 0.006); g.add(rope);
  const lab = label('اضغط أي مهتز', { size: 0.03, color: '#c2410c' }); lab.position.set(-0.08, 0.44, PZ); g.add(lab);
  const on = [false, false, false], t = [0, 0, 0], T = [1.6, 1.0, 0.25];
  const setMass = (dy) => { const y0 = TOP - 0.2 + dy; sp.setLen(TOP - y0 - 0.05); mass.position.set(0.02, y0 - 0.05, PZ); };
  setMass(0);
  const tg = (k, o) => { on[k] = !on[k]; t[k] = 0; glow(o, '#f08c00', on[k] ? 0.6 : 0); };
  return {
    group: g,
    targets: [
      { obj: bob, hint: V(-0.24, 0, PZ + 0.12), act: () => { tg(0, bob); lab.setText('البندول: T = 1.6 s (توضيحي)'); } },
      { obj: mass, hint: V(0.02, 0, PZ + 0.12), act: () => { tg(1, mass); lab.setText('النابض: حركة ذهاب وإياب حول موضع الاستقرار'); } },
      { obj: rope, hit: [rope.hit], hint: V(0.27, 0, ZS + 0.1), act: () => { tg(2, rope); lab.setText('الوتر المهتز: حركة دورية سريعة تولد صوتاً'); if (on[2]) S.sfx.tone(196, 196, 1.2, 'triangle', 0.06); } },
    ],
    update(dt) {
      for (let k = 0; k < 3; k++) if (on[k]) t[k] += dt;
      pv.rotation.z = on[0] ? 0.38 * Math.sin((2 * Math.PI * t[0]) / T[0]) : 0;
      setMass(on[1] ? 0.04 * Math.sin((2 * Math.PI * t[1]) / T[1]) : 0);
      const a = on[2] ? 0.025 * Math.sin((2 * Math.PI * t[2]) / T[2]) * Math.exp(-t[2] * 0.4) : 0;
      rope.set((i, x) => a * Math.sin((Math.PI * (x - XA)) / (XB - XA)));
      if (on[0]) { const n = Math.floor(t[0] / T[0]); if (n >= 1) lab.setText(`البندول: ${n} اهتزازة في ${(n * T[0]).toFixed(1)} s ⇒ T = ${T[0]} s`); }
    },
    print(x, { P, inkText }) {
      inkText(x, 'T = زمن عدة اهتزازات ÷ عددها  ،  f = 1 / T', ...P(0.04, 0.44), { size: 31, color: '#c2410c', weight: 600 });
      inkText(x, 'بندول الساعة، والثقل المعلق بنابض، وأوتار الآلات الموسيقية', ...P(0.04, 0.52), { size: 23 });
      inkText(x, 'الاهتزاز يخمد تدريجياً ما لم يُزوَّد بالطاقة', ...P(0.04, 0.59), { size: 22, color: '#6b6155' });
    },
    notes: [],
  };
};

/* ---------- 8-3 SHM spring–mass ---------- */
SCENES.shm = (S) => {
  const { THREE, V, ink, glow, arrow, label, dots } = S;
  const g = new THREE.Group(), Z = -0.12, X0 = 0.0, Y = 0.035, A = 0.1;
  const table = block(S, 0.8, 0.008, 0.12, '#e2dccf'); table.position.set(0, 0, Z); g.add(table);
  const wall = block(S, 0.02, 0.12, 0.12, '#ced4da'); wall.position.set(-0.36, 0, Z); g.add(wall);
  const sp = springLine(S, 14, 0.018); sp.position.set(-0.35, Y, Z); g.add(sp);
  const m = block(S, 0.06, 0.055, 0.06, '#74c0fc'); g.add(m);
  const pen = ink(new THREE.CylinderGeometry(0.004, 0.004, 0.08, 8).translate(0, -0.04, 0), '#212529'); g.add(pen);
  const eq = dashed(S, V(X0, 0.01, Z - 0.08), V(X0, 0.01, 0.34)); g.add(eq);
  const paper = block(S, 0.34, 0.004, 0.3, '#fbf6ea'); paper.position.set(X0, 0, 0.12); g.add(paper);
  const tr = dots(70, '#c2255c', 0.005); g.add(tr);
  const F = arrow('#e03131', 0.008); g.add(F); glow(F, '#e03131', 1, 0);
  const tk = token(S, 'k', '#1c7ed6', V(0.35, 0, -0.32)); g.add(tk);
  const lab = label('', { size: 0.03, color: '#c2410c' }); lab.position.set(0, 0.22, Z); g.add(lab);
  let run = false, t = 0, k = 1, trace = false;
  const T = () => 1.6 / Math.sqrt(k), xAt = (tt) => A * Math.cos((2 * Math.PI * tt) / T());
  const place = () => { const x = run ? xAt(t) : 0; m.position.set(X0 + x, 0.008, Z); sp.setLen(X0 + x - 0.03 + 0.35); pen.position.set(X0 + x, 0.09, Z + 0.04);
    const p = V(X0 + x, 0.075, Z); F.visible = run && Math.abs(x) > 0.005; F.point(p, p.clone().add(V(-x * 0.9 * k, 0, 0)));
    lab.setText(`x = ${(x * 0.5).toFixed(3)} m · F = −kx = ${(-200 * k * x * 0.5).toFixed(1)} N · T = ${(T()).toFixed(2)} s`);
    for (let i = 0; i < 70; i++) { const tt = t - i * 0.05; const ok = trace && run && tt >= 0 && Z + 0.04 + i * 0.0045 < 0.27; tr.setAt(i, X0 + (ok ? xAt(tt) : 0), 0.008, Z + 0.04 + i * 0.0045, ok ? 1 : 0); } tr.commit(); };
  place();
  return {
    group: g,
    targets: [
      { obj: m, hint: V(X0, 0, Z - 0.1), act: () => { run = !run; t = 0; } },
      { obj: paper, hint: V(X0 + 0.22, 0, 0.2), act: () => { trace = !trace; run = true; glow(paper, '#c2255c', trace ? 0.3 : 0); } },
      { obj: tk, hint: tk.position.clone(), act: () => { k = k === 1 ? 2 : 1; glow(tk, '#1c7ed6', k === 2 ? 0.6 : 0); t = 0; run = true; } },
    ],
    update(dt) { if (run) t += dt; place(); },
    print(x, { P, inkText }) {
      inkText(x, 'F_res = −k x', ...P(0.04, 0.44), { size: 40, color: '#c2410c', weight: 600 });
      inkText(x, 'k = 200 N/m ، A = 0.05 m (قيم توضيحية) · النابض الأصلب 400 N/m', ...P(0.04, 0.52), { size: 22 });
      inkText(x, 'القلم المثبت بالكتلة يرسم منحنى جيبياً (الشكل 4 ص 160)', ...P(0.04, 0.59), { size: 22, color: '#6b6155' });
    },
    notes: [],
  };
};

/* ---------- 8-4 SHM as projection of circular motion ---------- */
SCENES.shmcircle = (S) => {
  const { THREE, V, ink, glow, label } = S;
  const g = new THREE.Group(), C = V(-0.12, 0, -0.14), R = 0.15, Y = 0.04, ZS = 0.16;
  const d = flatDisk(S, R + 0.02, '#e9eef3', 0.02); d.position.copy(C); g.add(d);
  const ball = ink(new THREE.SphereGeometry(0.018, 14, 10), '#f03e3e', { thresh: 60 }); g.add(ball);
  const scr = block(S, 0.42, 0.006, 0.05, '#f8f0dd'); scr.position.set(C.x, 0, ZS); g.add(scr);
  const sh = new THREE.Mesh(new THREE.CircleGeometry(0.016, 20).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#343a40', transparent: true, opacity: 0.75 })); sh.position.set(C.x, 0.008, ZS); g.add(sh);
  const lamp = new THREE.Group(); lamp.position.set(C.x, 0, C.z - R - 0.1); g.add(lamp);
  lamp.add(block(S, 0.36, 0.05, 0.03, '#fff3bf'));
  const ray = dashed(S, V(0, 0, 0), V(0, 0, 1), '#f08c00'); g.add(ray); ray.visible = false;
  const pan = panel(S, 0.3, 0.26, V(0.27, 0, -0.2), (c, W, H, th) => {
    const A2 = axes2d(c, W, H, { xl: 'θ', yl: 'x' }); const mid = A2.oy - A2.h / 2;
    c.strokeStyle = '#adb5bd'; c.lineWidth = 2; c.beginPath(); c.moveTo(A2.ox, mid); c.lineTo(A2.ox + A2.w, mid); c.stroke();
    c.strokeStyle = '#c2255c'; c.lineWidth = 5; c.beginPath(); const n = Math.floor(200 * Math.min(1, th / (4 * Math.PI)));
    for (let i = 0; i <= n; i++) { const a = (i / 200) * 4 * Math.PI; const px = A2.ox + (a / (4 * Math.PI)) * A2.w, py = mid - Math.sin(a) * A2.h * 0.42; i ? c.lineTo(px, py) : c.moveTo(px, py); } c.stroke();
  });
  pan.redraw(0); g.add(pan);
  const lab = label('', { size: 0.03, color: '#c2410c' }); lab.position.set(C.x, 0.16, C.z - R - 0.06); g.add(lab);
  let run = false, th = 0, rays = false, plot = false, acc = 0;
  const place = () => { const x = R * Math.sin(th), z = -R * Math.cos(th); ball.position.set(C.x + x, Y, C.z + z); sh.position.x = C.x + x; ray.visible = rays; ray.setEnds(ball.position, V(C.x + x, 0.01, ZS)); d.rotation.y = -th;
    const deg = ((th * 180 / Math.PI) % 360); lab.setText(`θ = ${deg.toFixed(0)}° · x = A sinθ = ${(10 * Math.sin(th)).toFixed(1)} cm (A = 10 cm)`); };
  place();
  return {
    group: g,
    targets: [
      { obj: d, hint: C.clone().add(V(0, 0, R + 0.06)), act: () => { run = !run; } },
      { obj: lamp, hint: lamp.position.clone().add(V(0.22, 0, 0)), act: () => { rays = !rays; glow(lamp, '#fab005', rays ? 0.7 : 0); place(); } },
      { obj: pan, hit: [pan.board], hint: V(0.27, 0, -0.08), act: () => { plot = true; th = 0; run = true; pan.redraw(0); } },
    ],
    update(dt) { if (!run) return; th += dt * 1.4; if (plot) { acc += dt; if (acc > 0.08) { acc = 0; pan.redraw(th); } if (th > 4 * Math.PI) { plot = false; pan.redraw(4 * Math.PI); } } place(); },
    print(x, { P, inkText }) {
      inkText(x, 'x = A sinθ', ...P(0.04, 0.44), { size: 40, color: '#c2410c', weight: 600 });
      inkText(x, 'الظل على الشاشة يتحرك حركة توافقية بسيطة (الأشكال 5–7 ص 161)', ...P(0.04, 0.52), { size: 22 });
      inkText(x, 'A نصف قطر الدائرة ، θ الإزاحة الزاوية', ...P(0.04, 0.59), { size: 22, color: '#6b6155' });
    },
    notes: [],
  };
};

/* ---------- 8-5 Simple pendulum ---------- */
SCENES.pendulum = (S) => {
  const { THREE, V, ink, glow, arrow, label } = S;
  const g = new THREE.Group(), PV = V(-0.05, 0.44, -0.1);
  const st = block(S, 0.016, PV.y + 0.01, 0.016, '#ced4da'); st.position.set(-0.3, 0, PV.z); g.add(st);
  const arm = block(S, 0.27, 0.014, 0.02, '#dee2e6'); arm.position.set(-0.17, PV.y, PV.z); g.add(arm);
  g.add(Object.assign(block(S, 0.14, 0.012, 0.12, '#e9dfca'), {}).translateX(-0.3).translateZ(PV.z));
  const pv = new THREE.Group(); pv.position.copy(PV); g.add(pv);
  const str = ink(new THREE.CylinderGeometry(0.0025, 0.0025, 1, 6).translate(0, -0.5, 0), '#5c4a32', { edges: false }); pv.add(str);
  const bob = ink(new THREE.SphereGeometry(0.026, 18, 12), '#ffa94d', { thresh: 60 }); pv.add(bob);
  const Fw = arrow('#495057', 0.006), Ft = arrow('#e03131', 0.007), Fn = arrow('#1c7ed6', 0.006); [Fw, Ft, Fn].forEach((a, i) => { g.add(a); glow(a, ['#495057', '#e03131', '#1c7ed6'][i], 1, 0); a.visible = false; });
  const kn = knobT(S, 'L', V(0.33, 0, 0.26)); g.add(kn); const tF = token(S, 'F', '#e03131', V(-0.33, 0, 0.26)); g.add(tF);
  const lab = label('', { size: 0.03, color: '#c2410c' }); lab.position.set(0.05, 0.52, PV.z); g.add(lab);
  let run = false, t = 0, Lm = 1, showF = false; const th0 = 0.3;
  const Lv = () => (Lm === 1 ? 0.36 : 0.09), T = () => 2 * Math.PI * Math.sqrt(Lm / 9.8);
  const place = () => { const L = Lv(); str.scale.y = L; bob.position.y = -L; const th = run ? th0 * Math.cos((2 * Math.PI * t) / T()) : 0; pv.rotation.z = th;
    const b = PV.clone().add(V(Math.sin(th) * L, -Math.cos(th) * L, 0)); const k = 0.12;
    [Fw, Ft, Fn].forEach((a) => (a.visible = showF)); Fw.point(b, b.clone().add(V(0, -k, 0)));
    Ft.point(b, b.clone().add(V(-Math.cos(th), -Math.sin(th), 0).multiplyScalar(k * Math.sin(th) * 2.2))); Fn.point(b, b.clone().add(V(Math.sin(th), -Math.cos(th), 0).multiplyScalar(k * Math.cos(th))));
    lab.setText(`L = ${Lm} m ⇒ T = 2π√(L/g) = ${T().toFixed(2)} s`); };
  place();
  return {
    group: g,
    targets: [
      { obj: bob, hit: [bob, str], hint: V(-0.05, 0, PV.z + 0.12), act: () => { run = !run; t = 0; } },
      { obj: kn, hint: kn.position.clone(), act: () => { Lm = Lm === 1 ? 0.25 : 1; S.gsap.to(kn.ptr.rotation, { y: Lm === 1 ? 0 : -1.2, duration: 0.4 }); t = 0; run = true; } },
      { obj: tF, hint: tF.position.clone(), act: () => { showF = !showF; glow(tF, '#e03131', showF ? 0.6 : 0); } },
    ],
    update(dt) { if (run) t += dt; place(); },
    print(x, { P, inkText }) {
      inkText(x, 'F_res = −m g sinθ  ،  T = 2π √(L / g)', ...P(0.04, 0.44), { size: 33, color: '#c2410c', weight: 600 });
      inkText(x, 'مثال 1: L = 1 m ، g = 9.8 m/s² ⇒ T ≈ 2 s', ...P(0.04, 0.52), { size: 24 });
      inkText(x, 'mg sinθ (أحمر) · mg cosθ (أزرق) · زاوية الرسم مكبرة للإيضاح، والشرط θ ≤ 5°', ...P(0.04, 0.59), { size: 20, color: '#6b6155' });
    },
    notes: [],
  };
};

/* ---------- 8-6 Damped ---------- */
SCENES.damped = (S) => {
  const { THREE, V, ink, glow, label } = S;
  const g = new THREE.Group(), X = -0.2, Z = -0.08, TOP = 0.42;
  const st = block(S, 0.014, TOP, 0.014, '#ced4da'); st.position.set(X - 0.12, 0, Z); g.add(st);
  const arm = block(S, 0.14, 0.012, 0.02, '#dee2e6'); arm.position.set(X - 0.06, TOP, Z); g.add(arm);
  const sp = springLine(S, 10, 0.016, 'y'); sp.position.set(X, TOP, Z); g.add(sp);
  const m = block(S, 0.04, 0.04, 0.04, '#e03131'); g.add(m);
  const tankG = new THREE.CylinderGeometry(0.075, 0.075, 0.24, 32, 1, true);
  const tank = new THREE.Mesh(tankG, new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.18, side: THREE.DoubleSide, depthWrite: false })); tank.position.set(X, 0.12, Z); tank.renderOrder = 3; g.add(tank);
  const te = new THREE.LineSegments(new THREE.EdgesGeometry(tankG, 20), S.LINE_MAT); te.position.copy(tank.position); g.add(te);
  const liq = new THREE.Mesh(new THREE.CylinderGeometry(0.072, 0.072, 0.2, 32), new THREE.MeshStandardMaterial({ color: '#4dabf7', transparent: true, opacity: 0.35, depthWrite: false })); liq.position.set(X, 0.1, Z); liq.visible = false; g.add(liq);
  const hb = hitBox(S, 0.16, 0.24, 0.16, V(X, 0.12, Z)); g.add(hb);
  const push = token(S, 'دفع', '#2b8a3e', V(-0.33, 0, 0.26)); g.add(push);
  const hist = [];
  const pan = panel(S, 0.34, 0.26, V(0.2, 0, -0.18), (c, W, H) => { const A2 = axes2d(c, W, H, { xl: 't', yl: 'y' }); const mid = A2.oy - A2.h / 2;
    c.strokeStyle = '#adb5bd'; c.lineWidth = 2; c.beginPath(); c.moveTo(A2.ox, mid); c.lineTo(A2.ox + A2.w, mid); c.stroke();
    c.strokeStyle = '#1c7ed6'; c.lineWidth = 4; c.beginPath(); hist.forEach((v, i) => { const px = A2.ox + (i / 240) * A2.w, py = mid - v * A2.h * 0.45 / 0.05; i ? c.lineTo(px, py) : c.moveTo(px, py); }); c.stroke(); });
  pan.redraw(); g.add(pan);
  const lab = label('', { size: 0.03, color: '#c2410c' }); lab.position.set(X, 0.5, Z); g.add(lab);
  let run = false, t = 0, A = 0, wet = false, drive = false, acc = 0;
  const setY = (dy) => { const y0 = 0.17 + dy; sp.setLen(TOP - y0 - 0.04); m.position.set(X, y0 - 0.04, Z); };
  setY(0);
  const txt = () => lab.setText(drive ? 'دفع منتظم يعوّض الطاقة: السعة ثابتة' : wet ? 'سائل لزج: الاهتزاز يضمحل بسرعة' : 'في الهواء: اضمحلال بطيء');
  txt();
  return {
    group: g,
    targets: [
      { obj: m, hit: [m, hb], hint: V(X, 0, Z + 0.13), act: () => { run = true; A = 0.05; t = 0; hist.length = 0; } },
      { obj: tank, hit: [hb], hint: V(X + 0.1, 0, Z + 0.1), act: () => { wet = !wet; liq.visible = wet; drive = false; run = true; A = 0.05; hist.length = 0; txt(); } },
      { obj: push, hint: push.position.clone(), act: () => { drive = !drive; glow(push, '#2b8a3e', drive ? 0.6 : 0); run = true; if (A < 0.01) A = 0.02; txt(); } },
    ],
    update(dt) {
      if (!run) return; t += dt; const gam = drive ? -0.6 : wet ? 0.9 : 0.12; A = Math.min(0.05, A * Math.exp(-gam * dt)); const y = A * Math.cos(2 * Math.PI * t / 0.9); setY(y);
      acc += dt; if (acc > 0.05) { acc = 0; hist.push(y); if (hist.length > 240) hist.shift(); pan.redraw(); }
    },
    print(x, { P, inkText }) {
      inkText(x, 'الاهتزاز المضمحل: السعة تتناقص مع الزمن', ...P(0.04, 0.44), { size: 31, color: '#c2410c', weight: 600 });
      inkText(x, 'النابض في سائل لزج (الشكل 10) · دفع الأرجوحة (12) · ماصّ الصدمات (13)', ...P(0.04, 0.52), { size: 21 });
      inkText(x, 'معاملات الاضمحلال في الرسم توضيحية', ...P(0.04, 0.59), { size: 22, color: '#6b6155' });
    },
    notes: [],
  };
};

/* ---------- 8-7, 8-8 Pulses in a string ---------- */
SCENES.pulses = (S) => {
  const { THREE, V, ink, glow, label } = S;
  const g = new THREE.Group(), XA = -0.32, XB = 0.36, Y = 0.1, Z = 0.0;
  const rope = beadRope(S, 56, XA, XB, Y, Z); g.add(rope);
  const hand = ink(new THREE.BoxGeometry(0.04, 0.05, 0.05), '#ffd8a8', { thresh: 30 }); hand.position.set(XA - 0.03, Y, Z); g.add(hand);
  const wall = block(S, 0.02, 0.2, 0.1, '#ced4da'); wall.position.set(XB + 0.02, 0, Z); g.add(wall);
  const rod = ink(new THREE.CylinderGeometry(0.005, 0.005, 0.22, 8).translate(0, 0.11, 0), '#868e96'); rod.position.set(XB + 0.01, 0, Z); rod.visible = false; g.add(rod);
  const ring = ink(new THREE.TorusGeometry(0.012, 0.004, 8, 20).rotateX(Math.PI / 2), '#495057', { edges: false }); ring.position.set(XB + 0.01, Y, Z); ring.visible = false; g.add(ring);
  const tE = token(S, 'مثبت', '#c2410c', V(0.33, 0, 0.26)), tT = token(S, 'T', '#1c7ed6', V(-0.33, 0, 0.26)); g.add(tE, tT);
  const lab = label('', { size: 0.03, color: '#c2410c' }); lab.position.set(0.02, 0.3, Z); g.add(lab);
  let free = false, Tx = 1, s = null;
  const v = () => 0.3 * Math.sqrt(Tx);
  const txt = () => lab.setText(`${free ? 'طرف حر: انعكاس دون انقلاب' : 'طرف مثبت: انعكاس مقلوب (180°)'} · υ = √(T/μ) ${Tx === 2 ? '× √2' : ''}`);
  txt();
  return {
    group: g,
    targets: [
      { obj: hand, hit: [hand, rope.hit], hint: V(XA, 0, Z + 0.1), act: () => { s = XA - 0.1; } },
      { obj: tE, hint: tE.position.clone(), act: () => { free = !free; wall.visible = !free; rod.visible = free; ring.visible = free; tE.children[1].setText(free ? 'حر' : 'مثبت'); txt(); } },
      { obj: tT, hint: tT.position.clone(), act: () => { Tx = Tx === 1 ? 2 : 1; glow(tT, '#1c7ed6', Tx === 2 ? 0.6 : 0); txt(); s = XA - 0.1; } },
    ],
    update(dt) {
      if (s === null) { rope.set(() => 0); hand.position.y = Y; return; }
      s += dt * v() * (S.reduced ? 4 : 1); const h = 0.05, r = free ? 1 : -1;
      rope.set((i, x) => h * (GAUSS(x - s) + r * GAUSS(2 * XB - x - s)));
      hand.position.y = Y + h * GAUSS(XA - s); ring.position.y = Y + (free ? 2 * h * GAUSS(XB - s) : 0);
      if (s > 2 * XB - XA + 0.15) s = null;
    },
    print(x, { P, inkText }) {
      inkText(x, 'μ = m / L  ،  υ = √(T / μ)  ،  λ = υ T', ...P(0.04, 0.44), { size: 33, color: '#c2410c', weight: 600 });
      inkText(x, 'مثال 2: m = 20 g ، L = 60 cm ، υ = 30 m/s ⇒ T = 30 N', ...P(0.04, 0.52), { size: 24 });
      inkText(x, 'الطاقة تنتقل مع النبضة، والخرز يهتز في مكانه (الشكل 16 ص 165)', ...P(0.04, 0.59), { size: 21, color: '#6b6155' });
    },
    notes: [],
  };
};

/* ---------- 8-9 Superposition ---------- */
SCENES.superpos = (S) => {
  const { THREE, V, glow, label } = S;
  const g = new THREE.Group(), XA = -0.36, XB = 0.36, Y = 0.1, Z = 0.0;
  for (const x of [XA - 0.02, XB + 0.02]) { const p = block(S, 0.014, 0.16, 0.014, '#ced4da'); p.position.set(x, 0, Z); g.add(p); }
  const rope = beadRope(S, 60, XA, XB, Y, Z); g.add(rope);
  const mid = hitBox(S, 0.1, 0.2, 0.1, V(0, 0.1, Z)); g.add(mid);
  const midT = token(S, 'y₁+y₂', '#7048e8', V(0, 0, 0.22)); g.add(midT);
  const tI = token(S, '±', '#c2410c', V(0.33, 0, 0.26)); g.add(tI);
  const lab = label('y = y₁ + y₂', { size: 0.032, color: '#5f3dc4' }); lab.position.set(0, 0.3, Z); g.add(lab);
  let inv = false, s = null, hold = 0;
  const go = () => { s = 0; hold = 0; };
  return {
    group: g,
    targets: [
      { obj: rope, hit: [rope.hit], hint: V(-0.2, 0, Z + 0.1), act: go },
      { obj: tI, hint: tI.position.clone(), act: () => { inv = !inv; glow(tI, '#c2410c', inv ? 0.6 : 0); lab.setText(inv ? 'نبضتان متعاكستان: +h و −h' : 'نبضتان متماثلتان: +h و +h'); go(); } },
      { obj: midT, hit: [mid, midT.children[0]], hint: V(0.08, 0, 0.22), act: () => { s = XB - 0.0; hold = S.reduced ? 0.2 : 1.5; lab.setText(inv ? 'لحظة الالتقاء: y = h − h = 0' : 'لحظة الالتقاء: y = h + h = 2h'); } },
    ],
    update(dt) {
      if (s === null) { rope.set(() => 0); return; }
      if (hold > 0) hold -= dt; else s += dt * 0.25 * (S.reduced ? 4 : 1);
      const h = 0.04, h2 = inv ? -h : h, p1 = XA - 0.05 + s, p2 = XB + 0.05 - s;
      rope.set((i, x) => h * GAUSS(x - p1) + h2 * GAUSS(x - p2));
      if (s > 0.85) s = null;
    },
    print(x, { P, inkText }) {
      inkText(x, 'y = y₁ + y₂', ...P(0.04, 0.44), { size: 40, color: '#c2410c', weight: 600 });
      inkText(x, 'تتراكب الإزاحات لحظة الالتقاء ثم تفترق النبضتان بشكليهما الأصليين', ...P(0.04, 0.52), { size: 22 });
      inkText(x, 'الشكلان 17 و 18 ص 166–167', ...P(0.04, 0.59), { size: 22, color: '#6b6155' });
    },
    notes: [],
  };
};

/* ---------- 8-11 Types of waves ---------- */
SCENES.wavetypes = (S) => {
  const { THREE, V, ink, glow, label, dots } = S;
  const g = new THREE.Group(), N = 34, XA = -0.36, XB = 0.36, Y = 0.1, Z = -0.12;
  const geo = new THREE.TorusGeometry(0.035, 0.0035, 6, 28).rotateY(Math.PI / 2); const rings = [];
  for (let i = 0; i < N; i++) { const r = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: '#868e96', metalness: 0.3, roughness: 0.5 })); r.position.set(XA + (XB - XA) * i / (N - 1), Y, Z); g.add(r); rings.push(r); }
  const hb = hitBox(S, XB - XA, 0.12, 0.1, V(0, Y, Z)); g.add(hb);
  const water = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.1, 0.06), new THREE.MeshStandardMaterial({ color: '#74c0fc', transparent: true, opacity: 0.3, depthWrite: false })); water.position.set(0, 0.05, 0.2); g.add(water);
  const wd = dots(48, '#1864ab', 0.007); g.add(wd);
  const surf = new THREE.Line(new THREE.BufferGeometry().setFromPoints(Array.from({ length: 60 }, () => V())), new THREE.LineBasicMaterial({ color: '#1864ab' })); g.add(surf);
  const tM = token(S, '↕', '#c2410c', V(0.36, 0, -0.32)); g.add(tM);
  const lab = label('', { size: 0.03, color: '#c2410c' }); lab.position.set(0, 0.24, Z); g.add(lab);
  let run = false, lon = false, t = 0, wrun = false; const k = 2 * Math.PI / 0.24, w = 2 * Math.PI * 0.8;
  const txt = () => lab.setText(lon ? 'موجة طولية: تضاغطات وتخلخلات على امتداد الانتشار' : 'موجة مستعرضة: الاهتزاز عمودي على الانتشار');
  txt();
  const place = () => {
    rings.forEach((r, i) => { const x0 = XA + (XB - XA) * i / (N - 1), ph = k * (x0 - XA) - w * t, on = run && x0 - XA < (w / k) * t; r.position.x = x0 + (on && lon ? 0.012 * Math.sin(ph) : 0); r.position.y = Y + (on && !lon ? 0.03 * Math.sin(ph) : 0); });
    const p = surf.geometry.attributes.position;
    for (let c = 0; c < 16; c++) for (let rr = 0; rr < 3; rr++) { const x0 = -0.33 + c * 0.044, y0 = 0.09 - rr * 0.03, a = 0.012 * Math.exp(-rr * 0.8) * (wrun ? 1 : 0), ph = k * x0 * 0.6 - w * t; wd.setAt(c * 3 + rr, x0 + a * Math.cos(ph), y0 + a * Math.sin(ph), 0.2 + 0.035, 1); }
    wd.commit(); for (let i = 0; i < 60; i++) { const x0 = -0.36 + i * 0.0122, ph = k * x0 * 0.6 - w * t; p.setXYZ(i, x0, 0.1 + (wrun ? 0.012 * Math.sin(ph) : 0), 0.2 + 0.03); } p.needsUpdate = true;
  };
  place();
  return {
    group: g,
    targets: [
      { obj: hb, hint: V(XA + 0.05, 0, Z + 0.1), act: () => { run = !run; t = 0; } },
      { obj: tM, hint: tM.position.clone(), act: () => { lon = !lon; tM.children[1].setText(lon ? '↔' : '↕'); run = true; t = 0; txt(); } },
      { obj: water, hint: V(0.3, 0, 0.3), act: () => { wrun = !wrun; lab.setText('جزيئات الماء تدور في دوائر: طولية ومستعرضة معاً'); } },
    ],
    update(dt) { if (run || wrun) t += dt; place(); },
    print(x, { P, inkText }) {
      inkText(x, 'υ = √(β / ρ)', ...P(0.04, 0.44), { size: 40, color: '#c2410c', weight: 600 });
      inkText(x, 'مستعرضة ↕ · طولية ↔ (التضاغط والتخلخل، الشكل 23)', ...P(0.04, 0.52), { size: 23 });
      inkText(x, 'موجات الماء: الجزيئات في مسارات دائرية (الشكل 24 ص 169)', ...P(0.04, 0.59), { size: 22, color: '#6b6155' });
    },
    notes: [],
  };
};

/* ---------- 8-12 Sound ---------- */
SCENES.sound = (S) => {
  const { THREE, V, ink, glow, label, dots } = S;
  const g = new THREE.Group(), X0 = -0.28, Z = 0.0;
  const fork = new THREE.Group(); fork.position.set(-0.36, 0, Z); g.add(fork);
  fork.add(block(S, 0.06, 0.012, 0.06, '#dee2e6')); fork.add(Object.assign(ink(new THREE.CylinderGeometry(0.005, 0.005, 0.06).translate(0, 0.04, 0), '#adb5bd'), {}));
  const prongs = [-1, 1].map((sd) => { const p = ink(new THREE.BoxGeometry(0.008, 0.11, 0.012).translate(0, 0.125, 0), '#adb5bd'); p.position.z = sd * 0.016; fork.add(p); return p; });
  const NC = 46, NR = 6, pd = dots(NC * NR, '#495057', 0.0045); g.add(pd);
  const med = [{ n: 'الهواء', v: (T) => 331 + 0.6 * T, col: '#f1f3f5' }, { n: 'الماء', v: () => 1493, col: '#a5d8ff' }, { n: 'الألمنيوم', v: () => 5100, col: '#ced4da' }];
  const box = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.06, 0.2), new THREE.MeshStandardMaterial({ color: '#f1f3f5', transparent: true, opacity: 0.35, depthWrite: false })); box.position.set(X0 + 0.33, 0.03, Z); g.add(box);
  const tM = token(S, 'وسط', '#1c7ed6', V(0.35, 0, -0.3)), therm = new THREE.Group(); therm.position.set(-0.34, 0, -0.28); g.add(tM, therm);
  therm.add(ink(new THREE.CylinderGeometry(0.008, 0.008, 0.14, 10).translate(0, 0.08, 0), '#f8f9fa')); const bulb = ink(new THREE.SphereGeometry(0.016, 12, 10), '#e03131'); bulb.position.y = 0.012; therm.add(bulb);
  const merc = ink(new THREE.CylinderGeometry(0.005, 0.005, 1, 8).translate(0, 0.5, 0), '#e03131', { edges: false }); merc.position.y = 0.02; therm.add(merc);
  const lab = label('', { size: 0.03, color: '#c2410c' }); lab.position.set(0, 0.2, Z); g.add(lab);
  let run = false, mi = 0, Ti = 1, t = 0; const Ts = [0, 20, 40], f = 1000;
  const v = () => med[mi].v(Ts[Ti]); const lamV = () => 0.1 * Math.sqrt((v() / f) / 0.343);
  const txt = () => { merc.scale.y = 0.04 + Ts[Ti] * 0.002; box.material.color.set(med[mi].col); lab.setText(`${med[mi].n}${mi === 0 ? ` (${Ts[Ti]}°C)` : ''}: υ = ${v().toFixed(0)} m/s · f = 1000 Hz ⇒ λ = ${(v() / f).toFixed(2)} m`); };
  txt();
  const place = () => { const kk = 2 * Math.PI / lamV(), ww = 2 * Math.PI * 0.9;
    for (let c = 0; c < NC; c++) for (let r = 0; r < NR; r++) { const x0 = X0 + c * 0.014, ph = kk * (x0 - X0) - ww * t, on = run && (x0 - X0) < (ww / kk) * t; pd.setAt(c * NR + r, x0 + (on ? 0.006 * Math.sin(ph) : 0) + ((r % 2) * 0.007), 0.03, Z - 0.08 + r * 0.032, 1); }
    pd.commit(); prongs.forEach((p, i) => (p.position.z = (i ? 1 : -1) * (0.016 + (run ? 0.003 * Math.sin(t * 40) : 0)))); };
  place();
  return {
    group: g,
    targets: [
      { obj: fork, hint: V(-0.36, 0, Z + 0.12), act: () => { run = !run; t = 0; if (run) S.sfx.tone(440, 440, 1.0, 'sine', 0.05); } },
      { obj: tM, hint: tM.position.clone(), act: () => { mi = (mi + 1) % 3; t = 0; run = true; txt(); } },
      { obj: therm, hint: V(-0.34, 0, -0.18), act: () => { mi = 0; Ti = (Ti + 1) % 3; txt(); glow(bulb, '#e03131', 0.6); } },
    ],
    update(dt) { if (run) t += dt; place(); },
    print(x, { P, inkText }) {
      inkText(x, 'υ = √(Y/ρ) ، υ = √(β/ρ) ، υ = 331 + 0.6T', ...P(0.04, 0.44), { size: 31, color: '#c2410c', weight: 600 });
      inkText(x, 'الجدول 1 ص 170: الهواء 343 · الماء 1493 · الألمنيوم 5100 m/s', ...P(0.04, 0.52), { size: 22 });
      inkText(x, 'طول الموجة في الرسم بمقياس غير خطي · مدى السمع 20–20000 Hz', ...P(0.04, 0.59), { size: 21, color: '#6b6155' });
    },
    notes: [],
  };
};

/* ---------- 8-13 Interference (Quincke tube) ---------- */
SCENES.interfer = (S) => {
  const { THREE, V, gsap, ink, glow, label, jar } = S;
  const g = new THREE.Group(), Y = 0.04, ZC = -0.04, XL = -0.18, XR = 0.18;
  const pipe = (a, b, col = '#e9c99a') => { const d = b.clone().sub(a), L = d.length(); const m = ink(new THREE.CylinderGeometry(0.018, 0.018, L, 14).rotateZ(Math.PI / 2), col, { thresh: 30 }); m.position.copy(a).add(b).multiplyScalar(0.5); m.rotation.y = -Math.atan2(d.z, d.x); return m; };
  g.add(pipe(V(-0.36, Y, ZC), V(XL, Y, ZC)), pipe(V(XR, Y, ZC), V(0.32, Y, ZC)));
  g.add(pipe(V(XL, Y, ZC), V(XL, Y, ZC + 0.12)), pipe(V(XR, Y, ZC), V(XR, Y, ZC + 0.12)), pipe(V(XL, Y, ZC + 0.12), V(XR, Y, ZC + 0.12)));
  const B = new THREE.Group(); g.add(B);
  B.add(pipe(V(XL, Y, ZC), V(XL, Y, ZC - 0.14), '#ffc078'), pipe(V(XR, Y, ZC), V(XR, Y, ZC - 0.14), '#ffc078'), pipe(V(XL, Y, ZC - 0.14), V(XR, Y, ZC - 0.14), '#ffc078'));
  const bh = hitBox(S, 0.42, 0.08, 0.06, V(0, Y, ZC - 0.14)); B.add(bh);
  const lB = label('B', { size: 0.03 }); lB.position.set(0, 0.09, ZC - 0.14); B.add(lB);
  const spk = ink(new THREE.ConeGeometry(0.04, 0.05, 20).rotateZ(Math.PI / 2), '#495057'); spk.position.set(-0.39, Y, ZC); g.add(spk);
  const ear = ink(new THREE.SphereGeometry(0.022, 14, 10), '#ffd8a8'); ear.position.set(0.35, Y, ZC); g.add(ear);
  const J = jar({ max: 1, color: '#e8590c', name: 'الشدة', unit: '', digits: 2 }); J.position.set(0.36, 0, -0.32); g.add(J);
  const pan = panel(S, 0.36, 0.24, V(-0.15, 0, 0.17), (c, W, H, ph) => { const rows = [[0, '#1c7ed6'], [ph, '#c2255c']];
    const draw = (fn, y0, col) => { c.strokeStyle = col; c.lineWidth = 4; c.beginPath(); for (let i = 0; i <= 300; i++) { const xx = 20 + (i / 300) * (W - 40), yy = y0 - fn((i / 300) * 6 * Math.PI) * 30; i ? c.lineTo(xx, yy) : c.moveTo(xx, yy); } c.stroke(); };
    draw((a) => Math.sin(a), H * 0.2, rows[0][1]); draw((a) => Math.sin(a + ph), H * 0.45, rows[1][1]); draw((a) => Math.sin(a) + Math.sin(a + ph), H * 0.78, '#2b2620');
    c.font = "600 26px 'Newsreader',serif"; c.fillStyle = '#2a241c'; c.fillText('Σ', 30, H * 0.78 - 40); });
  g.add(pan);
  const lab = label('', { size: 0.03, color: '#c2410c' }); lab.position.set(0, 0.2, ZC - 0.1); g.add(lab);
  const states = [{ d: 0, ph: 0, t: 'فرق المسار 0: تداخل بنّاء' }, { d: 0.05, ph: Math.PI, t: 'فرق المسار λ/2: تداخل هدّام' }, { d: 0.1, ph: 2 * Math.PI, t: 'فرق المسار λ: تداخل بنّاء من جديد' }];
  let si = 0;
  const apply = () => { const s = states[si]; gsap.to(B.position, { z: -s.d, duration: S.reduced ? 0 : 0.6 }); pan.redraw(s.ph); J.set(Math.cos(s.ph / 2) ** 2, 0.6, `الشدة ${(Math.cos(s.ph / 2) ** 2).toFixed(0)}`); lab.setText(s.t); };
  apply();
  return {
    group: g,
    targets: [
      { obj: B, hit: [bh], hint: V(0.24, 0, ZC - 0.16), act: () => { si = (si + 1) % 3; apply(); } },
      { obj: spk, hint: V(-0.38, 0, ZC + 0.1), act: () => { glow(spk, '#f08c00', 0.7); if (Math.cos(states[si].ph / 2) ** 2 > 0.5) S.sfx.tone(520, 520, 0.8, 'sine', 0.06); } },
      { obj: pan, hit: [pan.board], hint: V(-0.15, 0, 0.28), act: () => { glow(J.hit[0], '#e8590c', 0.6); lab.setText(states[si].ph === Math.PI ? 'قمة على قعر: المحصلة صفر' : 'قمة على قمة: المحصلة مضاعفة'); } },
    ],
    print(x, { P, inkText }) {
      inkText(x, 'بنّاء: Δ = nλ  ،  هدّام: Δ = (n + ½)λ', ...P(0.04, 0.44), { size: 33, color: '#c2410c', weight: 600 });
      inkText(x, 'أنبوبة كوينك (الشكل 26): P الفتحة المتصلة بالمصدر ، R عند الأذن', ...P(0.04, 0.52), { size: 22 });
      inkText(x, 'إزاحة الأنبوبة B تزيد المسار ضعف مقدار السحب', ...P(0.04, 0.59), { size: 22, color: '#6b6155' });
    },
    notes: [],
  };
};

/* ---------- 8-14 Resonance ---------- */
SCENES.resonance = (S) => {
  const { THREE, V, ink, glow, label } = S;
  const g = new THREE.Group(), X = -0.14, Z = -0.08, H = 0.36;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const l = ink(new THREE.CylinderGeometry(0.006, 0.006, H * 1.05, 8).translate(0, H * 0.525, 0), '#4dabf7'); l.position.set(X + sx * 0.12, 0, Z + sz * 0.07); l.rotation.x = -sz * 0.18; g.add(l); }
  const bar = ink(new THREE.CylinderGeometry(0.007, 0.007, 0.26, 8).rotateZ(Math.PI / 2), '#1c7ed6'); bar.position.set(X, H, Z); g.add(bar);
  const sw = new THREE.Group(); sw.position.set(X, H, Z); g.add(sw);
  for (const sx of [-1, 1]) { const rp = ink(new THREE.CylinderGeometry(0.002, 0.002, 0.27, 6).translate(0, -0.135, 0), '#5c4a32', { edges: false }); rp.position.x = sx * 0.04; sw.add(rp); }
  const seat = block(S, 0.1, 0.012, 0.05, '#ffd43b'); seat.position.y = -0.28; sw.add(seat);
  const kid = ink(new THREE.CylinderGeometry(0.016, 0.02, 0.07, 12).translate(0, 0.045, 0), '#e03131'); kid.position.y = -0.27; sw.add(kid);
  const kn = knobT(S, 'f', V(0.34, 0, 0.27)); g.add(kn);
  const fs = [0.6, 1.0, 1.5]; let fi = 0;
  const amp = (r) => 0.1 / Math.sqrt((1 - r * r) ** 2 + (0.15 * r) ** 2);
  const pan = panel(S, 0.3, 0.26, V(0.24, 0, -0.2), (c, W, H2, r) => { const A2 = axes2d(c, W, H2, { xl: 'f', yl: 'A' });
    c.strokeStyle = '#c2255c'; c.lineWidth = 4; c.beginPath(); for (let i = 0; i <= 200; i++) { const rr = (i / 200) * 2; const px = A2.ox + (rr / 2) * A2.w, py = A2.oy - (amp(rr) / amp(1)) * A2.h * 0.95; i ? c.lineTo(px, py) : c.moveTo(px, py); } c.stroke();
    c.fillStyle = '#1c7ed6'; c.beginPath(); c.arc(A2.ox + (r / 2) * A2.w, A2.oy - (amp(r) / amp(1)) * A2.h * 0.95, 11, 0, 7); c.fill();
    c.font = "600 26px 'Newsreader',serif"; c.fillStyle = '#2a241c'; c.textAlign = 'center'; c.fillText('f₀', A2.ox + A2.w / 2, A2.oy + 34); });
  pan.redraw(fs[fi]); g.add(pan);
  const lab = label('', { size: 0.03, color: '#c2410c' }); lab.position.set(X, 0.46, Z); g.add(lab);
  let run = false, t = 0, Acur = 0;
  const txt = () => lab.setText(`f = ${fs[fi]} f₀ ${fs[fi] === 1 ? '⇒ رنين: أقصى سعة' : '⇒ سعة صغيرة'}`);
  txt();
  return {
    group: g,
    targets: [
      { obj: kn, hint: kn.position.clone(), act: () => { fi = (fi + 1) % 3; S.gsap.to(kn.ptr.rotation, { y: -fi * 0.8, duration: 0.4 }); pan.redraw(fs[fi]); run = true; txt(); } },
      { obj: sw, hit: [seat, kid], hint: V(X, 0, Z + 0.14), act: () => { run = !run; } },
      { obj: pan, hit: [pan.board], hint: V(0.24, 0, -0.08), act: () => { fi = 1; pan.redraw(1); run = true; txt(); } },
    ],
    update(dt) { if (!run) { Acur *= Math.exp(-dt); } else { t += dt; const tgt = Math.min(0.75, amp(fs[fi]) * 0.11); Acur += (tgt - Acur) * Math.min(1, dt * 0.7); } sw.rotation.x = Acur * Math.sin(2 * Math.PI * fs[fi] * 0.5 * t); },
    print(x, { P, inkText }) {
      inkText(x, 'شرط الرنين: f = f₀', ...P(0.04, 0.44), { size: 38, color: '#c2410c', weight: 600 });
      inkText(x, 'منحنى الرنين (الشكل 28) · دفع الأرجوحة (الشكل 29) ص 174', ...P(0.04, 0.52), { size: 23 });
      inkText(x, 'التردد الطبيعي للأرجوحة في الرسم 0.5 Hz (توضيحي)', ...P(0.04, 0.59), { size: 22, color: '#6b6155' });
    },
    notes: [],
  };
};

/* ---------- 8-15 Beats ---------- */
SCENES.beats = (S) => {
  const { THREE, V, ink, glow, label } = S;
  const g = new THREE.Group(), Z = -0.16;
  const mkFork = (x, col) => { const f = new THREE.Group(); f.position.set(x, 0, Z); g.add(f); f.add(block(S, 0.14, 0.06, 0.08, '#a5d8ff'));
    for (const sd of [-1, 1]) { const p = ink(new THREE.BoxGeometry(0.01, 0.12, 0.012).translate(0, 0.13, 0), col); p.position.x = sd * 0.016; f.add(p); }
    f.add(ink(new THREE.CylinderGeometry(0.006, 0.006, 0.02).translate(0, 0.07, 0), col)); return f; };
  const f1 = mkFork(-0.25, '#adb5bd'), f2 = mkFork(-0.02, '#ffa94d');
  const l1 = label('446 Hz', { size: 0.03 }), l2 = label('453 Hz', { size: 0.03, color: '#d9480f' }); l1.position.y = 0.23; l2.position.y = 0.23; f1.add(l1); f2.add(l2);
  const opts = [453, 439, 446]; let oi = 0;
  const pan = panel(S, 0.62, 0.24, V(0.02, 0, 0.18), (c, W, H, fb) => {
    const draw = (fn, y0, amp, col, lw) => { c.strokeStyle = col; c.lineWidth = lw; c.beginPath(); for (let i = 0; i <= 1400; i++) { const tt = i / 1400; const xx = 20 + tt * (W - 40), yy = y0 - fn(tt) * amp; i ? c.lineTo(xx, yy) : c.moveTo(xx, yy); } c.stroke(); };
    const fc = 40; draw((t) => Math.sin(2 * Math.PI * fc * t), H * 0.17, 18, '#868e96', 2); draw((t) => Math.sin(2 * Math.PI * (fc + fb) * t), H * 0.39, 18, '#e8590c', 2);
    draw((t) => (Math.sin(2 * Math.PI * fc * t) + Math.sin(2 * Math.PI * (fc + fb) * t)) / 2, H * 0.74, 48, '#2b2620', 2);
    if (fb) { draw((t) => Math.abs(Math.cos(Math.PI * fb * t)), H * 0.74, 48, '#7048e8', 4); }
    c.font = "600 26px 'Newsreader',serif"; c.fillStyle = '#2a241c'; c.textAlign = 'right'; c.fillText(`f_B = ${fb} Hz  (نافذة 1 s، الحاملة مصغرة)`, W - 20, H - 12); });
  const fb = () => Math.abs(opts[oi] - 446);
  pan.redraw(fb()); g.add(pan);
  const lab = label('', { size: 0.03, color: '#c2410c' }); lab.position.set(-0.12, 0.34, Z); g.add(lab);
  const txt = () => lab.setText(`f_B = |${opts[oi]} − 446| = ${fb()} ضربة في الثانية`);
  txt();
  const play = () => { S.sfx.tone(446, 446, 2.2, 'sine', 0.05); S.sfx.tone(opts[oi], opts[oi], 2.2, 'sine', 0.05); };
  return {
    group: g,
    targets: [
      { obj: f1, hint: V(-0.25, 0, Z + 0.12), act: () => { glow(f1, '#adb5bd', 0.6); play(); } },
      { obj: f2, hint: V(-0.02, 0, Z + 0.12), act: () => { oi = (oi + 1) % 3; l2.setText(`${opts[oi]} Hz`); pan.redraw(fb()); txt(); glow(f2, '#f08c00', 0.6); play(); } },
      { obj: pan, hit: [pan.board], hint: V(0.3, 0, 0.3), act: () => { pan.redraw(fb()); lab.setText('الغلاف البنفسجي: شدة ترتفع وتنخفض f_B مرة في الثانية'); } },
    ],
    print(x, { P, inkText }) {
      inkText(x, 'f_B = f₁ − f₂', ...P(0.04, 0.48), { size: 40, color: '#c2410c', weight: 600 });
      inkText(x, 'مثال 6: 446 Hz و 7 ضربات ⇒ 453 Hz أو 439 Hz', ...P(0.04, 0.56), { size: 24 });
      inkText(x, 'التثقيل يقلل التردد ويحدد أي القيمتين هي الصحيحة', ...P(0.04, 0.63), { size: 22, color: '#6b6155' });
    },
    notes: [],
  };
};

/* ---------- 8-16 Standing waves ---------- */
SCENES.standing = (S) => {
  const { THREE, V, ink, glow, label, dots } = S;
  const g = new THREE.Group(), XA = -0.3, XB = 0.28, Y = 0.12, Z = -0.04;
  const vib = block(S, 0.08, 0.1, 0.08, '#ced4da'); vib.position.set(XA - 0.05, 0, Z); g.add(vib);
  const pul = ink(new THREE.CylinderGeometry(0.03, 0.03, 0.02, 24).rotateX(Math.PI / 2), '#adb5bd'); pul.position.set(XB + 0.03, Y - 0.03, Z); g.add(pul);
  const pst = block(S, 0.012, Y - 0.03, 0.012, '#ced4da'); pst.position.set(XB + 0.03, 0, Z - 0.03); g.add(pst);
  const hang = ink(new THREE.CylinderGeometry(0.0018, 0.0018, 0.05, 6).translate(0, -0.025, 0), '#5c4a32', { edges: false }); hang.position.set(XB + 0.06, Y - 0.03, Z); g.add(hang);
  const wt = block(S, 0.03, 0.035, 0.03, '#495057'); wt.position.set(XB + 0.06, Y - 0.115, Z); g.add(wt);
  const rope = beadRope(S, 64, XA, XB, Y, Z, '#ffe066', 0.006); g.add(rope);
  const nd = dots(8, '#e03131', 0.01); g.add(nd);
  const kn = knobT(S, 'n', V(0.34, 0, 0.27)); g.add(kn); const tN = token(S, 'N', '#e03131', V(-0.34, 0, 0.27)); g.add(tN);
  const lab = label('', { size: 0.03, color: '#c2410c' }); lab.position.set(0, 0.3, Z); g.add(lab);
  const ns = [1, 2, 3, 6]; let ni = 0, run = false, t = 0, showN = false;
  const txt = () => { const n = ns[ni]; lab.setText(`n = ${n} · L = 0.42 m ⇒ λ = 2L/n = ${(0.84 / n).toFixed(2)} m · f = n υ/2L = ${n * 100} Hz`);
    for (let i = 0; i < 8; i++) nd.setAt(i, XA + (XB - XA) * i / n, Y, Z, showN && i <= n ? 1 : 0); nd.commit(); };
  txt();
  return {
    group: g,
    targets: [
      { obj: vib, hint: V(XA - 0.05, 0, Z + 0.12), act: () => { run = !run; glow(vib, '#f08c00', run ? 0.5 : 0); } },
      { obj: kn, hint: kn.position.clone(), act: () => { ni = (ni + 1) % 4; S.gsap.to(kn.ptr.rotation, { y: -ni * 0.7, duration: 0.4 }); run = true; txt(); } },
      { obj: tN, hint: tN.position.clone(), act: () => { showN = !showN; glow(tN, '#e03131', showN ? 0.6 : 0); txt(); } },
    ],
    update(dt) { if (run) t += dt; const n = ns[ni], a = run ? 0.035 * Math.cos(2 * Math.PI * 1.6 * t) : 0; rope.set((i, x) => a * Math.sin(n * Math.PI * (x - XA) / (XB - XA))); },
    print(x, { P, inkText }) {
      inkText(x, 'L = n λ / 2  ،  f_n = n υ / 2L', ...P(0.04, 0.44), { size: 36, color: '#c2410c', weight: 600 });
      inkText(x, 'مثال 7: L = 42 cm ، 6 قطاعات ⇒ λ = 0.14 m ، υ = 84 m/s ⇒ f₁ = 100 Hz', ...P(0.04, 0.52), { size: 21 });
      inkText(x, 'العقد (أحمر) لا تهتز، والبطون بينها تهتز بأقصى سعة', ...P(0.04, 0.59), { size: 22, color: '#6b6155' });
    },
    notes: [],
  };
};

/* ---------- 8-17, 8-18 Loudness and sound level ---------- */
SCENES.loudness = (S) => {
  const { THREE, V, gsap, ink, glow, label, jar, dots } = S;
  const g = new THREE.Group(), O = V(-0.36, 0.12, -0.06), D = 0.2;
  const spk = ink(new THREE.ConeGeometry(0.04, 0.05, 20).rotateZ(Math.PI / 2), '#495057'); spk.position.copy(O); g.add(spk);
  const ps = block(S, 0.012, O.y, 0.012, '#ced4da'); ps.position.set(O.x - 0.02, 0, O.z); g.add(ps);
  const mat = new THREE.LineBasicMaterial({ color: '#c2255c' });
  for (let r = 1; r <= 3; r++) { const h = 0.035 * r, x = O.x + D * r * 0.9; const pts = []; for (let i = 0; i <= r; i++) { const u = -h + (2 * h * i) / r; pts.push(V(x, O.y + u, O.z - h), V(x, O.y + u, O.z + h), V(x, O.y - h, O.z + u), V(x, O.y + h, O.z + u)); } g.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts), mat)); }
  for (const [a, b] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) g.add(dashed(S, O.clone(), O.clone().add(V(D * 2.7, a * 0.105, b * 0.105)), '#c2255c'));
  const fl = dots(30, '#f08c00', 0.005); g.add(fl);
  const meter = new THREE.Group(); g.add(meter); meter.add(block(S, 0.05, 0.04, 0.04, '#fff3bf')); const ml = label('dB', { size: 0.024 }); ml.position.y = 0.06; meter.add(ml);
  const m2 = block(S, 0.08, 0.06, 0.08, '#adb5bd'); m2.position.set(-0.33, 0, 0.24); g.add(m2); const l2 = label('ماكنة ثانية', { size: 0.024 }); l2.position.set(-0.33, 0.1, 0.24); g.add(l2);
  const J = jar({ max: 70, color: '#c2255c', name: 'L =', unit: 'dB', digits: 1 }); J.position.set(0.36, 0, -0.32); g.add(J);
  const lab = label('', { size: 0.03, color: '#c2410c' }); lab.position.set(0, 0.32, O.z); g.add(lab);
  let on = false, ri = 0, two = false, t = 0;
  const apply = () => { const r = ri + 1, I = 2e-7 * (two ? 2 : 1) / (r * r), L = 10 * Math.log10(I / 1e-12);
    gsap.to(meter.position, { x: O.x + D * r * 0.9, duration: S.reduced ? 0 : 0.5 }); meter.position.y = 0; meter.position.z = O.z + 0.16;
    J.set(L, 0.5, `L = ${L.toFixed(1)} dB`); lab.setText(`البعد ${r}r · I = ${(I * 1e7).toFixed(2)} × 10⁻⁷ W/m² ${two ? '(ماكنتان)' : ''}`); };
  meter.position.set(O.x + D * 0.9, 0, O.z + 0.16); apply();
  return {
    group: g,
    targets: [
      { obj: spk, hint: V(O.x, 0, O.z + 0.12), act: () => { on = !on; glow(spk, '#f08c00', on ? 0.6 : 0); } },
      { obj: meter, hint: V(O.x + 0.18, 0, O.z + 0.24), act: () => { ri = (ri + 1) % 3; apply(); } },
      { obj: m2, hint: V(-0.33, 0, 0.32), act: () => { two = !two; glow(m2, '#c2255c', two ? 0.5 : 0); apply(); } },
    ],
    update(dt) { t += dt; for (let i = 0; i < 30; i++) { const u = ((t * 0.25 + i / 30) % 1), a = (i * 2.4) % (2 * Math.PI), sp = 0.1 * u * 2.7; fl.setAt(i, O.x + D * 2.7 * u, O.y + Math.sin(a) * sp * 0.5, O.z + Math.cos(a) * sp * 0.5, on ? 1 : 0); } fl.commit(); },
    print(x, { P, inkText }) {
      inkText(x, 'I = P / A  ،  L_I = 10 log₁₀ (I / I₀)', ...P(0.04, 0.44), { size: 33, color: '#c2410c', weight: 600 });
      inkText(x, 'مثال 8: I = 2 × 10⁻⁷ W/m² ⇒ 53 dB ، ماكنتان ⇒ 56 dB', ...P(0.04, 0.52), { size: 23 });
      inkText(x, 'I₀ = 10⁻¹² W/m² عتبة السمع (0 dB) · عتبة الألم 120 dB', ...P(0.04, 0.59), { size: 22, color: '#6b6155' });
    },
    notes: [],
  };
};

/* ---------- 8-19 Ultrasonic ---------- */
SCENES.ultrasonic = (S) => {
  const { THREE, V, gsap, ink, glow, label, dots } = S;
  const g = new THREE.Group(), H = 0.28, Z = -0.06;
  const sea = new THREE.Mesh(new THREE.BoxGeometry(0.78, H, 0.3), new THREE.MeshStandardMaterial({ color: '#4dabf7', transparent: true, opacity: 0.22, depthWrite: false })); sea.position.set(0, H / 2, Z); sea.renderOrder = 3; g.add(sea);
  { const se = new THREE.LineSegments(new THREE.EdgesGeometry(sea.geometry), S.LINE_MAT); se.position.copy(sea.position); g.add(se); }
  const floor = ink(new THREE.BoxGeometry(0.78, 1, 0.3).translate(0, 0.5, 0), '#c8945a', { thresh: 20 }); floor.position.set(0, 0, Z); g.add(floor);
  const ship = new THREE.Group(); ship.position.set(-0.05, H, Z); g.add(ship);
  ship.add(ink(new THREE.BoxGeometry(0.16, 0.035, 0.06).translate(0, 0.012, 0), '#f8f9fa')); ship.add(block(S, 0.05, 0.04, 0.04, '#e03131').translateY(0.03));
  const pd = dots(12, '#7048e8', 0.008); g.add(pd);
  const tF = token(S, 'f', '#7048e8', V(0.35, 0, 0.26)); g.add(tF);
  const lab = label('', { size: 0.03, color: '#c2410c' }); lab.position.set(0, H + 0.13, Z); g.add(lab);
  const depths = [1533, 766.5, 3066]; let di = 0, busy = false;
  const dv = () => (depths[di] / 3066) * (H - 0.02);
  const setFloor = () => { gsap.to(floor.scale, { y: Math.max(0.001, H - dv()), duration: S.reduced ? 0 : 0.6 }); lab.setText(`العمق ${depths[di]} m ⇒ زمن الذهاب والإياب t = 2d/υ = ${(2 * depths[di] / 1533).toFixed(1)} s`); };
  floor.scale.y = H - dv(); setFloor();
  const ping = () => { if (busy) return; busy = true; const o = { k: 0 }; const yb = H - dv(); glow(ship, '#7048e8', 0.6);
    gsap.to(o, { k: 2, duration: S.reduced ? 0.01 : 0.9 + 1.4 * depths[di] / 3066, ease: 'none', onUpdate: () => { const y = o.k < 1 ? H - (H - yb) * o.k : yb + (H - yb) * (o.k - 1); for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; pd.setAt(i, -0.05 + Math.cos(a) * 0.03, y, Z + Math.sin(a) * 0.03, 1); } pd.commit(); },
      onComplete: () => { for (let i = 0; i < 12; i++) pd.setAt(i, 0, -9, 0, 0); pd.commit(); glow(ship, null, 0); lab.setText(`d = υ t / 2 = 1533 × ${(2 * depths[di] / 1533).toFixed(1)} / 2 = ${depths[di]} m`); S.sfx.click(); busy = false; } }); };
  return {
    group: g,
    targets: [
      { obj: ship, hint: V(-0.05, 0, Z + 0.2), act: ping },
      { obj: floor, hint: V(0.3, 0, Z + 0.2), act: () => { di = (di + 1) % 3; setFloor(); } },
      { obj: tF, hint: tF.position.clone(), act: () => { glow(tF, '#7048e8', 0.6); lab.setText('النبضة فوق سمعية: f > 20000 Hz فلا تسمعها الأذن'); } },
    ],
    print(x, { P, inkText }) {
      inkText(x, 'f > 20000 Hz  ،  d = υ t / 2', ...P(0.04, 0.44), { size: 36, color: '#c2410c', weight: 600 });
      inkText(x, 'انطلاق الصوت في ماء البحر 1533 m/s (الجدول 1 ص 170) · الأعماق توضيحية', ...P(0.04, 0.52), { size: 21 });
      inkText(x, 'تُستعمل لقياس أعماق البحار وكشف الأجسام تحت الماء', ...P(0.04, 0.59), { size: 22, color: '#6b6155' });
    },
    notes: [],
  };
};

/* ---------- 8-20 Doppler ---------- */
SCENES.doppler = (S) => {
  const { THREE, V, ink, glow, label } = S;
  const g = new THREE.Group(), Z = -0.04, C = 0.14;
  const rs = ringSet(S, 12, '#1864ab'); g.add(rs);
  const truck = car(S, '#ff8787'); truck.scale.setScalar(1.1); g.add(truck);
  const ef = token(S, 'سامع', '#2b8a3e', V(0.4, 0, Z)), eb = token(S, 'سامع', '#e8590c', V(-0.4, 0, Z)); g.add(ef, eb);
  const lf = label('644 Hz', { size: 0.03, color: '#2b8a3e' }), lb = label('644 Hz', { size: 0.03, color: '#e8590c' }); lf.position.set(0.4, 0.1, Z); lb.position.set(-0.4, 0.1, Z); g.add(lf, lb);
  const lab = label('', { size: 0.03, color: '#c2410c' }); lab.position.set(0, 0.28, Z); g.add(lab);
  let moving = false, t = 0, x = 0; const em = [];
  const txt = () => { lab.setText(moving ? 'υ_s = 72 km/h = 20 m/s (السرعة في الرسم مكبرة)' : 'مصدر ساكن: f = 644 Hz في كل اتجاه'); lf.setText(moving ? '684 Hz' : '644 Hz'); lb.setText(moving ? '608.42 Hz' : '644 Hz'); };
  txt();
  return {
    group: g,
    targets: [
      { obj: truck, hint: V(0, 0, Z + 0.12), act: () => { moving = !moving; em.length = 0; x = moving ? -0.22 : 0; txt(); } },
      { obj: ef, hint: V(0.4, 0, Z + 0.1), act: () => { glow(ef, '#2b8a3e', 0.6); lab.setText(moving ? 'التقارب: f′ = (342/322) × 644 = 684 Hz ، λ′ = 0.5 m' : 'المصدر ساكن: لا تغيّر في التردد'); } },
      { obj: eb, hint: V(-0.4, 0, Z + 0.1), act: () => { glow(eb, '#e8590c', 0.6); lab.setText(moving ? 'التباعد: f′ = (342/362) × 644 = 608.42 Hz ، λ′ = 0.5621 m' : 'المصدر ساكن: لا تغيّر في التردد'); } },
    ],
    update(dt) {
      t += dt; const vs = moving ? 0.35 * C : 0; x += vs * dt; if (x > 0.22) { x = -0.22; em.length = 0; }
      truck.position.set(x, 0.006, Z);
      if (!em.length || t - em[em.length - 1].t > 0.35) { em.push({ t, x }); if (em.length > rs.n) em.shift(); }
      em.forEach((e, i) => { const r = C * (t - e.t); rs.setRing(i, e.x, Z, r, Math.max(0, 0.9 - r * 2.2)); }); for (let i = em.length; i < rs.n; i++) rs.setRing(i, 0, 0, 0, 0);
    },
    print(x2, { P, inkText }) {
      inkText(x2, 'f′ = ((υ − υ₀) / (υ − υ_s)) × f  ،  λ′ = υ / f′', ...P(0.04, 0.44), { size: 31, color: '#c2410c', weight: 600 });
      inkText(x2, 'مثال 9: 644 Hz ، 20 m/s ، υ = 342 m/s ⇒ 684 Hz تقارباً و 608.42 Hz تباعداً', ...P(0.04, 0.52), { size: 20 });
      inkText(x2, 'مثال 10 (راكب دراجة 5 m/s نحو مصدر 1035 Hz): 1050 Hz ثم 1020 Hz', ...P(0.04, 0.59), { size: 20, color: '#6b6155' });
    },
    notes: [],
  };
};

/* ---------- 8-21 Shock wave ---------- */
SCENES.shock = (S) => {
  const { THREE, V, ink, glow, label } = S;
  const g = new THREE.Group(), Z = -0.04, C = 0.1;
  const rs = ringSet(S, 18, '#1864ab'); g.add(rs);
  const plane = new THREE.Group(); g.add(plane);
  plane.add(ink(new THREE.CylinderGeometry(0.012, 0.016, 0.12, 12).rotateZ(Math.PI / 2), '#dee2e6'));
  const nose = ink(new THREE.ConeGeometry(0.012, 0.03, 12).rotateZ(-Math.PI / 2), '#adb5bd'); nose.position.x = 0.075; plane.add(nose);
  plane.add(ink(new THREE.BoxGeometry(0.04, 0.004, 0.14), '#ced4da'));
  const c1 = dashed(S, V(), V(), '#e03131'), c2 = dashed(S, V(), V(), '#e03131'); g.add(c1, c2);
  const kn = knobT(S, 'M', V(0.35, 0, 0.27)); g.add(kn); const tC = token(S, 'θ', '#e03131', V(-0.35, 0, 0.27)); g.add(tC);
  const lab = label('', { size: 0.03, color: '#c2410c' }); lab.position.set(0, 0.24, Z); g.add(lab);
  const Ms = [0.5, 1, 2]; let mi = 0, run = false, t = 0, x = -0.3, cone = true; const em = [];
  const txt = () => { const M = Ms[mi]; lab.setText(M < 1 ? `ماخ ${M}: الجبهات تسبق الطائرة` : M === 1 ? 'ماخ 1: تتراكم الجبهات أمامها (حاجز الصوت)' : `ماخ ${M}: sinθ = υ/υ_s = 1/${M} ⇒ θ = ${(Math.asin(1 / M) * 180 / Math.PI).toFixed(0)}°`); };
  txt(); plane.position.set(x, 0.05, Z);
  return {
    group: g,
    targets: [
      { obj: plane, hint: V(-0.3, 0, Z + 0.12), act: () => { run = !run; } },
      { obj: kn, hint: kn.position.clone(), act: () => { mi = (mi + 1) % 3; S.gsap.to(kn.ptr.rotation, { y: -mi * 0.8, duration: 0.4 }); em.length = 0; x = -0.3; run = true; txt(); } },
      { obj: tC, hint: tC.position.clone(), act: () => { cone = !cone; glow(tC, '#e03131', cone ? 0.6 : 0); } },
    ],
    update(dt) {
      if (!run) return; t += dt; const M = Ms[mi]; x += M * C * dt; if (x > 0.36) { x = -0.3; em.length = 0; }
      plane.position.set(x, 0.05, Z);
      if (!em.length || t - em[em.length - 1].t > 0.22) { em.push({ t, x }); if (em.length > rs.n) em.shift(); }
      em.forEach((e, i) => { const r = C * (t - e.t); rs.setRing(i, e.x, Z, r, Math.max(0, 0.9 - r * 3)); }); for (let i = em.length; i < rs.n; i++) rs.setRing(i, 0, 0, 0, 0);
      const show = cone && M > 1; c1.visible = c2.visible = show;
      if (show) { const th = Math.asin(1 / M), L = 0.3, a = V(x, 0.008, Z); c1.setEnds(a, a.clone().add(V(-Math.cos(th) * L, 0, Math.sin(th) * L))); c2.setEnds(a, a.clone().add(V(-Math.cos(th) * L, 0, -Math.sin(th) * L))); }
    },
    print(x2, { P, inkText }) {
      inkText(x2, 'sinθ = υ / υ_s  ،  رقم ماخ = υ_s / υ', ...P(0.04, 0.44), { size: 34, color: '#c2410c', weight: 600 });
      inkText(x2, 'الأشكال 44a–c و 45 ص 189–190: الجبهات قبل حاجز الصوت وعنده وبعده', ...P(0.04, 0.52), { size: 21 });
      inkText(x2, 'الموجة الصدمية تحمل طاقة كبيرة وتُسمع دوياً', ...P(0.04, 0.59), { size: 22, color: '#6b6155' });
    },
    notes: [],
  };
};

/* ================= Chapter 9 ================= */
function wirePath(S, g, pts, { r = 0.006, color = '#c9b48a', draw = true } = {}) {
  const { THREE, V, ink } = S; const path = new THREE.CurvePath();
  for (let i = 0; i < pts.length - 1; i++) { path.add(new THREE.LineCurve3(pts[i], pts[i + 1]));
    if (draw) { const a = pts[i], b = pts[i + 1], L = a.distanceTo(b); if (L < 1e-4) continue; const w = ink(new THREE.CylinderGeometry(r, r, L, 8), color, { edges: false }); w.position.copy(a).lerp(b, 0.5); w.quaternion.setFromUnitVectors(V(0, 1, 0), b.clone().sub(a).normalize()); g.add(w); } }
  path.L = path.getLength(); return path;
}
function flowDots(S, g, path, n, color = '#1c7ed6', r = 0.006) {
  const d = S.dots(n, color, r); g.add(d); let ph = 0; const q = new S.THREE.Vector3();
  d.step = (dt, speed, on = true) => { ph = (ph + (dt * speed) / path.L) % 1; if (ph < 0) ph += 1;
    for (let i = 0; i < n; i++) { const u = (i / n + ph) % 1; path.getPointAt(u, q); d.setAt(i, q.x, q.y + 0.004, q.z, on ? 1 : 0); } d.commit(); };
  d.step(0, 0, false); return d;
}
function resistor(S, g, a, b, txt, color = '#f1d79e') {
  const { THREE, V, ink, label } = S; const L = a.distanceTo(b);
  const m = ink(new THREE.BoxGeometry(L, 0.03, 0.03), color, { thresh: 20 }); m.position.copy(a).lerp(b, 0.5); m.rotation.y = -Math.atan2(b.z - a.z, b.x - a.x); g.add(m);
  for (let i = 1; i < 4; i++) { const band = ink(new THREE.BoxGeometry(0.006, 0.032, 0.032), ['#c92a2a', '#5c4a32', '#f08c00'][i - 1], { edges: false }); band.position.x = -L / 2 + (L * i) / 4; m.add(band); }
  if (txt) { const l = label(txt, { size: 0.026 }); l.position.copy(m.position).add(V(0, 0.035, 0)); g.add(l); m.lab = l; }
  return m;
}
function cell(S, g, a, b, txt) {
  const { THREE, V, ink, label } = S; const L = a.distanceTo(b); const bg = new THREE.Group(); bg.position.copy(a).lerp(b, 0.5); bg.rotation.y = -Math.atan2(b.z - a.z, b.x - a.x); g.add(bg);
  bg.add(ink(new THREE.CylinderGeometry(0.024, 0.024, L * 0.8, 20).rotateZ(Math.PI / 2), '#495057', { thresh: 30 }));
  const cap = ink(new THREE.CylinderGeometry(0.01, 0.01, 0.014, 12).rotateZ(Math.PI / 2), '#f08c00'); cap.position.x = L * 0.4 + 0.006; bg.add(cap);
  if (txt) { const l = label(txt, { size: 0.026, color: '#c2410c' }); l.position.copy(bg.position).add(V(0, 0.05, 0)); g.add(l); bg.lab = l; }
  return bg;
}

/* ---------- 9-2 Ohm's law ---------- */
SCENES.ohm = (S) => {
  const { THREE, V, ink, glow, label, jar } = S;
  const g = new THREE.Group(), Y = 0.03, xl = -0.34, xr = 0.12, zt = -0.3, zb = 0.06;
  const bat = cell(S, g, V(xl, Y, zb - 0.04), V(xl, Y, zt + 0.04), ''); 
  wirePath(S, g, [V(xl, Y, zt + 0.04), V(xl, Y, zt), V(-0.2, Y, zt)]); wirePath(S, g, [V(0.0, Y, zt), V(xr, Y, zt), V(xr, Y, zb), V(xl, Y, zb), V(xl, Y, zb - 0.04)]);
  const spec = new THREE.Group(); spec.position.set(-0.1, Y, zt); g.add(spec);
  const sw = ink(new THREE.CylinderGeometry(1, 1, 1, 16).rotateZ(Math.PI / 2), '#e8590c', { edges: false }); spec.add(sw);
  const hb = hitBox(S, 0.24, 0.06, 0.06, V(-0.1, Y, zt)); g.add(hb);
  const path = wirePath(S, g, [V(xl, Y, zt), V(xr, Y, zt), V(xr, Y, zb), V(xl, Y, zb), V(xl, Y, zt)], { draw: false });
  const fl = flowDots(S, g, path, 26, '#1c7ed6');
  const J = jar({ max: 3.2, color: '#1c7ed6', name: 'I =', unit: 'A', digits: 2 }); J.position.set(0.22, 0, 0.02); g.add(J);
  const pan = panel(S, 0.3, 0.26, V(0.28, 0, -0.32), (c, W, H, Vv, I) => { const A2 = axes2d(c, W, H, { xl: 'V', yl: 'I' }); const sx = (v) => A2.ox + v / 6 * A2.w, sy = (i) => A2.oy - i / 3.2 * A2.h;
    c.strokeStyle = '#1c7ed6'; c.lineWidth = 5; c.beginPath(); c.moveTo(sx(0), sy(0)); c.lineTo(sx(6), sy(3)); c.stroke();
    c.strokeStyle = '#e8590c'; c.lineWidth = 4; c.setLineDash([12, 8]); c.beginPath(); for (let i = 0; i <= 50; i++) { const v = i / 50 * 6; i ? c.lineTo(sx(v), sy(1.1 * Math.sqrt(v))) : c.moveTo(sx(v), sy(0)); } c.stroke(); c.setLineDash([]);
    c.fillStyle = '#c2255c'; c.beginPath(); c.arc(sx(Vv), sy(Math.min(3.2, I)), 10, 0, 7); c.fill();
    c.font = "600 24px 'Amiri',serif"; c.textAlign = 'right'; c.direction = 'rtl'; c.fillStyle = '#1c7ed6'; c.fillText('أومي', W - 20, 50); c.fillStyle = '#e8590c'; c.fillText('مصباح (غير أومي)', W - 20, 84); });
  g.add(pan);
  const lab = label('', { size: 0.03, color: '#c2410c' }); lab.position.set(-0.1, 0.16, zt); g.add(lab);
  const Vs = [1.5, 3, 4.5, 6]; let vi = 1, si = 0, on = false;
  const sp = [{ L: 0.2, r: 0.006, k: 1, t: 'L ، A' }, { L: 0.2, r: 0.006, k: 2, t: '2L ، A' }, { L: 0.2, r: 0.0085, k: 0.5, t: 'L ، 2A' }];
  const R = () => 2 * sp[si].k, I = () => Vs[vi] / R();
  const apply = () => { const s = sp[si]; sw.scale.set(s.k === 2 ? 0.3 : 0.2, s.r, s.r); sw.material.uniforms.uColor.value.set(s.k === 2 ? '#c92a2a' : s.k === 1 ? '#e8590c' : '#fab005');
    lab.setText(`${s.t}: R = ${R()} Ω · V = ${Vs[vi]} V ⇒ I = V/R = ${I().toFixed(2)} A`); J.set(on ? I() : 0); pan.redraw(Vs[vi], on ? I() : 0); };
  apply();
  return {
    group: g,
    targets: [
      { obj: bat, hint: V(xl - 0.06, 0, (zt + zb) / 2), act: () => { if (!on) on = true; else vi = (vi + 1) % 4; glow(bat, '#f08c00', 0.4); apply(); } },
      { obj: spec, hit: [hb], hint: V(-0.1, 0, zt - 0.08), act: () => { si = (si + 1) % 3; on = true; apply(); } },
      { obj: pan, hit: [pan.board], hint: V(0.28, 0, -0.2), act: () => { on = true; apply(); lab.setText('الموصل الأومي: I ∝ V (خط مستقيم)، والمصباح ينحني منحناه'); } },
    ],
    update(dt) { fl.step(dt, on ? 0.04 * I() : 0, on); },
    print(x, { P, inkText }) {
      inkText(x, 'R = V / I  ،  R = ρ L / A', ...P(0.04, 0.44), { size: 38, color: '#c2410c', weight: 600 });
      inkText(x, 'مثال 3: نحاس L = 2 m ، A = 4 mm² ⇒ R = 8.6 × 10⁻³ Ω ، V(10 A) = 0.086 V', ...P(0.04, 0.52), { size: 20 });
      inkText(x, 'سلك العرض 2 Ω قيمة توضيحية · منحنى المصباح نوعي (الشكل 5)', ...P(0.04, 0.59), { size: 22, color: '#6b6155' });
    },
    notes: [],
  };
};

/* ---------- 9-3 Resistivity & temperature ---------- */
SCENES.restemp = (S) => {
  const { THREE, V, ink, glow, label, jar } = S;
  const g = new THREE.Group(), X = -0.14, Z = -0.08;
  const coil = springLine(S, 14, 0.03); coil.material = new THREE.LineBasicMaterial({ color: '#c92a2a' }); coil.position.set(X - 0.14, 0.16, Z); coil.setLen(0.28); g.add(coil);
  for (const dx of [-0.16, 0.16]) { const p = block(S, 0.014, 0.16, 0.014, '#adb5bd'); p.position.set(X + dx, 0, Z); g.add(p); }
  const burner = block(S, 0.12, 0.03, 0.08, '#495057'); burner.position.set(X, 0, Z); g.add(burner);
  const flame = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.1, 18).translate(0, 0.05, 0), new THREE.MeshBasicMaterial({ color: '#ff922b', transparent: true, opacity: 0.8, toneMapped: false })); flame.position.set(X, 0.03, Z); g.add(flame);
  const hb = hitBox(S, 0.14, 0.14, 0.1, V(X, 0.06, Z)); g.add(hb);
  const J = jar({ max: 32, color: '#7048e8', name: 'R =', unit: 'Ω', digits: 1 }); J.position.set(0.16, 0, 0.0); g.add(J);
  const pan = panel(S, 0.3, 0.26, V(0.28, 0, -0.32), (c, W, H, T) => { const A2 = axes2d(c, W, H, { xl: 'T', yl: 'R' }); const sx = (t) => A2.ox + (t - 300) / 140 * A2.w;
    c.strokeStyle = '#c92a2a'; c.lineWidth = 5; c.beginPath(); c.moveTo(sx(300), A2.oy - A2.h * 0.35); c.lineTo(sx(440), A2.oy - A2.h * 0.9); c.stroke();
    c.strokeStyle = '#1c7ed6'; c.lineWidth = 4; c.setLineDash([12, 8]); c.beginPath(); c.moveTo(sx(300), A2.oy - A2.h * 0.8); c.lineTo(sx(440), A2.oy - A2.h * 0.25); c.stroke(); c.setLineDash([]);
    const f = (T - 300) / 140; c.fillStyle = '#c2255c'; c.beginPath(); c.arc(sx(T), A2.oy - A2.h * (0.35 + 0.55 * f), 10, 0, 7); c.fill();
    c.font = "600 24px 'Amiri',serif"; c.textAlign = 'right'; c.direction = 'rtl'; c.fillStyle = '#c92a2a'; c.fillText('فلز: α موجب', W - 20, 50); c.fillStyle = '#1c7ed6'; c.fillText('شبه موصل: α سالب', W - 20, 84); });
  g.add(pan);
  const lab = label('', { size: 0.03, color: '#c2410c' }); lab.position.set(X, 0.3, Z); g.add(lab);
  const Ts = [320, 370, 420]; let ti = 0; const R0 = 6.8e-5 * 1.1 / 3.1e-6;
  const R = () => R0 * (1 + 2e-3 * (Ts[ti] - 320));
  const apply = () => { flame.scale.set(1, 0.6 + ti * 0.5, 1); coil.material.color.set(['#c92a2a', '#e8590c', '#f59f00'][ti]); J.set(R(), 0.6, `R = ${R().toFixed(1)} Ω`); pan.redraw(Ts[ti]);
    lab.setText(`T = ${Ts[ti]}°C ⇒ ρ = ${(6.8 * (1 + 2e-3 * (Ts[ti] - 320))).toFixed(2)} × 10⁻⁵ Ω·m`); };
  apply();
  return {
    group: g,
    targets: [
      { obj: flame, hit: [hb, burner], hint: V(X, 0, Z + 0.12), act: () => { ti = (ti + 1) % 3; apply(); } },
      { obj: J, hit: J.hit, hint: V(0.16, 0, 0.1), act: () => { glow(J.hit[0], '#7048e8', 0.6); lab.setText(`R = ρL/A = ${R().toFixed(1)} Ω (L = 1.1 m ، A = 3.1 × 10⁻⁶ m²)`); } },
      { obj: pan, hit: [pan.board], hint: V(0.28, 0, -0.2), act: () => { lab.setText('المقاوم الحراري ومحرار المقاومة البلاتيني يستفيدان من هذا التغير'); } },
    ],
    update(dt) { flame.rotation.y += dt * 3; },
    print(x, { P, inkText }) {
      inkText(x, 'ρ = ρ₀ [1 + α (T − T₀)]', ...P(0.04, 0.44), { size: 38, color: '#c2410c', weight: 600 });
      inkText(x, 'مثال 4: ρ₀ = 6.8 × 10⁻⁵ Ω·m (320°C) ، α = 2 × 10⁻³ ⇒ R(420°C) ≈ 29 Ω', ...P(0.04, 0.52), { size: 20 });
      inkText(x, 'منحنى شبه الموصل في اللوحة نوعي', ...P(0.04, 0.59), { size: 22, color: '#6b6155' });
    },
    notes: [],
  };
};

/* ---------- 9-4 Superconductors ---------- */
SCENES.supercond = (S) => {
  const { THREE, V, ink, glow, label } = S;
  const g = new THREE.Group(), C = V(-0.14, 0, -0.06), R = 0.11;
  const tankG = new THREE.CylinderGeometry(0.17, 0.17, 0.14, 40, 1, true);
  const tank = new THREE.Mesh(tankG, new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.16, side: THREE.DoubleSide, depthWrite: false })); tank.position.copy(C).setY(0.07); tank.renderOrder = 3; g.add(tank);
  const te = new THREE.LineSegments(new THREE.EdgesGeometry(tankG, 20), S.LINE_MAT); te.position.copy(tank.position); g.add(te);
  const fog = new THREE.Mesh(new THREE.CylinderGeometry(0.165, 0.165, 0.12, 40), new THREE.MeshStandardMaterial({ color: '#74c0fc', transparent: true, opacity: 0.0, depthWrite: false })); fog.position.copy(tank.position); g.add(fog);
  const ring = ink(new THREE.TorusGeometry(R, 0.012, 10, 64).rotateX(Math.PI / 2), '#adb5bd', { thresh: 40 }); ring.position.copy(C).setY(0.06); g.add(ring);
  const path = new THREE.CurvePath(); const pts = []; for (let i = 0; i <= 64; i++) { const a = i / 64 * Math.PI * 2; pts.push(V(C.x + Math.cos(a) * R, 0.06, C.z - Math.sin(a) * R)); } for (let i = 0; i < 64; i++) path.add(new THREE.LineCurve3(pts[i], pts[i + 1])); path.L = path.getLength();
  const fl = flowDots(S, g, path, 24, '#1c7ed6', 0.007);
  const bat = cell(S, g, V(C.x - 0.06, 0.2, C.z), V(C.x + 0.06, 0.2, C.z), 'ε');
  const lead1 = wirePath(S, g, [V(C.x - 0.06, 0.2, C.z), V(C.x - R, 0.2, C.z), V(C.x - R, 0.07, C.z)]); const leadG = g.children.slice(-2);
  const therm = token(S, 'T', '#1c7ed6', V(0.33, 0, 0.27)); g.add(therm);
  const pan = panel(S, 0.3, 0.26, V(0.27, 0, -0.3), (c, W, H, k) => { const A2 = axes2d(c, W, H, { xl: 'T (K)', yl: 'R' }); const tc = A2.ox + A2.w * 0.25;
    c.strokeStyle = '#c92a2a'; c.lineWidth = 5; c.beginPath(); c.moveTo(A2.ox, A2.oy); c.lineTo(tc, A2.oy); c.lineTo(tc, A2.oy - A2.h * 0.35); c.quadraticCurveTo(A2.ox + A2.w * 0.6, A2.oy - A2.h * 0.45, A2.ox + A2.w, A2.oy - A2.h * 0.9); c.stroke();
    c.font = "600 26px 'Newsreader',serif"; c.fillStyle = '#2a241c'; c.textAlign = 'center'; c.fillText('T_c', tc, A2.oy + 34);
    const xs = [0.85, 0.45, 0.25, 0.1][k], xx = A2.ox + A2.w * xs; const yy = xs <= 0.25 + 1e-6 && k >= 2 ? A2.oy : A2.oy - A2.h * (xs > 0.6 ? 0.75 : 0.42);
    c.fillStyle = '#1c7ed6'; c.beginPath(); c.arc(xx, k === 2 ? A2.oy - A2.h * 0.17 : yy, 11, 0, 7); c.fill(); });
  g.add(pan);
  const lab = label('', { size: 0.03, color: '#c2410c' }); lab.position.set(C.x, 0.32, C.z); g.add(lab);
  const st = ['T فوق T_c بكثير: مقاومة اعتيادية', 'التبريد مستمر: المقاومة تقل تدريجياً', 'T = T_c: تهبط المقاومة فجأة', 'T دون T_c: المقاومة صفر (فرط توصيل)'];
  let k = 0, conn = true, speed = 0;
  const apply = () => { fog.material.opacity = 0.08 * k; lab.setText(st[k] + (conn ? '' : ' · البطارية مرفوعة')); pan.redraw(k); bat.visible = conn; leadG.forEach((m) => (m.visible = conn)); };
  apply();
  return {
    group: g,
    targets: [
      { obj: therm, hint: therm.position.clone(), act: () => { k = (k + 1) % 4; apply(); } },
      { obj: bat, hit: [bat.children[0]], hint: V(C.x, 0, C.z + 0.22), act: () => { conn = !conn; apply(); } },
      { obj: pan, hit: [pan.board], hint: V(0.27, 0, -0.18), act: () => { k = 3; apply(); } },
    ],
    update(dt) { const sc = k >= 3; const target = conn ? (sc ? 0.12 : 0.06 - k * 0.01) : sc ? 0.12 : 0; speed += (target - speed) * Math.min(1, dt * (conn || sc ? 2 : 1.2)); fl.step(dt, speed, speed > 0.005); },
    print(x, { P, inkText }) {
      inkText(x, 'T ≤ T_c  ⇒  R = 0', ...P(0.04, 0.44), { size: 40, color: '#c2410c', weight: 600 });
      inkText(x, 'التيار في الحلقة فائقة التوصيل يستمر بعد رفع المصدر (ص 204)', ...P(0.04, 0.52), { size: 22 });
      inkText(x, 'تطبيق: مغانط جهاز الرنين المغناطيسي (الشكل 8)', ...P(0.04, 0.59), { size: 22, color: '#6b6155' });
    },
    notes: [],
  };
};

/* ---------- 9-5, 9-6 EMF and closed circuit ---------- */
SCENES.emf = (S) => {
  const { THREE, V, ink, glow, label, jar } = S;
  const g = new THREE.Group();
  const low = block(S, 0.14, 0.05, 0.1, '#a5d8ff'); low.position.set(-0.3, 0, -0.3); g.add(low);
  const high = block(S, 0.14, 0.06, 0.1, '#a5d8ff'); high.position.set(0.05, 0.26, -0.3); g.add(high);
  for (const dx of [-0.06, 0.06]) { const leg = block(S, 0.01, 0.26, 0.01, '#adb5bd'); leg.position.set(0.05 + dx, 0, -0.3); g.add(leg); }
  const pump = block(S, 0.07, 0.06, 0.06, '#e03131'); pump.position.set(-0.18, 0, -0.3); g.add(pump);
  const wpath = wirePath(S, g, [V(-0.3, 0.03, -0.3), V(-0.18, 0.03, -0.3), V(-0.18, 0.29, -0.3), V(0.0, 0.29, -0.3), V(0.1, 0.29, -0.3), V(0.2, 0.29, -0.3), V(0.2, 0.06, -0.3), V(0.2, 0.03, -0.38), V(-0.3, 0.03, -0.38), V(-0.3, 0.03, -0.3)], { r: 0.008, color: '#d0ebff' });
  const tap = ink(new THREE.BoxGeometry(0.03, 0.03, 0.03), '#868e96'); tap.position.set(0.2, 0.2, -0.3); g.add(tap);
  const wheel = new THREE.Group(); wheel.position.set(0.2, 0.1, -0.27); g.add(wheel); for (let i = 0; i < 4; i++) { const b = ink(new THREE.BoxGeometry(0.08, 0.008, 0.012), '#ffc078', { edges: false }); b.rotation.z = i * Math.PI / 4; wheel.add(b); }
  const wd = flowDots(S, g, wpath, 30, '#1c7ed6', 0.007);
  const Y = 0.03, Z = 0.14;
  const bat = cell(S, g, V(-0.3, Y, Z + 0.1), V(-0.3, Y, Z - 0.06), 'ε = 9 V , r = 1 Ω');
  const sw = ink(new THREE.BoxGeometry(0.05, 0.012, 0.016).translate(0.025, 0, 0), '#868e96'); sw.position.set(-0.05, Y + 0.01, Z - 0.1); g.add(sw);
  wirePath(S, g, [V(-0.3, Y, Z - 0.06), V(-0.3, Y, Z - 0.1), V(-0.05, Y, Z - 0.1)]); wirePath(S, g, [V(0.0, Y, Z - 0.1), V(0.12, Y, Z - 0.1)]); wirePath(S, g, [V(0.28, Y, Z - 0.1), V(0.3, Y, Z - 0.1), V(0.3, Y, Z + 0.14), V(-0.3, Y, Z + 0.14), V(-0.3, Y, Z + 0.1)]);
  const Rm = resistor(S, g, V(0.12, Y, Z - 0.1), V(0.28, Y, Z - 0.1), 'R');
  const cpath = wirePath(S, g, [V(-0.3, Y, Z + 0.14), V(-0.3, Y, Z - 0.1), V(0.3, Y, Z - 0.1), V(0.3, Y, Z + 0.14), V(-0.3, Y, Z + 0.14)], { draw: false });
  const cd = flowDots(S, g, cpath, 24, '#e03131', 0.006);
  const J = jar({ max: 3.2, color: '#e03131', name: 'I =', unit: 'A', digits: 2 }); J.position.set(0.36, 0, -0.08); g.add(J);
  const lab = label('', { size: 0.03, color: '#c2410c' }); lab.position.set(0, 0.42, -0.3); g.add(lab);
  const Rs = [8, 2, 0.5]; let ri = 0, run = false, open = true;
  const I = () => 9 / (Rs[ri] + 1);
  const apply = () => { Rm.lab.setText(`R = ${Rs[ri]} Ω`); sw.rotation.y = open ? 0.6 : 0; const on = run && !open; J.set(on ? I() : 0, 0.5);
    lab.setText(on ? `I = ε/(R + r) = 9/(${Rs[ri]} + 1) = ${I().toFixed(2)} A · ΔV = IR = ${(I() * Rs[ri]).toFixed(2)} V` : run ? 'المضخة تعمل، والصنبور (المفتاح) مغلق' : 'المصدر متوقف'); };
  apply();
  return {
    group: g,
    targets: [
      { obj: pump, hit: [pump, bat.children[0]], hint: V(-0.18, 0, -0.18), act: () => { run = !run; glow(pump, '#e03131', run ? 0.5 : 0); apply(); } },
      { obj: tap, hit: [tap, sw], hint: V(-0.03, 0, Z - 0.18), act: () => { open = !open; run = true; apply(); } },
      { obj: Rm, hint: V(0.2, 0, Z - 0.02), act: () => { ri = (ri + 1) % 3; apply(); } },
    ],
    update(dt) { const on = run && !open; wd.step(dt, on ? 0.04 * I() : 0, run); cd.step(dt, on ? 0.04 * I() : 0, run); if (on) wheel.rotation.z -= dt * I() * 2; },
    print(x, { P, inkText }) {
      inkText(x, 'ε = W / q  ،  ε = IR + Ir', ...P(0.04, 0.48), { size: 38, color: '#c2410c', weight: 600 });
      inkText(x, 'المضخة ترفع الماء كما ترفع البطارية طاقة الشحنات (الشكل 9a)', ...P(0.04, 0.56), { size: 22 });
      inkText(x, 'ε = 9 V و r = 1 Ω قيم توضيحية', ...P(0.04, 0.63), { size: 22, color: '#6b6155' });
    },
    notes: [],
  };
};

/* ---------- 9-7 Internal resistance & Wheatstone ---------- */
SCENES.internal = (S) => {
  const { THREE, V, ink, glow, label, jar } = S;
  const g = new THREE.Group();
  const box = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.12, 0.14), new THREE.MeshPhysicalMaterial({ color: '#ced4da', transparent: true, opacity: 0.3, depthWrite: false })); box.position.set(-0.24, 0.06, -0.22); box.renderOrder = 3; g.add(box);
  { const be = new THREE.LineSegments(new THREE.EdgesGeometry(box.geometry), S.LINE_MAT); be.position.copy(box.position); g.add(be); }
  cell(S, g, V(-0.33, 0.06, -0.22), V(-0.25, 0.06, -0.22), 'ε = 12 V'); resistor(S, g, V(-0.22, 0.06, -0.22), V(-0.15, 0.06, -0.22), 'r = 0.01 Ω', '#ffa8a8');
  const lampM = new THREE.MeshStandardMaterial({ color: '#fff3bf', emissive: '#ffd43b', emissiveIntensity: 1 }); const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.03, 20, 14), lampM); lamp.position.set(-0.24, 0.05, 0.02); g.add(lamp);
  wirePath(S, g, [V(-0.35, 0.03, -0.22), V(-0.35, 0.03, 0.02), V(-0.27, 0.03, 0.02)]); wirePath(S, g, [V(-0.13, 0.03, -0.22), V(-0.13, 0.03, 0.02), V(-0.21, 0.03, 0.02)]);
  const sw = token(S, 'A', '#c2410c', V(-0.33, 0, 0.24)); g.add(sw);
  const Jv = jar({ max: 12.5, color: '#2b8a3e', name: 'ΔV =', unit: 'V', digits: 1 }); Jv.position.set(-0.05, 0, -0.32); g.add(Jv);
  const B = V(0.22, 0.03, -0.12), nodes = { a: V(0.06, 0.03, -0.0), b: V(0.22, 0.03, -0.16), c: V(0.38, 0.03, -0.0), d: V(0.22, 0.03, 0.16) };
  const Rx = resistor(S, g, nodes.a, nodes.b, 'R ?', '#ffc078'); resistor(S, g, nodes.b, nodes.c, '10 Ω'); resistor(S, g, nodes.a, nodes.d, '4 Ω'); resistor(S, g, nodes.d, nodes.c, '2 Ω');
  wirePath(S, g, [nodes.b, nodes.d], { r: 0.004, color: '#adb5bd' });
  const gal = new THREE.Group(); gal.position.set(0.22, 0.04, 0.0); g.add(gal);
  gal.add(ink(new THREE.CylinderGeometry(0.04, 0.04, 0.02, 24).translate(0, 0.01, 0), '#fbf6ea', { thresh: 20 }));
  const ndl = ink(new THREE.BoxGeometry(0.004, 0.004, 0.035).translate(0, 0, -0.017), '#e03131', { edges: false }); ndl.position.y = 0.024; gal.add(ndl);
  const lg = label('G', { size: 0.026 }); lg.position.y = 0.05; gal.add(lg);
  const lab = label('', { size: 0.03, color: '#c2410c' }); lab.position.set(0, 0.3, -0.12); g.add(lab);
  const Is = [0, 10, 100]; let ii = 0; const Rv = [10, 20, 30]; let rv = 0;
  const applyB = () => { const R = Rv[rv]; Rx.lab.setText(`R = ${R} Ω`); const d = (R / 10 - 4 / 2); S.gsap.to(ndl.rotation, { y: -d * 0.6, duration: 0.5 }); lab.setText(d === 0 ? 'R/10 = 4/2 ⇒ R = 20 Ω: الكلفانومتر صفر (اتزان)' : `R = ${R} Ω: القنطرة غير متزنة، الكلفانومتر ينحرف`); };
  const applyA = () => { const I = Is[ii], dv = 12 - I * 0.01; Jv.set(dv, 0.5, `ΔV = 12 − ${I} × 0.01 = ${dv.toFixed(1)} V`); lampM.emissiveIntensity = ii === 0 ? 0.05 : ii === 1 ? 1 : 0.55; sw.children[1].setText(`${I} A`); lab.setText(ii === 2 ? 'تشغيل المحرك: سحب 100 A فيخفت المصباح' : ii === 1 ? 'سحب 10 A: الفولطية 11.9 V' : 'دائرة مفتوحة: ΔV = ε'); };
  applyA(); applyB();
  return {
    group: g,
    targets: [
      { obj: sw, hit: [sw.children[0], box], hint: V(-0.33, 0, 0.32), act: () => { ii = (ii + 1) % 3; applyA(); } },
      { obj: Rx, hint: V(0.08, 0, -0.14), act: () => { rv = (rv + 1) % 3; applyB(); } },
      { obj: gal, hint: V(0.3, 0, 0.06), act: () => { glow(gal, '#e03131', 0.6); lab.setText('المثال 6: I(abc) = 0.6 A ، V = 18 V ، I(adc) = 3 A ، ε = 3.6 × 5 + 3.6 × 1 = 21.6 V'); } },
    ],
    print(x, { P, inkText }) {
      inkText(x, 'ΔV = ε − I r  ،  R₁ / R₂ = R₃ / R₄', ...P(0.04, 0.44), { size: 36, color: '#c2410c', weight: 600 });
      inkText(x, 'مثال 5: 12 V ، 0.01 Ω ⇒ 11.9 V عند 10 A ، و 11 V عند 100 A', ...P(0.04, 0.52), { size: 22 });
      inkText(x, 'مثال 6: R/10 = 4/2 ⇒ R = 20 Ω (الشكل 19)', ...P(0.04, 0.59), { size: 22, color: '#6b6155' });
    },
    notes: [],
  };
};

/* ---------- 9-8 Electric power ---------- */
SCENES.epower = (S) => {
  const { THREE, V, ink, glow, label, jar } = S;
  const g = new THREE.Group(), Y = 0.03, xl = -0.34, xr = 0.08, zt = -0.28, zb = 0.08;
  const bat = cell(S, g, V(xl, Y, zb - 0.05), V(xl, Y, zt + 0.05), 'ε = 12 V , r = 0.05 Ω');
  wirePath(S, g, [V(xl, Y, zt + 0.05), V(xl, Y, zt), V(-0.2, Y, zt)]); wirePath(S, g, [V(-0.04, Y, zt), V(xr, Y, zt), V(xr, Y, zb), V(xl, Y, zb), V(xl, Y, zb - 0.05)]);
  const Rm = resistor(S, g, V(-0.2, Y, zt), V(-0.04, Y, zt), 'R = 3 Ω', '#ffa94d');
  const path = wirePath(S, g, [V(xl, Y, zt), V(xr, Y, zt), V(xr, Y, zb), V(xl, Y, zb), V(xl, Y, zt)], { draw: false });
  const fl = flowDots(S, g, path, 24, '#e03131');
  const JR = jar({ max: 760, color: '#e8590c', name: 'P_R', unit: 'W', digits: 1 }), Jr = jar({ max: 760, color: '#868e96', name: 'P_r', unit: 'W', digits: 2 });
  JR.position.set(0.2, 0, 0.12); Jr.position.set(0.36, 0, 0.12); g.add(JR, Jr);
  const Rs = [3, 0.5, 0.05], r = 0.05; let ri = 0, on = false;
  const Pl = (R) => (12 / (R + r)) ** 2 * R;
  const pan = panel(S, 0.32, 0.26, V(0.27, 0, -0.32), (c, W, H, R) => { const A2 = axes2d(c, W, H, { xl: 'R (log)', yl: 'P_R' }); const sx = (R2) => A2.ox + (Math.log10(R2) + 3) / 4 * A2.w, sy = (p) => A2.oy - p / 760 * A2.h;
    c.strokeStyle = '#e8590c'; c.lineWidth = 5; c.beginPath(); for (let i = 0; i <= 120; i++) { const R2 = Math.pow(10, -3 + 4 * i / 120); i ? c.lineTo(sx(R2), sy(Pl(R2))) : c.moveTo(sx(R2), sy(Pl(R2))); } c.stroke();
    c.setLineDash([8, 8]); c.strokeStyle = '#868e96'; c.beginPath(); c.moveTo(sx(r), A2.oy); c.lineTo(sx(r), sy(720)); c.stroke(); c.setLineDash([]);
    c.font = "600 24px 'Newsreader',serif"; c.fillStyle = '#2a241c'; c.textAlign = 'center'; c.fillText('R = r', sx(r), A2.oy + 32);
    c.fillStyle = '#c2255c'; c.beginPath(); c.arc(sx(R), sy(Pl(R)), 10, 0, 7); c.fill(); });
  g.add(pan);
  const lab = label('', { size: 0.03, color: '#c2410c' }); lab.position.set(-0.13, 0.2, zt); g.add(lab);
  const I = () => 12 / (Rs[ri] + r);
  const apply = () => { const R = Rs[ri], i = I(); Rm.lab.setText(`R = ${R} Ω`); pan.redraw(R); JR.set(on ? i * i * R : 0, 0.6, `P_R = ${on ? (i * i * R).toFixed(1) : 0} W`); Jr.set(on ? i * i * r : 0, 0.6, `P_r = ${on ? (i * i * r).toFixed(2) : 0} W`);
    lab.setText(on ? `I = ${i.toFixed(2)} A · المجهزة εI = ${(12 * i).toFixed(1)} W${R === r ? ' · أعظم قدرة للحمل (R = r)' : ''}` : 'أغلق الدائرة'); glow(Rm, '#ff6b6b', on ? Math.min(1, i * i * R / 760 + 0.2) : 0); };
  apply();
  return {
    group: g,
    targets: [
      { obj: Rm, hint: V(-0.12, 0, zt - 0.08), act: () => { ri = (ri + 1) % 3; on = true; apply(); } },
      { obj: bat, hint: V(xl - 0.06, 0, (zt + zb) / 2), act: () => { on = !on; apply(); } },
      { obj: pan, hit: [pan.board], hint: V(0.27, 0, -0.2), act: () => { ri = 2; on = true; apply(); } },
    ],
    update(dt) { fl.step(dt, on ? Math.min(0.2, 0.012 * I()) : 0, on); },
    print(x, { P, inkText }) {
      inkText(x, 'P = IV = I²R = V²/R  ،  E = P t', ...P(0.04, 0.44), { size: 36, color: '#c2410c', weight: 600 });
      inkText(x, 'مثال 7: 12 V ، r = 0.05 Ω ، R = 3 Ω ⇒ 46.3 W + 0.772 W = 47.1 W', ...P(0.04, 0.52), { size: 22 });
      inkText(x, 'أعظم نقل للقدرة إلى الحمل عندما R = r («فكر» ص 213)', ...P(0.04, 0.59), { size: 22, color: '#6b6155' });
    },
    notes: [],
  };
};

/* ---------- 9-9 Series ---------- */
SCENES.series = (S) => {
  const { THREE, V, ink, glow, label, show } = S;
  const g = new THREE.Group(), Y = 0.03, xl = -0.36, xr = 0.36, zt = -0.2, zb = 0.14;
  const bat = cell(S, g, V(xl, Y, zb - 0.06), V(xl, Y, zt + 0.06), '20 V');
  const xs = [-0.3, -0.18, -0.12, 0.0, 0.06, 0.18, 0.24, 0.36];
  wirePath(S, g, [V(xl, Y, zt + 0.06), V(xl, Y, zt), V(-0.3, Y, zt)]); wirePath(S, g, [V(-0.18, Y, zt), V(-0.12, Y, zt)]); wirePath(S, g, [V(0.0, Y, zt), V(0.06, Y, zt)]);
  const gapW = wirePath(S, g, [V(0.18, Y, zt), V(0.24, Y, zt)]); const lastWire = g.children[g.children.length - 1];
  wirePath(S, g, [V(0.24, Y, zt), V(xr, Y, zt), V(xr, Y, zb), V(xl, Y, zb), V(xl, Y, zb - 0.06)]);
  const Rv = [2, 3, 5], R = Rv.map((r, i) => resistor(S, g, V(xs[i * 2], Y, zt), V(xs[i * 2 + 1], Y, zt), `${r} Ω`));
  const bars = Rv.map((r, i) => { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 1, 16).translate(0, 0.5, 0), new THREE.MeshStandardMaterial({ color: '#2b8a3e', emissive: '#2b8a3e', emissiveIntensity: 0.4, transparent: true, opacity: 0.85 })); b.position.set((xs[i * 2] + xs[i * 2 + 1]) / 2, 0.05, zt - 0.08); b.scale.y = 0.001; g.add(b);
    const l = label('', { size: 0.024, color: '#2b8a3e' }); l.position.set(b.position.x, 0.05, zt - 0.08); g.add(l); b.lab = l; return b; });
  const hbBars = hitBox(S, 0.5, 0.25, 0.06, V(0, 0.12, zt - 0.08)); g.add(hbBars);
  const path = wirePath(S, g, [V(xl, Y, zt), V(xr, Y, zt), V(xr, Y, zb), V(xl, Y, zb), V(xl, Y, zt)], { draw: false });
  const fl = flowDots(S, g, path, 34, '#1c7ed6');
  const lab = label('', { size: 0.03, color: '#c2410c' }); lab.position.set(0, 0.3, zt); g.add(lab);
  let on = false, cut = false;
  const apply = () => { const I = on && !cut ? 2 : 0; bars.forEach((b, i) => { const v = I * Rv[i]; S.gsap.to(b.scale, { y: Math.max(0.001, v * 0.017), duration: 0.6 }); b.lab.position.y = 0.06 + v * 0.017; b.lab.setText(`${v} V`); });
    R[2].visible = !cut; lastWire.visible = true; lab.setText(cut ? 'انقطعت المقاومة 5 Ω: الدائرة مفتوحة والتيار صفر' : on ? 'R_eq = 2 + 3 + 5 = 10 Ω ⇒ I = 20/10 = 2 A في كل المقاومات' : 'أغلق الدائرة'); };
  apply();
  return {
    group: g,
    targets: [
      { obj: bat, hint: V(xl - 0.06, 0, (zt + zb) / 2), act: () => { on = !on; apply(); } },
      { obj: R[2], hint: V(0.3, 0, zt + 0.08), act: () => { cut = !cut; on = true; apply(); } },
      { obj: hbBars, hint: V(-0.1, 0, zt - 0.16), act: () => { on = true; cut = false; apply(); lab.setText('V = V₁ + V₂ + V₃ = 4 + 6 + 10 = 20 V'); } },
    ],
    update(dt) { fl.step(dt, on && !cut ? 0.08 : 0, on); },
    print(x, { P, inkText }) {
      inkText(x, 'R_eq = R₁ + R₂ + R₃  ،  I واحد  ،  V = ΣV', ...P(0.04, 0.46), { size: 33, color: '#c2410c', weight: 600 });
      inkText(x, 'مثال 8: 2 و 3 و 5 Ω مع 20 V ⇒ 10 Ω ، 2 A ، 4 / 6 / 10 V', ...P(0.04, 0.54), { size: 23 });
      inkText(x, 'أعمدة الجهد الخضراء فوق كل مقاومة', ...P(0.04, 0.61), { size: 22, color: '#6b6155' });
    },
    notes: [],
  };
};

/* ---------- 9-10 Parallel ---------- */
SCENES.parallel = (S) => {
  const { THREE, V, ink, glow, label, jar } = S;
  const g = new THREE.Group(), Y = 0.03, zA = -0.28, zB = 0.12, x0 = -0.34;
  const pan0 = block(S, 0.06, 0.12, 0.42, '#dee2e6'); pan0.position.set(x0 - 0.04, 0, (zA + zB) / 2); g.add(pan0);
  const l220 = label('220 V', { size: 0.03, color: '#c2410c' }); l220.position.set(x0 - 0.04, 0.16, (zA + zB) / 2); g.add(l220);
  wirePath(S, g, [V(x0, Y, zA), V(0.3, Y, zA)], { color: '#e8590c' }); wirePath(S, g, [V(x0, Y, zB), V(0.3, Y, zB)], { color: '#495057' });
  const dev = [{ x: -0.16, n: 'مصباح 60 W', P: 60, col: '#fff3bf' }, { x: 0.04, n: 'مروحة 100 W', P: 100, col: '#d0ebff' }, { x: 0.24, n: 'سخان 1000 W', P: 1000, col: '#ffc9c9' }];
  const objs = dev.map((d) => { const path = wirePath(S, g, [V(d.x, Y, zA), V(d.x, Y, zB)]); const o = new THREE.Group(); o.position.set(d.x, 0, (zA + zB) / 2); g.add(o);
    const body = ink(new THREE.BoxGeometry(0.08, 0.07, 0.07).translate(0, 0.035, 0), d.col, { thresh: 20 }); o.add(body); const l = label(d.n, { size: 0.022 }); l.position.y = 0.11; o.add(l);
    const fl = flowDots(S, g, path, 8, '#1c7ed6', 0.005); return { o, body, fl, on: false, d }; });
  const fan = new THREE.Group(); fan.position.set(0, 0.09, 0); objs[1].o.add(fan); for (let i = 0; i < 3; i++) { const b = ink(new THREE.BoxGeometry(0.05, 0.004, 0.014).translate(0.025, 0, 0), '#4dabf7', { edges: false }); b.rotation.y = i * 2.09; fan.add(b); }
  const J = jar({ max: 5, color: '#1c7ed6', name: 'I =', unit: 'A', digits: 2 }); J.position.set(0.37, 0, -0.32); g.add(J);
  const lab = label('', { size: 0.03, color: '#c2410c' }); lab.position.set(0, 0.28, zA); g.add(lab);
  const apply = (k) => { let I = 0, inv = 0; objs.forEach((o) => { if (o.on) { I += o.d.P / 220; inv += o.d.P / (220 * 220); } glow(o.body, '#f08c00', o.on ? 0.5 : 0); });
    J.set(I, 0.5, `I = ${I.toFixed(2)} A`); const d = objs[k].d;
    lab.setText(objs[k].on ? `${d.n}: V = 220 V ، I = ${(d.P / 220).toFixed(2)} A ، R = ${(220 * 220 / d.P).toFixed(0)} Ω${inv ? ` · R_eq = ${(1 / inv).toFixed(0)} Ω` : ''}` : `${d.n} مطفأ، والأجهزة الأخرى تعمل كما هي`); };
  return {
    group: g,
    targets: objs.map((o, k) => ({ obj: o.o, hint: V(o.d.x, 0, zB + 0.08), act: () => { o.on = !o.on; apply(k); } })),
    update(dt) { objs.forEach((o) => o.fl.step(dt, o.on ? Math.min(0.2, 0.03 + 0.03 * o.d.P / 220) : 0, o.on)); if (objs[1].on) fan.rotation.y += dt * 12; },
    print(x, { P, inkText }) {
      inkText(x, '1/R_eq = 1/R₁ + 1/R₂ + 1/R₃  ،  V واحد  ،  I = ΣI', ...P(0.04, 0.44), { size: 30, color: '#c2410c', weight: 600 });
      inkText(x, 'مثال 9: فرعان 80 Ω و 80 Ω على التوازي ⇒ R_eq = 40 Ω', ...P(0.04, 0.52), { size: 23 });
      inkText(x, 'قدرات الأجهزة في الرسم توضيحية (الشكل 25 ص 217)', ...P(0.04, 0.59), { size: 22, color: '#6b6155' });
    },
    notes: [],
  };
};

/* ---------- 9-11 Kirchhoff ---------- */
SCENES.kirchhoff = (S) => {
  const { THREE, V, ink, glow, label } = S;
  const g = new THREE.Group(), Y = 0.03;
  const P2 = { D: V(-0.3, Y, -0.04), C: V(0.0, Y, -0.04), B: V(0.24, Y, -0.04), F: V(0.0, Y, -0.28), G: V(0.3, Y, -0.28), E: V(-0.3, Y, 0.18), A: V(0.24, Y, 0.18), H: V(0.36, Y, 0.18) };
  const r3 = resistor(S, g, V(-0.22, Y, -0.04), V(-0.08, Y, -0.04), '3 Ω'), r6 = resistor(S, g, V(0.06, Y, -0.04), V(0.18, Y, -0.04), '6 Ω'), r4 = resistor(S, g, V(0.08, Y, -0.28), V(0.22, Y, -0.28), '4 Ω');
  wirePath(S, g, [P2.D, V(-0.22, Y, -0.04)]); wirePath(S, g, [V(-0.08, Y, -0.04), P2.C, V(0.06, Y, -0.04)]); wirePath(S, g, [V(0.18, Y, -0.04), P2.B, P2.A]);
  wirePath(S, g, [P2.C, P2.F, V(0.08, Y, -0.28)]); wirePath(S, g, [V(0.22, Y, -0.28), P2.G, V(0.36, Y, -0.28), V(0.36, Y, 0.1)]); wirePath(S, g, [P2.D, P2.E, P2.A]);
  const bat = cell(S, g, V(0.36, Y, 0.18), V(0.28, Y, 0.18), '6 V'); wirePath(S, g, [V(0.36, Y, 0.1), P2.H]); wirePath(S, g, [V(0.28, Y, 0.18), P2.A]);
  for (const [k, p] of Object.entries(P2)) { const l = label(k, { size: 0.022, border: false }); l.position.copy(p).add(V(-0.02, 0.03, -0.02)); g.add(l); }
  const nodeC = ink(new THREE.SphereGeometry(0.018, 16, 12), '#7048e8', { thresh: 60 }); nodeC.position.copy(P2.C).setY(0.04); g.add(nodeC);
  const p1 = wirePath(S, g, [P2.A, P2.E, P2.D, P2.C], { draw: false }), p2 = wirePath(S, g, [P2.A, P2.B, P2.C], { draw: false }), p3 = wirePath(S, g, [P2.C, P2.F, P2.G, V(0.36, Y, -0.28), P2.H, P2.A], { draw: false });
  const f1 = flowDots(S, g, p1, 18, '#1c7ed6'), f2 = flowDots(S, g, p2, 8, '#2b8a3e'), f3 = flowDots(S, g, p3, 22, '#e03131');
  const t1 = token(S, '①', '#1c7ed6', V(-0.15, 0, 0.07)), t2 = token(S, '②', '#e03131', V(0.15, 0, -0.17)); g.add(t1, t2);
  const lab = label('I₁ = 2/3 A (أزرق) · I₂ = 1/3 A (أخضر) · I₃ = 1 A (أحمر)', { size: 0.028, color: '#5f3dc4' }); lab.position.set(0, 0.24, -0.3); g.add(lab);
  return {
    group: g,
    targets: [
      { obj: nodeC, hint: P2.C.clone().add(V(0.04, 0, 0.08)), act: () => { glow(nodeC, '#7048e8', 0.8); lab.setText('نقطة التفرع C: I₁ + I₂ = I₃ ⇒ 2/3 + 1/3 = 1 A'); } },
      { obj: t1, hint: t1.position.clone(), act: () => { glow(r3, '#1c7ed6', 0.6); glow(r6, '#1c7ed6', 0.6); glow(r4, null, 0); lab.setText('الحلقة ABCDEA: I₂(6) = I₁(3) ⇒ I₂ = ½ I₁'); } },
      { obj: t2, hint: t2.position.clone(), act: () => { glow(r6, '#e03131', 0.6); glow(r4, '#e03131', 0.6); glow(r3, null, 0); lab.setText('الحلقة ABCFGHA: I₂(6) + I₃(4) = 6 V'); } },
    ],
    update(dt) { const k = 0.09; f1.step(dt, k * 2 / 3); f2.step(dt, k / 3); f3.step(dt, k); },
    print(x, { P, inkText }) {
      inkText(x, 'Σ I_in = Σ I_out  ،  Σ ΔV = 0', ...P(0.04, 0.46), { size: 36, color: '#c2410c', weight: 600 });
      inkText(x, 'مثال 12 (الشكل 34): I₁ = 2/3 A ، I₂ = 1/3 A ، I₃ = 1 A', ...P(0.04, 0.54), { size: 23 });
      inkText(x, 'مثال 10: 20I = 24 − 6 ⇒ I = 0.9 A · مثال 11: I = 0.5 A', ...P(0.04, 0.61), { size: 22, color: '#6b6155' });
    },
    notes: [],
  };
};

/* ================= Chapter 10 ================= */
function compass(S, r = 0.028) {
  const { THREE, ink } = S; const c = new THREE.Group();
  c.add(ink(new THREE.CylinderGeometry(r, r, 0.01, 24).translate(0, 0.005, 0), '#f8f9fa', { thresh: 20 }));
  const n = new THREE.Group(); n.position.y = 0.014; c.add(n);
  const a = new THREE.Mesh(new THREE.ConeGeometry(r * 0.28, r * 0.9, 4).rotateZ(-Math.PI / 2).translate(r * 0.45, 0, 0), new THREE.MeshStandardMaterial({ color: '#e03131' }));
  const b = new THREE.Mesh(new THREE.ConeGeometry(r * 0.28, r * 0.9, 4).rotateZ(Math.PI / 2).translate(-r * 0.45, 0, 0), new THREE.MeshStandardMaterial({ color: '#adb5bd' }));
  n.add(a, b); c.needle = n; c.point = (dx, dz, tween = true) => { const ang = -Math.atan2(dz, dx); if (tween) S.gsap.to(n.rotation, { y: ang, duration: S.reduced ? 0 : 0.6 }); else n.rotation.y = ang; }; return c;
}
function barMagnet(S, len = 0.24) {
  const { THREE, ink, label } = S; const m = new THREE.Group();
  const n = ink(new THREE.BoxGeometry(len / 2, 0.04, 0.05).translate(len / 4, 0.02, 0), '#ff6b6b'), s = ink(new THREE.BoxGeometry(len / 2, 0.04, 0.05).translate(-len / 4, 0.02, 0), '#74c0fc'); m.add(n, s);
  const ln = label('N', { size: 0.026, border: false }), ls = label('S', { size: 0.026, border: false }); ln.position.set(len / 4, 0.045, 0); ls.position.set(-len / 4, 0.045, 0); m.add(ln, ls); return m;
}
const DIP = (x, z, sgn = 1) => { const r2 = x * x + z * z, r = Math.sqrt(r2), ux = x / r, uz = z / r, md = sgn * ux; return [(3 * md * ux - sgn) / (r2 * r), (3 * md * uz) / (r2 * r)]; };
function helixTube(S, coils, rad, len, color = '#e8590c') {
  const { THREE, V, ink } = S; const pts = []; const n = coils * 24;
  for (let i = 0; i <= n; i++) { const u = i / n, a = u * coils * Math.PI * 2; pts.push(V(-len / 2 + u * len, Math.sin(a) * rad, Math.cos(a) * rad)); }
  return ink(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), n, 0.004, 6, false), color, { edges: false });
}

/* ---------- 10-1 Magnetic field ---------- */
SCENES.magfield = (S) => {
  const { THREE, V, ink, glow, label } = S;
  const g = new THREE.Group(), C = V(-0.06, 0, -0.04);
  const mag = barMagnet(S); mag.position.copy(C); g.add(mag);
  let sgn = 1; const ring = [];
  for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2; const c = compass(S, 0.022); c.position.set(C.x + Math.cos(a) * 0.22, 0, C.z + Math.sin(a) * 0.15); g.add(c); ring.push(c); }
  const mob = compass(S, 0.03); g.add(mob); const mpos = [[0.3, 0.0], [0.0, 0.28], [-0.3, 0.06], [0.08, -0.26]]; let mi = 0;
  const wire = ink(new THREE.CylinderGeometry(0.008, 0.008, 0.3, 10).translate(0, 0.15, 0), '#c9b48a'); wire.position.set(0.34, 0, -0.28); g.add(wire);
  const oc = compass(S, 0.026); oc.position.set(0.28, 0, -0.28); g.add(oc); let Ion = false;
  const lab = label('', { size: 0.03, color: '#c2410c' }); lab.position.set(C.x, 0.22, C.z - 0.2); g.add(lab);
  const orient = (tw) => { ring.forEach((c) => { const [bx, bz] = DIP(c.position.x - C.x, c.position.z - C.z, sgn); c.point(bx, bz, tw); });
    const [x, z] = mpos[mi]; mob.position.set(C.x + x, 0, C.z + z); const [bx, bz] = DIP(x, z, sgn); mob.point(bx, bz, tw); };
  orient(false); oc.point(0, -1, false); lab.setText('إبر البوصلات تتجه مع خطوط المجال: من N إلى S خارج المغناطيس');
  return {
    group: g,
    targets: [
      { obj: mag, hint: C.clone().add(V(0, 0, 0.1)), act: () => { sgn = -sgn; mag.rotation.y += Math.PI; orient(true); lab.setText('قلبنا الأقطاب: دارت الإبر كلها'); } },
      { obj: mob, hint: V(C.x + 0.3, 0, C.z + 0.1), act: () => { mi = (mi + 1) % 4; orient(true); glow(mob, '#f08c00', 0.5); lab.setText('اتجاه B عند النقطة هو اتجاه الإبرة فيها، وتضعف الشدة بالابتعاد'); } },
      { obj: wire, hit: [wire, oc.children[0]], hint: V(0.31, 0, -0.18), act: () => { Ion = !Ion; glow(wire, '#e8590c', Ion ? 0.7 : 0); oc.point(Ion ? 1 : 0, Ion ? 0 : -1); lab.setText(Ion ? 'أورستد 1820: التيار يحرف إبرة البوصلة' : 'لا تيار: الإبرة مع المجال الأرضي'); } },
    ],
    print(x, { P, inkText }) {
      inkText(x, 'اتجاه B = اتجاه إبرة البوصلة', ...P(0.04, 0.44), { size: 34, color: '#c2410c', weight: 600 });
      inkText(x, 'المجال حيّز حول المغناطيس تظهر فيه آثار قوته (الشكل 2 ص 229)', ...P(0.04, 0.52), { size: 22 });
      inkText(x, 'تجربة أورستد (الشكل 1): التيار يولد مجالاً مغناطيسياً', ...P(0.04, 0.59), { size: 22, color: '#6b6155' });
    },
    notes: [],
  };
};

/* ---------- 10-2 Flux ---------- */
SCENES.flux = (S) => {
  const { THREE, V, ink, glow, label, jar } = S;
  const g = new THREE.Group(), C = V(-0.06, 0.12, -0.06), H = 0.1;
  const mat = new THREE.LineBasicMaterial({ color: '#1c7ed6' }); const lines = [];
  for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) { const extra = (i + j) % 2 !== 0; const pts = [V(-0.36, C.y + i * 0.04, C.z + j * 0.04), V(0.24, C.y + i * 0.04, C.z + j * 0.04)]; const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat); l.visible = !extra; l.extra = extra; g.add(l); lines.push(l);
    const hd = new THREE.Mesh(new THREE.ConeGeometry(0.006, 0.016, 8).rotateZ(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#1c7ed6' })); hd.position.set(0.24, C.y + i * 0.04, C.z + j * 0.04); hd.visible = !extra; l.hd = hd; g.add(hd); }
  const fr = new THREE.Group(); fr.position.copy(C); g.add(fr);
  const s = 0.1; for (const [a, b] of [[[0, -s, -s], [0, s, -s]], [[0, s, -s], [0, s, s]], [[0, s, s], [0, -s, s]], [[0, -s, s], [0, -s, -s]]]) { const A2 = V(...a), B2 = V(...b), L = A2.distanceTo(B2); const m = ink(new THREE.CylinderGeometry(0.006, 0.006, L, 8), '#e8590c', { edges: false }); m.position.copy(A2).lerp(B2, 0.5); m.quaternion.setFromUnitVectors(V(0, 1, 0), B2.clone().sub(A2).normalize()); fr.add(m); }
  const An = S.arrow('#2b8a3e', 0.006); fr.add(An); An.point(V(0, 0, 0), V(0.12, 0, 0)); glow(An, '#2b8a3e', 1, 0);
  const post = block(S, 0.012, C.y - 0.1, 0.012, '#adb5bd'); post.position.set(C.x, 0, C.z); g.add(post);
  const hb = hitBox(S, 0.08, 0.22, 0.22, C); g.add(hb);
  const tB = token(S, 'B', '#1c7ed6', V(-0.33, 0, 0.26)); g.add(tB);
  const J = jar({ max: 0.017, color: '#2b8a3e', name: 'Φ =', unit: 'Wb', digits: 4 }); J.position.set(0.34, 0, -0.04); g.add(J);
  const lab = label('', { size: 0.03, color: '#c2410c' }); lab.position.set(C.x, 0.32, C.z); g.add(lab);
  const ths = [0, 53, 90]; let ti = 0, Bv = 0.2;
  const apply = () => { const th = ths[ti]; S.gsap.to(fr.rotation, { y: th * Math.PI / 180, duration: S.reduced ? 0 : 0.6 }); const phi = Bv * 0.04 * Math.cos(th * Math.PI / 180);
    J.set(phi, 0.6, `Φ = ${phi.toFixed(4)} Wb`); lines.forEach((l) => { l.visible = !l.extra || Bv > 0.2; l.hd.visible = l.visible; }); lab.setText(`B = ${Bv} T · A = 0.04 m² · θ = ${th}° ⇒ Φ = BA cosθ = ${phi.toFixed(4)} Wb`); };
  apply();
  return {
    group: g,
    targets: [
      { obj: fr, hit: [hb], hint: C.clone().setY(0).add(V(0, 0, 0.16)), act: () => { ti = (ti + 1) % 3; apply(); } },
      { obj: tB, hint: tB.position.clone(), act: () => { Bv = Bv === 0.2 ? 0.4 : 0.2; glow(tB, '#1c7ed6', Bv > 0.2 ? 0.6 : 0); apply(); } },
      { obj: J, hit: J.hit, hint: V(0.34, 0, 0.06), act: () => { glow(J.hit[0], '#2b8a3e', 0.6); lab.setText('المثال 1: Φ = 5.31 × 10⁻⁵ × 0.215 × 0.28 × cos53° = 1.92 × 10⁻⁶ T·m²'); } },
    ],
    print(x, { P, inkText }) {
      inkText(x, 'B = Φ / A  ،  Φ = B A cosθ', ...P(0.04, 0.44), { size: 38, color: '#c2410c', weight: 600 });
      inkText(x, '1 T = 1 Wb/m² ، 1 Wb = 10⁸ Maxwell · سهم أخضر: متجه المساحة', ...P(0.04, 0.52), { size: 22 });
      inkText(x, 'B = 0.2 T و A = 0.04 m² قيم توضيحية', ...P(0.04, 0.59), { size: 22, color: '#6b6155' });
    },
    notes: [],
  };
};

/* ---------- 10-3, 10-4 Earth's field ---------- */
SCENES.earthmag = (S) => {
  const { THREE, V, ink, glow, label } = S;
  const g = new THREE.Group(), C = V(-0.08, 0.17, -0.06), R = 0.15;
  const earth = new THREE.Group(); earth.position.copy(C); g.add(earth);
  earth.add(new THREE.Mesh(new THREE.SphereGeometry(R, 40, 28), new THREE.MeshStandardMaterial({ color: '#74c0fc', transparent: true, opacity: 0.28, depthWrite: false })));
  const circ = (rot, r = R) => { const pts = []; for (let i = 0; i <= 72; i++) { const a = i / 72 * Math.PI * 2; pts.push(V(Math.cos(a) * r, 0, Math.sin(a) * r)); } const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: '#1864ab' })); l.rotation.copy(rot); return l; };
  earth.add(circ(new THREE.Euler(0, 0, 0))); for (let k = 0; k < 3; k++) earth.add(circ(new THREE.Euler(Math.PI / 2, k * Math.PI / 3, 0, 'YXZ')));
  const axis = ink(new THREE.CylinderGeometry(0.004, 0.004, R * 2.6, 8), '#495057', { edges: false }); earth.add(axis);
  const mg = new THREE.Group(); mg.rotation.z = 11 * Math.PI / 180; earth.add(mg);
  const bm = barMagnet(S, 0.2); bm.rotation.z = -Math.PI / 2; bm.position.y = 0; mg.add(bm); bm.children.forEach((c) => c.isSprite && (c.visible = false));
  const lS = label('S مغناطيسي', { size: 0.022, color: '#1864ab' }); lS.position.set(0, R + 0.04, 0); mg.add(lS);
  const dip = new THREE.Group(); g.add(dip); dip.add(ink(new THREE.CylinderGeometry(0.03, 0.03, 0.006, 20), '#fff3bf', { thresh: 20 }));
  const nd = new THREE.Group(); dip.add(nd); nd.add(new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.006, 0.006), new THREE.MeshStandardMaterial({ color: '#e03131' })));
  const cmp = compass(S, 0.03); cmp.position.set(0.3, 0, 0.18); g.add(cmp); cmp.point(1, 0, false);
  const ln = label('N جغرافي', { size: 0.022 }); ln.position.set(0.3, 0.04, 0.1); g.add(ln);
  const lab = label('', { size: 0.03, color: '#c2410c' }); lab.position.set(C.x, 0.42, C.z); g.add(lab);
  const lats = [0, 30, 60, 90]; let li = 0, spin = false, dec = false;
  const placeDip = () => { const lat = lats[li] * Math.PI / 180; const p = V(R * Math.cos(lat) + 0.035, R * Math.sin(lat) + 0.035, 0); dip.position.copy(C).add(p).add(V(0.02, 0, 0.0));
    const I = Math.atan(2 * Math.tan(Math.min(lat, 1.5707))); dip.rotation.set(0, 0, 0); dip.rotation.z = lat - Math.PI / 2 + 0.0; nd.rotation.z = 0; dip.lookAt(dip.position.clone().add(p.clone().normalize())); dip.rotateX(Math.PI / 2);
    nd.rotation.y = 0; nd.rotation.z = -(lats[li] === 90 ? Math.PI / 2 : I);
    lab.setText(`خط العرض المغناطيسي ${lats[li]}° ⇒ زاوية الميل ≈ ${(lats[li] === 90 ? 90 : I * 180 / Math.PI).toFixed(0)}°`); };
  placeDip();
  return {
    group: g,
    targets: [
      { obj: earth, hint: C.clone().setY(0).add(V(0, 0, R + 0.08)), act: () => { spin = !spin; lab.setText('محور المغناطيس مائل نحو 11° عن محور الدوران الجغرافي'); } },
      { obj: dip, hint: V(C.x + R + 0.12, 0, C.z + 0.08), act: () => { li = (li + 1) % 4; placeDip(); } },
      { obj: cmp, hint: V(0.3, 0, 0.28), act: () => { dec = !dec; cmp.point(Math.cos(dec ? 0.2 : 0), -Math.sin(dec ? 0.2 : 0)); lab.setText(dec ? 'زاوية الانحراف: بين الشمال المغناطيسي والجغرافي (0° إلى 180°)' : 'على خط الانحراف الصفري تشير الإبرة إلى الشمال الجغرافي'); } },
    ],
    update(dt) { if (spin) earth.rotation.y += dt * 0.6; },
    print(x, { P, inkText }) {
      inkText(x, 'الميل: 0° عند الاستواء ← 90° عند القطب', ...P(0.04, 0.44), { size: 33, color: '#c2410c', weight: 600 });
      inkText(x, 'المحور المغناطيسي مائل نحو 11° عن الجغرافي (الشكلان 5 و 6 ص 232)', ...P(0.04, 0.52), { size: 21 });
      inkText(x, 'زوايا الميل الوسطى في الرسم من نموذج ثنائي القطب (tan I = 2 tanλ)', ...P(0.04, 0.59), { size: 21, color: '#6b6155' });
    },
    notes: [],
  };
};

/* ---------- 10-6 Force on a wire ---------- */
SCENES.wireforce = (S) => {
  const { THREE, V, ink, glow, arrow, label, jar } = S;
  const g = new THREE.Group(), C = V(-0.04, 0, -0.06);
  const base = block(S, 0.12, 0.03, 0.3, '#868e96'); base.position.set(C.x, 0, C.z); g.add(base);
  const pN = block(S, 0.12, 0.14, 0.05, '#ff6b6b'); pN.position.set(C.x, 0.03, C.z - 0.125); g.add(pN); const pS = block(S, 0.12, 0.14, 0.05, '#74c0fc'); pS.position.set(C.x, 0.03, C.z + 0.125); g.add(pS);
  const lN = label('N', { size: 0.026, border: false }), lS2 = label('S', { size: 0.026, border: false }); lN.position.set(C.x, 0.2, C.z - 0.125); lS2.position.set(C.x, 0.2, C.z + 0.125); g.add(lN, lS2);
  const wire = new THREE.Group(); wire.position.set(C.x, 0.12, C.z); g.add(wire);
  const rod = ink(new THREE.CylinderGeometry(0.006, 0.006, 0.36, 10).rotateZ(Math.PI / 2), '#c9b48a', { edges: false }); wire.add(rod);
  const F = arrow('#e03131', 0.008); wire.add(F); glow(F, '#e03131', 1, 0); F.visible = false;
  const Bl = arrow('#1c7ed6', 0.005); g.add(Bl); glow(Bl, '#1c7ed6', 1, 0); Bl.point(V(C.x - 0.08, 0.1, C.z - 0.09), V(C.x - 0.08, 0.1, C.z + 0.09));
  const bat = block(S, 0.08, 0.05, 0.05, '#495057'); bat.position.set(0.3, 0, -0.3); g.add(bat);
  const tR = token(S, '⇄', '#c2410c', V(-0.34, 0, 0.27)), tA = token(S, 'θ', '#7048e8', V(0.34, 0, 0.27)); g.add(tR, tA);
  const J = jar({ max: 3.2, color: '#e03131', name: 'F =', unit: 'N', digits: 2 }); J.position.set(0.34, 0, 0.04); g.add(J);
  const lab = label('', { size: 0.03, color: '#c2410c' }); lab.position.set(C.x, 0.34, C.z); g.add(lab);
  let on = false, dir = 1, ai = 0; const ang = [90, 45, 0];
  const apply = () => { const th = ang[ai] * Math.PI / 180; S.gsap.to(wire.rotation, { y: (90 - ang[ai]) * Math.PI / 180, duration: 0.5 }); const f = on ? 3 * Math.sin(th) : 0;
    F.visible = on && f > 0.01; F.point(V(0, 0, 0), V(0, dir * 0.05 * f, 0)); S.gsap.to(wire.position, { y: 0.12 + (on ? dir * 0.01 * f : 0), duration: 0.5 });
    J.set(f, 0.5, `F = ${f.toFixed(2)} N`); lab.setText(on ? `F = ILB sinθ = 20 × 0.5 × 0.3 × sin${ang[ai]}° = ${f.toFixed(2)} N ${dir > 0 ? '↑' : '↓'}` : 'أغلق الدائرة'); glow(rod, '#e8590c', on ? 0.5 : 0); };
  apply();
  return {
    group: g,
    targets: [
      { obj: bat, hint: V(0.3, 0, -0.2), act: () => { on = !on; apply(); } },
      { obj: tR, hint: tR.position.clone(), act: () => { dir = -dir; on = true; apply(); } },
      { obj: tA, hint: tA.position.clone(), act: () => { ai = (ai + 1) % 3; on = true; apply(); } },
    ],
    print(x, { P, inkText }) {
      inkText(x, 'F = I L B sinθ', ...P(0.04, 0.44), { size: 40, color: '#c2410c', weight: 600 });
      inkText(x, 'مثال 3: L = 0.5 m ، I = 20 A ، F = 3 N ⇒ B = 0.3 T', ...P(0.04, 0.52), { size: 23 });
      inkText(x, 'B من N إلى S (أزرق) · القوة (أحمر) عمودية على I و B', ...P(0.04, 0.59), { size: 22, color: '#6b6155' });
    },
    notes: [],
  };
};

/* ---------- 10-7 Charged particle circle ---------- */
SCENES.chargecircle = (S) => {
  const { THREE, V, ink, glow, arrow, label, dots } = S;
  const g = new THREE.Group(), C = V(-0.02, 0.006, -0.06), W = 0.6, Dd = 0.5;
  const board = block(S, W, 0.004, Dd, '#eef2ff'); board.position.copy(C).setY(0); g.add(board);
  const xs = []; for (let i = 0; i < 8; i++) for (let j = 0; j < 6; j++) { const x = C.x - W / 2 + 0.04 + i * 0.075, z = C.z - Dd / 2 + 0.04 + j * 0.085, d = 0.007; xs.push(V(x - d, 0.006, z - d), V(x + d, 0.006, z + d), V(x - d, 0.006, z + d), V(x + d, 0.006, z - d)); }
  g.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(xs), new THREE.LineBasicMaterial({ color: '#748ffc' })));
  const p = ink(new THREE.SphereGeometry(0.016, 16, 12), '#ff6b6b', { thresh: 60 }); g.add(p);
  const lq = label('+', { size: 0.024, border: false }); p.add(lq); lq.position.y = 0.02;
  const Av = arrow('#2b8a3e', 0.006), Af = arrow('#e03131', 0.006); [Av, Af].forEach((a, i) => { g.add(a); glow(a, ['#2b8a3e', '#e03131'][i], 1, 0); });
  const tr = dots(60, '#f59f00', 0.004); g.add(tr);
  const tv = token(S, '2υ', '#2b8a3e', V(0.35, 0, 0.27)), tq = token(S, '±', '#e03131', V(-0.35, 0, 0.27)); g.add(tv, tq);
  const lab = label('', { size: 0.03, color: '#c2410c' }); lab.position.set(C.x, 0.12, C.z - Dd / 2 - 0.04); g.add(lab);
  let run = false, k = 1, q = 1, t = 0; const r0 = 0.09, w0 = 1.6;
  const start = V(C.x - 0.12, 0.02, C.z + 0.12);
  const place = () => { const r = r0 * k, cz = start.z - q * r, ph = w0 * t; const x = start.x + r * Math.sin(ph), z = cz + q * r * Math.cos(ph);
    p.position.set(x, 0.02, z); const vdir = V(Math.cos(ph), 0, -q * Math.sin(ph)), fdir = V(start.x - x + 0, 0, cz - z).normalize().multiplyScalar(1); fdir.x = (start.x + 0 - x); fdir.copy(V(start.x - x + 0, 0, cz - z)).setX(-(x - start.x) + 0); 
    const cx = start.x; const fd = V(cx - x, 0, cz - z).normalize(); Av.point(p.position, p.position.clone().addScaledVector(vdir, 0.06 * k)); Af.point(p.position, p.position.clone().addScaledVector(fd, 0.05));
    for (let i = 0; i < 60; i++) { const pp = ph - i * 0.1; const ok = run && pp > 0; tr.setAt(i, start.x + r * Math.sin(pp), 0.01, cz + q * r * Math.cos(pp), ok ? 1 : 0); } tr.commit();
    lab.setText(`r = mυ/qB ⇒ ${k === 2 ? 'سرعة مضاعفة: r مضاعف' : 'r₀'} · الشحنة ${q > 0 ? 'موجبة' : 'سالبة'} (المجال × داخل الصفحة)`); };
  place();
  return {
    group: g,
    targets: [
      { obj: p, hint: start.clone().setY(0).add(V(0, 0, 0.08)), act: () => { run = !run; t = 0; } },
      { obj: tv, hint: tv.position.clone(), act: () => { k = k === 1 ? 2 : 1; glow(tv, '#2b8a3e', k === 2 ? 0.6 : 0); t = 0; run = true; } },
      { obj: tq, hint: tq.position.clone(), act: () => { q = -q; lq.setText(q > 0 ? '+' : '−'); p.material.uniforms.uColor.value.set(q > 0 ? '#ff6b6b' : '#74c0fc'); t = 0; run = true; } },
    ],
    update(dt) { if (run) t += dt / k; place(); },
    print(x, { P, inkText }) {
      inkText(x, 'm υ² / r = q υ B  ⇒  r = m υ / q B', ...P(0.04, 0.44), { size: 34, color: '#c2410c', weight: 600 });
      inkText(x, 'القوة المغناطيسية (أحمر) قوة مركزية عمودية على السرعة (أخضر)', ...P(0.04, 0.52), { size: 22 });
      inkText(x, 'الشكل 10 ص 236: × تعني مجالاً داخلاً في الصفحة', ...P(0.04, 0.59), { size: 22, color: '#6b6155' });
    },
    notes: [],
  };
};

/* ---------- 10-8 Field of a long wire ---------- */
SCENES.wirefield = (S) => {
  const { THREE, V, ink, glow, label, jar } = S;
  const g = new THREE.Group(), C = V(-0.08, 0, -0.04);
  const board = block(S, 0.5, 0.008, 0.5, '#f8f0dd'); board.position.copy(C); g.add(board);
  const wire = ink(new THREE.CylinderGeometry(0.008, 0.008, 0.38, 10).translate(0, 0.17, 0), '#c9b48a'); wire.position.copy(C); g.add(wire);
  const Ia = S.arrow('#e8590c', 0.007); g.add(Ia); glow(Ia, '#e8590c', 1, 0);
  const rs = ringSet(S, 3, '#1c7ed6', 0.012); g.add(rs); [0.07, 0.13, 0.2].forEach((r, i) => rs.setRing(i, C.x, C.z, r, 0.9));
  const cs = []; for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; const c = compass(S, 0.016); c.position.set(C.x + Math.cos(a) * 0.1, 0.008, C.z + Math.sin(a) * 0.1); g.add(c); cs.push([c, a]); }
  const probe = token(S, 'r', '#7048e8', V(C.x + 0.07, 0, C.z + 0.26)); g.add(probe);
  const hand = new THREE.Group(); hand.position.set(0.3, 0, -0.26); g.add(hand);
  hand.add(ink(new THREE.CylinderGeometry(0.035, 0.04, 0.06, 16).translate(0, 0.03, 0), '#ffe8cc', { thresh: 30 }));
  const th = ink(new THREE.CylinderGeometry(0.009, 0.01, 0.07, 10).translate(0, 0.035, 0), '#ffd8a8'); th.position.y = 0.06; hand.add(th);
  const cu = curlArrow(S, 0.055, '#1c7ed6', 4.2); cu.position.y = 0.035; hand.add(cu);
  const J = jar({ max: 3.2, color: '#1c7ed6', name: 'B =', unit: 'µT', digits: 1 }); J.position.set(0.32, 0, 0.12); g.add(J);
  const lab = label('', { size: 0.03, color: '#c2410c' }); lab.position.set(C.x, 0.44, C.z); g.add(lab);
  let dir = 1, ri = 2;
  const apply = () => { Ia.point(V(C.x, 0.2, C.z + 0.02), V(C.x, dir > 0 ? 0.34 : 0.06, C.z + 0.02)); cs.forEach(([c, a]) => c.point(-Math.sin(a) * -dir, Math.cos(a) * -dir)); cu.scale.set(1, dir, dir); hand.rotation.x = dir > 0 ? 0 : Math.PI; hand.position.y = dir > 0 ? 0 : 0.14;
    const r = ri + 1, B = 2e-7 * 15 / r * 1e6; S.gsap.to(probe.position, { x: C.x + 0.07 * r, duration: 0.4 }); J.set(B, 0.5, `B = ${B.toFixed(1)} µT`); lab.setText(`I = 15 A ، r = ${r} m ⇒ B = μ₀I/2πr = ${B.toFixed(1)} × 10⁻⁶ T`); };
  apply();
  return {
    group: g,
    targets: [
      { obj: wire, hint: C.clone().add(V(0.03, 0, 0.06)), act: () => { dir = -dir; apply(); glow(wire, '#e8590c', 0.6); } },
      { obj: probe, hint: V(C.x + 0.14, 0, C.z + 0.33), act: () => { ri = (ri + 1) % 3; apply(); } },
      { obj: hand, hint: V(0.3, 0, -0.16), act: () => { glow(hand, '#f08c00', 0.6); lab.setText('الإبهام مع التيار، والأصابع تلتف باتجاه خطوط المجال'); } },
    ],
    print(x, { P, inkText }) {
      inkText(x, 'B = μ₀ I / 2π r  ،  μ₀ = 4π × 10⁻⁷ Wb/A·m', ...P(0.04, 0.44), { size: 31, color: '#c2410c', weight: 600 });
      inkText(x, 'مثال 4: I = 15 A ، r = 3 m ⇒ B = 1 × 10⁻⁶ T', ...P(0.04, 0.52), { size: 23 });
      inkText(x, 'المجس يُنقل بين 1 و 2 و 3 m (مقياس الرسم مصغر)', ...P(0.04, 0.59), { size: 22, color: '#6b6155' });
    },
    notes: [],
  };
};

/* ---------- 10-9 Parallel wires ---------- */
SCENES.parallelwires = (S) => {
  const { THREE, V, ink, glow, arrow, label } = S;
  const g = new THREE.Group(), Z = -0.06, H = 0.34;
  const mkW = (col) => { const w = new THREE.Group(); g.add(w); const a = ink(new THREE.CylinderGeometry(0.006, 0.006, 1, 8).translate(0, 0.5, 0), col, { edges: false }), b = ink(new THREE.CylinderGeometry(0.006, 0.006, 1, 8).translate(0, 0.5, 0), col, { edges: false }); w.add(a, b);
    const tp = block(S, 0.03, 0.02, 0.03, '#868e96'); const bt = block(S, 0.03, 0.02, 0.03, '#868e96'); g.add(tp, bt); const rs = ringSet(S, 3, '#1c7ed6'); g.add(rs); const F = arrow('#e03131', 0.007); g.add(F); glow(F, '#e03131', 1, 0);
    const ia = arrow('#e8590c', 0.006); g.add(ia); glow(ia, '#e8590c', 1, 0); return { w, a, b, tp, bt, rs, F, ia }; };
  const W1 = mkW('#c9b48a'), W2 = mkW('#c9b48a');
  const hb1 = hitBox(S, 0.06, H, 0.06, V(-0.1, H / 2, Z)), hb2 = hitBox(S, 0.06, H, 0.06, V(0.1, H / 2, Z)); g.add(hb1, hb2);
  const tD = token(S, 'r', '#7048e8', V(0.0, 0, 0.27)); g.add(tD);
  const lab = label('', { size: 0.03, color: '#c2410c' }); lab.position.set(0, 0.44, Z); g.add(lab);
  let on = false, d2 = 1, dist = 0.24; const st = { b: 0 };
  const setWire = (W, x, bend, dirI) => { const top = V(x, H, Z), bot = V(x, 0.02, Z), mid = V(x + bend, H / 2, Z);
    W.tp.position.set(x, H, Z); W.bt.position.set(x, 0, Z);
    for (const [m, a2, b2] of [[W.a, bot, mid], [W.b, mid, top]]) { m.position.copy(a2); const d = b2.clone().sub(a2); m.scale.y = d.length(); m.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()); }
    [0.1, 0.18, 0.26].forEach((y, i) => { W.rs.setRing(i, x + bend * (1 - Math.abs(y - H / 2) / (H / 2)), Z, on ? 0.045 : 0, 0.8); W.rs.children[i].position.y = y; });
    W.ia.visible = on; W.ia.point(V(x + 0.025, dirI > 0 ? 0.06 : 0.16, Z), V(x + 0.025, dirI > 0 ? 0.16 : 0.06, Z)); };
  const draw = () => { const b = st.b; setWire(W1, -dist / 2, b, 1); setWire(W2, dist / 2, -b, d2);
    W1.F.visible = W2.F.visible = on && Math.abs(b) > 0.001; const s = Math.sign(b) * 0.06; W1.F.point(V(-dist / 2 + b, H / 2, Z), V(-dist / 2 + b + s, H / 2, Z)); W2.F.point(V(dist / 2 - b, H / 2, Z), V(dist / 2 - b - s, H / 2, Z)); };
  const apply = () => { const target = on ? (d2 > 0 ? 1 : -1) * (dist < 0.2 ? 0.03 : 0.015) : 0; S.gsap.to(st, { b: target, duration: S.reduced ? 0 : 0.6, onUpdate: draw });
    const FL = 2e-7 * 10 * 10 / (dist < 0.2 ? 0.05 : 0.1); lab.setText(on ? `${d2 > 0 ? 'تياران متشابهان: تجاذب' : 'تياران متعاكسان: تنافر'} · I = 10 A ، r = ${dist < 0.2 ? 5 : 10} cm ⇒ F/L = ${(FL * 1e4).toFixed(0)} × 10⁻⁴ N/m` : 'أغلق الدائرتين'); };
  draw(); apply();
  return {
    group: g,
    targets: [
      { obj: W1.w, hit: [hb1], hint: V(-0.16, 0, Z + 0.1), act: () => { on = !on; apply(); } },
      { obj: W2.w, hit: [hb2], hint: V(0.16, 0, Z + 0.1), act: () => { d2 = -d2; on = true; apply(); } },
      { obj: tD, hint: tD.position.clone(), act: () => { dist = dist > 0.2 ? 0.12 : 0.24; on = true; apply(); } },
    ],
    print(x, { P, inkText }) {
      inkText(x, 'F / L = μ₀ I₁ I₂ / 2π r', ...P(0.04, 0.44), { size: 38, color: '#c2410c', weight: 600 });
      inkText(x, 'الأمبير: تياران 1 A بينهما 1 m ⇒ 2 × 10⁻⁷ N/m (الشكل 12)', ...P(0.04, 0.52), { size: 22 });
      inkText(x, 'التياران 10 A والأبعاد 5 و 10 cm قيم توضيحية', ...P(0.04, 0.59), { size: 22, color: '#6b6155' });
    },
    notes: [],
  };
};

/* ---------- 10-10 Solenoid ---------- */
SCENES.solenoid = (S) => {
  const { THREE, V, ink, glow, label, jar } = S;
  const g = new THREE.Group(), C = V(-0.06, 0.1, -0.06), LEN = 0.34, RAD = 0.06;
  let coil = null; const mkCoil = (n) => { if (coil) { g.remove(coil); coil.geometry.dispose(); } coil = helixTube(S, n, RAD, LEN); coil.position.copy(C); g.add(coil); };
  mkCoil(10);
  const hb = hitBox(S, LEN, 0.14, 0.14, C); g.add(hb);
  const fl = new THREE.Group(); g.add(fl); const fm = new THREE.LineBasicMaterial({ color: '#1c7ed6' });
  for (const dz of [-0.03, 0, 0.03]) fl.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([V(C.x - LEN / 2 - 0.03, C.y, C.z + dz), V(C.x + LEN / 2 + 0.03, C.y, C.z + dz)]), fm));
  for (const s of [1, -1]) for (const k of [1, 1.6]) { const pts = []; for (let i = 0; i <= 60; i++) { const a = i / 60 * Math.PI; pts.push(V(C.x + Math.cos(a) * (LEN / 2 + 0.03), C.y, C.z + s * (0.03 + Math.sin(a) * 0.1 * k))); } fl.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), fm)); }
  const fd = flowDots(S, g, wirePath(S, g, [V(C.x - LEN / 2, C.y, C.z), V(C.x + LEN / 2, C.y, C.z)], { draw: false }), 8, '#1c7ed6', 0.007);
  const cmp = compass(S, 0.03); cmp.position.set(C.x + LEN / 2 + 0.08, 0, C.z); g.add(cmp); cmp.point(0, 1, false);
  const tN = token(S, 'N', '#e8590c', V(-0.34, 0, 0.27)), tI = token(S, '2I', '#c2410c', V(0.34, 0, 0.27)); g.add(tN, tI);
  const J = jar({ max: 0.011, color: '#1c7ed6', name: 'B =', unit: 'T', digits: 4 }); J.position.set(0.34, 0, -0.3); g.add(J);
  const lab = label('', { size: 0.03, color: '#c2410c' }); lab.position.set(C.x, 0.3, C.z); g.add(lab);
  let on = false, N = 100, I = 4;
  const B = () => 4 * Math.PI * 1e-7 * N * I / 0.2;
  const apply = () => { fl.visible = on; cmp.point(on ? 1 : 0, on ? 0 : 1); glow(coil, '#e8590c', on ? 0.5 : 0); J.set(on ? B() : 0, 0.5, `B = ${on ? (B() * 1e3).toFixed(1) : 0} × 10⁻³ T`); lab.setText(on ? `B = μ₀NI/L = 4π × 10⁻⁷ × ${N} × ${I} / 0.2` : 'أغلق الدائرة'); };
  apply();
  return {
    group: g,
    targets: [
      { obj: hb, hint: C.clone().setY(0).add(V(0, 0, 0.12)), act: () => { on = !on; apply(); } },
      { obj: tN, hint: tN.position.clone(), act: () => { N = N === 100 ? 200 : 100; mkCoil(N / 10); on = true; apply(); } },
      { obj: tI, hint: tI.position.clone(), act: () => { I = I === 4 ? 8 : 4; glow(tI, '#c2410c', I === 8 ? 0.6 : 0); on = true; apply(); } },
    ],
    update(dt) { fd.step(dt, on ? 0.1 : 0, on); },
    print(x, { P, inkText }) {
      inkText(x, 'B = μ₀ N I / L = μ₀ n I', ...P(0.04, 0.44), { size: 38, color: '#c2410c', weight: 600 });
      inkText(x, 'مثال 5: N = 100 ، L = 20 cm ، I = 4 A ⇒ B = 2.5 × 10⁻³ T', ...P(0.04, 0.52), { size: 22 });
      inkText(x, 'داخل الملف مجال منتظم، وخارجه يشبه مجال ساق مغناطيسية', ...P(0.04, 0.59), { size: 22, color: '#6b6155' });
    },
    notes: [],
  };
};

/* ---------- 10-11 Torque on a coil (motor) ---------- */
SCENES.coiltorque = (S) => {
  const { THREE, V, ink, glow, arrow, label, jar } = S;
  const g = new THREE.Group(), C = V(-0.06, 0.13, -0.06);
  const pN = block(S, 0.08, 0.2, 0.2, '#ff6b6b'); pN.position.set(C.x - 0.2, 0.0, C.z); g.add(pN); const pS = block(S, 0.08, 0.2, 0.2, '#74c0fc'); pS.position.set(C.x + 0.2, 0.0, C.z); g.add(pS);
  const lN = label('N', { size: 0.026, border: false }), lS2 = label('S', { size: 0.026, border: false }); lN.position.set(C.x - 0.2, 0.23, C.z); lS2.position.set(C.x + 0.2, 0.23, C.z); g.add(lN, lS2);
  const coil = new THREE.Group(); coil.position.copy(C); g.add(coil); const b2 = 0.09, a2 = 0.1;
  for (const [p1, p2] of [[[-b2, 0, -a2], [-b2, 0, a2]], [[b2, 0, -a2], [b2, 0, a2]], [[-b2, 0, a2], [b2, 0, a2]], [[-b2, 0, -a2], [b2, 0, -a2]]]) { const A1 = V(...p1), B1 = V(...p2), L = A1.distanceTo(B1); const m = ink(new THREE.CylinderGeometry(0.006, 0.006, L, 8), '#e8590c', { edges: false }); m.position.copy(A1).lerp(B1, 0.5); m.quaternion.setFromUnitVectors(V(0, 1, 0), B1.clone().sub(A1).normalize()); coil.add(m); }
  const axle = ink(new THREE.CylinderGeometry(0.004, 0.004, 0.36, 8).rotateX(Math.PI / 2), '#868e96', { edges: false }); axle.position.copy(C); g.add(axle);
  const comm = ink(new THREE.CylinderGeometry(0.018, 0.018, 0.03, 16).rotateX(Math.PI / 2), '#ffd43b'); comm.position.copy(C).add(V(0, 0, 0.17)); g.add(comm);
  const F1 = arrow('#e03131', 0.007), F2 = arrow('#e03131', 0.007); g.add(F1, F2); glow(F1, '#e03131', 1, 0); glow(F2, '#e03131', 1, 0);
  const hb = hitBox(S, 0.22, 0.22, 0.24, C); g.add(hb);
  const sw = token(S, 'I', '#e8590c', V(-0.34, 0, 0.27)), tA = token(S, 'θ', '#7048e8', V(0.34, 0, 0.27)); g.add(sw, tA);
  const J = jar({ max: 1.4, color: '#7048e8', name: 'τ =', unit: '× 10⁻⁴ N·m', digits: 2 }); J.position.set(0.34, 0, -0.3); g.add(J);
  const lab = label('', { size: 0.03, color: '#c2410c' }); lab.position.set(C.x, 0.4, C.z); g.add(lab);
  let on = false, motor = false, phi = 0, w = 0; const angs = [0, Math.PI / 4, Math.PI / 2]; let ai = 0;
  const show2 = () => { coil.rotation.z = phi; const c = Math.cos(phi), s = Math.sin(phi); const p1 = V(C.x - b2 * c, C.y - b2 * s, C.z + 0.11), p2 = V(C.x + b2 * c, C.y + b2 * s, C.z + 0.11);
    const tau = 1.35 * Math.abs(c); F1.visible = F2.visible = on; F1.point(p1, p1.clone().add(V(0, -0.07, 0))); F2.point(p2, p2.clone().add(V(0, 0.07, 0)));
    return tau; };
  const txt = () => { const tau = on ? show2() : (show2(), 0); J.set(tau, 0.2, `τ = ${tau.toFixed(2)} × 10⁻⁴ N·m`); };
  show2(); txt(); lab.setText('العزم أعظم حين يوازي مستوى الملف خطوط المجال (θ = 90°)');
  return {
    group: g,
    targets: [
      { obj: sw, hint: sw.position.clone(), act: () => { on = !on; glow(coil, '#e8590c', on ? 0.4 : 0); txt(); lab.setText(on ? 'قوتان متعاكستان على الضلعين تكوّنان مزدوجاً' : 'لا تيار: لا عزم'); } },
      { obj: comm, hit: [comm, hb], hint: C.clone().setY(0).add(V(0, 0, 0.24)), act: () => { motor = !motor; on = true; lab.setText(motor ? 'العاكس يقلب التيار كل نصف دورة فيستمر الدوران: محرك' : 'بلا عاكس يتأرجح الملف ثم يستقر عمودياً على المجال'); } },
      { obj: tA, hint: tA.position.clone(), act: () => { motor = false; w = 0; ai = (ai + 1) % 3; phi = angs[ai]; txt(); lab.setText(`τ = BIAN sinθ = 1.35 × 10⁻⁴ × ${Math.abs(Math.cos(phi)).toFixed(2)} N·m (المثال 6)`); } },
    ],
    update(dt) { if (!on) return; if (motor) w += (6 * (Math.abs(Math.cos(phi)) + 0.15) - 1.2 * w) * dt; else w += (-4 * Math.sin(phi - Math.PI / 2) - 1.5 * w) * dt; phi += w * dt; txt(); },
    print(x, { P, inkText }) {
      inkText(x, 'τ = B I A N sinθ  ،  μ = A N I', ...P(0.04, 0.44), { size: 36, color: '#c2410c', weight: 600 });
      inkText(x, 'مثال 6: N = 100 ، A = 2 × 10⁻⁴ m² ، I = 0.045 A ، B = 0.15 T ⇒ 1.35 × 10⁻⁴ N·m', ...P(0.04, 0.52), { size: 19 });
      inkText(x, 'الشكل 15: أساس المحرك الكهربائي', ...P(0.04, 0.59), { size: 22, color: '#6b6155' });
    },
    notes: [],
  };
};

/* ---------- 10-12 Hysteresis ---------- */
SCENES.hysteresis = (S) => {
  const { THREE, V, ink, glow, label } = S;
  const g = new THREE.Group(), C = V(-0.12, 0.08, 0.02);
  const rod = ink(new THREE.BoxGeometry(0.34, 0.05, 0.08), '#adb5bd', { thresh: 20 }); rod.position.copy(C); g.add(rod);
  const coil = helixTube(S, 12, 0.06, 0.3); coil.position.copy(C); g.add(coil);
  const hb = hitBox(S, 0.34, 0.14, 0.14, C); g.add(hb);
  const doms = []; for (let i = 0; i < 8; i++) for (let j = 0; j < 3; j++) { const m = new THREE.Mesh(new THREE.ConeGeometry(0.008, 0.026, 6).rotateZ(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#e03131' })); m.position.set(C.x - 0.14 + i * 0.04, C.y + 0.03, C.z - 0.025 + j * 0.025); m.r0 = Math.random() * Math.PI * 2; m.rotation.y = m.r0; g.add(m); doms.push(m); }
  const dh = hitBox(S, 0.34, 0.04, 0.1, V(C.x, C.y + 0.04, C.z)); g.add(dh);
  const tM = token(S, 'فولاذ', '#495057', V(-0.33, 0, 0.27)); g.add(tM);
  const hist = [];
  const pan = panel(S, 0.32, 0.28, V(0.24, 0, -0.3), (c, W, H) => { const ox = W / 2, oy = H / 2 + 10, sx = W * 0.38, sy = H * 0.36;
    c.strokeStyle = '#2a241c'; c.lineWidth = 3; c.beginPath(); c.moveTo(30, oy); c.lineTo(W - 20, oy); c.moveTo(ox, 20); c.lineTo(ox, H - 20); c.stroke();
    c.font = "600 26px 'Newsreader',serif"; c.fillStyle = '#2a241c'; c.fillText('B₀', W - 50, oy - 10); c.fillText('B', ox + 10, 40);
    c.strokeStyle = '#c2255c'; c.lineWidth = 5; c.beginPath(); hist.forEach(([h, b], i) => { const X = ox + h * sx, Y = oy - b * sy; i ? c.lineTo(X, Y) : c.moveTo(X, Y); }); c.stroke();
    if (hist.length) { const [h, b] = hist[hist.length - 1]; c.fillStyle = '#c2255c'; c.beginPath(); c.arc(ox + h * sx, oy - b * sy, 10, 0, 7); c.fill(); } });
  pan.redraw(); g.add(pan);
  const lab = label('', { size: 0.03, color: '#c2410c' }); lab.position.set(C.x, 0.3, C.z); g.add(lab);
  let steel = true, si = 0, cur = { h: 0, b: 0 }, virgin = true;
  const Hc = () => (steel ? 0.45 : 0.1), wv = 0.25, up = (h) => Math.tanh((h + Hc()) / wv), dn = (h) => Math.tanh((h - Hc()) / wv);
  const stages = [{ h: 1, t: 'b: تشبع — المناطق كلها منتظمة' }, { h: 0, t: 'c: B₀ = 0 وتبقى مغناطيسية متخلفة' }, { h: -1, t: 'e: تيار معاكس حتى التشبع المعاكس' }, { h: 0, t: 'f: B₀ = 0 ومغناطيسية متخلفة معاكسة' }, { h: 1, t: 'نعود إلى b فتنغلق الحلقة' }];
  const Bat = (h, rising) => (virgin ? Math.tanh(h / wv) * 0.98 : rising ? dn(h) : up(h));
  const setDoms = (b) => doms.forEach((m) => { const tgt = b >= 0 ? 0 : Math.PI; const f = Math.min(1, Math.abs(b)); let d = tgt - m.r0; d = Math.atan2(Math.sin(d), Math.cos(d)); m.rotation.y = m.r0 + d * f; });
  const go = () => { const st = stages[si]; const h0 = cur.h, rising = st.h > h0; const o = { k: 0 };
    S.gsap.to(o, { k: 1, duration: S.reduced ? 0.01 : 1.2, onUpdate: () => { const h = h0 + (st.h - h0) * o.k; const b = Bat(h, rising); hist.push([h, b]); cur = { h, b }; setDoms(b); pan.redraw(); }, onComplete: () => { virgin = false; } });
    lab.setText(st.t); si = (si + 1) % stages.length; if (si === 0) si = 1; };
  setDoms(0); lab.setText('a: حديد غير ممغنط — مناطق عشوائية الاتجاه');
  return {
    group: g,
    targets: [
      { obj: hb, hint: C.clone().setY(0).add(V(0, 0, 0.12)), act: go },
      { obj: dh, hint: V(C.x + 0.12, 0, C.z - 0.1), act: () => { doms.forEach((m) => glow(m, '#f08c00', 0)); lab.setText('كل منطقة مجموعة ثنائيات قطب تتجه معاً، وتنتظم المناطق مع المجال الخارجي'); } },
      { obj: tM, hint: tM.position.clone(), act: () => { steel = !steel; tM.children[1].setText(steel ? 'فولاذ' : 'حديد مطاوع'); hist.length = 0; virgin = true; cur = { h: 0, b: 0 }; si = 0; setDoms(0); pan.redraw(); lab.setText(steel ? 'الفولاذ الصلب: حلقة عريضة، يحتفظ بمغناطيسيته' : 'الحديد المطاوع: حلقة رفيعة، يكتسبها ويفقدها بسرعة'); } },
    ],
    print(x, { P, inkText }) {
      inkText(x, 'حلقة الهسترة: مساحتها = الطاقة المتبددة', ...P(0.04, 0.44), { size: 33, color: '#c2410c', weight: 600 });
      inkText(x, 'a ← b تشبع ← c تخلف ← e تشبع معاكس ← f ← b (الشكلان 17 و 18)', ...P(0.04, 0.52), { size: 21 });
      inkText(x, 'شكل المنحنى في اللوحة نوعي', ...P(0.04, 0.59), { size: 22, color: '#6b6155' });
    },
    notes: [],
  };
};
