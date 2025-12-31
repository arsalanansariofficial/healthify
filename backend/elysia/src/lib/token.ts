import jwt from 'jsonwebtoken';

import { InvalidJwtError } from '@/errors/errors';
import { env } from '@/config/env';

export function verifyToken(payload: string) {
  try {
    return jwt.verify(payload, env.JWT_SECRET) as { id: string };
  } catch (error: unknown) {
    throw new InvalidJwtError(
      error instanceof Error ? error.message : undefined
    );
  }
}

export function generateToken(payload: string, expiresIn = env.JWT_EXPIRES_IN) {
  return jwt.sign({ id: payload }, env.JWT_SECRET, { expiresIn });
}
