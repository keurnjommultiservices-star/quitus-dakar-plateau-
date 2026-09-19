'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function BadgeDemandeAccueil() {
  const pathname = usePathname();
  if (pathname !== '/') return null;

  return (
    <Link
      href="/demande"
      className="flex items-center gap-3 border border-[var(--line)] px-4 py-2 hover:border-[var(--dgid-brown)] transition-colors"
    >
      <Image src="/icone-demande.png" alt="" width={36} height={41} />
      <span className="serif text-lg text-[var(--dgid-brown)]">Demande de quitus fiscal</span>
    </Link>
  );
}
