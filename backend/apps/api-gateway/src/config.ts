export const config = {
  port: parseInt(process.env.API_GATEWAY_PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  services: {
    auth: process.env.AUTH_SERVICE_URL || 'http://localhost:4001',
    events: process.env.EVENTS_SERVICE_URL || 'http://localhost:4002',
    tickets: process.env.TICKETS_SERVICE_URL || 'http://localhost:4003',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
  },
};
