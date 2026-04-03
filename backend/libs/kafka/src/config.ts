import { Kafka, logLevel } from 'kafkajs';

export function createKafkaClient(clientId: string): Kafka {
  const brokers = (process.env.KAFKA_BROKERS || 'localhost:9093').split(',');
  return new Kafka({
    clientId,
    brokers,
    logLevel: process.env.NODE_ENV === 'production' ? logLevel.ERROR : logLevel.WARN,
    retry: {
      initialRetryTime: 300,
      retries: 5,
    },
  });
}
