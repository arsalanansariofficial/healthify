import z from 'zod';

import type { ModelType } from '@/lib/util/types';

import { Status } from '~/generated/prisma/enums';
import { schema } from '@/lib/util/schema';

export type Model = ModelType<typeof model>;

const task = z.object(
  {
    description: z
      .string('description should be a valid string.')
      .nonempty('description should not be empty.')
      .toLowerCase()
      .trim()
      .nullable(),
    status: z
      .enum(Status, `status should be valid, ex: ${Object.values(Status)}.`)
      .default(Status.incomplete)
      .nullable(),
    title: z
      .string('title should be a valid string.')
      .nonempty('title should not be empty.')
      .toLowerCase()
      .trim(),
    userId: schema
      .uuid('userId')
      .nonempty('userId should not be empty.')
      .trim(),
    id: schema.uuid('id').nonempty('id should not be empty.').trim(),
    createdAt: schema.date('createdAt'),
    updatedAt: schema.date('updatedAt')
  },
  'task should be a valid object.'
);

const tasks = z.array(task, 'tasks should be a valid array of task.');

export const model = { tasks, task } as const;
