import z from 'zod';

import { Status } from '~/generated/prisma/enums';

const task = z.object({
  description: z.string({ error: 'Description should be valid.' }).nullable(),
  title: z.string({ error: 'Title should be valid.' }),
  status: z.enum(Status),
  createdAt: z.date(),
  updatedAt: z.date(),
  id: z.string()
});

export const model = {
  taskRequest: task.omit({ createdAt: true, updatedAt: true, id: true }),
  params: z.object({ id: z.string() }),
  taskResponse: task
} as const;

export type Model = { [k in keyof typeof model]: z.infer<(typeof model)[k]> };
