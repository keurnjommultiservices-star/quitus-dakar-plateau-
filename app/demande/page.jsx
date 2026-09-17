'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import { STATUTS, libelleStatut, couleurStatut, fondStatut } from '../../lib/statuts';
import { DOCUMENTS_REQUIS, slugPiece } from '../../lib/documentsRequis';

let compteurLignesLibres = 0;

export default function DemandePage() {
  const router = useRouter();
  const [ninea, setNinea] = useState('');
  const [client, setClient] = useState(null);
  const [demandes, setDemandes] = useState([]);
  const [piecesFixes, setPiecesFixes] = useState(() =>
    Object.fromEntries(DOCUMENTS_REQUIS.map((d) => [d, []]))
  );
  const [piecesLibres, setPiecesLibres] = useState([]);
  const [etape, setEtape] = useState('recherche'); // recherche | trouve | envoye
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);

  function ajouterFichiersFixe(label, e) {
    const nouveaux = Array.from(e.target.files || []);
    setPiecesFixes((prev) => ({ ...prev, [label]: [...prev[label], ...nouveaux] }));
    e.target.value = '';
  }

  function retirerFichierFixe(label, index) {
    setPiecesFixes((prev) => ({ ...prev, [label]: prev[label].filter((_, i) => i !== index) }));
  }

  function ajouterLigneLibre() {
    compteurLignesLibres += 1;
    setPiecesLibres((prev) => [...prev, { id: compteurLignesLibres, label: '', fichiers: [] }]);
  }

  function renommerLigneLibre(id, label) {
    setPiecesLibres((prev) => prev.map((l) => (l.id === id ? { ...l, label } : l)));
  }

  function ajouterFichiersLibre(id, e) {
    const nouveaux = Array.from(e.target.files || []);
    setPiecesLibres((prev) =>
      prev.map((l) => (l.id === id ? { ...l, fichiers: [...l.fichiers, ...nouveaux] } : l))
    );
    e.target.value = '';
  }

  function retirerFichierLibre(id, index) {
    setPiecesLibres((prev) =>
      prev.map((l) => (l.id === id ? { ...l, fichiers: l.fichiers.filter((_, i) => i !== index) } : l))
    );
  }

  function retirerLigneLibre(id) {
    setPiecesLibres((prev) => prev.filter((l) => l.id !== id));
  }

  function reinitialiserPieces() {
    setPiecesFixes(Object.fromEntries(DOCUMENTS_REQUIS.map((d) => [d, []])));
    setPiecesLibres([]);
  }

  async function rechercherNinea(e) {
    e.preventDefault();
    setErreur('');
    setChargement(true);

    const { data: clientTrouve, error: err1 } = await supabase
      .from('clients')
      .select('*')
      .eq('ninea', ninea.trim())
      .eq('statut_contribuable', 'actif')
      .maybeSingle();

    if (err1 || !clientTrouve) {
      setErreur("NINEA non reconnu. Veuillez contacter le centre des impôts.");
      setClient(null);
      setChargement(false);
      return;
    }

    const { data: demandesExistantes } = await supabase
      .from('demandes')
      .select('*')
      .eq('ninea', ninea.trim())
      .order('date_creation', { ascending: false });

    setClient(clientTrouve);
    setDemandes(demandesExistantes || []);
    setEtape('trouve');
    setChargement(false);
  }

  async function soumettreDemande(e) {
    e.preventDefault();

    const totalFixes = Object.values(piecesFixes).reduce((n, l) => n + l.length, 0);
    const totalLibres = piecesLibres.reduce((n, l) => n + l.fichiers.length, 0);
    if (totalFixes + totalLibres === 0) {
      setErreur('Veuillez joindre au moins un document.');
      return;
    }
    setErreur('');
    setChargement(true);

    const { data: nouvelleDemande, error: errDemande } = await supabase
      .from('demandes')
      .insert({ ninea: client.ninea, statut: 'en_attente' })
      .select()
      .single();

    if (errDemande) {
      setErreur("Erreur lors de l'envoi de la demande. Réessayez.");
      setChargement(false);
      return;
    }

    let echecUpload = false;

    for (const [label, liste] of Object.entries(piecesFixes)) {
      for (const fichier of liste) {
        const chemin = `${client.ninea}/${nouvelleDemande.id}/${slugPiece(label)}/${fichier.name}`;
        const { error } = await supabase.storage.from('pieces-jointes').upload(chemin, fichier);
        if (error) echecUpload = true;
      }
    }

    for (const ligne of piecesLibres) {
      const label = ligne.label.trim() || 'autre';
      for (const fichier of ligne.fichiers) {
        const chemin = `${client.ninea}/${nouvelleDemande.id}/${slugPiece(label)}/${fichier.name}`;
        const { error } = await supabase.storage.from('pieces-jointes').upload(chemin, fichier);
        if (error) echecUpload = true;
      }
    }

    if (echecUpload) {
      setErreur('Demande créée, mais certains fichiers n\'ont pas pu être envoyés. Contactez le centre.');
    }

    setDemandes((prev) => [nouvelleDemande, ...prev]);
    setEtape('envoye');
    setChargement(false);
  }

  function deconnecter() {
    setNinea('');
    setClient(null);
    setDemandes([]);
    reinitialiserPieces();
    setEtape('recherche');
    router.push('/');
  }

  return (
    <main className="max-w-xl mx-auto px-6 py-16">
      <div className="flex justify-between items-center">
        <Link href="/" className="text-sm text-[var(--ink-soft)] hover:text-[var(--ink)]">← Accueil</Link>
        {etape !== 'recherche' && (
          <button onClick={deconnecter} className="text-sm text-[var(--ink-soft)] hover:text-[var(--ink)]">
            Se déconnecter
          </button>
        )}
      </div>
      <h1 className="serif text-2xl mt-3 mb-8">Demande de quitus fiscal</h1>

      {etape === 'recherche' && (
        <form onSubmit={rechercherNinea} className="space-y-5">
          <div>
            <label className="block text-sm text-[var(--ink-soft)] mb-1">Numéro NINEA</label>
            <input
              className="w-full border border-[var(--line)] bg-[var(--paper-raised)] px-3 py-2 focus:outline-none focus:border-[var(--green)]"
              value={ninea}
              onChange={(e) => setNinea(e.target.value)}
              required
            />
          </div>
          {erreur && <p className="stamp text-[var(--clay)]">{erreur}</p>}
          <button
            disabled={chargement}
            className="bg-[var(--green)] text-white px-5 py-2.5 disabled:opacity-50 hover:bg-[var(--green-dark)] transition-colors"
          >
            {chargement ? 'Recherche...' : 'Continuer'}
          </button>
        </form>
      )}

      {etape === 'trouve' && client && (
        <div className="space-y-8">
          <button
            onClick={() => {
              setEtape('recherche');
              setClient(null);
              setDemandes([]);
              setNinea('');
            }}
            className="text-sm text-[var(--ink-soft)] hover:text-[var(--ink)]"
          >
            ← Nouvelle recherche
          </button>

          <div className="border border-[var(--line)] bg-[var(--paper-raised)] p-5">
            <div className="serif text-lg">{client.raison_sociale}</div>
            <div className="text-sm text-[var(--ink-soft)]">{client.adresse}</div>
            <div className="text-sm text-[var(--ink-soft)]">NINEA {client.ninea}</div>
            {client.telephone && (
              <div className="text-sm text-[var(--ink-soft)]">{client.telephone}</div>
            )}
            {client.email && (
              <div className="text-sm text-[var(--ink-soft)]">{client.email}</div>
            )}
          </div>

          {demandes.length > 0 && (
            <div>
              <h2 className="text-sm text-[var(--ink-soft)] mb-2">Demandes précédentes</h2>
              <div>
                {demandes.map((d) => (
                  <div key={d.id} className="register-row flex justify-between items-center py-3 text-sm">
                    <span>{new Date(d.date_creation).toLocaleDateString('fr-FR')}</span>
                    <span
                      className="text-sm px-2.5 py-1"
                      style={{ backgroundColor: fondStatut(d.statut), color: couleurStatut(d.statut) }}
                    >
                      {libelleStatut(d.statut)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={soumettreDemande} className="space-y-6 pt-2">
            <h2 className="serif text-lg">Nouvelle demande</h2>

            <div>
              {DOCUMENTS_REQUIS.map((label) => (
                <div key={label} className="register-row py-3">
                  <div className="flex justify-between items-center gap-3">
                    <span className="text-sm">{label}</span>
                    <label className="text-xs text-[var(--green)] underline cursor-pointer shrink-0">
                      Ajouter un fichier
                      <input
                        type="file"
                        accept=".pdf,image/*"
                        multiple
                        onChange={(e) => ajouterFichiersFixe(label, e)}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {piecesFixes[label].length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {piecesFixes[label].map((f, i) => (
                        <li key={i} className="flex justify-between items-center text-xs text-[var(--ink-soft)]">
                          <span className="truncate">{f.name}</span>
                          <button
                            type="button"
                            onClick={() => retirerFichierFixe(label, i)}
                            className="text-[var(--clay)] ml-3 shrink-0"
                          >
                            Retirer
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}

              {piecesLibres.map((ligne) => (
                <div key={ligne.id} className="register-row py-3">
                  <div className="flex justify-between items-center gap-3">
                    <input
                      type="text"
                      placeholder="Nom du document"
                      value={ligne.label}
                      onChange={(e) => renommerLigneLibre(ligne.id, e.target.value)}
                      className="text-sm flex-1 border-b border-[var(--line)] bg-transparent focus:outline-none focus:border-[var(--green)] py-0.5"
                    />
                    <label className="text-xs text-[var(--green)] underline cursor-pointer shrink-0">
                      Ajouter un fichier
                      <input
                        type="file"
                        accept=".pdf,image/*"
                        multiple
                        onChange={(e) => ajouterFichiersLibre(ligne.id, e)}
                        className="hidden"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => retirerLigneLibre(ligne.id)}
                      className="text-[var(--clay)] text-xs shrink-0"
                    >
                      Supprimer
                    </button>
                  </div>
                  {ligne.fichiers.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {ligne.fichiers.map((f, i) => (
                        <li key={i} className="flex justify-between items-center text-xs text-[var(--ink-soft)]">
                          <span className="truncate">{f.name}</span>
                          <button
                            type="button"
                            onClick={() => retirerFichierLibre(ligne.id, i)}
                            className="text-[var(--clay)] ml-3 shrink-0"
                          >
                            Retirer
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={ajouterLigneLibre}
              className="text-sm text-[var(--green)] underline"
            >
              + Ajouter un document
            </button>

            {erreur && <p className="stamp text-[var(--clay)]">{erreur}</p>}
            <button
              disabled={chargement}
              className="bg-[var(--green)] text-white px-5 py-2.5 disabled:opacity-50 hover:bg-[var(--green-dark)] transition-colors"
            >
              {chargement ? 'Envoi...' : 'Soumettre la demande'}
            </button>
          </form>
        </div>
      )}

      {etape === 'envoye' && (
        <div className="border border-[var(--line)] bg-[var(--paper-raised)] p-6 space-y-3">
          <p className="serif text-lg" style={{ color: couleurStatut('en_attente') }}>Demande envoyée</p>
          <p className="text-sm text-[var(--ink-soft)]">
            Vous pouvez revenir sur cette page à tout moment avec votre NINEA pour suivre le statut de votre dossier.
          </p>
          <button
            onClick={() => {
              setEtape('trouve');
              reinitialiserPieces();
            }}
            className="text-sm underline text-[var(--green)]"
          >
            Retour
          </button>
        </div>
      )}
    </main>
  );
}
