import { eq, and, sql, desc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { getDb, tickets, events, NewTicket } from '@ai-event/database';
import { KafkaProducer, createKafkaClient, KafkaTopics } from '@ai-event/kafka';
import { NotFoundError, ForbiddenError, ConflictError, BadRequestError } from '@ai-event/common';

const kafka = createKafkaClient('tickets-service');
const producer = new KafkaProducer(kafka);

export interface PurchaseTicketDto {
  eventId: string;
  attendeeName: string;
  attendeeEmail: string;
}

export class TicketsService {
  private db = getDb();

  async purchase(userId: string, dto: PurchaseTicketDto) {
    const [event] = await this.db
      .select()
      .from(events)
      .where(eq(events.id, dto.eventId))
      .limit(1);

    if (!event) throw new NotFoundError('Event not found');

    if (event.registrationCount >= event.capacity) {
      throw new BadRequestError('Event is at full capacity');
    }

    // Check if user already has a ticket
    const [existing] = await this.db
      .select({ id: tickets.id })
      .from(tickets)
      .where(
        and(
          eq(tickets.eventId, dto.eventId),
          eq(tickets.userId, userId),
          eq(tickets.status, 'confirmed')
        )
      )
      .limit(1);

    if (existing) {
      throw new ConflictError('You already have a ticket for this event');
    }

    const qrCode = `TKT-${uuidv4().toUpperCase()}`;

    const [ticket] = await this.db
      .insert(tickets)
      .values({
        eventId: dto.eventId,
        userId,
        attendeeName: dto.attendeeName,
        attendeeEmail: dto.attendeeEmail,
        qrCode,
        checkedIn: false,
        status: 'confirmed',
      } as NewTicket)
      .returning();

    // Increment event registration count
    await this.db
      .update(events)
      .set({
        registrationCount: sql`${events.registrationCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(events.id, dto.eventId));

    // Publish event
    try {
      await producer.sendMessage(KafkaTopics.TICKET_PURCHASED, {
        ticketId: ticket.id,
        eventId: event.id,
        userId,
        attendeeName: ticket.attendeeName,
        attendeeEmail: ticket.attendeeEmail,
        eventTitle: event.title,
        qrCode: ticket.qrCode,
        startDate: event.startDate.toISOString(),
      });
    } catch (err) {
      console.warn('Failed to publish ticket.purchased event:', err);
    }

    return ticket;
  }

  async cancel(ticketId: string, userId: string) {
    const [ticket] = await this.db
      .select()
      .from(tickets)
      .where(eq(tickets.id, ticketId))
      .limit(1);

    if (!ticket) throw new NotFoundError('Ticket not found');
    if (ticket.userId !== userId) throw new ForbiddenError('Not authorized');
    if (ticket.status === 'cancelled') throw new BadRequestError('Ticket already cancelled');

    const [updated] = await this.db
      .update(tickets)
      .set({ status: 'cancelled' })
      .where(eq(tickets.id, ticketId))
      .returning();

    // Decrement registration count
    await this.db
      .update(events)
      .set({
        registrationCount: sql`GREATEST(${events.registrationCount} - 1, 0)`,
        updatedAt: new Date(),
      })
      .where(eq(events.id, ticket.eventId));

    const [event] = await this.db
      .select({ title: events.title })
      .from(events)
      .where(eq(events.id, ticket.eventId))
      .limit(1);

    try {
      await producer.sendMessage(KafkaTopics.TICKET_CANCELLED, {
        ticketId: ticket.id,
        eventId: ticket.eventId,
        userId,
        attendeeEmail: ticket.attendeeEmail,
        eventTitle: event?.title || 'Unknown event',
      });
    } catch (err) {
      console.warn('Failed to publish ticket.cancelled event:', err);
    }

    return updated;
  }

  async checkIn(ticketId: string, organizerId: string) {
    const [ticket] = await this.db
      .select()
      .from(tickets)
      .where(eq(tickets.id, ticketId))
      .limit(1);

    if (!ticket) throw new NotFoundError('Ticket not found');

    const [event] = await this.db
      .select({ organizerId: events.organizerId })
      .from(events)
      .where(eq(events.id, ticket.eventId))
      .limit(1);

    if (!event || event.organizerId !== organizerId) {
      throw new ForbiddenError('Not authorized to check in attendees for this event');
    }

    if (ticket.checkedIn) throw new BadRequestError('Attendee already checked in');
    if (ticket.status === 'cancelled') throw new BadRequestError('Ticket is cancelled');

    const [updated] = await this.db
      .update(tickets)
      .set({ checkedIn: true, checkedInAt: new Date() })
      .where(eq(tickets.id, ticketId))
      .returning();

    return updated;
  }

  async getUserTickets(userId: string) {
    return this.db
      .select()
      .from(tickets)
      .where(eq(tickets.userId, userId))
      .orderBy(desc(tickets.registeredAt));
  }

  async getEventTickets(eventId: string, organizerId: string) {
    const [event] = await this.db
      .select({ organizerId: events.organizerId })
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);

    if (!event) throw new NotFoundError('Event not found');
    if (event.organizerId !== organizerId) throw new ForbiddenError('Not authorized');

    return this.db
      .select()
      .from(tickets)
      .where(eq(tickets.eventId, eventId))
      .orderBy(desc(tickets.registeredAt));
  }

  async getByQrCode(qrCode: string) {
    const [ticket] = await this.db
      .select()
      .from(tickets)
      .where(eq(tickets.qrCode, qrCode))
      .limit(1);

    if (!ticket) throw new NotFoundError('Ticket not found');
    return ticket;
  }
}
