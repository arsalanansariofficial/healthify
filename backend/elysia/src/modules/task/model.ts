import z from 'zod';

import { Status } from '~/generated/prisma/enums';
import '@/utils/config/zod';

const task = z
  .object({
    description: z.string({ error: 'Description should be valid.' }).nullable(),
    title: z.string({ error: 'Title should be valid.' }),
    status: z.enum(Status).default(Status.incomplete),
    createdAt: z.date(),
    updatedAt: z.date(),
    userId: z.string(),
    id: z.string()
  })
  .partial();

export const model = {
  params: task.pick({ id: true }).required(),
  tasks: z.array(task),
  task
} as const;

export type Model = { [k in keyof typeof model]: z.infer<(typeof model)[k]> };
export type RequireFields<T, K extends keyof T> = Required<Pick<T, K>> & T;
