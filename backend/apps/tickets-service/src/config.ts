export const config = {
  port: parseInt(process.env.TICKETS_SERVICE_PORT || '4003', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwt: {
    secret: process.env.JWT_SECRET || 'change-me-in-production',
  },
};
