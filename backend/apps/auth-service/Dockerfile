FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package*.json ./
COPY apps/auth-service/package.json ./apps/auth-service/
COPY libs/common/package.json ./libs/common/
COPY libs/database/package.json ./libs/database/
COPY libs/kafka/package.json ./libs/kafka/
RUN npm install --workspace=apps/auth-service

FROM base AS runner
COPY --from=deps /app/node_modules ./node_modules
COPY apps/auth-service ./apps/auth-service
COPY libs/common ./libs/common
COPY libs/database ./libs/database
COPY libs/kafka ./libs/kafka
COPY tsconfig.json ./

WORKDIR /app/apps/auth-service
EXPOSE 4001
CMD ["npx", "tsx", "src/index.ts"]
