# Plan de tareas — Plans Archive

> **Importante:** las 23 tareas siguientes son una descomposición de ingeniería propuesta. La correspondencia exacta con las 23 tareas originales requiere cotejo con `tasks.md` de Manager Library.

| ID | Tarea | Evidencia de aceptación |
|---|---|---|
| T01 | Crear estructura de seis subcarpetas | Árbol del proyecto y README |
| T02 | Elaborar constitución y especificación | `constitution.md`, `spec.md` |
| T03 | Documentar arquitectura y ADR | Arquitectura y tres ADR |
| T04 | Definir modelo y contrato de API | Modelo y endpoints consistentes |
| T05 | Configurar proyecto Laravel | API arranca y healthcheck interno |
| T06 | Crear migraciones y restricciones | Tablas e índices correctos |
| T07 | Sembrar cinco categorías | Categorías disponibles |
| T08 | Implementar catálogo de planos | CRUD con baja lógica |
| T09 | Implementar gestión de ingenieros | Alta, consulta y edición |
| T10 | Implementar registro de préstamos | Transacción y seis reglas |
| T11 | Implementar devoluciones | Una devolución por préstamo |
| T12 | Implementar filtros e historial | Estados y snapshots correctos |
| T13 | Implementar reporte de demanda | Orden y conteos correctos |
| T14 | Implementar autenticación y validación | Mutaciones protegidas y errores claros |
| T15 | Probar concurrencia de última unidad | Un 201 y un 409 simultáneos |
| T16 | Configurar aplicación React | Arranque y cliente HTTP |
| T17 | Construir vistas de catálogo | Listar, buscar, crear, editar, desactivar |
| T18 | Construir vistas de ingenieros | Alta y consultas |
| T19 | Construir vistas de préstamos/devoluciones | Flujos completos y mensajes |
| T20 | Construir reporte y estados de carga | Reporte funcional, errores visibles |
| T21 | Crear sitio público estático | Presenta el producto |
| T22 | Preparar contenedores y sembrador por API | Un comando; carga reproducible |
| T23 | Integrar, probar y entregar | >=15 archivos de pruebas, commits y sustentación |

## Matriz de trazabilidad
| Historia | Reglas | Endpoints principales | Tareas |
|---|---|---|---|
| HU-01 | RN-04, RN-05 | GET /plans, GET /plans/{id} | T08, T17 |
| HU-02 | RN-04 | POST /plans | T06, T08, T17 |
| HU-03 | RN-04, RN-05 | PATCH/DELETE /plans/{id} | T08, T17 |
| HU-04 | RN-01, RN-03 | GET/POST/PATCH /engineers | T09, T18 |
| HU-05 | RN-01 a RN-06 | POST /loans | T10, T15, T19 |
| HU-06 | RN-02, RN-03 | GET /loans | T12, T19 |
| HU-07 | RN-04, RN-05 | POST /loans/{id}/returns | T11, T19 |
| HU-08 | RN-05 | GET /loans/{id} | T12, T19 |
| HU-09 | RN-05 | GET /reports/most-requested-plans | T13, T20 |
| HU-10 | RN-04 | POST /loans | T10, T15 |

## Plan de pruebas (mínimo 15 archivos propuestos)
1. `CategoryApiTest.php`
2. `PlanListTest.php`
3. `PlanCreateTest.php`
4. `PlanUpdateTest.php`
5. `PlanDeactivateTest.php`
6. `EngineerCreateTest.php`
7. `EngineerUpdateTest.php`
8. `LoanCreateTest.php`
9. `LoanLimitTest.php`
10. `OverdueLoanTest.php`
11. `LoanDueDateTest.php`
12. `ReturnCreateTest.php`
13. `DuplicateReturnTest.php`
14. `LoanSnapshotTest.php`
15. `MostRequestedReportTest.php`
16. `ConcurrentLastUnitTest.php`
17. `InventoryInvariantTest.php`

Los nombres son sugeridos; se requiere ejecutar pruebas reales y no solo crear archivos vacíos. Los tests de concurrencia deben utilizar procesos/conexiones independientes y una base de datos que soporte bloqueos reales.

## Evidencia de cierre
Cada tarea debe tener commit, código verificable, pruebas relevantes y correspondencia con la documentación. No marcar como terminada una tarea sin ejecución demostrable.
