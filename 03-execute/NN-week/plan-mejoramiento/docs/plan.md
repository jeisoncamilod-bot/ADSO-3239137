# Plan de implementación — Plans Archive

## 1. Estrategia
Desarrollo guiado por especificación (SDD): requisitos → modelo de datos → contrato API → implementación → pruebas → interfaz → infraestructura → verificación integral.

## 2. Fases y criterios de salida
| Fase | Actividades | Evidencia de cierre |
|---|---|---|
| 1. Especificación | Constitución, historias, reglas, RNF y ADR | Documentos consistentes y revisados |
| 2. Diseño | Modelo relacional, API, arquitectura y errores | Contratos y diagramas textuales completos |
| 3. Backend | Migraciones, servicios transaccionales, endpoints | Pruebas de integración exitosas |
| 4. Frontend | Pantallas, formularios, errores y filtros | Flujos completos conectados a la API |
| 5. Página y herramienta | Página pública y sembrador por API | Página publicada y datos de prueba reproducibles |
| 6. Infraestructura | Contenedores, base de datos, configuración | Arranque con un comando |
| 7. Calidad | Pruebas, concurrencia, revisión documental | Al menos 15 archivos de pruebas y trazabilidad |
| 8. Entrega | README, PDF anonimizado, commits, sustentación | Evidencias verificables en el fork |

## 3. Dependencias
- El contrato de API se estabiliza antes de conectar frontend y sembrador.
- Las migraciones preceden a los servicios de negocio.
- Las pruebas de concurrencia deben ejecutarse contra el motor de base de datos real del entorno de entrega.
- Los datos iniciales de categorías se crean antes de cargar planos.

## 4. Riesgos y mitigaciones
| Riesgo | Impacto | Mitigación |
|---|---|---|
| Doble asignación de última unidad | Crítico | Transacciones y bloqueo de filas; prueba concurrente |
| Divergencia entre documentos y código | Alto | Matriz HU/RN/endpoints/pruebas; revisión por cambio |
| Fechas mal interpretadas | Alto | UTC obligatorio y pruebas de límites |
| Pérdida de historial | Alto | Restricciones referenciales y prohibición de borrado |
| Arranque no reproducible | Alto | Contenedores y verificación desde entorno limpio |
| Falta de trazabilidad Git | Alto | Commits pequeños y distribuidos en 8 días reales |

## 5. Verificación y entrega
- Confirmar todas las historias y 23 tareas contra la especificación original.
- Ejecutar pruebas automatizadas; revisar código y documentación.
- Confirmar mínimo 4 commits en cada una de las seis subcarpetas y trabajo repartido en al menos ocho días distintos.
- No versionar secretos ni dependencias generadas.
- Subir en `03-execute/NN-week/plan-mejoramiento/`.
- Entregar hasta el 19-11-2026, 18:00; sustentar el 26-11-2026 desde las 18:00.
- Revisar separadamente la documentación del proyecto grupal Friend Point; también requiere mínimo 70/100.
