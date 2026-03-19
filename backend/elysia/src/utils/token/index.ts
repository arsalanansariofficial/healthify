import jwt from 'jsonwebtoken';

import { type Model } from '@/modules/user/model';
import { InvalidJwtError } from '@/utils/error';
import { env } from '@/utils/config';

export function hasValidAuthentication(
  value: unknown
): value is Model['userWithProfileAndToken'] & { tokens: [Model['token']] } {
  return Boolean(
    value &&
    typeof value === 'object' &&
    'tokens' in value &&
    Array.isArray(value.tokens)
  );
}

export function verifyToken(payload: string) {
  try {
    return jwt.verify(payload, env.JWT_SECRET) as { id: string };
  } catch (error: unknown) {
    throw new InvalidJwtError(
      error instanceof Error ? error.message : undefined
    );
  }
}

export function hasSuccess(value: unknown): value is Model['success'] {
  return Boolean(
    value && value instanceof Object && 'success' in value && value.success
  );
}

export function generateToken(payload: string, expiresIn = env.JWT_EXPIRES_IN) {
  return jwt.sign({ id: payload }, env.JWT_SECRET, { expiresIn });
}
