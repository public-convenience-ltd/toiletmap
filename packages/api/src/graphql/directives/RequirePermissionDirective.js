const {
  SchemaDirectiveVisitor,
  AuthenticationError,
} = require('apollo-server');
const { defaultFieldResolver } = require('graphql');

class RequirePermissionDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const { resolve = defaultFieldResolver } = field;
    const { requires } = this.args;
    field.resolve = async function(...args) {
      const [, , ctx] = args;
      if (ctx && ctx.user) {
        if (requires && !ctx.user.permissions.includes(requires)) {
          throw new AuthenticationError(
            'You are not authorized to view this resource.'
          );
        } else {
          const result = await resolve.apply(this, args);
          return result;
        }
      } else {
        throw new AuthenticationError(
          'You must be signed in to view this resource.'
        );
      }
    };
  }
}

module.exports = RequirePermissionDirective;
