import type { HTTPHeaders } from 'elysia';

import z from 'zod';

export type FactoryResults<T extends Record<string, () => unknown>> = {
  [K in keyof T]: ReturnType<T[K]>;
};

export type WhereTuple = [
  key: string,
  value: { isNull: boolean } | { eq: Date } | string | number
];

export type WithHeaders<T> = {
  set: { headers: HTTPHeaders };
  headers: Headers;
} & T;

export type ModelType<T> = { [k in keyof T]: z.infer<T[k]> };
