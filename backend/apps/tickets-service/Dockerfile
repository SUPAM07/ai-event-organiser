FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package*.json ./
COPY apps/tickets-service/package.json ./apps/tickets-service/
COPY libs/common/package.json ./libs/common/
COPY libs/database/package.json ./libs/database/
COPY libs/kafka/package.json ./libs/kafka/
RUN npm install --workspace=apps/tickets-service

FROM base AS runner
COPY --from=deps /app/node_modules ./node_modules
COPY apps/tickets-service ./apps/tickets-service
COPY libs/common ./libs/common
COPY libs/database ./libs/database
COPY libs/kafka ./libs/kafka
COPY tsconfig.json ./

WORKDIR /app/apps/tickets-service
EXPOSE 4003
CMD ["npx", "tsx", "src/index.ts"]
