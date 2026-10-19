/* Adopter : traces de pattes, questionnaire, candidature en quatre étapes (démonstration). */
import { PORTEES, chien, statutPortee, dateLongue } from '../data.js';
import { initPaws } from '../fx/paws.js';
import { esc } from '../render.js';
import { $, $$ } from '../core.js';
import { validate } from './forms.js';

const { gsap } = window;

export default async function adopter(core) {
  initPaws($('[data-journey]'), { calm: core.calm });
  quiz(core);
  wizard(core);
  core.bind(document);
}

function quiz(core) {
  const qs = $$('[data-q]');
  const meter = $('[data-quiz-meter]'), title = $('[data-quiz-title]'), text = $('[data-quiz-text]');
  const update = () => {
    const answers = qs.map((q) => q.querySelector('[aria-pressed="true"]')?.dataset.a);
    const done = answers.filter((a) => a != null).length, yes = answers.filter((a) => a === '1').length;
    meter.style.width = `${(yes / qs.length) * 100}%`;
    if (done < qs.length) { title.textContent = `${done} réponse${done > 1 ? 's' : ''} sur ${qs.length}`; text.textContent = 'Votre bilan s\'affiche quand vous avez répondu à tout.'; return; }
    if (yes === qs.length) { title.textContent = 'Vous semblez prêt pour un husky'; text.innerHTML = 'Parlons de votre projet : <a class="link link--always" href="#candidature">déposer une candidature</a>.'; }
    else if (yes >= 3) { title.textContent = 'Vous êtes sur la bonne voie'; text.innerHTML = 'Quelques points restent à préparer. Nous pouvons en parler ensemble : <a class="link link--always" href="contact.html">nous contacter</a>.'; }
    else { title.textContent = 'Prenez le temps d\'y réfléchir'; text.innerHTML = 'Le Husky Sibérien demande beaucoup de temps et d\'espace. Nous restons disponibles pour en discuter : <a class="link link--always" href="contact.html">nous contacter</a>.'; }
    if (!core.calm) gsap.fromTo(title, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 });
  };
  qs.forEach((q) => q.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
    q.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    update();
  })));
}

function wizard(core) {
  const form = $('[data-wizard]');
  const steps = $$('[data-wstep]', form);
  const prog = $$('.wizard__progress li', form);
  const prev = $('[data-prev]', form), next = $('[data-next]', form), submit = $('[data-submit]', form);
  const success = $('[data-wizard-success]', form), nav = $('[data-wizard-nav]', form);
  let i = 0;

  // Portées proposées (depuis le fichier de données)
  const select = $('[data-litter-select]', form);
  const opts = PORTEES.filter((p) => statutPortee(p) !== 'passee').map((p) => {
    const st = statutPortee(p);
    const label = `${chien(p.mere).nom} × ${chien(p.pere).nom} · ${st === 'disponible' ? `disponibles${p.depart ? ` dès le ${dateLongue(p.depart)}` : ''}` : `naissance vers le ${dateLongue(p.naissancePrevue)}`}`;
    return `<option value="${p.id}">${esc(label)}</option>`;
  });
  select.innerHTML = `${opts.join('')}<option value="prochaine">Une prochaine portée</option><option value="indecis">Je ne sais pas encore</option>`;
  const wanted = new URLSearchParams(location.search).get('portee');
  if (wanted && select.querySelector(`option[value="${CSS.escape(wanted)}"]`)) select.value = wanted;

  const firstHint = $('[data-first-dog]', form);
  $$('input[name="premier"]', form).forEach((r) => r.addEventListener('change', () => { firstHint.hidden = !$('input[name="premier"][value="Oui"]', form).checked; }));

  const show = (n) => {
    steps[i].hidden = true; i = n; steps[i].hidden = false;
    prog.forEach((li, k) => { li.classList.toggle('done', k < i); li.classList.toggle('current', k === i); });
    prev.hidden = i === 0; next.hidden = i === steps.length - 1; submit.hidden = i !== steps.length - 1;
    if (i === steps.length - 1) recap();
    if (!core.calm) gsap.from(steps[i], { opacity: 0, x: 30, duration: 0.6, ease: 'expo.out' });
    const top = form.getBoundingClientRect().top;
    if (top < 0) core.scrollTo(form, -100);
  };
  const recap = () => {
    const fd = new FormData(form);
    const rows = [['Nom', fd.get('nom')], ['Ville', fd.get('ville')], ['E-mail', fd.get('email')], ['Téléphone', fd.get('tel')], ['Portée', select.options[select.selectedIndex]?.text], ['Sexe souhaité', fd.get('sexe')], ['Premier chien', fd.get('premier')], ['Logement', fd.get('logement')], ['Sorties par jour', fd.get('temps')], ['Autres animaux', fd.get('animaux') || 'Non précisé']];
    $('[data-recap]', form).innerHTML = rows.map(([k, v]) => `<dt>${k}</dt><dd>${esc(v || '')}</dd>`).join('');
  };
  next.addEventListener('click', () => { if (validate(steps[i])) show(i + 1); });
  prev.addEventListener('click', () => show(i - 1));
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const box = $('#w-rgpd', form), err = $('[data-err-rgpd]', form);
    if (!box.checked) { err.textContent = 'Cochez cette case pour continuer.'; box.focus(); return; }
    err.textContent = '';
    steps.forEach((s) => { s.hidden = true; }); nav.hidden = true; $('.wizard__progress', form).hidden = true;
    success.hidden = false; success.focus();
    if (!core.calm) gsap.from(success, { opacity: 0, y: 30, duration: 0.8, ease: 'expo.out' });
  });
  $('[data-wizard-reset]', form).addEventListener('click', () => {
    form.reset(); success.hidden = true; nav.hidden = false; $('.wizard__progress', form).hidden = false; firstHint.hidden = true;
    steps.forEach((s) => { s.hidden = true; }); i = 0; steps[0].hidden = false; show(0);
  });
}
