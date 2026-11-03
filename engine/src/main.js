import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import gsap from 'gsap';
import { LESSONS } from './lessons.js';
import { SCENES } from './scenes.js';

/* ================= utilities ================= */
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const $ = (s) => document.querySelector(s);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
};
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const MATH = /[A-Za-z0-9ΔθλτΣπ√|(][A-Za-z0-9ΔθλτΣπ√²³⁻¹ₓ_=+\-−×·\/().°|,≈ ]*[A-Za-z0-9²³⁻¹°)|ₓ]|[A-Za-z0-9ΔθλτΣ]/g;
const rich = (s) => esc(String(s).replace(MATH, (m) => '\u0001' + m + '\u0002')).replace(/\u0001/g, '<bdi dir="ltr">').replace(/\u0002/g, '</bdi>');
const ACC = ['#9c5a2c', '#e8590c', '#c99712', '#2f9e44', '#1c64b4', '#d6336c', '#1098ad', '#6f7f22', '#7048e8', '#e8704f'];

/* ================= state ================= */
const state = {
  cur: 0,
  sound: store.get('pp-sound', true),
  hc: store.get('pp-hc', false),
  reduced: store.get('pp-rm', null) ?? matchMedia('(prefers-reduced-motion: reduce)').matches,
  progress: store.get('pp-progress', {}),
  busy: false, demoToken: 0, demoOn: false,
};
const prog = (id) => (state.progress[id] ||= { done: [], ans: null });
const saveProg = () => store.set('pp-progress', state.progress);

/* ================= sound (WebAudio, no files) ================= */
const SFX = {
  ctx: null,
  ensure() {
    if (!this.ctx) { try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; } }
    if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
    return this.ctx;
  },
  tone(f0, f1, dur, type = 'sine', vol = 0.12, delay = 0) {
    if (!state.sound) return; const c = this.ensure(); if (!c) return;
    const t = c.currentTime + delay, o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(c.destination); o.start(t); o.stop(t + dur + 0.05);
  },
  noise(dur, f0, f1, vol = 0.2) {
    if (!state.sound) return; const c = this.ensure(); if (!c) return;
    const n = Math.floor(c.sampleRate * dur), b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 1.5);
    const s = c.createBufferSource(); s.buffer = b; const f = c.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 0.8;
    const t = c.currentTime; f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(f1, t + dur);
    const g = c.createGain(); g.gain.value = vol; s.connect(f).connect(g).connect(c.destination); s.start();
  },
  click() { this.tone(1700, 900, 0.06, 'triangle', 0.06); },
  pop() { this.tone(300, 820, 0.2, 'sine', 0.12); },
  page() { this.noise(0.55, 500, 3600, 0.22); },
  stamp() { this.tone(150, 55, 0.3, 'sine', 0.35); this.noise(0.14, 400, 200, 0.3); },
  good() { this.tone(660, 990, 0.22, 'sine', 0.1); this.tone(990, 1320, 0.3, 'sine', 0.08, 0.12); },
  bad() { this.tone(320, 170, 0.32, 'square', 0.04); },
  whoosh() { this.noise(0.4, 1800, 300, 0.12); },
};

/* ================= renderer / scenes ================= */
const stage = $('#stage');
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
} catch (e) { $('#err').style.display = 'flex'; $('#loader').classList.add('gone'); throw e; }
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.02;
stage.appendChild(renderer.domElement);

const css = new CSS3DRenderer();
css.domElement.id = 'css3d';
stage.appendChild(css.domElement);

const scene = new THREE.Scene();
const cssScene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(36, innerWidth / innerHeight, 0.03, 60);

const composer = new EffectComposer(renderer);
composer.renderTarget1.samples = 4; composer.renderTarget2.samples = 4;
composer.addPass(new RenderPass(scene, camera));
const grainPass = new ShaderPass({
  uniforms: { tDiffuse: { value: null }, uTime: { value: 0 }, uAmt: { value: 0.03 }, uVig: { value: 0.38 } },
  vertexShader: 'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader: `uniform sampler2D tDiffuse;uniform float uTime,uAmt,uVig;varying vec2 vUv;
  float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233))+uTime)*43758.5453);}
  void main(){vec4 c=texture2D(tDiffuse,vUv);float n=h(floor(vUv*vec2(1600.,1000.)))-.5;c.rgb+=n*uAmt*(.4+c.rgb);
  float d=distance(vUv,vec2(.5));c.rgb*=1.-uVig*smoothstep(.3,.9,d);gl_FragColor=c;}`,
});
composer.addPass(grainPass);
composer.addPass(new OutputPass());

/* ================= book dimensions ================= */
const PAGE_W = 1.02, PAGE_D = 1.4, GUT = 0.03, COVER = 0.022, BLOCK = 0.105;
const TOP = COVER + BLOCK;
const XR = GUT + PAGE_W / 2;
const pageY = (ax) => COVER + BLOCK * (1 - 0.62 * Math.exp(-ax / 0.055));

/* ================= canvas textures ================= */
function cnv(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; }
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

function paperCanvas(side, hc) {
  const [c, x] = cnv(1024, 1405);
  x.fillStyle = hc ? '#ffffff' : '#f7f0e2'; x.fillRect(0, 0, 1024, 1405);
  if (!hc) {
    const r = rng(side === 'R' ? 7 : 11);
    for (let i = 0; i < 9000; i++) { x.fillStyle = `rgba(${90 + r() * 60},${70 + r() * 40},${40 + r() * 30},${r() * 0.05})`; x.fillRect(r() * 1024, r() * 1405, 1 + r() * 2, 1 + r() * 2); }
    x.strokeStyle = 'rgba(120,95,60,0.05)';
    for (let i = 0; i < 260; i++) { const a = r() * 1024, b = r() * 1405; x.beginPath(); x.moveTo(a, b); x.quadraticCurveTo(a + r() * 30 - 15, b + r() * 30 - 15, a + r() * 50 - 25, b + r() * 50 - 25); x.stroke(); }
  }
  const g = side === 'R' ? x.createLinearGradient(0, 0, 160, 0) : x.createLinearGradient(1024, 0, 864, 0);
  g.addColorStop(0, 'rgba(90,70,40,0.28)'); g.addColorStop(1, 'rgba(90,70,40,0)');
  x.fillStyle = g; x.fillRect(0, 0, 1024, 1405);
  const e = side === 'R' ? x.createLinearGradient(1024, 0, 990, 0) : x.createLinearGradient(0, 0, 34, 0);
  e.addColorStop(0, 'rgba(90,70,40,0.12)'); e.addColorStop(1, 'rgba(90,70,40,0)'); x.fillStyle = e; x.fillRect(0, 0, 1024, 1405);
  return c;
}
function clothCanvas(hc) {
  const [c, x] = cnv(512, 512); x.fillStyle = hc ? '#ffd400' : '#dfae2a'; x.fillRect(0, 0, 512, 512);
  const r = rng(3);
  for (let i = 0; i < 512; i += 2) { x.fillStyle = `rgba(120,80,0,${0.05 + r() * 0.05})`; x.fillRect(0, i, 512, 1); x.fillStyle = `rgba(255,240,180,${0.04 + r() * 0.04})`; x.fillRect(i, 0, 1, 512); }
  for (let i = 0; i < 3000; i++) { x.fillStyle = `rgba(80,50,0,${r() * 0.08})`; x.fillRect(r() * 512, r() * 512, 2, 1); }
  return c;
}
function deskCanvas(hc) {
  const [c, x] = cnv(1024, 1024); x.fillStyle = hc ? '#1d1d1d' : '#b5ad9f'; x.fillRect(0, 0, 1024, 1024);
  const r = rng(5);
  for (let i = 0; i < 26000; i++) { const v = r(); x.fillStyle = hc ? `rgba(255,255,255,${v * 0.02})` : `rgba(${v < 0.5 ? '60,50,40' : '255,250,240'},${r() * 0.06})`; x.fillRect(r() * 1024, r() * 1024, 2, 2); }
  return c;
}
function edgeCanvas() {
  const [c, x] = cnv(64, 256); x.fillStyle = '#efe6d3'; x.fillRect(0, 0, 64, 256);
  for (let i = 0; i < 256; i += 3) { x.fillStyle = `rgba(110,90,60,${0.18 + Math.random() * 0.15})`; x.fillRect(0, i, 64, 1); }
  return c;
}
function blindsCanvas() {
  const [c, x] = cnv(512, 512); x.fillStyle = '#ffffff'; x.fillRect(0, 0, 512, 512);
  x.filter = 'blur(5px)'; x.fillStyle = '#2f2a24';
  for (let i = 0; i < 512; i += 46) x.fillRect(-20, i, 560, 17);
  x.filter = 'none';
  const g = x.createRadialGradient(256, 256, 120, 256, 256, 256); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.85)');
  x.fillStyle = g; x.fillRect(0, 0, 512, 512);
  return c;
}
const tex = (c, rep) => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = renderer.capabilities.getMaxAnisotropy(); if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); } return t; };

/* ================= environment ================= */
scene.background = new THREE.Color('#b5ad9f');
const hemi = new THREE.HemisphereLight(0xfff3df, 0x5c5246, 1.25);
scene.add(hemi);
const sun = new THREE.SpotLight(0xffe0ae, 5.2, 0, 0.62, 0.35, 0);
sun.position.set(-3.6, 5.2, -1.6);
sun.target.position.set(0.2, 0, 0.1);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.near = 2; sun.shadow.camera.far = 12;
sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.015;
sun.map = tex(blindsCanvas());
scene.add(sun, sun.target);
const fill = new THREE.DirectionalLight(0xdfe8ff, 0.45);
fill.position.set(3, 2.5, 3);
scene.add(fill);

const deskMat = new THREE.MeshStandardMaterial({ map: tex(deskCanvas(false), [3, 3]), roughness: 0.96 });
const desk = new THREE.Mesh(new THREE.PlaneGeometry(16, 12), deskMat);
desk.rotation.x = -Math.PI / 2; desk.receiveShadow = true; scene.add(desk);

/* ================= book ================= */
const book = new THREE.Group(); scene.add(book);
const clothMat = new THREE.MeshStandardMaterial({ map: tex(clothCanvas(false), [2, 2]), roughness: 0.85 });
const CW = PAGE_W + 0.06, CD = PAGE_D + 0.08;
for (const s of [-1, 1]) {
  const cov = new THREE.Mesh(new THREE.BoxGeometry(CW, COVER, CD), clothMat);
  cov.position.set(s * (CW / 2 + 0.012), COVER / 2, 0); cov.castShadow = true; cov.receiveShadow = true; book.add(cov);
}
const spine = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, CD, 24, 1, false, Math.PI / 2, Math.PI), clothMat);
spine.rotation.x = Math.PI / 2; spine.rotation.y = 0; spine.position.set(0, 0.012, 0); spine.scale.set(1, 1, 0.4); book.add(spine);

const edgeTex = tex(edgeCanvas()); edgeTex.wrapS = edgeTex.wrapT = THREE.RepeatWrapping; edgeTex.repeat.set(1, 0.6);
const edgeMat = new THREE.MeshStandardMaterial({ map: edgeTex, roughness: 0.95 });
function pageBlock(sign) {
  const sh = new THREE.Shape(); const N = 40, xmax = GUT + PAGE_W;
  sh.moveTo(0.004, COVER);
  for (let i = 0; i <= N; i++) { const x = 0.004 + (xmax - 0.004) * (i / N); sh.lineTo(x, pageY(x) - 0.0015); }
  sh.lineTo(xmax, COVER); sh.closePath();
  const g = new THREE.ExtrudeGeometry(sh, { depth: PAGE_D, bevelEnabled: false, curveSegments: 4 });
  g.translate(0, 0, -PAGE_D / 2);
  const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 3, uv.getY(i) * 8);
  const m = new THREE.Mesh(g, edgeMat); m.castShadow = true; m.receiveShadow = true; if (sign < 0) m.scale.x = -1; return m;
}
book.add(pageBlock(1), pageBlock(-1));

function pageSurface(sign, map) {
  const g = new THREE.PlaneGeometry(PAGE_W, PAGE_D, 48, 1); g.rotateX(-Math.PI / 2);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i) + sign * (GUT + PAGE_W / 2) ; p.setX(i, x); p.setY(i, pageY(Math.abs(x))); }
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map, roughness: 0.92 })); m.receiveShadow = true; return m;
}
let leftPaper = paperCanvas('L', false);
const leftTex = tex(leftPaper);
const rightCanvas = document.createElement('canvas'); rightCanvas.width = 1024; rightCanvas.height = 1405;
const rightTex = tex(rightCanvas);
book.add(pageSurface(-1, leftTex), pageSurface(1, rightTex));

/* ribbon bookmark */
{
  const curve = new THREE.CatmullRomCurve3([V(0.0, TOP - 0.03, 0.45), V(0.004, TOP - 0.035, 0.66), V(0.02, COVER + 0.02, 0.76), V(0.05, 0.004, 0.86), V(0.09, 0.002, 1.02), V(0.07, 0.002, 1.12)]);
  const N = 60, w = 0.032, pos = [], idx = [], uvs = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N, p = curve.getPoint(t), tg = curve.getTangent(t);
    const side = new THREE.Vector3().crossVectors(tg, V(0, 1, 0)).normalize().multiplyScalar(w / 2);
    if (side.lengthSq() < 1e-8) side.set(w / 2, 0, 0);
    pos.push(p.x - side.x, p.y + 0.001, p.z - side.z, p.x + side.x, p.y + 0.001, p.z + side.z); uvs.push(0, t, 1, t);
    if (i < N) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2)); g.setIndex(idx); g.computeVertexNormals();
  const rib = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: '#2d5ea8', roughness: 0.7, side: THREE.DoubleSide }));
  rib.castShadow = true; rib.receiveShadow = true; book.add(rib);
  const tip = new THREE.Shape(); tip.moveTo(-w / 2, 0); tip.lineTo(w / 2, 0); tip.lineTo(w / 2, 0.04); tip.lineTo(0, 0.025); tip.lineTo(-w / 2, 0.04);
}

/* page-turn sheet */
const SEG = 36;
const sheetGeo = new THREE.PlaneGeometry(PAGE_W, PAGE_D, SEG, 1);
const sheetMat = new THREE.MeshStandardMaterial({ map: tex(paperCanvas('R', false)), roughness: 0.9, side: THREE.DoubleSide });
const sheet = new THREE.Mesh(sheetGeo, sheetMat); sheet.castShadow = true; sheet.visible = false; sheet.frustumCulled = false; book.add(sheet);
function bendSheet(phi, dir) {
  const p = sheetGeo.attributes.position, cols = SEG + 1, ds = PAGE_W / SEG;
  let x = 0, y = TOP + 0.004; const pts = [[x, y]];
  for (let i = 1; i <= SEG; i++) {
    const s = i / SEG, a = phi + dir * 0.85 * Math.sin(phi) * s * s;
    x += Math.cos(a) * ds; y += Math.sin(a) * ds; pts.push([x, Math.max(y, TOP + 0.003)]);
  }
  for (let r = 0; r < 2; r++) for (let c = 0; c < cols; c++) { const [X, Y] = pts[c]; p.setXYZ(r * cols + c, X, Y, r === 0 ? -PAGE_D / 2 : PAGE_D / 2); }
  p.needsUpdate = true; sheetGeo.computeVertexNormals();
}

/* ================= ink material ================= */
const U = { uLight: { value: V(-0.4, 0.8, 0.45).normalize() }, uTime: { value: 0 }, uHatchOn: { value: 1 } };
const LINE_MAT = new THREE.LineBasicMaterial({ color: '#1d1913' });
const HV = `varying vec3 vN;varying vec3 vW;
#include <common>
void main(){vN=normalize(mat3(modelMatrix)*normal);vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`;
const HF = `uniform vec3 uColor,uGlow,uLight;uniform float uGlowAmt,uTime,uHatchOn,uOpacity;varying vec3 vN;varying vec3 vW;
float ln(float c){return smoothstep(.07,.17,abs(fract(c)-.5));}
void main(){vec3 N=normalize(vN);vec3 Vd=normalize(cameraPosition-vW);
float d=max(dot(N,normalize(uLight)),0.);float sh=.3+.7*d;vec2 p=gl_FragCoord.xy;float ink=1.;
if(uHatchOn>.5){if(sh<.58)ink=min(ink,mix(.55,1.,ln((p.x+p.y)/7.)));if(sh<.4)ink=min(ink,mix(.5,1.,ln((p.x-p.y)/7.)));}
vec3 base=uColor*(.78+.22*sh)*ink;float rim=pow(1.-max(dot(N,Vd),0.),2.);float pulse=.88+.12*sin(uTime*5.);
vec3 glow=uGlow*(.8+.5*rim)*pulse;vec3 col=mix(base,glow*mix(.75,1.05,ink),clamp(uGlowAmt,0.,1.)*.85);col+=uGlow*uGlowAmt*rim*.5;
gl_FragColor=vec4(col,uOpacity);}`;
function hatchMat(color) {
  return new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color(color) }, uGlow: { value: new THREE.Color('#ff7a2e') }, uGlowAmt: { value: 0 }, uOpacity: { value: 1 }, uLight: U.uLight, uTime: U.uTime, uHatchOn: U.uHatchOn },
    vertexShader: HV, fragmentShader: HF,
  });
}

/* ================= helpers passed to scenes ================= */
function ink(geom, color = '#f4ecda', { edges = true, thresh = 28 } = {}) {
  const m = new THREE.Mesh(geom, hatchMat(color)); m.castShadow = true;
  if (edges) { const e = new THREE.LineSegments(new THREE.EdgesGeometry(geom, thresh), LINE_MAT); e.raycast = () => {}; m.add(e); }
  return m;
}
function glow(obj, color, amt = 1, dur = 0.5) {
  obj.traverse((o) => {
    const u = o.material && o.material.uniforms;
    if (u && u.uGlowAmt) { if (color) u.uGlow.value.set(color); gsap.to(u.uGlowAmt, { value: amt, duration: state.reduced ? 0 : dur, overwrite: true }); }
  });
}
function arrow(color = '#e8590c', r = 0.011, { posts = false } = {}) {
  const g = new THREE.Group(), hl = r * 7;
  const shaft = ink(new THREE.CylinderGeometry(r, r, 1, 10).rotateZ(-Math.PI / 2).translate(0.5, 0, 0), '#f4ecda', { thresh: 50 });
  const head = ink(new THREE.ConeGeometry(r * 2.6, hl, 16).rotateZ(-Math.PI / 2).translate(hl / 2, 0, 0), '#f4ecda', { thresh: 50 });
  g.add(shaft, head);
  let p1, p2;
  if (posts) {
    const pg = new THREE.BoxGeometry(0.006, 1, 0.006).translate(0, -0.5, 0);
    p1 = ink(pg, '#efe5d0'); p2 = ink(pg, '#efe5d0'); g.add(p1, p2);
  }
  g.len = 0;
  g.setLen = (L) => { g.len = L; const s = Math.max(0.0005, L - hl); shaft.scale.x = s; head.position.x = s; head.visible = L > 0.002; if (posts) { p1.position.x = Math.min(0.03, L * 0.2); p2.position.x = L * 0.75; p1.scale.y = p2.scale.y = Math.max(0.001, g.position.y - 0.002); } };
  g.point = (a, b) => { g.position.copy(a); const d = b.clone().sub(a); const L = d.length(); if (L > 1e-6) g.quaternion.setFromUnitVectors(V(1, 0, 0), d.normalize()); g.setLen(L); };
  glow(g, color, 0, 0);
  return g;
}
function fontFor(t) { return /[؀-ۿ]/.test(t) ? "'Amiri','Noto Naskh Arabic',serif" : "'Newsreader','Times New Roman',serif"; }
function label(text, { color = '#1f1b16', bg = 'rgba(251,246,234,0.93)', size = 0.045, border = true } = {}) {
  const mat = new THREE.SpriteMaterial({ transparent: true, depthTest: true, depthWrite: false, toneMapped: false });
  const s = new THREE.Sprite(mat); s.renderOrder = 10; s.center.set(0.5, 0);
  s.setText = (t) => {
    s.userData.text = t;
    const fs = 72, ff = fontFor(t), [c, x] = cnv(8, 8);
    x.font = `600 ${fs}px ${ff}`; const w = Math.ceil(x.measureText(t).width) + 60, h = Math.round(fs * 1.55);
    c.width = w; c.height = h; x.font = `600 ${fs}px ${ff}`;
    x.fillStyle = bg; x.beginPath(); x.roundRect(3, 3, w - 6, h - 6, 22); x.fill();
    if (border) { x.strokeStyle = color; x.lineWidth = 4; x.stroke(); }
    x.fillStyle = color; x.textAlign = 'center'; x.textBaseline = 'middle'; x.direction = /[؀-ۿ]/.test(t) ? 'rtl' : 'ltr'; x.fillText(t, w / 2, h / 2 + 3);
    if (mat.map) mat.map.dispose();
    const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; tx.anisotropy = 4; mat.map = tx; mat.needsUpdate = true;
    s.scale.set((size * w) / h, size, 1);
  };
  s.setText(text);
  return s;
}
function show(obj, on = true, dur = 0.35) {
  if (on) {
    if (obj.visible && obj.userData._shown) return; obj.visible = true; obj.userData._shown = true;
    const sx = obj.userData._s || (obj.userData._s = obj.scale.clone());
    if (state.reduced) { obj.scale.copy(sx); return; }
    obj.scale.set(sx.x * 0.01, sx.y * 0.01, sx.z);
    gsap.to(obj.scale, { x: sx.x, y: sx.y, duration: dur * 2, ease: 'elastic.out(1,0.6)', overwrite: true });
  } else { obj.visible = false; obj.userData._shown = false; }
}
function jar({ max = 1, color = '#e8590c', name = '', unit = '', h = 0.2, r = 0.045, digits = 0 } = {}) {
  const g = new THREE.Group();
  const base = ink(new THREE.CylinderGeometry(r * 1.2, r * 1.25, 0.014, 28), '#ece2cc', { thresh: 20 }); base.position.y = 0.007; g.add(base);
  const glassG = new THREE.CylinderGeometry(r, r * 0.94, h, 28, 1, true);
  const glass = new THREE.Mesh(glassG, new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.22, roughness: 0.08, side: THREE.DoubleSide, depthWrite: false }));
  glass.position.y = 0.014 + h / 2; glass.renderOrder = 3; g.add(glass);
  const rimE = new THREE.LineSegments(new THREE.EdgesGeometry(glassG, 20), LINE_MAT); rimE.position.copy(glass.position); g.add(rimE);
  for (let i = 1; i < 4; i++) {
    const pts = []; for (let a = -0.9; a <= 0.9; a += 0.15) pts.push(V(Math.sin(a) * r * 1.002, 0, Math.cos(a) * r * 1.002));
    const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), LINE_MAT); l.position.y = 0.014 + (h * i) / 4; g.add(l);
  }
  const liqMat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.55, transparent: true, opacity: 0.88, roughness: 0.3 });
  const liq = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.86, r * 0.82, 1, 28).translate(0, 0.5, 0), liqMat);
  liq.position.y = 0.015; liq.scale.y = 0.0001; liq.renderOrder = 2; g.add(liq);
  const lb = label(name ? `${name} 0 ${unit}` : '0', { size: 0.038 }); lb.position.y = h + 0.03; g.add(lb);
  g.value = 0; g.label = lb;
  g.fmt = (v) => (Math.abs(v) < 1e-9 ? '0' : (v < 0 ? '−' : '') + Math.abs(v).toFixed(digits));
  g.set = (v, dur = 0.9, txt) => {
    g.value = v; const lvl = clamp(Math.abs(v) / max, 0, 1);
    gsap.to(liq.scale, { y: Math.max(0.0001, lvl * (h - 0.004)), duration: state.reduced ? 0 : dur, ease: 'power2.out', overwrite: true });
    const c = v < 0 ? '#c92a2a' : color; liqMat.color.set(c); liqMat.emissive.set(c);
    lb.setText(txt || `${name} ${g.fmt(v)} ${unit}`.trim());
  };
  g.hit = [base, glass, liq];
  return g;
}
function dots(n, color, r = 0.008) {
  const m = new THREE.InstancedMesh(new THREE.SphereGeometry(r, 10, 8), new THREE.MeshBasicMaterial({ color, toneMapped: false }), n);
  m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.frustumCulled = false;
  const o = new THREE.Object3D();
  m.setAt = (i, x, y, z, s = 1) => { o.position.set(x, y, z); o.scale.setScalar(s); o.updateMatrix(); m.setMatrixAt(i, o.matrix); };
  m.commit = () => { m.instanceMatrix.needsUpdate = true; };
  for (let i = 0; i < n; i++) m.setAt(i, 0, -10, 0, 0); m.commit();
  return m;
}
const S = { THREE, V, gsap, ink, glow, arrow, label, jar, dots, show, LINE_MAT, sfx: SFX, clamp, get reduced() { return state.reduced; }, reprint: () => drawRightPage() };

/* ================= right page print ================= */
const P = (x, z) => [((x + PAGE_W / 2) / PAGE_W) * 1024, ((z + PAGE_D / 2) / PAGE_D) * 1405];
function inkLine(x, pts, { w = 3, color = '#2a241c', dash = null, seed = 1, wob = 1.6 } = {}) {
  const r = rng(seed); x.save(); x.strokeStyle = color; x.lineWidth = w; x.lineCap = 'round'; x.lineJoin = 'round'; if (dash) x.setLineDash(dash);
  x.beginPath(); pts.forEach(([a, b], i) => { const j = i && i < pts.length - 1 ? wob : 0; const ax = a + (r() - 0.5) * j, by = b + (r() - 0.5) * j; i ? x.lineTo(ax, by) : x.moveTo(ax, by); }); x.stroke(); x.restore();
}
function inkArrowHead(x, [a, b], [c, d], color = '#2a241c', s = 16) {
  const ang = Math.atan2(d - b, c - a); x.save(); x.fillStyle = color; x.beginPath(); x.moveTo(c, d);
  x.lineTo(c - s * Math.cos(ang - 0.38), d - s * Math.sin(ang - 0.38)); x.lineTo(c - s * 0.6 * Math.cos(ang), d - s * 0.6 * Math.sin(ang)); x.lineTo(c - s * Math.cos(ang + 0.38), d - s * Math.sin(ang + 0.38)); x.closePath(); x.fill(); x.restore();
}
function inkText(x, t, a, b, { size = 30, color = '#2a241c', align = 'center', weight = 400 } = {}) {
  x.save(); x.font = `${weight} ${size}px ${fontFor(t)}`; x.fillStyle = color; x.textAlign = align; x.textBaseline = 'middle'; x.direction = /[؀-ۿ]/.test(t) ? 'rtl' : 'ltr'; x.fillText(t, a, b); x.restore();
}
function leader(x, t, at, to, opts = {}) {
  const [ax, ay] = P(at[0], at[1]), [bx, by] = P(to[0], to[1]);
  const mx = (ax + bx) / 2 + (by - ay) * 0.12, my = (ay + by) / 2 - (bx - ax) * 0.12;
  const pts = []; for (let i = 0; i <= 16; i++) { const k = i / 16, q = 1 - k; pts.push([q * q * ax + 2 * q * k * mx + k * k * bx, q * q * ay + 2 * q * k * my + k * k * by]); }
  inkLine(x, pts, { w: 2.4, seed: t.length, color: opts.color || '#3a3127' });
  inkArrowHead(x, pts[pts.length - 3], pts[pts.length - 1], opts.color || '#3a3127', 15);
  inkText(x, t, ax, ay - 22, { size: opts.size || 30, color: opts.color || '#2a241c', weight: 600 });
}
const PR = { P, inkLine, inkArrowHead, inkText, leader };
function drawRightPage() {
  const L = LESSONS[state.cur], x = rightCanvas.getContext('2d');
  x.clearRect(0, 0, 1024, 1405); x.drawImage(paperCanvas('R', state.hc), 0, 0);
  const acc = ACC[L.chapter - 1];
  inkText(x, `${L.chapterLabel} · ${L.section} · شكل منبثق`, 960, 62, { size: 28, color: acc, align: 'right', weight: 700 });
  inkLine(x, [[960, 88], [120, 88]], { w: 2, color: acc, wob: 0 });
  inkText(x, `ص ${L.pages}`, 120, 62, { size: 26, color: '#6b6155', align: 'left' });
  if (cur && cur.print) cur.print(x, PR);
  if (cur && cur.notes) cur.notes.forEach((n) => leader(x, n.t, n.at, n.to, n));
  inkLine(x, [[960, 1340], [120, 1340]], { w: 1.5, color: '#9a8f80', wob: 0 });
  inkText(x, 'انقر الأجزاء البارزة لتشغيلها · الحلقات النابضة تدلّ على ما لم تجرّبه بعد', 540, 1370, { size: 24, color: '#6b6155' });
  rightTex.needsUpdate = true;
}

/* ================= left page (CSS3D) ================= */
const pageEl = document.createElement('div'); pageEl.className = 'page'; pageEl.style.left = '0px'; pageEl.style.top = '0px';
const pageObj = new CSS3DObject(pageEl);
pageObj.rotation.x = -Math.PI / 2;
const K = 1000; // CSS world is scaled up to keep CSS 3D matrices numerically stable
const cssCam = new THREE.PerspectiveCamera();
pageObj.scale.setScalar(0.0005 * K);
pageObj.position.set((-(GUT + PAGE_W / 2) - 0.022) * K, (TOP + 0.0015) * K, 0.0);
cssScene.add(pageObj);
['pointerdown', 'touchstart', 'wheel'].forEach(() => {});
pageEl.addEventListener('pointerdown', (e) => { if (e.target.closest('button,.flap')) e.stopPropagation(); });

function renderLeft() {
  const L = LESSONS[state.cur], pr = prog(L.id), n = L.scene.targets.length, cnt = pr.done.filter(Boolean).length, complete = cnt >= n;
  pageEl.style.setProperty('--acc', ACC[L.chapter - 1]);
  const letters = ['أ', 'ب', 'ج', 'د'];
  pageEl.innerHTML = `<div class="lp">
    <header class="lp-head">
      <span class="chip">${L.chapterLabel} · <bdi dir="ltr">${L.section}</bdi> · ص ${L.pages}</span>
      <h1>${esc(L.title)}</h1><div class="en">${esc(L.titleEn)}</div>
      <div class="stamp ${complete ? 'inked' : ''}" aria-label="ختم الإنجاز"><b>${complete ? 'أُنجز' : 'الختم'}</b><small>${cnt} / ${n}</small></div>
    </header>
    <p class="summary">${rich(L.summary)}</p>
    <div class="formula"><div class="f-lines">${L.formula.lines.map((l) => `<div>${esc(l)}</div>`).join('')}</div><div class="f-note">${rich(L.formula.note)} · ص ${L.formula.sourcePage}</div></div>
    <section><h2>مفردات أساسية</h2><div class="vgrid">${L.vocab.map((v) => `<div class="vitem"><b>${rich(v.term)}</b>${rich(v.def)}</div>`).join('')}</div></section>
    <div class="tries">جرّب على الصفحة المقابلة: ${L.scene.targets.map((t, i) => `<span class="${pr.done[i] ? 'ok' : ''}">${pr.done[i] ? '✓ ' : ''}${rich(t)}</span>`).join('')}</div>
    <section><h2>توقّع قبل التجربة</h2><p class="q">${rich(L.quiz.q)}</p>
      <div class="opts">${L.quiz.options.map((o, i) => `<button class="opt" data-i="${i}"><i>${letters[i]}</i><span>${rich(o)}</span></button>`).join('')}</div></section>
    <section class="flapwrap"><div class="under"><h3>لماذا؟</h3>${rich(L.quiz.why)}</div>
      <div class="flap"><div class="face front"><div class="lock">🔒</div><div>ارفع الغطاء لتعرف السبب</div><em>اختر توقعك أولاً ليُفتح الغطاء</em></div><div class="face back">لماذا؟</div></div></section>
    <div class="foot"><span>${esc('الفيزياء · الصف الخامس العلمي')}</span><span>الدرس ${state.cur + 1} من ${LESSONS.length}</span></div>
  </div>`;
  const opts = [...pageEl.querySelectorAll('.opt')], flap = pageEl.querySelector('.flap');
  const applyAns = (a, fresh) => {
    opts.forEach((b, i) => { b.disabled = true; if (i === L.quiz.correct) b.classList.add('right'); else if (i === a) b.classList.add('wrong'); });
    flap.classList.add('ready'); flap.querySelector('.front div:nth-child(2)').textContent = a === L.quiz.correct ? 'توقّع صحيح! ارفع الغطاء' : 'ارفع الغطاء لتعرف السبب';
    flap.querySelector('.front em').textContent = 'انقر هنا';
    if (!fresh) flap.classList.add('open');
  };
  opts.forEach((b) => b.addEventListener('click', () => {
    const a = +b.dataset.i; pr.ans = a; saveProg(); a === L.quiz.correct ? SFX.good() : SFX.bad(); applyAns(a, true);
    setTimeout(() => { flap.classList.add('open'); SFX.whoosh(); }, state.reduced ? 0 : 450);
  }));
  flap.addEventListener('click', () => { if (pr.ans == null) { flap.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-14px)' }, { transform: 'translateX(14px)' }, { transform: 'translateX(0)' }], { duration: 300 }); return; } flap.classList.toggle('open'); SFX.whoosh(); });
  if (state.reduced) flap.style.transition = 'none';
  if (pr.ans != null) applyAns(pr.ans, false);
}

/* ================= scene lifecycle ================= */
let cur = null; // current built scene
const sceneRoot = new THREE.Group(); sceneRoot.position.set(XR, TOP, 0); scene.add(sceneRoot);
const ringGeo = new THREE.RingGeometry(0.036, 0.046, 40).rotateX(-Math.PI / 2);
function buildScene(i) {
  const L = LESSONS[i];
  const built = SCENES[L.scene.type](S, L);
  built.group.scale.y = 0.01;
  sceneRoot.add(built.group);
  built.targets.forEach((t, k) => {
    t.meshes = []; (t.hit || [t.obj]).forEach((o) => o.traverse((m) => { if (m.isMesh) t.meshes.push(m); }));
    const ring = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: '#d9480f', transparent: true, opacity: 0.8, depthWrite: false, toneMapped: false }));
    ring.position.copy(t.hint).setY(0.002); ring.renderOrder = 4; built.group.add(ring); t.ring = ring; t.k = k;
  });
  return built;
}
function disposeScene(b) {
  if (!b) return; if (b.dispose) b.dispose(); sceneRoot.remove(b.group);
  b.group.traverse((o) => { if (o.geometry && o.geometry !== ringGeo) o.geometry.dispose(); const m = o.material; if (m) { (Array.isArray(m) ? m : [m]).forEach((mm) => { if (mm.map) mm.map.dispose(); if (mm !== LINE_MAT) mm.dispose(); }); } });
}
function popIn(b) {
  if (state.reduced) { b.group.scale.y = 1; return Promise.resolve(); }
  SFX.pop();
  return new Promise((res) => gsap.to(b.group.scale, { y: 1, duration: 1.15, ease: 'elastic.out(1,0.45)', onComplete: res }));
}
function foldOut(b) {
  if (!b) return Promise.resolve();
  if (state.reduced) { b.group.scale.y = 0.01; return Promise.resolve(); }
  return new Promise((res) => gsap.to(b.group.scale, { y: 0.01, duration: 0.38, ease: 'power2.in', onComplete: res }));
}
function markTarget(k) {
  const L = LESSONS[state.cur], pr = prog(L.id);
  if (pr.done[k]) return;
  pr.done[k] = true; saveProg();
  const n = L.scene.targets.length, cnt = pr.done.filter(Boolean).length;
  const chip = pageEl.querySelectorAll('.tries span')[k]; if (chip) { chip.classList.add('ok'); chip.innerHTML = '✓ ' + rich(L.scene.targets[k]); }
  const st = pageEl.querySelector('.stamp'); if (st) st.querySelector('small').textContent = `${cnt} / ${n}`;
  if (cnt >= n) setTimeout(() => { st.classList.add('inked'); st.querySelector('b').textContent = 'أُنجز'; SFX.stamp(); renderToc(); }, 500);
}
function activate(k, byUser) {
  if (!cur || state.busy) return;
  const t = cur.targets[k]; if (!t) return;
  SFX.click(); t.act();
  if (byUser) markTarget(k);
}

/* ================= camera ================= */
const controls = new OrbitControls(camera, stage);
controls.enableDamping = true; controls.dampingFactor = 0.08;
controls.minDistance = 0.55; controls.maxDistance = 5.2;
controls.minPolarAngle = 0.05; controls.maxPolarAngle = 1.36;
controls.rotateSpeed = 0.7; controls.zoomSpeed = 0.9; controls.panSpeed = 0.8;
controls.screenSpacePanning = true;
controls.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN };
function home() {
  const a = innerWidth / innerHeight; const f = a < 1.25 ? Math.min(2.6, 1.32 / a + 0.05) : 1;
  const tgt = V(0, 0.05, 0.1); const off = V(0, 2.2, 1.42).multiplyScalar(f);
  return { pos: tgt.clone().add(off), tgt };
}
{ const h = home(); camera.position.copy(h.pos); controls.target.copy(h.tgt); camera.lookAt(h.tgt); }
let camTween = null;
function flyTo(pos, tgt, dur = 1.6) {
  if (camTween) camTween.kill();
  if (state.reduced || dur === 0) { camera.position.copy(pos); controls.target.copy(tgt); camera.lookAt(tgt); return Promise.resolve(); }
  const p0 = camera.position.clone(), t0 = controls.target.clone(), o = { k: 0 };
  const lift = Math.min(0.35, p0.distanceTo(pos) * 0.18);
  return new Promise((res) => {
    camTween = gsap.to(o, { k: 1, duration: dur, ease: 'power2.inOut', onUpdate: () => {
      camera.position.lerpVectors(p0, pos, o.k); camera.position.y += Math.sin(Math.PI * o.k) * lift;
      controls.target.lerpVectors(t0, tgt, o.k); camera.lookAt(controls.target);
    }, onComplete: () => { camTween = null; res(); }, onInterrupt: res });
  });
}
const C = () => V(XR, TOP, 0);
const SHOTS = {
  top: () => ({ pos: C().add(V(0, 1.35, 0.42)), tgt: C().add(V(0, 0.05, 0)) }),
  close: () => ({ pos: C().add(V(0.42, 0.42, 0.62)), tgt: C().add(V(0, 0.12, 0)) }),
  low: () => ({ pos: C().add(V(-0.12, 0.12, 1.02)), tgt: C().add(V(0, 0.14, 0)) }),
  side: () => ({ pos: C().add(V(1.15, 0.42, 0.42)), tgt: C().add(V(-0.02, 0.12, 0)) }),
};
function resetView() { stopDemo(); const h = home(); flyTo(h.pos, h.tgt, 1.3); }

/* ================= demo ================= */
const capEl = $('#caption');
function setPlayIcon(on) {
  const b = $('#bPlay'); b.setAttribute('aria-pressed', on); b.setAttribute('aria-label', on ? 'إيقاف العرض' : 'تشغيل العرض التوضيحي');
  b.innerHTML = on ? '<svg viewBox="0 0 24 24"><path d="M8 5v14M16 5v14"/></svg>' : '<svg viewBox="0 0 24 24"><path d="M7 5l12 7-12 7z"/></svg>';
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function runDemo() {
  if (state.busy) return;
  if (state.demoOn) { stopDemo(); return; }
  const tok = ++state.demoToken; state.demoOn = true; setPlayIcon(true); controls.enabled = false;
  const L = LESSONS[state.cur];
  for (let i = 0; i < L.demo.length; i++) {
    const st = L.demo[i];
    capEl.innerHTML = `<span class="n">${i + 1}/${L.demo.length}</span>${rich(st.cap)}`; capEl.classList.add('show');
    if (!state.reduced) { const s = SHOTS[st.shot](); await flyTo(s.pos, s.tgt, 1.7); }
    if (tok !== state.demoToken) return;
    if (st.act != null) activate(st.act, false);
    await sleep(state.reduced ? 3200 : 2900);
    if (tok !== state.demoToken) return;
  }
  capEl.classList.remove('show');
  if (!state.reduced) { const h = home(); await flyTo(h.pos, h.tgt, 1.6); }
  if (tok !== state.demoToken) return;
  state.demoOn = false; setPlayIcon(false); controls.enabled = true;
}
function stopDemo() {
  if (!state.demoOn) return;
  state.demoToken++; state.demoOn = false; if (camTween) { camTween.kill(); camTween = null; }
  capEl.classList.remove('show'); setPlayIcon(false); if (!state.busy) controls.enabled = true;
}

/* ================= navigation & page turn ================= */
async function goTo(n, instant = false) {
  if (state.busy || n === state.cur || n < 0 || n >= LESSONS.length) return;
  stopDemo(); state.busy = true; controls.enabled = false; $('#toc').classList.remove('open');
  const forward = n > state.cur;
  SFX.page();
  pageEl.classList.add('fade');
  await foldOut(cur);
  let swapped = false;
  const swap = () => { if (swapped) return; swapped = true; disposeScene(cur); state.cur = n; cur = buildScene(n); renderLeft(); drawRightPage(); updateHud(); };
  if (!state.reduced && !instant) {
    sheet.visible = true; const o = { p: forward ? Math.PI : 0 }, dir = forward ? 1 : -1; bendSheet(o.p, dir);
    await new Promise((res) => gsap.to(o, { p: forward ? 0 : Math.PI, duration: 1.15, ease: 'power2.inOut', onUpdate: () => { bendSheet(o.p, dir); if (Math.abs(o.p - Math.PI / 2) < 0.25) swap(); }, onComplete: res }));
    sheet.visible = false;
  }
  swap();
  pageEl.classList.remove('fade');
  await popIn(cur);
  state.busy = false; controls.enabled = true;
  try { history.replaceState(null, '', '#' + LESSONS[n].id); } catch (e) {}
  store.set('pp-cur', n);
}
function updateHud() {
  const L = LESSONS[state.cur];
  $('#title small').textContent = `${L.chapterLabel} · ${L.section} · ${state.cur + 1}/${LESSONS.length}`;
  $('#title b').textContent = L.title;
  $('#bPrev').disabled = state.cur === 0; $('#bNext').disabled = state.cur === LESSONS.length - 1;
  $('#bPrev').style.opacity = state.cur === 0 ? 0.35 : 1; $('#bNext').style.opacity = state.cur === LESSONS.length - 1 ? 0.35 : 1;
  renderToc();
}
function renderToc() {
  let lastCh = 0, html = '';
  LESSONS.forEach((L, i) => {
    if (L.chapter !== lastCh) { lastCh = L.chapter; html += `<li class="ch" style="color:${ACC[L.chapter - 1]}">${esc(L.chapterLabel)}: ${esc(L.chapterTitle || '')}</li>`; }
    const pr = state.progress[L.id], done = pr && pr.done.filter(Boolean).length >= L.scene.targets.length;
    html += `<li><button data-i="${i}" class="${i === state.cur ? 'cur' : ''}"><span class="num" style="background:${ACC[L.chapter - 1]}">${esc(L.section)}</span><span>${esc(L.title)}</span><span class="pg">p. ${L.pages}</span><span class="st">${done ? '◉' : ''}</span></button></li>`;
  });
  $('#tocList').innerHTML = html;
  $('#tocList').querySelectorAll('button').forEach((b) => b.addEventListener('click', () => goTo(+b.dataset.i)));
}

/* ================= picking (click vs drag) ================= */
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
let down = null;
function pick(e) {
  if (!cur) return null;
  const r = stage.getBoundingClientRect(); ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  const all = []; cur.targets.forEach((t) => t.meshes.forEach((m) => all.push(m)));
  const hit = ray.intersectObjects(all, false).find((h) => h.object.isMesh && h.object.visible);
  if (!hit) return null;
  return cur.targets.findIndex((t) => t.meshes.includes(hit.object));
}
stage.addEventListener('pointerdown', (e) => {
  SFX.ensure();
  if (state.demoOn) { stopDemo(); controls.enabled = true; }
  hideHint();
  down = { x: e.clientX, y: e.clientY, t: performance.now(), onPage: !!e.target.closest('.page') };
}, true);
stage.addEventListener('pointerup', (e) => {
  if (!down) return; const d = Math.hypot(e.clientX - down.x, e.clientY - down.y), dt = performance.now() - down.t, onPage = down.onPage; down = null;
  if (onPage || d > 6 || dt > 600 || e.button !== 0) return;
  const k = pick(e); if (k != null && k >= 0) activate(k, true);
}, true);
let hoverQ = null;
stage.addEventListener('pointermove', (e) => {
  if (e.pointerType !== 'mouse' || down) return; hoverQ = e;
});
function hoverTick() {
  if (!hoverQ) return; const e = hoverQ; hoverQ = null;
  if (e.target.closest && e.target.closest('.page')) { stage.style.cursor = ''; return; }
  const k = pick(e); stage.style.cursor = k != null && k >= 0 ? 'pointer' : 'grab';
}

/* ================= HUD wiring ================= */
$('#bNext').onclick = () => goTo(state.cur + 1);
$('#bPrev').onclick = () => goTo(state.cur - 1);
$('#bPlay').onclick = () => runDemo();
$('#bReset').onclick = () => resetView();
$('#bToc').onclick = () => $('#toc').classList.toggle('open');
$('#bTocClose').onclick = () => $('#toc').classList.remove('open');
function applySound() { $('#bSound').setAttribute('aria-pressed', state.sound); $('#bSound .w').style.display = state.sound ? '' : 'none'; }
$('#bSound').onclick = () => { state.sound = !state.sound; store.set('pp-sound', state.sound); applySound(); SFX.click(); };
function applyHc() {
  document.body.classList.toggle('hc', state.hc); $('#bHc').setAttribute('aria-pressed', state.hc);
  U.uHatchOn.value = state.hc ? 0 : 1; LINE_MAT.color.set(state.hc ? '#000000' : '#1d1913');
  deskMat.map.dispose(); deskMat.map = tex(deskCanvas(state.hc), [3, 3]); deskMat.needsUpdate = true;
  scene.background.set(state.hc ? '#1d1d1d' : '#b5ad9f');
  clothMat.map.dispose(); clothMat.map = tex(clothCanvas(state.hc), [2, 2]); clothMat.needsUpdate = true;
  leftTex.image = paperCanvas('L', state.hc); leftTex.needsUpdate = true;
  grainPass.uniforms.uAmt.value = state.hc ? 0 : 0.03; grainPass.uniforms.uVig.value = state.hc ? 0.1 : 0.38;
  sun.intensity = state.hc ? 3.5 : 5.2; hemi.intensity = state.hc ? 1.8 : 1.25;
  drawRightPage();
}
$('#bHc').onclick = () => { state.hc = !state.hc; store.set('pp-hc', state.hc); applyHc(); };
function applyRm() { $('#bRm').setAttribute('aria-pressed', state.reduced); controls.enableDamping = !state.reduced; renderLeftFlapTransition(); }
function renderLeftFlapTransition() { const f = pageEl.querySelector('.flap'); if (f) f.style.transition = state.reduced ? 'none' : ''; }
$('#bRm').onclick = () => { state.reduced = !state.reduced; store.set('pp-rm', state.reduced); applyRm(); if (state.reduced) stopDemo(); };
addEventListener('keydown', (e) => {
  if (e.target.closest && e.target.closest('input,textarea,select,#note')) return;
  if (e.key === 'ArrowLeft' || e.key === 'PageDown') goTo(state.cur + 1);
  else if (e.key === 'ArrowRight' || e.key === 'PageUp') goTo(state.cur - 1);
  else if (e.key === 'Escape') { stopDemo(); $('#toc').classList.remove('open'); }
  else if (e.key.toLowerCase() === 'r') resetView();
});
addEventListener('hashchange', () => { const i = LESSONS.findIndex((l) => '#' + l.id === location.hash); if (i >= 0) goTo(i); });
let hintTimer = null;
function hideHint() { $('#hint').classList.add('gone'); }

/* ================= resize & loop ================= */
function resize() {
  const w = innerWidth, h = innerHeight; renderer.setSize(w, h); composer.setSize(w, h); css.setSize(w, h);
  camera.aspect = w / h; camera.updateProjectionMatrix();
}
addEventListener('resize', resize);
const clock = new THREE.Clock();
const TMIN = V(-1.3, 0, -1.0), TMAX = V(1.3, 0.45, 1.0);
function loop() {
  requestAnimationFrame(loop);
  const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;
  U.uTime.value = t; grainPass.uniforms.uTime.value = (t * 7) % 100;
  if (controls.enabled && !camTween) { controls.update(); controls.target.clamp(TMIN, TMAX); if (camera.position.y < 0.2) camera.position.y = 0.2; }
  if (cur) {
    if (cur.update) cur.update(dt, t);
    const pr = prog(LESSONS[state.cur].id);
    cur.targets.forEach((tg, k) => { const on = !pr.done[k]; tg.ring.visible = on && cur.group.scale.y > 0.9; if (on) { const s = 1 + 0.35 * ((t * 1.3 + k * 0.3) % 1); tg.ring.scale.setScalar(s); tg.ring.material.opacity = 0.85 * (1 - ((t * 1.3 + k * 0.3) % 1)); } });
  }
  hoverTick();
  composer.render();
  cssCam.copy(camera); cssCam.position.multiplyScalar(K); cssCam.updateMatrixWorld(); css.render(cssScene, cssCam);
}

/* ================= boot ================= */
async function boot() {
  try { await Promise.race([Promise.all([document.fonts.load("600 72px 'Amiri'"), document.fonts.load("600 72px 'Newsreader'"), document.fonts.load("400 40px 'Noto Naskh Arabic'")]), sleep(3500)]); } catch (e) {}
  resize();
  const fromHash = LESSONS.findIndex((l) => '#' + l.id === location.hash);
  state.cur = fromHash >= 0 ? fromHash : clamp(store.get('pp-cur', 0) | 0, 0, LESSONS.length - 1);
  cur = buildScene(state.cur); renderLeft(); drawRightPage(); updateHud(); applySound(); applyRm();
  if (state.hc) applyHc();
  loop();
  $('#loader').classList.add('gone');
  await sleep(350); await popIn(cur);
  hintTimer = setTimeout(hideHint, 9000);
  window.__pp = { goTo, activate: (k) => activate(k, true), runDemo, state, camera, controls, gsap, flyTo, V, _root: sceneRoot, _sheet: (p, d) => { sheet.visible = p != null; if (p != null) bendSheet(p, d); } };
}
boot();
