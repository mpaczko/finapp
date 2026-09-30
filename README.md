# Finapp

Finapp to aplikacja do zarządzania osobistym budżetem. Pozwala rejestrować wydatki, przypisywać je do kategorii, planować budżet miesięczny i przeglądać podsumowania.

## Funkcje

- dodawanie, edycja i usuwanie wydatków;
- import wielu wydatków z plików CSV, z możliwością poprawienia danych przed zapisem;
- zbiorcze dodanie wszystkich poprawnych pozycji z importu;
- kategorie wydatków i filtrowanie listy;
- budżety miesięczne oraz roczne podsumowania;
- lokalne uwierzytelnianie przez backend NestJS i sesję JWT w cookie `HttpOnly`.

## Technologie

- Frontend: React, TypeScript, Vite, Tailwind CSS, React Query i React Hook Form.
- Backend: NestJS, Prisma i PostgreSQL/Supabase.

## Wymagania

- Node.js 20 lub nowszy;
- dostęp do bazy PostgreSQL (np. Supabase);

## Uruchomienie lokalne

### 1. Frontend

```bash
npm install
cp .env.example .env
npm run dev
```

Aplikacja będzie dostępna pod adresem `http://localhost:5173`.

Uzupełnij plik `.env`:

```env
VITE_API_BASE_URL=http://localhost:4000/api
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
npm run prisma:generate
npm run start:dev
```

API uruchamia się domyślnie pod adresem `http://localhost:4000/api`.

W `backend/.env` ustaw co najmniej `DATABASE_URL` oraz bezpieczny, losowy `JWT_SECRET`. Szczegóły konfiguracji oraz lista endpointów są w [backend/README.md](backend/README.md).

## Komendy

Z katalogu głównego:

```bash
npm run dev            # uruchomienie frontendu
npm run build          # build produkcyjny
npm run typecheck      # sprawdzenie typów
npm run lint           # lint
npm run test           # testy
npm run test:coverage  # testy z raportem pokrycia
```

Z katalogu `backend`:

```bash
npm run start:dev      # API w trybie obserwacji
npm run build          # build API
npm run prisma:generate
npm run prisma:migrate
```

## Import CSV

Importer obsługuje popularne eksporty bankowe z separatorami `;`, `,` lub tabulatorami. Rozpoznaje nagłówki daty, opisu i kwoty, waliduje wiersze oraz automatycznie proponuje kategorię na podstawie opisu transakcji.

Po imporcie można poprawić dane pojedynczych pozycji albo użyć przycisku **„Dodaj wszystkie”**, aby zapisać całą poprawną listę naraz.
