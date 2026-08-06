import { staticPlugin } from '@elysia/static';
import { cors } from '@elysia/cors';
import { Elysia } from 'elysia';

import { organizationRoutes } from '@/modules/organization';
import { userRoutes } from '@/modules/user';
import { errorPlugin } from '@/lib/error';
import { authRoutes } from '@/lib/auth';
import { env } from '@/lib/config';

export type App = typeof app;

export const app = new Elysia({ name: 'App.Routes' })
  .use(staticPlugin())
  .use(errorPlugin)
  .use(cors())
  .use(organizationRoutes)
  .use(authRoutes)
  .use(userRoutes);

app.listen(env.PORT);
