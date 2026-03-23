import {
  PrismaClientInitializationError,
  PrismaClientUnknownRequestError,
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
  PrismaClientRustPanicError
} from '@prisma/client/runtime/client';
import { Elysia } from 'elysia';

export class InvalidCredentialsError extends Error {
  public override message = 'Either email or password is invalid.';
  public path = ['email', 'password'];
  public status = 400;

  constructor(path?: string[]) {
    super();
    if (path) this.path = path;
  }
}

export class EmailAlreadyExistError extends Error {
  public override message = 'Email already exists.';
  public path = ['email'];
  public status = 400;

  constructor(path: string[]) {
    super();
    this.path = path;
  }
}

export class TaskNotFoundError extends Error {
  public override message = 'Requested task not found.';
  public path = ['task'];
  public status = 400;

  constructor(path: string[]) {
    super();
    this.path = path;
  }
}

export class UserNotFoundError extends Error {
  public override message = 'User not found.';
  public path = ['id'];
  public status = 400;

  constructor(path: string[]) {
    super();
    this.path = path;
  }
}

export class PermissionDeniedError extends Error {
  public override message = 'No permissions for the upload directory.';
  public path = ['file'];
  public status = 400;
}

export class InvalidJwtError extends Error {
  public override message = 'Either jwt invalid or expired.';
  public path = ['jwt'];
  public status = 401;
}

export class StorageFullError extends Error {
  public override message = 'Disk storage is full.';
  public path = ['file'];
  public status = 400;
}

export class FileNotFoundError extends Error {
  public override message = 'File not found.';
  public path = ['file'];
  public status = 400;
}

export const errorPlugin = new Elysia({ name: 'Error.Plugin' })
  .error({
    EPERM: PermissionDeniedError,
    ENOENT: FileNotFoundError,
    ENOSPC: StorageFullError,
    InvalidCredentialsError,
    EmailAlreadyExistError,
    TaskNotFoundError,
    UserNotFoundError,
    InvalidJwtError
  })
  .onError(({ error, code, path }) => {
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

      case 'EmailAlreadyExistError':
        return {
          errors: [{ message: error.message, path: error.path }],
          message: 'Email not available.'
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

      case 'TaskNotFoundError':
        return {
          errors: [{ message: error.message, path: error.path }],
          message: 'Task not found.'
        };

      case 'UserNotFoundError':
        return {
          errors: [{ message: error.message, path: error.path }],
          message: 'User not found.'
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

      case 'ENOENT':
        return {
          errors: [{ message: error.message, path: error.path }],
          message: 'File not found.'
        };

      case 'ENOSPC':
        return {
          errors: [{ message: error.message, path: error.path }],
          message: 'Disk storage full.'
        };

      case 'PARSE':
        return {
          errors: [{ message: error.message, path: ['body'] }],
          message: 'Invalid request body.'
        };

      case 'EPERM':
        return {
          errors: [{ message: error.message, path: error.path }],
          message: 'Permission denied.'
        };

      default:
        return {
          errors: [{ message: 'An unknown error occurred.', path }],
          message: 'Unknown error.'
        };
    }
  })
  .as('global');
