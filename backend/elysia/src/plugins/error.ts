import {
  PrismaClientInitializationError,
  PrismaClientKnownRequestError
} from '@prisma/client/runtime/client';
import { Elysia } from 'elysia';

import { InvalidJwtError } from '@/errors/errors';

export const errorPlugin = new Elysia({ name: 'errorPlugin' }).onError(
  { as: 'global' },
  ({ error, code, path }) => {
    if (error instanceof PrismaClientInitializationError)
      return {
        errors: [{ message: 'Failed to initialize prisma client.', path }],
        message: error.message
      };

    if (error instanceof PrismaClientKnownRequestError)
      return {
        errors: [{ message: 'Unique constraint violation.', path }],
        message: error.message
      };

    if (error instanceof InvalidJwtError)
      return {
        errors: [{ message: error.message, path: error.path }],
        message: 'Invalid JWT.'
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
  }
);
