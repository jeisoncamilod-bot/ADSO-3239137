/**
 * Plans Archive - Data Seeder Tool
 * Authenticated REST API client.
 */

const REQUEST_TIMEOUT = 15000;
const PAGE_SIZE = 100;
const MAX_PAGES = 1000;

export class ApiClient {

    constructor({ baseUrl, token }, transport = fetch) {
        this.baseUrl = baseUrl;
        this.token = token;
        this.transport = transport;
    }

    /**
     * Execute an authenticated HTTP request.
     */
    async request(method, path, body) {
        let response;

        try {
            response = await this.transport(
                `${this.baseUrl}${path}`,
                {
                    method,
                    redirect: 'error',
                    signal: AbortSignal.timeout(REQUEST_TIMEOUT),

                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${this.token}`
                    },

                    ...(body === undefined
                        ? {}
                        : { body: JSON.stringify(body) })
                }
            );
        } catch {
            throw new Error(
                `No fue posible conectar con la API: ${method} ${path}.`
            );
        }

        // Validate the HTTP response.
        if (!response.ok) {
            throw new Error(
                `Error HTTP ${response.status} en ${method} ${path}. ` +
                'Revisa la API antes de continuar.'
            );
        }

        // Handle responses without content.
        if (response.status === 204) {
            return null;
        }

        try {
            return await response.json();
        } catch {
            throw new Error(
                'La API devolvió una respuesta JSON no válida.'
            );
        }
    }

    /**
     * Retrieve all records from a paginated endpoint.
     */
    async list(path) {
        const result = [];
        const seen = new Set();

        for (let page = 1; page <= MAX_PAGES; page++) {

            const separator = path.includes('?') ? '&' : '?';

            const endpoint =
                `${path}${separator}page=${page}&per_page=${PAGE_SIZE}`;

            const payload = await this.request('GET', endpoint);

            if (!Array.isArray(payload?.data)) {
                throw new Error(
                    'Respuesta de listado no válida.'
                );
            }

            for (const item of payload.data) {

                if (!Number.isInteger(item?.id) || item.id <= 0) {
                    throw new Error(
                        'La API devolvió un identificador no válido.'
                    );
                }

                if (seen.has(item.id)) {
                    throw new Error(
                        'Paginación repetida; carga cancelada.'
                    );
                }

                seen.add(item.id);
                result.push(item);
            }

            // Determine the last available page.
            const lastPage =
                payload.meta?.last_page ??
                payload.last_page ??
                (
                    Number.isFinite(payload.meta?.total) &&
                    payload.meta?.per_page > 0
                        ? Math.ceil(
                            payload.meta.total / payload.meta.per_page
                        )
                        : undefined
                );

            const isLastPage = lastPage !== undefined
                ? page >= lastPage
                : payload.data.length < PAGE_SIZE;

            if (isLastPage) {
                return result;
            }
        }

        throw new Error(
            'Límite de páginas alcanzado.'
        );
    }

    /**
     * Create a resource through the REST API.
     */
    async create(path, body) {
        const result = await this.request(
            'POST',
            path,
            body
        );

        if (
            !Number.isInteger(result?.data?.id) ||
            result.data.id <= 0
        ) {
            throw new Error(
                'Respuesta de creación sin identificador válido.'
            );
        }

        return result.data;
    }
}