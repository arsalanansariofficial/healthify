import z from 'zod';

import type { ModelType } from '@/lib/util/types';

import { Status } from '~/generated/prisma/enums';

export type Model = ModelType<typeof model>;

const task = z.object({
  status: z.enum(Status).default(Status.incomplete).nullable(),
  description: z.string().trim().toLowerCase().nullable(),
  title: z.string().trim().toLowerCase(),
  userId: z.string().trim(),
  id: z.string().trim(),
  createdAt: z.date(),
  updatedAt: z.date()
});

const payload = z.object({
  status: z.enum(Status).default(Status.incomplete).nullish(),
  description: z.string().trim().toLowerCase().nullish(),
  title: z.string().trim().toLowerCase()
});

const params = z.object({ id: z.string().trim() });
const tasks = z.array(task);

export const model = { payload, params, tasks, task } as const;
