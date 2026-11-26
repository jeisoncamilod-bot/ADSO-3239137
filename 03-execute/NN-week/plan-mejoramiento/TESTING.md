# Pruebas de Plans Archive

Fecha: 13 de noviembre de 2026.

## Backend

Comando:
docker exec api-api-1 php artisan test

Resultados:
- 29 pruebas aprobadas.
- 65 aserciones.
- Duracion: 20.61 segundos.

## Funcionalidades verificadas

- Autenticacion.
- Autorizacion por roles.
- Creacion de planos.
- Control de disponibilidad.
- Limite de tres prestamos activos.
- Vencimiento a seis dias.
- Restriccion de prestamos vencidos.
- Rechazo de devoluciones duplicadas.
- Actualizacion del inventario.

## Frontend

Comando:
docker exec plans-archive-react npm run build

Resultado:
Compilacion exitosa con Vite 8.3.8.

## Pendiente

Validar manualmente todos los flujos de la interfaz
y comprobar el funcionamiento en un entorno de despliegue.
