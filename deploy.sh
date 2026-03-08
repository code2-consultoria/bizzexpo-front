#!/bin/bash
set -e

GITHUB_TOKEN=$(cat .github_token 2>/dev/null || echo "")

echo "=== Deploy BizzExpo Front ==="

# Login no GitHub Container Registry
if [ -n "$GITHUB_TOKEN" ]; then
    echo "$GITHUB_TOKEN" | docker login ghcr.io -u $GITHUB_USER --password-stdin
fi

# Pull da nova imagem
echo "Baixando nova imagem..."
docker compose -f docker-compose.github.yml pull

# Parar containers antigos
echo "Parando containers antigos..."
docker compose -f docker-compose.github.yml down --remove-orphans || true

# Subir novos containers
echo "Iniciando novos containers..."
docker compose -f docker-compose.github.yml up -d

# Limpar imagens antigas
echo "Limpando imagens antigas..."
docker image prune -f

echo "=== Deploy concluido com sucesso! ==="
