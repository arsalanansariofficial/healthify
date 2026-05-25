import z from 'zod';

import type { ModelType } from '@/lib/util/types';

import { Status } from '~/generated/prisma/enums';

export type Model = ModelType<typeof model>;

const task = z.object({
  description: z.string().nonempty().trim().toLowerCase().nullable(),
  status: z.enum(Status).default(Status.incomplete).nullable(),
  title: z.string().nonempty().trim().toLowerCase(),
  userId: z.string().nonempty().trim(),
  id: z.string().nonempty().trim(),
  createdAt: z.date(),
  updatedAt: z.date()
});

const payload = z.object({
  description: z.string().nonempty().trim().toLowerCase().nullish(),
  status: z.enum(Status).default(Status.incomplete).nullish(),
  title: z.string().nonempty().trim().toLowerCase()
});

const params = z.object({ id: z.string().nonempty().trim() });
const tasks = z.array(task);

export const model = { payload, params, tasks, task } as const;
