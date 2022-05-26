import { mapSchema, getDirective, MapperKind } from '@graphql-tools/utils';
import { GraphQLSchema, defaultFieldResolver } from 'graphql';
import checkRole from './checkRole'

export default function redactedDirective(directiveName: string) {
  return {
    redactedDirectiveTypeDefs: `directive @${directiveName}(requires: Permission, replace: String) on FIELD_DEFINITION`,
    redactedDirectiveTransformer: (schema: GraphQLSchema) =>
      mapSchema(schema, {
        [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
          const redactedDirective = getDirective(
            schema,
            fieldConfig,
            directiveName
          )?.[0];
          if (redactedDirective) {
            const { resolve = defaultFieldResolver } = fieldConfig;
            const requires = redactedDirective['requires'];
            const replace = redactedDirective['replace'];
            fieldConfig.resolve = async function (...args) {
              const [, , ctx] = args;
              if (ctx && ctx.user) {
                if (!checkRole(ctx.user, requires)) {
                  return replace;
                } else {
                  const result = await resolve.apply(this, args);
                  return result;
                }
              } else {
                return replace;
              }
            };
            return fieldConfig;
          }
        },
      }),
  };
}
