import z from 'zod';

import '@/lib/config/zod';
import type { ModelType } from '@/lib/util/types';

import { Status } from '~/generated/prisma/enums';

const task = z
  .object({
    status: z
      .enum(Status, { error: `Status should be ${Status}.` })
      .default(Status.incomplete)
      .nullable(),
    description: z.string({ error: 'Description should be valid.' }).nullable(),
    createdAt: z.date({ error: 'CreatedAt should be valid.' }),
    updatedAt: z.date({ error: 'UpdatedAt should be valid.' }),
    userId: z.string({ error: 'UserId should be valid.' }),
    title: z.string({ error: 'Title should be valid.' }),
    id: z.string({ error: 'Id should be valid.' })
  })
  .partial();

export const model = {
  params: task.pick({ id: true }).required(),
  payload: task.required({ title: true }),
  tasks: z.array(task),
  task
} as const;

export type Model = ModelType<typeof model>;
