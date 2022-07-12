import { ApolloServer } from 'apollo-server-micro';
import { withSentry } from '@sentry/nextjs';
import responseCachePlugin from 'apollo-server-plugin-response-cache';
import jwt, { VerifyOptions } from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { getSession } from '@auth0/nextjs-auth0';
import Cors from 'cors';
import redactedDirective from '../../api/directives/redactedDirective';
import authDirective from '../../api/directives/authDirective';
import schema from '../../api-client/schema';
import Keyv from 'keyv';
import KeyvRedis from '@keyv/redis';
import { KeyvAdapter } from '@apollo/utils.keyvadapter';

const client = jwksClient({
  jwksUri: `${process.env.AUTH0_ISSUER_BASE_URL}.well-known/jwks.json`,
});

function getKey(header, cb) {
  client.getSigningKey(header.kid, function (err, key) {
    const signingKey = key['publicKey'] || key['rsaPublicKey'];
    cb(null, signingKey);
  });
}

const options: VerifyOptions = {
  audience: process.env.AUTH0_AUDIENCE,
  issuer: process.env.AUTH0_ISSUER_BASE_URL,
  algorithms: ['RS256'],
};

// Add GraphQL API
const finalSchema = schema(authDirective, redactedDirective);

// Compute a unique key specific to application instance given a geohash
// This is used to cache each geohash tile that is loaded by users
// .. and later delete it if we want to refresh the tile
const cacheKeyFromGeohash = (geohash: string) =>
  `${process.env?.VERCEL_URL ?? 'local'}—${process.env?.NODE_ENV}—${geohash}`;

const cacheStrategy = process.env.REDIS_URI
  ? new KeyvAdapter(
      new Keyv({
        store: new KeyvRedis(
          `redis://default:${process.env.REDIS_PASSWORD}@${process.env.REDIS_URI}`
        ),
      }),
      { disableBatchReads: true }
    )
  : undefined;

export const server = new ApolloServer({
  schema: finalSchema,
  cache: cacheStrategy ?? 'bounded',
  persistedQueries: false,
  context: async ({ req, res }) => {
    let user = null;
    const invalidateCache = req.headers?.invalidatecache === 'true';
    try {
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
        const session = getSession(req, res);
        if (session) {
          user = session.user;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return {
      user,
      invalidateCache,
    };
  },
  introspection: true,
  plugins: [
    responseCachePlugin({
      generateCacheKey: ({ request, queryHash }) => {
        const geohash = request.variables?.geohash;
        if (geohash) {
          return cacheKeyFromGeohash(geohash);
        }
        return queryHash;
      },
      shouldReadFromCache: async ({ context, cache, request }) => {
        if (!!context?.user && context?.invalidateCache) {
          const geohash = request.variables?.geohash;
          if (geohash) {
            await cache.delete(cacheKeyFromGeohash(geohash));
          }
          return false;
        }
        return true;
      },
    }),
  ],
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
  origin: [
    'https://explorer.toiletmap.org.uk',
    'https://studio.apollographql.com',
    'http://localhost:6006',
    'http://localhost:3000',
    'http://localhost:3001',
  ],
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

async function handler(req, res) {
  await runMiddleware(req, res, cors);

  await startServer;
  await server.createHandler({
    path: '/api',
  })(req, res);
}

export default process.env.VERCEL_ENV === 'production'
  ? withSentry(handler)
  : handler;
