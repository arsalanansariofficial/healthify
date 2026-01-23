import {
  PrismaClientInitializationError,
  PrismaClientUnknownRequestError,
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
  PrismaClientRustPanicError
} from '@prisma/client/runtime/client';
import { Elysia } from 'elysia';

import { InvalidCredentialsError, InvalidJwtError } from '@/errors/errors';

export const errorPlugin = new Elysia({ name: 'errorPlugin' })
  .error({ InvalidCredentialsError, InvalidJwtError })
  .onError({ as: 'global' }, ({ error, code, path }) => {
    if (error instanceof PrismaClientInitializationError)
      return {
        message: 'Failed to initialize prisma client.',
        errors: [{ message: error.message, path }]
      };

    if (error instanceof PrismaClientKnownRequestError)
      return {
        errors: [{ message: error.message, path }],
        message: 'Unique constraint violation.'
      };

    if (error instanceof PrismaClientUnknownRequestError)
      return {
        message: 'Failed to execute database query.',
        errors: [{ message: error.message, path }]
      };

    if (error instanceof PrismaClientRustPanicError)
      return {
        errors: [{ message: error.message, path }],
        message: 'Prisma engine crashed.'
      };

    if (error instanceof PrismaClientValidationError)
      return {
        message: 'Invalid prisma client invocation.',
        errors: [{ message: error.message, path }]
      };

    switch (code) {
      case 'INVALID_COOKIE_SIGNATURE':
        return {
          errors: [
            {
              message:
                'The cookie signature is invalid or has been tampered with.',
              path: ['cookie']
            }
          ],
          message: 'Invalid cookie.'
        };

      case 'InvalidCredentialsError':
        return {
          errors: [{ message: error.message, path: error.path }],
          message: 'Invalid credentials.'
        };

      case 'INTERNAL_SERVER_ERROR':
        return {
          errors: [
            {
              message:
                'An unexpected error occurred while processing the request.',
              path: []
            }
          ],
          message: 'Internal server error.'
        };

      case 'INVALID_FILE_TYPE':
        return {
          errors: [
            {
              message:
                error.message || 'The uploaded file type is not allowed.',
              path: ['file']
            }
          ],
          message: 'Invalid file type.'
        };

      case 'InvalidJwtError':
        return {
          errors: [{ message: error.message, path: error.path }],
          message: 'Invalid JWT.'
        };

      case 'VALIDATION':
        return {
          errors:
            error.all?.map(issue => ({
              message: issue.message,
              path: issue.path
            })) ?? [],
          message: 'Validation failed.'
        };

      case 'NOT_FOUND':
        return {
          errors: [
            {
              message: `Requested path "${path}" does not exist.`,
              path: [path]
            }
          ],
          message: 'Path not found.'
        };

      case 'UNKNOWN':
        return {
          errors: [{ message: 'An unknown error occurred.', path }],
          message: 'Unknown error.'
        };

      case 'PARSE':
        return {
          errors: [{ message: error.message, path: ['body'] }],
          message: 'Invalid request body.'
        };

      default:
        return {
          errors: [{ message: 'An unknown error occurred.', path }],
          message: 'Unknown error.'
        };
    }
  });
