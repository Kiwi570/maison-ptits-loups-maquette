/* Contact : carte d'accès dessinée en SVG (projection simple, 10 px = 1 km) et formulaire de démonstration. */
import { $ } from '../core.js';
import { validate } from './forms.js';

const { gsap } = window;
const P = (lon, lat) => [((lon - 1.75) * 733).toFixed(1), ((48.92 - lat) * 1112).toFixed(1)];
const TOWNS = [
  ['Paris', 2.349, 48.853, 'paris'], ['Versailles', 2.1204, 48.8049], ['Massy', 2.2713, 48.7309], ['Évry', 2.44, 48.629],
  ['Arpajon', 2.2478, 48.5903], ['Dourdan', 2.011, 48.529], ['Étampes', 2.161, 48.435], ['Rambouillet', 1.829, 48.644],
];
const SEINE = [[2.18, 48.87], [2.26, 48.845], [2.349, 48.853], [2.41, 48.81], [2.4, 48.75], [2.42, 48.7], [2.45, 48.63], [2.48, 48.6], [2.53, 48.56], [2.6, 48.52]];
const ORGE = [[1.98, 48.52], [2.011, 48.529], [2.07, 48.545], [2.12, 48.555], [2.17, 48.567], [2.25, 48.59], [2.3, 48.63], [2.37, 48.69], [2.41, 48.7]];
const line = (pts) => pts.map((p, i) => `${i ? 'L' : 'M'}${P(...p).join(' ')}`).join('');

export default async function contact(core) {
  const [hx, hy] = P(2.1706, 48.5653), [px, py] = P(2.349, 48.853);
  const rings = [100, 200, 300].map((r) => `<circle class="ring" cx="${hx}" cy="${hy}" r="${r}"/><text x="${+hx + r * 0.71 + 6}" y="${+hy - r * 0.71}" fill="rgba(238,243,247,.35)" font-size="12" font-family="Inter Tight, sans-serif">${r / 10} km</text>`).join('');
  const towns = TOWNS.map(([n, lon, lat, k]) => { const [x, y] = P(lon, lat); return `<g class="town ${k ? 'town--paris' : ''}"><circle cx="${x}" cy="${y}" r="${k ? 6 : 4}"/><text x="${+x + 10}" y="${+y + 5}">${n}</text></g>`; }).join('');
  const route = `M${px} ${py}C${+px - 40} ${+py + 120} ${+hx + 70} ${+hy - 170} ${hx} ${hy}`;
  $('[data-map-svg]').innerHTML = `<svg viewBox="0 0 640 600" role="img" aria-label="Carte : Breuillet se trouve à environ 35 kilomètres au sud-sud-ouest de Paris, près d'Arpajon et de Dourdan.">
    ${rings}
    <path class="river" d="${line(SEINE)}"/><path class="river" d="${line(ORGE)}" stroke-width="1.4"/>
    <text x="${P(2.43, 48.78)[0]}" y="${P(2.43, 48.78)[1]}" fill="rgba(143,211,255,.55)" font-size="13" font-style="italic" font-family="Fraunces, serif">la Seine</text>
    <text x="${P(2.02, 48.565)[0]}" y="${P(2.02, 48.565)[1]}" fill="rgba(143,211,255,.55)" font-size="13" font-style="italic" font-family="Fraunces, serif">l'Orge</text>
    ${towns}
    <path class="route" d="${route}" data-route/>
    <text x="${(+px + +hx) / 2 - 64}" y="${(+py + +hy) / 2 + 20}" text-anchor="end" fill="var(--aurora-a)" font-size="14" font-weight="600" font-family="Inter Tight, sans-serif">≈ 35 km</text>
    <g class="home"><circle class="halo" cx="${hx}" cy="${hy}" r="14" data-halo/><circle class="core" cx="${hx}" cy="${hy}" r="7"/><text x="${+hx + 20}" y="${+hy + 8}">La Maison des p'tits loups</text><text x="${+hx + 20}" y="${+hy + 30}" style="font-family:'Inter Tight',sans-serif;font-size:13px;fill:var(--mist)">Breuillet</text></g>
  </svg>`;
  if (!core.calm) {
    const r = $('[data-route]'), len = r.getTotalLength();
    gsap.set(r, { strokeDasharray: len, strokeDashoffset: len });
    gsap.timeline({ scrollTrigger: { trigger: '[data-map]', start: 'top 70%', once: true } })
      .from('.map .town', { opacity: 0, scale: 0, transformOrigin: 'center', stagger: 0.06, duration: 0.6, ease: 'back.out(2)' })
      .from('.map .ring', { opacity: 0, scale: 0.6, transformOrigin: `${hx}px ${hy}px`, stagger: 0.1, duration: 1, ease: 'expo.out' }, 0)
      .to(r, { strokeDashoffset: 0, duration: 1.8, ease: 'power2.inOut' }, 0.4)
      .from('.map .home', { opacity: 0, duration: 0.6 }, 1.6);
    gsap.to('[data-halo]', { attr: { r: 30 }, opacity: 0, duration: 1.8, repeat: -1, ease: 'power2.out' });
  }

  const form = $('[data-contact-form]');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validate(form)) return;
    const box = $('#c-rgpd', form), err = $('[data-err-rgpd]', form);
    if (!box.checked) { err.textContent = 'Cochez cette case pour envoyer votre message.'; box.focus(); return; }
    err.textContent = '';
    [...form.children].forEach((c) => { if (!c.matches('[data-contact-success]')) c.hidden = true; });
    const ok = $('[data-contact-success]', form); ok.hidden = false; ok.focus();
    if (!core.calm) gsap.from(ok, { opacity: 0, y: 30, duration: 0.8, ease: 'expo.out' });
  });
  core.bind(document);
}
