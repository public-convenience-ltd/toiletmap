import Cors from 'cors';
import { createYoga } from 'graphql-yoga';
import jwt, { VerifyOptions } from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import schema from '../../api-client/schema';
import authDirective from '../../api/directives/authDirective';
import { context } from '../../api/graphql/context';
import { auth0 } from '../../lib/auth0';

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
const finalSchema = schema(authDirective);

export const server = createYoga({
  graphqlEndpoint: '/api',
  schema: finalSchema,
  // @ts-expect-error -- req is there.
  context: async ({ req }) => {
    const revalidate = req.headers.referer?.indexOf('message=') > -1;
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
        const session = await auth0.getSession(req);
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
    'https://toiletmap-next-ui.vercel.app',
    'https://studio.apollographql.com',
    'http://localhost:6006',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:8080',
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
