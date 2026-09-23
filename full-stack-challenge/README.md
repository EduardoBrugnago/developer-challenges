# Dynamox Full-Stack Challenge

## Live app

| | |
|---|---|
| **App** | https://developer-challenges.vercel.app |
| **API** | https://developer-challenges-y7xt.onrender.com/api/health |
| **Email** | `admin@dynamox.com` |
| **Password** | `dynamox123` |

The frontend is on Vercel and API runs as Docker service on Render, against a Neon PostgreSQL database.

**The API sleeps after 15 minutes of inactivity**, so the first request wakes the container and can take up to a minute; the login may time out once. That delay is cold start.

Nx monorepo with three projects:

| Project | Stack |
|---|---|
| `apps/api` | NestJS 11, Prisma 6, PostgreSQL 16, JWT |
| `apps/web` | Vite 8, React 19, TypeScript, Redux Toolkit, Material UI 5, Recharts |
| `libs/shared` | Types and domain rules shared by both sides |

## Requirements

- Node.js 24
- Docker (PostgreSQL and full stack)

## Quick start

```bash
npm install
cp .env.example .env          # values below already work for local development
npm run db:up                 # PostgreSQL 16 in Docker
npm run db:migrate            # creates the schema
npm run db:seed               # creates the fixed user
npm run dev                   # API on :3000, web on :4200
```

Open http://localhost:4200 and sign in:

- **Email:** `admin@dynamox.com`
- **Password:** `dynamox123`

Optional: `npm run db:seed:demo` fills the database with mock data.

## Full stack with load balancer

Runs Nginx serving the built frontend and balancing `/api` across **two API instances**, plus its own database:

```bash
docker compose -f docker-compose.full.yml up --build -d
docker compose -f docker-compose.full.yml exec api1 npx tsx prisma/seed.ts
# http://localhost:8080
docker compose -f docker-compose.full.yml logs -f api1 api2   # requests alternating
docker compose -f docker-compose.full.yml down -v
```

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | API and web in watch mode |
| `npm test` | Unit tests of the three projects |
| `npm run lint` | ESLint on every project |
| `npm run db:up` / `db:migrate` / `db:seed` | Database lifecycle |
| `npm run db:seed:demo` | Demo data |
| `npm run load-test` | k6 load test against `localhost:3000` |
| `npm run e2e` | Cypress (scaffolded, no specs yet) |

## API

| Method | Route | Purpose |
|---|---|---|
| `GET` | `/health` | Health check |
| `POST` | `/auth/login` | Returns the JWT and the user |
| `GET` | `/auth/me` | Current user |
| `GET` | `/machines` | Paginated list (`page`, `limit`, `sortBy=name\|type\|createdAt`, `order`) |
| `GET` | `/machines/options` | Full list, id/name/type only, for selects |
| `GET` `POST` `PATCH` `DELETE` | `/machines[/:id]` | Machine CRUD |
| `POST` | `/machines/:machineId/monitoring-points` | Creates a monitoring point |
| `GET` | `/monitoring-points` | Paginated list (`page`, `limit`, `sortBy`, `order`, `machineId`) |
| `PATCH` `DELETE` | `/monitoring-points/:id` | Renames or deletes a point |
| `PUT` `DELETE` | `/monitoring-points/:id/sensor` | Associates or removes the sensor |
| `GET` | `/sensors` | Sensors of the user, for selects |
| `POST` | `/sensors/:sensorId/time-series` | Stores a series with its points |
| `GET` | `/time-series` | Stored series |
| `GET` | `/time-series/count` | Number of series stored |
| `GET` `DELETE` | `/time-series/:id` | Full series or deletion |
| `POST` | `/time-series/:id/points` | Appends points to a series |
| `GET` | `/time-series/:id/metrics` | count, min, max, mean, median, standard deviation and period |

## Design decisions

- **Domain rules in `libs/shared`.** `isSensorModelAllowed` is used by the API to reject invalid combinations and by the UI to only offer allowed sensor models. One source of truth, no duplicated rule.
- **Stateless JWT.** Any API instance validates the token with the same secret, which is what makes running two instances behind the load balancer possible without shared sessions.
- **Pagination and sorting in the database.** The API never loads a whole list into memory. Machines have composite indexes (`userId, createdAt, id`, `userId, name, id`, `userId, type, id`) so each sorted page is an index scan with no sort step.
- **Metrics in SQL.** min, max, mean, median and standard deviation are computed in a single query, so thousands of points never travel to Node.
- **Redux Toolkit with thunks.** Page, sort column and filter live in the store, so the table keeps its state when you leave and come back. Reducers stay pure; side effects live in thunks.
- **Forms with react-hook-form and zod.** Each form has a schema in its module's `model/`, and the same rules (trim, length, allowed values) mirror the API validation.
- **One generic modal.** `useModal` holds the state and `Modal` renders it, so dialogs across pages share loading, confirmation and error behavior.
- **Global error feedback.** Any rejected thunk turns into a snackbar through a matcher in the notifications slice, so pages don't repeat error handling. The login form is the exception, because the error belongs inside the form.

## Assumptions

The challenge leaves some points open. These are the decisions taken:

1. **All data belongs to the authenticated user.** Every query filters by user, and touching another user record returns 404, so doesnt reveal that the record exists.
2. **One sensor per monitoring point.**.
3. **The Pump restriction is enforced on both sides.**.
4. **Deleting cascades.** Deleting a machine deletes its points, sensors and series.
5. **The token lives in `localStorage`.** Simpler for a challenge and it survives a reload.

## Tests

```bash
npm test      
npx nx test api --coverage
npx nx test web --coverage
```
