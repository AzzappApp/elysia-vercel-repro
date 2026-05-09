import { eq } from 'drizzle-orm';
import { getDrizzleClient } from '../database/drizzleClient';
import { ProfileTable, type Profile } from '../schema';

export const getProfilesByUserId = async (
  userId: string,
): Promise<Profile[]> => {
  const db = getDrizzleClient();
  return db.select().from(ProfileTable).where(eq(ProfileTable.userId, userId));
};
