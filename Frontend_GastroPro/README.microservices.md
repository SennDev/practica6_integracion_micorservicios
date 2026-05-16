# GastroPro

Proyecto adaptado para la práctica 6 de microservicios. Esta carpeta contiene:

- Frontend Angular original ajustado para consumir APIs REST.
- Microservicios Express independientes dentro de `backend/services`.
- Base de datos PostgreSQL compartida por aplicación con separación lógica por esquemas.
- Despliegue local mediante Docker Compose.

## Servicios

- `menu-service` expone /api/menu
- `orders-service` expone /api/orders
- `reservations-service` expone /api/reservations
- `restaurant-contact-service` expone /api/contact

## Puertos

- Frontend: `http://localhost:4304`
- PostgreSQL: `localhost:5404`
- menu-service: `http://localhost:4430`
- orders-service: `http://localhost:4431`
- reservations-service: `http://localhost:4432`
- restaurant-contact-service: `http://localhost:4433`

## Arranque

```bash
docker compose up --build
```

## Nota

Se utiliza una base PostgreSQL por aplicación y separación lógica por microservicio, alineado con la opción permitida en el PDF para el desarrollo.
