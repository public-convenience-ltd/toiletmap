import { AuthenticationError } from 'apollo-server-errors';
import { mapSchema, getDirective, MapperKind } from '@graphql-tools/utils';
import { GraphQLSchema, defaultFieldResolver } from 'graphql';

export default function authDirective(directiveName: string) {
  const typeDirectiveArgumentMaps: Record<string, any> = {};
  return {
    authDirectiveTypeDefs: `directive @${directiveName}(requires: Permission) on OBJECT | FIELD_DEFINITION

    enum Permission {
      SUBMIT_REPORT
      MODERATE_REPORT
      VIEW_CONTRIBUTOR_INFO
    }
    `,
    authDirectiveTransformer: (schema: GraphQLSchema) =>
      mapSchema(schema, {
        [MapperKind.TYPE]: (type) => {
          const authDirective = getDirective(schema, type, directiveName)?.[0];
          if (authDirective) {
            typeDirectiveArgumentMaps[type.name] = authDirective;
          }
          return undefined;
        },
        [MapperKind.OBJECT_FIELD]: (fieldConfig, _fieldName, typeName) => {
          const authDirective =
            getDirective(schema, fieldConfig, directiveName)?.[0] ??
            typeDirectiveArgumentMaps[typeName];
          if (authDirective) {
            const { requires } = authDirective;
            if (requires) {
              const { resolve = defaultFieldResolver } = fieldConfig;
              fieldConfig.resolve = function (source, args, context, info) {
                if (context && context.user) {
                  console.log(context.user[process.env.AUTH0_PERMISSIONS_KEY]);
                  if (
                    requires &&
                    !context.user[process.env.AUTH0_PERMISSIONS_KEY].includes(
                      requires
                    )
                  ) {
                    throw new AuthenticationError(
                      'You are not authorized to perform this operation.'
                    );
                  } else {
                    return resolve(source, args, context, info);
                  }
                } else {
                  throw new AuthenticationError(
                    'You must be signed in to perform this operation.'
                  );
                }
              };
              return fieldConfig;
            }
          }
        },
      }),
  };
}
