/* Vitre givrée : chaque photo apparaît sous un givre qu'on essuie (révélation au défilement,
   puis le curseur ou le doigt essuie ce qui reste sur les bords). */
const { gsap, ScrollTrigger } = window;
const TEX_URL = new URL('../../img/grok/commun-texture-givre-1x1.webp', import.meta.url).href;

async function loadTexture() {
  const img = new Image();
  img.src = TEX_URL;
  await img.decode();
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const x = c.getContext('2d', { willReadFrequently: true });
  x.drawImage(img, 0, 0, 512, 512);
  const d = x.getImageData(0, 0, 512, 512), p = d.data;
  for (let i = 0; i < p.length; i += 4) {
    const l = p[i] * 0.3 + p[i + 1] * 0.59 + p[i + 2] * 0.11;
    p[i] = 238; p[i + 1] = 245; p[i + 2] = 252; p[i + 3] = Math.min(255, l * 1.15);
  }
  x.putImageData(d, 0, 0);
  return c;
}

class Frost {
  constructor(el, tex) {
    this.el = el; this.tex = tex; this.mode = el.dataset.frostMode || 'full';
    this.c = document.createElement('canvas'); this.c.className = 'frost__canvas'; this.c.setAttribute('aria-hidden', 'true');
    el.appendChild(this.c);
    this.ctx = this.c.getContext('2d');
    this.revealed = false; this.k = 0; this.last = null; this.w = 0; this.h = 0;
    this.resize();
    new ResizeObserver(() => this.resize()).observe(el);
    el.addEventListener('pointermove', (e) => this.onMove(e));
    el.addEventListener('pointerleave', () => { this.last = null; });
    ScrollTrigger.create({ trigger: el, start: 'top 88%', once: true, onEnter: () => this.reveal() });
  }
  resize() {
    const r = this.el.getBoundingClientRect();
    if (Math.abs(r.width - this.w) < 2 && Math.abs(r.height - this.h) < 2) return;
    this.w = r.width; this.h = r.height;
    if (!this.w || !this.h) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
    this.c.width = Math.round(this.w * dpr); this.c.height = Math.round(this.h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.paint();
    if (this.revealed || this.mode === 'edges') this.clearCenter(1);
  }
  paint() {
    const { ctx, w, h } = this;
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, w, h);
    const g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.1, w / 2, h / 2, Math.max(w, h) * 0.75);
    g.addColorStop(0, 'rgba(206, 224, 242, .5)');
    g.addColorStop(1, 'rgba(224, 236, 248, .82)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    const pat = ctx.createPattern(this.tex, 'repeat');
    if (pat && pat.setTransform) pat.setTransform(new DOMMatrix().scale(Math.max(0.45, Math.max(w, h) / 900)));
    ctx.fillStyle = pat; ctx.globalAlpha = 0.95; ctx.fillRect(0, 0, w, h); ctx.globalAlpha = 1;
  }
  wipe(x, y, r, a = 1) {
    const { ctx } = this;
    ctx.globalCompositeOperation = 'destination-out';
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(0,0,0,${a})`); g.addColorStop(0.55, `rgba(0,0,0,${a * 0.7})`); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.fill();
  }
  clearCenter(a) {
    const { ctx, w, h } = this;
    ctx.globalCompositeOperation = 'destination-out';
    const R = Math.hypot(w, h) / 2;
    const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, R);
    g.addColorStop(0, `rgba(0,0,0,${a})`); g.addColorStop(0.68, `rgba(0,0,0,${a})`); g.addColorStop(1, `rgba(0,0,0,${a * 0.4})`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    // ce qui reste du givre devient un simple liseré sur les bords
    ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(0, 0, w, h);
  }
  reveal() {
    if (this.revealed) return;
    this.revealed = true;
    if (this.mode === 'edges') return;
    const { w, h } = this, pts = [], rows = 4;
    for (let i = 0; i <= rows; i++) {
      const y = h * (0.12 + (0.76 * i) / rows), l2r = i % 2 === 0;
      for (let j = 0; j <= 12; j++) { const t = j / 12; pts.push([w * (l2r ? 0.08 + 0.84 * t : 0.92 - 0.84 * t), y + Math.sin(t * Math.PI) * h * 0.04]); }
    }
    const r = Math.max(w, h) * 0.2, st = { i: 0 };
    this.k = 0;
    gsap.to(st, {
      i: pts.length - 1, duration: 1.25, ease: 'power2.inOut',
      onUpdate: () => { while (this.k <= st.i) { const [x, y] = pts[this.k]; this.wipe(x, y, r, 0.95); this.k++; } },
      onComplete: () => this.clearCenter(0.92),
    });
  }
  onMove(e) {
    if (!this.w) return;
    const r = this.c.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top, rad = Math.max(36, Math.min(this.w, this.h) * 0.16);
    if (this.last) {
      const dx = x - this.last[0], dy = y - this.last[1], n = Math.ceil(Math.hypot(dx, dy) / (rad * 0.35));
      for (let i = 1; i <= n; i++) this.wipe(this.last[0] + (dx * i) / n, this.last[1] + (dy * i) / n, rad, 0.5);
    } else this.wipe(x, y, rad, 0.5);
    this.last = [x, y];
  }
}

export async function initFrost() {
  let tex;
  try { tex = await loadTexture(); } catch (e) { return null; }
  return { add: (el) => new Frost(el, tex) };
}
