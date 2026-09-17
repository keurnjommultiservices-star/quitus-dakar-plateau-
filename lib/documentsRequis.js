export const DOCUMENTS_REQUIS = [
  '3 dernières déclarations TVA',
  '3 dernières déclarations RAS Salaires',
  '3 dernières déclarations RAS Tiers',
  'CEL VL',
  'CEL VA',
  'Récépissé dépôt EF',
  "Récépissé dépôt État 1024",
  'Contrat de location enregistré',
];

export function slugPiece(label) {
  return label
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase();
}
