import { getExecutableSchema } from '@lola-tech/graphql-kimera';
import { v4 as uuid } from 'uuid';
import { loader } from 'graphql.macro';

const typeDefs = loader('./typeDefs.graphql');

const executableSchema = getExecutableSchema({
  typeDefs,
  mockProvidersFn: (context) => ({
    builders: {
      Report: () => ({
        previous: null,
      }),
      Loo: () => ({
        id: uuid(),
        name: 'A Test Toilet',
        location: {
          lat: 51.507351,
          lng: -0.127758,
        },
        reports: null,
        openingTimes: null,
        babyChange: false,
        accessible: null,
      }),
    },
  }),
});

export default executableSchema;
