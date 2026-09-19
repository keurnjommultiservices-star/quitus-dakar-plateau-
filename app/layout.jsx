import './globals.css';
import Image from 'next/image';
import BadgeDemandeAccueil from './BadgeDemandeAccueil';

export const metadata = {
  title: 'Quitus fiscal — Centre des impôts de Dakar Plateau',
  description: "Dépôt et suivi des demandes de quitus fiscal",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className="min-h-screen flex flex-col">
        <header className="border-b border-[var(--line)] bg-[var(--paper-raised)]">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-start justify-between gap-6 flex-wrap">
            <div>
              <Image src="/logo-dgid.png" alt="Direction Générale des Impôts et des Domaines" width={185} height={62} priority />
              <p className="text-xs text-[var(--ink-soft)] mt-2">
                31 Rue de Thiong, Dakar — +221 33 889 20 02
              </p>
              <p className="text-sm tracking-wide text-[var(--ink-soft)] mt-1">
                Direction Générale des Impôts et des Domaines
              </p>
            </div>
            <BadgeDemandeAccueil />
          </div>
        </header>
        <div className="letterhead" />
        <div className="flex-1">{children}</div>
      </body>
    </html>
  );
}
