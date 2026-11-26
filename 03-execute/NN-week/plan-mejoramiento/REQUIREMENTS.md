# Especificación funcional — Plans Archive

## 1. Problema y objetivo
Una oficina de ingeniería administra unidades físicas de planos y necesita conocer existencias, responsables, vencimientos y movimientos históricos. Plans Archive centraliza ese control y evita préstamos incompatibles con la disponibilidad o con el estado del ingeniero.

## 2. Alcance
Incluye catálogo de planos, categorías, ingenieros, préstamos, devoluciones, consultas y reporte de planos más solicitados. No incluye facturación, multas monetarias ni eliminación física de movimientos.

## 3. Actores
- **Planotecario:** operador que consulta y registra préstamos y devoluciones.
- **Administrador:** operador autorizado para administrar el catálogo y los ingenieros.
- **Ingeniero:** destinatario de los préstamos; no se presupone un portal de autoservicio.

## 4. Historias de usuario propuestas (HU-01 a HU-10)
Estas diez historias concretan el dominio del acta; requieren contraste con las diez historias originales de Manager Library.

### HU-01 — Consultar catálogo
Como planotecario, quiero listar y buscar planos por código, título o categoría para localizar existencias.
**Aceptación:** el listado muestra código, categoría, total, disponibles y estado; los planos inactivos no aparecen por defecto.

### HU-02 — Registrar plano
Como administrador, quiero crear un plano con código único, título, categoría y cantidad total para ponerlo a disposición.
**Aceptación:** código único; total entero >= 0; disponibles iniciales iguales al total; categoría existente.

### HU-03 — Actualizar o desactivar plano
Como administrador, quiero editar datos del catálogo y desactivar planos para mantener información vigente.
**Aceptación:** no se permite que el total sea menor que las unidades actualmente prestadas; la baja es lógica; el historial conserva la descripción congelada del préstamo.

### HU-04 — Gestionar ingenieros
Como planotecario, quiero registrar, consultar y actualizar ingenieros para asociar préstamos a responsables identificables.
**Aceptación:** identificador único; ingeniero activo para nuevos préstamos; datos obligatorios validados.

### HU-05 — Registrar préstamo
Como planotecario, quiero prestar una unidad de un plano a un ingeniero para dejar constancia de la entrega.
**Aceptación:** máximo tres préstamos activos por ingeniero; sin vencidos; unidad disponible; fecha de vencimiento exactamente seis días después de la fecha de préstamo; decremento de disponibilidad atómico.

### HU-06 — Consultar préstamos y vencimientos
Como planotecario, quiero consultar préstamos abiertos, cerrados y vencidos para dar seguimiento.
**Aceptación:** un préstamo abierto está vencido si `due_at < now_utc`; filtros por ingeniero, plano y estado; no se alteran registros al consultar.

### HU-07 — Registrar devolución
Como planotecario, quiero registrar la devolución de un préstamo abierto para restituir una unidad disponible.
**Aceptación:** una devolución por préstamo; incremento de disponibilidad atómico; segunda devolución rechazada sin duplicar existencias; conservar historial.

### HU-08 — Consultar detalle e historial
Como planotecario, quiero consultar los datos congelados del plano y el historial de movimientos para auditar operaciones.
**Aceptación:** un cambio posterior de título/código de catálogo no modifica el snapshot del préstamo.

### HU-09 — Ver reporte de planos más solicitados
Como administrador, quiero ordenar planos por cantidad de préstamos registrados para identificar demanda.
**Aceptación:** contabiliza operaciones históricas, incluso devueltas; orden descendente y desempate estable por código.

### HU-10 — Operar de manera concurrente y segura
Como planotecario, quiero recibir un error claro si otra persona toma la última unidad para evitar sobreasignaciones.
**Aceptación:** dos solicitudes simultáneas sobre la última unidad producen una operación exitosa y otra HTTP 409; la disponibilidad final es cero.

## 5. Reglas de negocio (RN-01 a RN-06)
- **RN-01:** un ingeniero puede mantener como máximo tres préstamos abiertos.
- **RN-02:** el vencimiento ocurre seis días exactos después de `loaned_at`, en UTC.
- **RN-03:** un ingeniero con cualquier préstamo abierto vencido no puede obtener otro hasta devolver los vencidos.
- **RN-04:** `0 <= available_units <= total_units`; la reserva y la devolución son transacciones atómicas.
- **RN-05:** cada préstamo almacena el snapshot del plano; préstamos y devoluciones no se eliminan, y los planos solo se desactivan lógicamente.
- **RN-06:** fechas persistidas en UTC y mensajes de interfaz/errores orientados al usuario en español.

**Regla complementaria de concurrencia exigida por el acta:** si dos operadores compiten por la última unidad, solo uno obtiene éxito y el otro recibe 409. Se implementa mediante bloqueo transaccional; no se interpreta como una séptima regla de negocio numerada.

## 6. Requisitos no funcionales propuestos (RNF-01 a RNF-05)
- **RNF-01 Integridad:** restricciones y transacciones preservan invariantes incluso con solicitudes concurrentes.
- **RNF-02 Seguridad:** autenticación/autorización para mutaciones, validación y manejo seguro de secretos.
- **RNF-03 Mantenibilidad:** separación de capas, código en inglés, documentación y pruebas.
- **RNF-04 Portabilidad:** ejecución reproducible mediante contenedores y un comando de arranque.
- **RNF-05 Observabilidad y usabilidad:** respuestas JSON consistentes, errores legibles en español y registro técnico sin exponer secretos.

## 7. Ejemplos de escenarios
1. Ingeniero con dos préstamos abiertos y ninguno vencido: puede recibir un tercero si hay existencias.
2. Ingeniero con tres abiertos: solicitud adicional rechazada con 409.
3. Ingeniero con un préstamo abierto vencido: solicitud rechazada con 409 aunque tenga solo uno.
4. Plano con una unidad disponible y dos solicitudes simultáneas: una confirmada y otra rechazada con 409.
5. Plano desactivado: no admite nuevos préstamos; los anteriores siguen consultables y pueden devolverse.
6. Devolución repetida: rechazada con 409; el inventario no se incrementa dos veces.

## 8. Exclusiones y aclaraciones
No se inventa una política de multas, reservas, prórrogas ni notificaciones automáticas. La autenticación se plantea como control técnico mínimo y debe alinearse con el contrato de referencia.
