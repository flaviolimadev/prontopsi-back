# 🐳 ProntuPsi Backend - Deploy com Docker

Este documento explica como fazer o deploy do backend ProntuPsi (NestJS + PostgreSQL) usando Docker, especialmente em serviços como Coolify.

## 📋 Pré-requisitos

- Docker e Docker Compose instalados
- Node.js 18+ (para desenvolvimento local)
- PostgreSQL (local ou container)
- Acesso ao registry de containers (opcional)

## 🚀 Quick Start

### 1. Build da Imagem

```bash
# Build simples
docker build -t prontupsi-backend .

# Build com tag específica
docker build -t prontupsi-backend:v1.0.0 .

# Usando o script automatizado (Linux/Mac)
./build-docker.sh
```

### 2. Executar com Docker Compose (Recomendado)

```bash
# Subir backend + PostgreSQL
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar serviços
docker-compose down
```

### 3. Executar Apenas o Backend

```bash
# Com banco externo
docker run -p 3001:3000 \
  -e NODE_ENV=production \
  -e DB_HOST=seu-postgres-host \
  -e DB_PASSWORD=sua-senha \
  -e JWT_SECRET=seu-jwt-secret \
  prontupsi-backend

# Em background
docker run -d --name prontupsi-backend \
  -p 3001:3000 \
  -e NODE_ENV=production \
  prontupsi-backend
```

### 4. Acessar a API

```
http://localhost:3001/api
```

## 🔧 Configuração para Produção

### Variáveis de Ambiente Obrigatórias

```env
# Ambiente
NODE_ENV=production
PORT=3000

# Database
DB_HOST=postgres
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=sua-senha-segura
DB_NAME=prontopsi_db

# JWT
JWT_SECRET=sua-chave-jwt-super-secreta
JWT_EXPIRES_IN=7d

# CORS
FRONTEND_URL=https://prontupsi.seudominio.com
```

### Configuração do PostgreSQL

O docker-compose.yml já inclui PostgreSQL configurado:

```yaml
postgres:
  image: postgres:15-alpine
  environment:
    POSTGRES_USER: postgres
    POSTGRES_PASSWORD: password
    POSTGRES_DB: prontopsi_db
  volumes:
    - postgres-data:/var/lib/postgresql/data
```

## 🌐 Deploy em Coolify

### 1. Configuração no Coolify

1. **Criar Novo Projeto**
   - Conecte seu repositório Git
   - Selecione a branch de produção

2. **Configurar Serviços**
   - **Backend**: Use o Dockerfile fornecido
   - **PostgreSQL**: Adicione como serviço separado

3. **Variáveis de Ambiente**
   ```env
   NODE_ENV=production
   PORT=3000
   DB_HOST=postgres
   DB_USER=postgres
   DB_PASSWORD=sua-senha-super-segura
   DB_NAME=prontopsi_db
   JWT_SECRET=sua-chave-jwt-super-secreta-256-bits
   FRONTEND_URL=https://prontupsi.seudominio.com
   ```

4. **Configurar Volumes**
   - **uploads**: `/app/uploads` (para arquivos enviados)
   - **postgres_data**: `/var/lib/postgresql/data`

5. **Configurar Rede**
   - Certifique-se que backend e PostgreSQL estão na mesma rede

### 2. Deploy Automático

O Coolify detectará automaticamente o Dockerfile e fará o build/deploy.

### 3. Configurar Domínio

1. **Backend API**: `api.seudominio.com`
2. **SSL automático**: Habilitado
3. **Health checks**: `/api/health`

## 🚀 Deploy em Outros Serviços

### Railway

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login e deploy
railway login
railway init
railway up

# Configurar PostgreSQL
railway add postgresql
```

### Heroku

```bash
# Instalar Heroku CLI
npm install -g heroku

# Login e criar app
heroku login
heroku create prontupsi-backend

# Adicionar PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Deploy
git push heroku main
```

### DigitalOcean App Platform

1. **Conecte o repositório**
2. **Configure**:
   - Build Command: `npm run build`
   - Run Command: `npm run start:prod`
   - Environment: Node.js 18

3. **Adicione PostgreSQL**:
   - Database: PostgreSQL 15
   - Configure variáveis de ambiente automaticamente

## 🔍 Health Checks e Monitoramento

### Endpoints Disponíveis

```bash
# Health check geral
curl http://localhost:3001/api/health

# Informações da API
curl http://localhost:3001/api

# Status do banco (se autenticado)
curl -H "Authorization: Bearer seu-token" \
  http://localhost:3001/api/users/me
```

### Logs

```bash
# Docker Compose
docker-compose logs -f prontupsi-backend

# Container direto
docker logs -f prontupsi-backend

# Logs específicos
docker logs prontupsi-backend --tail 100
```

## 📊 Otimizações Incluídas

### Multi-stage Build
- 🔄 Stage 1: Build da aplicação NestJS
- 🚀 Stage 2: Runtime otimizado com Alpine Linux

### Segurança
- 🛡️ Usuário não-root
- 🔒 Dependências apenas de produção
- 🚫 Arquivos desnecessários removidos

### Performance
- ⚡ Node.js 18 Alpine (imagem menor)
- 📦 Cache de dependências otimizado
- 🗜️ Build otimizado do TypeScript

## 🐛 Troubleshooting

### Problema: Build falha

```bash
# Verificar logs de build
docker build -t prontupsi-backend . --no-cache

# Verificar dependências
npm install
npm run build
```

### Problema: Não conecta ao PostgreSQL

```bash
# Verificar se PostgreSQL está rodando
docker-compose ps

# Testar conexão
docker exec -it prontupsi-postgres \
  psql -U postgres -d prontopsi_db -c "SELECT 1;"

# Verificar variáveis de ambiente
docker exec prontupsi-backend env | grep DB_
```

### Problema: Erros de CORS

```bash
# Verificar variável FRONTEND_URL
docker exec prontupsi-backend env | grep FRONTEND_URL

# Logs de requisições
docker logs prontupsi-backend | grep CORS
```

### Problema: JWT não funciona

```bash
# Verificar JWT_SECRET
docker exec prontupsi-backend env | grep JWT_SECRET

# Deve ter pelo menos 32 caracteres
# Regenerar se necessário
```

### Problema: Uploads não funcionam

```bash
# Verificar volume de uploads
docker volume ls | grep uploads

# Verificar permissões
docker exec prontupsi-backend ls -la uploads/
```

## 📝 Scripts Disponíveis

```bash
# Teste de pré-requisitos
./test-docker-build.sh

# Build da imagem
./build-docker.sh

# Build para produção
npm run build

# Executar em produção
npm run start:prod

# Migrations
npm run migration:run

# Testes
npm run test
```

## 🔐 Segurança em Produção

### Variáveis Sensíveis

```env
# Use senhas fortes (32+ caracteres)
DB_PASSWORD=sua-senha-super-segura-com-numeros-123

# JWT Secret deve ter 256 bits
JWT_SECRET=uma-chave-jwt-super-secreta-com-pelo-menos-32-caracteres

# Altere URLs para produção
FRONTEND_URL=https://prontupsi.seudominio.com
```

### Backup do Banco

```bash
# Backup automático
docker exec prontupsi-postgres \
  pg_dump -U postgres prontopsi_db > backup.sql

# Restore
docker exec -i prontupsi-postgres \
  psql -U postgres prontopsi_db < backup.sql
```

## 📞 Suporte

### URLs Importantes
- **API**: `http://localhost:3001/api`
- **Health**: `http://localhost:3001/api/health`
- **Docs**: `http://localhost:3001/api/docs` (se configurado)

### Comandos Úteis

```bash
# Status dos containers
docker-compose ps

# Restart do backend
docker-compose restart prontupsi-backend

# Limpar tudo e recomeçar
docker-compose down -v
docker-compose up -d --build
```

---

**🔥 Backend pronto para produção! 🚀**