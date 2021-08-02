import { ApolloServer, gql } from 'apollo-server-micro';
import { makeExecutableSchema } from '@graphql-tools/schema';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

import settings from '../../api/config';

import resolvers from '../../api/resolvers';
import {
  RequirePermissionDirective,
  RedactionDirective,
} from '../../api/directives';

import typeDefs from '../../api/typeDefs';

const client = jwksClient({
  jwksUri: settings.auth0.jwksUri,
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
  audience: settings.auth0.audience,
  issuer: settings.auth0.issuer,
  algorithms: settings.auth0.algorithms,
};

// Add GraphQL API
const server = new ApolloServer({
  schema: makeExecutableSchema({
    typeDefs,
    resolvers,
    schemaDirectives: {
      auth: RequirePermissionDirective,
      redact: RedactionDirective,
    },
  }),
  context: async ({ req }) => {
    let user = null;
    const authorization = req.headers.authorization;
    if (authorization) {
      const token = authorization.replace('Bearer ', '');
      user = await new Promise((resolve, reject) => {
        jwt.verify(token, getKey, options, (err, decoded) => {
          if (err) {
            return reject(err);
          }
          resolve(decoded);
        });
      });
    }
    return {
      user,
    };
  },
  introspection: true,
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default server.createHandler({
  path: '/api',
});
