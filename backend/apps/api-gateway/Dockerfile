FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package*.json ./
COPY apps/api-gateway/package.json ./apps/api-gateway/
COPY libs/common/package.json ./libs/common/
RUN npm install --workspace=apps/api-gateway

FROM base AS runner
COPY --from=deps /app/node_modules ./node_modules
COPY apps/api-gateway ./apps/api-gateway
COPY libs/common ./libs/common
COPY tsconfig.json ./

WORKDIR /app/apps/api-gateway
EXPOSE 4000
CMD ["npx", "tsx", "src/index.ts"]
