# Housekeeping

Housekeeping is a monorepo for the first MVP of a housekeeping service platform.

## Apps

- `apps/web`: public marketing website
- `apps/admin`: internal operations dashboard
- `apps/api`: backend API service

## Packages

- `packages/contracts`: shared business types and enums

## Local Development

1. Copy `.env.example` to `.env` where needed.
2. Install dependencies with `pnpm install`.
3. Start each app with the root scripts:
   - `pnpm dev:web`
   - `pnpm dev:admin`
   - `pnpm dev:api`
