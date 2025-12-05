import { GraphQLScalarType, Kind } from 'graphql';

const GraphQLDateTime = new GraphQLScalarType({
    name: 'DateTime',
    description: 'A date-time string at UTC in ISO 8601 format',
    serialize(value: unknown): string {
        if (value instanceof Date) {
            return value.toISOString();
        }
        if (typeof value === 'string') {
            return value;
        }
        throw new Error('DateTime cannot represent non Date type');
    },
    parseValue(value: unknown): Date {
        if (typeof value === 'string') {
            return new Date(value);
        }
        if (value instanceof Date) {
            return value;
        }
        throw new Error('DateTime cannot represent non string type');
    },
    parseLiteral(ast): Date {
        if (ast.kind === Kind.STRING) {
            return new Date(ast.value);
        }
        throw new Error('DateTime can only parse string values');
    },
});

export { GraphQLDateTime };
