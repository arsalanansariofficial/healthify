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

const tasks = z.array(task);

export const model = { tasks, task } as const;
