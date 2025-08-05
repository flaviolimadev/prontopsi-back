#!/bin/bash

# Script de teste para verificar se o build Docker funcionará
echo "🧪 Testando pré-requisitos para build Docker do Backend..."

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Erro: Execute este script no diretório do backend${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Diretório correto encontrado${NC}"

# Verificar se é um projeto NestJS
if ! grep -q "@nestjs" package.json; then
    echo -e "${RED}❌ Este não parece ser um projeto NestJS${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Projeto NestJS detectado${NC}"

# Verificar se Docker está disponível
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker não está instalado${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker está disponível${NC}"

# Verificar se Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker não está rodando${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker está rodando${NC}"

# Verificar arquivos necessários
files=("Dockerfile" "package.json" "tsconfig.json" "ormconfig.ts")
for file in "${files[@]}"; do
    if [ ! -f "$file" ]; then
        echo -e "${RED}❌ Arquivo necessário não encontrado: $file${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ $file encontrado${NC}"
done

# Verificar se node_modules existe (para build local)
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  node_modules não encontrado. Execute 'npm install' primeiro.${NC}"
fi

# Verificar variáveis de ambiente críticas
env_file=".env"
if [ ! -f "$env_file" ]; then
    echo -e "${YELLOW}⚠️  Arquivo .env não encontrado${NC}"
    echo -e "${YELLOW}   Certifique-se de configurar as variáveis de ambiente para produção${NC}"
else
    echo -e "${GREEN}✅ Arquivo .env encontrado${NC}"
    
    # Verificar variáveis críticas
    critical_vars=("DB_HOST" "DB_PASSWORD" "JWT_SECRET")
    for var in "${critical_vars[@]}"; do
        if grep -q "^$var=" "$env_file"; then
            echo -e "${GREEN}✅ $var configurado${NC}"
        else
            echo -e "${YELLOW}⚠️  $var não encontrado no .env${NC}"
        fi
    done
fi

# Teste de build local (opcional)
echo -e "${YELLOW}🔨 Testando build local...${NC}"
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Build local bem-sucedido${NC}"
    if [ -d "dist" ]; then
        echo -e "${GREEN}✅ Diretório dist criado${NC}"
        file_count=$(find dist -type f | wc -l)
        echo -e "${GREEN}📁 $file_count arquivos gerados${NC}"
        
        # Verificar se main.js existe
        if [ -f "dist/main.js" ]; then
            echo -e "${GREEN}✅ main.js encontrado${NC}"
        else
            echo -e "${RED}❌ main.js não encontrado em dist/${NC}"
        fi
    fi
else
    echo -e "${RED}❌ Build local falhou${NC}"
    echo -e "${YELLOW}   Tente executar: npm install && npm run build${NC}"
fi

# Verificar porta disponível
if command -v netstat &> /dev/null; then
    if netstat -an | grep -q ":3000"; then
        echo -e "${YELLOW}⚠️  Porta 3000 está em uso${NC}"
        echo -e "${YELLOW}   Pare outros serviços ou use outra porta${NC}"
    else
        echo -e "${GREEN}✅ Porta 3000 disponível${NC}"
    fi
fi

echo ""
echo -e "${GREEN}🎉 Pré-requisitos verificados!${NC}"
echo -e "${YELLOW}💡 Para fazer o build Docker, execute:${NC}"
echo "   docker build -t prontupsi-backend ."
echo ""
echo -e "${YELLOW}💡 Para executar o container:${NC}"
echo "   docker run -p 3001:3000 -e NODE_ENV=production prontupsi-backend"
echo ""
echo -e "${YELLOW}💡 Para executar com PostgreSQL:${NC}"
echo "   docker-compose up -d"