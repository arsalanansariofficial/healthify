import { staticPlugin } from '@elysia/static';
import { Elysia } from 'elysia';

import { errorPlugin } from '@/utils/error';
import userRouter from '@/modules/user';
import taskRouter from '@/modules/task';
import { env } from '@/utils/config';

const app = new Elysia({ name: 'root' });

app.use(staticPlugin());
app.use(errorPlugin);
app.use(userRouter);
app.use(taskRouter);

app.listen(env.PORT);
