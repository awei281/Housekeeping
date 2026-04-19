# Housekeeping

Housekeeping is the first MVP of a housekeeping service platform, built as a `pnpm` monorepo.

The current branch already covers the first business loop:

- Public website with `home / about / services / standards / contact`
- `/contact` appointment form, submitted through Next.js proxy to the API
- Admin login
- Lead list and lead-to-customer conversion
- Customer list
- Order creation, list, detail, and employee assignment
- Employee basic profile management

## Repository Layout

- `apps/web`: public marketing website, Next.js 15
- `apps/admin`: internal operations console, Vite + React + Ant Design
- `apps/api`: NestJS + Prisma API
- `packages/contracts`: shared DTOs and enums used by web, admin, and API

## Current MVP Status

Completed in the current feature line:

- Task 1 to Task 8
- Website lead capture is connected to the real `leads` table
- Admin business flow is connected end-to-end:
  `lead -> customer -> order -> employee -> assignment`

Next planned task:

- Task 9, content management and service standards management

## Local Prerequisites

- Node.js 20+
- `corepack` enabled
- Docker Desktop
- MySQL 8 in Docker

## Verified Local Database Setup

This repository has been verified locally with Docker MySQL on port `4306`.

On this Windows machine, `3306/3307` can be blocked by reserved port ranges, so `4306` is the safe default here.

Start the database container:

```powershell
docker run -d --name housekeeping-mysql-4306 `
  -e MYSQL_ROOT_PASSWORD=root `
  -e MYSQL_DATABASE=housekeeping `
  -p 4306:3306 `
  mysql:8
```

If the container already exists, start it with:

```powershell
docker start housekeeping-mysql-4306
```

## Environment Notes

The apps do not automatically share one root `.env` file. In local development, the most reliable way is to export the required variables in the shell before starting each app.

Verified local values:

```powershell
$env:DATABASE_URL = 'mysql://root:root@127.0.0.1:4306/housekeeping'
$env:JWT_SECRET = 'replace-me'
$env:API_PORT = '3200'
$env:NEXT_PUBLIC_API_URL = 'http://127.0.0.1:3200'
$env:API_BASE_URL = 'http://127.0.0.1:3200'
$env:VITE_API_BASE_URL = 'http://127.0.0.1:3200'
```

Relevant env usage in code:

- API listens on `API_PORT`, default `3200`
- Prisma reads `DATABASE_URL`
- Web server components read `NEXT_PUBLIC_API_URL`
- Web appointment proxy reads `API_BASE_URL` or `NEXT_PUBLIC_API_URL`
- Admin reads `VITE_API_BASE_URL`

## Install Dependencies

```powershell
corepack pnpm install
```

## Run the Apps

API:

```powershell
corepack pnpm --filter api start:dev
```

Admin:

```powershell
corepack pnpm --filter admin exec vite --host 127.0.0.1 --port 3100
```

Web:

```powershell
corepack pnpm --filter web exec next dev --hostname 127.0.0.1 --port 3000
```

Default local URLs:

- Web: `http://127.0.0.1:3000`
- Admin: `http://127.0.0.1:3100`
- API: `http://127.0.0.1:3200`

## Verified Checks

These commands have been run successfully on the current implementation:

```powershell
corepack pnpm --filter contracts exec tsc --noEmit
corepack pnpm --filter api test
corepack pnpm --filter api build
corepack pnpm --filter admin build
corepack pnpm --filter web build
```

Note about `web build`:

- If the API on `127.0.0.1:3200` is not running, Next.js may print `fetch failed`
- The public site still builds because `apps/web/src/lib/api.ts` contains fallback page content

## Real Runtime Flow Already Verified

The following runtime flow has already been exercised against the local Docker MySQL database:

1. Submit a public lead
2. Login as admin
3. Convert the lead into a customer
4. Create an order
5. Create an employee
6. Assign the employee to the order
7. Read back the order detail with assigned employee info

## Root Scripts

The root workspace exposes these convenience scripts:

```powershell
corepack pnpm dev:web
corepack pnpm dev:admin
corepack pnpm dev:api
corepack pnpm build
corepack pnpm test
```

## Notes For Continuation

- Do not develop directly on `main`
- Active work is in `feature/mvp-bootstrap`
- This repository has a continuation note at `Housekeeping_AI续做上下文.md`
- `/contact` is the only page that should contain the appointment form right now
