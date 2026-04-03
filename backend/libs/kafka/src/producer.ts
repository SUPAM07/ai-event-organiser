import { Kafka, Producer, ProducerRecord } from 'kafkajs';

export class KafkaProducer {
  private producer: Producer;
  private connected = false;

  constructor(kafka: Kafka) {
    this.producer = kafka.producer();
  }

  async connect(): Promise<void> {
    if (!this.connected) {
      await this.producer.connect();
      this.connected = true;
    }
  }

  async disconnect(): Promise<void> {
    if (this.connected) {
      await this.producer.disconnect();
      this.connected = false;
    }
  }

  async send(record: ProducerRecord): Promise<void> {
    await this.connect();
    await this.producer.send(record);
  }

  async sendMessage(topic: string, payload: unknown): Promise<void> {
    await this.send({
      topic,
      messages: [
        {
          value: JSON.stringify(payload),
          timestamp: Date.now().toString(),
        },
      ],
    });
  }
}
