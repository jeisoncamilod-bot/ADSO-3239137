# ADR-002 — Persistencia relacional e historial

**Estado:** Aceptada para el diseño propuesto  
**Contexto:** inventario, referencias y devoluciones requieren integridad y trazabilidad.

## Decisión
Usar base de datos relacional con claves foráneas, restricciones, transacciones, snapshots en préstamos y una tabla `returns` con `loan_id` único. Prohibir borrado físico de movimientos; catálogo con `is_active`.

## Alternativas
- Documentos sin relaciones estrictas: aumentan el trabajo de garantizar consistencia.
- Sobrescribir datos de préstamos al devolver: reduce trazabilidad.

## Consecuencias
**Positivas:** historial auditable y consultas consistentes.  
**Costos:** migraciones cuidadosas y transacciones obligatorias.

## Verificación
Actualizar el título del plano no cambia préstamos anteriores; una devolución repetida no crea un segundo registro.
