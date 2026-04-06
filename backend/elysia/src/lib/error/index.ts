import {
  PrismaClientInitializationError,
  PrismaClientUnknownRequestError,
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
  PrismaClientRustPanicError
} from '@prisma/client/runtime/client';
import { HttpStatusCode } from 'axios';
import { Elysia } from 'elysia';

import type { Err } from '@/lib/util/types';

import { isFileError } from '@/lib/util';

export class ApiError extends Error {
  constructor(
    public errors: [Err, ...Array<Err>] = [
      { message: 'An unknown error occurred.', path: ['unknown'] }
    ],
    public override message = 'An unknown error occurred.',
    public status = HttpStatusCode.InternalServerError
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
    public override status = HttpStatusCode.BadRequest
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
    public override status = HttpStatusCode.BadRequest
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
    public override status = HttpStatusCode.BadRequest
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
    public override status = HttpStatusCode.BadRequest
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
    public override status = HttpStatusCode.BadRequest
  ) {
    super();
  }
}

export const errorPlugin = new Elysia({ name: 'Error.Plugin' })
  .error({ ApiError })
  .onError(({ status, error, code, path }) => {
    const e = error as Error;

    if (isFileError(e))
      return status(HttpStatusCode.BadRequest, {
        ...new ApiError(
          [{ path: [e.path as string], message: e.message }],
          e.name,
          HttpStatusCode.BadRequest
        )
      });

    switch (true) {
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

      case code === 'NOT_FOUND':
        return status(error.status, {
          ...new ApiError(
            [{ message: error.message, path: [path] }],
            error.name,
            error.status
          )
        });

      case code === 'VALIDATION':
        return status(error.status, {
          ...new ApiError(
            error.all?.map(issue => ({
              message: issue.message,
              path: issue.path
            })) as unknown as [Err, ...Array<Err>],
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

      case code === 'UNKNOWN':
        return status(HttpStatusCode.InternalServerError, {
          ...new ApiError(
            [{ message: error.message, path: [path] }],
            error.name
          )
        });

      case error instanceof PrismaClientInitializationError:
        return status(HttpStatusCode.BadRequest, {
          ...new ApiError(
            [{ path: [path, String(error.errorCode)], message: error.message }],
            error.name,
            HttpStatusCode.BadRequest
          )
        });

      case error instanceof PrismaClientKnownRequestError:
        return status(HttpStatusCode.BadRequest, {
          ...new ApiError(
            [
              {
                path: [path, error.code, String(error.batchRequestIdx)],
                message: error.message
              }
            ],
            error.name,
            HttpStatusCode.BadRequest
          )
        });

      case error instanceof PrismaClientUnknownRequestError:
        return status(HttpStatusCode.BadRequest, {
          ...new ApiError(
            [
              {
                path: [path, String(error.batchRequestIdx)],
                message: error.message
              }
            ],
            error.name,
            HttpStatusCode.BadRequest
          )
        });

      case error instanceof PrismaClientRustPanicError:
        return status(HttpStatusCode.BadRequest, {
          ...new ApiError(
            [{ message: error.message, path: [path] }],
            error.name,
            HttpStatusCode.BadRequest
          )
        });

      case error instanceof PrismaClientValidationError:
        return status(HttpStatusCode.BadRequest, {
          ...new ApiError(
            [{ message: error.message, path: [path] }],
            error.name,
            HttpStatusCode.BadRequest
          )
        });

      case code === 'ApiError':
        return status(error.status, { ...error });

      default:
        return status(HttpStatusCode.InternalServerError, {
          ...new ApiError()
        });
    }
  })
  .as('global');
