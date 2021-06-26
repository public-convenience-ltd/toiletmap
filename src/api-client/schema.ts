/* eslint-disable @typescript-eslint/no-var-requires */
const { makeExecutableSchema } = require('@graphql-tools/schema');
import typeDefs from '../api/schema.graphql';
import * as resolvers from '../api/resolvers';

const schema = (authDirective, redactedDirective) => {
  // Build our executable schema and apply our custom directives
  const { redactedDirectiveTypeDefs, redactedDirectiveTransformer } =
    redactedDirective('redact');
  const { authDirectiveTypeDefs, authDirectiveTransformer } =
    authDirective('auth');

  return authDirectiveTransformer(
    redactedDirectiveTransformer(
      makeExecutableSchema({
        typeDefs: [redactedDirectiveTypeDefs, authDirectiveTypeDefs, typeDefs],
        resolvers,
      })
    )
  );
};

export default schema;
