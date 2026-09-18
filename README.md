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

Le superviseur peut créer lui-même les comptes agents, depuis **"Gérer les agents"** dans son tableau de bord (`/agent/agents`). Il saisit l'email, un mot de passe temporaire, le nom et le rôle (agent/superviseur) — le compte est créé instantanément.

**Mais le tout premier compte superviseur (celui du chef de bureau) doit encore être créé manuellement une fois par toi**, dans Supabase (Authentication → Add user, puis une ligne dans `profils_agents` avec `role = superviseur`) — ensuite, il peut créer les suivants lui-même.

Cette fonctionnalité nécessite la clé secrète Supabase (`service_role`), à ajouter une seule fois :
1. Tableau de bord Supabase → Project Settings → API Keys → `service_role` → "Reveal" → copier
2. Coller dans `.env.local` : `SUPABASE_SERVICE_ROLE_KEY=...`
3. Sur Vercel : Project Settings → Environment Variables → ajouter `SUPABASE_SERVICE_ROLE_KEY` (type **Secret**, sans le préfixe `NEXT_PUBLIC_`, donc jamais visible côté navigateur)

**Important** : cette clé donne un accès total à la base de données. Ne jamais la partager, ne jamais la committer sur GitHub (le `.gitignore` exclut déjà `.env.local`).

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
