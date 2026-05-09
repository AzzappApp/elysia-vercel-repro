// Mirrors azzapp's `#env` path used as `import env from '#env'`.
const env = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  SENTRY_DSN: process.env.SENTRY_DSN,
  PLATFORM: process.env.PLATFORM ?? 'preview',
};

export default env;
