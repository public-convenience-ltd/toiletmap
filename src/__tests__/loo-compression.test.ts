/**
 * Integration tests for compressed loo data utilities
 *
 * Tests the compression/decompression of loo data for geohash queries.
 */

import { describe, it, expect } from 'vitest';
import {
    stringifyAndCompressLoos,
    stringifyAndCompressFullLoos,
    parseCompressedLoo,
    parseCompressedFullLoo,
    filterCompressedLooByAppliedFilters,
} from '../lib/loo';
import { FILTER_TYPE } from '../lib/filter';
import type { Loo } from '../@types/resolvers-types';

describe('Loo Compression Utilities', () => {
    // Sample loo data for testing
    const sampleLoo: Loo = {
        id: 'test-loo-123',
        location: { lat: 51.5074, lng: -0.1278 },
        active: true,
        accessible: true,
        babyChange: false,
        radar: true,
        noPayment: true,
        allGender: false,
        automatic: false,
        men: true,
        women: true,
        children: true,
        urinalOnly: false,
        name: 'Test Public Toilet',
        paymentDetails: null,
        notes: 'Near the station',
        openingTimes: [
            ['09:00', '17:00'],
            ['09:00', '17:00'],
            ['09:00', '17:00'],
            ['09:00', '17:00'],
            ['09:00', '17:00'],
            [],
            [],
        ],
    };

    describe('stringifyAndCompressLoos', () => {
        it('should compress a loo into a pipe-separated string', () => {
            const result = stringifyAndCompressLoos([sampleLoo]);

            expect(result).toHaveLength(1);
            expect(typeof result[0]).toBe('string');

            const parts = result[0].split('|');
            expect(parts.length).toBe(3);
            expect(parts[0]).toBe('test-loo-123'); // ID
            expect(parts[1]).toMatch(/^[a-z0-9]+$/); // Geohash
            expect(Number.isInteger(parseInt(parts[2], 10))).toBe(true); // Filter mask
        });

        it('should handle multiple loos', () => {
            const loos = [
                sampleLoo,
                { ...sampleLoo, id: 'test-loo-456' },
                { ...sampleLoo, id: 'test-loo-789' },
            ];

            const result = stringifyAndCompressLoos(loos);

            expect(result).toHaveLength(3);
            expect(result[0]).toContain('test-loo-123');
            expect(result[1]).toContain('test-loo-456');
            expect(result[2]).toContain('test-loo-789');
        });

        it('should encode filter properties in the bitmask', () => {
            const accessibleLoo: Loo = {
                ...sampleLoo,
                accessible: true,
                noPayment: false,
                radar: false,
            };

            const [compressed] = stringifyAndCompressLoos([accessibleLoo]);
            const parsed = parseCompressedLoo(compressed as `${string}|${string}|${number}`);

            // Check that accessible filter is set
            const hasAccessible =
                (parsed.filterBitmask & FILTER_TYPE.ACCESSIBLE) !== 0;
            expect(hasAccessible).toBe(true);
        });
    });

    describe('stringifyAndCompressFullLoos', () => {
        it('should compress a loo with full details', () => {
            const result = stringifyAndCompressFullLoos([sampleLoo]);

            expect(result).toHaveLength(1);

            const parts = result[0].split('|');
            expect(parts.length).toBe(4);
            expect(parts[0]).toBe('test-loo-123'); // ID
            expect(parts[1]).toMatch(/^[a-z0-9]+$/); // Geohash
            expect(Number.isInteger(parseInt(parts[2], 10))).toBe(true); // Combined mask
            // parts[3] is base64-encoded metadata
        });

        it('should include metadata in the fourth segment', () => {
            const looWithName: Loo = {
                ...sampleLoo,
                name: 'Victoria Station Toilets',
            };

            const [compressed] = stringifyAndCompressFullLoos([looWithName]);
            const parsed = parseCompressedFullLoo(compressed as `${string}|${string}|${number}|${string}`);

            expect(parsed.name).toBe('Victoria Station Toilets');
        });
    });

    describe('parseCompressedLoo', () => {
        it('should parse a compressed loo string', () => {
            const [compressed] = stringifyAndCompressLoos([sampleLoo]);
            const parsed = parseCompressedLoo(compressed as `${string}|${string}|${number}`);

            expect(parsed.id).toBe('test-loo-123');
            expect(parsed.location).toBeDefined();
            expect(typeof parsed.location.lat).toBe('number');
            expect(typeof parsed.location.lng).toBe('number');
            expect(typeof parsed.filterBitmask).toBe('number');
        });

        it('should decode location from geohash', () => {
            const [compressed] = stringifyAndCompressLoos([sampleLoo]);
            const parsed = parseCompressedLoo(compressed as `${string}|${string}|${number}`);

            // Location should be close to original (geohash precision ~1m at 9 chars)
            expect(parsed.location.lat).toBeCloseTo(51.5074, 3);
            expect(parsed.location.lng).toBeCloseTo(-0.1278, 3);
        });
    });

    describe('parseCompressedFullLoo', () => {
        it('should parse a full compressed loo with details', () => {
            const [compressed] = stringifyAndCompressFullLoos([sampleLoo]);
            const parsed = parseCompressedFullLoo(compressed as `${string}|${string}|${number}|${string}`);

            expect(parsed.id).toBe('test-loo-123');
            expect(parsed.details).toBeDefined();
            expect(parsed.details.women).toBe(true);
            expect(parsed.details.men).toBe(true);
            expect(parsed.details.children).toBe(true);
            expect(parsed.details.urinalOnly).toBe(false);
        });

        it('should decode opening times', () => {
            const [compressed] = stringifyAndCompressFullLoos([sampleLoo]);
            const parsed = parseCompressedFullLoo(compressed as `${string}|${string}|${number}|${string}`);

            if (parsed.openingTimes) {
                expect(parsed.openingTimes).toHaveLength(7);
                expect(parsed.openingTimes[0]).toEqual(['09:00', '17:00']);
                expect(parsed.openingTimes[5]).toEqual([]);
            }
        });
    });

    describe('filterCompressedLooByAppliedFilters', () => {
        it('should return true when no filters applied', () => {
            const [compressed] = stringifyAndCompressLoos([sampleLoo]);
            const parsed = parseCompressedLoo(compressed as `${string}|${string}|${number}`);

            const result = filterCompressedLooByAppliedFilters(parsed, []);
            expect(result).toBe(true);
        });

        it('should filter by accessible', () => {
            const accessibleLoo: Loo = { ...sampleLoo, accessible: true };
            const [compressed] = stringifyAndCompressLoos([accessibleLoo]);
            const parsed = parseCompressedLoo(compressed as `${string}|${string}|${number}`);

            const passesAccessible = filterCompressedLooByAppliedFilters(parsed, [
                FILTER_TYPE.ACCESSIBLE,
            ]);
            expect(passesAccessible).toBe(true);
        });

        it('should filter by noPayment', () => {
            const freeLoo: Loo = { ...sampleLoo, noPayment: true };
            const [compressed] = stringifyAndCompressLoos([freeLoo]);
            const parsed = parseCompressedLoo(compressed as `${string}|${string}|${number}`);

            const passesFree = filterCompressedLooByAppliedFilters(parsed, [
                FILTER_TYPE.NO_PAYMENT,
            ]);
            expect(passesFree).toBe(true);
        });

        it('should require all filters to pass', () => {
            const loo: Loo = {
                ...sampleLoo,
                accessible: true,
                noPayment: false,
            };
            const [compressed] = stringifyAndCompressLoos([loo]);
            const parsed = parseCompressedLoo(compressed as `${string}|${string}|${number}`);

            // Should fail because noPayment is false
            const passesAll = filterCompressedLooByAppliedFilters(parsed, [
                FILTER_TYPE.ACCESSIBLE,
                FILTER_TYPE.NO_PAYMENT,
            ]);
            expect(passesAll).toBe(false);
        });
    });
});
