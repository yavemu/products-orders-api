# Products Orders API

API RESTful para gestión de productos, órdenes y usuarios desarrollada con NestJS, MongoDB y Docker.

## 📋 Índice

- [Descripción](#descripción)
- [Tecnologías](#tecnologías)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Buenas Prácticas Implementadas](#buenas-prácticas-implementadas)
- [Instalación y Configuración](#instalación-y-configuración)
- [Despliegue con Docker](#despliegue-con-docker)
- [Testing](#testing)
- [Documentación API](#documentación-api)
- [Comandos Disponibles](#comandos-disponibles)

## 🚀 Descripción

API completa para gestión de comercio electrónico que incluye:

- **Gestión de Usuarios**: Registro, autenticación, perfiles
- **Gestión de Productos**: CRUD completo con imágenes y búsquedas avanzadas
- **Gestión de Órdenes**: Creación, seguimiento y gestión de pedidos
- **Autenticación JWT**: Sistema seguro de autenticación
- **Documentación Swagger**: API completamente documentada

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
├── common/               # Código compartido
│   ├── decorators/       # Decoradores reutilizables
│   ├── dto/             # DTOs comunes
│   ├── interceptors/    # Interceptores globales
│   ├── interfaces/      # Interfaces compartidas
│   └── utils/           # Utilidades comunes
├── users/               # Módulo de usuarios
│   ├── controllers/     # Controladores HTTP
│   ├── services/        # Lógica de negocio
│   ├── repository/      # Capa de datos
│   ├── dto/            # Data Transfer Objects
│   ├── schemas/        # Esquemas de MongoDB
│   ├── decorators/     # Decoradores Swagger
│   └── enums/          # Enumeraciones y mensajes
├── products/           # Módulo de productos
├── orders/            # Módulo de órdenes
├── auth/              # Módulo de autenticación
└── config/            # Configuraciones globales
```

### Composición de Módulos

Cada módulo sigue la arquitectura limpia con:

- **Controllers**: Solo decoradores Swagger, sin lógica de negocio
- **Services**: Lógica de negocio, retorna datos limpios
- **Repository**: Acceso a datos con método único `findByWhereCondition`
- **DTOs**: Validación y transformación de datos
- **Schemas**: Modelos de base de datos
- **Decorators**: Documentación Swagger reutilizable
- **Enums**: Mensajes centralizados en español

## ✨ Buenas Prácticas Implementadas

### Arquitectura
- **Clean Architecture**: Separación clara de responsabilidades
- **Repository Pattern**: Abstracción de la capa de datos
- **Service Layer**: Lógica de negocio centralizada
- **DRY Principle**: Eliminación de código repetitivo

### Código Limpio
- **Single Responsibility**: Una responsabilidad por clase
- **Decoradores Reutilizables**: Sistema unificado de respuestas API
- **Mensajes Centralizados**: Enums para todos los mensajes
- **Utilities Compartidas**: Funciones comunes reutilizables

### Respuestas Estandarizadas
- **HTTP Response Interceptor**: Formato único de respuestas
- **Error Handling**: Manejo consistente de errores
- **Pagination**: Sistema unificado de paginación
- **Spanish Messages**: Todos los mensajes en español

### Seguridad
- **JWT Authentication**: Tokens seguros
- **Password Hashing**: Encriptación bcrypt
- **Input Validation**: Validación exhaustiva de datos
- **Security Headers**: Helmet para headers de seguridad

## ⚙️ Instalación y Configuración

### Prerrequisitos
- Node.js (v18 o superior)
- Docker & Docker Compose
- MongoDB Compass (opcional, para GUI)

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd products-orders-api
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
```bash
cp .env.example .env
```

Editar `.env` con tus configuraciones:
```env
DATABASE_URI=mongodb://nodeuser:nodepassword@mongodb:27017/products-order-mongo?authSource=products-order-mongo
JWT_SECRET=your-super-secret-jwt-key
PORT=3000
```

### 4. Desarrollo local (sin Docker)
```bash
# Iniciar MongoDB localmente
# Luego ejecutar:
npm run start:dev
```

## 🐳 Despliegue con Docker

### Opción 1: Despliegue completo (Recomendado)
```bash
# 1. Construir imágenes
npm run docker:build

# 2. Levantar todos los servicios
npm run docker:up

# 3. Verificar que los servicios estén corriendo
docker-compose ps
```

### Opción 2: Desarrollo con Docker
```bash
# Desarrollo con hot-reload
npm run docker:up:dev
```

### Opción 3: Producción
```bash
# Solo servicios de producción
npm run docker:up:prod
```

### Servicios Disponibles

| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| API | 3000 | API Principal |
| MongoDB | 27017 | Base de datos |
| Mongo Express | 8081 | GUI MongoDB |
| Swagger | 3000/api | Documentación |

### Conexión a MongoDB

**MongoDB Compass:**
```
mongodb://nodeuser:nodepassword@localhost:27017/products-order-mongo?authSource=products-order-mongo
```

**Mongo Express:**
- URL: http://localhost:8081
- Usuario: admin / password

## 🧪 Testing

```bash
# Tests unitarios
npm run test

# Tests con coverage
npm run test:cov

# Tests e2e
npm run test:e2e

# Tests en modo watch
npm run test:watch
```

## 📖 Documentación API

### Swagger UI
Accede a la documentación interactiva en:
```
http://localhost:3000/api
```

### Endpoints Principales

**Authentication:**
- `POST /auth/login` - Iniciar sesión
- `POST /auth/register` - Registrar usuario

**Users:**
- `GET /users` - Listar usuarios
- `POST /users` - Crear usuario
- `PUT /users/:id` - Actualizar usuario

**Products:**
- `GET /products` - Listar productos
- `POST /products` - Crear producto (con imagen)
- `PUT /products/:id` - Actualizar producto

**Orders:**
- `GET /orders` - Listar órdenes
- `POST /orders` - Crear orden
- `PUT /orders/:id` - Actualizar orden

## 📋 Comandos Disponibles

### Desarrollo
| Comando | Descripción |
|---------|-------------|
| `npm run start:dev` | Inicia servidor desarrollo con hot-reload |
| `npm run start:debug` | Inicia servidor con debug habilitado |
| `npm run build` | Construye aplicación para producción |
| `npm run start:prod` | Inicia aplicación en modo producción |

### Testing
| Comando | Descripción |
|---------|-------------|
| `npm run test` | Ejecuta tests unitarios |
| `npm run test:watch` | Tests en modo watch |
| `npm run test:cov` | Tests con reporte de cobertura |
| `npm run test:e2e` | Tests end-to-end |

### Calidad de Código
| Comando | Descripción |
|---------|-------------|
| `npm run lint` | Ejecuta ESLint y corrige errores |
| `npm run format` | Formatea código con Prettier |

### Docker - Gestión de Servicios
| Comando | Descripción |
|---------|-------------|
| `npm run docker:build` | Construye imágenes Docker sin cache |
| `npm run docker:up` | Levanta todos los servicios |
| `npm run docker:up:dev` | Levanta servicios en modo desarrollo |
| `npm run docker:up:prod` | Levanta solo servicios de producción |
| `npm run docker:down` | Para todos los servicios |

### Docker - Monitoreo
| Comando | Descripción |
|---------|-------------|
| `npm run docker:logs` | Ver logs de todos los servicios |
| `npm run docker:logs:api` | Ver logs solo de la API |
| `npm run docker:logs:db` | Ver logs solo de MongoDB |
| `npm run docker:restart` | Reinicia todos los servicios |

### Docker - Mantenimiento
| Comando | Descripción |
|---------|-------------|
| `npm run docker:clean` | Limpia volúmenes y contenedores |
| `npm run docker:rebuild` | Limpia, reconstruye y levanta |
| `npm run docker:shell:api` | Accede al shell del contenedor API |
| `npm run docker:shell:db` | Accede al shell de MongoDB |

### Ejemplos de Uso

**Desarrollo completo con Docker:**
```bash
npm run docker:rebuild  # Primera vez
npm run docker:logs     # Monitorear
```

**Desarrollo local:**
```bash
npm install
npm run start:dev
```

**Testing completo:**
```bash
npm run test:cov
npm run test:e2e
```

---

🔧 **Desarrollado con Clean Architecture y mejores prácticas de NestJS**