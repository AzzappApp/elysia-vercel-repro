import { Elysia, t } from 'elysia';
import { signin } from '@repro/service/userServices';

export const signinRoute = new Elysia().post(
  '/signin',
  async ({ body, set }) => {
    const result = await signin(body);
    if (!result.ok) {
      set.status = 401;
      return { message: result.error };
    }
    return { id: result.user.id, email: result.user.email };
  },
  {
    body: t.Object({
      email: t.String(),
      password: t.String(),
    }),
    response: {
      200: t.Object({
        id: t.String(),
        email: t.Union([t.String(), t.Null()]),
      }),
      401: t.Object({ message: t.String() }),
    },
  },
);
