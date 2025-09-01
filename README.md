# Products Orders API

API RESTful para gestión de productos, órdenes y usuarios desarrollada con NestJS, MongoDB y Docker.

## 📋 Índice

- [Descripción](#descripción)
- [Tecnologías](#tecnologías)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Buenas Prácticas Implementadas](#buenas-prácticas-implementadas)
- [Instalación y Configuración](#instalación-y-configuración)
- [Despliegue con Docker](#despliegue-con-docker)
- [Variables de Entorno Requeridas](#variables-de-entorno-requeridas)
- [Rutas de la API](#rutas-de-la-api)
- [Testing](#testing)
- [Comandos Disponibles](#comandos-disponibles)

## 🚀 Descripción

API completa para gestión de comercio electrónico que incluye:

- **Gestión de Usuarios**: Registro, autenticación, CRUD completo y búsquedas
- **Gestión de Productos**: CRUD con upload de imágenes, búsquedas avanzadas y soft delete
- **Gestión de Órdenes**: Creación con múltiples productos, cálculos automáticos, transiciones de estado y reportes avanzados
- **Sistema de Reportes**: Filtros de fecha, agregaciones estadísticas y exportación CSV
- **Autenticación JWT**: Sistema seguro con guards y middleware
- **Documentación Swagger**: API completamente documentada con ejemplos

## 🛠️ Tecnologías

### Backend
- **NestJS** - Framework de Node.js
- **TypeScript** - Lenguaje de programación
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB

### Autenticación y Seguridad
- **JWT** - JSON Web Tokens
- **Passport** - Middleware de autenticación
- **Bcrypt** - Encriptación de contraseñas
- **Helmet** - Security headers

### Documentación y Validación
- **Swagger/OpenAPI** - Documentación automática
- **Class Validator** - Validación de DTOs
- **Class Transformer** - Transformación de datos

### DevOps y Herramientas
- **Docker & Docker Compose** - Containerización
- **Jest** - Testing framework
- **ESLint & Prettier** - Linting y formateo
- **Multer** - Manejo de archivos

## 📁 Estructura del Proyecto

```
src/
├── auth/                    # Módulo de autenticación
│   ├── controllers/         # Controladores de auth
│   ├── decorators/          # Decoradores Swagger
│   ├── dto/                # DTOs y validaciones
│   ├── guards/             # Guards JWT
│   ├── interfaces/         # Interfaces TypeScript
│   └── strategies/         # Estrategias Passport
├── users/                  # Módulo de usuarios
│   ├── controllers/        # Controladores CRUD
│   ├── decorators/         # Decoradores Swagger
│   ├── dto/               # DTOs y validaciones
│   ├── enums/             # Mensajes centralizados
│   ├── interfaces/        # Interfaces TypeScript
│   ├── repository/        # Capa de acceso a datos
│   ├── schemas/           # Esquemas MongoDB
│   └── services/          # Lógica de negocio
├── products/              # Módulo de productos
│   └── [estructura similar a users]
├── orders/                # Módulo de órdenes
│   └── [estructura similar a users]
├── common/                # Utilidades comunes
│   ├── decorators/        # Decoradores reutilizables
│   ├── dto/              # DTOs base
│   ├── interceptors/     # Interceptores HTTP
│   ├── interfaces/       # Interfaces comunes
│   └── utils/            # Utilidades y helpers
└── config/               # Configuraciones
    └── swagger/          # Configuración Swagger
```

## 🏗️ Buenas Prácticas Implementadas

### Arquitectura Clean Code
- **Clean Controllers**: Solo retornos de servicios, sin lógica de negocio
- **Services Lean**: Únicamente transformación de datos para controladores
- **Repositories Rich**: Lógica de negocio completa, validaciones y operaciones CRUD
- **Repository Pattern**: Abstracción de acceso a datos con operaciones genéricas
- **Utility Classes**: Funciones reutilizables para eliminar duplicación de código

### Código Limpio y Mantenible
- **DRY Principle**: Eliminación de ~150 líneas de código duplicado mediante utils
- **Single Responsibility**: Separación clara de responsabilidades por capas
- **Mensajes Centralizados**: Enums para todos los mensajes de error y éxito
- **Validaciones Agrupadas**: Métodos de validación centralizados por módulo
- **TypeScript Strict**: Tipado estricto y interfaces bien definidas

### Estandarización y Consistencia
- **HTTP Response Interceptor**: Respuestas uniformes con formato estándar
- **Validaciones Globales**: DTOs robustos con class-validator
- **Error Handling**: Manejo consistente de errores con códigos HTTP apropiados
- **Swagger Documentation**: Documentación automática con ejemplos y respuestas de error
- **JWT Authentication**: Sistema de autenticación integrado en todos los endpoints protegidos

## 🐳 Despliegue con Docker

### Requisitos Previos
- Docker y Docker Compose instalados
- Archivo `.env` configurado (copiar desde `.env.example`)

### Deploy Completo (Recomendado)

```bash
# 1. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores

# 2. Deploy completo con limpieza
npm run docker:rebuild

# O paso a paso:
npm run docker:clean    # Limpiar contenedores y volúmenes
npm run docker:build    # Construir imágenes desde cero
npm run docker:up       # Iniciar todos los servicios
```

### Servicios Disponibles

Una vez ejecutado el comando anterior, los siguientes servicios estarán disponibles:

| Servicio | URL | Descripción |
|----------|-----|-------------|
| **API Producción** | `http://localhost:3000` | API principal en modo producción |
| **API Desarrollo** | `http://localhost:3001` | API en modo desarrollo (hot reload) |
| **Swagger Documentation** | `http://localhost:3000/apidoc` | Documentación interactiva de la API |
| **MongoDB** | `localhost:27017` | Base de datos MongoDB |
| **Mongo Express** | `http://localhost:8081` | Interfaz web para MongoDB |

### Gestión de Servicios

```bash
# Ver estado de servicios
docker-compose ps

# Ver logs
npm run docker:logs        # Todos los servicios
npm run docker:logs:api    # Solo API producción
npm run docker:logs:db     # Solo MongoDB

# Reiniciar servicios
npm run docker:restart     # Todos los servicios
npm run docker:restart:api # Solo API

# Parar servicios
npm run docker:down

# Limpiar completamente
npm run docker:clean
```

## 🔧 Variables de Entorno Requeridas

El archivo `docker-compose.yml` requiere las siguientes variables definidas en `.env`:

### Variables de Aplicación (REQUERIDAS)
```bash
# Base de datos
DATABASE_URI=mongodb://nodeuser:nodepassword@mongodb:27017/products-order-mongo?authSource=products-order-mongo

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=1h

# Aplicación
PORT=3000
NODE_ENV=production

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:3001

# Upload de archivos
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

### Variables de Docker (REQUERIDAS)
```bash
# Puertos de contenedores
API_PORT=3000              # Puerto para API producción
API_DEV_PORT=3001          # Puerto para API desarrollo

# MongoDB
MONGO_PORT=27017           # Puerto MongoDB
MONGO_DB=products-order-mongo
MONGO_USER=nodeuser
MONGO_PASSWORD=nodepassword

# MongoDB Admin (para inicialización)
MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=password

# Mongo Express
MONGO_EXPRESS_PORT=8081
MONGO_EXPRESS_USERNAME=admin
MONGO_EXPRESS_PASSWORD=password
```

⚠️ **IMPORTANTE**: Todas estas variables son requeridas para que `docker-compose.yml` funcione correctamente.

## 🌐 Rutas de la API

### Base URL
Todas las rutas de la API tienen el prefijo `/api`:
- **Base**: `http://localhost:3000/api`
- **Documentación**: `http://localhost:3000/apidoc`

### Endpoints Principales

#### Autenticación
```bash
POST /api/auth/login      # Iniciar sesión
POST /api/auth/register   # Registrar usuario
```

#### Usuarios
```bash
GET    /api/users         # Listar usuarios (autenticado)
POST   /api/users         # Crear usuario
GET    /api/users/:id     # Obtener usuario por ID
PATCH  /api/users/:id     # Actualizar usuario
DELETE /api/users/:id     # Eliminar usuario
POST   /api/users/search  # Buscar usuarios
```

#### Productos
```bash
GET    /api/products      # Listar productos
POST   /api/products      # Crear producto
GET    /api/products/:id  # Obtener producto por ID
PATCH  /api/products/:id  # Actualizar producto
DELETE /api/products/:id  # Eliminar producto (soft delete)
POST   /api/products/search # Buscar productos
```

#### Órdenes
```bash
GET    /api/orders         # Listar órdenes
POST   /api/orders         # Crear orden (múltiples productos)
GET    /api/orders/:id     # Obtener orden por ID
PATCH  /api/orders/:id     # Actualizar orden (validaciones de estado)
DELETE /api/orders/:id     # Eliminar orden
POST   /api/orders/search  # Buscar órdenes con filtros
POST   /api/orders/reports # Generar reportes con estadísticas
```

#### Reportes y Analytics
```bash
POST   /api/orders/reports # Generar reportes avanzados
# Parámetros: startDate, endDate, clientId, productId, sortBy
# Respuesta: datos paginados + resumen estadístico
# Soporte: exportación CSV con returnCsv=true
```

### Datos Demo Mejorados
La aplicación se inicializa automáticamente con datos demo realistas:
- **SuperAdmin**: `admin@demo.com` / `demodemo`
- **Usuarios de prueba**: Clientes con diferentes roles
- **Productos**: 6 productos con imágenes e información completa
- **Órdenes**: Órdenes variadas con 1-4 productos cada una, diferentes estados y fechas

## 🧪 Testing

```bash
# Ejecutar tests unitarios
npm run test

# Tests en modo watch
npm run test:watch

# Coverage de tests
npm run test:cov

# Tests e2e
npm run test:e2e
```

## 📝 Comandos Disponibles

### Desarrollo Local
```bash
npm run start            # Iniciar en modo producción
npm run start:dev        # Iniciar en modo desarrollo
npm run start:debug      # Iniciar en modo debug
npm run build            # Construir aplicación
npm run lint             # Ejecutar linting
npm run format           # Formatear código
```

### Docker (Recomendado)
```bash
# Deploy completo
npm run docker:rebuild   # Limpia, construye e inicia todo

# Gestión individual
npm run docker:clean     # Limpiar completamente
npm run docker:build     # Construir imágenes
npm run docker:up        # Iniciar servicios
npm run docker:down      # Parar servicios

# Logs y monitoreo
npm run docker:logs      # Ver todos los logs
npm run docker:logs:api  # Ver logs de API
npm run docker:logs:db   # Ver logs de MongoDB

# Servicios específicos
npm run docker:up:prod   # Solo producción
npm run docker:up:dev    # Solo desarrollo
npm run docker:restart   # Reiniciar servicios

# Acceso a contenedores
npm run docker:shell:api # Acceder a contenedor API
npm run docker:shell:db  # Acceder a MongoDB shell
```

## 🔐 Autenticación

La API utiliza JWT (JSON Web Tokens) para autenticación:

1. **Login**: `POST /api/auth/login` retorna un token
2. **Uso**: Incluir `Authorization: Bearer <token>` en headers
3. **Registro**: `POST /api/auth/register` crea usuario y retorna token

## 📚 Documentación API

La documentación completa de la API está disponible en:
- **Swagger UI**: `http://localhost:3000/apidoc`

Incluye:
- Esquemas de datos
- Ejemplos de request/response  
- Códigos de estado HTTP
- Autenticación JWT integrada

---

## 🤝 Contribuciones

1. Fork el proyecto
2. Crear branch para feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.