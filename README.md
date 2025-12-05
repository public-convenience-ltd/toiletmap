# Toiletmap API

Standalone GraphQL API for the Toilet Map.

## Overview

This is a backend-only GraphQL API that serves toilet location data. It uses:

- **graphql-yoga** - GraphQL server
- **Prisma** - Database ORM for PostgreSQL with PostGIS
- **Auth0** - JWT authentication for mutations

## Prerequisites

- Node.js >= 20
- PostgreSQL with PostGIS extension
- pnpm (or npm/yarn)

## Setup

1. **Install dependencies**

   ```bash
   pnpm install
   ```

2. **Configure environment**

   Copy `.env.example` to `.env` and fill in your values:

   ```bash
   cp .env.example .env
   ```

3. **Generate Prisma client**

   ```bash
   pnpm prisma:generate
   ```

4. **Start development server**

   ```bash
   pnpm dev
   ```

   The API will be available at `http://localhost:4000/graphql`

## API Endpoints

### GraphQL

- **URL**: `/graphql`
- **Methods**: `GET`, `POST`
- **GraphQL Playground**: Navigate to `/graphql` in your browser

### Example Queries

**Get toilets in a geohash area:**

```graphql
query {
  loosByGeohash(geohash: "gcpv") 
}
```

**Get a specific toilet:**

```graphql
query {
  loo(id: "your-toilet-id") {
    id
    name
    location {
      lat
      lng
    }
    accessible
    babyChange
  }
}
```

**Search toilets:**

```graphql
query {
  loos(filters: { active: true }, pagination: { limit: 10, page: 1 }) {
    loos {
      id
      name
    }
    total
    pages
  }
}
```

## Authentication

Mutations require a valid Auth0 JWT token:

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"query": "mutation { submitReport(report: {...}) { success } }"}'
```

## Scripts

- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm test` - Run integration tests
- `pnpm test:watch` - Run tests in watch mode
- `pnpm codegen` - Generate GraphQL types
- `pnpm prisma:generate` - Generate Prisma client
- `pnpm check` - Type check without emitting

## Testing

The API includes a comprehensive integration test suite using Vitest:

```bash
pnpm test        # Run all tests
pnpm test:watch  # Run tests in watch mode
```

**Test Coverage:**

- **Query tests** - Verify all GraphQL queries (areas, loos, loosByGeohash, etc.)
- **Mutation tests** - Test authentication and authorization for mutations
- **Schema tests** - Validate schema introspection and input validation
- **Utility tests** - Test loo compression/decompression utilities

## Project Structure

```
src/
├── index.ts              # Server entry point
├── __tests__/            # Integration tests
│   ├── test-utils.ts     # Test utilities
│   ├── queries.test.ts   # Query tests
│   ├── mutations.test.ts # Mutation tests
│   ├── schema.test.ts    # Schema tests
│   └── loo-compression.test.ts
├── api/
│   ├── schema.graphql    # GraphQL schema
│   ├── graphql/
│   │   ├── context.ts    # GraphQL context
│   │   ├── helpers.ts    # Utility functions
│   │   ├── resolvers.ts  # Query/Mutation resolvers
│   │   ├── DateTimeScalar.ts
│   │   └── OpeningTimesScalar.ts
│   ├── directives/
│   │   ├── authDirective.ts
│   │   └── checkRole.ts
│   └── prisma/
│       ├── prisma.ts     # Prisma client singleton
│       └── queries.ts    # Database queries
├── lib/
│   ├── filter.ts         # Filter utilities
│   └── loo.ts            # Loo compression utilities
└── @types/
    └── resolvers-types.ts # Generated GraphQL types
```

## License

MIT
