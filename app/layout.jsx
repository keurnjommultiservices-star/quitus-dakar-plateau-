import './globals.css';

export const metadata = {
  title: 'Quitus fiscal — Centre des impôts de Dakar Plateau',
  description: "Dépôt et suivi des demandes de quitus fiscal",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className="min-h-screen">
        <div className="letterhead" />
        {children}
      </body>
    </html>
  );
}
