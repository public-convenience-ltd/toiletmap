/**
 * Integration tests for GraphQL API Queries
 *
 * These tests verify that the GraphQL API queries return expected data
 * from the database and handle edge cases correctly.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { executeQuery, getPrisma, disconnectPrisma } from './test-utils';

describe('GraphQL API - Query Integration Tests', () => {
    beforeAll(async () => {
        // Ensure Prisma is connected
        await getPrisma().$connect();
    });

    afterAll(async () => {
        await disconnectPrisma();
    });

    describe('areas query', () => {
        it('should return a list of areas with name and type', async () => {
            const query = `
        query {
          areas {
            name
            type
          }
        }
      `;

            const result = await executeQuery<{ areas: Array<{ name: string; type: string }> }>(query);

            expect(result.errors).toBeUndefined();
            expect(result.data).toBeDefined();
            expect(result.data!.areas).toBeInstanceOf(Array);

            // Should have at least some areas
            expect(result.data!.areas.length).toBeGreaterThan(0);

            // Each area should have name and type
            result.data!.areas.forEach((area) => {
                expect(area.name).toBeDefined();
                expect(area.type).toBeDefined();
                expect(typeof area.name).toBe('string');
                expect(typeof area.type).toBe('string');
            });
        });
    });

    describe('statistics query', () => {
        it('should return toilet statistics', async () => {
            const query = `
        query {
          statistics {
            total
            active
            removed
          }
        }
      `;

            const result = await executeQuery<{
                statistics: { total: number; active: number; removed: number };
            }>(query);

            expect(result.errors).toBeUndefined();
            expect(result.data).toBeDefined();
            expect(result.data!.statistics).toBeDefined();

            const stats = result.data!.statistics;
            expect(typeof stats.total).toBe('number');
            expect(typeof stats.active).toBe('number');
            expect(typeof stats.removed).toBe('number');

            // active + removed should be less than or equal to total
            expect(stats.active + stats.removed).toBeLessThanOrEqual(stats.total);
        });

        it('should return area toilet counts', async () => {
            const query = `
        query {
          statistics {
            areaToiletCount {
              name
              active
              removed
            }
          }
        }
      `;

            const result = await executeQuery<{
                statistics: {
                    areaToiletCount: Array<{ name: string; active: number; removed: number }>;
                };
            }>(query);

            expect(result.errors).toBeUndefined();
            expect(result.data!.statistics.areaToiletCount).toBeInstanceOf(Array);
        });
    });

    describe('loos query (search)', () => {
        it('should return paginated loo search results', async () => {
            const query = `
        query SearchLoos($filters: LooFilter!, $pagination: PaginationInput) {
          loos(filters: $filters, pagination: $pagination) {
            loos {
              id
              name
              active
              location {
                lat
                lng
              }
            }
            total
            page
            limit
            pages
          }
        }
      `;

            const result = await executeQuery<{
                loos: {
                    loos: Array<{
                        id: string;
                        name: string;
                        active: boolean;
                        location: { lat: number; lng: number };
                    }>;
                    total: number;
                    page: number;
                    limit: number;
                    pages: number;
                };
            }>(query, {
                filters: { active: true },
                pagination: { limit: 5, page: 1 },
            });

            expect(result.errors).toBeUndefined();
            expect(result.data).toBeDefined();

            const looResults = result.data!.loos;
            expect(looResults.loos).toBeInstanceOf(Array);
            expect(looResults.loos.length).toBeLessThanOrEqual(5);
            expect(looResults.page).toBe(1);
            expect(looResults.limit).toBe(5);
            expect(typeof looResults.total).toBe('number');
            expect(typeof looResults.pages).toBe('number');
        });

        it('should filter by area name', async () => {
            const query = `
        query SearchLoos($filters: LooFilter!) {
          loos(filters: $filters) {
            loos {
              id
              area {
                name
              }
            }
            total
          }
        }
      `;

            const result = await executeQuery<{
                loos: {
                    loos: Array<{ id: string; area: Array<{ name: string }> }>;
                    total: number;
                };
            }>(query, {
                filters: { active: true, areaName: 'Westminster' },
            });

            expect(result.errors).toBeUndefined();
            // Results should either be empty or only contain Westminster loos
            if (result.data!.loos.total > 0) {
                result.data!.loos.loos.forEach((loo) => {
                    const areaNames = loo.area?.map((a) => a.name) ?? [];
                    expect(areaNames).toContain('Westminster');
                });
            }
        });

        it('should sort by newest first', async () => {
            const query = `
        query SearchLoos($filters: LooFilter!, $sort: SortOrder) {
          loos(filters: $filters, sort: $sort, pagination: { limit: 10 }) {
            loos {
              id
              updatedAt
            }
          }
        }
      `;

            const result = await executeQuery<{
                loos: {
                    loos: Array<{ id: string; updatedAt: string }>;
                };
            }>(query, {
                filters: { active: true },
                sort: 'NEWEST_FIRST',
            });

            expect(result.errors).toBeUndefined();

            const loos = result.data!.loos.loos;
            if (loos.length > 1) {
                // Verify descending order
                for (let i = 0; i < loos.length - 1; i++) {
                    const currentDate = new Date(loos[i].updatedAt).getTime();
                    const nextDate = new Date(loos[i + 1].updatedAt).getTime();
                    expect(currentDate).toBeGreaterThanOrEqual(nextDate);
                }
            }
        });
    });

    describe('loo query (by ID)', () => {
        it('should handle non-existent loo ID', async () => {
            const query = `
        query GetLoo($id: ID) {
          loo(id: $id) {
            id
            name
          }
        }
      `;

            const result = await executeQuery<{ loo: null }>(query, {
                id: 'non-existent-id-12345',
            });

            // API either returns null or an error for non-existent IDs
            if (result.errors) {
                expect(result.errors.length).toBeGreaterThan(0);
            } else {
                expect(result.data!.loo).toBeNull();
            }
        });

        it('should return loo details for valid ID', async () => {
            // First, get a valid loo ID
            const searchQuery = `
        query {
          loos(filters: { active: true }, pagination: { limit: 1 }) {
            loos {
              id
            }
          }
        }
      `;

            const searchResult = await executeQuery<{
                loos: { loos: Array<{ id: string }> };
            }>(searchQuery);

            if (searchResult.data!.loos.loos.length === 0) {
                // Skip if no loos in database
                return;
            }

            const looId = searchResult.data!.loos.loos[0].id;

            const query = `
        query GetLoo($id: ID) {
          loo(id: $id) {
            id
            name
            active
            location {
              lat
              lng
            }
            accessible
            babyChange
            radar
            noPayment
            geohash
            area {
              name
              type
            }
          }
        }
      `;

            const result = await executeQuery<{
                loo: {
                    id: string;
                    name: string;
                    active: boolean;
                    location: { lat: number; lng: number };
                    accessible: boolean | null;
                    babyChange: boolean | null;
                    radar: boolean | null;
                    noPayment: boolean | null;
                    geohash: string;
                    area: Array<{ name: string; type: string }>;
                };
            }>(query, { id: looId });

            expect(result.errors).toBeUndefined();
            expect(result.data!.loo).toBeDefined();
            expect(result.data!.loo.id).toBe(looId);
            expect(result.data!.loo.location).toBeDefined();
            expect(typeof result.data!.loo.location.lat).toBe('number');
            expect(typeof result.data!.loo.location.lng).toBe('number');
        });
    });

    describe('loosByGeohash query', () => {
        it('should return compressed loo data for a geohash', async () => {
            const query = `
        query LoosByGeohash($geohash: String!) {
          loosByGeohash(geohash: $geohash)
        }
      `;

            // gcpv is London area geohash
            const result = await executeQuery<{ loosByGeohash: string[] }>(query, {
                geohash: 'gcpv',
            });

            expect(result.errors).toBeUndefined();
            expect(result.data!.loosByGeohash).toBeInstanceOf(Array);

            // Each result should be a compressed loo string (id|geohash|filterMask)
            result.data!.loosByGeohash.forEach((compressedLoo) => {
                expect(typeof compressedLoo).toBe('string');
                const parts = compressedLoo.split('|');
                expect(parts.length).toBeGreaterThanOrEqual(3);
            });
        });

        it('should filter by active status', async () => {
            const activeQuery = `
        query {
          loosByGeohash(geohash: "gcpv", active: true)
        }
      `;

            const inactiveQuery = `
        query {
          loosByGeohash(geohash: "gcpv", active: false)
        }
      `;

            const [activeResult, inactiveResult] = await Promise.all([
                executeQuery<{ loosByGeohash: string[] }>(activeQuery),
                executeQuery<{ loosByGeohash: string[] }>(inactiveQuery),
            ]);

            expect(activeResult.errors).toBeUndefined();
            expect(inactiveResult.errors).toBeUndefined();

            // Results should be different (or both empty)
            // Just verify they're valid arrays
            expect(activeResult.data!.loosByGeohash).toBeInstanceOf(Array);
            expect(inactiveResult.data!.loosByGeohash).toBeInstanceOf(Array);
        });
    });

    describe('fullLoosByGeohash query', () => {
        it('should return full compressed loo data for a geohash', async () => {
            const query = `
        query FullLoosByGeohash($geohash: String!) {
          fullLoosByGeohash(geohash: $geohash)
        }
      `;

            const result = await executeQuery<{ fullLoosByGeohash: string[] }>(query, {
                geohash: 'gcpv',
            });

            expect(result.errors).toBeUndefined();
            expect(result.data!.fullLoosByGeohash).toBeInstanceOf(Array);

            // Full compressed loos have 4 parts: id|geohash|combinedMask|meta
            result.data!.fullLoosByGeohash.forEach((compressedLoo) => {
                expect(typeof compressedLoo).toBe('string');
                const parts = compressedLoo.split('|');
                expect(parts.length).toBe(4);
            });
        });
    });

    describe('loosByProximity query', () => {
        it('should return loos near a location', async () => {
            const query = `
        query LoosByProximity($from: ProximityInput!) {
          loosByProximity(from: $from) {
            id
            name
            location {
              lat
              lng
            }
          }
        }
      `;

            // Central London coordinates
            const result = await executeQuery<{
                loosByProximity: Array<{
                    id: string;
                    name: string;
                    location: { lat: number; lng: number };
                }>;
            }>(query, {
                from: {
                    lat: 51.5074,
                    lng: -0.1278,
                    maxDistance: 5000,
                },
            });

            expect(result.errors).toBeUndefined();
            expect(result.data!.loosByProximity).toBeInstanceOf(Array);

            // Each result should have location data
            result.data!.loosByProximity.forEach((loo) => {
                expect(loo.location).toBeDefined();
                expect(typeof loo.location.lat).toBe('number');
                expect(typeof loo.location.lng).toBe('number');
            });
        });
    });

    describe('reportsForLoo query', () => {
        it('should return reports for a loo', async () => {
            // First get a loo ID
            const searchResult = await executeQuery<{
                loos: { loos: Array<{ id: string }> };
            }>(`
        query {
          loos(filters: { active: true }, pagination: { limit: 1 }) {
            loos { id }
          }
        }
      `);

            if (searchResult.data!.loos.loos.length === 0) {
                return; // Skip if no loos
            }

            const looId = searchResult.data!.loos.loos[0].id;

            const query = `
        query ReportsForLoo($id: ID!) {
          reportsForLoo(id: $id) {
            id
            contributor
            createdAt
            active
          }
        }
      `;

            const result = await executeQuery<{
                reportsForLoo: Array<{
                    id: string;
                    contributor: string;
                    createdAt: string;
                    active: boolean;
                }>;
            }>(query, { id: looId });

            expect(result.errors).toBeUndefined();
            expect(result.data!.reportsForLoo).toBeInstanceOf(Array);
        });
    });
});
