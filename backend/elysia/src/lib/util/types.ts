import type { HTTPHeaders } from 'elysia';

import z from 'zod';

export type NonNullish<T> = T extends undefined | null
  ? never
  : T extends Date
    ? Date
    : T extends File
      ? File
      : T extends (...params: never[]) => unknown
        ? T
        : T extends readonly (infer U)[]
          ? NonNullish<U>[]
          : T extends object
            ? { [K in keyof T]?: NonNullish<Exclude<T[K], undefined | null>> }
            : T;

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
