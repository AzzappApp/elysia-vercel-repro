// Sentry must be loaded first so its auto-instrumentation wraps outgoing
// HTTP/DB calls before any user code issues them.
// oxlint-disable-next-line no-unassigned-import
import './instrument';
import { cors } from '@elysiajs/cors';
import { openapi } from '@elysiajs/openapi';
import { Elysia } from 'elysia';
import { axiomLogger } from './middleware/axiomLogger';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './middleware/logger';
import { routes } from './routes';

const api = new Elysia()
  .use(errorHandler)
  .use(logger)
  .use(axiomLogger)
  .use(cors())
  .use(
    openapi({
      path: '/docs',
      specPath: '/openapi.json',
      documentation: {
        info: { version: '1.0.0', title: 'Repro API' },
      },
    }),
  )
  .use(routes);

export default api;
