import z from 'zod';

import type { RequireFields, ModelType } from '@/lib/util/types';
import type { SchemaUpdate } from '@/lib/db/schema';

import { model } from '@/modules/doctor/model';

export type Payload = ModelType<typeof payload>;

const doctor = z.toZod<
  RequireFields<SchemaUpdate['doctor'], 'licenseNumber'>
>()(model.doctor.partial().required({ licenseNumber: true }));

export const payload = { doctor } as const;
