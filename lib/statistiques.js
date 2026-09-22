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

// Construit un tableau { cle, libelle, recues, deposeesTresor, delaiMoyen } trié chronologiquement
export function statistiquesParPeriode(demandes, cleFn, libelleFn) {
  const compteurs = {};

  function assurer(cle) {
    if (!compteurs[cle]) compteurs[cle] = { recues: 0, deposeesTresor: 0, sommeDelais: 0, nbDelais: 0 };
    return compteurs[cle];
  }

  for (const d of demandes) {
    assurer(cleFn(d.date_creation)).recues += 1;

    if (d.statut === 'depose_au_tresor') {
      const entree = assurer(cleFn(d.date_maj));
      entree.deposeesTresor += 1;

      const jours = (new Date(d.date_maj) - new Date(d.date_creation)) / (1000 * 60 * 60 * 24);
      if (jours >= 0) {
        entree.sommeDelais += jours;
        entree.nbDelais += 1;
      }
    }
  }

  return Object.keys(compteurs)
    .sort()
    .map((cle) => {
      const c = compteurs[cle];
      return {
        cle,
        libelle: libelleFn(cle),
        recues: c.recues,
        deposeesTresor: c.deposeesTresor,
        delaiMoyen: c.nbDelais > 0 ? c.sommeDelais / c.nbDelais : null,
      };
    });
}
