import { fetch } from '@adobe/fetch';
import { Client } from '@planetscale/database';
import {
  drizzle,
  type PlanetScaleDatabase,
} from 'drizzle-orm/planetscale-serverless';
import env from '../env';

export type DrizzleDatabase = PlanetScaleDatabase;

// @adobe/fetch is a drop-in for the standard fetch at runtime, but its types
// don't strictly match — we cast through unknown to keep it simple.
const databaseFetch = ((input: unknown, init: unknown) =>
  (fetch as unknown as (i: unknown, n: unknown) => Promise<unknown>)(
    input,
    init,
  )) as never;

let cached: DrizzleDatabase | undefined;

export const getDrizzleClient = (): DrizzleDatabase => {
  if (cached) return cached;
  const connection = new Client({
    host: env.DATABASE_HOST,
    username: env.DATABASE_USERNAME,
    password: env.DATABASE_PASSWORD,
    fetch: databaseFetch,
  });
  cached = drizzle(connection) as DrizzleDatabase;
  return cached;
};
