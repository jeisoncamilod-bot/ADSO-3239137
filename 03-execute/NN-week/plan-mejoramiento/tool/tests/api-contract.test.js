
/**
 * Plans Archive - Data Seeder Tool
 * API contract regression tests.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { seed } from '../src/seeder.js';
import { categories } from '../src/fixtures.js';

test('Seeder uses Laravel-compatible inactive plans filter', async () => {
    const requests = [];

    const api = {
        async list(path) {
            requests.push(path);

            if (path === '/categories') {
                return categories.map(([slug, name], index) => ({
                    id: index + 1,
                    slug,
                    name
                }));
            }

            return [];
        },

        async create() {
            assert.fail('Preview mode must not create records.');
        }
    };

    const summary = await seed(api, { apply: false });

    assert.ok(
        requests.includes('/plans?include_inactive=1')
    );

    assert.ok(
        !requests.includes('/plans?include_inactive=true')
    );

    assert.deepEqual(summary, {
        categories: 5,
        engineers: 10,
        plans: 25,
        loans: 15,
        returns: 5
    });
});
