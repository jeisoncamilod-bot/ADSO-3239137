# Arquitectura de software — Plans Archive

## 1. Estilo
Aplicación web cliente-servidor, con frontend React, API REST Laravel y base de datos relacional. Un sitio público estático y un sembrador externo completan el producto.

## 2. Diagrama lógico
```text
[Usuario / Navegador]
        |
        +--> [React SPA: app] ------HTTP/JSON------> [Laravel API: api]
        |                                              |
        +--> [Sitio estático: page]                     +--> [Servicios de dominio]
                                                       |       |
[Sembrador: tool] ----------HTTP/JSON------------------+       +--> [Repositorios/ORM]
                                                               |
                                                       [Base de datos relacional]

[infra] orquesta API, frontend y base de datos; no contiene lógica de negocio.
```

## 3. Responsabilidades
- **app:** navegación, formularios, validación de experiencia de usuario, presentación de errores y estados.
- **api/controllers:** rutas HTTP, validación sintáctica, autorización y serialización.
- **api/services:** reglas de préstamo, devolución, inventario y transacciones.
- **api/models:** relaciones y acceso a persistencia.
- **page:** presentación pública del producto, sin modificar datos.
- **tool:** sembrado idempotente a través de endpoints autorizados, nunca mediante SQL directo.
- **infra:** Docker Compose, red interna, volúmenes y variables de entorno de ejemplo.

## 4. Flujo: registrar préstamo
1. El operador selecciona ingeniero y plano en React.
2. React envía `POST /api/v1/loans`.
3. Laravel valida la entrada y abre una transacción.
4. Bloquea el registro de inventario del plano y el registro del ingeniero para serializar préstamos concurrentes del mismo ingeniero.
5. Verifica que ambos estén activos, que el ingeniero tenga menos de tres préstamos abiertos, que no tenga vencidos y que existan unidades disponibles.
6. Guarda préstamo y snapshot del plano; decrementa disponibilidad.
7. Confirma la transacción y devuelve HTTP 201.
8. Ante falta de disponibilidad o conflicto de reglas devuelve HTTP 409, sin cambios parciales.

## 5. Flujo: devolución
1. Se recibe `POST /api/v1/loans/{id}/returns`.
2. Se abre transacción y se bloquean préstamo y plano en un orden consistente para reducir interbloqueos.
3. Si ya existe devolución, se responde 409.
4. Se registra devolución y se incrementa disponibilidad.
5. Se confirma la transacción y se devuelve 201.

## 6. Política de bloqueos
Para minimizar interbloqueos, las operaciones deben adquirir bloqueos en orden documentado y estable. Para préstamos: ingeniero y luego plano; para devoluciones, se consulta el préstamo y se bloquean las entidades implicadas según un protocolo uniforme definido en el servicio. Las pruebas de integración deben verificar ausencia de sobreasignación, no asumir que el bloqueo de una sola fila protege el límite por ingeniero.

## 7. Fechas y estados
- `loaned_at`, `due_at` y `returned_at` se guardan en UTC.
- Un préstamo está **abierto** cuando no tiene devolución y **cerrado** cuando sí la tiene.
- **Vencido** es una condición calculada: abierto y `due_at < now_utc`.
- Una devolución tardía conserva su fecha real y el vencimiento original.

## 8. Seguridad y configuración
API protegida para mutaciones; credenciales y claves en variables de entorno, nunca en Git. CORS restringido a orígenes configurados. Registros técnicos con identificador de operación, sin secretos ni datos innecesarios.

## 9. Decisiones relacionadas
ADR-001 arquitectura cliente-servidor; ADR-002 persistencia relacional; ADR-003 control de concurrencia.
