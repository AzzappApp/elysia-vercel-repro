// Sentry must initialize before any user code that issues outgoing HTTP/DB
// requests so the auto-instrumentation can wrap them.
// `light` skips the OpenTelemetry-heavy auto-instrumentations — same trick the
// original project applies via tsdown's alias map.
import * as Sentry from '@sentry/node-core/light';

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 0.1,
    environment: process.env.NODE_ENV ?? 'development',
  });
}

export const captureException = (error: unknown): void => {
  if (process.env.SENTRY_DSN) {
    Sentry.captureException(error);
  } else {
    console.error('[sentry-noop]', error);
  }
};
