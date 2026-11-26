/**
 * Plans Archive - Data Seeder Tool
 * Engineering domain seed fixtures.
 */

const ENGINEER_COUNT = 10;
const PLANS_PER_CATEGORY = 5;
const LOAN_COUNT = 15;
const RETURN_COUNT = 5;
const UNITS_PER_PLAN = 3;

/**
 * Required engineering drawing categories.
 */
export const categories = [
    ['architectural', 'Arquitectónicos', 'ARQ'],
    ['structural', 'Estructurales', 'EST'],
    ['electrical', 'Eléctricos', 'ELE'],
    ['hydraulic', 'Hidráulicos', 'HID'],
    ['road', 'Viales', 'VIA']
];

/**
 * Generate fictional engineer records.
 */
export const engineers = Array.from(
    { length: ENGINEER_COUNT },
    (_, index) => {
        const number = index + 1;

        return {
            employee_code:
                `DEMO-ENG-${String(number).padStart(3, '0')}`,

            full_name:
                `Ingeniero de prueba ${number}`,

            email:
                `demo-engineer-${number}@example.test`
        };
    }
);

/**
 * Generate drawing records for each category.
 */
export const plans = categories.flatMap(
    ([slug, name, prefix]) =>
        Array.from(
            { length: PLANS_PER_CATEGORY },
            (_, index) => {
                const number = index + 1;

                return {
                    categorySlug: slug,
                    categoryName: name,

                    code: `DEMO-${prefix}-${number}`,

                    title:
                        `Plano de prueba ${name.toLowerCase()} ${number}`,

                    description:
                        'Registro ficticio para demostración.',

                    total_units: UNITS_PER_PLAN
                };
            }
        )
);

/**
 * Generate loan and return scenarios.
 */
export const operations = Array.from(
    { length: LOAN_COUNT },
    (_, index) => ({
        engineerIndex: index % engineers.length,
        planIndex: index,
        returned: index < RETURN_COUNT
    })
);