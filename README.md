# La Maison des p'tits loups · maquette

Site statique (HTML, CSS, JavaScript), sans étape de construction. Prêt pour Vercel.

## Mettre à jour les chiens et les portées
Tout se trouve dans `assets/js/data.js` :
- `CHIENS` : nom, résultats de santé, photos.
- `PORTEES` : dates, chiots disponibles, prix. Les portées se classent seules (à venir, disponibles, passées) selon leurs dates.
- `null` = information affichée « à compléter ».

## Remplacer une image
- Photos de l'élevage : `assets/img/photos/` (trois tailles : -640, -1280, -1920, en WebP).
- Visuels d'ambiance Grok : `assets/img/grok/` (mêmes noms que dans le document Grok).

## Bibliothèques incluses
GSAP 3.15 (ScrollTrigger, SplitText), Lenis 1.3, OGL 1.0. Polices Fraunces et Inter Tight (licence OFL).
