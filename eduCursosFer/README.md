# EduCursos con arquitectura de microservicios

Esta solución toma el frontend Angular proporcionado y lo conecta con tres microservicios independientes:

- `courses-service`: administra el catálogo académico.
- `enrollments-service`: registra inscripciones y evita duplicados por curso y correo.
- `contact-service`: persiste mensajes del formulario de contacto.

Cada microservicio tiene su propia base de datos PostgreSQL y se despliega junto con el frontend usando `docker-compose`.

## Arquitectura

```text
Angular SSR (frontend)
        |
        +-- /api/courses ------> courses-service ------> PostgreSQL (courses_db)
        |
        +-- /api/enrollments --> enrollments-service --> PostgreSQL (enrollments_db)
        |
        +-- /api/contact ------> contact-service ------> PostgreSQL (contact_db)
```

El frontend usa rutas relativas `/api/...` y su servidor SSR actúa como proxy. Eso evita problemas de CORS y mantiene la misma configuración en desarrollo y en Docker.

## Endpoints principales

### Cursos

- `GET /api/courses`
- `GET /api/courses?search=angular&category=Frontend`
- `GET /api/courses/categories`
- `GET /api/courses/by-name/:nombre`
- `GET /api/courses/:id`
- `POST /api/courses`

### Inscripciones

- `GET /api/enrollments`
- `GET /api/enrollments?email=ana@correo.com`
- `GET /api/enrollments/stats/active-by-course`
- `POST /api/enrollments`
- `PATCH /api/enrollments/:id/cancel`

### Contacto académico

- `GET /api/contact/messages`
- `POST /api/contact/messages`

## Cómo ejecutar con Docker

Desde la raíz del proyecto:

```bash
docker compose up --build
```

Servicios disponibles:

- Frontend: `http://localhost:4000`
- Cursos API: `http://localhost:3001/api/courses`
- Inscripciones API: `http://localhost:3002/api/enrollments`
- Contacto API: `http://localhost:3003/api/contact/messages`

## Cómo ejecutar localmente sin Docker

1. Instala dependencias:

```bash
cd microservices/courses-service && npm install
cd ../enrollments-service && npm install
cd ../contact-service && npm install
cd ../../cursos && npm install
```

2. Levanta tres bases de datos PostgreSQL locales o usa las del `docker-compose`.
3. Inicia los microservicios:

```bash
cd microservices/courses-service && npm start
cd ../enrollments-service && npm start
cd ../contact-service && npm start
```

4. Inicia el frontend:

```bash
cd cursos && npm start
```

## Estructura

```text
practicaGERSON/
├─ cursos/
├─ microservices/
│  ├─ courses-service/
│  ├─ enrollments-service/
│  └─ contact-service/
├─ docker-compose.yml
└─ README.md
```
