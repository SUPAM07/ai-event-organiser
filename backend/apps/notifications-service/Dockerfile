FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package*.json ./
COPY apps/notifications-service/package.json ./apps/notifications-service/
COPY libs/kafka/package.json ./libs/kafka/
RUN npm install --workspace=apps/notifications-service

FROM base AS runner
COPY --from=deps /app/node_modules ./node_modules
COPY apps/notifications-service ./apps/notifications-service
COPY libs/kafka ./libs/kafka
COPY tsconfig.json ./

WORKDIR /app/apps/notifications-service
CMD ["npx", "tsx", "src/index.ts"]
