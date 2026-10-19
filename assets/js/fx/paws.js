/* Traces de pattes qui se posent une à une le long du parcours d'adoption. */
const NS = 'http://www.w3.org/2000/svg';

function smoothPath(pts) {
  if (pts.length < 2) return '';
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${c1[0]} ${c1[1]} ${c2[0]} ${c2[1]} ${p2[0]} ${p2[1]}`;
  }
  return d;
}

export function initPaws(section, { calm }) {
  const svg = section.querySelector('[data-paws]');
  const dots = [...section.querySelectorAll('[data-step-dot]')];
  if (!svg || dots.length < 2) return;
  let paws = [];
  const build = () => {
    const sr = section.getBoundingClientRect();
    svg.setAttribute('viewBox', `0 0 ${sr.width} ${sr.height}`);
    svg.style.color = '#2E6FA8';
    svg.innerHTML = '';
    const pts = dots.map((d) => { const r = d.getBoundingClientRect(); return [r.left - sr.left + r.width / 2, r.top - sr.top + r.height / 2]; });
    pts.unshift([pts[0][0] - sr.width * 0.08, pts[0][1] - 220]);
    const guide = document.createElementNS(NS, 'path');
    guide.setAttribute('d', smoothPath(pts)); guide.setAttribute('fill', 'none');
    svg.appendChild(guide);
    const L = guide.getTotalLength();
    const step = sr.width < 700 ? 34 : 44;
    const size = sr.width < 700 ? 14 : 17;
    paws = [];
    for (let s = 6, k = 0; s < L - 6; s += step, k++) {
      const p = guide.getPointAtLength(s), q = guide.getPointAtLength(Math.min(L, s + 2));
      const ang = Math.atan2(q.y - p.y, q.x - p.x);
      const side = k % 2 ? 1 : -1, off = size * 0.55;
      const x = p.x - Math.sin(ang) * off * side, y = p.y + Math.cos(ang) * off * side;
      const u = document.createElementNS(NS, 'use');
      u.setAttribute('href', '#i-paw');
      u.setAttribute('width', size); u.setAttribute('height', size);
      u.setAttribute('x', -size / 2); u.setAttribute('y', -size / 2);
      u.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${((ang * 180) / Math.PI + 90).toFixed(1)})`);
      svg.appendChild(u);
      paws.push({ u, y });
    }
    guide.remove();
    update();
  };
  const update = () => {
    const top = section.getBoundingClientRect().top;
    const limit = window.innerHeight * 0.72 - top;
    paws.forEach((p) => p.u.classList.toggle('on', calm || p.y < limit));
  };
  build();
  window.addEventListener('scroll', update, { passive: true });
  let t; new ResizeObserver(() => { clearTimeout(t); t = setTimeout(build, 150); }).observe(section);
}
