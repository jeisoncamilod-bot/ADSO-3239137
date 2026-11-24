/**
 * Plans Archive - Data Seeder Tool
 * Engineering domain fixture tests.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
    categories,
    engineers,
    plans,
    operations
} from '../src/fixtures.js';

/**
 * Verify required engineering categories.
 */
test('Fixtures contain the five required categories', () => {

    assert.equal(categories.length, 5);

    assert.deepEqual(
        categories.map(([slug]) => slug),
        [
            'architectural',
            'structural',
            'electrical',
            'hydraulic',
            'road'
        ]
    );
});

/**
 * Verify engineer records.
 */
test('Fixtures contain ten unique engineers', () => {

    assert.equal(engineers.length, 10);

    const employeeCodes = engineers.map(
        engineer => engineer.employee_code
    );

    assert.equal(
        new Set(employeeCodes).size,
        engineers.length
    );

    for (const engineer of engineers) {
        assert.ok(engineer.employee_code);
        assert.ok(engineer.full_name);
        assert.ok(engineer.email);
    }
});

/**
 * Verify fictional and unique email addresses.
 */
test('Engineer email addresses are unique and fictional', () => {

    const emails = engineers.map(
        engineer => engineer.email.toLowerCase()
    );

    assert.equal(
        new Set(emails).size,
        engineers.length
    );

    for (const email of emails) {
        assert.ok(email.endsWith('@example.test'));
    }
});

/**
 * Verify drawing records.
 */
test('Fixtures contain twenty-five unique plans', () => {

    assert.equal(plans.length, 25);

    const codes = plans.map(plan => plan.code);

    assert.equal(
        new Set(codes).size,
        plans.length
    );

    for (const plan of plans) {
        assert.ok(plan.code);
        assert.ok(plan.title);
        assert.ok(plan.description);
    }
});

/**
 * Verify drawing category distribution.
 */
test('Each category contains five plans', () => {

    for (const [slug, name] of categories) {

        const categoryPlans = plans.filter(
            plan => plan.categorySlug === slug
        );

        assert.equal(categoryPlans.length, 5);

        for (const plan of categoryPlans) {
            assert.equal(plan.categoryName, name);
        }
    }
});

/**
 * Verify initial inventory quantities.
 */
test('Plans contain valid initial inventory quantities', () => {

    for (const plan of plans) {
        assert.ok(Number.isInteger(plan.total_units));
        assert.equal(plan.total_units, 3);
    }

    const totalUnits = plans.reduce(
        (total, plan) => total + plan.total_units,
        0
    );

    assert.equal(totalUnits, 75);
});

/**
 * Verify loan and return quantities.
 */
test('Fixtures contain fifteen loans and five returns', () => {

    assert.equal(operations.length, 15);

    const returnedLoans = operations.filter(
        operation => operation.returned
    );

    const openLoans = operations.filter(
        operation => !operation.returned
    );

    assert.equal(returnedLoans.length, 5);
    assert.equal(openLoans.length, 10);
});

/**
 * Verify operation references.
 */
test('Loan operations reference valid engineers and plans', () => {

    for (const operation of operations) {

        assert.ok(Number.isInteger(operation.engineerIndex));
        assert.ok(Number.isInteger(operation.planIndex));

        assert.ok(engineers[operation.engineerIndex]);
        assert.ok(plans[operation.planIndex]);

        assert.equal(
            typeof operation.returned,
            'boolean'
        );
    }
});

/**
 * Verify the maximum number of simultaneous open loans.
 */
test('Engineers never exceed three simultaneous open loans', () => {

    const openLoans = new Map();

    for (const operation of operations) {

        const current =
            openLoans.get(operation.engineerIndex) ?? 0;

        const updated = current + 1;

        assert.ok(updated <= 3);

        openLoans.set(
            operation.engineerIndex,
            operation.returned ? current : updated
        );
    }
});

/**
 * Verify inventory availability during loan operations.
 */
test('Loan operations never exceed available inventory', () => {

    const availableUnits = plans.map(
        plan => plan.total_units
    );

    for (const operation of operations) {

        const index = operation.planIndex;

        assert.ok(availableUnits[index] > 0);

        availableUnits[index]--;

        if (operation.returned) {
            availableUnits[index]++;
        }

        assert.ok(availableUnits[index] >= 0);

        assert.ok(
            availableUnits[index] <= plans[index].total_units
        );
    }

    const remainingUnits = availableUnits.reduce(
        (total, units) => total + units,
        0
    );

    assert.equal(remainingUnits, 65);
});

/**
 * Verify unique demonstration loan scenarios.
 */
test('Loan operations do not contain duplicate scenarios', () => {

    const identifiers = operations.map(
        operation =>
            `${operation.engineerIndex}:${operation.planIndex}`
    );

    assert.equal(
        new Set(identifiers).size,
        operations.length
    );
});