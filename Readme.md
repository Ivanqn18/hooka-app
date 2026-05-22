# HookaHub — Agent Instructions

## Project Overview

Full-stack application for a hookah/shisha community platform. Monorepo with:
- **Frontend**: React 19 + Vite + Tailwind CSS + React Router (SPA)
- **Backend**: NestJS + Prisma + PostgreSQL + Socket.IO
- **Infra**: Docker + Caddy reverse proxy + GitHub Container Registry deploy to DigitalOcean

## Repository Structure

```
/
├── frontend/          # React SPA (Vite, port 5173 dev)
├── backend/           # NestJS API (port 3000)
│   ├── prisma/        # Schema + migrations
│   └── src/
│       ├── auth/      # JWT cookie-based auth
│       ├── users/     # User profiles, stash, follows
│       ├── mezclas/   # Mix recipes with images
│       ├── marketplace/ # Product listings with images
│       ├── bares/     # Bar/location directory
│       ├── chat/      # Socket.IO messaging
│       ├── notificaciones/
│       └── tobacco-scraper/ # Puppeteer scraper
├── Caddyfile          # Reverse proxy config
├── docker-compose.yml # Production orchestration
└── .github/workflows/deploy.yml # CI/CD
```

## Development Commands

### Frontend
```bash
cd frontend
npm install --legacy-peer-deps
npm run dev          # Vite dev server (port 5173)
npm run build        # Production build (tsc + vite)
npm run lint         # ESLint
```

### Backend
```bash
cd backend
npm install --legacy-peer-deps
npm run start:dev    # NestJS watch mode (port 3000)
npm run build        # Nest build
npm run lint         # ESLint with --fix
npx prisma migrate dev   # Run migrations in dev
npx prisma migrate deploy # Run migrations in production
npx prisma generate  # Regenerate Prisma client
npm run test         # Jest unit tests
```

### Full Stack (Docker)
```bash
# Requires .env with PostgreSQL credentials
docker compose up -d   # Starts: db, backend, frontend, caddy
```

## Critical Architecture Notes

### Auth Flow
- **Cookie-based JWT**: `token` (access) + `refresh_token` cookies, `httpOnly`, `secure`, `sameSite: 'lax'`
- Auth context in frontend fetches `/auth/me` on mount to restore session
- Caddy serves frontend and backend on same domain (`hookahub.me` in prod)

### File Uploads
- **Images are auto-compressed** via `ImageCompressionInterceptor` using Sharp
  - JPEG: quality 85, progressive
  - PNG: quality 85, compression level 8
  - WebP: quality 80
  - Max dimension: 1920px (resize with `fit: 'inside'`)
- **Size limits**: Avatars 2MB, Products/Mezclas 10MB
- **Storage**: `./uploads/{avatars,mezclas,products}/` → served at `/uploads/`
- In production, Caddy serves `/uploads/*` directly from shared Docker volume

### Database (Prisma)
- **Always run migrations** after schema changes: `npx prisma migrate dev --name <name>`
- **Never skip `prisma migrate deploy`** in production deploy script (line 126 of deploy.yml)
- ERD generator is removed during Docker build (see backend/Dockerfile line 16)
- Key models: `User`, `Mix`, `Product`, `Chat`, `Message`, `Bar`, `Notification`, `UserStash`, `UserFollow`

### Frontend-Backend Communication
- Dev proxy in `vite.config.ts` routes `/api`, `/uploads`, `/socket.io` to `localhost:3000`
- In production, Caddy handles routing:
  - `/api/*` → backend
  - `/uploads/*` → static files
  - `/socket.io/*` → backend (WebSockets)
  - Everything else → frontend SPA

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://user:pass@localhost:5432/hookahub?schema=public
JWT_SECRET=<generate-strong-secret>
JWT_REFRESH_SECRET=<generate-strong-secret>
FRONTEND_URL=https://hookahub.me
NODE_ENV=production
PORT=3000
```

### Docker/Deploy (GitHub Secrets)
```
POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB, POSTGRES_PORT
DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET
FRONTEND_URL, ACME_EMAIL, DOMAIN, NODE_ENV
```

**Critical**: `NODE_ENV` must be set to `production` in GitHub Secrets for correct cookie behavior.

## Deployment Workflow

1. Push to `main` triggers GitHub Actions workflow (`.github/workflows/deploy.yml`)
2. Builds Docker images for backend + frontend
3. Pushes to GitHub Container Registry (`ghcr.io/ivanqn18/hookahub-{backend,frontend}:latest`)
4. SCPs `docker-compose.yml` + `Caddyfile` to DigitalOcean droplet
5. SSHs into droplet, writes `.env`, pulls images, starts containers
6. Runs `prisma migrate deploy` against production database
7. **Downtime**: ~10-20 seconds during container swap

## Common Gotchas

### Backend
- **Sharp dependency**: Requires `libvips` in Docker. Backend Dockerfile installs build/runtime deps for image processing
- **Trust proxy**: Must be enabled (`app.set('trust proxy', 1)`) for `secure` cookies behind Caddy
- **Compression**: Caddy handles Brotli/gzip for API responses; backend also uses Express compression middleware as fallback
- **Multer errors**: Use `MulterExceptionFilter` for proper error messages on file upload failures

### Frontend
- **PWA**: VitePWA plugin configured with service worker caching. Runtime caching targets `localhost:3000` — update for production domain if needed
- **Image URLs**: Use `/uploads/...` paths (proxied in dev, served by Caddy in prod)
- **React 19**: Uses SWC plugin (not Babel)

### Database
- **Missing tables**: If Prisma reports missing table (e.g., `UserFollows`), check if migration file exists in `prisma/migrations/` and was deployed
- **Migration lock**: `migration_lock.toml` ensures migrations run in order

## Testing

- **Backend**: Jest with ts-jest. Test files: `*.spec.ts`
- **Frontend**: No test runner configured currently
- **Integration tests**: None configured

## Style Conventions

- **Backend**: NestJS standard (decorators, dependency injection, DTOs in `dto/` folders)
- **Frontend**: React functional components, hooks, context for state (AuthContext)
- **Both**: TypeScript strict mode

## Important Files to Check

- `backend/prisma/schema.prisma` — Database schema (source of truth)
- `backend/src/main.ts` — App bootstrap, middleware, CORS, static files
- `Caddyfile` — Production routing and compression
- `docker-compose.yml` — Container orchestration
- `.github/workflows/deploy.yml` — CI/CD pipeline
- `frontend/src/services/api.ts` — Axios config (with `withCredentials: true`)
- `frontend/src/context/AuthContext.tsx` — Auth state management
