import { getUserByEmail } from '@repro/data';
import { computeOrderTotal } from '@repro/payment';
import { CommonErrors } from '@repro/shared/errors';

export const previewOrderForUserEmail = async (
  email: string,
  amountCents: number,
): Promise<{ total: string } | { error: string }> => {
  const user = await getUserByEmail(email);
  if (!user) return { error: CommonErrors.NOT_FOUND };
  const result = await computeOrderTotal(user.id, amountCents, 0.2);
  return result.ok ? { total: result.total } : { error: result.error };
};
