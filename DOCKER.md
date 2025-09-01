# Docker Setup - Products Orders API

## 🐳 Configuración Docker

### Requisitos previos
- Docker
- Docker Compose
- MongoDB Compass (opcional, para acceso gráfico a la BD)

### 🚀 Comandos disponibles

#### Construcción y inicio
```bash
# Construir imágenes Docker
npm run docker:build

# Iniciar todos los servicios
npm run docker:up

# Iniciar solo producción (API + BD + Mongo Express)
npm run docker:up:prod

# Iniciar solo desarrollo (API-dev + BD + Mongo Express)
npm run docker:up:dev
```

#### Logs y monitoreo
```bash
# Ver logs de todos los servicios
npm run docker:logs

# Ver logs solo de la API de producción
npm run docker:logs:api

# Ver logs solo de la API de desarrollo
npm run docker:logs:api-dev

# Ver logs solo de MongoDB
npm run docker:logs:db
```

#### Gestión de servicios
```bash
# Reiniciar todos los servicios
npm run docker:restart

# Reiniciar solo API de producción
npm run docker:restart:api

# Reiniciar solo API de desarrollo
npm run docker:restart:api-dev

# Parar todos los servicios
npm run docker:down

# Limpiar todo (contenedores, volúmenes, redes)
npm run docker:clean

# Reconstruir completamente
npm run docker:rebuild
```

#### Acceso a shells
```bash
# Acceder al shell de la API de producción
npm run docker:shell:api

# Acceder al shell de la API de desarrollo
npm run docker:shell:api-dev

# Acceder al shell de MongoDB
npm run docker:shell:db
```

### 🌐 Puertos disponibles

| Servicio | Puerto | URL |
|----------|--------|-----|
| API Producción | 3000 | http://localhost:3000 |
| API Desarrollo | 3001 | http://localhost:3001 |
| MongoDB | 27017 | mongodb://localhost:27017 |
| Mongo Express | 8081 | http://localhost:8081 |

### 📊 Acceso a Swagger

- **Producción**: http://localhost:3000/apidoc
- **Desarrollo**: http://localhost:3001/apidoc

### 💾 Conexión a MongoDB

#### MongoDB Compass
```
URI: mongodb://nodeuser:nodepassword@localhost:27017/products-order-mongo?authSource=products-order-mongo
```

#### Mongo Express (Web UI)
```
URL: http://localhost:8081
Usuario: admin
Contraseña: password
```

#### Conexión directa
```
Host: localhost
Puerto: 27017
Base de datos: products-order-mongo
Usuario: nodeuser
Contraseña: nodepassword
Authentication Database: products-order-mongo
```

### 👤 Usuario por defecto

El sistema crea automáticamente un usuario administrador:

```json
{
  "email": "admin@demo.com",
  "password": "demodemo",
  "firstName": "Admin",
  "lastName": "Demo"
}
```

### 🗂 Estructura de la BD

La base de datos `products-order-mongo` contiene las siguientes colecciones:

- **users**: Usuarios del sistema
- **products**: Catálogo de productos
- **orders**: Órdenes de compra

### 🔧 Variables de entorno

Crear archivo `.env` basado en `.env.example`:

```bash
cp .env.example .env
```

Las variables importantes para Docker:

```env
# Para conexión local (desarrollo)
DATABASE_URI=mongodb://nodeuser:nodepassword@localhost:27017/products-order-mongo?authSource=products-order-mongo

# Para conexión Docker (producción)
DATABASE_URI_PROD=mongodb://nodeuser:nodepassword@mongodb:27017/products-order-mongo?authSource=products-order-mongo

# JWT Secret (cambiar en producción)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### 🐛 Troubleshooting

#### Problema: Error de conexión a MongoDB
```bash
# Verificar que MongoDB esté corriendo
docker-compose ps

# Ver logs de MongoDB
npm run docker:logs:db

# Reiniciar MongoDB
docker-compose restart mongodb
```

#### Problema: Puerto ocupado
```bash
# Verificar puertos en uso
netstat -tulpn | grep :3000
netstat -tulpn | grep :27017

# Cambiar puertos en docker-compose.yml si es necesario
```

#### Problema: Volúmenes corruptos
```bash
# Limpiar todo y reconstruir
npm run docker:clean
npm run docker:build
npm run docker:up
```

### 📝 Notas importantes

1. **Persistencia**: Los datos de MongoDB se almacenan en un volumen Docker llamado `mongodb_data`
2. **Uploads**: Las imágenes de productos se almacenan en el directorio `./uploads`
3. **Health checks**: Los servicios incluyen verificaciones de salud automáticas
4. **Auto-restart**: Los contenedores se reinician automáticamente en caso de error