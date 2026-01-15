import { Elysia } from 'elysia';

import { errorPlugin } from '@/plugins/error';
import { env } from '@/config/env';
import user from '@/routes/user';

const app = new Elysia();

app.get('/', () => ({ message: 'Hello World.' }));
app.use(errorPlugin);
app.use(user);

app.listen(env.PORT);
