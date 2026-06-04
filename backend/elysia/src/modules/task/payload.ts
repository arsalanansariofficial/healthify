import z from 'zod';

import type { ModelType } from '@/lib/util/types';

import { model } from '@/modules/task/model';
import { schema } from '@/lib/util/schema';

export type Payload = ModelType<typeof payload>;

const task = z.object(
  {
    description: model.task.shape.description.nullish(),
    status: model.task.shape.status.nullish(),
    title: model.task.shape.title
  },
  'task should be valid object.'
);

const patchTask = z.object(
  { ...task.shape, title: task.shape.title.optional() },
  'task should be a valid object.'
);

const taskId = z.object(
  { id: schema.uuid('id').nonempty('taskId should not be empty.').trim() },
  'taskId params should be valid object.'
);

export const payload = { patchTask, taskId, task } as const;
