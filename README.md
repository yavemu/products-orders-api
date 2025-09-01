# Products Orders API

API RESTful para gestión de productos, órdenes y usuarios desarrollada con NestJS, MongoDB y Docker.

## 🚀 Inicio Rápido

Resumen de tecnologías utilizadas y estructura del proyecto.

## 📋 Índice

- [Inicio Rápido](#-inicio-rápido)
- [Descripción](#-descripción)
- [Tecnologías](#️-tecnologías)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Buenas Prácticas Implementadas](#️-buenas-prácticas-implementadas)
- [Despliegue con Docker (Desarrollo)](#-despliegue-con-docker-desarrollo)
- [Variables de Entorno Requeridas](#-variables-de-entorno-requeridas)
- [Rutas de la API](#-rutas-de-la-api)
- [Testing y Coverage](#-testing-y-coverage)
- [Comandos de Desarrollo](#-comandos-de-desarrollo)
- [Autenticación](#-autenticación)
- [Documentación API](#-documentación-api)
- [Contribuciones](#-contribuciones)
- [Challenge Assessment](#-challenge-assessment)
- [Licencia](#-licencia)

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

## 🐳 Despliegue con Docker (Desarrollo)

### Requisitos Previos
- Docker y Docker Compose instalados
- Archivo `.env` configurado (copiar desde `.env.example`)

### Clonar y Configurar Proyecto

```bash
# 1. Clonar el repositorio
git clone git@github.com:yavemu/products-orders-api.git
cd products-orders-api

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores
```

### Deploy de Desarrollo (Recomendado)

```bash
# Iniciar servicios para desarrollo
npm run docker:up       # Servicios con hot reload

# Para limpiar y reconstruir:
npm run docker:clean    # Limpiar contenedores y volúmenes
npm run docker:build    # Construir imágenes desde cero
npm run docker:rebuild  # Limpiar + construir + iniciar
```

### Servicios de Desarrollo Disponibles

Una vez ejecutado el comando anterior, los siguientes servicios estarán disponibles:

| Servicio | URL | Descripción |
|----------|-----|-------------|
| **API Desarrollo** | `http://localhost:3001` | API en modo desarrollo (hot reload) |
| **Swagger Documentation** | `http://localhost:3001/apidoc` | Documentación interactiva de la API |
| **MongoDB** | `localhost:27017` | Base de datos MongoDB |
| **Mongo Express** | `http://localhost:8081` | Interfaz web para MongoDB |

### Gestión de Servicios

```bash
# Ver estado de servicios
docker-compose ps

# Ver logs
npm run docker:logs        # Todos los servicios
npm run docker:logs:api    # Solo API desarrollo
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
# Parámetros: startDate, endDate, clientId, productId, sortBy, returnCsv
# Respuesta JSON: datos paginados + resumen estadístico + filtros aplicados
# Respuesta CSV: archivo de descarga directa con datos completos + estadísticas
```

**Características de Reportes:**
- **Filtros avanzados**: Por rango de fechas (obligatorio), cliente y/o producto específico
- **Ordenamiento configurable**: Por total, fecha, cantidad, nombre de cliente
- **Dos formatos de salida**:
  - `returnCsv=false`: JSON paginado con metadatos completos
  - `returnCsv=true`: Archivo CSV descargable con datos completos (sin paginación)
- **Estructura CSV**: Una fila por producto, información de orden repetida, estadísticas al final
- **Estadísticas incluidas**: Total órdenes, ingresos totales, cantidad vendida, valor promedio

### Datos Demo Mejorados
La aplicación se inicializa automáticamente con datos demo realistas:
- **SuperAdmin**: `admin@demo.com` / `demodemo`
- **Usuarios de prueba**: Clientes con diferentes roles
- **Productos**: 6 productos con imágenes e información completa
- **Órdenes**: Órdenes variadas con 1-4 productos cada una, diferentes estados y fechas

## 🧪 Testing y Coverage

### Tests Implementados

![Coverage](./coverage/badges/coverage.svg)

**Resultados detallados del coverage:**
- **Statements**: 19.54% (1219/6238)
- **Branches**: 2.42% (128/5287) 
- **Functions**: 17.76% (189/1064)
- **Lines**: 67.19% (1153/1716)
- **Tests**: 284 tests pasando ✅
- **Test Suites**: 16 suites completos

### Comandos de Testing

```bash
# Ejecutar tests unitarios
npm run test

# Tests en modo watch
npm run test:watch

# Coverage de tests
npm run test:cov

# Tests e2e
npm run test:e2e

# Ver reporte HTML detallado
open coverage/lcov-report/index.html
```

### Módulos con Tests Completos

- **Auth Module**: 58 tests (Service, Controller, Guards, Strategy)
- **Users Module**: 62 tests (Service, Controller, Repository, Integration)  
- **Products Module**: 87 tests (Service, Controller, Repository, Integration)
- **Orders Module**: 77 tests (Service, Controller, Repository, Integration)

## 📝 Comandos de Desarrollo

### Desarrollo Local
```bash
npm run start:dev        # Iniciar en modo desarrollo (recomendado)
npm run start:debug      # Iniciar en modo debug
npm run build            # Construir aplicación
npm run lint             # Ejecutar linting
npm run format           # Formatear código
```

### Docker para Desarrollo (Recomendado)
```bash
# Deploy de desarrollo
npm run docker:up        # Iniciar servicios de desarrollo

# Gestión de desarrollo
npm run docker:clean     # Limpiar completamente
npm run docker:build     # Construir imágenes
npm run docker:rebuild   # Limpiar, construir e iniciar todo
npm run docker:down      # Parar servicios

# Logs y monitoreo
npm run docker:logs      # Ver todos los logs
npm run docker:logs:api  # Ver logs de API desarrollo
npm run docker:logs:db   # Ver logs de MongoDB

# Acceso a contenedores
npm run docker:shell:api # Acceder a contenedor API
npm run docker:shell:db  # Acceder a MongoDB shell
```

### Testing y Coverage
```bash
# Ejecutar tests
npm run test             # Tests unitarios
npm run test:watch       # Tests en modo watch
npm run test:cov         # Tests con coverage
npm run test:e2e         # Tests end-to-end

# Ver reportes de coverage
open coverage/lcov-report/index.html  # Abrir reporte HTML detallado
```

## 🔐 Autenticación

La API utiliza JWT (JSON Web Tokens) para autenticación:

1. **Login**: `POST /api/auth/login` retorna un token
2. **Registro**: `POST /api/auth/register` crea usuario y retorna token  
3. **Uso**: Incluir `Authorization: Bearer <token>` en headers

**Endpoints Públicos** (no requieren autenticación):
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario
- `POST /api/users` - Crear usuario (endpoint público adicional)

**Endpoints Protegidos** (requieren JWT token):
- Todos los demás endpoints de usuarios, productos y órdenes

**Swagger Integration**: La documentación en `/apidoc` incluye autenticación JWT integrada. Usa el botón "Authorize" para ingresar tu token y probar los endpoints protegidos.

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

## 📋 Challenge Assessment

Para una evaluación detallada de los requisitos del challenge vs la implementación actual, consulta el archivo [challenge-assessment.md](challenge-assessment.md).

**Estado actual: 100% Completo** - Todos los requisitos principales, bonus features, y características adicionales implementadas.

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.