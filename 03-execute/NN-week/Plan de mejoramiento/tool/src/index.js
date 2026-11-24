/**
 * Plans Archive - Data Seeder Tool
 * Command-line application entry point.
 */

import { loadConfig } from './config.js';
import { ApiClient } from './api-client.js';
import { seed } from './seeder.js';

/**
 * Parse and validate command-line arguments.
 */
function parseArguments(args) {
    const allowedArguments = ['--apply'];

    const invalidArguments = args.filter(
        argument => !allowedArguments.includes(argument)
    );

    if (invalidArguments.length > 0) {
        throw new Error(
            'Opción desconocida. Usa --apply para confirmar la carga.'
        );
    }

    return {
        apply: args.includes('--apply')
    };
}

/**
 * Display the execution summary.
 */
function displaySummary(summary, apply) {
    console.log('\n========================================');
    console.log('           PLANS ARCHIVE');
    console.log('========================================');

    console.log(
        apply
            ? 'Carga de datos completada.'
            : 'Vista previa: no se han creado registros.'
    );

    console.log('----------------------------------------');
    console.log(`Categorías:    ${summary.categories}`);
    console.log(`Ingenieros:    ${summary.engineers}`);
    console.log(`Planos:        ${summary.plans}`);
    console.log(`Préstamos:      ${summary.loans}`);
    console.log(`Devoluciones:  ${summary.returns}`);
    console.log('========================================\n');

    if (!apply) {
        console.log(
            'Usa --apply para ejecutar la carga real de datos.'
        );
    }
}

/**
 * Initialize and execute the application.
 */
async function main() {
    let apply = false;

    try {
        const options = parseArguments(
            process.argv.slice(2)
        );

        apply = options.apply;

        // Load and validate the API configuration.
        const config = loadConfig();

        // Initialize the authenticated API client.
        const api = new ApiClient(config);

        console.log(
            apply
                ? 'Iniciando carga de datos de demostración...'
                : 'Iniciando vista previa de datos...'
        );

        // Execute the seeding workflow.
        const summary = await seed(api, { apply });

        // Display the execution results.
        displaySummary(summary, apply);

    } catch (error) {
        const message = error instanceof Error
            ? error.message
            : 'Error inesperado.';

        console.error(`\nCarga detenida: ${message}`);

        if (apply) {
            console.error(
                'Pueden existir registros parciales. ' +
                'No borres datos ni repitas la carga automáticamente.'
            );
        }

        process.exitCode = 1;
    }
}

// Start the application.
await main();