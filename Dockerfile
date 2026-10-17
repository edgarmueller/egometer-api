# Node 22 is the current LTS (security support until 2027-04)
FROM node:22-bookworm AS base
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

FROM node:22-bookworm-slim AS prod
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
USER node
EXPOSE 3000
CMD ["node", "dist/main"]
