import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { errorHandler, notFound } from '@ai-event/common';
import authRoutes from './routes/auth.routes';
import { config } from './config';

const app = express();

app.use(helmet());
app.use(cors({ credentials: true }));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting for auth endpoints
app.use(
  '/api/auth',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'auth-service' });
});

app.use(authRoutes);
app.use(notFound);
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`🔐 Auth Service running on port ${config.port}`);
});

export default app;
