import z from 'zod';

import type { ModelType } from '@/lib/util/types';

import { Status } from '~/generated/prisma/enums';

export type Payload = ModelType<typeof payload>;

const task = z.object({
  description: z.string().nonempty().trim().toLowerCase().nullish(),
  status: z.enum(Status).default(Status.incomplete).nullish(),
  title: z.string().nonempty().trim().toLowerCase()
});

const patchTask = z.object({
  ...task.shape,
  title: task.shape.title.optional()
});

const taskId = z.object({ id: z.string().nonempty().trim() });

export const payload = { patchTask, taskId, task } as const;
