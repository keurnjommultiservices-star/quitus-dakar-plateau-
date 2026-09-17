export const STATUTS = [
  { valeur: 'en_attente', libelle: 'En attente', fond: '#DCEAF7', texte: '#1B4B6B' },
  { valeur: 'dossier_incomplet', libelle: 'Dossier incomplet', fond: '#F7DCD9', texte: '#7A2A20' },
  { valeur: 'en_cours_de_traitement', libelle: 'En cours de traitement', fond: '#FBEFCF', texte: '#7A5A12' },
  { valeur: 'depose_au_tresor', libelle: 'Déposé au Trésor', fond: '#DCEEE3', texte: '#0F5C3E' },
];

export function libelleStatut(valeur) {
  return STATUTS.find((s) => s.valeur === valeur)?.libelle || valeur;
}

export function couleurStatut(valeur) {
  return STATUTS.find((s) => s.valeur === valeur)?.texte || '#5C5747';
}

export function fondStatut(valeur) {
  return STATUTS.find((s) => s.valeur === valeur)?.fond || '#EEEBE0';
}
