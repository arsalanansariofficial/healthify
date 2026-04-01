import {
  PrismaClientInitializationError,
  PrismaClientUnknownRequestError,
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
  PrismaClientRustPanicError
} from '@prisma/client/runtime/client';
import { Elysia } from 'elysia';

import { isFileError, type Err } from '@/lib/util';

export class ApiError extends Error {
  constructor(
    public errors: [Err, ...Array<Err>] = [
      { message: 'An unknown error occurred.', path: ['unknown'] }
    ],
    public override message = 'An unknown error occurred.',
    public status = 500
  ) {
    super();
  }
}

export class InvalidCredentialsError extends ApiError {
  constructor(
    public override errors: [Err, ...Array<Err>] = [
      {
        message: 'Either email or password is invalid.',
        path: ['email', 'password']
      }
    ],
    public override message = 'Invalid credentials.',
    public override status = 400
  ) {
    super();
  }
}

export class EmailAlreadyExistError extends ApiError {
  constructor(
    public override errors: [Err, ...Array<Err>] = [
      { message: 'Email already exists.', path: ['email'] }
    ],
    public override message = 'Email not available.',
    public override status = 400
  ) {
    super();
  }
}

export class UserNotFoundError extends ApiError {
  constructor(
    public override errors: [Err, ...Array<Err>] = [
      { message: 'User with the id does not exist.', path: ['id'] }
    ],
    public override message = 'User not found.',
    public override status = 400
  ) {
    super();
  }
}

export class TaskNotFoundError extends ApiError {
  constructor(
    public override errors: [Err, ...Array<Err>] = [
      { message: 'Requested task not found.', path: ['task'] }
    ],
    public override message = 'Task not found.',
    public override status = 400
  ) {
    super();
  }
}

export class InvalidJwtError extends ApiError {
  constructor(
    public override errors: [Err, ...Array<Err>] = [
      { message: 'Either jwt invalid or expired.', path: ['jwt'] }
    ],
    public override message = 'Invalid jwt.',
    public override status = 401
  ) {
    super();
  }
}

export const errorPlugin = new Elysia({ name: 'Error.Plugin' })
  .error({ ApiError })
  .onError(({ status, error, code, path }) => {
    const e = error as Error;

    if (isFileError(e))
      return status(400, {
        ...new ApiError(
          [{ path: [e.path as string], message: e.message }],
          e.name,
          400
        )
      });

    switch (true) {
      case code === 'INVALID_COOKIE_SIGNATURE':
        return {
          ...new ApiError(
            [{ message: error.message, path: [error.key] }],
            error.name,
            error.status
          )
        };

      case code === 'INTERNAL_SERVER_ERROR':
        return {
          ...new ApiError(
            [{ message: error.message, path: [error.code] }],
            error.name,
            error.status
          )
        };

      case code === 'INVALID_FILE_TYPE':
        return {
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
        };

      case code === 'NOT_FOUND':
        return {
          ...new ApiError(
            [{ message: error.message, path: [path] }],
            error.name,
            error.status
          )
        };

      case code === 'VALIDATION':
        return {
          ...new ApiError(
            error.all?.map(issue => ({
              message: issue.message,
              path: issue.path
            })) as unknown as [Err, ...Array<Err>],
            error.name,
            error.status
          )
        };

      case code === 'PARSE':
        return {
          ...new ApiError(
            [{ message: error.message, path: [error.code] }],
            error.message,
            error.status
          )
        };

      case code === 'UNKNOWN':
        return {
          ...new ApiError(
            [{ message: error.message, path: [path] }],
            error.name
          )
        };

      case error instanceof PrismaClientInitializationError:
        return {
          ...new ApiError(
            [{ path: [path, String(error.errorCode)], message: error.message }],
            error.name,
            400
          )
        };

      case error instanceof PrismaClientKnownRequestError:
        return {
          ...new ApiError(
            [
              {
                path: [path, error.code, String(error.batchRequestIdx)],
                message: error.message
              }
            ],
            error.name,
            400
          )
        };

      case error instanceof PrismaClientUnknownRequestError:
        return {
          ...new ApiError(
            [
              {
                path: [path, String(error.batchRequestIdx)],
                message: error.message
              }
            ],
            error.name,
            400
          )
        };

      case error instanceof PrismaClientRustPanicError:
        return {
          ...new ApiError(
            [{ message: error.message, path: [path] }],
            error.name,
            400
          )
        };

      case error instanceof PrismaClientValidationError:
        return {
          ...new ApiError(
            [{ message: error.message, path: [path] }],
            error.name,
            400
          )
        };

      case code === 'ApiError':
        return { ...error };

      default:
        return { ...new ApiError() };
    }
  })
  .as('global');
