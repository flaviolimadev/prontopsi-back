#!/bin/bash

echo "🚀 TESTE RÁPIDO: Verificando build do backend..."

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

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Executar build
echo "🔨 Executando build..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build falhou!"
    exit 1
fi

echo "✅ Build executado com sucesso"

# Verificar estrutura do dist
echo "📁 Estrutura do diretório dist/:"
ls -la dist/

# Verificar se dist/src/main.js existe
if [ -f "dist/src/main.js" ]; then
    echo "✅ dist/src/main.js encontrado"
    echo "📏 Tamanho: $(ls -lh dist/src/main.js | awk '{print $5}')"
else
    echo "❌ dist/src/main.js não encontrado"
    echo "🔍 Procurando por arquivos .js:"
    find dist/ -name "*.js" -type f
    exit 1
fi

# Testar execução rápida
echo "🧪 Testando execução..."
timeout 3s node dist/src/main.js &
PID=$!
sleep 1
if kill -0 $PID 2>/dev/null; then
    echo "✅ Aplicação iniciou corretamente"
    kill $PID
    echo ""
    echo "🎉 Teste concluído com sucesso!"
    echo "💡 O Dockerfile deve funcionar agora."
else
    echo "❌ Aplicação não iniciou"
    exit 1
fi 