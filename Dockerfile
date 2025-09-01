# Etapa de desarrollo
FROM node:20-alpine AS development

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY tsconfig.json ./
COPY tsconfig.build.json ./

# Instalar dependencias
RUN npm install

# Copiar todo el código
COPY . .

# Construir la aplicación
RUN npm run build

# Etapa de producción
FROM node:20-alpine AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm install --only=production

# Copiar código construido y otros archivos necesarios
COPY . .
COPY --from=development /app/dist ./dist
COPY --from=development /app/uploads ./uploads

# Crear directorio para uploads
RUN mkdir -p /app/uploads

# Exponer puerto
EXPOSE 3000

# Comando de inicio
CMD ["node", "dist/main"]