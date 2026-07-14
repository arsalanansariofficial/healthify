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

function stringOrArrayOfStrings(attribute: string) {
  const schema = z
    .string(`${attribute} should not be empty.`)
    .nonempty(`${attribute} should not be empty.`)
    .toLowerCase()
    .trim();

  return z.union([
    schema,
    z.array(schema, `${attribute} should be a valid array of strings.`)
  ]);
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

function string(attribute: string) {
  return z
    .string(`${attribute} should be a valid string.`)
    .nonempty(`${attribute} should not be empty.`)
    .toLowerCase()
    .trim();
}

function uuid(attribute: string) {
  return z
    .uuid(`${attribute} should be a valid UUID.`)
    .nonempty(`${attribute} should not be empty.`)
    .trim();
}

function url(attribute: string) {
  return z
    .url(`${attribute} should be a valid url.`)
    .nonempty(`${attribute} should not be empty.`)
    .trim();
}

function email() {
  return z
    .email(`email should be valid.`)
    .nonempty(`email should not be empty.`)
    .toLowerCase()
    .trim();
}

function fileOrUrl(attribute: string) {
  return z.union([url(attribute), file(attribute)]);
}

function date(attribute: string) {
  return z.date(`${attribute} should be a valid date.`);
}

export const schema = {
  stringOrArrayOfStrings,
  fileOrUrl,
  nullish,
  string,
  email,
  uuid,
  date,
  file,
  url
} as const;
