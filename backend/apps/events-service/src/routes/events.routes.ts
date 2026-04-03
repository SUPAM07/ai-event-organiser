import { Router } from 'express';
import { z } from 'zod';
import { validate } from '@ai-event/common';
import {
  createEvent,
  listEvents,
  getEvent,
  getEventBySlug,
  updateEvent,
  deleteEvent,
} from '../controllers/events.controller';
import { jwtMiddleware } from '../middleware/jwt.middleware';

const router = Router();

const createEventSchema = z.object({
  title: z.string().min(3).max(500),
  description: z.string().min(10),
  category: z.string().min(1),
  tags: z.array(z.string()).optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  timezone: z.string().optional(),
  locationType: z.enum(['physical', 'online']),
  venue: z.string().optional(),
  address: z.string().optional(),
  city: z.string().min(1),
  state: z.string().optional(),
  country: z.string().min(1),
  capacity: z.number().int().positive(),
  ticketType: z.enum(['free', 'paid']),
  ticketPrice: z.number().positive().optional(),
  coverImage: z.string().url().optional(),
  themeColor: z.string().optional(),
});

router.post('/api/events', jwtMiddleware, validate(createEventSchema), createEvent);
router.get('/api/events', listEvents);
router.get('/api/events/slug/:slug', getEventBySlug);
router.get('/api/events/:id', getEvent);
router.patch('/api/events/:id', jwtMiddleware, updateEvent);
router.delete('/api/events/:id', jwtMiddleware, deleteEvent);

export default router;
