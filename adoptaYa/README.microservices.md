# AdoptaYa

Proyecto adaptado para la práctica 6 de microservicios. Esta carpeta contiene:

- Frontend Angular original ajustado para consumir APIs REST.
- Microservicios Express independientes dentro de `backend/services`.
- Base de datos PostgreSQL compartida por aplicación con separación lógica por esquemas.
- Despliegue local mediante Docker Compose.

## Servicios

- `pets-service` expone /api/pets
- `applications-service` expone /api/applications
- `adoption-contact-service` expone /api/contact

## Puertos

- Frontend: `http://localhost:4306`
- PostgreSQL: `localhost:5406`
- pets-service: `http://localhost:4450`
- applications-service: `http://localhost:4451`
- adoption-contact-service: `http://localhost:4452`

## Arranque

```bash
docker compose up --build
```

## Nota

Se utiliza una base PostgreSQL por aplicación y separación lógica por microservicio, alineado con la opción permitida en el PDF para el desarrollo.
