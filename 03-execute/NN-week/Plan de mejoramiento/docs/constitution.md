# Constitución del proyecto — Plans Archive

## 1. Misión
Construir un sistema confiable de préstamo y devolución de planos para una oficina de ingeniería, con reglas verificables y operaciones auditables.

## 2. Principios obligatorios
1. **La especificación dirige el código.** Toda funcionalidad implementada debe estar descrita en `spec.md` y `api-contract.md`; los cambios exigen actualizar documentos y pruebas.
2. **Integridad transaccional.** Un préstamo o devolución modifica existencias y registros de forma atómica; no se admiten disponibilidades negativas ni superiores al total.
3. **Historial inmutable.** Los préstamos y las devoluciones se conservan; se corrigen mediante operaciones explícitas, no eliminando registros históricos.
4. **Baja lógica.** El catálogo se desactiva sin borrar referencias históricas.
5. **Seguridad por defecto.** Validación en servidor, autorización para operaciones, secretos fuera del repositorio y respuestas sin información sensible.
6. **UTC en persistencia.** Las fechas se guardan y transmiten en UTC, con formato ISO 8601; la interfaz puede mostrar la zona local.
7. **Separación de responsabilidades.** React presenta la interfaz; Laravel valida el negocio y persiste; la base de datos aplica restricciones adicionales.
8. **Lenguaje del código.** Clases, variables, funciones, tablas y rutas en inglés; mensajes visibles al usuario en español.
9. **Pruebas reproducibles.** Reglas críticas, concurrencia y contratos deben estar cubiertos con pruebas automatizadas.
10. **Alcance controlado.** No incorporar funciones fuera de la especificación aprobada.

## 3. Restricciones del plan
- React para frontend y PHP/Laravel para backend.
- Sitio público estático separado, dedicado al producto.
- Entorno con base de datos levantable con un solo comando.
- Sembrador que cargue datos a través de la API.
- Cinco categorías iniciales: arquitectónicos, estructurales, eléctricos, hidráulicos y viales.
- Al menos 15 archivos de pruebas automatizadas en el producto final.
- Commits pequeños durante al menos ocho días diferentes; no versionar `.env` ni `node_modules`.

## 4. Definición de terminado
Una funcionalidad está terminada cuando cumple los criterios de aceptación, las reglas de negocio, la validación de entrada, los casos de error, las pruebas y la documentación correspondiente.

## 5. Gobierno de cambios
Todo cambio debe registrar motivo, documentos afectados, migraciones necesarias, pruebas modificadas y decisión de aceptación. Las decisiones estructurales se documentan como ADR.
