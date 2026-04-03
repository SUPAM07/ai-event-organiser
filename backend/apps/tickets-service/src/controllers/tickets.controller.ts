import { Request, Response, NextFunction } from 'express';
import { TicketsService } from '../services/tickets.service';

const ticketsService = new TicketsService();

export const purchaseTicket = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const ticket = await ticketsService.purchase(req.user!.sub, req.body);
    res.status(201).json({ success: true, data: ticket });
  } catch (err) {
    next(err);
  }
};

export const cancelTicket = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const ticket = await ticketsService.cancel(req.params.id, req.user!.sub);
    res.json({ success: true, data: ticket });
  } catch (err) {
    next(err);
  }
};

export const checkInTicket = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const ticket = await ticketsService.checkIn(req.params.id, req.user!.sub);
    res.json({ success: true, data: ticket });
  } catch (err) {
    next(err);
  }
};

export const getUserTickets = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tickets = await ticketsService.getUserTickets(req.user!.sub);
    res.json({ success: true, data: tickets });
  } catch (err) {
    next(err);
  }
};

export const getEventTickets = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tickets = await ticketsService.getEventTickets(req.params.eventId, req.user!.sub);
    res.json({ success: true, data: tickets });
  } catch (err) {
    next(err);
  }
};

export const getTicketByQrCode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const ticket = await ticketsService.getByQrCode(req.params.qrCode);
    res.json({ success: true, data: ticket });
  } catch (err) {
    next(err);
  }
};
