const MOIS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

export function cleMois(dateIso) {
  const d = new Date(dateIso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function libelleMois(cle) {
  const [annee, mois] = cle.split('-');
  return `${MOIS_FR[parseInt(mois, 10) - 1]} ${annee}`;
}

export function cleTrimestre(dateIso) {
  const d = new Date(dateIso);
  const trimestre = Math.floor(d.getMonth() / 3) + 1;
  return `${d.getFullYear()}-T${trimestre}`;
}

export function libelleTrimestre(cle) {
  const [annee, t] = cle.split('-');
  return `${t} ${annee}`;
}

// Construit un tableau { cle, libelle, recues, deposeesTresor } trié chronologiquement
export function statistiquesParPeriode(demandes, cleFn, libelleFn) {
  const compteurs = {};

  for (const d of demandes) {
    const cleReception = cleFn(d.date_creation);
    if (!compteurs[cleReception]) compteurs[cleReception] = { recues: 0, deposeesTresor: 0 };
    compteurs[cleReception].recues += 1;

    if (d.statut === 'depose_au_tresor') {
      const cleDepot = cleFn(d.date_maj);
      if (!compteurs[cleDepot]) compteurs[cleDepot] = { recues: 0, deposeesTresor: 0 };
      compteurs[cleDepot].deposeesTresor += 1;
    }
  }

  return Object.keys(compteurs)
    .sort()
    .map((cle) => ({ cle, libelle: libelleFn(cle), ...compteurs[cle] }));
}
