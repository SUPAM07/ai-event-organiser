import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { errorHandler, notFound } from '@ai-event/common';
import eventsRoutes from './routes/events.routes';
import { config } from './config';

const app = express();

app.use(helmet());
app.use(cors({ credentials: true }));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  '/api/events',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'events-service' });
});

app.use(eventsRoutes);
app.use(notFound);
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`📅 Events Service running on port ${config.port}`);
});

export default app;
