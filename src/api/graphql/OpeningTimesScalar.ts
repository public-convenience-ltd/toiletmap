import { ApolloError } from 'apollo-server-core';
import { GraphQLScalarType } from 'graphql';
import { Kind } from 'graphql/language';

const astToOpeningTimes = (ast) => {
  if (ast.kind !== Kind.LIST) {
    throw new ApolloError(
      'Type OpeningTimes must be an array',
      'OPENING_TIMES'
    );
  }

  const traverseValues = (values) =>
    values.map((item) => {
      if (item.values) {
        return traverseValues(item.values);
      }

      return item.value;
    });

  return traverseValues(ast.values);
};

const validateOpeningTimes = (value) => {
  if (value.length !== 7) {
    throw new ApolloError(
      'Type OpeningTimes must be an array of length 7',
      'OPENING_TIMES'
    );
  }

  const elementsAreValid = value.every((item) => {
    const isClosed = Array.isArray(item) && item.length === 0;

    const isArrayOfTimes =
      Array.isArray(item) &&
      item.length === 2 &&
      item.every((item) => {
        if (typeof item !== 'string') {
          return false;
        }

        const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/; // 09:00
        const found = item.match(timeRegex);

        return Boolean(found && found.length);
      });

    return isClosed || isArrayOfTimes;
  });

  if (!elementsAreValid) {
    throw new ApolloError(
      'Type OpeningTimes must be an array of [] or ["XX:XX", "XX:XX"] elements',
      'OPENING_TIMES'
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
