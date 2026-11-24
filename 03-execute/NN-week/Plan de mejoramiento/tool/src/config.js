/**
 * Plans Archive - Data Seeder Tool
 * API connection configuration.
 */

const DEFAULT_API_URL = 'http://localhost:8000/api/v1';

const ALLOWED_HOSTS = [
    'localhost',
    '127.0.0.1',
    '[::1]'
];

/**
 * Load and validate API configuration.
 */
export function loadConfig(env = process.env) {
    const rawUrl = env.API_BASE_URL?.trim()
        || DEFAULT_API_URL;

    let baseUrl;

    try {
        baseUrl = new URL(rawUrl);
    } catch {
        throw new Error(
            'La dirección de la API no es válida.'
        );
    }

    // Restrict access to local environments.
    if (
        !ALLOWED_HOSTS.includes(baseUrl.hostname) ||
        !['http:', 'https:'].includes(baseUrl.protocol) ||
        baseUrl.username ||
        baseUrl.password ||
        baseUrl.search ||
        baseUrl.hash
    ) {
        throw new Error(
            'Solo se permite una API local sin credenciales en la URL.'
        );
    }

    // Normalize the API path.
    const normalizedPath = baseUrl.pathname.replace(/\/+$/, '');

    if (normalizedPath !== '/api/v1') {
        throw new Error(
            'La dirección de la API debe finalizar en /api/v1.'
        );
    }

    // Validate the authentication token.
    const token = env.API_TOKEN?.trim();

    if (!token || /\s/.test(token)) {
        throw new Error(
            'Configura API_TOKEN con un token de administrador válido.'
        );
    }

    return {
        baseUrl: `${baseUrl.origin}${normalizedPath}`,
        token
    };
}