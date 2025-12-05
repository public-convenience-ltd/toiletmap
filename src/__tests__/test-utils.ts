/**
 * Test utilities for GraphQL API integration tests
 */

import { createYoga } from 'graphql-yoga';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { makeExecutableSchema } from '@graphql-tools/schema';
import * as resolvers from '../api/graphql/resolvers';
import authDirective from '../api/directives/authDirective';
import { JWTUser } from '../api/graphql/context';
import { PrismaClient } from '@prisma/client';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load GraphQL schema from file
const typeDefs = readFileSync(
    join(__dirname, '..', 'api', 'schema.graphql'),
    'utf-8'
);

// Build the GraphQL schema with auth directive
const { authDirectiveTypeDefs, authDirectiveTransformer } =
    authDirective('auth');

const schema = authDirectiveTransformer(
    makeExecutableSchema({
        typeDefs: [authDirectiveTypeDefs, typeDefs],
        resolvers,
    })
);

// Shared Prisma client for tests
let prisma: PrismaClient;

export function getPrisma(): PrismaClient {
    if (!prisma) {
        prisma = new PrismaClient();
    }
    return prisma;
}

export async function disconnectPrisma(): Promise<void> {
    if (prisma) {
        await prisma.$disconnect();
    }
}

interface TestYogaOptions {
    user?: JWTUser | null;
}

/**
 * Create a test Yoga instance that can be used for testing
 */
export function createTestYoga(options: TestYogaOptions = {}) {
    const { user = null } = options;

    return createYoga({
        schema,
        context: () => ({
            user,
            prisma: getPrisma(),
        }),
    });
}

interface GraphQLResponse<T = unknown> {
    data?: T;
    errors?: Array<{
        message: string;
        locations?: Array<{ line: number; column: number }>;
        path?: Array<string | number>;
        extensions?: Record<string, unknown>;
    }>;
}

/**
 * Execute a GraphQL query against the test server
 */
export async function executeQuery<T = unknown>(
    query: string,
    variables?: Record<string, unknown>,
    options: TestYogaOptions = {}
): Promise<GraphQLResponse<T>> {
    const yoga = createTestYoga(options);

    const response = await yoga.fetch('http://localhost/graphql', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query,
            variables,
        }),
    });

    return response.json() as Promise<GraphQLResponse<T>>;
}

/**
 * Create a mock authenticated user for testing mutations
 */
export function createMockUser(overrides: Partial<JWTUser> = {}): JWTUser {
    const permissionsKey = process.env.AUTH0_PERMISSIONS_KEY || 'permissions';
    const profileKey = process.env.AUTH0_PROFILE_KEY || 'profile';

    return {
        sub: 'auth0|test-user-123',
        [permissionsKey]: 'submit:report',
        [profileKey]: {
            nickname: 'test-user',
        },
        ...overrides,
    };
}
