import { eq, desc, and, ilike, sql } from 'drizzle-orm';
import { getDb, events, users, NewEvent } from '@ai-event/database';
import { KafkaProducer, createKafkaClient, KafkaTopics } from '@ai-event/kafka';
import { NotFoundError, ForbiddenError } from '@ai-event/common';

const kafka = createKafkaClient('events-service');
const producer = new KafkaProducer(kafka);

export interface CreateEventDto {
  title: string;
  description: string;
  category: string;
  tags?: string[];
  startDate: string;
  endDate: string;
  timezone?: string;
  locationType: 'physical' | 'online';
  venue?: string;
  address?: string;
  city: string;
  state?: string;
  country: string;
  capacity: number;
  ticketType: 'free' | 'paid';
  ticketPrice?: number;
  coverImage?: string;
  themeColor?: string;
}

export interface UpdateEventDto extends Partial<CreateEventDto> {}

export interface ListEventsQuery {
  page?: number;
  limit?: number;
  category?: string;
  city?: string;
  country?: string;
  search?: string;
  organizerId?: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export class EventsService {
  private db = getDb();

  async create(organizerId: string, organizerName: string, dto: CreateEventDto) {
    const baseSlug = slugify(dto.title);
    const slug = `${baseSlug}-${Date.now()}`;

    const [event] = await this.db
      .insert(events)
      .values({
        ...dto,
        slug,
        organizerId,
        organizerName,
        tags: dto.tags || [],
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        timezone: dto.timezone || 'UTC',
        registrationCount: 0,
      } as NewEvent)
      .returning();

    try {
      await producer.sendMessage(KafkaTopics.EVENT_CREATED, {
        eventId: event.id,
        title: event.title,
        organizerId: event.organizerId,
        organizerName: event.organizerName,
        startDate: event.startDate.toISOString(),
        city: event.city,
        country: event.country,
      });
    } catch (err) {
      console.warn('Failed to publish event.created event:', err);
    }

    return event;
  }

  async list(query: ListEventsQuery = {}) {
    const { page = 1, limit = 20, category, city, search, organizerId } = query;
    const offset = (page - 1) * limit;

    const conditions = [];
    if (category) conditions.push(eq(events.category, category));
    if (city) conditions.push(ilike(events.city, `%${city}%`));
    if (organizerId) conditions.push(eq(events.organizerId, organizerId));
    if (search) conditions.push(ilike(events.title, `%${search}%`));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [data, countResult] = await Promise.all([
      this.db
        .select()
        .from(events)
        .where(whereClause)
        .orderBy(desc(events.startDate))
        .limit(limit)
        .offset(offset),
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(events)
        .where(whereClause),
    ]);

    const total = Number(countResult[0]?.count ?? 0);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getById(id: string) {
    const [event] = await this.db
      .select()
      .from(events)
      .where(eq(events.id, id))
      .limit(1);

    if (!event) throw new NotFoundError('Event not found');
    return event;
  }

  async getBySlug(slug: string) {
    const [event] = await this.db
      .select()
      .from(events)
      .where(eq(events.slug, slug))
      .limit(1);

    if (!event) throw new NotFoundError('Event not found');
    return event;
  }

  async update(id: string, userId: string, dto: UpdateEventDto) {
    const existing = await this.getById(id);

    if (existing.organizerId !== userId) {
      throw new ForbiddenError('Not authorized to update this event');
    }

    const updateData: Partial<typeof events.$inferInsert> = {
      ...dto,
      updatedAt: new Date(),
    };

    if (dto.startDate) updateData.startDate = new Date(dto.startDate);
    if (dto.endDate) updateData.endDate = new Date(dto.endDate);

    const [updated] = await this.db
      .update(events)
      .set(updateData)
      .where(eq(events.id, id))
      .returning();

    try {
      await producer.sendMessage(KafkaTopics.EVENT_UPDATED, {
        eventId: updated.id,
        title: updated.title,
        organizerId: updated.organizerId,
      });
    } catch (err) {
      console.warn('Failed to publish event.updated event:', err);
    }

    return updated;
  }

  async delete(id: string, userId: string) {
    const existing = await this.getById(id);

    if (existing.organizerId !== userId) {
      throw new ForbiddenError('Not authorized to delete this event');
    }

    await this.db.delete(events).where(eq(events.id, id));

    try {
      await producer.sendMessage(KafkaTopics.EVENT_DELETED, { eventId: id });
    } catch (err) {
      console.warn('Failed to publish event.deleted event:', err);
    }
  }
}
