import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

export function generateAccessToken(payload) {
  return jwt.sign(payload, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES_IN });
}

export function generateRefreshToken(payload) {
  return jwt.sign(payload, config.JWT_REFRESH_SECRET, { expiresIn: config.JWT_REFRESH_EXPIRES_IN });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, config.JWT_SECRET);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, config.JWT_REFRESH_SECRET);
}
