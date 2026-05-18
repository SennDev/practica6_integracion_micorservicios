# CinePlus - Practica 6 Microservicios + Angular + Docker

Solucion completa para el apartado **Equipo 2. CinePlus**.

Incluye:

- Frontend Angular ejecutado con Nginx.
- Microservicio de peliculas.
- Microservicio de funciones.
- Microservicio de seleccion/reserva de asientos.
- Microservicio de compras y boletos.
- Una base de datos PostgreSQL independiente por microservicio.
- Orquestacion completa con Docker Compose.

## Arquitectura

| Contenedor | Responsabilidad | Base de datos |
| --- | --- | --- |
| `cineplus-frontend` | Interfaz Angular y proxy `/api` | No aplica |
| `cineplus-movies-service` | Cartelera, registro, busqueda y filtros de peliculas | `cineplus-movies-db` |
| `cineplus-showtimes-service` | Fechas, horarios y salas por pelicula | `cineplus-showtimes-db` |
| `cineplus-seats-service` | Disponibilidad y reserva de asientos | `cineplus-seats-db` |
| `cineplus-purchases-service` | Compra, descuento, total y generacion de boletos | `cineplus-purchases-db` |

## Requisitos

1. Tener instalado **Docker Desktop**.
2. Abrir Docker Desktop y esperar a que indique que esta corriendo.
3. Abrir una terminal en la carpeta `cineplus`.

En Windows puedes usar PowerShell:

```powershell
cd "C:\Users\rodro\Documents\Codex\2026-05-17\files-mentioned-by-the-user-practica\cineplus"
```

## Ejecutar todo

La primera vez Docker descargara imagenes y dependencias. Puede tardar varios minutos.

```powershell
docker compose up --build
```

Cuando termine de levantar, abre:

```text
http://localhost:8080
```

Para detener todo, en la misma terminal presiona:

```text
Ctrl + C
```

Si quieres detener y eliminar contenedores, ejecuta:

```powershell
docker compose down
```

Si quieres borrar tambien los datos guardados en las bases de datos:

```powershell
docker compose down -v
```

## Como probar desde la app

1. Entra a `http://localhost:8080`.
2. Observa la cartelera cargada desde el microservicio de peliculas.
3. Filtra por genero si quieres.
4. Elige una pelicula.
5. Selecciona una funcion.
6. Selecciona uno o varios asientos.
7. Opcionalmente escribe un cupon:
   - `CINE10`
   - `ESTUDIANTE15`
8. Haz clic en **Comprar boletos**.
9. La app primero reserva asientos y luego genera boletos.
10. Si vuelves a seleccionar la misma funcion, los asientos comprados aparecen ocupados.

## Probar endpoints con navegador

Estos endpoints se pueden abrir desde el navegador cuando el frontend esta levantado:

```text
http://localhost:8080/api/movies
http://localhost:8080/api/movies/name/Duna:%20Parte%20Dos
http://localhost:8080/api/showtimes?movieName=Duna:%20Parte%20Dos
http://localhost:8080/api/seats/availability/1
http://localhost:8080/api/purchases
http://localhost:8080/api/purchases/coupons/CINE10
```

## Probar con PowerShell

Consultar cartelera:

```powershell
Invoke-RestMethod http://localhost:8080/api/movies
```

Consultar funciones de una pelicula:

```powershell
Invoke-RestMethod "http://localhost:8080/api/showtimes?movieName=Duna:%20Parte%20Dos"
```

Reservar asientos:

```powershell
Invoke-RestMethod `
  -Method Post `
  -Uri http://localhost:8080/api/seats/reservations `
  -ContentType "application/json" `
  -Body '{"showtime_id":1,"movie_name":"Duna: Parte Dos","show_date":"2026-05-20","show_time":"16:00","seats":["A1","A2"]}'
```

Crear compra:

```powershell
Invoke-RestMethod `
  -Method Post `
  -Uri http://localhost:8080/api/purchases `
  -ContentType "application/json" `
  -Body '{"movie_name":"Duna: Parte Dos","showtime_id":1,"seats":["A1","A2"],"base_price":95,"coupon":"CINE10"}'
```

Si intentas reservar otra vez los mismos asientos, el microservicio responde con conflicto `409`, demostrando que evita doble reservacion.

## Microservicios implementados segun el PDF

### 1. Microservicio de Peliculas

Endpoints principales:

- `GET /movies`
- `GET /movies?genre=Accion`
- `GET /movies/name/:name`
- `POST /movies`

Datos:

- `id`
- `name`
- `genre`
- `duration`
- `poster`
- `synopsis`
- `trailer`
- `base_price`

### 2. Microservicio de Funciones

Endpoints principales:

- `GET /showtimes`
- `GET /showtimes?movieName=...`
- `GET /showtimes/:id`
- `POST /showtimes`

Valida que no se duplique una funcion con la misma pelicula, fecha, hora y sala.

### 3. Microservicio de Seleccionar Funcion / Asientos

Endpoints principales:

- `GET /availability/:showtimeId`
- `POST /reservations`

Usa una restriccion unica por `showtime_id` y `seat`, por eso evita doble reservacion del mismo asiento.

### 4. Microservicio de Compras y Boletos

Endpoints principales:

- `GET /coupons/:code`
- `GET /purchases`
- `POST /purchases`

Calcula:

- subtotal
- descuento
- total
- boletos generados

## Comandos utiles de Docker

Ver contenedores corriendo:

```powershell
docker compose ps
```

Ver logs de todos los servicios:

```powershell
docker compose logs -f
```

Ver logs de un microservicio:

```powershell
docker compose logs -f movies-service
```

Reconstruir desde cero:

```powershell
docker compose down -v
docker compose up --build
```

## Nota sobre Angular

No necesitas instalar Angular en tu maquina para ejecutar esta entrega con Docker. Docker construye el frontend dentro de un contenedor usando Node y despues lo sirve con Nginx en `http://localhost:8080`.
