import { Router } from 'express';
import { z } from 'zod';
import { validate } from '@ai-event/common';
import {
  purchaseTicket,
  cancelTicket,
  checkInTicket,
  getUserTickets,
  getEventTickets,
  getTicketByQrCode,
} from '../controllers/tickets.controller';
import { jwtMiddleware } from '../middleware/jwt.middleware';

const router = Router();

const purchaseSchema = z.object({
  eventId: z.string().uuid(),
  attendeeName: z.string().min(1),
  attendeeEmail: z.string().email(),
});

router.post('/api/tickets', jwtMiddleware, validate(purchaseSchema), purchaseTicket);
router.get('/api/tickets/my', jwtMiddleware, getUserTickets);
router.get('/api/tickets/qr/:qrCode', jwtMiddleware, getTicketByQrCode);
router.get('/api/tickets/event/:eventId', jwtMiddleware, getEventTickets);
router.patch('/api/tickets/:id/cancel', jwtMiddleware, cancelTicket);
router.patch('/api/tickets/:id/checkin', jwtMiddleware, checkInTicket);

export default router;
