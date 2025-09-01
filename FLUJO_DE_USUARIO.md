# Guía de Flujo de Usuario para la API

Este documento describe el flujo de usuario típico para interactuar con la API de Productos y Pedidos.

## 1. Autenticación

Todos los endpoints de esta API están protegidos y requieren un Token de Acceso (JWT) para ser consumidos.

### Obtención del Token

Para obtener un token, el sistema de autenticación (no documentado en este controlador) debe validar las credenciales de un usuario. Una vez validado, el sistema genera un `access_token`.

**Ejemplo de respuesta de login:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwic3ViIjoxLCJpYXQiOjE2MTYxNjc2NjksImV4cCI6MTYxNjE3MTI2OX0.exampleToken"
}
```

### Uso del Token

Para autenticar las peticiones a la API, se debe incluir el `access_token` en la cabecera `Authorization` con el prefijo `Bearer`.

**Ejemplo de cabecera:**
`Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

Si el token es inválido, expiró, o no se provee, la API responderá con un error `401 No autorizado`.

## 2. Gestión de Productos

### Crear un Producto

Para crear un nuevo producto, se debe realizar una petición `POST` al endpoint `/products`. Esta petición debe ser de tipo `multipart/form-data` ya que incluye la imagen del producto.

- **Endpoint:** `POST /products`
- **Cabeceras:** `Authorization: Bearer <token>`
- **Cuerpo (form-data):**
  - `name` (string): Nombre del producto.
  - `sku` (string): SKU único del producto.
  - `price` (number): Precio del producto.
  - `picture` (file): Archivo de imagen del producto.

**Respuesta Exitosa (201):**
La API responderá con el objeto del producto recién creado.

**Posibles Errores:**
- `400 Petición inválida`: Si faltan datos o la imagen no se incluye.
- `401 No autorizado`: Si el token no es válido.

### Obtener Productos

- **Obtener todos los productos:** `GET /products`
- **Obtener un producto por su ID:** `GET /products/{id}`

**Posibles Errores:**
- `401 No autorizado`: Si el token no es válido.
- `404 Producto no encontrado`: Si el ID proporcionado no existe.

## 3. Gestión de Pedidos

### Crear un Pedido

Para crear un nuevo pedido, se realiza una petición `POST` al endpoint `/orders`.

- **Endpoint:** `POST /orders`
- **Cabeceras:** `Authorization: Bearer <token>`
- **Cuerpo (JSON):**
  ```json
  {
    "clientName": "Nombre del Cliente",
    "products": [
      {
        "productId": "605fe2a5e3f5e5a7e8b0b0e5",
        "quantity": 2
      },
      {
        "productId": "605fe2b0e3f5e5a7e8b0b0e6",
        "quantity": 1
      }
    ]
  }
  ```

La API calculará el total basado en los precios de los productos y sus cantidades.

**Posibles Errores:**
- `400 Petición inválida`: Si los datos del pedido son incorrectos.
- `401 No autorizado`: Si el token no es válido.
- `404 Uno de los productos no fue encontrado`: Si algún `productId` en la lista no existe.

### Actualizar un Pedido

Permite cambiar el nombre del cliente o la lista de productos de un pedido existente.

- **Endpoint:** `PATCH /orders/{id}`
- **Cuerpo (JSON):**
  ```json
  {
    "clientName": "Nuevo Nombre del Cliente"
  }
  ```

**Posibles Errores:**
- `401 No autorizado`.
- `404 Pedido o uno de los productos no fue encontrado`.

### Endpoints de Estadísticas

- **Obtener total vendido en el último mes:** `GET /orders/stats/last-month`
- **Obtener el pedido de mayor valor:** `GET /orders/stats/highest`

Estos endpoints no requieren parámetros y devuelven el resultado calculado.
