import { Elysia } from 'elysia';

import { env } from '@/config/env';
import user from '@/routes/user';

const app = new Elysia();

app.get('/', () => ({ message: 'Hello World.' }));
app.use(user);

app.listen(env.PORT);
