import { Request, Response, NextFunction } from 'express';
import { EventsService } from '../services/events.service';

const eventsService = new EventsService();

export const createEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const organizerId = req.user!.sub;
    const organizerName = (req.user as any).name || 'Unknown';
    const event = await eventsService.create(organizerId, organizerName, req.body);
    res.status(201).json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
};

export const listEvents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await eventsService.list({
      page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
      category: req.query.category as string,
      city: req.query.city as string,
      search: req.query.search as string,
      organizerId: req.query.organizerId as string,
    });
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

export const getEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const event = await eventsService.getById(req.params.id);
    res.json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
};

export const getEventBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const event = await eventsService.getBySlug(req.params.slug);
    res.json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
};

export const updateEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const event = await eventsService.update(req.params.id, req.user!.sub, req.body);
    res.json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
};

export const deleteEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await eventsService.delete(req.params.id, req.user!.sub);
    res.json({ success: true, message: 'Event deleted' });
  } catch (err) {
    next(err);
  }
};
