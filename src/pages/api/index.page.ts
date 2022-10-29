import jwt, { VerifyOptions } from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { getSession } from '@auth0/nextjs-auth0';
import Cors from 'cors';
import redactedDirective from '../../api/directives/redactedDirective';
import authDirective from '../../api/directives/authDirective';
import schema from '../../api-client/schema';
import { createServer } from '@graphql-yoga/node';
import {
  createInMemoryCache,
  defaultBuildResponseCacheKey,
  useResponseCache,
} from '@envelop/response-cache';
import Redis from 'ioredis';
import { createRedisCache } from '@envelop/response-cache-redis';
import { context } from '../../api/context';

const setupCache = () => {
  if (process.env.ENABLE_REDIS_CACHE !== 'true') {
    return createInMemoryCache();
  }

  const port = process.env.REDIS_PORT
    ? parseInt(process.env.REDIS_PORT, 10)
    : 11345;

  const redis = new Redis({
    host: process.env.REDIS_URI,
    username: 'default',
    port,
    password: process.env.REDIS_PASSWORD,
    tls: process.env.REDIS_SSL_ENABLED === 'true' ? {} : undefined,
  });

  return createRedisCache({ redis });
};

const cache = setupCache();

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

export const server = createServer({
  endpoint: '/api',
  schema: finalSchema,
  context: async ({ req, res }) => {
    const revalidate = req.headers.referer.indexOf('message=') > -1;
    let user = null;
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
      revalidate,
      prisma: context.prisma,
    };
  },
  plugins: [
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useResponseCache({
      enabled: (context) => !context?.user || !context?.revalidate,
      session: () => null,
      cache,
      ttl: 60 * 1000 * 60 * 6, // cache tiles for 6 hours
      buildResponseCacheKey: async (params) => {
        const geohash = params.variableValues?.geohash;
        // prefer the VERCEL_URL env variable so cache is unique for each staging deploy
        // otherwise we share the cache between production instances so it is retained
        // between deploys.
        const env =
          process.env.VERCEL_ENV !== 'production'
            ? process.env.VERCEL_URL ?? process.env.NODE_ENV
            : 'production';

        if (geohash) {
          return `${env}-maptile-${geohash}`;
        }

        return await defaultBuildResponseCacheKey(params);
      },
    }),
  ],
});

export const config = {
  api: {
    bodyParser: false,
  },
};

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
  return server(req, res);
}

export default handler;
