# Contributing

## Code Style

- Use strict TypeScript. `any` is not allowed.
- Prefer small functional components and custom hooks.
- Keep API access inside feature API modules. Do not fetch directly in components.
- Use Zustand only for auth state, UI state and chat state.
- Use React Query only for server state.
- Keep one component per file.

## Naming Rules

- Components: `PascalCase`
- Hooks: `useSomething`
- Types: keep in dedicated `*.types.ts` files when the type is reused
- Files: `PascalCase` for components and `kebab-case` only for non-component utility files already following that pattern
- Route pages live in `src/pages`
- Shared primitives live in `src/shared/ui`

## Feature Documentation Rule

- Every new feature folder must include a local `README.md`.
- The feature README should describe purpose, public API, dependencies and planned next steps.
- Example: `src/features/auth/README.md`

## Commit Rules

Use conventional prefixes:

- `feat:` for new functionality
- `fix:` for bug fixes
- `refactor:` for internal improvements without behavior changes
- `docs:` for documentation updates
- `style:` for visual or formatting-only changes

Examples:

- `feat: add auth foundation`
- `fix: handle missing supabase environment variables`
- `docs: describe feature-based architecture`
