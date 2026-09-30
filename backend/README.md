# Finapp Backend

Nest.js API for the budgeting app. It uses a local JWT session stored in an `HttpOnly` cookie and PostgreSQL tables for users, expenses, categories, budgets, and yearly finance summaries. PostgreSQL may still be hosted by Supabase; Supabase Auth is not used.

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

- `DATABASE_URL` - PostgreSQL connection string.
- `JWT_SECRET` - long, random secret used only by the backend to sign session JWTs.
- `JWT_EXPIRES_IN` - session lifetime, for example `8h`.
- `COOKIE_SECURE` - set to `true` in production under HTTPS.
- `CORS_ORIGIN` - allowed frontend origin, defaults to `http://localhost:5173`.

## Endpoints

`POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `/api`, and `/api/health` are public. Other endpoints require the `finapp_session` cookie issued by the login or registration endpoint.

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

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
