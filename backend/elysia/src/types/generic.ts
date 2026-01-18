import type z from 'zod';

import type { successResponseSchema } from '@/schemas/generic';

export type SuccessResponse = z.infer<typeof successResponseSchema>;
