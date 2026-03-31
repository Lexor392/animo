# Architecture

## Overview

The project uses a feature-based frontend architecture designed for long-term scalability.

Main goals:

- isolate business logic by domain
- keep infrastructure separate from product features
- avoid coupling server state to client stores
- make routing, layouts and reusable UI independently evolvable

## Layer Structure

### `src/core`

Global application infrastructure.

- `api` contains cross-cutting clients such as Supabase and React Query setup
- `providers` contains top-level application providers
- `routing` contains router configuration and shared layouts
- `store` contains global Zustand stores that are allowed by project rules

### `src/features`

Domain-oriented business modules.

Current features:

- `auth`
- `profile`
- `communities`
- `posts`
- `chat`
- `notifications`

Each feature should own:

- feature API access
- feature-specific hooks
- feature-local UI when it is not globally reusable
- types related to the feature domain
- a local `README.md`

### `src/shared`

Reusable cross-feature building blocks.

- `ui` contains design-system-level primitives such as `Button` and `Input`
- `hooks` contains generic hooks
- `utils` contains framework-agnostic helpers
- `types` contains shared interfaces
- `constants` contains route maps and query keys

### `src/pages`

Route entry points that compose widgets and features for a specific screen.

Pages should stay thin:

- no direct API requests
- minimal orchestration only
- layout composition and route-specific assembly

### `src/widgets`

Large reusable UI blocks assembled from shared primitives and feature logic.

Examples:

- `Feed`
- `Header`
- `Sidebar`

## State Management Rules

### Zustand

Use Zustand only for:

- auth state
- UI state
- chat state

### React Query

Use React Query for all server state.

Never duplicate API data in Zustand unless there is a very explicit synchronization need and the architecture decision is documented.

## Routing and Layouts

The router is centralized in `src/core/routing/router.tsx`.

Current layouts:

- `MainLayout`
- `AuthLayout`
- `ChatLayout`

This separation keeps page concerns independent from shell concerns.

## Feature Growth Strategy

When adding a new feature:

1. Create a folder in `src/features/<feature-name>`.
2. Add a local `README.md`.
3. Add API, hooks, model and types only if needed.
4. Expose the feature to pages or widgets through a narrow public surface.
5. Keep shared code out of features unless it is truly reusable across domains.
