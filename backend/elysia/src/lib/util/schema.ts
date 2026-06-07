import z from 'zod';

import type { ModelType } from '@/lib/util/types';

import { env } from '@/lib/config';

export type Schema = ModelType<{
  [K in keyof typeof schema]: ReturnType<(typeof schema)[K]>;
}>;

function file(attribute: string): z.ZodFile {
  return z
    .file(`${attribute} should be a valid file.`)
    .max(
      env.MAX_FILE_SIZE,
      `${attribute} should be at most ${env.MAX_FILE_SIZE} bytes.`
    )
    .min(
      env.MIN_FILE_SIZE,
      `${attribute} should be at least ${env.MIN_FILE_SIZE} bytes.`
    )
    .mime([`image/png`], `${attribute} should be in 'png' format.`);
}

function nullish(attribute: string) {
  return z.union(
    [
      z.undefined(`${attribute} should be undefined.`),
      z.null(`${attribute} should be null.`)
    ],
    `${attribute} should be either null or undefined.`
  );
}

function fileOrUrl(attribute: string) {
  return z.union([
    z.url(`${attribute} should be a valid url.`).trim().toLowerCase(),
    file(attribute)
  ]);
}

function date(attribute: string) {
  return z.date(`${attribute} should be a valid date.`);
}

function uuid(attribute: string) {
  return z.uuid(`${attribute} should be valid UUID.`);
}

export const schema = { fileOrUrl, nullish, uuid, date, file } as const;
