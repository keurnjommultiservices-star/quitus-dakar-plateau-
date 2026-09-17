import Link from 'next/link';

export default function Home() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <p className="text-sm tracking-wide text-[var(--ink-soft)] mb-1">
        Direction Générale des Impôts et des Domaines
      </p>
      <h1 className="serif text-3xl font-medium mb-2">
        Quitus fiscal — Centre des impôts de Dakar Plateau
      </h1>
      <p className="text-[var(--ink-soft)] mb-12 max-w-md">
        Dépôt d'une demande de quitus fiscal, et suivi de son traitement jusqu'à son dépôt au Trésor.
      </p>

      <div>
        <Link href="/demande" className="register-row flex items-center justify-between py-5 group">
          <div>
            <div className="serif text-lg">Contribuable</div>
            <div className="text-sm text-[var(--ink-soft)]">Déposer ou suivre une demande de quitus</div>
          </div>
          <span className="text-[var(--green)] group-hover:translate-x-1 transition-transform">›</span>
        </Link>
        <Link href="/agent/login" className="register-row flex items-center justify-between py-5 group">
          <div>
            <div className="serif text-lg">Agent des impôts</div>
            <div className="text-sm text-[var(--ink-soft)]">Traiter les dossiers déposés</div>
          </div>
          <span className="text-[var(--green)] group-hover:translate-x-1 transition-transform">›</span>
        </Link>
      </div>
    </main>
  );
}
