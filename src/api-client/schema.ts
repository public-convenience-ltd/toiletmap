/* eslint-disable @typescript-eslint/no-var-requires */
const { makeExecutableSchema } = require('@graphql-tools/schema');
import typeDefs from '../api/schema.graphql';
import * as resolvers from '../api/resolvers';

const schema = (authDirective) => {
  // Build our executable schema and apply our custom directives
  const { authDirectiveTypeDefs, authDirectiveTransformer } =
    authDirective('auth');

  return authDirectiveTransformer(
    makeExecutableSchema({
      typeDefs: [authDirectiveTypeDefs, typeDefs],
      resolvers,
    })
  );
};

export default schema;
