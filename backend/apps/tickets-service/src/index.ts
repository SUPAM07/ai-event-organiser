import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { errorHandler, notFound } from '@ai-event/common';
import ticketsRoutes from './routes/tickets.routes';
import { config } from './config';

const app = express();

app.use(helmet());
app.use(cors({ credentials: true }));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  '/api/tickets',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'tickets-service' });
});

app.use(ticketsRoutes);
app.use(notFound);
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`🎟️  Tickets Service running on port ${config.port}`);
});

export default app;
