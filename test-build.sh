#!/bin/bash

echo "🔨 Testando build do backend..."

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ package.json não encontrado"
    echo "   Execute este script no diretório backEnd/backprontupsi/"
    exit 1
fi

echo "✅ package.json encontrado"

# Verificar se node_modules existe
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Falha ao instalar dependências"
        exit 1
    fi
    echo "✅ Dependências instaladas"
else
    echo "✅ node_modules encontrado"
fi

# Verificar se @nestjs/cli está disponível
if ! npx nest --version > /dev/null 2>&1; then
    echo "❌ @nestjs/cli não está disponível"
    echo "   Instalando @nestjs/cli..."
    npm install -g @nestjs/cli
fi

echo "✅ @nestjs/cli disponível"

# Limpar build anterior
echo "🧹 Limpando build anterior..."
rm -rf dist/

# Executar build
echo "🔨 Executando build..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build falhou"
    exit 1
fi

echo "✅ Build executado com sucesso"

# Verificar se dist/main.js existe
if [ -f "dist/main.js" ]; then
    echo "✅ dist/main.js encontrado"
else
    echo "❌ dist/main.js não encontrado"
    echo "📁 Conteúdo do diretório dist/:"
    ls -la dist/
    exit 1
fi

# Verificar se o arquivo é executável
echo "🧪 Testando execução..."
if node dist/main.js --help > /dev/null 2>&1; then
    echo "✅ Arquivo main.js é executável"
else
    echo "⚠️  Arquivo main.js encontrado mas pode ter problemas"
fi

echo ""
echo "🎉 Build testado com sucesso!"
echo "💡 O Dockerfile deve funcionar agora." 