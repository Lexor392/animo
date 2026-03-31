# Animo Frontend Foundation

Animo is a scalable frontend foundation for a social network platform inspired by community-first products such as Amino. The project is built around a feature-based architecture and prepared for long-term growth, team collaboration and Supabase integration.

## Stack

- React 18
- TypeScript
- Vite
- React Router v6
- Zustand
- TanStack React Query
- TailwindCSS
- Supabase JavaScript Client

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create local environment file

Create `.env` in the project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Start development server

```bash
npm run dev
```

### 4. Check production build

```bash
npm run build
```

## Supabase Bootstrap

The project includes a full re-runnable Supabase bootstrap SQL script:

- [`docs/supabase-schema.sql`](./docs/supabase-schema.sql)

This script prepares:

- `profiles` and profile trigger setup
- `avatars` storage bucket and policies
- `communities` and `community_members`
- `community-icons` and `community-banners` buckets
- `posts` and `post_likes`
- `comments` for post discussions
- `comment_likes` for comment reactions
- `post-media` bucket and policies
- row-level security policies for all current core features

Setup flow:

```bash
1. Open Supabase SQL Editor
2. Copy the contents of docs/supabase-schema.sql
3. Run the script once in your project
```

## GitHub Pages Deployment

The repository includes GitHub Pages preparation via `gh-pages`.

The base path is configured through Vite environment loading:

- default local build base: `/`
- GitHub Pages build base: defined in `.env.gh-pages`

Current GitHub Pages config file:

[`.env.gh-pages`](./.env.gh-pages)

```env
VITE_APP_BASE_PATH=/animo/
```

If your GitHub repository name changes, update this value to match the repository path.

Deployment flow:

```bash
npm run build
npm run deploy
```

Useful scripts:

- `npm run dev`
- `npm run build`
- `npm run build:gh-pages`
- `npm run preview`
- `npm run deploy`
- `npm run typecheck`

## Commit Workflow

Recommended commit prefixes:

- `feat:`
- `fix:`
- `refactor:`
- `docs:`
- `style:`

Example:

```text
feat: add auth foundation
```

## Folder Architecture

```text
src/
|- core/
|  |- api/
|  |- providers/
|  |- routing/
|  `- store/
|- features/
|  |- auth/
|  |- profile/
|  |- communities/
|  |- posts/
|  |- comments/
|  |- likes/
|  |- chat/
|  `- notifications/
|- shared/
|  |- ui/
|  |- hooks/
|  |- utils/
|  |- types/
|  `- constants/
|- pages/
`- widgets/
```

Architecture notes:

- `core` contains app-wide infrastructure
- `features` contains domain business logic
- `shared` contains reusable primitives and helpers
- `pages` contain route-level composition
- `widgets` contain large reusable UI blocks

Detailed documentation:

- [Architecture](./docs/architecture.md)
- [Contributing](./CONTRIBUTING.md)
- [Changelog](./CHANGELOG.md)
- [Current Version](./VERSION.md)

## CI Preparation

The repository already contains a reserved `.github/workflows/` directory so GitHub Actions can be added later without restructuring the repo.
