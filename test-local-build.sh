#!/bin/bash

echo "🧪 TESTE LOCAL: Verificando build do backend..."

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

# Verificar se dist/main.js existe
if [ -f "dist/main.js" ]; then
    echo "✅ dist/main.js encontrado"
    echo "📏 Tamanho: $(ls -lh dist/main.js | awk '{print $5}')"
else
    echo "❌ dist/main.js não encontrado"
    echo "📁 Arquivos em dist/:"
    ls -la dist/
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
echo "🎉 Teste local concluído com sucesso!"
echo "💡 O Dockerfile deve funcionar agora." 