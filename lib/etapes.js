export const ETAPES = [
  { valeur: 'secretariat', libelle: 'Secrétariat' },
  { valeur: 'gestion', libelle: 'Service Gestion' },
  { valeur: 'recouvrement', libelle: 'Service Recouvrement' },
  { valeur: 'retour_secretariat', libelle: 'Retour Secrétariat / Chef de centre' },
  { valeur: 'tresor', libelle: 'Déposé au Trésor' },
  { valeur: 'impayes', libelle: 'Impayés constatés' },
];

export function libelleEtape(valeur) {
  return ETAPES.find((e) => e.valeur === valeur)?.libelle || valeur;
}
