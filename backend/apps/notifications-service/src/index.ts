import 'dotenv/config';
import { startNotificationsConsumer } from './consumers/notifications.consumer';

console.log('🔔 Starting Notifications Service...');

startNotificationsConsumer()
  .then(() => {
    console.log('✅ Notifications Service started successfully');
  })
  .catch((err) => {
    console.error('❌ Failed to start Notifications Service:', err);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});
