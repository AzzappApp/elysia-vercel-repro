import { eq } from 'drizzle-orm';
import { db } from '../database/database';
import { ProfileTable, type Profile } from '../schema';

export const getProfilesByUserId = async (
  userId: string,
): Promise<Profile[]> => {
  return db().select().from(ProfileTable).where(eq(ProfileTable.userId, userId));
};
