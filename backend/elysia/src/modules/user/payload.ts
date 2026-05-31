import z from 'zod';

import type { ModelType } from '@/lib/util/types';

import { model } from '@/modules/user/model';

export type Payload = ModelType<typeof payload>;

const setPassword = z.object({
  newPassword: z
    .string()
    .regex(/[^A-Za-z0-9]/)
    .regex(/[0-9]/)
    .regex(/[a-z]/)
    .regex(/[A-Z]/)
    .nonempty()
    .max(256)
    .min(8)
    .trim()
});

const userProfile = z.object({
  phoneNumber: model.userProfile.shape.phoneNumber.nullish(),
  address: model.userProfile.shape.address.nullish(),
  gender: model.userProfile.shape.gender.nullish(),
  image: model.userProfile.shape.image.nullish(),
  cover: model.userProfile.shape.cover.nullish(),
  bio: model.userProfile.shape.bio.nullish()
});

const verifyPassword = z.object({ password: z.string().nonempty().trim() });
const status = z.object({ status: z.boolean() });

export const payload = {
  verifyPassword,
  setPassword,
  userProfile,
  status
} as const;
