import { eq } from 'drizzle-orm';
import { getDrizzleClient } from '../database/drizzleClient';
import {
  LocalizationMessageTable,
  type LocalizationMessage,
} from '../schema';

export const getLocalizationMessages = async (): Promise<
  LocalizationMessage[]
> => {
  const db = getDrizzleClient();
  return db.select().from(LocalizationMessageTable);
};

export const getLocalizationMessagesByLocale = async (
  locale: string,
): Promise<LocalizationMessage[]> => {
  const db = getDrizzleClient();
  return db
    .select()
    .from(LocalizationMessageTable)
    .where(eq(LocalizationMessageTable.locale, locale));
};

export const saveLocalizationMessage = async (
  message: LocalizationMessage,
): Promise<void> => {
  const db = getDrizzleClient();
  await db
    .insert(LocalizationMessageTable)
    .values(message)
    .onDuplicateKeyUpdate({ set: { value: message.value } });
};
