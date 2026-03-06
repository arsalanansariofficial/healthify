import type z from 'zod';

export type RequireFields<T, K extends keyof T> = Required<Pick<T, K>> & T;
export type ModelType<T> = { [k in keyof T]: z.infer<T[k]> };

export function getDefinedKeys<T extends Record<string, unknown>>(payload: T) {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value)
  );
}
