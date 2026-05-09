import Decimal from 'decimal.js';
import { getUserById } from '@repro/data';
import { CommonErrors } from '@repro/shared/errors';

export type PaymentResult =
  | { ok: true; total: string }
  | { ok: false; error: string };

export const computeOrderTotal = async (
  userId: string,
  amountCents: number,
  taxRate: number,
): Promise<PaymentResult> => {
  const user = await getUserById(userId);
  if (!user) return { ok: false, error: CommonErrors.NOT_FOUND };
  const amount = new Decimal(amountCents).div(100);
  const taxes = amount.mul(taxRate);
  return { ok: true, total: amount.plus(taxes).toFixed(2) };
};
