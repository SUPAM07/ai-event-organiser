import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { getDb, users, NewUser } from '@ai-event/database';
import { KafkaProducer, createKafkaClient, KafkaTopics } from '@ai-event/kafka';
import { ConflictError, UnauthorizedError, NotFoundError } from '@ai-event/common';
import { config } from '../config';

const kafka = createKafkaClient('auth-service');
const producer = new KafkaProducer(kafka);

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface UpdateProfileDto {
  name?: string;
  imageUrl?: string;
  hasCompletedOnboarding?: boolean;
  location?: { city: string; state?: string; country: string };
  interests?: string[];
}

export class AuthService {
  private db = getDb();

  async register(dto: RegisterDto) {
    const existing = await this.db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, dto.email))
      .limit(1);

    if (existing.length > 0) {
      throw new ConflictError('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const [user] = await this.db
      .insert(users)
      .values({
        email: dto.email,
        passwordHash,
        name: dto.name,
        hasCompletedOnboarding: false,
        freeEventsCreated: 0,
      } as NewUser)
      .returning();

    // Publish event
    try {
      await producer.sendMessage(KafkaTopics.USER_REGISTERED, {
        userId: user.id,
        email: user.email,
        name: user.name,
      });
    } catch (err) {
      console.warn('Failed to publish user.registered event:', err);
    }

    const token = this.generateToken(user.id, user.email, user.name);
    const { passwordHash: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }

  async login(dto: LoginDto) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, dto.email))
      .limit(1);

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const token = this.generateToken(user.id, user.email, user.name);
    const { passwordHash: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }

  async getProfile(userId: string) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const [user] = await this.db
      .update(users)
      .set({
        ...dto,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async validateToken(token: string) {
    try {
      const payload = jwt.verify(token, config.jwt.secret) as { sub: string; email: string };
      const [user] = await this.db
        .select({ id: users.id, email: users.email, name: users.name })
        .from(users)
        .where(eq(users.id, payload.sub))
        .limit(1);

      if (!user) {
        throw new UnauthorizedError('User not found');
      }

      return user;
    } catch {
      throw new UnauthorizedError('Invalid token');
    }
  }

  private generateToken(userId: string, email: string, name: string): string {
    return jwt.sign(
      { sub: userId, email, name },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
  }
}
