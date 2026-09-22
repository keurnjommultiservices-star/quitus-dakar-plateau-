'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../../lib/supabaseClient';
import { cleMois, libelleMois, cleTrimestre, libelleTrimestre, statistiquesParPeriode } from '../../../lib/statistiques';

export default function StatistiquesAgent() {
  const router = useRouter();
  const [autorise, setAutorise] = useState(false);
  const [demandes, setDemandes] = useState([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        router.push('/agent/login');
        return;
      }
      setAutorise(true);
      const { data: toutesDemandes } = await supabase
        .from('demandes')
        .select('statut, date_creation, date_maj');
      setDemandes(toutesDemandes || []);
      setChargement(false);
    });
  }, [router]);

  if (!autorise) return null;

  const parMois = statistiquesParPeriode(demandes, cleMois, libelleMois);
  const parTrimestre = statistiquesParPeriode(demandes, cleTrimestre, libelleTrimestre);

  const totalRecues = demandes.length;
  const totalDeposeesTresor = demandes.filter((d) => d.statut === 'depose_au_tresor').length;

  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <div className="flex justify-between items-center print:hidden">
        <Link href="/agent" className="text-lg font-bold text-[var(--ink-soft)] hover:text-[var(--ink)]">← Dossiers</Link>
        <button
          onClick={() => window.print()}
          className="text-[var(--dgid-brown)] hover:underline text-base"
        >
          Imprimer / Exporter en PDF
        </button>
      </div>

      <h1 className="serif text-2xl mt-3 mb-2">Statistiques des demandes de quitus</h1>
      <p className="text-sm text-[var(--ink-soft)] mb-8">
        Centre des impôts de Dakar Plateau — Demandes reçues au secrétariat et déposées au Trésor
      </p>

      {chargement ? (
        <p className="text-[var(--ink-soft)]">Chargement...</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 mb-10">
            <div className="border border-[var(--line)] bg-[var(--paper-raised)] p-4">
              <div className="text-2xl font-bold">{totalRecues}</div>
              <div className="text-sm text-[var(--ink-soft)]">Total reçues au secrétariat</div>
            </div>
            <div className="border border-[var(--line)] bg-[var(--paper-raised)] p-4">
              <div className="text-2xl font-bold">{totalDeposeesTresor}</div>
              <div className="text-sm text-[var(--ink-soft)]">Total déposées au Trésor</div>
            </div>
          </div>

          <h2 className="serif text-lg mb-3">Par mois</h2>
          <table className="w-full text-sm mb-10 border-collapse">
            <thead>
              <tr className="border-b-2 border-[var(--ink)] text-left">
                <th className="py-2">Mois</th>
                <th className="py-2 text-right">Reçues au secrétariat</th>
                <th className="py-2 text-right">Déposées au Trésor</th>
              </tr>
            </thead>
            <tbody>
              {parMois.map((ligne) => (
                <tr key={ligne.cle} className="register-row">
                  <td className="py-2">{ligne.libelle}</td>
                  <td className="py-2 text-right">{ligne.recues}</td>
                  <td className="py-2 text-right">{ligne.deposeesTresor}</td>
                </tr>
              ))}
              {parMois.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-4 text-[var(--ink-soft)]">Aucune donnée.</td>
                </tr>
              )}
            </tbody>
          </table>

          <h2 className="serif text-lg mb-3">Par trimestre</h2>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-[var(--ink)] text-left">
                <th className="py-2">Trimestre</th>
                <th className="py-2 text-right">Reçues au secrétariat</th>
                <th className="py-2 text-right">Déposées au Trésor</th>
              </tr>
            </thead>
            <tbody>
              {parTrimestre.map((ligne) => (
                <tr key={ligne.cle} className="register-row">
                  <td className="py-2">{ligne.libelle}</td>
                  <td className="py-2 text-right">{ligne.recues}</td>
                  <td className="py-2 text-right">{ligne.deposeesTresor}</td>
                </tr>
              ))}
              {parTrimestre.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-4 text-[var(--ink-soft)]">Aucune donnée.</td>
                </tr>
              )}
            </tbody>
          </table>
        </>
      )}
    </main>
  );
}
