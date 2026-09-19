export const STATUTS = [
  { valeur: 'en_attente', libelle: 'En attente', fond: '#1B4B6B', texte: '#FFFFFF' },
  { valeur: 'dossier_incomplet', libelle: 'Dossier incomplet', fond: '#7A2A20', texte: '#FFFFFF' },
  { valeur: 'en_cours_de_traitement', libelle: 'En cours de traitement', fond: '#7A5A12', texte: '#FFFFFF' },
  { valeur: 'depose_au_tresor', libelle: 'Déposé au Trésor', fond: '#0F5C3E', texte: '#FFFFFF' },
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
