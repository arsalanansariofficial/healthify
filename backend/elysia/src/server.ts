import { staticPlugin } from '@elysia/static';
import { cors } from '@elysia/cors';
import { Elysia } from 'elysia';

import { routes as specializationRoutes } from '@/modules/specialization';
import { routes as organizationRoutes } from '@/modules/organization';
import { routes as appointmentRoutes } from '@/modules/appointment';
import { routes as doctorRoutes } from '@/modules/doctor';
import { routes as userRoutes } from '@/modules/user';
import { errorPlugin } from '@/lib/error';
import { authRoutes } from '@/lib/auth';
import { env } from '@/lib/config';

export type App = typeof app;

export const app = new Elysia({ name: 'App.Routes' })
  .use(staticPlugin())
  .use(errorPlugin)
  .use(cors())
  .use(specializationRoutes)
  .use(organizationRoutes)
  .use(appointmentRoutes)
  .use(doctorRoutes)
  .use(authRoutes)
  .use(userRoutes);

app.listen(env.PORT);
