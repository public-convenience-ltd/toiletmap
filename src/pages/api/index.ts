import { ApolloServer } from 'apollo-server-micro';
import responseCachePlugin from 'apollo-server-plugin-response-cache';
import { makeExecutableSchema } from '@graphql-tools/schema';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { getSession } from '@auth0/nextjs-auth0';
import Cors from 'cors';

import resolvers from '../../api/resolvers';
import authDirective from '../../api/directives/authDirective';
import redactedDirective from '../../api/directives/redactedDirective';
import typeDefs from '../../api/typeDefs';

const client = jwksClient({
  jwksUri: `${process.env.AUTH0_ISSUER_BASE_URL}/.well-known/jwks.json`,
});

const { dbConnect } = require('../../api/db');

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

export let schema = makeExecutableSchema({
  typeDefs: [redactedDirectiveTypeDefs, authDirectiveTypeDefs, typeDefs],
  resolvers,
});
schema = redactedDirectiveTransformer(schema);
schema = authDirectiveTransformer(schema);

// Add GraphQL API
export const server = new ApolloServer({
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
  plugins: [responseCachePlugin()],
});

export const config = {
  api: {
    bodyParser: false,
  },
};

const startServer = server.start();

// Initializing the cors middleware
const cors = Cors({
  methods: ['GET', 'HEAD', 'POST'],
  origin: 'https://studio.apollographql.com',
});

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }

      return resolve(result);
    });
  });
}

export default async function handler(req, res) {
  await runMiddleware(req, res, cors);
  // We'll need a mongodb connection
  await dbConnect();
  await startServer;
  await server.createHandler({
    path: '/api',
  })(req, res);
}
