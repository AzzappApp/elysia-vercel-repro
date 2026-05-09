import { Elysia } from 'elysia';
import { availabilityCheck } from './availabilityCheck';
import { cover } from './cover';
import { graphql } from './graphql';
import { image } from './image';
import { inngest } from './inngest';
import { order } from './order';
import { signinRoute } from './signin';
import { signupRoute } from './signup';
import { translationMessages } from './translationMessages';
import { users } from './users';

export const routes = new Elysia()
  .use(availabilityCheck)
  .use(cover)
  .use(graphql)
  .use(image)
  .use(inngest)
  .use(order)
  .use(signinRoute)
  .use(signupRoute)
  .use(translationMessages)
  .use(users);
