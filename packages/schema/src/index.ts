import {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLNonNull,
} from 'graphql';
import { globalIdField } from 'graphql-relay';
import { getUserById } from '@repro/data';
import { computeOrderTotal } from '@repro/payment';
import { signin } from '@repro/service/userServices';
import { CommonErrors } from '@repro/shared/errors';

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: {
    id: globalIdField('User'),
    email: { type: GraphQLString },
  },
});

export const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      user: {
        type: UserType,
        args: { id: { type: new GraphQLNonNull(GraphQLString) } },
        resolve: async (_root, { id }) => getUserById(id as string),
      },
      previewTotal: {
        type: GraphQLString,
        args: {
          userId: { type: new GraphQLNonNull(GraphQLString) },
          amount: { type: new GraphQLNonNull(GraphQLString) },
        },
        resolve: async (_root, { userId, amount }) => {
          const result = await computeOrderTotal(
            userId as string,
            Number(amount),
            0.2,
          );
          return result.ok ? result.total : CommonErrors.NOT_FOUND;
        },
      },
      signinPreview: {
        type: GraphQLString,
        args: {
          email: { type: new GraphQLNonNull(GraphQLString) },
          password: { type: new GraphQLNonNull(GraphQLString) },
        },
        resolve: async (_root, { email, password }) => {
          const result = await signin({
            email: email as string,
            password: password as string,
          });
          return result.ok ? result.user.id : null;
        },
      },
    },
  }),
});
