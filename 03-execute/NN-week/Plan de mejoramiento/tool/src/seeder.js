/**
 * Plans Archive - Data Seeder Tool
 * Seed workflow and data integrity protection.
 */

import {
    categories,
    engineers,
    plans,
    operations
} from './fixtures.js';

/**
 * Resolve the required category identifiers.
 */
function resolveCategories(currentCategories) {
    const categoryIds = new Map();

    for (const [slug, name] of categories) {
        const matches = currentCategories.filter(
            category =>
                category.slug === slug ||
                category.name === name
        );

        if (matches.length !== 1) {
            throw new Error(
                `No se pudo identificar la categoría ${name}.`
            );
        }

        const category = matches[0];

        if (!Number.isInteger(category.id) || category.id <= 0) {
            throw new Error(
                `Identificador no válido para la categoría ${name}.`
            );
        }

        categoryIds.set(slug, category.id);
    }

    return categoryIds;
}

/**
 * Prevent duplicate demonstration records.
 */
function validateExistingRecords(currentEngineers, currentPlans) {
    const existingEngineer = currentEngineers.some(
        current => engineers.some(
            fixture =>
                current.employee_code === fixture.employee_code ||
                current.email?.toLowerCase() === fixture.email.toLowerCase()
        )
    );

    const existingPlan = currentPlans.some(
        current => plans.some(
            fixture => current.code === fixture.code
        )
    );

    if (existingEngineer || existingPlan) {
        throw new Error(
            'Ya existen datos de demostración. ' +
            'No se repetirán préstamos ni se modificarán registros.'
        );
    }
}

/**
 * Validate references used by loan operations.
 */
function validateOperations() {
    for (const operation of operations) {
        if (
            !Number.isInteger(operation.engineerIndex) ||
            !Number.isInteger(operation.planIndex) ||
            !engineers[operation.engineerIndex] ||
            !plans[operation.planIndex] ||
            typeof operation.returned !== 'boolean'
        ) {
            throw new Error(
                'Se encontró una operación de préstamo no válida.'
            );
        }
    }
}

/**
 * Execute the data seeding workflow.
 * Dry-run mode is enabled by default.
 */
export async function seed(api, { apply = false } = {}) {

    if (typeof apply !== 'boolean') {
        throw new Error(
            'El modo de ejecución no es válido.'
        );
    }

    // Validate fixture references before writing data.
    validateOperations();

    // Retrieve existing catalog records.
    const currentCategories = await api.list('/categories');
    const categoryIds = resolveCategories(currentCategories);

    const currentEngineers = await api.list('/engineers');

    const activePlans = await api.list('/plans');

    const otherPlans = await api.list(
        '/plans?include_inactive=true'
    );

    // Remove repeated records from combined listings.
    const currentPlans = [
        ...new Map(
            [...activePlans, ...otherPlans].map(
                plan => [plan.id, plan]
            )
        ).values()
    ];

    // Protect existing catalog and historical records.
    validateExistingRecords(
        currentEngineers,
        currentPlans
    );

    // Prepare the execution summary.
    const summary = {
        categories: categoryIds.size,
        engineers: engineers.length,
        plans: plans.length,
        loans: operations.length,
        returns: operations.filter(
            operation => operation.returned
        ).length
    };

    // Preview data without modifying the database.
    if (!apply) {
        return summary;
    }

    const createdEngineers = [];
    const createdPlans = [];

    let stage = 'ingenieros';

    try {

        // Create fictional engineers.
        for (const engineer of engineers) {
            const record = await api.create(
                '/engineers',
                engineer
            );

            createdEngineers.push(record);
        }

        stage = 'planos';

        // Create drawing records.
        for (const fixture of plans) {
            const {
                categorySlug,
                categoryName,
                ...plan
            } = fixture;

            const record = await api.create('/plans', {
                ...plan,
                category_id: categoryIds.get(categorySlug)
            });

            createdPlans.push(record);
        }

        // Create loans and their corresponding returns.
        for (const operation of operations) {
            stage = 'préstamos';

            const loan = await api.create('/loans', {
                engineer_id:
                    createdEngineers[operation.engineerIndex].id,

                plan_id:
                    createdPlans[operation.planIndex].id
            });

            if (operation.returned) {
                stage = 'devoluciones';

                await api.create(
                    `/loans/${loan.id}/returns`,
                    {}
                );
            }
        }

    } catch (error) {
        throw new Error(
            `La carga se interrumpió durante el registro de ${stage}. ` +
            'Es posible que algunos registros se hayan guardado. ' +
            'Revisa la base de datos antes de volver a ejecutar. ' +
            `Detalle: ${error.message}`,
            { cause: error }
        );
    }

    return summary;
}