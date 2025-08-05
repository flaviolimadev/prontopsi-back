#!/bin/bash

echo "🐳 TESTE DOCKER: Simulando build do Docker..."

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ package.json não encontrado"
    echo "   Execute este script no diretório backEnd/backprontupsi/"
    exit 1
fi

echo "✅ package.json encontrado"

# Limpar build anterior
echo "🧹 Limpando build anterior..."
rm -rf dist/

# Instalar dependências (como no Docker)
echo "📦 Instalando dependências..."
npm install

# Verificar se @nestjs/cli está disponível
echo "🔧 Verificando @nestjs/cli..."
if ! npx nest --version > /dev/null 2>&1; then
    echo "❌ @nestjs/cli não está disponível"
    exit 1
fi

echo "✅ @nestjs/cli disponível: $(npx nest --version)"

# Executar build (como no Docker)
echo "🔨 Executando build..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build falhou!"
    echo "📋 Tentando build manual..."
    npx nest build
    if [ $? -ne 0 ]; then
        echo "❌ Build manual também falhou!"
        echo "📋 Tentando compilação TypeScript direta..."
        npx tsc
        if [ $? -ne 0 ]; then
            echo "❌ Compilação TypeScript também falhou!"
            exit 1
        fi
    fi
fi

echo "✅ Build executado com sucesso"

# Verificar se dist/main.js existe
if [ -f "dist/main.js" ]; then
    echo "✅ dist/main.js encontrado"
    echo "📏 Tamanho: $(ls -lh dist/main.js | awk '{print $5}')"
else
    echo "❌ dist/main.js não encontrado"
    echo "📁 Arquivos em dist/:"
    ls -la dist/
    echo "🔍 Procurando por arquivos .js:"
    find dist/ -name "*.js" -type f
    exit 1
fi

# Testar execução
echo "🧪 Testando execução..."
timeout 5s node dist/main.js &
PID=$!
sleep 2
if kill -0 $PID 2>/dev/null; then
    echo "✅ Aplicação iniciou corretamente"
    kill $PID
else
    echo "❌ Aplicação não iniciou"
    exit 1
fi

echo ""
echo "🎉 Teste Docker concluído com sucesso!"
echo "💡 O Dockerfile deve funcionar agora."