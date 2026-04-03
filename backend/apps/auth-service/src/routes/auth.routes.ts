import { Router } from 'express';
import { z } from 'zod';
import { validate } from '@ai-event/common';
import { register, login, getProfile, updateProfile, validateToken } from '../controllers/auth.controller';
import { jwtMiddleware } from '../middleware/jwt.middleware';

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).max(255),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const updateProfileSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  imageUrl: z.string().url().optional(),
  hasCompletedOnboarding: z.boolean().optional(),
  location: z
    .object({
      city: z.string(),
      state: z.string().optional(),
      country: z.string(),
    })
    .optional(),
  interests: z.array(z.string()).min(3).optional(),
});

router.post('/api/auth/register', validate(registerSchema), register);
router.post('/api/auth/login', validate(loginSchema), login);
router.get('/api/auth/profile', jwtMiddleware, getProfile);
router.patch('/api/auth/profile', jwtMiddleware, validate(updateProfileSchema), updateProfile);
router.get('/api/auth/validate', validateToken);

export default router;
