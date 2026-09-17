# Quitus fiscal — Centre Dakar Plateau

## Démarrage local

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Puis ouvrir http://localhost:3000

## Déploiement sur Vercel

1. Pousser ce projet sur GitHub
2. Importer le repo sur https://vercel.com/new
3. Ajouter les variables d'environnement (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) dans les réglages du projet Vercel — voir `.env.local.example`
4. Déployer

## Créer les comptes agents

1. Tableau de bord Supabase → Authentication → Users → "Add user" (email + mot de passe). Copier l'UID généré.
2. Table Editor → `profils_agents` → Insert row : `user_id` = l'UID copié, `role` = `agent` ou `superviseur`.

Seul le rôle `superviseur` (le chef de bureau) voit le lien d'import et peut importer la liste des contribuables ; un `agent` ne voit que les dossiers et peut changer leur statut.

## Structure

- `/` — accueil, choix client / agent
- `/demande` — espace client : recherche par NINEA, suivi, dépôt de demande + pièce jointe
- `/agent/login` — connexion agent
- `/agent` — liste des dossiers, changement de statut
- `/agent/import` — import Excel des contribuables (ajout / mise à jour / désactivation)

## Base de données (déjà créée sur Supabase, projet `quitus-dakar-plateau`)

- `clients`, `demandes`, `historique_statuts`, `historique_imports`
- Bucket de stockage `pieces-jointes` pour les documents des demandes
- Row Level Security : lecture publique sur `clients`/`demandes`, écriture/modification réservée aux agents authentifiés (sauf création de demande, ouverte à tous)
