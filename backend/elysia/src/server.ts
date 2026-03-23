import { staticPlugin } from '@elysia/static';
import { cors } from '@elysia/cors';
import { Elysia } from 'elysia';

import { errorPlugin } from '@/lib/error';
import userRoutes from '@/modules/user';
import taskRoutes from '@/modules/task';
import { env } from '@/lib/config';

export type App = typeof app;

export const app = new Elysia({ name: 'App.Routes' })
  .use(staticPlugin())
  .use(errorPlugin)
  .use(userRoutes)
  .use(taskRoutes)
  .use(cors());

app.listen(env.PORT);
