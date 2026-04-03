# AI Event Organiser - Backend

Node.js/Express microservices backend with Kafka, PostgreSQL, and Redis.

## Architecture

- **api-gateway** (port 4000) - Routes client requests to microservices
- **auth-service** (port 4001) - JWT authentication, user management
- **events-service** (port 4002) - Event CRUD operations
- **tickets-service** (port 4003) - Ticket inventory and transactions
- **notifications-service** (port 4004) - Kafka consumer, email notifications

## Quick Start

### 1. Start infrastructure
```bash
npm run docker:up
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment
```bash
cp .env.example .env
# Edit .env with your configuration
```

### 4. Run database migrations
```bash
npm run db:push
```

### 5. Start services (in separate terminals)
```bash
npm run dev:gateway
npm run dev:auth
npm run dev:events
npm run dev:tickets
npm run dev:notifications
```

## Infrastructure Ports

| Service     | Port  |
|------------|-------|
| API Gateway | 4000  |
| Auth Service | 4001 |
| Events Service | 4002 |
| Tickets Service | 4003 |
| Notifications | 4004 |
| PostgreSQL  | 5432  |
| Redis       | 6380  |
| Kafka       | 9093  |
| Kafka UI    | 8080  |
| Mailhog     | 8025  |
