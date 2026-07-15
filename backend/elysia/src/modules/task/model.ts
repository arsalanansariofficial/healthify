import z from 'zod';

import type { Task } from '~/generated/prisma/client';
import type { ModelType } from '@/lib/util/types';

import { Status } from '~/generated/prisma/enums';
import { schema } from '@/lib/util/schema';

export type Model = ModelType<typeof model>;

const task = z.toZod<Task>()(
  z.object(
    {
      status: z
        .enum(Status, `status should be valid, ex: ${Object.values(Status)}.`)
        .default(Status.incomplete)
        .nullable(),
      description: schema.string('description').nullable(),
      createdAt: schema.date('createdAt'),
      updatedAt: schema.date('updatedAt'),
      userId: schema.uuid('userId'),
      title: schema.string('title'),
      id: schema.uuid('id')
    },
    'task should be a valid object.'
  )
);

const tasks = z.array(task, 'tasks should be a valid array of task.');

export const model = { tasks, task } as const;
