'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../../lib/supabaseClient';

export default function LoginAgent() {
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);
  const router = useRouter();

  async function connecter(e) {
    e.preventDefault();
    setErreur('');
    setChargement(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: motDePasse,
    });

    setChargement(false);

    if (error) {
      setErreur('Identifiants incorrects.');
      return;
    }
    router.push('/agent');
  }

  return (
    <main className="max-w-sm mx-auto px-6 py-24">
      <Link href="/" className="text-sm text-[var(--ink-soft)] hover:text-[var(--ink)]">← Accueil</Link>
      <h1 className="serif text-2xl mt-3 mb-8">Connexion agent</h1>
      <form onSubmit={connecter} className="space-y-5">
        <div>
          <label className="block text-sm text-[var(--ink-soft)] mb-1">Email</label>
          <input
            type="email"
            className="w-full border border-[var(--line)] bg-[var(--paper-raised)] px-3 py-2 focus:outline-none focus:border-[var(--green)]"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm text-[var(--ink-soft)] mb-1">Mot de passe</label>
          <input
            type="password"
            className="w-full border border-[var(--line)] bg-[var(--paper-raised)] px-3 py-2 focus:outline-none focus:border-[var(--green)]"
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            required
          />
        </div>
        {erreur && <p className="stamp text-[var(--clay)]">{erreur}</p>}
        <button
          disabled={chargement}
          className="bg-[var(--green)] text-white px-5 py-2.5 w-full disabled:opacity-50 hover:bg-[var(--green-dark)] transition-colors"
        >
          {chargement ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>
    </main>
  );
}
