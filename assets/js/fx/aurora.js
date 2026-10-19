/* Aurore boréale WebGL (OGL) : un seul canvas, déplacé vers la section visible. */
import { Renderer } from '../../vendor/ogl/core/Renderer.js';
import { Program } from '../../vendor/ogl/core/Program.js';
import { Mesh } from '../../vendor/ogl/core/Mesh.js';
import { Triangle } from '../../vendor/ogl/extras/Triangle.js';

const vertex = /* glsl */ `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position, 0.0, 1.0); }`;

const fragment = /* glsl */ `
precision highp float;
uniform float uTime;
uniform vec2 uRes;
uniform float uIntensity;
uniform float uShift;
uniform vec2 uMouse;
varying vec2 vUv;
float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) { float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { v += a * noise(p); p = p * 2.03 + vec2(1.7, 9.2); a *= 0.5; } return v; }
void main() {
  vec2 uv = vUv;
  float aspect = uRes.x / max(uRes.y, 1.0);
  float x = uv.x * aspect;
  float t = uTime * 0.07;
  vec3 col = vec3(0.0);
  vec3 teal = vec3(0.31, 0.89, 0.74);
  vec3 violet = vec3(0.55, 0.49, 0.96);
  vec3 ice = vec3(0.56, 0.83, 1.0);
  for (int i = 0; i < 3; i++) {
    float fi = float(i);
    float warp = fbm(vec2(x * 0.8 + t + fi * 4.1, t * 0.6 + fi));
    float base = 0.56 + 0.12 * sin(x * 1.1 + t * 1.7 + fi * 2.1) + 0.16 * (warp - 0.5) + fi * 0.07 - (uMouse.y - 0.5) * 0.05 + (uMouse.x - 0.5) * 0.03 * sin(x * 2.0);
    float d = uv.y - base;
    float edge = smoothstep(-0.04, 0.0, d);
    float fall = exp(-max(d, 0.0) * (3.0 + fi * 1.4));
    float rays = 0.45 + 0.55 * fbm(vec2(x * 14.0 + fi * 7.0 + warp * 3.0, t * 2.5));
    rays *= 0.6 + 0.4 * sin(x * 3.0 + t * 3.0 + fi);
    vec3 c = mix(teal, violet, clamp(d * 2.6 + fi * 0.22 + uShift * 0.35, 0.0, 1.0));
    c = mix(c, ice, clamp(uShift - 0.5, 0.0, 0.5));
    col += c * edge * fall * rays * (0.75 - fi * 0.18);
  }
  col *= uIntensity;
  col += (hash(uv * uRes + uTime) - 0.5) / 255.0;
  gl_FragColor = vec4(col, 1.0);
}`;

export function initAurora({ calm }) {
  const slots = [...document.querySelectorAll('[data-aurora-slot]')];
  if (!slots.length) return null;
  const fallback = () => { slots.forEach((s) => { s.innerHTML = '<div class="aurora-fallback"></div>'; }); return { setIntensity() {}, useMenu() {} }; };
  let renderer;
  try {
    const probe = document.createElement('canvas');
    if (!(probe.getContext('webgl2') || probe.getContext('webgl'))) return fallback();
    renderer = new Renderer({ dpr: Math.min(window.devicePixelRatio || 1, 2) * 0.5, alpha: false, antialias: false, depth: false, powerPreference: 'low-power' });
    if (!renderer.gl) return fallback();
  } catch (e) { return fallback(); }
  const gl = renderer.gl;
  gl.clearColor(0, 0, 0, 1);
  const uniforms = { uTime: { value: 8 }, uRes: { value: [1, 1] }, uIntensity: { value: 0 }, uShift: { value: 0 }, uMouse: { value: [0.5, 0.5] } };
  let program, mesh;
  try {
    program = new Program(gl, { vertex, fragment, uniforms, depthTest: false, depthWrite: false });
    mesh = new Mesh(gl, { geometry: new Triangle(gl), program });
  } catch (e) { return fallback(); }
  const canvas = gl.canvas;
  canvas.setAttribute('aria-hidden', 'true');
  gl.canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); fallback(); });

  const menuSlot = document.querySelector('[data-menu] [data-aurora-slot]');
  const pageSlots = slots.filter((s) => s !== menuSlot);
  let current = null, menuOpen = false, visible = new Map();
  const draw = () => { if (current) renderer.render({ scene: mesh }); };
  const mount = (slot) => {
    if (!slot || current === slot) return;
    slot.appendChild(canvas); current = slot; resize(); draw();
  };
  const resize = () => {
    if (!current) return;
    const r = current.getBoundingClientRect();
    if (!r.width || !r.height) return;
    renderer.setSize(r.width, r.height);
    uniforms.uRes.value = [r.width, r.height];
  };
  const pick = () => {
    if (menuOpen) return mount(menuSlot);
    let best = null, ratio = 0;
    visible.forEach((v, s) => { if (v > ratio) { ratio = v; best = s; } });
    if (best) mount(best);
  };
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => visible.set(en.target.querySelector('[data-aurora-slot]'), en.isIntersecting ? en.intersectionRatio : 0));
    pick();
  }, { threshold: [0, 0.15, 0.35, 0.6, 0.85, 1] });
  pageSlots.forEach((s) => io.observe(s.parentElement));
  mount(pageSlots[0] || menuSlot);
  window.addEventListener('resize', () => { resize(); draw(); });

  const t0 = performance.now();
  let mx = 0.5, my = 0.5;
  if (!calm) {
    window.addEventListener('pointermove', (e) => { mx = e.clientX / innerWidth; my = 1 - e.clientY / innerHeight; }, { passive: true });
    window.gsap.ticker.add(() => {
      if (document.hidden || !current) return;
      const anyVisible = menuOpen || [...visible.values()].some((v) => v > 0);
      if (!anyVisible) return;
      uniforms.uTime.value = 8 + (performance.now() - t0) / 1000;
      const m = uniforms.uMouse.value; m[0] += (mx - m[0]) * 0.03; m[1] += (my - m[1]) * 0.03;
      const max = document.documentElement.scrollHeight - innerHeight;
      uniforms.uShift.value = max > 0 ? window.scrollY / max : 0;
      draw();
    });
  }
  return {
    setIntensity(v, duration = 1.5) {
      if (!duration) { uniforms.uIntensity.value = v; draw(); return; }
      window.gsap.to(uniforms.uIntensity, { value: v, duration, ease: 'power2.out', onUpdate: calm ? draw : undefined });
    },
    useMenu(open) { menuOpen = open; pick(); if (calm) draw(); },
  };
}
