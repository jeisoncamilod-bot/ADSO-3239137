# Control de consistencia documental

## Revisión cruzada
- Las diez historias HU-01 a HU-10 están definidas en `spec.md` y relacionadas con tareas en `tasks.md`.
- Las seis reglas RN-01 a RN-06 se reflejan en modelo, arquitectura y API.
- Las cinco RNF están definidas en `spec.md`.
- Los 23 ítems T01 a T23 están enumerados en `tasks.md`.
- La API propuesta no contiene borrado físico de préstamos o devoluciones.
- `returns.loan_id` es único y `loans` guarda snapshot del catálogo.
- Los ejemplos de vencimiento suman exactamente seis días UTC.
- La concurrencia de última unidad se resuelve con transacción y HTTP 409.
- El sitio público presenta el producto, no la evaluación.

## Pendiente de validación con referencia original
1. Comparar cada historia con `spec-python/spec.md` o `spec-.net/spec.md`.
2. Comparar los endpoints exactos y sus esquemas con `api-contract.md` original.
3. Alinear las 23 tareas con los identificadores, dependencias y evidencias originales.
4. Comprobar si el documento original exige campos, estados, permisos o casos límite adicionales.
5. Ajustar los ADR y el modelo de datos si la referencia impone decisiones distintas.

**No se declara equivalencia exacta con el spec original hasta completar este cotejo.**
