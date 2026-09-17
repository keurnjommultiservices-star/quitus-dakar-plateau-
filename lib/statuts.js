export const STATUTS = [
  { valeur: 'en_attente', libelle: 'En attente', couleur: '#8A8272' },
  { valeur: 'dossier_incomplet', libelle: 'Dossier incomplet', couleur: '#A23B2E' },
  { valeur: 'en_cours_de_traitement', libelle: 'En cours de traitement', couleur: '#B8862E' },
  { valeur: 'depose_au_tresor', libelle: 'Déposé au Trésor', couleur: '#0F5C3E' },
];

export function libelleStatut(valeur) {
  return STATUTS.find((s) => s.valeur === valeur)?.libelle || valeur;
}

export function couleurStatut(valeur) {
  return STATUTS.find((s) => s.valeur === valeur)?.couleur || '#8A8272';
}
