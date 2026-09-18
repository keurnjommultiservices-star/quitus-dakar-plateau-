'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../../lib/supabaseClient';

export default function ChangerMotDePasse() {
  const router = useRouter();
  const [autorise, setAutorise] = useState(false);
  const [motDePasse, setMotDePasse] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [erreur, setErreur] = useState('');
  const [message, setMessage] = useState('');
  const [chargement, setChargement] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.push('/agent/login');
      } else {
        setAutorise(true);
      }
    });
  }, [router]);

  if (!autorise) return null;

  async function valider(e) {
    e.preventDefault();
    setErreur('');
    setMessage('');

    if (motDePasse.length < 6) {
      setErreur('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (motDePasse !== confirmation) {
      setErreur('Les mots de passe ne correspondent pas.');
      return;
    }

    setChargement(true);
    const { error } = await supabase.auth.updateUser({ password: motDePasse });
    setChargement(false);

    if (error) {
      setErreur('Erreur lors de la mise à jour. Réessayez.');
      return;
    }

    setMessage('Mot de passe mis à jour.');
    setMotDePasse('');
    setConfirmation('');
  }

  return (
    <main className="max-w-sm mx-auto px-6 py-12">
      <Link href="/agent" className="text-sm text-[var(--ink-soft)] hover:text-[var(--ink)]">← Dossiers</Link>
      <h1 className="serif text-2xl mt-3 mb-8">Changer mon mot de passe</h1>

      <form onSubmit={valider} className="space-y-5">
        <div>
          <label className="block text-sm text-[var(--ink-soft)] mb-1">Nouveau mot de passe</label>
          <input
            type="password"
            className="w-full border border-[var(--line)] bg-[var(--paper-raised)] px-3 py-2 focus:outline-none focus:border-[var(--green)]"
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            required
            minLength={6}
          />
        </div>
        <div>
          <label className="block text-sm text-[var(--ink-soft)] mb-1">Confirmer le mot de passe</label>
          <input
            type="password"
            className="w-full border border-[var(--line)] bg-[var(--paper-raised)] px-3 py-2 focus:outline-none focus:border-[var(--green)]"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            required
            minLength={6}
          />
        </div>
        {erreur && <p className="stamp text-[var(--clay)]">{erreur}</p>}
        {message && <p className="stamp" style={{ color: 'var(--green)' }}>{message}</p>}
        <button
          disabled={chargement}
          className="bg-[var(--green)] text-white px-5 py-2.5 w-full disabled:opacity-50 hover:bg-[var(--green-dark)] transition-colors"
        >
          {chargement ? 'Enregistrement...' : 'Valider'}
        </button>
      </form>
    </main>
  );
}
