import { pgTable, uuid, varchar, boolean, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './users';
import { events } from './events';

export const registrationStatusEnum = pgEnum('registration_status', ['confirmed', 'cancelled']);

export const tickets = pgTable('tickets', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  attendeeName: varchar('attendee_name', { length: 255 }).notNull(),
  attendeeEmail: varchar('attendee_email', { length: 255 }).notNull(),
  qrCode: varchar('qr_code', { length: 255 }).notNull().unique(),
  checkedIn: boolean('checked_in').default(false).notNull(),
  checkedInAt: timestamp('checked_in_at'),
  status: registrationStatusEnum('status').notNull().default('confirmed'),
  registeredAt: timestamp('registered_at').defaultNow().notNull(),
});

export type Ticket = typeof tickets.$inferSelect;
export type NewTicket = typeof tickets.$inferInsert;
