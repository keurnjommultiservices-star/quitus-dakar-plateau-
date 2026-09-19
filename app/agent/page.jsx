'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import { STATUTS, couleurStatut, fondStatut } from '../../lib/statuts';

export default function AgentDashboard() {
  const [session, setSession] = useState(undefined);
  const [role, setRole] = useState(null);
  const [dossiers, setDossiers] = useState([]);
  const [filtreStatut, setFiltreStatut] = useState('tous');
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.push('/agent/login');
      } else {
        setSession(data.session);
      }
    });
  }, [router]);

  useEffect(() => {
    if (session) {
      chargerDossiers();
      supabase
        .from('profils_agents')
        .select('role')
        .eq('user_id', session.user.id)
        .maybeSingle()
        .then(({ data }) => setRole(data?.role || 'agent'));
    }
  }, [session]);

  async function chargerDossiers() {
    const { data } = await supabase
      .from('demandes')
      .select('*, clients(raison_sociale, adresse)')
      .order('date_creation', { ascending: false });
    setDossiers(data || []);
  }

  async function changerStatut(demande, nouveauStatut) {
    await supabase.from('demandes').update({ statut: nouveauStatut }).eq('id', demande.id);

    await supabase.from('historique_statuts').insert({
      demande_id: demande.id,
      ancien_statut: demande.statut,
      nouveau_statut: nouveauStatut,
      agent_id: session.user.id,
    });

    chargerDossiers();
  }

  async function deconnecter() {
    await supabase.auth.signOut();
    router.push('/agent/login');
  }

  if (!session) return null;

  const dossiersAffiches =
    filtreStatut === 'tous' ? dossiers : dossiers.filter((d) => d.statut === filtreStatut);

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <div className="flex justify-between items-start mb-10">
        <div>
          <Link href="/" className="text-base text-[var(--ink-soft)] hover:text-[var(--ink)]">← Accueil</Link>
          <h1 className="serif text-2xl mt-3">Dossiers de quitus</h1>
        </div>
        <div className="flex gap-5 text-base pt-1">
          {role === 'superviseur' && (
            <>
              <Link href="/agent/import" className="text-[var(--dgid-brown)] hover:underline">
                Importer les contribuables
              </Link>
              <Link href="/agent/agents" className="text-[var(--dgid-brown)] hover:underline">
                Gérer les agents
              </Link>
            </>
          )}
          <Link href="/agent/changer-mot-de-passe" className="text-[var(--dgid-brown)] hover:underline">
            Changer mon mot de passe
          </Link>
          <button onClick={deconnecter} className="text-[var(--ink-soft)] hover:text-[var(--ink)]">
            Déconnexion
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-6 text-base">
        <button
          onClick={() => setFiltreStatut('tous')}
          className={`px-3 py-1.5 border font-bold ${filtreStatut === 'tous' ? 'border-[var(--dgid-brown)] bg-[var(--dgid-brown)] text-white' : 'border-[var(--line)] text-[var(--ink-soft)] font-normal'}`}
        >
          Tous
        </button>
        {STATUTS.map((s) => (
          <button
            key={s.valeur}
            onClick={() => setFiltreStatut(s.valeur)}
            className={`px-3 py-1.5 border ${filtreStatut === s.valeur ? 'font-bold' : ''}`}
            style={
              filtreStatut === s.valeur
                ? { borderColor: s.fond, backgroundColor: s.fond, color: s.texte }
                : { borderColor: 'var(--line)', color: 'var(--ink-soft)' }
            }
          >
            {s.libelle}
          </button>
        ))}
      </div>

      <div>
        {dossiersAffiches.map((d) => (
          <div key={d.id} className="register-row flex justify-between items-center py-4">
            <div>
              <div className="serif">{d.clients?.raison_sociale || d.ninea}</div>
              <div className="text-sm text-[var(--ink-soft)]">
                NINEA {d.ninea} — {new Date(d.date_creation).toLocaleDateString('fr-FR')}
              </div>
            </div>
            <select
              value={d.statut}
              onChange={(e) => changerStatut(d, e.target.value)}
              className="border-0 px-3 py-1.5 text-sm font-bold"
              style={{ backgroundColor: fondStatut(d.statut), color: couleurStatut(d.statut) }}
            >
              {STATUTS.map((s) => (
                <option key={s.valeur} value={s.valeur}>
                  {s.libelle}
                </option>
              ))}
            </select>
          </div>
        ))}
        {dossiersAffiches.length === 0 && (
          <p className="text-[var(--ink-soft)] text-base py-6">Aucun dossier pour ce filtre.</p>
        )}
      </div>
    </main>
  );
}
