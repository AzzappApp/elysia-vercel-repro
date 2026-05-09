import { Elysia } from 'elysia';
import { availabilityCheck } from './availabilityCheck';
import { cover } from './cover';
import { image } from './image';
import { signinRoute } from './signin';
import { signupRoute } from './signup';
import { translationMessages } from './translationMessages';
import { users } from './users';

export const routes = new Elysia()
  .use(availabilityCheck)
  .use(cover)
  .use(image)
  .use(signinRoute)
  .use(signupRoute)
  .use(translationMessages)
  .use(users);
