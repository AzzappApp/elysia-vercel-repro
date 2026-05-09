import { Elysia } from 'elysia';
import { availabilityCheck } from './availabilityCheck';
import { signinRoute } from './signin';
import { signupRoute } from './signup';
import { translationMessages } from './translationMessages';
import { users } from './users';

export const routes = new Elysia()
  .use(availabilityCheck)
  .use(signinRoute)
  .use(signupRoute)
  .use(translationMessages)
  .use(users);
