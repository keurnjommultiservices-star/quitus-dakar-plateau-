export const DOCUMENTS_REQUIS = [
  'Copie des 3 dernières déclarations de TVA',
  'Copie des 3 dernières déclarations RAS salaires (VRS)',
  'Copie des 3 dernières déclarations RAS TIERS (BRS)',
  "Copie de la déclaration CEL VL de l'année en cours",
  "Copie de la déclaration CEL VA de l'année en cours",
  "Copie de l'accusé de réception des états financiers de l'année en cours",
  "Quittance de paiement de la CEL VL de l'année N-1",
  "Quittance de paiement IR ou IS de l'année N-1",
];

export function slugPiece(label) {
  return label
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase();
}
