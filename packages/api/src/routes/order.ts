import { Elysia, t } from 'elysia';
import { computeOrderTotal } from '@repro/payment';
import { previewOrderForUserEmail } from '@repro/service/orderService';

export const order = new Elysia()
  .post(
    '/order/preview',
    async ({ body }) => previewOrderForUserEmail(body.email, body.amountCents),
    {
      body: t.Object({
        email: t.String(),
        amountCents: t.Number(),
      }),
    },
  )
  .post(
    '/order/total',
    async ({ body }) =>
      computeOrderTotal(body.userId, body.amountCents, body.taxRate),
    {
      body: t.Object({
        userId: t.String(),
        amountCents: t.Number(),
        taxRate: t.Number(),
      }),
    },
  );
