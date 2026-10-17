# egometer-api

Backend of [egometer](https://github.com/edgarmueller/egometer-frontend), a customizable habit tracker.
Built with [NestJS](https://nestjs.com) and MongoDB.

## Getting started

Requirements: Node.js (12 or 14 recommended) and a MongoDB instance.

```bash
npm install
cp .env.example .env   # then fill in JWT_SECRET
npm run start:dev
```

The API is served at `http://localhost:3000/api/v1`, Swagger docs at `http://localhost:3000/api/v1/docs`.

### Configuration

All configuration is done via environment variables (or a `.env` file), see [`.env.example`](.env.example).

| Variable         | Required | Description                                                  |
| ---------------- | -------- | ------------------------------------------------------------ |
| `MONGODB_URI`    | yes      | MongoDB connection string                                    |
| `JWT_SECRET`     | yes      | Secret used to sign login tokens, at least 32 characters     |
| `JWT_EXPIRES_IN` | no       | How long a login stays valid, defaults to `7d`               |
| `ALLOW_SIGNUP`   | no       | Set to `false` to disable creating new accounts              |
| `PORT`           | no       | Port to listen on, defaults to `3000`                        |

## Authentication

Users sign up and log in with email and password. Passwords are hashed with bcrypt;
on success the API returns a JWT that has to be sent as `Authorization: Bearer <token>`.

| Endpoint                    | Description                                      |
| --------------------------- | ------------------------------------------------ |
| `POST /api/v1/auth/signup`  | `{ email, password }` → `{ token, user }`        |
| `POST /api/v1/auth/login`   | `{ email, password }` → `{ token, user }`        |
| `GET /api/v1/auth/me`       | Returns the logged in user                       |

If the API is reachable by others, set `ALLOW_SIGNUP=false` once you've created your account.

### Migrating from Auth0

Meters created while egometer used Auth0 are owned by the Auth0 user id and won't show up
for a new account. After signing up, assign them to your new user:

```bash
mongosh "$MONGODB_URI" --eval '
  const me = db.users.findOne({ email: "you@example.com" });
  db.meters.updateMany({}, { $set: { userId: me._id.toString() } });
'
```

This assigns *all* meters to that user, which is what you want for a single-user setup.

## Tests

```bash
npm test          # unit tests
npm run test:cov  # with coverage
```
