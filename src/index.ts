import { createYoga } from 'graphql-yoga';
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import jwt, { VerifyOptions } from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import * as resolvers from './api/graphql/resolvers';
import authDirective from './api/directives/authDirective';
import { context, JWTUser } from './api/graphql/context';
import { makeExecutableSchema } from '@graphql-tools/schema';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load GraphQL schema from file
const typeDefs = readFileSync(
  join(__dirname, 'api', 'schema.graphql'),
  'utf-8'
);

// JWKS Client for Auth0 token verification
const client = jwksClient({
  jwksUri: `${process.env.AUTH0_ISSUER_BASE_URL}.well-known/jwks.json`,
});

function getKey(
  header: jwt.JwtHeader,
  cb: (err: Error | null, key?: string) => void
) {
  client.getSigningKey(header.kid, function (err, key) {
    if (err) {
      cb(err);
      return;
    }
    const signingKey = key?.getPublicKey();
    cb(null, signingKey);
  });
}

const jwtOptions: VerifyOptions = {
  audience: process.env.AUTH0_AUDIENCE,
  issuer: process.env.AUTH0_ISSUER_BASE_URL,
  algorithms: ['RS256'],
};

// Build the GraphQL schema with auth directive
const { authDirectiveTypeDefs, authDirectiveTransformer } =
  authDirective('auth');

const schema = authDirectiveTransformer(
  makeExecutableSchema({
    typeDefs: [authDirectiveTypeDefs, typeDefs],
    resolvers,
  })
);

// CORS configuration
const allowedOrigins = [
  'https://explorer.toiletmap.org.uk',
  'https://toiletmap-next-ui.vercel.app',
  'https://studio.apollographql.com',
  'http://localhost:6006',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:8080',
];

// Create Yoga instance
const yoga = createYoga({
  schema,
  graphqlEndpoint: '/graphql',
  context: async ({ request }) => {
    let user: JWTUser | null = null;

    try {
      const authHeader = request.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.replace('Bearer ', '');

        user = await new Promise((resolve, reject) => {
          jwt.verify(token, getKey, jwtOptions, (err, decoded) => {
            if (err) {
              return reject(err);
            }
            resolve(decoded as JWTUser);
          });
        });
      }
    } catch (e) {
      console.error('Auth error:', e);
    }

    return {
      user,
      prisma: context.prisma,
    };
  },
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'HEAD', 'POST', 'OPTIONS'],
    credentials: true,
  },
});

const port = parseInt(process.env.PORT || '4000', 10);

const server = createServer(yoga);

server.listen(port, () => {
  console.log(`🚀 GraphQL API server ready at http://localhost:${port}/graphql`);
});
