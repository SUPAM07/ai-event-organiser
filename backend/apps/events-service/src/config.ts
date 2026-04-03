export const config = {
  port: parseInt(process.env.EVENTS_SERVICE_PORT || '4002', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwt: {
    secret: process.env.JWT_SECRET || 'change-me-in-production',
  },
};
