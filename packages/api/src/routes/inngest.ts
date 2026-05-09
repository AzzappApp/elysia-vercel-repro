import { Elysia } from 'elysia';
import createInngestHandler from '@repro/service/messageQueue/handler';

const inngestHandler = createInngestHandler();
const handle = ({ request }: { request: Request }) => inngestHandler(request);

export const inngest = new Elysia()
  .get('/inngest', handle)
  .post('/inngest', handle)
  .put('/inngest', handle);
