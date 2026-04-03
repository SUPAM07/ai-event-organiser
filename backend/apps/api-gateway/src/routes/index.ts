import { Router } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { config } from '../config';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'api-gateway' });
});

// Auth service proxy: /api/auth -> auth-service
router.use(
  '/api/auth',
  createProxyMiddleware({
    target: config.services.auth,
    changeOrigin: true,
    on: {
      error: (err, req, res: any) => {
        console.error('Auth proxy error:', err.message);
        res.status(502).json({ success: false, error: 'Auth service unavailable' });
      },
    },
  })
);

// Events service proxy: /api/events -> events-service
router.use(
  '/api/events',
  createProxyMiddleware({
    target: config.services.events,
    changeOrigin: true,
    on: {
      error: (err, req, res: any) => {
        console.error('Events proxy error:', err.message);
        res.status(502).json({ success: false, error: 'Events service unavailable' });
      },
    },
  })
);

// Tickets service proxy: /api/tickets -> tickets-service
router.use(
  '/api/tickets',
  createProxyMiddleware({
    target: config.services.tickets,
    changeOrigin: true,
    on: {
      error: (err, req, res: any) => {
        console.error('Tickets proxy error:', err.message);
        res.status(502).json({ success: false, error: 'Tickets service unavailable' });
      },
    },
  })
);

export default router;
