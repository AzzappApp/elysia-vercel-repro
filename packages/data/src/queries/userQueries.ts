import { eq } from 'drizzle-orm';
import pickBy from 'lodash/pickBy';
import { getDrizzleClient } from '../database/drizzleClient';
import { UserTable, type NewUser, type User } from '../schema';

export const getUserById = async (id: string): Promise<User | null> => {
  const db = getDrizzleClient();
  const rows = await db
    .select()
    .from(UserTable)
    .where(eq(UserTable.id, id))
    .limit(1);
  return rows[0] ?? null;
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  const db = getDrizzleClient();
  const rows = await db
    .select()
    .from(UserTable)
    .where(eq(UserTable.email, email))
    .limit(1);
  return rows[0] ?? null;
};

export const insertUser = async (newUser: NewUser): Promise<void> => {
  const db = getDrizzleClient();
  // Strip nulls/undefined defensively — exercises a lodash subpath import.
  const cleaned = pickBy(newUser, value => value != null) as NewUser;
  await db.insert(UserTable).values(cleaned);
};
