import z from 'zod';

import type { PaginationResult } from '@/lib/pagination';
import type { ModelType } from '@/lib/util/types';

import { env } from '@/lib/config';

export type Schema = ModelType<{
  [K in keyof typeof schema]: ReturnType<(typeof schema)[K]>;
}>;

function pagination<T>(schema: z.ZodType<T>) {
  return z.toZod<PaginationResult<T>>()(
    z.object(
      {
        data: z.array(
          schema,
          `${schema.meta()?.title} should be a valid array.`
        ),
        hasPreviousPage: z.boolean(
          'hasPreviousPage should be a valid boolean.'
        ),
        hasNextPage: z.boolean('hasNextPage should be a valid boolean.'),
        totalPages: z.number('totalPages should be a valid number.'),
        pageSize: z.number('pageSize should be a valid number.'),
        total: z.number('total should be a valid number.'),
        page: z.number('page should be a valid number.')
      },
      'pagination should be a valid object.'
    )
  );
}

function file(attribute: string) {
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

function typeOrArray(type: z.ZodType) {
  const key = type.meta()?.title || 'property';
  const value = type.meta()?.type || 'type';

  return z.union(
    [z.array(type), type],
    `${key} should either be ${value} or ${value}[].`
  );
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

function timestamps() {
  return z.object(
    {
      updatedAt: schema.date('updatedAt'),
      createdAt: schema.date('createdAt')
    },
    'timestamps should be valid object.'
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

function time(attribute: string) {
  return string(attribute).regex(
    /^(?:[01]\d|2[0-3]):[0-5]\d$/,
    `${attribute} is in invalid time format.`
  );
}

function email() {
  return z
    .email(`email should be valid.`)
    .nonempty(`email should not be empty.`)
    .toLowerCase()
    .trim();
}

function date(attribute: string) {
  return z.coerce.date(`${attribute} should be a valid date.`);
}

function fileOrUrl(attribute: string) {
  return z.union([url(attribute), file(attribute)]);
}

export const schema = {
  typeOrArray,
  pagination,
  timestamps,
  fileOrUrl,
  nullish,
  string,
  email,
  uuid,
  date,
  file,
  time,
  url
} as const;
