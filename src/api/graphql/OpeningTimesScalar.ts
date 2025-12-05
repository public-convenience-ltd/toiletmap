import { GraphQLError, GraphQLScalarType, Kind, ValueNode } from 'graphql';

const astToOpeningTimes = (ast: ValueNode): unknown[] => {
  if (ast.kind !== Kind.LIST) {
    throw new GraphQLError('Type OpeningTimes must be an array', {
      extensions: { code: 'BAD_USER_INPUT' },
    });
  }

  const traverseValues = (values: readonly ValueNode[]): unknown[] =>
    values.map((item) => {
      if (item.kind === Kind.LIST) {
        return traverseValues(item.values);
      }
      if ('value' in item) {
        return (item as { value: unknown }).value;
      }
      return null;
    });

  return traverseValues(ast.values);
};

const validateOpeningTimes = (value: unknown): unknown => {
  if (!Array.isArray(value) || value.length !== 7) {
    throw new GraphQLError('Type OpeningTimes must be an array of length 7', {
      extensions: { code: 'BAD_USER_INPUT' },
    });
  }

  const elementsAreValid = value.every((item) => {
    const isClosed = Array.isArray(item) && item.length === 0;

    const isArrayOfTimes =
      Array.isArray(item) &&
      item.length === 2 &&
      item.every((timeItem) => {
        if (typeof timeItem !== 'string') {
          return false;
        }

        const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/; // 09:00
        const found = timeItem.match(timeRegex);

        return Boolean(found && found.length);
      });

    return isClosed || isArrayOfTimes;
  });

  if (!elementsAreValid) {
    throw new GraphQLError(
      'Type OpeningTimes must be an array of [] or ["XX:XX", "XX:XX"] elements',
      { extensions: { code: 'BAD_USER_INPUT' } }
    );
  }

  return value;
};

const OpeningTimesScalar = new GraphQLScalarType({
  name: 'OpeningTimes',
  description:
    'An array of 7 elements in which each represent a day\'s opening times. Each element can be either an empty array (closed) or an array of opening and closing times ["09:00", "17:00"]',
  serialize: validateOpeningTimes,
  parseValue: validateOpeningTimes,
  parseLiteral: (ast) => validateOpeningTimes(astToOpeningTimes(ast)),
});

export default OpeningTimesScalar;
