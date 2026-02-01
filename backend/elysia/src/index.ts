import { staticPlugin } from '@elysia/static';
import { Elysia } from 'elysia';

import { errorPlugin } from '@/utils/error';
import { env } from '@/utils/config';
import user from '@/modules/user';

const app = new Elysia();

app.get('/', () => ({ message: 'Hello World.' }));
app.use(staticPlugin());
app.use(errorPlugin);
app.use(user);

app.listen(env.PORT);
