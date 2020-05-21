const { ApolloServer, gql } = require('apollo-server');
const { createTestClient } = require('apollo-server-testing');
const mongoose = require('mongoose');
const { connect } = require('../db');

const typeDefs = require('../typeDefs');
const resolvers = require('../resolvers');
const {
  RequirePermissionDirective,
  RedactionDirective,
} = require('../directives');

let client;
beforeAll(async () => {
  await connect(process.env.MONGO_URL);
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    schemaDirectives: {
      auth: RequirePermissionDirective,
      redact: RedactionDirective,
    },
    context: async () => ({
      user: {
        'https://toiletmap.org.uk/permissions': ['SUBMIT_REPORT'],
        'https://toiletmap.org.uk/profile': {
          nickname: 'Test Editor',
        },
      },
    }),
  });
  client = createTestClient(server);
});

test('creating a report creates a loo, which can be fetched by ID', async () => {
  const m = await client.mutate({
    mutation: gql`
      mutation updateLoo($location: PointInput!, $name: String) {
        submitReport(report: { location: $location, name: $name }) {
          success
          loo {
            id
            name
          }
        }
      }
    `,
    variables: {
      location: { lat: 1, lng: 1 },
      name: 'Test',
    },
  });

  expect(m.data.submitReport.success).toBe(true);
  expect(m.data.submitReport.loo.name).toBe('Test');
  let looId = m.data.submitReport.loo.id;

  const q = await client.query({
    query: gql`
      query findLooById($id: ID) {
        loo(id: $id) {
          name
        }
      }
    `,
    variables: {
      id: looId,
    },
  });
  expect(q.data.loo.name).toBe('Test');
});

afterAll(async () => {
  await mongoose.connection.close();
});
