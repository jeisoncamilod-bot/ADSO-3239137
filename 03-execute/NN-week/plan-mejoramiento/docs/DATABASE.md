# Modelo de datos — Plans Archive

## 1. Convenciones
Nombres de tablas y columnas en inglés, identificadores internos UUID o BIGINT consistentes (esta propuesta usa BIGINT autoincremental), marcas temporales UTC y claves foráneas explícitas. No se borran préstamos ni devoluciones.

## 2. Entidades
### `categories`
| Campo | Tipo lógico | Restricción |
|---|---|---|
| id | BIGINT | PK |
| slug | VARCHAR(60) | único, obligatorio |
| name | VARCHAR(120) | obligatorio |

Semillas: `architectural`, `structural`, `electrical`, `hydraulic`, `road` con nombres visibles en español.

### `plans`
| Campo | Tipo lógico | Restricción |
|---|---|---|
| id | BIGINT | PK |
| code | VARCHAR(60) | único, obligatorio |
| title | VARCHAR(200) | obligatorio |
| description | TEXT | opcional |
| category_id | BIGINT | FK categories |
| total_units | INTEGER | >= 0 |
| available_units | INTEGER | entre 0 y total_units |
| is_active | BOOLEAN | por defecto true |
| created_at, updated_at | TIMESTAMP UTC | obligatorios |

El número de unidades prestadas activamente debe coincidir con `total_units - available_units` tras cada transacción. La edición del total se rechaza si quedaría por debajo de unidades prestadas.

### `engineers`
| Campo | Tipo lógico | Restricción |
|---|---|---|
| id | BIGINT | PK |
| employee_code | VARCHAR(60) | único, obligatorio |
| full_name | VARCHAR(180) | obligatorio |
| email | VARCHAR(180) | opcional, único si existe |
| is_active | BOOLEAN | por defecto true |
| created_at, updated_at | TIMESTAMP UTC | obligatorios |

### `loans`
| Campo | Tipo lógico | Restricción |
|---|---|---|
| id | BIGINT | PK |
| plan_id | BIGINT | FK plans, RESTRICT al eliminar |
| engineer_id | BIGINT | FK engineers, RESTRICT al eliminar |
| plan_code_snapshot | VARCHAR(60) | obligatorio |
| plan_title_snapshot | VARCHAR(200) | obligatorio |
| category_name_snapshot | VARCHAR(120) | obligatorio |
| loaned_at | TIMESTAMP UTC | obligatorio |
| due_at | TIMESTAMP UTC | `loaned_at + 6 days` |
| created_at | TIMESTAMP UTC | obligatorio |

Un préstamo representa **una unidad**. No se edita ni elimina una vez confirmado.

### `returns`
| Campo | Tipo lógico | Restricción |
|---|---|---|
| id | BIGINT | PK |
| loan_id | BIGINT | FK loans, único |
| returned_at | TIMESTAMP UTC | obligatorio |
| created_at | TIMESTAMP UTC | obligatorio |

La unicidad de `loan_id` impide dos devoluciones del mismo préstamo.

## 3. Relaciones
```text
categories 1 --- N plans
plans      1 --- N loans
engineers  1 --- N loans
loans      1 --- 0..1 returns
```

## 4. Invariantes
1. `0 <= available_units <= total_units`.
2. Un préstamo se considera abierto si no existe `returns` para su id.
3. No más de tres préstamos abiertos por ingeniero (invariante transaccional, no simple CHECK).
4. Si hay préstamos abiertos vencidos, se rechazan nuevos préstamos para ese ingeniero.
5. Cada devolución aumenta exactamente una unidad disponible.
6. Desactivar un plano no elimina préstamos históricos.

## 5. Índices
- `plans(code)` UNIQUE.
- `engineers(employee_code)` UNIQUE.
- `loans(engineer_id, due_at)` para vencimientos.
- `loans(plan_id, loaned_at)` para reportes.
- `returns(loan_id)` UNIQUE.

## 6. Consulta del reporte
Agrupar préstamos por `plan_id`, contar `loans.id` y ordenar por cantidad descendente y código ascendente. El reporte incluye préstamos históricos y no se limita a los abiertos.

## 7. Consideraciones de migración
La restricción `available_units <= total_units` debe implementarse como CHECK donde el motor lo permita; la aplicación debe validarla igualmente. Todas las escrituras de préstamo y devolución ocurren en transacciones. Los snapshots se capturan al crear el préstamo y nunca se recalculan desde `plans`.
