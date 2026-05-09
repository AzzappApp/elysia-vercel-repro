import jwt from 'jsonwebtoken';
import { AuthErrors } from '@repro/shared/errors';

const SERVER_SECRET = process.env.SERVER_AUTH_SECRET ?? 'fake-server-secret';

export type ServerAuthResult =
  | { ok: true; subject: string }
  | { ok: false; error: string };

export const checkServerAuth = async (
  headers: Headers,
): Promise<ServerAuthResult> => {
  const authHeader = headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return { ok: false, error: AuthErrors.MISSING_TOKEN };
  }
  const token = authHeader.slice('Bearer '.length);
  try {
    const payload = jwt.verify(token, SERVER_SECRET) as { sub?: string };
    if (!payload.sub) {
      return { ok: false, error: AuthErrors.INVALID_TOKEN };
    }
    return { ok: true, subject: payload.sub };
  } catch {
    return { ok: false, error: AuthErrors.INVALID_TOKEN };
  }
};
