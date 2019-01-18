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

  visitObject(type) {
    this.ensureFieldsWrapped(type);
    type._requiredAuthRole = this.args.requires;
  }

  // Visitor methods for nested types like fields and arguments
  // also receive a details object that provides information about
  // the parent and grandparent types.
  visitFieldDefinition(field, details) {
    this.ensureFieldsWrapped(details.objectType);
    field._requiredAuthRole = this.args.requires;
  }

  ensureFieldsWrapped(objectType) {
    // Mark the GraphQLObjectType object to avoid re-wrapping:
    if (objectType._authFieldsWrapped) return;
    objectType._authFieldsWrapped = true;

    const fields = objectType.getFields();

    Object.keys(fields).forEach(fieldName => {
      const field = fields[fieldName];
      const { resolve = defaultFieldResolver } = field;
      field.resolve = async function(...args) {
        // Get the required Role from the field first, falling back
        // to the objectType if no Role is required by the field:
        const requiredRole =
          field._requiredAuthRole || objectType._requiredAuthRole;
        if (!requiredRole) {
          return resolve.apply(this, args);
        }

        const [, , ctx] = args;
        if (ctx && ctx.user) {
          if (requiredRole && !ctx.user.permissions.includes(requiredRole)) {
            throw new AuthenticationError(
              'You are not authorized to perform this operation.'
            );
          } else {
            return resolve.apply(this, args);
          }
        } else {
          throw new AuthenticationError(
            'You must be signed in to perform this operation.'
          );
        }
      };
    });
  }
}

module.exports = RequirePermissionDirective;
