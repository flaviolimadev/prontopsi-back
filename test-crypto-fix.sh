#!/bin/bash

echo "🔐 TESTE CRYPTO: Verificando se o problema do crypto foi resolvido..."

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ package.json não encontrado"
    echo "   Execute este script no diretório backEnd/backprontupsi/"
    exit 1
fi

echo "✅ package.json encontrado"

# Verificar versão do Node.js
echo "🔍 Verificando versão do Node.js..."
NODE_VERSION=$(node --version)
echo "📋 Node.js versão: $NODE_VERSION"

if [[ "$NODE_VERSION" == v18* ]]; then
    echo "⚠️  Usando Node.js 18 - pode ter problemas de compatibilidade"
    echo "💡 Recomendado: Node.js 20+"
fi

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

# Verificar se dist/src/main.js existe
if [ -f "dist/src/main.js" ]; then
    echo "✅ dist/src/main.js encontrado"
    echo "📏 Tamanho: $(ls -lh dist/src/main.js | awk '{print $5}')"
else
    echo "❌ dist/src/main.js não encontrado"
    echo "📁 Arquivos em dist/:"
    ls -la dist/
    exit 1
fi

# Testar se o módulo carrega sem erro de crypto
echo "🧪 Testando carregamento do módulo..."
node -e "
try {
  require('./dist/src/main.js');
  console.log('✅ Módulo carrega sem erros de crypto');
} catch (error) {
  if (error.message.includes('crypto')) {
    console.log('❌ Erro de crypto ainda presente:', error.message);
    process.exit(1);
  } else {
    console.log('⚠️  Outro erro:', error.message);
  }
}
"

if [ $? -ne 0 ]; then
    echo "❌ Problema de crypto ainda presente!"
    exit 1
fi

# Testar execução rápida
echo "🧪 Testando execução..."
timeout 5s node dist/src/main.js &
PID=$!
sleep 2
if kill -0 $PID 2>/dev/null; then
    echo "✅ Aplicação iniciou sem erro de crypto"
    kill $PID
    echo ""
    echo "🎉 Teste crypto concluído com sucesso!"
    echo "💡 O problema do crypto foi resolvido."
else
    echo "❌ Aplicação não iniciou ou falhou"
    exit 1
fi 