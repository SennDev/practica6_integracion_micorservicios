# Practica 6 - Tienda en Linea

Esta practica integra el frontend Angular de la tienda con una arquitectura de microservicios, bases de datos persistentes y despliegue con Docker Compose.

## Arquitectura

- Frontend Angular servido con Nginx: `http://localhost:4200`
- Microservicio de productos: `http://localhost:3001/productos`
- Microservicio de carrito: `http://localhost:3002/carrito`
- Microservicio de contacto: `http://localhost:3003/contacto`
- Base de datos MongoDB independiente para productos.
- Base de datos MongoDB independiente para carrito.
- Base de datos MongoDB independiente para contacto.

## Endpoints principales

### Productos

- `GET /productos`: consulta el catalogo completo.
- `GET /productos/:id`: consulta un producto por id.
- `POST /productos`: registra un producto.

Ejemplo:

```json
{
  "name": "Laptop Pro 15",
  "price": 1299.99,
  "image": "https://example.com/laptop.jpg"
}
```

### Carrito

- `GET /carrito`: consulta el carrito actual con productos, cantidades y subtotal.
- `POST /carrito/productos`: agrega un producto al carrito.
- `DELETE /carrito/productos/:productId`: elimina un producto del carrito.
- `GET /carrito/subtotal`: consulta el subtotal.
- `DELETE /carrito`: vacia el carrito.

### Contacto

- `POST /contacto`: guarda un mensaje de contacto.
- `GET /contacto`: consulta mensajes recibidos.

Ejemplo:

```json
{
  "nombre": "Pablo",
  "correo": "pablo@example.com",
  "mensaje": "Quiero informacion del producto"
}
```

## Como arrancar todo

Desde la carpeta `tienda-en-linea`:

```bash
docker compose up --build
```

Despues abre:

```text
http://localhost:4200
```

## Como detener todo

```bash
docker compose down
```

Para borrar tambien los datos guardados en MongoDB:

```bash
docker compose down -v
```

## Evidencia para el video

1. Mostrar `docker compose up --build`.
2. Abrir `http://localhost:4200`.
3. Mostrar que el catalogo carga desde `producto-service`.
4. Agregar productos al carrito y abrir `/carrito`.
5. Eliminar productos o finalizar compra para vaciar carrito.
6. Enviar mensaje de contacto.
7. Mostrar endpoints en navegador o Postman:
   - `http://localhost:3001/productos`
   - `http://localhost:3002/carrito`
   - `http://localhost:3003/contacto`
