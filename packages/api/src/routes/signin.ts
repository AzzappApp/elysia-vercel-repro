import { Elysia, t } from 'elysia';
import { signToken } from '@repro/service/tokenService';
import { signin } from '@repro/service/userServices';

export const signinRoute = new Elysia().post(
  '/signin',
  async ({ body, set }) => {
    const result = await signin(body);
    if (!result.ok) {
      set.status = 401;
      return { message: result.error };
    }
    const token = await signToken(result.user.id);
    return { id: result.user.id, email: result.user.email ?? '', token };
  },
  {
    body: t.Object({
      email: t.String(),
      password: t.String(),
    }),
  },
);
