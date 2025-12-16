#!/bin/bash

echo "🔍 DEBUG: Verificando build do backend..."

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ package.json não encontrado"
    echo "   Execute este script no diretório backEnd/backprontupsi/"
    exit 1
fi

echo "✅ package.json encontrado"

# Verificar conteúdo do package.json
echo "📋 Scripts disponíveis:"
grep -A 10 '"scripts"' package.json

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
echo "🔧 Verificando @nestjs/cli..."
if ! npx nest --version > /dev/null 2>&1; then
    echo "❌ @nestjs/cli não está disponível"
    echo "   Instalando @nestjs/cli..."
    npm install -g @nestjs/cli
fi

echo "✅ @nestjs/cli disponível: $(npx nest --version)"

# Verificar se src/main.ts existe
if [ -f "src/main.ts" ]; then
    echo "✅ src/main.ts encontrado"
else
    echo "❌ src/main.ts não encontrado"
    exit 1
fi

# Limpar build anterior
echo "🧹 Limpando build anterior..."
rm -rf dist/

# Executar build com debug
echo "🔨 Executando build com debug..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build falhou"
    echo "📋 Últimas linhas do log:"
    tail -20 npm-debug.log 2>/dev/null || echo "Nenhum log de debug encontrado"
    exit 1
fi

echo "✅ Build executado com sucesso"

# Verificar conteúdo do diretório dist
echo "📁 Conteúdo do diretório dist/:"
ls -la dist/

       # Verificar se dist/src/main.js existe
       if [ -f "dist/src/main.js" ]; then
           echo "✅ dist/src/main.js encontrado"
           echo "📏 Tamanho: $(ls -lh dist/src/main.js | awk '{print $5}')"
       else
           echo "❌ dist/src/main.js não encontrado"
           echo "📁 Arquivos em dist/:"
           find dist/ -type f -name "*.js" | head -10
           exit 1
       fi

# Verificar se o arquivo é executável
echo "🧪 Testando execução..."
if node dist/src/main.js --help > /dev/null 2>&1; then
    echo "✅ Arquivo main.js é executável"
else
    echo "⚠️  Arquivo main.js encontrado mas pode ter problemas"
    echo "📋 Primeiras linhas do arquivo:"
    head -5 dist/src/main.js
fi

# Verificar dependências
echo "📦 Verificando dependências..."
node -e "
try {
  require('./dist/src/main.js');
  console.log('✅ Módulo carrega sem erros');
} catch (error) {
  console.log('❌ Erro ao carregar módulo:', error.message);
}
"

echo ""
echo "🎉 Debug concluído!"
echo "💡 Se tudo estiver OK, o Dockerfile deve funcionar." 