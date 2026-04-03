import { pgTable, uuid, varchar, text, integer, numeric, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './users';

export const locationTypeEnum = pgEnum('location_type', ['physical', 'online']);
export const ticketTypeEnum = pgEnum('ticket_type', ['free', 'paid']);

export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 500 }).notNull(),
  description: text('description').notNull(),
  slug: varchar('slug', { length: 600 }).notNull().unique(),
  organizerId: uuid('organizer_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  organizerName: varchar('organizer_name', { length: 255 }).notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  tags: text('tags').array().notNull().default([]),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  timezone: varchar('timezone', { length: 100 }).notNull().default('UTC'),
  locationType: locationTypeEnum('location_type').notNull(),
  venue: varchar('venue', { length: 500 }),
  address: varchar('address', { length: 1000 }),
  city: varchar('city', { length: 255 }).notNull(),
  state: varchar('state', { length: 255 }),
  country: varchar('country', { length: 255 }).notNull(),
  capacity: integer('capacity').notNull(),
  ticketType: ticketTypeEnum('ticket_type').notNull(),
  ticketPrice: numeric('ticket_price', { precision: 10, scale: 2 }),
  registrationCount: integer('registration_count').default(0).notNull(),
  coverImage: varchar('cover_image', { length: 500 }),
  themeColor: varchar('theme_color', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
