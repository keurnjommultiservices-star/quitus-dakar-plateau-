'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import * as XLSX from 'xlsx';
import { supabase } from '../../../lib/supabaseClient';

export default function ImportContribuables() {
  const router = useRouter();
  const [autorise, setAutorise] = useState(false);
  const [resume, setResume] = useState(null);
  const [nomFichier, setNomFichier] = useState('');
  const [chargement, setChargement] = useState(false);
  const [termine, setTermine] = useState(false);
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        router.push('/agent/login');
        return;
      }
      const { data: profil } = await supabase
        .from('profils_agents')
        .select('role')
        .eq('user_id', data.session.user.id)
        .maybeSingle();

      if (profil?.role !== 'superviseur') {
        router.push('/agent');
      } else {
        setAutorise(true);
      }
    });
  }, [router]);

  if (!autorise) return null;

  async function analyserFichier(e) {
    const fichier = e.target.files[0];
    if (!fichier) return;
    setNomFichier(fichier.name);
    setErreur('');
    setTermine(false);

    const donnees = await fichier.arrayBuffer();
    const classeur = XLSX.read(donnees);
    const feuille = classeur.Sheets[classeur.SheetNames[0]];
    const lignes = XLSX.utils.sheet_to_json(feuille);

    const manquantes = lignes.some(
      (l) => !('NINEA' in l) || !('RAISON_SOCIALE' in l) || !('ADRESSE' in l)
    );
    if (manquantes) {
      setErreur('Colonnes attendues : NINEA, RAISON_SOCIALE, ADRESSE.');
      return;
    }

    const { data: clientsActuels } = await supabase.from('clients').select('*');
    const parNinea = new Map(clientsActuels.map((c) => [c.ninea, c]));
    const nineasDuFichier = new Set(lignes.map((l) => String(l.NINEA).trim()));

    const aAjouter = [];
    const aMettreAJour = [];
    const aDesactiver = [];

    for (const ligne of lignes) {
      const ninea = String(ligne.NINEA).trim();
      const existant = parNinea.get(ninea);
      const email = ligne.EMAIL || null;
      const telephone = ligne.TELEPHONE || null;

      if (!existant) {
        aAjouter.push({
          ninea,
          raison_sociale: ligne.RAISON_SOCIALE,
          adresse: ligne.ADRESSE,
          email,
          telephone,
          statut_contribuable: 'actif',
        });
      } else if (
        existant.raison_sociale !== ligne.RAISON_SOCIALE ||
        existant.adresse !== ligne.ADRESSE ||
        existant.email !== email ||
        existant.telephone !== telephone ||
        existant.statut_contribuable !== 'actif'
      ) {
        aMettreAJour.push({
          ninea,
          raison_sociale: ligne.RAISON_SOCIALE,
          adresse: ligne.ADRESSE,
          email,
          telephone,
          statut_contribuable: 'actif',
        });
      }
    }

    for (const client of clientsActuels) {
      if (client.statut_contribuable === 'actif' && !nineasDuFichier.has(client.ninea)) {
        aDesactiver.push(client.ninea);
      }
    }

    setResume({ aAjouter, aMettreAJour, aDesactiver });
  }

  async function confirmerImport() {
    setChargement(true);
    const { aAjouter, aMettreAJour, aDesactiver } = resume;

    if (aAjouter.length) await supabase.from('clients').insert(aAjouter);

    for (const c of aMettreAJour) {
      await supabase
        .from('clients')
        .update({
          raison_sociale: c.raison_sociale,
          adresse: c.adresse,
          email: c.email,
          telephone: c.telephone,
          statut_contribuable: 'actif',
        })
        .eq('ninea', c.ninea);
    }

    if (aDesactiver.length) {
      await supabase
        .from('clients')
        .update({ statut_contribuable: 'inactif' })
        .in('ninea', aDesactiver);
    }

    const { data: session } = await supabase.auth.getSession();
    await supabase.from('historique_imports').insert({
      nom_fichier: nomFichier,
      nb_ajouts: aAjouter.length,
      nb_mises_a_jour: aMettreAJour.length,
      nb_desactivations: aDesactiver.length,
      agent_id: session.session?.user.id,
    });

    setChargement(false);
    setTermine(true);
    setResume(null);
  }

  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <Link href="/agent" className="text-sm text-[var(--ink-soft)] hover:text-[var(--ink)]">← Dossiers</Link>
      <h1 className="serif text-2xl mt-3 mb-8">Importer la liste des contribuables</h1>

      <input type="file" accept=".xlsx,.xls" onChange={analyserFichier} className="text-sm mb-6" />

      {erreur && <p className="stamp text-[var(--clay)] mb-4">{erreur}</p>}

      {termine && (
        <p className="stamp mb-4" style={{ color: 'var(--green)' }}>Import appliqué avec succès.</p>
      )}

      {resume && (
        <div className="border border-[var(--line)] bg-[var(--paper-raised)] p-5 space-y-2 text-sm mb-6">
          <p>Nouveaux contribuables à ajouter : <strong>{resume.aAjouter.length}</strong></p>
          <p>Contribuables à mettre à jour : <strong>{resume.aMettreAJour.length}</strong></p>
          <p>Contribuables à désactiver (absents du fichier) : <strong>{resume.aDesactiver.length}</strong></p>
        </div>
      )}

      {resume && (
        <button
          onClick={confirmerImport}
          disabled={chargement}
          className="bg-[var(--green)] text-white px-5 py-2.5 disabled:opacity-50 hover:bg-[var(--green-dark)] transition-colors"
        >
          {chargement ? 'Application en cours...' : "Confirmer l'import"}
        </button>
      )}
    </main>
  );
}
