import { useLogger, useErrorHandler } from '@envelop/core';
import { useParserCache } from '@envelop/parser-cache';
import { useValidationCache } from '@envelop/validation-cache';
import { useDisableIntrospection } from '@graphql-yoga/plugin-disable-introspection';
import { Elysia } from 'elysia';
import { createYoga } from 'graphql-yoga';
import { schema } from '@repro/schema';
import { checkServerAuth } from '@repro/service/serverAuthServices';
import { AuthErrors } from '@repro/shared/errors';
import packageJSON from '../../package.json';
import queryMap from '#persisted-query-map.json';

// Mirrors azzapp: dynamic import of a second large JSON file. Dynamic imports
// often force bundlers into preserve-sources mode for the importing module.
let previousMapPromise: Promise<{ default: Record<string, unknown> }> | null =
  null;
const getPreviousQueryMap = () => {
  previousMapPromise ??= import('#previous-persisted-query-map.json');
  return previousMapPromise;
};

const APP_VERSION = packageJSON.version;

const yoga = createYoga({
  schema,
  graphqlEndpoint: '/graphql',
  plugins: [
    useLogger({ logFn: () => {} }),
    useErrorHandler(({ errors }) => {
      console.error('graphql errors', errors);
    }),
    useParserCache(),
    useValidationCache(),
    useDisableIntrospection({
      isDisabled: () => process.env.NODE_ENV === 'production',
    }),
  ],
});

const handle = async ({ request }: { request: Request }) => {
  const auth = await checkServerAuth(request.headers);
  if (!auth.ok) {
    return new Response(
      JSON.stringify({
        message: AuthErrors.INVALID_TOKEN,
        version: APP_VERSION,
        knownQueries: Object.keys(queryMap).length,
        previousLoaded: previousMapPromise !== null,
      }),
      {
        status: 401,
        headers: { 'content-type': 'application/json' },
      },
    );
  }
  // Touch the dynamic import so the bundler must consider it.
  void getPreviousQueryMap();
  return yoga.fetch(request);
};

export const graphql = new Elysia()
  .post('/graphql', handle)
  .get('/graphql', handle);
