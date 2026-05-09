import { Elysia } from 'elysia';
import { logEvent } from '@repro/service/loggerService';

export const cron = new Elysia().get('/cron/heartbeat', () => {
  logEvent('cron-runs', { task: 'heartbeat', timestamp: Date.now() });
  return { ok: true };
});
