/* =====================================================================
   DONNÉES DE L'ÉLEVAGE — fichier unique à mettre à jour
   ---------------------------------------------------------------------
   • Les portées sont classées automatiquement (à venir, disponibles,
     passées) selon leurs dates : il suffit de modifier ce fichier.
   • null = information « à compléter » (affichée comme telle sur le site).
   • Les dates s'écrivent AAAA-MM-JJ.
   ===================================================================== */

export const ELEVAGE = {
  nom: "Élevage De la Maison des p'tits loups",
  nomCourt: "La Maison des p'tits loups",
  devise: "Plus qu'un métier, une passion",
  race: 'Husky Sibérien',
  depuis: 2020,
  telephone: '07 85 20 67 30',
  telephoneLien: '+33785206730',
  email: 'delamaisondesptitsloups@hotmail.com',
  adresse: { rue: '1 rue de la Croix Poquet', cp: '91650', ville: 'Breuillet', departement: 'Essonne (91)', pays: 'France' },
  coordonnees: { lat: 48.5653, lon: 2.1706 }, // centre de Breuillet (approximatif)
  siren: '902 928 332',
  siret: '902 928 332 00011',
  acaced: true,
  reseaux: {
    facebook: 'https://www.facebook.com/LaMaisondesptitsloups1/',
    instagram: 'https://instagram.com/la_maison_des_ptits_loups',
    tiktok: 'https://www.tiktok.com/@lamaisondesptitsloups',
  },
};

/* Résultats de santé : code et valeur tels que publiés par l'élevage. */
export const TESTS = {
  HD: { libelle: 'Hanches', detail: 'Dysplasie de la hanche, grille FCI de A (aucun signe) à E (sévère).' },
  ED: { libelle: 'Coudes', detail: 'Dysplasie du coude, grille de 0 (normal) à 3 (sévère).' },
  Eyes: { libelle: 'Yeux', detail: "Examen des yeux par un vétérinaire : « clear » signifie aucune anomalie détectée le jour de l'examen." },
  DNA: { libelle: 'ADN', detail: 'Profil ADN enregistré. « comp » indique en général une filiation vérifiée (à confirmer par l\'élevage).' },
};

export const CHIENS = [
  {
    id: 'volverine', nom: 'Volverine', surnom: 'Logan', nomComplet: 'Volverine (Logan)', sexe: 'male',
    race: 'Husky Sibérien', couleur: null, naissance: null, pedigree: null,
    tests: [{ code: 'HD', valeur: 'A' }, { code: 'Eyes', valeur: 'clear' }, { code: 'DNA', valeur: 'comp' }],
    photo: 'volverine-net', photos: ['volverine-net', 'volverine-chiot-net'], position: '58% 40%',
    teinte: '#3a2d22', aConfirmer: 'Appelé « Volverine zorsky » sur une photo de l\'élevage : nom exact à confirmer.',
  },
  {
    id: 'apache', nom: 'Apache', surnom: null, nomComplet: 'Apache', sexe: 'male',
    race: 'Husky Sibérien', couleur: null, naissance: null, pedigree: null,
    tests: [{ code: 'DNA', valeur: 'comp' }],
    photo: 'apache', photos: ['apache', 'apache-allonge'], position: '50% 30%',
    teinte: '#1d2430', aConfirmer: 'Attribution des photos à confirmer.',
  },
  {
    id: 'yarna', nom: 'Yarna', surnom: null, nomComplet: "S'torianstar Sibiriada Yarna", sexe: 'femelle',
    race: 'Husky Sibérien', couleur: null, naissance: null, pedigree: null,
    tests: [{ code: 'HD', valeur: 'A' }, { code: 'Eyes', valeur: 'clear' }],
    photo: 'yarna-net', photos: ['yarna-net'], position: '42% 40%',
    teinte: '#2c3a2a', aConfirmer: null,
  },
  {
    id: 'abysse', nom: 'Abysse', surnom: null, nomComplet: 'Eskifavorite Tzarista (Abysse)', sexe: 'femelle',
    race: 'Husky Sibérien', couleur: null, naissance: null, pedigree: null,
    tests: [],
    photo: 'abysse', photos: ['abysse'], position: '30% 40%',
    teinte: '#26282c', aConfirmer: 'Photo à confirmer. Résultats de santé à compléter.',
  },
  {
    id: 'zira', nom: 'Zira', surnom: null, nomComplet: 'Berry Mix Zira', sexe: 'femelle',
    race: 'Husky Sibérien', couleur: null, naissance: null, pedigree: null,
    tests: [{ code: 'HD', valeur: 'B/C' }, { code: 'ED', valeur: '0' }, { code: 'Eyes', valeur: 'clear' }, { code: 'DNA', valeur: '' }],
    photo: 'zira-net', photos: ['zira-net'], position: '70% 50%',
    teinte: '#2f3320', aConfirmer: 'Résultats repris de la page « Nos femelles » : attribution à confirmer.',
  },
  {
    id: 'vixie', nom: 'Vixie', surnom: null, nomComplet: 'Flower Of Tenebrae Verdandi The Soothsayer (Vixie)', sexe: 'femelle',
    race: 'Husky Sibérien', couleur: null, naissance: null, pedigree: null,
    tests: [{ code: 'HD', valeur: 'B/C' }, { code: 'Eyes', valeur: 'clear' }, { code: 'DNA', valeur: 'comp' }],
    photo: 'vixie', photos: ['vixie'], position: '70% 40%',
    teinte: '#2b2f26', aConfirmer: 'Photo à confirmer.',
  },
];

export const PORTEES = [
  {
    id: 'yarna-volverine', mere: 'yarna', pere: 'volverine', race: 'Husky Sibérien',
    lof: true,
    naissance: null,            // date de naissance : à compléter
    naissancePrevue: null,
    depart: '2026-11-07',       // « disponibles le 07/11 » (année à confirmer)
    disponibles: { femelles: 2, males: 1 },
    totalChiots: null,          // nombre de chiots de la portée : à compléter
    prix: 1100,
    idMere: null,               // n° d'identification de la mère : à compléter
    photos: ['portee-yv-chiot-1', 'portee-yv-chiot-2', 'portee-yv-chiot-3'],
    annonce: 'annonce-yarna-volverine',
  },
  {
    id: 'vixie-volverine', mere: 'vixie', pere: 'volverine', race: 'Husky Sibérien',
    lof: null,
    naissance: null,
    naissancePrevue: '2026-10-30', // « Naissance prévue vers 30/10 » (année à confirmer)
    depart: null,
    disponibles: null,
    totalChiots: null,
    prix: null,
    idMere: null,
    photos: [],
    affiche: 'affiche-vixie-volverine',
  },
];

/* ---------- outils ---------- */
export const chien = (id) => CHIENS.find((c) => c.id === id);

const parisDate = (iso, h = 0) => {
  // Fuseau Europe/Paris : +01:00 en hiver, +02:00 en été (approximation suffisante pour l'affichage)
  const [y, m, d] = iso.split('-').map(Number);
  const ete = isSummerParis(new Date(Date.UTC(y, m - 1, d, 12)));
  return new Date(Date.UTC(y, m - 1, d, h - (ete ? 2 : 1)));
};
function isSummerParis(date) {
  const y = date.getUTCFullYear();
  const lastSunday = (month) => { const d = new Date(Date.UTC(y, month + 1, 0)); d.setUTCDate(d.getUTCDate() - d.getUTCDay()); return d; };
  return date >= lastSunday(2) && date < lastSunday(9);
}
export const dateParis = parisDate;

export function statutPortee(p, now = new Date()) {
  if (p.statut) return p.statut;
  const nbDispo = p.disponibles ? (p.disponibles.femelles || 0) + (p.disponibles.males || 0) : 0;
  if (!p.naissance && p.naissancePrevue) return 'a-venir';
  if (nbDispo > 0) {
    if (p.depart && now - parisDate(p.depart) > 90 * 864e5) return 'passee';
    return 'disponible';
  }
  return 'passee';
}

export function portesTriees(now = new Date()) {
  const groupes = { 'a-venir': [], disponible: [], passee: [] };
  PORTEES.forEach((p) => groupes[statutPortee(p, now)].push(p));
  const d = (p) => +parisDate(p.naissance || p.naissancePrevue || p.depart || '2000-01-01');
  groupes['a-venir'].sort((a, b) => d(a) - d(b));
  groupes.disponible.sort((a, b) => d(a) - d(b));
  groupes.passee.sort((a, b) => d(b) - d(a));
  return groupes;
}

export const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
export const dateLongue = (iso) => { const [y, m, d] = iso.split('-').map(Number); return `${d === 1 ? '1er' : d} ${MOIS[m - 1]} ${y}`; };
export const prix = (n) => n == null ? null : new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
