import { EachMessagePayload } from 'kafkajs';
import { createKafkaClient, KafkaConsumer, KafkaTopics } from '@ai-event/kafka';
import { EmailService } from '../services/email.service';

const emailService = new EmailService();

export async function startNotificationsConsumer(): Promise<void> {
  const kafka = createKafkaClient('notifications-service');
  const consumer = new KafkaConsumer(kafka, 'notifications-service');

  const topics = [
    KafkaTopics.USER_REGISTERED,
    KafkaTopics.TICKET_PURCHASED,
    KafkaTopics.TICKET_CANCELLED,
  ];

  await consumer.subscribe(topics);

  await consumer.run(async (payload: EachMessagePayload) => {
    const { topic, message } = payload;
    const value = message.value?.toString();
    if (!value) return;

    let data: any;
    try {
      data = JSON.parse(value);
    } catch {
      console.error(`Failed to parse message from topic ${topic}`);
      return;
    }

    try {
      switch (topic) {
        case KafkaTopics.USER_REGISTERED:
          await emailService.sendWelcome(data.email, data.name);
          break;

        case KafkaTopics.TICKET_PURCHASED:
          await emailService.sendTicketConfirmation(
            data.attendeeEmail,
            data.attendeeName,
            data.eventTitle,
            data.startDate,
            data.qrCode
          );
          break;

        case KafkaTopics.TICKET_CANCELLED:
          await emailService.sendTicketCancellation(data.attendeeEmail, data.eventTitle);
          break;

        default:
          console.warn(`Unhandled topic: ${topic}`);
      }
    } catch (err) {
      console.error(`Failed to process message from topic ${topic}:`, err);
    }
  });

  console.log(`📬 Notifications consumer listening on topics: ${topics.join(', ')}`);
}
