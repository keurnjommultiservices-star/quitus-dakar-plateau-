'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../../lib/supabaseClient';

export default function GestionAgents() {
  const router = useRouter();
  const [autorise, setAutorise] = useState(false);
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [nomComplet, setNomComplet] = useState('');
  const [role, setRole] = useState('agent');
  const [chargement, setChargement] = useState(false);
  const [message, setMessage] = useState('');
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

  async function ajouterAgent(e) {
    e.preventDefault();
    setErreur('');
    setMessage('');
    setChargement(true);

    const { data: { session } } = await supabase.auth.getSession();

    const res = await fetch('/api/agents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ email, motDePasse, nomComplet, role }),
    });

    const resultat = await res.json();
    setChargement(false);

    if (!res.ok) {
      setErreur(resultat.error || "Erreur lors de la création.");
      return;
    }

    setMessage(`Compte créé pour ${email}. Communiquez-lui ses identifiants.`);
    setEmail('');
    setMotDePasse('');
    setNomComplet('');
    setRole('agent');
  }

  return (
    <main className="max-w-md mx-auto px-6 py-12">
      <Link href="/agent" className="text-sm text-[var(--ink-soft)] hover:text-[var(--ink)]">← Dossiers</Link>
      <h1 className="serif text-2xl mt-3 mb-8">Ajouter un agent</h1>

      <form onSubmit={ajouterAgent} className="space-y-4">
        <div>
          <label className="block text-sm text-[var(--ink-soft)] mb-1">Nom complet</label>
          <input
            className="w-full border border-[var(--line)] bg-[var(--paper-raised)] px-3 py-2 focus:outline-none focus:border-[var(--dgid-brown)]"
            value={nomComplet}
            onChange={(e) => setNomComplet(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm text-[var(--ink-soft)] mb-1">Email</label>
          <input
            type="email"
            className="w-full border border-[var(--line)] bg-[var(--paper-raised)] px-3 py-2 focus:outline-none focus:border-[var(--dgid-brown)]"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm text-[var(--ink-soft)] mb-1">Mot de passe temporaire</label>
          <input
            type="text"
            className="w-full border border-[var(--line)] bg-[var(--paper-raised)] px-3 py-2 focus:outline-none focus:border-[var(--dgid-brown)]"
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            required
            minLength={6}
          />
        </div>
        <div>
          <label className="block text-sm text-[var(--ink-soft)] mb-1">Rôle</label>
          <select
            className="w-full border border-[var(--line)] bg-[var(--paper-raised)] px-3 py-2"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="agent">Agent</option>
            <option value="superviseur">Superviseur</option>
          </select>
        </div>

        {erreur && <p className="stamp text-[var(--clay)]">{erreur}</p>}
        {message && <p className="stamp" style={{ color: 'var(--dgid-brown)' }}>{message}</p>}

        <button
          disabled={chargement}
          className="bg-[var(--dgid-brown)] text-white px-5 py-2.5 disabled:opacity-50 hover:bg-[var(--dgid-brown-dark)] transition-colors"
        >
          {chargement ? 'Création...' : 'Créer le compte'}
        </button>
      </form>
    </main>
  );
}
