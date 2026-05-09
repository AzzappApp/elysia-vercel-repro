import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'mysql',
  schema: './src/schema.ts',
  out: './drizzle',
  dbCredentials: {
    host: process.env.DATABASE_HOST ?? 'aws.connect.psdb.cloud',
    user: process.env.DATABASE_USERNAME ?? 'fake-user',
    password: process.env.DATABASE_PASSWORD ?? 'fake-password',
    database: process.env.DATABASE_NAME ?? 'repro',
  },
});
