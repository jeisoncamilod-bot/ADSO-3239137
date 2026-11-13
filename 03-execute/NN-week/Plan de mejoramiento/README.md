# Plans Archive

Sistema web para la gestion de planos de ingenieria.

## Tecnologias

- React y Vite: interfaz web.
- Laravel: API REST.
- PostgreSQL: base de datos.
- Docker: ejecucion de servicios.

## Funcionalidades

- Autenticacion y autorizacion por roles.
- Consulta y administracion de planos.
- Gestion de ingenieros.
- Registro de prestamos y devoluciones.
- Control de inventario y vencimientos.
- Reporte de planos mas solicitados.

## Estructura

- app/: frontend React.
- api/: backend Laravel.
- docs/: documentacion tecnica.

## Verificacion

Backend:
docker exec api-api-1 php artisan test

Frontend:
docker exec plans-archive-react npm run build

Resultado verificado el 13 de noviembre de 2026:
29 pruebas aprobadas, 65 aserciones.
Compilacion de React exitosa.

## Documentacion

Consultar ARCHITECTURE.md, DESIGN.md,
REQUIREMENTS.md, TESTING.md y la carpeta docs/.
