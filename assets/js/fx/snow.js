/* Neige vivante : les flocons s'écartent sous le curseur ou le doigt et suivent le défilement. */
export function initSnow(canvas) {
  const ctx = canvas.getContext('2d');
  let W = 0, H = 0, flakes = [];
  const pointer = { x: -9999, y: -9999 };
  const make = (anywhere) => {
    const z = Math.random();
    return { x: Math.random() * W, y: anywhere ? Math.random() * H : -8 - Math.random() * 40, r: 0.5 + z * 2.1, z, vy: 0.22 + z * 0.85, vx: 0, ph: Math.random() * 6.283, a: 0.22 + z * 0.55 };
  };
  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    W = innerWidth; H = innerHeight;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round(Math.min(110, Math.max(26, (W * H) / 15000)));
    while (flakes.length < n) flakes.push(make(true));
    flakes.length = n;
  };
  resize();
  window.addEventListener('resize', resize);
  window.addEventListener('pointermove', (e) => { pointer.x = e.clientX; pointer.y = e.clientY; }, { passive: true });
  window.addEventListener('pointerdown', (e) => { pointer.x = e.clientX; pointer.y = e.clientY; }, { passive: true });
  document.addEventListener('pointerleave', () => { pointer.x = pointer.y = -9999; });
  let lastY = window.scrollY, sv = 0;
  const R = 130;
  window.gsap.ticker.add(() => {
    if (document.hidden) return;
    const y = window.scrollY; sv += (y - lastY - sv) * 0.2; lastY = y;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#fff';
    for (const f of flakes) {
      f.ph += 0.008 + f.z * 0.012;
      f.x += Math.sin(f.ph) * 0.35 * (0.4 + f.z) + f.vx;
      f.y += f.vy - sv * 0.22 * f.z;
      const dx = f.x - pointer.x, dy = f.y - pointer.y, d2 = dx * dx + dy * dy;
      if (d2 < R * R) {
        const d = Math.sqrt(d2) || 1, force = (1 - d / R) * 2.4;
        f.vx += (dx / d) * force * 0.35; f.y += (dy / d) * force * 0.9;
      }
      f.vx *= 0.94;
      if (f.y > H + 12 || f.x < -30 || f.x > W + 30) { Object.assign(f, make(false)); }
      else if (f.y < -50) f.y = H + 8;
      ctx.globalAlpha = f.a;
      ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, 6.283); ctx.fill();
    }
    ctx.globalAlpha = 1;
  });
}
