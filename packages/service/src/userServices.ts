import bcrypt from 'bcrypt';
import { getUserByEmail, insertUser, type User } from '@repro/data';
import { AuthErrors } from '@repro/shared/errors';

export type SignupInput = {
  email: string;
  password: string;
};

export const signup = async ({ email, password }: SignupInput): Promise<void> => {
  const hashed = await bcrypt.hash(password, 10);
  await insertUser({ email, password: hashed });
};

export type SigninResult =
  | { ok: true; user: User }
  | { ok: false; error: string };

export const signin = async ({
  email,
  password,
}: SignupInput): Promise<SigninResult> => {
  const user = await getUserByEmail(email);
  if (!user || !user.password) {
    return { ok: false, error: AuthErrors.INVALID_TOKEN };
  }
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return { ok: false, error: AuthErrors.INVALID_TOKEN };
  }
  return { ok: true, user };
};
