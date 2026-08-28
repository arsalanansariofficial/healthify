import { DrizzleQueryError } from 'drizzle-orm/errors';
import { StatusMap, Elysia } from 'elysia';

import type { Errors } from '@/lib/util/types';

import { isUnknownError, isFileError } from '@/lib/util';
import { env } from '@/lib/config';

export class ApiError extends Error {
  constructor(
    public errors: Errors = [
      { message: 'An unknown error occurred.', path: ['unknown'] }
    ],
    public override message = 'An unknown error occurred.',
    public status: number = StatusMap['Internal Server Error']
  ) {
    super();
  }
}

export class UnauthorizedError extends ApiError {
  constructor(
    public override errors: Errors = [
      {
        message: 'Invalid session token provided.',
        path: [env.SESSION_COOKIE_NAME]
      }
    ],
    public override message = 'Unauthorized.',
    public override status = StatusMap.Unauthorized
  ) {
    super();
  }
}

export const errorPlugin = new Elysia({ name: 'Error.Plugin' })
  .error({ ApiError })
  .onError(({ status, error, code, path }) => {
    switch (true) {
      case code === 'INVALID_FILE_TYPE':
        return status(error.status, {
          ...new ApiError(
            [
              {
                path: [error.property, `expected ${error.expected}`],
                message: error.message
              }
            ],
            error.name,
            error.status
          )
        });

      case code === 'VALIDATION':
        return status(error.status, {
          ...new ApiError(
            error.all.map(issue => ({
              message: issue.message,
              path: [issue.path]
            })) as Errors,
            error.name,
            error.status
          )
        });

      case code === 'UNKNOWN' && isUnknownError(error):
        const statusCode =
          (error.statusCode as number) || StatusMap['Internal Server Error'];
        return status(statusCode, {
          ...new ApiError(
            [{ message: error.message, path: [path] }],
            error.name,
            statusCode
          )
        });

      case code === 'INVALID_COOKIE_SIGNATURE':
        return status(error.status, {
          ...new ApiError(
            [{ message: error.message, path: [error.key] }],
            error.name,
            error.status
          )
        });

      case code === 'INTERNAL_SERVER_ERROR':
        return status(error.status, {
          ...new ApiError(
            [{ message: error.message, path: [error.code] }],
            error.name,
            error.status
          )
        });

      case code === 'NOT_FOUND':
        return status(error.status, {
          ...new ApiError(
            [{ message: error.message, path: [path] }],
            error.name,
            error.status
          )
        });

      case code === 'PARSE':
        return status(error.status, {
          ...new ApiError(
            [{ message: error.message, path: [error.code] }],
            error.message,
            error.status
          )
        });

      case error instanceof Error && isFileError(error):
        return status(StatusMap['Bad Request'], {
          ...new ApiError(
            [{ path: [error.path as string], message: error.message }],
            error.name,
            StatusMap['Bad Request']
          )
        });

      case error instanceof DrizzleQueryError:
        return status(StatusMap['Bad Request'], {
          ...new ApiError(
            [{ message: error.message, path: error.params }],
            error.name,
            StatusMap['Bad Request']
          )
        });

      case code === 'ApiError':
        return status(error.status, { ...error });

      default:
        return status(StatusMap['Internal Server Error'], {
          ...new ApiError()
        });
    }
  })
  .as('global');
