import { InvertedStatusMap, StatusMap, Elysia } from 'elysia';

export type HTTPVerb = keyof StatusMap;

export const errorPlugin = new Elysia({ name: 'Error.Plugin' })
  .onError(({ error }) => error)
  .as('global');

export class ApiError extends Error {
  public status: keyof InvertedStatusMap = StatusMap['Bad Request'];
  public errors?: string[];

  constructor(config?: {
    name?: (string & {}) | HTTPVerb;
    errors?: string[];
    message?: string;
    code?: HTTPVerb;
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
