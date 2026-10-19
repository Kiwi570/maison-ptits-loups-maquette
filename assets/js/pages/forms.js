/* Validation simple des champs requis, avec messages en français. */
const MSG = {
  valueMissing: 'Ce champ est obligatoire.',
  typeMismatch: 'Vérifiez le format (exemple : nom@domaine.fr).',
};

export function validate(scope) {
  let first = null;
  scope.querySelectorAll('input[required], textarea[required], select[required]').forEach((f) => {
    if (f.type === 'checkbox') return;
    const err = f.closest('.field')?.querySelector('[data-err]');
    let msg = '';
    if (f.validity.valueMissing || !String(f.value).trim()) msg = MSG.valueMissing;
    else if (f.validity.typeMismatch) msg = MSG.typeMismatch;
    else if (f.type === 'tel' && f.value.replace(/\D/g, '').length < 9) msg = 'Indiquez un numéro de téléphone complet.';
    f.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (err) { err.textContent = msg; if (!err.id) err.id = `${f.id}-err`; f.setAttribute('aria-describedby', err.id); }
    if (msg && !first) first = f;
  });
  if (first) first.focus();
  return !first;
}
