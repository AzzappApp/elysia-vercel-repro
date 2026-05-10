import { eq } from 'drizzle-orm';
import pickBy from 'lodash/pickBy';
import { db } from '../database/database';
import { UserTable, type NewUser, type User } from '../schema';

export const getUserById = async (id: string): Promise<User | null> => {
  const rows = await db()
    .select()
    .from(UserTable)
    .where(eq(UserTable.id, id))
    .limit(1);
  return rows[0] ?? null;
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  const rows = await db()
    .select()
    .from(UserTable)
    .where(eq(UserTable.email, email))
    .limit(1);
  return rows[0] ?? null;
};

export const insertUser = async (newUser: NewUser): Promise<void> => {
  const cleaned = pickBy(newUser, value => value != null) as NewUser;
  await db().insert(UserTable).values(cleaned);
};
