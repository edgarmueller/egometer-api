# egometer-backend-v2

Backend API for Egometer, a small habit-tracker. Users register, define
"meters" (things they want to track, like water intake or mood), and log a
daily entry per meter.

This is a from-scratch rewrite of the original NestJS 7 / MongoDB / Auth0
backend, modernized to match the conventions of a sibling project
(`nest-judge`):

## Tech stack

- **Runtime**: Node.js 22, TypeScript 5.7
- **Framework**: NestJS 11
- **Database**: PostgreSQL + TypeORM (`EntitySchema` pattern, not decorators)
- **Auth**: Passport.js (JWT + Local strategies), bcrypt, a single access
  token (no refresh-token rotation/persistence — deliberately out of scope
  for a small app)
- **Build**: Nx-free, plain `nest build` (tsc)
- **Testing**: Jest 29

The app follows a flattened Clean Architecture / DDD-lite layering (ported
from `nest-judge`'s `libs/shared-ddd`), just without an Nx `libs/` split:

```
src/<feature>/
  domain/         # Entities, AggregateRoots, repository interfaces, errors
  persistence/    # TypeORM EntitySchema definitions
  app/            # Use cases (extend UseCase<Input, Output>), DTOs
  *.controller.ts
  *.module.ts
```

## Project structure

```
src/
  main.ts, app.module.ts, app.config.ts
  shared/ddd/       # Entity, AggregateRoot, UseCase, DomainEvent, createId, Props<T>
  infra/
    database/       # DatabaseModule, TypeORM options factory, migrations/
    filters/        # EntityNotFoundError -> 404 filter
  auth/             # JWT + Local passport strategies, guards, usecases, controller
  users/            # User aggregate (domain/persistence only, no HTTP surface)
  meters/           # Meter aggregate + CRUD usecases/controller
  entries/          # Entry entity + upsert/list/delete usecases/controller
scripts/
  datasource.ts     # Standalone TypeORM DataSource for the migration CLI
test/
  app.e2e-spec.ts   # e2e smoke test
```

## Domain model

- **User**: `id`, `email`, `password` (bcrypt hash), `displayName`.
- **Meter**: `id`, `name`, `type`, `userId`, `color`, `icon`, `dailyGoal?`,
  `weeklyGoal?`, `sortOrder`. `type` is one of a fixed enum:
  `BOOLEAN | NUMBER | TEXT | MOOD | QUANTITY | ACTIVITIES` (replacing the old
  JSON-Schema-driven "custom meter" flexibility).
- **Entry**: `id`, `date` (`YYYY-MM-DD`), `meterId`, `userId`, `value`
  (stored as `jsonb`). The shape of `value` is validated against the owning
  meter's `type` by a plain domain function, `validateEntryValue` — no ajv /
  JSON Schema involved.

## Endpoints

All routes are prefixed with `/api/v1`. Swagger docs are served at
`/api/v1/docs`.

- `POST /auth/register` `{ email, password, displayName }` → `{ accessToken, user }`
- `POST /auth/login` `{ email, password }` → `{ accessToken, user }`
- `GET /auth/me` (JWT) → current user
- `GET /meters`, `POST /meters`, `PATCH /meters/:id`, `DELETE /meters/:id` (JWT, scoped to the caller)
- `GET /entries?from=YYYY-MM-DD&to=YYYY-MM-DD` (JWT)
- `PUT /entries/:meterId/:date` `{ value }` — upsert (JWT)
- `DELETE /entries/:id` (JWT)

## Setup

```bash
npm install
cp .env.example .env.local   # already checked in with dev defaults; edit if needed
npm run infra:up             # starts Postgres for dev + test via docker-compose
npm run dev                  # PROFILE=local, migrations run automatically on boot
```

The Postgres containers listen on `5460` (dev, db `egometer`) and `5461`
(test, db `egometer_testing`) to avoid clashing with a local Postgres
install. Both databases use an `egometer` schema, created automatically by
the initial migration.

Stop the containers with:

```bash
npm run infra:down
```

## Scripts

```bash
npm run dev                 # start the dev server (PROFILE=local, watch mode)
npm run build                # compile with nest build (tsc)
npm test                     # run unit tests (PROFILE=test)
npm run test:e2e             # run the e2e smoke test against a running Postgres
npm run infra:up             # start docker-compose Postgres services
npm run infra:down           # stop them
npm run migration:generate --name=<name>   # generate a migration from EntitySchema diffs
npm run migration:run        # run pending migrations manually
npm run migration:revert     # revert the last migration
npm run format                # prettier --write
npm run lint                  # eslint --fix
```

## Environment

Config is loaded from `.env.${PROFILE}` (`PROFILE=local` or `PROFILE=test`)
and validated with Joi schemas in each module's config factory
(`src/app.config.ts`, `src/auth/auth.config.ts`,
`src/infra/database/database.config.ts`). Migrations run automatically on
boot (`migrationsRun: true`).

## Notes / judgment calls

- **Foreign keys**: the domain layer models `Meter.userId` / `Entry.meterId`
  / `Entry.userId` as plain string columns (not TypeORM relations), to keep
  the aggregates simple per the target domain model. Real FK constraints
  (with `ON DELETE CASCADE`) are still enforced at the database level — they
  were added by hand to the generated initial migration, since
  `migration:generate` only diffs `EntitySchema` column/relation metadata
  and won't emit FKs for plain columns.
