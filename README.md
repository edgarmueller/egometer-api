# egometer-api

Backend of [egometer](https://github.com/edgarmueller/egometer-frontend), a customizable habit tracker.
Built with [NestJS](https://nestjs.com) and MongoDB.

## Getting started

Requirements: Node.js 22.12 or later and either Docker (for the bundled MongoDB) or a MongoDB 8 instance of your own.

```bash
npm install
npm run infra:up       # start MongoDB in Docker; skip if you use your own MongoDB
npm run start:dev
```

The API is served at `http://localhost:3000/api/v1`, Swagger docs at `http://localhost:3000/api/v1/docs`.
It restarts whenever a file in `src/` changes; use `npm run start:debug` to attach a debugger.

### Local MongoDB

[`docker-compose.yml`](docker-compose.yml) runs MongoDB 8 on `localhost:27017`, which is what the
`MONGODB_URI` in `.env.development` points at.

| Script               | Description                                                      |
| -------------------- | ---------------------------------------------------------------- |
| `npm run infra:up`   | Start MongoDB in the background and wait until it's ready        |
| `npm run infra:logs` | Follow the MongoDB logs                                          |
| `npm run infra:down` | Stop MongoDB (data is kept; `docker compose down -v` deletes it) |

### Production image

`docker build -t egometer-api .` builds an image that runs the compiled API as an unprivileged user.
It needs the same environment variables as below, e.g.
`docker run -p 3000:3000 -e MONGODB_URI=... -e JWT_SECRET=... egometer-api`.

### Configuration

All configuration is done via environment variables. Outside of production (`NODE_ENV=production`),
[`.env.development`](.env.development) provides working local defaults, including a development-only
`JWT_SECRET`. To change a value, put it in a `.env` file (see [`.env.example`](.env.example)) or the
environment; both take precedence over `.env.development`. In production, `MONGODB_URI` and `JWT_SECRET` must be set.

| Variable         | Required | Description                                              |
| ---------------- | -------- | -------------------------------------------------------- |
| `MONGODB_URI`    | yes      | MongoDB connection string                                |
| `JWT_SECRET`     | yes      | Secret used to sign login tokens, at least 32 characters |
| `JWT_EXPIRES_IN` | no       | How long a login stays valid, defaults to `7d`           |
| `ALLOW_SIGNUP`   | no       | Set to `false` to disable creating new accounts          |
| `PORT`           | no       | Port to listen on, defaults to `3000`                    |

## Authentication

Users sign up and log in with email and password (hashed with bcrypt). Both return a JWT that has to be
sent as `Authorization: Bearer <token>`; in the Swagger UI, use **Authorize**. Sign-up and login are
limited to 10 requests per minute per client.

If the API is reachable by others, set `ALLOW_SIGNUP=false` once you've created your account.

## Meters and entries

A meter tracks one thing per day. Its type decides which values its entries accept
(`GET /api/v1/meter-types` lists them):

| Type         | Entry value                                                                      |
| ------------ | -------------------------------------------------------------------------------- |
| `mood`       | one of `bad`, `down`, `okayish`, `good`, `dabomb`                                |
| `quantity`   | one of `none`, `a_bit`, `a_lot`                                                  |
| `boolean`    | `true` or `false`                                                                |
| `number`     | any number; number meters can also have a `dailyGoal` and `weeklyGoal`           |
| `text`       | a string of up to 10,000 characters                                              |
| `activities` | a list of distinct tags from the meter's `options` (defaults to a built-in list) |

All endpoints below require a login and only ever see the logged in user's meters and entries.

| Endpoint                                    | Description                                               |
| ------------------------------------------- | --------------------------------------------------------- |
| `GET /api/v1/meters`                        | The user's meters                                         |
| `POST /api/v1/meters`                       | Create a meter, e.g. `{ "name": "Mood", "type": "mood" }` |
| `GET /api/v1/meters/:id`                    | A single meter                                            |
| `PATCH /api/v1/meters/:id`                  | Change name, color, icon, options or goals (not the type) |
| `DELETE /api/v1/meters/:id`                 | Delete a meter and its entries                            |
| `GET /api/v1/entries?from=…&to=…&meterId=…` | Entries between two dates (YYYY-MM-DD, at most 366 days)  |
| `PUT /api/v1/meters/:id/entries/:date`      | Set the value for a day, e.g. `{ "value": "good" }`       |
| `DELETE /api/v1/meters/:id/entries/:date`   | Remove the value for a day                                |

### Upgrading from 0.1

Version 0.2 replaced the JSON-schema-based meters with the fixed types above. Data from earlier
versions isn't migrated: start with an empty database. Locally, the MongoDB 8 container already uses
a new volume; the old one can be removed with `docker volume rm egometer-api_mongo-data`.

## Tests

```bash
npm test           # unit tests
npm run test:e2e   # API tests against MongoDB (needs `npm run infra:up`), in the egometer-e2e database
npm run lint
npm run typecheck
```

CI runs all of them on every pull request.
