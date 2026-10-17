# Node 14 matches the toolchain this project was built with (NestJS 7, bcrypt 5)
FROM node:14-bullseye AS base
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# development: sources are bind-mounted by docker-compose, nest watches them
FROM base AS dev
ENV NODE_ENV=development
EXPOSE 3000
CMD ["npm", "run", "start:dev"]

# production: compiled build without dev dependencies
FROM base AS build
COPY . .
RUN npm run build && npm prune --production

FROM node:14-bullseye-slim AS prod
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/main"]
