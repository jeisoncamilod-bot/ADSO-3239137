# ADR-003 — Control transaccional de concurrencia

**Estado:** Aceptada para el diseño propuesto  
**Contexto:** dos operadores pueden solicitar simultáneamente la última unidad de un plano.

## Decisión
Validar y modificar existencias dentro de una transacción con bloqueo de filas (`SELECT ... FOR UPDATE` mediante ORM o equivalente). Serializar también los préstamos del mismo ingeniero para respetar el límite de tres. En conflicto por disponibilidad responder HTTP 409.

## Alternativas
- Comprobar existencias en frontend: falla ante solicitudes concurrentes.
- Leer y escribir sin bloqueo: permite sobreasignaciones.
- Cola asíncrona: complejidad innecesaria para este alcance.

## Consecuencias
**Positivas:** integridad bajo concurrencia y resultado determinista del inventario.  
**Costos:** posible espera por bloqueos, necesidad de definir orden de adquisición y reintentos controlados ante deadlocks.

## Verificación
Con una unidad disponible, ejecutar dos préstamos simultáneos mediante conexiones independientes: exactamente uno devuelve 201, otro 409, queda una sola operación nueva y `available_units = 0`.
