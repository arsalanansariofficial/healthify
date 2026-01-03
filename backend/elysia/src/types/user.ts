import type z from 'zod';

import type {
  usersResponseSchema,
  userResponseSchema,
  userPayloadSchema,
  userSchema
} from '@/schemas/user';

export type UsersResponse = z.infer<typeof usersResponseSchema>;
export type UserResponse = z.infer<typeof userResponseSchema>;
export type UserPayload = z.infer<typeof userPayloadSchema>;
export type Token = { jwt: string; id: string };
export type User = z.infer<typeof userSchema>;
