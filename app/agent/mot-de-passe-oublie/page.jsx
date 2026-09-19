'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../../lib/supabaseClient';

export default function MotDePasseOublie() {
  const [email, setEmail] = useState('');
  const [chargement, setChargement] = useState(false);
  const [envoye, setEnvoye] = useState(false);
  const [erreur, setErreur] = useState('');

  async function envoyer(e) {
    e.preventDefault();
    setErreur('');
    setChargement(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/agent/nouveau-mot-de-passe`,
    });

    setChargement(false);

    if (error) {
      setErreur("Impossible d'envoyer l'email. Vérifiez l'adresse.");
      return;
    }
    setEnvoye(true);
  }

  return (
    <main className="max-w-sm mx-auto px-6 py-24">
      <Link href="/agent/login" className="text-sm text-[var(--ink-soft)] hover:text-[var(--ink)]">← Connexion</Link>
      <h1 className="serif text-2xl mt-3 mb-8">Mot de passe oublié</h1>

      {envoye ? (
        <p className="stamp" style={{ color: 'var(--dgid-brown)' }}>
          Un email vous a été envoyé avec un lien pour réinitialiser votre mot de passe.
        </p>
      ) : (
        <form onSubmit={envoyer} className="space-y-5">
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
          {erreur && <p className="stamp text-[var(--clay)]">{erreur}</p>}
          <button
            disabled={chargement}
            className="bg-[var(--dgid-brown)] text-white px-5 py-2.5 w-full disabled:opacity-50 hover:bg-[var(--dgid-brown-dark)] transition-colors"
          >
            {chargement ? 'Envoi...' : 'Envoyer le lien'}
          </button>
        </form>
      )}
    </main>
  );
}
