# ResumeAI

> AI-Powered Resume Builder SaaS Platform

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | ≥ 18.17.0 | Runtime |
| npm | ≥ 9.0.0 | Package manager |
| XAMPP | Any recent | MySQL 8.x on port 3306 |
| Git | Any recent | Version control |

## Quick Start

### 1. Clone & Install

```bash
git clone <repo-url>
cd ResumeAI
npm install
```

### 2. Environment Setup

```bash
npm run env:setup
# Then edit .env with your actual values (database, API keys, etc.)
```

### 3. Database Setup

1. Start **MySQL** from XAMPP Control Panel
2. Create the database:
   ```sql
   CREATE DATABASE resume_ai_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
3. Run migrations and seed:
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

### 4. Start Development

```bash
npm run dev
```

This starts both servers concurrently:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api/v1
- **Prisma Studio**: `npm run db:studio` (optional, port 5555)

## Project Structure

```
ResumeAI/
├── client/          → Next.js 14 frontend (port 3000)
├── server/          → Express.js backend (port 5000)
├── shared/          → Shared TypeScript types & constants
├── docs/            → PRD and documentation
├── .env.example     → Environment template
├── tsconfig.base.json → Base TypeScript config
└── package.json     → Workspace root
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both frontend and backend in dev mode |
| `npm run dev:server` | Start backend only |
| `npm run dev:client` | Start frontend only |
| `npm run build` | Build all packages for production |
| `npm run lint` | Run ESLint across all packages |
| `npm run lint:fix` | Auto-fix ESLint issues |
| `npm run format` | Format all files with Prettier |
| `npm run format:check` | Check formatting without fixing |
| `npm run type-check` | TypeScript type checking (no emit) |
| `npm run clean` | Remove all build artifacts and node_modules |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Run database migrations |
| `npm run db:seed` | Seed database with initial data |
| `npm run db:reset` | Reset database (drop + migrate + seed) |
| `npm run db:studio` | Open Prisma Studio GUI |

## Architecture

- **Clean Architecture** — Domain → Application → Infrastructure layers
- **Feature-based modules** — Each feature is self-contained
- **Shared types** — TypeScript interfaces shared between frontend and backend
- **API versioning** — All routes under `/api/v1/`
- **Standardized responses** — Consistent JSON format for all API responses

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React 18, TypeScript |
| Styling | Tailwind CSS, shadcn/ui |
| State | Zustand, React Query |
| Backend | Express.js, TypeScript |
| ORM | Prisma |
| Database | MySQL 8.x (XAMPP) |
| Auth | JWT (access + refresh tokens) |
| AI | OpenAI API (gpt-4o / gpt-4o-mini) |
| Validation | Zod |
| Logging | Winston |

## License

UNLICENSED — Proprietary
