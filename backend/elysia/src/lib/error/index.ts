import { InvertedStatusMap, StatusMap, Elysia } from 'elysia';
import { DrizzleQueryError } from 'drizzle-orm';

export class ApiError extends Error {
  public status: keyof InvertedStatusMap = StatusMap['Bad Request'];
  public errors?: string[];

  constructor(config?: {
    name?: keyof StatusMap | (string & {});
    code?: keyof StatusMap;
    errors?: string[];
    message?: string;
  }) {
    super();
    this.message = config?.message || 'An unknown error occurred.';
    this.status = StatusMap[config?.code || 'Bad Request'];
    this.name = config?.name || 'ApiError';
    this.errors = config?.errors;
  }

  toResponse() {
    return Response.json(this, { status: this.status });
  }
}

export const errorPlugin = new Elysia({ name: 'Error.Plugin' })
  .error({ DrizzleQueryError, ApiError })
  .onError(({ error, code }) => {
    switch (code) {
      case 'DrizzleQueryError':
        return error.cause;
      default:
        return error;
    }
  })
  .as('global');
