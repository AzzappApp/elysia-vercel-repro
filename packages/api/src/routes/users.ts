import { Elysia, t } from 'elysia';
import { getUserById } from '@repro/data';
import { checkServerAuth } from '@repro/service/serverAuthServices';
import { AuthErrors, CommonErrors } from '@repro/shared/errors';

export const users = new Elysia().get(
  '/users/:id',
  async ({ params, request, set }) => {
    const auth = await checkServerAuth(request.headers);
    if (!auth.ok) {
      set.status = 401;
      return { message: AuthErrors.INVALID_TOKEN };
    }
    const user = await getUserById(params.id);
    if (!user) {
      set.status = 404;
      return { message: CommonErrors.NOT_FOUND };
    }
    return { id: user.id, email: user.email };
  },
  {
    params: t.Object({ id: t.String() }),
  },
);
