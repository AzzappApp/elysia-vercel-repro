import { useLogger, useErrorHandler } from '@envelop/core';
import { useParserCache } from '@envelop/parser-cache';
import { useValidationCache } from '@envelop/validation-cache';
import { useDisableIntrospection } from '@graphql-yoga/plugin-disable-introspection';
import { Elysia } from 'elysia';
import { createYoga } from 'graphql-yoga';
import { schema } from '@repro/schema';
import { checkServerAuth } from '@repro/service/serverAuthServices';
import { AuthErrors } from '@repro/shared/errors';

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
    return new Response(JSON.stringify({ message: AuthErrors.INVALID_TOKEN }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    });
  }
  return yoga.fetch(request);
};

export const graphql = new Elysia()
  .post('/graphql', handle)
  .get('/graphql', handle);
