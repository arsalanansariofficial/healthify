import { Elysia } from 'elysia';

const app = new Elysia().get('/', () => ({ message: 'Hello World.' }));

app.listen(3000);
