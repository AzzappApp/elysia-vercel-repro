import { Elysia, t } from 'elysia';
import {
  getLocalizationMessages,
  getLocalizationMessagesByLocale,
  saveLocalizationMessage,
} from '@repro/data';
import { checkServerAuth } from '@repro/service/serverAuthServices';
import { AuthErrors } from '@repro/shared/errors';

export const translationMessages = new Elysia()
  .get(
    '/translationMessages/:locale',
    async ({ params, request, set }) => {
      const auth = await checkServerAuth(request.headers);
      if (!auth.ok) {
        set.status = 401;
        return { message: AuthErrors.INVALID_TOKEN };
      }
      if (params.locale === 'all') {
        return getLocalizationMessages();
      }
      return getLocalizationMessagesByLocale(params.locale);
    },
    {
      params: t.Object({ locale: t.String() }),
    },
  )
  .post(
    '/translationMessages',
    async ({ body, request, set }) => {
      const auth = await checkServerAuth(request.headers);
      if (!auth.ok) {
        set.status = 401;
        return { message: AuthErrors.INVALID_TOKEN };
      }
      await saveLocalizationMessage(body);
      return { message: 'ok' as const };
    },
    {
      body: t.Object({
        key: t.String(),
        locale: t.String(),
        value: t.String(),
      }),
    },
  );
