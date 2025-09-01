# Etapa de desarrollo
FROM node:20-alpine AS development

# Instalar dependencias del sistema
RUN apk add --no-cache wget curl

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY tsconfig.json ./
COPY tsconfig.build.json ./

# Instalar dependencias
RUN npm install

# Copiar todo el código
COPY . .

# Crear directorio para uploads
RUN mkdir -p /app/uploads && chown -R node:node /app/uploads

# Construir la aplicación
RUN npm run build

# Cambiar a usuario no-root
USER node

# Comando por defecto para desarrollo
CMD ["npm", "run", "start:dev"]

# Etapa de producción
FROM node:20-alpine AS production

# Instalar dependencias del sistema
RUN apk add --no-cache wget curl

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --only=production && npm cache clean --force

# Copiar código construido desde la etapa de desarrollo
COPY --from=development /app/dist ./dist

# Crear directorio para uploads con permisos correctos
RUN mkdir -p /app/uploads && chown -R node:node /app/uploads

# Cambiar a usuario no-root
USER node

# Exponer puerto
EXPOSE 3000

# Verificar que el directorio dist existe
RUN ls -la /app/dist

# Comando de inicio
CMD ["node", "dist/main"]