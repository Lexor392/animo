## v0.2.0

### Added
- Full email authentication system with login, registration, logout, session persistence and protected routes.
- Dedicated auth feature structure with typed API, hooks, store, feature pages and form components.
- Supabase profile bootstrap during registration and auth-specific documentation.
- Full profile feature with public profile pages, edit flow, avatar upload, Supabase Storage integration and profile-specific React Query hooks.

### Changed
- Moved auth state into `features/auth/store` and rewired router to use feature-owned auth pages.
- Updated navigation and route protection flow for authenticated and guest users.
- Replaced profile placeholders with a production-ready feature module and aligned auth profile bootstrap with the `profiles` table contract.

### Fixed
- Improved auth loading states, validation feedback and redirect behavior around session restore.
- Added profile cache invalidation and ownership checks around profile editing.

## v0.1.0

### Added
- Initial frontend foundation on Vite, React 18, TypeScript, React Router, Zustand, React Query, TailwindCSS and Supabase.
- Feature-based project structure with `core`, `features`, `shared`, `pages` and `widgets` layers.
- Infrastructure layer: versioning files, project documentation, contribution rules, GitHub Pages deployment flow and CI-ready folders.

### Changed
- Migrated the project runtime from the default starter setup to a scalable Vite-based architecture.

### Fixed
- Standardized repository setup for environment variables, build output and deployment preparation.
