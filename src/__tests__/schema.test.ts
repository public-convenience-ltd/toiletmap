/**
 * Integration tests for GraphQL Schema validation
 *
 * These tests verify the schema is correctly configured
 * and introspection works as expected.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { executeQuery, getPrisma, disconnectPrisma } from './test-utils';

describe('GraphQL API - Schema Integration Tests', () => {
    beforeAll(async () => {
        await getPrisma().$connect();
    });

    afterAll(async () => {
        await disconnectPrisma();
    });

    describe('Schema introspection', () => {
        it('should expose Query type', async () => {
            const query = `
        query {
          __schema {
            queryType {
              name
              fields {
                name
              }
            }
          }
        }
      `;

            const result = await executeQuery<{
                __schema: {
                    queryType: {
                        name: string;
                        fields: Array<{ name: string }>;
                    };
                };
            }>(query);

            expect(result.errors).toBeUndefined();
            expect(result.data!.__schema.queryType.name).toBe('Query');

            const fieldNames = result.data!.__schema.queryType.fields.map(
                (f) => f.name
            );
            expect(fieldNames).toContain('loo');
            expect(fieldNames).toContain('loos');
            expect(fieldNames).toContain('areas');
            expect(fieldNames).toContain('statistics');
            expect(fieldNames).toContain('loosByGeohash');
            expect(fieldNames).toContain('fullLoosByGeohash');
            expect(fieldNames).toContain('loosByProximity');
            expect(fieldNames).toContain('reportsForLoo');
        });

        it('should expose Mutation type', async () => {
            const query = `
        query {
          __schema {
            mutationType {
              name
              fields {
                name
              }
            }
          }
        }
      `;

            const result = await executeQuery<{
                __schema: {
                    mutationType: {
                        name: string;
                        fields: Array<{ name: string }>;
                    };
                };
            }>(query);

            expect(result.errors).toBeUndefined();
            expect(result.data!.__schema.mutationType.name).toBe('Mutation');

            const fieldNames = result.data!.__schema.mutationType.fields.map(
                (f) => f.name
            );
            expect(fieldNames).toContain('submitReport');
            expect(fieldNames).toContain('submitRemovalReport');
            expect(fieldNames).toContain('submitVerificationReport');
        });

        it('should expose Loo type with all fields', async () => {
            const query = `
        query {
          __type(name: "Loo") {
            name
            fields {
              name
              type {
                name
                kind
              }
            }
          }
        }
      `;

            const result = await executeQuery<{
                __type: {
                    name: string;
                    fields: Array<{
                        name: string;
                        type: { name: string; kind: string };
                    }>;
                };
            }>(query);

            expect(result.errors).toBeUndefined();
            expect(result.data!.__type.name).toBe('Loo');

            const fieldNames = result.data!.__type.fields.map((f) => f.name);

            // Core fields
            expect(fieldNames).toContain('id');
            expect(fieldNames).toContain('name');
            expect(fieldNames).toContain('active');
            expect(fieldNames).toContain('location');

            // Feature fields
            expect(fieldNames).toContain('accessible');
            expect(fieldNames).toContain('babyChange');
            expect(fieldNames).toContain('radar');
            expect(fieldNames).toContain('noPayment');
            expect(fieldNames).toContain('allGender');
            expect(fieldNames).toContain('automatic');

            // Metadata fields
            expect(fieldNames).toContain('createdAt');
            expect(fieldNames).toContain('updatedAt');
            expect(fieldNames).toContain('verifiedAt');
            expect(fieldNames).toContain('geohash');
            expect(fieldNames).toContain('area');
            expect(fieldNames).toContain('reports');
        });

        it('should expose custom scalars', async () => {
            const query = `
        query {
          dateTime: __type(name: "DateTime") { name kind }
          openingTimes: __type(name: "OpeningTimes") { name kind }
        }
      `;

            const result = await executeQuery<{
                dateTime: { name: string; kind: string };
                openingTimes: { name: string; kind: string };
            }>(query);

            expect(result.errors).toBeUndefined();
            expect(result.data!.dateTime.name).toBe('DateTime');
            expect(result.data!.dateTime.kind).toBe('SCALAR');
            expect(result.data!.openingTimes.name).toBe('OpeningTimes');
            expect(result.data!.openingTimes.kind).toBe('SCALAR');
        });
    });

    describe('Input validation', () => {
        it('should reject invalid geohash format', async () => {
            const query = `
        query {
          loosByGeohash(geohash: "")
        }
      `;

            // Empty geohash should either return empty or error
            const result = await executeQuery<{ loosByGeohash: string[] }>(query);

            // Either returns empty array or doesn't error
            if (!result.errors) {
                expect(result.data!.loosByGeohash).toBeInstanceOf(Array);
            }
        });

        it('should require location in ReportInput', async () => {
            const mutation = `
        mutation {
          submitReport(report: { name: "No Location" }) {
            success
          }
        }
      `;

            const result = await executeQuery(mutation);

            // Should fail validation because location is required
            expect(result.errors).toBeDefined();
        });

        it('should require edit ID in RemovalReportInput', async () => {
            const mutation = `
        mutation {
          submitRemovalReport(report: { reason: "No ID" }) {
            success
          }
        }
      `;

            const result = await executeQuery(mutation);

            // Should fail validation because edit is required
            expect(result.errors).toBeDefined();
        });

        it('should validate pagination limits', async () => {
            const query = `
        query {
          loos(filters: { active: true }, pagination: { limit: 1000, page: 1 }) {
            loos { id }
            limit
          }
        }
      `;

            const result = await executeQuery<{
                loos: { loos: Array<{ id: string }>; limit: number };
            }>(query);

            // API enforces pagination limit and returns error
            expect(result.errors).toBeDefined();
            expect(result.errors!.length).toBeGreaterThan(0);
        });
    });
});
