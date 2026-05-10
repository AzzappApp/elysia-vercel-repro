import { eq } from 'drizzle-orm';
import { db } from '../database/database';
import {
  LocalizationMessageTable,
  type LocalizationMessage,
} from '../schema';

export const getLocalizationMessages = async (): Promise<
  LocalizationMessage[]
> => {
  return db().select().from(LocalizationMessageTable);
};

export const getLocalizationMessagesByLocale = async (
  locale: string,
): Promise<LocalizationMessage[]> => {
  return db()
    .select()
    .from(LocalizationMessageTable)
    .where(eq(LocalizationMessageTable.locale, locale));
};

export const saveLocalizationMessage = async (
  message: LocalizationMessage,
): Promise<void> => {
  await db()
    .insert(LocalizationMessageTable)
    .values(message)
    .onDuplicateKeyUpdate({ set: { value: message.value } });
};
