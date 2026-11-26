# Contrato HTTP/JSON propuesto — Plans Archive

> **Estado:** contrato propuesto para el dominio A15; verificar rutas y equivalencias con el contrato original de Manager Library antes de congelar la versión 1.

## 1. Convenciones
- Prefijo: `/api/v1`.
- Entrada y salida: `application/json`.
- Identificadores: enteros positivos.
- Fechas: ISO 8601 UTC, por ejemplo `2026-11-11T18:00:00Z`.
- Los mensajes para usuarios se devuelven en español.
- Mutaciones requieren autenticación y autorización del operador.
- Paginación: `page` y `per_page` (máximo propuesto 100).

## 2. Endpoints
| Método | Ruta | Uso | Éxito |
|---|---|---|---|
| GET | `/categories` | Listar categorías | 200 |
| GET | `/plans` | Buscar/listar planos | 200 |
| POST | `/plans` | Crear plano | 201 |
| GET | `/plans/{id}` | Detalle de plano | 200 |
| PATCH | `/plans/{id}` | Actualizar catálogo/cantidad | 200 |
| DELETE | `/plans/{id}` | Baja lógica (`is_active=false`) | 204 |
| GET | `/engineers` | Listar ingenieros | 200 |
| POST | `/engineers` | Crear ingeniero | 201 |
| GET | `/engineers/{id}` | Consultar ingeniero | 200 |
| PATCH | `/engineers/{id}` | Actualizar ingeniero | 200 |
| GET | `/loans` | Listar préstamos; filtros | 200 |
| POST | `/loans` | Registrar préstamo | 201 |
| GET | `/loans/{id}` | Consultar préstamo | 200 |
| POST | `/loans/{id}/returns` | Registrar devolución | 201 |
| GET | `/reports/most-requested-plans` | Reporte de demanda | 200 |

Las rutas anteriores son **diseño propuesto**, no transcripción certificada de la referencia.

## 3. Esquemas de entrada
### Crear plano
```json
{"code":"EST-001","title":"Plano estructural bloque A","category_id":2,"total_units":3,"description":"Versión aprobada"}
```
**Respuesta 201:**
```json
{"data":{"id":10,"code":"EST-001","title":"Plano estructural bloque A","category_id":2,"total_units":3,"available_units":3,"is_active":true}}
```

### Registrar ingeniero
```json
{"employee_code":"ENG-100","full_name":"Carlos Rodríguez","email":"carlos@example.test"}
```

### Registrar préstamo
```json
{"plan_id":10,"engineer_id":5}
```
**Respuesta 201 (ejemplo):**
```json
{"data":{"id":51,"plan_id":10,"engineer_id":5,"plan_code_snapshot":"EST-001","plan_title_snapshot":"Plano estructural bloque A","category_name_snapshot":"Estructurales","loaned_at":"2026-11-11T18:00:00Z","due_at":"2026-11-17T18:00:00Z","status":"open"}}
```
`loaned_at` es generado por el servidor, no enviado por el cliente.

### Registrar devolución
`POST /api/v1/loans/51/returns` con cuerpo `{}`.
**Respuesta 201:**
```json
{"data":{"id":18,"loan_id":51,"returned_at":"2026-11-14T12:00:00Z"}}
```

## 4. Filtros y respuestas
- `GET /plans?search=EST&category_id=2&active=true&page=1`.
- `GET /loans?engineer_id=5&status=overdue&page=1`; `status`: `open`, `closed`, `overdue`.
- `GET /reports/most-requested-plans?limit=10` devuelve `data: [{plan_id, code, title, loan_count}]`.
- Las listas se envuelven en `data` y `meta` con `page`, `per_page`, `total`.

## 5. Errores
```json
{"error":{"code":"PLAN_UNAVAILABLE","message":"No hay unidades disponibles para este plano.","details":{}}}
```
| HTTP | Código ejemplo | Situación |
|---|---|---|
| 400 | BAD_REQUEST | JSON o parámetros inválidos |
| 401 | UNAUTHENTICATED | Sin sesión válida |
| 403 | FORBIDDEN | Sin permiso |
| 404 | NOT_FOUND | Recurso inexistente |
| 409 | PLAN_UNAVAILABLE | Sin unidades disponibles / concurrencia |
| 409 | LOAN_LIMIT_REACHED | Tres préstamos abiertos |
| 409 | OVERDUE_LOANS | Ingeniero con vencidos |
| 409 | ALREADY_RETURNED | Devolución duplicada |
| 409 | INVENTORY_CONFLICT | Total inferior a unidades prestadas |
| 422 | VALIDATION_ERROR | Campos inválidos |
| 500 | INTERNAL_ERROR | Error inesperado, sin filtrar detalles internos |

## 6. Consistencia y concurrencia
Todas las comprobaciones críticas se repiten dentro de la transacción. El 409 por última unidad no debe causar préstamo parcial. La devolución duplicada no debe incrementar disponibilidad. No existen endpoints de borrado físico para `loans` o `returns`.

## 7. Compatibilidad
Cualquier cambio de rutas, nombres de campos o semántica requiere actualización coordinada de `spec.md`, `data-model.md`, frontend, sembrador y pruebas.
