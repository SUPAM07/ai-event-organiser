export const KafkaTopics = {
  USER_REGISTERED: 'user.registered',
  USER_UPDATED: 'user.updated',
  EVENT_CREATED: 'event.created',
  EVENT_UPDATED: 'event.updated',
  EVENT_DELETED: 'event.deleted',
  TICKET_PURCHASED: 'ticket.purchased',
  TICKET_CANCELLED: 'ticket.cancelled',
  TICKET_CHECKED_IN: 'ticket.checked_in',
} as const;

export type KafkaTopic = typeof KafkaTopics[keyof typeof KafkaTopics];

export interface UserRegisteredEvent {
  userId: string;
  email: string;
  name: string;
}

export interface EventCreatedEvent {
  eventId: string;
  title: string;
  organizerId: string;
  organizerName: string;
  startDate: string;
  city: string;
  country: string;
}

export interface TicketPurchasedEvent {
  ticketId: string;
  eventId: string;
  userId: string;
  attendeeName: string;
  attendeeEmail: string;
  eventTitle: string;
  qrCode: string;
  startDate: string;
}

export interface TicketCancelledEvent {
  ticketId: string;
  eventId: string;
  userId: string;
  attendeeEmail: string;
  eventTitle: string;
}

export type KafkaEventPayload =
  | { topic: 'user.registered'; data: UserRegisteredEvent }
  | { topic: 'event.created'; data: EventCreatedEvent }
  | { topic: 'ticket.purchased'; data: TicketPurchasedEvent }
  | { topic: 'ticket.cancelled'; data: TicketCancelledEvent };
