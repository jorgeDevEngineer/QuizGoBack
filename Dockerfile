# ============================================
# Etapa 1: Construcción
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Compilar la aplicación
RUN npm run build

# ============================================
# Etapa 2: Producción
# ============================================
FROM node:20-alpine AS production

WORKDIR /app

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --only=production && npm cache clean --force

# Copiar aplicación compilada desde la etapa de construcción
COPY --from=builder /app/dist ./dist

# Crear directorio de uploads con permisos correctos
RUN mkdir -p /app/uploads && chown -R nestjs:nodejs /app/uploads

# Cambiar al usuario no-root
USER nestjs

# Exponer puerto (se configura via variable de entorno)
EXPOSE 3000

# Comando de inicio
CMD ["node", "dist/main"]

