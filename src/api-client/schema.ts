const schema = (authDirective, redactedDirective) => {
  const typeDefs = require('../api/typeDefs');
  const resolvers = require('../api/resolvers');

  const { makeExecutableSchema } = require('@graphql-tools/schema');

  // Build our executable schema and apply our custom directives
  const { redactedDirectiveTypeDefs, redactedDirectiveTransformer } =
    redactedDirective('redact');
  const { authDirectiveTypeDefs, authDirectiveTransformer } =
    authDirective('auth');

  return authDirectiveTransformer(
    redactedDirectiveTransformer(
      makeExecutableSchema({
        typeDefs: [
          redactedDirectiveTypeDefs,
          authDirectiveTypeDefs,
          typeDefs.default,
        ],
        resolvers,
      })
    )
  );
};

export default schema;
