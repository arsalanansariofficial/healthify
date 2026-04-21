import z from 'zod';

import type { none } from '@/lib/util';

export type RequireFields<T, K extends keyof T> = Required<Pick<T, K>> & T;
export type ModelType<T> = { [k in keyof T]: z.infer<T[k]> };
export type Err = { message: string; path: string[] };
export type None = z.infer<typeof none>;
