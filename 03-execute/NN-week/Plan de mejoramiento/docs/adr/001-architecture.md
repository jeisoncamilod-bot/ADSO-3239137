# ADR-001 — Arquitectura web separada

**Estado:** Aceptada para el diseño propuesto  
**Contexto:** el acta exige React y Laravel y un sitio público estático independiente.

## Decisión
Adoptar frontend React (SPA), API REST Laravel y página pública estática; concentrar la lógica de negocio en servicios de Laravel.

## Alternativas
- Aplicación monolítica con vistas servidor: simplifica despliegue, pero no cumple la separación React/Laravel solicitada.
- Lógica de negocio en React: insegura y susceptible a inconsistencias entre clientes.

## Consecuencias
**Positivas:** contrato verificable, pruebas por capas y cliente desacoplado.  
**Costos:** configuración CORS, gestión de errores y despliegue coordinado.

## Verificación
Los préstamos no deben poder ejecutarse omitiendo validaciones del servidor mediante llamadas directas a la API.
