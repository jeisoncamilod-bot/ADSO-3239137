/**
 * Plans Archive - Data Seeder Tool
 * Data seeding workflow tests.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { seed } from '../src/seeder.js';

import {
    categories,
    engineers,
    plans
} from '../src/fixtures.js';

/**
 * Create a simulated API client.
 */
function createMockApi({
    existingEngineers = [],
    existingPlans = [],
    missingCategory = false,
    failOnPath = null
} = {}) {

    const calls = [];

    return {
        calls,

        async list(path) {

            if (path === '/categories') {
                const records = categories.map(
                    ([slug, name], index) => ({
                        id: index + 1,
                        slug,
                        name
                    })
                );

                return missingCategory
                    ? records.slice(1)
                    : records;
            }

            if (path === '/engineers') {
                return existingEngineers;
            }

            if (path.startsWith('/plans')) {
                return existingPlans;
            }

            return [];
        },

        async create(path, body) {

            if (path === failOnPath) {
                throw new Error('Simulated API failure');
            }

            calls.push({ path, body });

            return {
                id: calls.length
            };
        }
    };
}

/**
 * Verify that preview mode never writes records.
 */
test('Preview mode never writes records', async () => {

    const api = createMockApi();

    const summary = await seed(api);

    assert.equal(summary.loans, 15);
    assert.equal(api.calls.length, 0);
});

/**
 * Verify the complete preview summary.
 */
test('Preview returns the expected summary', async () => {

    const api = createMockApi();

    const summary = await seed(api, {
        apply: false
    });

    assert.deepEqual(summary, {
        categories: 5,
        engineers: 10,
        plans: 25,
        loans: 15,
        returns: 5
    });

    assert.equal(api.calls.length, 0);
});

/**
 * Verify the complete data creation workflow.
 */
test('Apply creates all expected records', async () => {

    const api = createMockApi();

    await seed(api, { apply: true });

    assert.equal(api.calls.length, 55);

    assert.equal(
        api.calls.filter(call => call.path === '/engineers').length,
        10
    );

    assert.equal(
        api.calls.filter(call => call.path === '/plans').length,
        25
    );

    assert.equal(
        api.calls.filter(call => call.path === '/loans').length,
        15
    );

    assert.equal(
        api.calls.filter(
            call => call.path.endsWith('/returns')
        ).length,
        5
    );
});

/**
 * Verify drawing category relationships.
 */
test('Created plans reference valid categories', async () => {

    const api = createMockApi();

    await seed(api, { apply: true });

    const planCalls = api.calls.filter(
        call => call.path === '/plans'
    );

    for (const call of planCalls) {

        assert.ok(Number.isInteger(call.body.category_id));
        assert.ok(call.body.category_id >= 1);
        assert.ok(call.body.category_id <= 5);

        assert.equal(call.body.total_units, 3);

        assert.equal('categorySlug' in call.body, false);
        assert.equal('categoryName' in call.body, false);
    }
});

/**
 * Verify loan relationships.
 */
test('Loans reference previously created records', async () => {

    const api = createMockApi();

    await seed(api, { apply: true });

    const engineerIds = new Set();
    const planIds = new Set();

    for (const [index, call] of api.calls.entries()) {

        const id = index + 1;

        if (call.path === '/engineers') {
            engineerIds.add(id);
        }

        if (call.path === '/plans') {
            planIds.add(id);
        }

        if (call.path === '/loans') {

            assert.ok(
                engineerIds.has(call.body.engineer_id)
            );

            assert.ok(
                planIds.has(call.body.plan_id)
            );
        }
    }
});

/**
 * Verify return relationships.
 */
test('Returns reference previously created loans', async () => {

    const api = createMockApi();

    await seed(api, { apply: true });

    const loanIds = new Set();
    const returnedIds = new Set();

    for (const [index, call] of api.calls.entries()) {

        if (call.path === '/loans') {
            loanIds.add(index + 1);
        }

        if (call.path.endsWith('/returns')) {

            const loanId = Number(
                call.path.split('/')[2]
            );

            assert.ok(loanIds.has(loanId));
            assert.ok(!returnedIds.has(loanId));

            assert.deepEqual(call.body, {});

            returnedIds.add(loanId);
        }
    }

    assert.equal(returnedIds.size, 5);
});

/**
 * Verify duplicate engineer protection.
 */
test('Existing demonstration engineers prevent writes', async () => {

    const api = createMockApi({
        existingEngineers: [
            { ...engineers[0], id: 100 }
        ]
    });

    await assert.rejects(
        seed(api, { apply: true }),
        /Ya existen/
    );

    assert.equal(api.calls.length, 0);
});

/**
 * Verify duplicate drawing protection.
 */
test('Existing demonstration plans prevent writes', async () => {

    const api = createMockApi({
        existingPlans: [
            { ...plans[0], id: 100 }
        ]
    });

    await assert.rejects(
        seed(api, { apply: true }),
        /Ya existen/
    );

    assert.equal(api.calls.length, 0);
});

/**
 * Verify duplicate email protection.
 */
test('Existing engineer emails prevent writes', async () => {

    const api = createMockApi({
        existingEngineers: [{
            id: 100,
            employee_code: 'OTHER-ENG-001',
            email: engineers[0].email.toUpperCase()
        }]
    });

    await assert.rejects(
        seed(api, { apply: true }),
        /Ya existen/
    );

    assert.equal(api.calls.length, 0);
});

/**
 * Verify required category validation.
 */
test('Missing categories prevent writes', async () => {

    const api = createMockApi({
        missingCategory: true
    });

    await assert.rejects(
        seed(api, { apply: true }),
        /categoría/
    );

    assert.equal(api.calls.length, 0);
});

/**
 * Verify execution mode validation.
 */
test('Invalid execution modes are rejected', async () => {

    const api = createMockApi();

    await assert.rejects(
        seed(api, { apply: 'true' }),
        /modo de ejecución/
    );

    assert.equal(api.calls.length, 0);
});

/**
 * Verify partial failure handling.
 */
test('API failures stop the seeding workflow', async () => {

    const api = createMockApi({
        failOnPath: '/plans'
    });

    await assert.rejects(
        seed(api, { apply: true }),
        /La carga se interrumpió durante el registro de planos/
    );

    assert.equal(api.calls.length, 10);

    assert.ok(
        api.calls.every(
            call => call.path === '/engineers'
        )
    );
});