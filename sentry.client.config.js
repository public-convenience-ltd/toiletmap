// This file configures the initialization of Sentry on the browser.
// The config you add here will be used whenever a page is visited.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn:
    SENTRY_DSN ||
    'https://6935d02f879c4536aecfe8fa07ae1d3a@o1270901.ingest.sentry.io/6462188',
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 0.25,
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV || 'development',
  enabled: process.env.NEXT_PUBLIC_VERCEL_ENV === 'production',
  // ...
  // Note: if you want to override the automatic release value, do not set a
  // `release` value here - use the environment variable `SENTRY_RELEASE`, so
  // that it will also get attached to your source maps
});
