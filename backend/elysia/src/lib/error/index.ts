import { InvertedStatusMap, StatusMap, Elysia } from 'elysia';

export type HTTPVerb = keyof StatusMap;

export const errorPlugin = new Elysia({ name: 'Error.Plugin' })
  .onError(({ error }) => error)
  .as('global');

export class ApiError extends Error {
  public status: number = StatusMap['Bad Request'];

  constructor(
    public override message: string = 'An unknown error occurred.',
    public code: HTTPVerb = InvertedStatusMap[400],
    public override name: (string & {}) | HTTPVerb = 'ApiError'
  ) {
    super();
    this.status = StatusMap[code];
  }
}
