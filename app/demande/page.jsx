'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import { STATUTS, libelleStatut, couleurStatut } from '../../lib/statuts';

export default function DemandePage() {
  const router = useRouter();
  const [ninea, setNinea] = useState('');
  const [client, setClient] = useState(null);
  const [demandes, setDemandes] = useState([]);
  const [fichier, setFichier] = useState(null);
  const [etape, setEtape] = useState('recherche'); // recherche | trouve | envoye
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);

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
    if (!fichier) {
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

    const chemin = `${client.ninea}/${nouvelleDemande.id}/${fichier.name}`;
    const { error: errUpload } = await supabase.storage
      .from('pieces-jointes')
      .upload(chemin, fichier);

    if (errUpload) {
      setErreur('Demande créée, mais le fichier n\'a pas pu être envoyé. Contactez le centre.');
    }

    setDemandes((prev) => [nouvelleDemande, ...prev]);
    setEtape('envoye');
    setChargement(false);
  }

  function deconnecter() {
    setNinea('');
    setClient(null);
    setDemandes([]);
    setFichier(null);
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
          </div>

          {demandes.length > 0 && (
            <div>
              <h2 className="text-sm text-[var(--ink-soft)] mb-2">Demandes précédentes</h2>
              <div>
                {demandes.map((d) => (
                  <div key={d.id} className="register-row flex justify-between items-center py-3 text-sm">
                    <span>{new Date(d.date_creation).toLocaleDateString('fr-FR')}</span>
                    <span className="stamp" style={{ color: couleurStatut(d.statut) }}>
                      {libelleStatut(d.statut)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={soumettreDemande} className="space-y-4 pt-2">
            <h2 className="serif text-lg">Nouvelle demande</h2>
            <div>
              <label className="block text-sm text-[var(--ink-soft)] mb-1">Pièce jointe (PDF ou image)</label>
              <input
                type="file"
                accept=".pdf,image/*"
                onChange={(e) => setFichier(e.target.files[0])}
                className="w-full text-sm"
                required
              />
            </div>
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
              setFichier(null);
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
