/**
 * Plans Archive - Data Seeder Tool
 * API client and configuration tests.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { ApiClient } from '../src/api-client.js';
import { loadConfig } from '../src/config.js';

const TEST_CONFIG = {
    baseUrl: 'http://localhost:8000/api/v1',
    token: 'test-token'
};

/**
 * Verify authenticated JSON requests.
 */
test('Client sends authenticated JSON requests', async () => {

    const transport = async (url, options) => {
        assert.equal(
            url,
            `${TEST_CONFIG.baseUrl}/plans`
        );

        assert.equal(
            options.headers.Authorization,
            'Bearer test-token'
        );

        assert.equal(options.headers.Accept, 'application/json');
        assert.equal(options.headers['Content-Type'], 'application/json');
        assert.equal(options.method, 'POST');
        assert.equal(options.redirect, 'error');

        assert.deepEqual(
            JSON.parse(options.body),
            { code: 'X' }
        );

        return Response.json(
            { data: { id: 1 } },
            { status: 201 }
        );
    };

    const api = new ApiClient(TEST_CONFIG, transport);

    const result = await api.create('/plans', {
        code: 'X'
    });

    assert.equal(result.id, 1);
});

/**
 * Verify HTTP conflict handling.
 */
test('Client rejects HTTP conflicts', async () => {

    const api = new ApiClient(
        TEST_CONFIG,
        async () => new Response('', { status: 409 })
    );

    await assert.rejects(
        api.create('/loans', {}),
        /409/
    );
});

/**
 * Verify unauthorized request handling.
 */
test('Client rejects unauthorized requests', async () => {

    const api = new ApiClient(
        TEST_CONFIG,
        async () => new Response('', { status: 401 })
    );

    await assert.rejects(
        api.request('GET', '/plans'),
        /401/
    );
});

/**
 * Verify network error handling.
 */
test('Client handles network failures', async () => {

    const api = new ApiClient(
        TEST_CONFIG,
        async () => {
            throw new Error('Connection failed');
        }
    );

    await assert.rejects(
        api.request('GET', '/plans'),
        /No fue posible conectar/
    );
});

/**
 * Verify invalid JSON handling.
 */
test('Client rejects invalid JSON responses', async () => {

    const api = new ApiClient(
        TEST_CONFIG,
        async () => new Response('Invalid JSON')
    );

    await assert.rejects(
        api.request('GET', '/plans'),
        /JSON no válida/
    );
});

/**
 * Verify successful empty responses.
 */
test('Client handles empty HTTP responses', async () => {

    const api = new ApiClient(
        TEST_CONFIG,
        async () => new Response(null, { status: 204 })
    );

    const result = await api.request('POST', '/auth/logout');

    assert.equal(result, null);
});

/**
 * Verify paginated resource retrieval.
 */
test('Client reads multiple pages', async () => {

    const transport = async url => {
        const endpoint = new URL(url);

        const page = Number(
            endpoint.searchParams.get('page')
        );

        assert.equal(
            endpoint.searchParams.get('per_page'),
            '100'
        );

        return Response.json({
            data: [{ id: page }],
            meta: { last_page: 2 }
        });
    };

    const api = new ApiClient(TEST_CONFIG, transport);

    assert.deepEqual(
        await api.list('/plans'),
        [{ id: 1 }, { id: 2 }]
    );
});

/**
 * Verify duplicate pagination protection.
 */
test('Client rejects repeated pagination records', async () => {

    const api = new ApiClient(
        TEST_CONFIG,
        async () => Response.json({
            data: [{ id: 1 }],
            meta: { last_page: 2 }
        })
    );

    await assert.rejects(
        api.list('/plans'),
        /Paginación repetida/
    );
});

/**
 * Verify resource identifier validation.
 */
test('Client rejects invalid resource identifiers', async () => {

    const api = new ApiClient(
        TEST_CONFIG,
        async () => Response.json({
            data: { id: 0 }
        })
    );

    await assert.rejects(
        api.create('/plans', {}),
        /identificador válido/
    );
});

/**
 * Verify local API configuration.
 */
test('Configuration accepts and normalizes local URLs', () => {

    const config = loadConfig({
        API_BASE_URL: 'http://localhost:8000/api/v1/',
        API_TOKEN: ' test-token '
    });

    assert.deepEqual(config, TEST_CONFIG);
});

/**
 * Verify remote host protection.
 */
test('Configuration rejects remote hosts', () => {

    assert.throws(
        () => loadConfig({
            API_BASE_URL: 'https://example.com/api/v1',
            API_TOKEN: 'test-token'
        }),
        /Solo se permite una API local/
    );
});

/**
 * Verify mandatory authentication configuration.
 */
test('Configuration rejects missing authentication tokens', () => {

    assert.throws(
        () => loadConfig({
            API_BASE_URL: TEST_CONFIG.baseUrl
        }),
        /Configura API_TOKEN/
    );
});