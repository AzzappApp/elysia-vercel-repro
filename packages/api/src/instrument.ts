// Sentry must be loaded first so its auto-instrumentation wraps outgoing
// HTTP/DB calls before any user code issues them.
import * as Sentry from '@sentry/node-core';
import env from '#env';

if (env.SENTRY_DSN) {
  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.PLATFORM,
    enabled: env.NODE_ENV !== 'development',
    tracesSampleRate: env.PLATFORM === 'production' ? 0.1 : 1,
    sendDefaultPii: true,
  });
}

export const captureException = (error: unknown): void => {
  if (env.SENTRY_DSN) {
    Sentry.captureException(error);
  } else {
    console.error('[sentry-noop]', error);
  }
};
