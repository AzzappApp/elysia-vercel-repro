import { Elysia, t } from 'elysia';
import { signup } from '@repro/service/userServices';
import { CommonErrors } from '@repro/shared/errors';

export const signupRoute = new Elysia().post(
  '/signup',
  async ({ body, set }) => {
    try {
      await signup(body);
      return { message: 'ok' as const };
    } catch (e) {
      console.error(e);
      set.status = 500;
      return { message: CommonErrors.INTERNAL_ERROR };
    }
  },
  {
    body: t.Object({
      email: t.String({ format: 'email' }),
      password: t.String({ minLength: 8 }),
    }),
  },
);
