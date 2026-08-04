# Finapp Backend

Nest.js API for the budgeting app. It is prepared for the current Supabase/PostgreSQL data model: `expenses`, `categories`, `budgets`, and yearly finance summaries.

## Setup

```bash
cd backend
cp .env.example .env
npm install
npm run prisma:generate
npm run start:dev
```

The API starts on `http://localhost:4000/api` by default.

## Environment

- `DATABASE_URL` - PostgreSQL connection string, for example the Supabase database URL.
- `SUPABASE_URL` - Supabase project URL, used as the expected token issuer.
- `SUPABASE_JWKS_URL` - Supabase JWKS URL used to verify frontend access tokens.
- `SUPABASE_JWT_SECRET` - optional legacy fallback for old HS256 Supabase projects.
- `CORS_ORIGIN` - allowed frontend origin, defaults to `http://localhost:5173`.
- `AUTH_ENABLED=false` - local-only mode; send `x-user-id` or set `LOCAL_USER_ID`.

## Endpoints

All endpoints except `/api` and `/api/health` require `Authorization: Bearer <supabase-access-token>`.

- `GET /api/expenses?month=YYYY-MM`
- `POST /api/expenses`
- `PATCH /api/expenses/:id`
- `DELETE /api/expenses/:id`
- `GET /api/categories`
- `POST /api/categories`
- `PATCH /api/categories/:id`
- `DELETE /api/categories/:id`
- `GET /api/budgets?month=YYYY-MM`
- `POST /api/budgets`
- `PATCH /api/budgets/:id`
- `GET /api/summary/yearly?year=YYYY`

## Database

The Prisma schema maps to the existing Supabase table names. If the database already exists, use:

```bash
npm run prisma:generate
```

For a new local database, create a migration:

```bash
npm run prisma:migrate
```
