#!/bin/bash

echo "🎮 Configuração do Jogo de Damas Online"
echo "========================================"
echo ""

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não encontrado. Por favor, instale o Docker primeiro."
    echo "   Visite: https://docs.docker.com/get-docker/"
    exit 1
fi

# Verificar se Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose não encontrado. Por favor, instale o Docker Compose."
    echo "   Visite: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker e Docker Compose encontrados"
echo ""

# Verificar se .env existe
if [ ! -f .env ]; then
    echo "📝 Criando arquivo .env..."
    cp .env.example .env
    echo "⚠️  IMPORTANTE: Edite o arquivo .env e adicione sua chave do Ably"
    echo "   Obtenha em: https://ably.com/dashboard"
    echo ""
    read -p "Pressione Enter para continuar após configurar o .env..."
fi

echo "🚀 Iniciando aplicação com Docker..."
echo ""

# Build e start
docker-compose up --build

echo ""
echo "🎉 Aplicação rodando!"
echo "   Frontend: http://localhost:3000"
echo "   Backend: http://localhost:4000"
