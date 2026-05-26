# API Front Guide

Guia tecnica de APIs para implementar un frontend sobre `bff-cordillera`, `ms-auth` y `ms-users`.

## 1. Base URLs

- BFF: `http://localhost:8080`
- MS Auth: `http://localhost:8081`
- MS Users: `http://localhost:8082`

## 2. Flujo recomendado para frontend

1. Registrar usuario por BFF (`POST /bff/usuarios/register`).
2. Iniciar sesion contra ms-auth (`POST /auth/login`).
3. Guardar `accessToken` y `refreshToken`.
4. Consultar perfil por BFF (`GET /bff/usuarios/me`) usando bearer token.
5. Renovar token con `POST /auth/refresh` cuando corresponda.

## 3. Endpoints BFF (consumo principal)

### 3.1 Registrar usuario

- Metodo: `POST`
- URL: `/bff/usuarios/register`
- Request JSON:

```json
{
  "rut": "87654321",
  "dv": "4",
  "nombre": "Niquin",
  "apellido": "Bodoque",
  "email": "niquin@demo.cl",
  "password": "Abc#1234"
}
```

- Respuesta exitosa: `201 Created`
- Response JSON:

```json
{
  "id": "uuid",
  "rut": "87654321",
  "dv": "4",
  "nombre": "Niquin",
  "apellido": "Bodoque",
  "email": "niquin@demo.cl",
  "roles": []
}
```

- Errores frecuentes:
  - `400`: payload invalido o `password` ausente.
  - `409`: `rut` o `email` ya existente en ms-users.
  - `502`: fallo de comunicacion entre BFF y microservicios.

### 3.2 Obtener perfil del usuario autenticado

- Metodo: `GET`
- URL: `/bff/usuarios/me`
- Header requerido:

```text
Authorization: Bearer <accessToken>
```

- Respuesta exitosa: `200 OK`
- Response JSON:

```json
{
  "id": "uuid",
  "rut": "87654321",
  "dv": "4",
  "nombre": "Niquin",
  "apellido": "Bodoque",
  "email": "niquin@demo.cl",
  "roles": ["USER"]
}
```

- Error frecuente:
  - `401`: token ausente, invalido o expirado.

## 4. Endpoints ms-auth (autenticacion)

### 4.1 Login

- Metodo: `POST`
- URL: `/auth/login`
- Request JSON:

```json
{
  "email": "niquin@demo.cl",
  "password": "Abc#1234"
}
```

- Respuesta `200 OK`:

```json
{
  "usuarioId": "uuid",
  "email": "niquin@demo.cl",
  "accessToken": "jwt",
  "refreshToken": "jwt"
}
```

### 4.2 Refresh token

- Metodo: `POST`
- URL: `/auth/refresh`
- Request JSON:

```json
{
  "refreshToken": "jwt"
}
```

- Respuesta `200 OK`:

```json
{
  "usuarioId": "uuid",
  "email": "niquin@demo.cl",
  "accessToken": "jwt_nuevo",
  "refreshToken": "jwt"
}
```

### 4.3 Logout

- Metodo: `POST`
- URL: `/auth/logout`
- Request JSON:

```json
{
  "refreshToken": "jwt"
}
```

- Respuesta esperada: `204 No Content` o `200` segun cliente/herramienta.

### 4.4 Validate token

- Metodo: `POST`
- URL: `/auth/validate`
- Header requerido:

```text
Authorization: Bearer <accessToken>
```

- Respuesta `200 OK`:

```json
{
  "valido": true,
  "usuarioId": "uuid",
  "email": "niquin@demo.cl"
}
```

### 4.5 Health

- Metodo: `GET`
- URL: `/auth/health`

## 5. Endpoints ms-users (administracion y pruebas)

## 5.1 Usuarios

- `GET /usuarios`
- `POST /usuarios`
- `GET /usuarios/{id}`
- `GET /usuarios/buscar?nombre=...`
- `PUT /usuarios/{id}/activar`
- `PUT /usuarios/{id}/desactivar`

Request ejemplo `POST /usuarios`:

```json
{
  "rut": "11222333",
  "dv": "K",
  "nombre": "Juan",
  "apellido": "Perez",
  "email": "juan@demo.cl"
}
```

## 5.2 Roles

- `GET /roles`
- `GET /roles/{id}`
- `POST /roles`
- `PUT /roles/{id}`
- `PUT /roles/{id}/activar`
- `PUT /roles/{id}/desactivar`

## 5.3 Sucursales

- `GET /sucursales`
- `GET /sucursales/{id}`
- `POST /sucursales`
- `PUT /sucursales/{id}/activar`
- `PUT /sucursales/{id}/desactivar`

## 5.4 Usuario-Roles

- `POST /usuario-roles`
- `GET /usuario-roles`
- `GET /usuario-roles/usuario/{usuarioId}`
- `GET /usuario-roles/rol/{rolId}`
- `PUT /usuario-roles/{id}/desactivar`

## 5.5 Usuario-Sucursales

- `GET /usuario-sucursales`
- `POST /usuario-sucursales`
- `GET /usuario-sucursales/usuario/{usuarioId}`
- `GET /usuario-sucursales/sucursal/{sucursalId}`
- `PUT /usuario-sucursales/{id}/desactivar`

## 6. Ejemplos curl listos para frontend testing

### 6.1 Registro por BFF

```bash
curl -sS -X POST "http://localhost:8080/bff/usuarios/register" \
  -H "Content-Type: application/json" \
  -d '{
    "rut": "87654321",
    "dv": "4",
    "nombre": "Niquin",
    "apellido": "Bodoque",
    "email": "niquin@demo.cl",
    "password": "Abc#1234"
  }'
```

### 6.2 Login

```bash
curl -sS -X POST "http://localhost:8081/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "niquin@demo.cl",
    "password": "Abc#1234"
  }'
```

### 6.3 Perfil autenticado

```bash
curl -sS "http://localhost:8080/bff/usuarios/me" \
  -H "Authorization: Bearer <accessToken>"
```

### 6.4 Refresh

```bash
curl -sS -X POST "http://localhost:8081/auth/refresh" \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "<refreshToken>"
  }'
```

## 7. Notas para implementacion frontend

- Consumir datos de negocio del perfil por BFF y no directamente por ms-users.
- Manejar `401` redirigiendo a login y aplicando refresh cuando corresponda.
- Tratar `409` en registro como error funcional de duplicidad (`rut` o `email`).
- Validar JSON antes de enviar para evitar `400` por formato.
- Enviar siempre `Content-Type: application/json`.
