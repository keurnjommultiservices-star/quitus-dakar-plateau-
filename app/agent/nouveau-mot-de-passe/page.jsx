'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';

export default function NouveauMotDePasse() {
  const router = useRouter();
  const [pret, setPret] = useState(false);
  const [motDePasse, setMotDePasse] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [erreur, setErreur] = useState('');
  const [message, setMessage] = useState('');
  const [chargement, setChargement] = useState(false);

  useEffect(() => {
    // Le lien reçu par email connecte automatiquement une session temporaire.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setPret(true);
      } else {
        setErreur('Lien invalide ou expiré. Redemandez un email de réinitialisation.');
      }
    });
  }, []);

  async function valider(e) {
    e.preventDefault();
    setErreur('');

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

    setMessage('Mot de passe mis à jour. Redirection...');
    setTimeout(() => router.push('/agent'), 1500);
  }

  return (
    <main className="max-w-sm mx-auto px-6 py-24">
      <h1 className="serif text-2xl mb-8">Nouveau mot de passe</h1>

      {!pret && !message && <p className="stamp text-[var(--clay)]">{erreur || 'Vérification du lien...'}</p>}

      {pret && !message && (
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
          <button
            disabled={chargement}
            className="bg-[var(--green)] text-white px-5 py-2.5 w-full disabled:opacity-50 hover:bg-[var(--green-dark)] transition-colors"
          >
            {chargement ? 'Enregistrement...' : 'Valider'}
          </button>
        </form>
      )}

      {message && <p className="stamp" style={{ color: 'var(--green)' }}>{message}</p>}
    </main>
  );
}
