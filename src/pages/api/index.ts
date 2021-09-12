import { ApolloServer } from 'apollo-server-micro';
import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core';
import { makeExecutableSchema } from '@graphql-tools/schema';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { getSession } from '@auth0/nextjs-auth0';

import resolvers from '../../api/resolvers';
import authDirective from '../../api/directives/authDirective';
import redactedDirective from '../../api/directives/redactedDirective';

import typeDefs from '../../api/typeDefs';

const client = jwksClient({
  jwksUri: `${process.env.AUTH0_ISSUER_BASE_URL}/.well-known/jwks.json`,
});

const { connect } = require('../../api/db');
connect(process.env.MONGODB_URI);

function getKey(header, cb) {
  client.getSigningKey(header.kid, function (err, key) {
    var signingKey = key.publicKey || key.rsaPublicKey;
    cb(null, signingKey);
  });
}

const options = {
  audience: process.env.AUTH0_AUDIENCE,
  issuer: process.env.AUTH0_ISSUER_BASE_URL,
  algorithms: ['RS256'],
};

// Build our executable schema and apply our custom directives
const { redactedDirectiveTypeDefs, redactedDirectiveTransformer } =
  redactedDirective('redact');
const { authDirectiveTypeDefs, authDirectiveTransformer } =
  authDirective('auth');
let schema = makeExecutableSchema({
  typeDefs: [redactedDirectiveTypeDefs, authDirectiveTypeDefs, typeDefs],
  resolvers,
});
schema = redactedDirectiveTransformer(schema);
schema = authDirectiveTransformer(schema);

// Add GraphQL API
const server = new ApolloServer({
  schema,
  context: async ({ req, res }) => {
    let user = null;
    // Support auth by header (legacy SPA and third-party apps)
    if (req.headers.authorization) {
      const token = req.headers.authorization.replace('Bearer ', '');
      user = await new Promise((resolve, reject) => {
        jwt.verify(token, getKey, options, (err, decoded) => {
          if (err) {
            return reject(err);
          }
          resolve(decoded);
        });
      });
    } else {
      // We might have a session on toiletmap.org.uk
      let session = getSession(req, res);
      if (session) {
        user = session.user;
      }
    }

    return {
      user,
    };
  },
  introspection: true,
  plugins: [
    ApolloServerPluginLandingPageGraphQLPlayground({
      settings: {
        'request.credentials': 'same-origin',
      },
      tabs: [
        {
          endpoint: '/api',
          name: 'Nearby Loos Query',
          query:
            'query loosNearNeontribe {\n\tloosByProximity(from: {lat: 52.6335, lng: 1.2953, maxDistance: 500}) {\n\t\tid\n\t\tname\n\t}\n}',
        },
      ],
    }),
  ],
});

export const config = {
  api: {
    bodyParser: false,
  },
};

const startServer = server.start();

export default async function handler(req, res) {
  await startServer;
  await server.createHandler({
    path: '/api',
  })(req, res);
}
