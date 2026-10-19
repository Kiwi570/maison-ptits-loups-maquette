/* Gabarits partagés : cartes chiens, fiches, portées, mentions d'annonce. */
import { ELEVAGE, CHIENS, PORTEES, TESTS, chien, statutPortee, dateLongue, prix, dateParis } from './data.js';
import { CRYSTAL } from './fx/crystal.js';
import { moonSVG, countdownHTML, joursAvant } from './fx/moon.js';

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const todo = (t = 'à compléter') => `<span class="todo">${t}</span>`;
const ARROW = '<svg aria-hidden="true"><use href="#i-arrow"></use></svg>';
const sexe = (c) => (c.sexe === 'male' ? 'Mâle' : 'Femelle');

export function img(name, alt, sizes = '(max-width: 900px) 90vw, 33vw', pos, eager = false) {
  const b = `assets/img/photos/${name}`;
  return `<img src="${b}-1280.webp" srcset="${b}-640.webp 640w, ${b}-1280.webp 1280w, ${b}-1920.webp 1920w" sizes="${sizes}" alt="${esc(alt)}" loading="${eager ? 'eager' : 'lazy'}" decoding="async"${pos ? ` style="object-position:${pos}"` : ''}>`;
}

export function testBadges(tests) {
  if (!tests?.length) return `<div class="tests">${todo('Résultats de santé à compléter')}</div>`;
  return `<div class="tests">${tests.map((t) => `<span class="test" title="${esc(`${TESTS[t.code].libelle} : ${TESTS[t.code].detail}`)}">${CRYSTAL}${t.code}${t.valeur ? ` <span>${esc(t.valeur)}</span>` : ''}</span>`).join('')}</div>`;
}

export function dogCard(c, { href } = {}) {
  const tag = href ? 'a' : 'button';
  const attrs = href ? `href="${href}"` : `type="button" aria-haspopup="dialog"`;
  return `<${tag} class="dog" ${attrs} data-dog="${c.id}" data-sex="${c.sexe}">
    <span class="dog__figure" data-frost data-frost-mode="soft">${img(c.photo, `${c.nom}, ${sexe(c).toLowerCase()} ${c.race}`, '(max-width: 640px) 80vw, (max-width: 1100px) 45vw, 30vw', c.position)}<span class="dog__sex" aria-hidden="true">${c.sexe === 'male' ? '♂' : '♀'}</span></span>
    <span class="dog__meta">
      <span class="dog__kicker">${sexe(c)} · ${c.race}</span>
      <span class="dog__name">${esc(c.nom)}${c.nomComplet !== c.nom ? `<small>${esc(c.nomComplet)}</small>` : ''}</span>
      ${testBadges(c.tests)}
      <span class="dog__more">Voir la fiche${ARROW}</span>
    </span>
  </${tag}>`;
}

export function hdScale(value) {
  const on = (value || '').split('/');
  return `<div class="scale__bar">${['A', 'B', 'C', 'D', 'E'].map((g) => `<span class="${on.includes(g) ? 'on' : ''}">${g}</span>`).join('')}</div>`;
}

export function dogSheet(c) {
  const litters = PORTEES.filter((p) => p.mere === c.id || p.pere === c.id);
  const hd = c.tests.find((t) => t.code === 'HD');
  const thumbs = c.photos.length > 1 ? `<div class="sheet__thumbs">${c.photos.map((p, i) => `<button type="button" data-thumb="${p}" aria-current="${i === 0}" aria-label="Photo ${i + 1}"><img src="assets/img/photos/${p}-640.webp" alt=""></button>`).join('')}</div>` : '';
  return `<button class="sheet__close" type="button" data-sheet-close aria-label="Fermer la fiche"><svg><use href="#i-close"></use></svg></button>
  <div class="sheet__grid">
    <div class="sheet__media" data-sheet-media>${img(c.photo, `${c.nom}, ${sexe(c).toLowerCase()} ${c.race}`, '(max-width: 900px) 100vw, 50vw', c.position, true)}${thumbs}</div>
    <div class="sheet__body">
      <p class="label eyebrow label--aurora">${sexe(c)} · ${c.race}</p>
      <h2 class="h2" id="sheet-title">${esc(c.nom)}</h2>
      ${c.nomComplet !== c.nom ? `<p class="lead" style="margin-top:-12px">${esc(c.nomComplet)}</p>` : ''}
      <div class="stack" style="--gap:12px"><span class="label">Résultats de santé</span>${testBadges(c.tests)}</div>
      ${hd ? `<div class="scale"><span class="label">Hanches · grille FCI</span>${hdScale(hd.valeur)}<div class="scale__legend"><span>A : aucun signe</span><span>E : sévère</span></div></div>` : ''}
      <dl class="specs">
        <dt>Nom complet</dt><dd>${esc(c.nomComplet)}</dd>
        <dt>Sexe</dt><dd>${sexe(c)}</dd>
        <dt>Race</dt><dd>${c.race}</dd>
        <dt>Naissance</dt><dd>${c.naissance ? dateLongue(c.naissance) : todo()}</dd>
        <dt>Couleur</dt><dd>${c.couleur ? esc(c.couleur) : todo()}</dd>
        <dt>Pedigree</dt><dd>${c.pedigree ? esc(c.pedigree) : todo()}</dd>
      </dl>
      ${litters.length ? `<div class="stack" style="--gap:10px"><span class="label">Ses portées</span>${litters.map((p) => `<a class="link link--always" href="portees.html#${p.id}" style="width:fit-content">${esc(chien(p.mere).nom)} × ${esc(chien(p.pere).nom)} · ${statusLabel(statutPortee(p))}</a>`).join('')}</div>` : ''}
      ${c.aConfirmer ? `<p class="note">${esc(c.aConfirmer)}</p>` : ''}
      <div class="row"><a class="btn" href="contact.html#ecrire">Poser une question sur ${esc(c.nom)}${ARROW}</a></div>
    </div>
  </div>`;
}

export const statusLabel = (s) => ({ 'a-venir': 'À venir', disponible: 'Disponibles', passee: 'Passée' }[s]);
const statusDot = (s) => ({ 'a-venir': 'dot dot--ice', disponible: 'dot', passee: 'dot dot--mist' }[s]);
const shortDate = (iso) => { const [y, m, d] = iso.split('-'); return `${d}/${m}`; };

export function litterChips() {
  return PORTEES.map((p) => {
    const st = statutPortee(p);
    if (st === 'passee') return '';
    const nom = `${chien(p.mere).nom} × ${chien(p.pere).nom}`;
    if (st === 'disponible') {
      const d = p.disponibles;
      const parts = [d.femelles ? `${d.femelles} femelle${d.femelles > 1 ? 's' : ''}` : '', d.males ? `${d.males} mâle${d.males > 1 ? 's' : ''}` : ''].filter(Boolean).join(' et ');
      return `<a class="chip" href="portees.html#${p.id}"><i class="dot"></i><span><b>${parts}</b> disponible${d.femelles + d.males > 1 ? 's' : ''} · ${nom}</span></a>`;
    }
    return `<a class="chip" href="portees.html#${p.id}"><i class="dot dot--ice"></i><span><b>Naissance vers le ${shortDate(p.naissancePrevue)}</b> · ${nom}</span></a>`;
  }).join('');
}

function ageChiots(p) {
  if (!p.naissance) return todo('à compléter (date de naissance)');
  const sem = Math.floor((Date.now() - dateParis(p.naissance)) / (7 * 864e5));
  return `${sem} semaine${sem > 1 ? 's' : ''} (nés le ${dateLongue(p.naissance)})`;
}

export function legalBox(p) {
  return `<div class="legal"><h4>Mentions de l'annonce</h4><ul>
    <li><span>SIREN de l'élevage</span><b>${ELEVAGE.siren}</b></li>
    <li><span>Âge des chiots</span><b>${ageChiots(p)}</b></li>
    <li><span>Inscription au LOF</span><b>${p.lof === true ? 'Oui' : p.lof === false ? 'Non' : todo('à confirmer')}</b></li>
    <li><span>N° d'identification de la mère</span><b>${p.idMere ? esc(p.idMere) : todo()}</b></li>
    <li><span>Nombre de chiots de la portée</span><b>${p.totalChiots ?? todo()}</b></li>
  </ul></div>`;
}

const parentFig = (c) => `<div class="parent"><figure class="media" data-frost data-frost-mode="soft" style="margin:0">${img(c.photo, `${c.nom}, ${sexe(c).toLowerCase()}`, '(max-width: 640px) 40vw, 18vw', c.position)}</figure><b>${esc(c.nom)}</b><small>${c.sexe === 'male' ? 'Père' : 'Mère'}</small></div>`;

export function litterBlock(p) {
  const st = statutPortee(p);
  const mere = chien(p.mere), pere = chien(p.pere);
  const head = `<div class="litter-head"><span class="status"><i class="${statusDot(st)}"></i>${statusLabel(st)}</span>${st === 'disponible' && p.depart ? `<span class="label">Départ possible dès le ${dateLongue(p.depart)}</span>` : ''}${st === 'a-venir' ? `<span class="label">Naissance prévue vers le ${dateLongue(p.naissancePrevue)}</span>` : ''}</div>`;
  const parents = `<div class="litter__parents">${parentFig(mere)}<svg class="cross" aria-hidden="true"><use href="#i-cross"></use></svg>${parentFig(pere)}</div>`;
  let body = '';
  if (st === 'disponible') {
    const d = p.disponibles, n = d.femelles + d.males;
    const j = p.depart ? joursAvant(p.depart) : null;
    body = `<dl class="kv">
        <div><dt>Chiots disponibles</dt><dd>${d.femelles} femelle${d.femelles > 1 ? 's' : ''}, ${d.males} mâle${d.males > 1 ? 's' : ''}</dd></div>
        <div><dt>Prix</dt><dd class="big">${p.prix ? prix(p.prix) : todo()}</dd></div>
        <div><dt>Race</dt><dd>${p.race}${p.lof ? ' · LOF' : ''}</dd></div>
        <div><dt>Départ possible</dt><dd>${p.depart ? `${dateLongue(p.depart)}${j > 0 ? ` <span style="color:var(--mist)">(dans ${j} jour${j > 1 ? 's' : ''})</span>` : ''}` : todo()}</dd></div>
      </dl>
      ${p.photos.length ? `<div class="stack" style="--gap:12px"><span class="label">Les chiots</span><div class="pups">${p.photos.map((ph, i) => `<div class="pup"><figure class="media" data-frost data-frost-mode="soft" style="margin:0">${img(ph, `Chiot ${i + 1} de la portée ${mere.nom} et ${pere.nom}`, '(max-width: 640px) 30vw, 14vw', '50% 35%')}</figure><span>Chiot ${i + 1} · sexe ${todo()}</span></div>`).join('')}</div></div>` : ''}
      ${legalBox(p)}
      <div class="row">${p.annonce ? `<button class="btn btn--ghost btn--small" type="button" data-poster="${p.annonce}" data-poster-alt="Annonce de la portée ${mere.nom} et ${pere.nom}">Voir l'annonce</button>` : ''}<a class="btn btn--small" data-magnetic href="adopter.html?portee=${p.id}#candidature">Réserver un chiot${ARROW}</a></div>`;
  } else if (st === 'a-venir') {
    body = `<div class="moon-block">${moonSVG()}<div class="stack" style="--gap:14px"><span class="label">Naissance attendue dans environ</span>${countdownHTML()}</div></div>
      <p class="lead" style="max-width:48ch">La lune se remplit à mesure que la naissance approche. Inscrivez-vous dès maintenant pour être prévenu.</p>
      <dl class="kv">
        <div><dt>Mère</dt><dd>${esc(mere.nom)}</dd></div><div><dt>Père</dt><dd>${esc(pere.nom)}</dd></div>
        <div><dt>Race</dt><dd>${p.race}${p.lof === true ? ' · LOF' : ''}</dd></div><div><dt>Prix</dt><dd>${p.prix ? prix(p.prix) : todo()}</dd></div>
      </dl>
      <div class="row">${p.affiche ? `<button class="btn btn--ghost btn--small" type="button" data-poster="${p.affiche}" data-poster-alt="Affiche de l'union ${mere.nom} et ${pere.nom}">Voir l'affiche</button>` : ''}<a class="btn btn--small" data-magnetic href="adopter.html?portee=${p.id}#candidature">Se positionner${ARROW}</a></div>`;
  } else {
    body = `<p class="lead">Portée née ${p.naissance ? `le ${dateLongue(p.naissance)}` : ''}. Tous les chiots ont rejoint leur famille.</p>`;
  }
  return `<article class="litter" id="${p.id}" data-litter="${st}" data-countdown-target="${st === 'a-venir' ? p.naissancePrevue : ''}">
    <div class="stack" style="--gap:28px">${head}<h3 class="litter__title">${esc(mere.nom)} <em>×</em> ${esc(pere.nom)}</h3>${parents}</div>
    <div class="litter__body">${body}</div>
  </article>`;
}

export function seasonCard(p) {
  const st = statutPortee(p);
  const mere = chien(p.mere), pere = chien(p.pere);
  if (st === 'disponible') {
    const d = p.disponibles;
    return `<article class="season-card" data-reveal>
      <div class="litter-head"><span class="status"><i class="dot"></i>Disponibles</span>${p.depart ? `<span class="label">Départ dès le ${dateLongue(p.depart)}</span>` : ''}</div>
      <h3>${esc(mere.nom)} <em>×</em> ${esc(pere.nom)}</h3>
      <div class="pups">${p.photos.map((ph, i) => `<div class="pup"><figure class="media" data-frost data-frost-mode="soft" style="margin:0">${img(ph, `Chiot ${i + 1} de la portée ${mere.nom} et ${pere.nom}`, '(max-width: 640px) 30vw, 14vw', '50% 35%')}</figure></div>`).join('')}</div>
      <dl class="kv">
        <div><dt>Chiots</dt><dd>${d.femelles} femelle${d.femelles > 1 ? 's' : ''}, ${d.males} mâle${d.males > 1 ? 's' : ''}</dd></div>
        <div><dt>Prix</dt><dd class="big">${p.prix ? prix(p.prix) : todo()}</dd></div>
      </dl>
      <div class="row"><a class="btn" data-magnetic href="portees.html#${p.id}">Voir la portée${ARROW}</a></div>
    </article>`;
  }
  if (st === 'a-venir') {
    return `<article class="season-card" data-reveal data-countdown-target="${p.naissancePrevue}">
      <div class="litter-head"><span class="status"><i class="dot dot--ice"></i>À venir</span><span class="label">Vers le ${dateLongue(p.naissancePrevue)}</span></div>
      <h3>${esc(mere.nom)} <em>×</em> ${esc(pere.nom)}</h3>
      <div class="moon-block">${moonSVG()}<div class="stack" style="--gap:12px"><span class="label">Naissance dans environ</span>${countdownHTML()}</div></div>
      <p style="color:var(--mist)">La lune se remplit à mesure que la naissance approche.</p>
      <div class="row"><a class="btn btn--ghost" data-magnetic href="adopter.html?portee=${p.id}#candidature">Se positionner${ARROW}</a></div>
    </article>`;
  }
  return '';
}
