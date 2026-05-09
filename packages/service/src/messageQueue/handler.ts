import { Inngest } from 'inngest';
import { serve } from 'inngest/edge';

export const inngestClient = new Inngest({ id: 'repro-api' });

const onSignup = inngestClient.createFunction(
  {
    id: 'on-user-signup',
    triggers: [{ event: 'user/signed_up' }],
  },
  async ({ event }) => ({
    received: (event.data as { userId?: string }).userId,
  }),
);

const createInngestHandler = () =>
  serve({
    client: inngestClient,
    functions: [onSignup],
  });

export default createInngestHandler;

export const sendEvent = async (
  name: string,
  data: Record<string, unknown>,
): Promise<void> => {
  await inngestClient.send({ name, data });
};
