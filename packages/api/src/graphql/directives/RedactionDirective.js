const { SchemaDirectiveVisitor } = require('apollo-server');
const { defaultFieldResolver } = require('graphql');

class RedactionDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const { resolve = defaultFieldResolver } = field;
    const { requires, replace } = this.args;
    field.resolve = async function(...args) {
      const [, , ctx] = args;
      if (ctx && ctx.user) {
        if (requires && !ctx.user.permissions.includes(requires)) {
          return replace;
        } else {
          const result = await resolve.apply(this, args);
          return result;
        }
      } else {
        return replace;
      }
    };
  }
}

module.exports = RedactionDirective;
