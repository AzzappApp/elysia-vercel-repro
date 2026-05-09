import { parsePhoneNumberFromString } from 'libphonenumber-js';

export const normalizePhoneNumber = (raw: string): string | null => {
  const parsed = parsePhoneNumberFromString(raw);
  return parsed?.isValid() ? parsed.number : null;
};
