import z from 'zod';

import type { ModelType } from '@/lib/util/types';

import { model } from '@/modules/task/model';
import { schema } from '@/lib/util/schema';

export type Payload = ModelType<typeof payload>;

const taskId = z.object(
  { id: schema.uuid('id').nonempty('taskId should not be empty.').trim() },
  'taskId params should be valid object.'
);

const task = model.task.partial().extend({ title: model.task.shape.title });
const patchTask = model.task.partial();

export const payload = { patchTask, taskId, task } as const;
