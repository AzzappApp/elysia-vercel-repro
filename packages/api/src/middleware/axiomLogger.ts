import { Elysia } from 'elysia';
import { logEvent } from '@repro/service/loggerService';

export const axiomLogger = new Elysia({ name: 'axiomLogger' }).onAfterHandle(
  ({ request, set }) => {
    logEvent('api-requests', {
      method: request.method,
      url: request.url,
      status: typeof set.status === 'number' ? set.status : 200,
      timestamp: Date.now(),
    });
  },
);
