#!/bin/bash
# ============================================
# Script para ejecutar los archivos SQL de seed
# Se ejecuta DESPUÉS de que la app NestJS haya creado las tablas
# ============================================

set -e

SEED_DIR="/seed-data"
MARKER_FILE="/seed-data/.seeded"
APP_URL="${APP_URL:-http://localhost:3000}"
MAX_RETRIES=60
RETRY_INTERVAL=5

echo "============================================"
echo "🌱 Iniciando proceso de seeding..."
echo "============================================"

# Verificar si ya se ejecutó el seeding anteriormente
if [ -f "$MARKER_FILE" ]; then
    echo "✅ El seeding ya fue ejecutado anteriormente."
    echo "   Si deseas ejecutarlo de nuevo, elimina el archivo:"
    echo "   docker/seed-data/.seeded"
    exit 0
fi

# Verificar si hay archivos SQL
SQL_FILES=$(find "$SEED_DIR" -maxdepth 1 -name "*.sql" -type f 2>/dev/null | sort)

if [ -z "$SQL_FILES" ]; then
    echo "⚠️  No se encontraron archivos .sql en $SEED_DIR"
    echo "   Coloca tus archivos de INSERT en: docker/seed-data/"
    exit 0
fi

echo "📁 Archivos SQL encontrados:"
echo "$SQL_FILES" | while read file; do
    echo "   - $(basename "$file")"
done
echo ""

# ============================================
# Esperar a que la aplicación esté lista
# ============================================


# Esperar un poco más para asegurar que TypeORM haya sincronizado las tablas
echo ""
echo "⏳ Esperando 10 segundos adicionales para que TypeORM sincronice las tablas..."
sleep 10

# ============================================
# Ejecutar los scripts SQL
# ============================================
echo ""
echo "🚀 Ejecutando scripts SQL..."
echo ""

for sql_file in $SQL_FILES; do
    filename=$(basename "$sql_file")
    echo "📄 Ejecutando: $filename"
    
    if psql -f "$sql_file" 2>&1; then
        echo "   ✅ $filename ejecutado correctamente"
    else
        echo "   ❌ Error ejecutando $filename"
        exit 1
    fi
    echo ""
done

echo "============================================"
echo "✅ Seeding completado exitosamente!"
echo "============================================"

# Crear archivo marcador para evitar re-ejecución
echo "Seeding ejecutado: $(date)" > "$MARKER_FILE"
echo "📝 Archivo marcador creado: .seeded"
