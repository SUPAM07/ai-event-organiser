export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  smtp: {
    host: process.env.SMTP_HOST || 'localhost',
    port: parseInt(process.env.SMTP_PORT || '1025', 10),
    from: process.env.SMTP_FROM || 'noreply@ai-event-organiser.com',
  },
  kafka: {
    groupId: 'notifications-service',
  },
};
