# Dockerfile para ProntuPsi Backend (NestJS)
# Multi-stage build para otimização

# Stage 1: Build
FROM node:18-alpine AS builder

# Instalar dependências do sistema para builds nativos
RUN apk add --no-cache python3 make g++

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências primeiro (para cache otimizado)
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production --silent

# Copiar dependências de desenvolvimento para build
RUN npm ci --silent

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build

# Remover dependências de desenvolvimento
RUN npm prune --production

# Stage 2: Production
FROM node:18-alpine AS production

# Instalar dependências necessárias para produção
RUN apk add --no-cache curl dumb-init

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001 -G nodejs

# Definir diretório de trabalho
WORKDIR /app

# Copiar package.json e dependências de produção
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package*.json ./

# Copiar build da aplicação
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist

# Copiar arquivos de configuração necessários
COPY --from=builder --chown=nestjs:nodejs /app/ormconfig.ts ./
COPY --from=builder --chown=nestjs:nodejs /app/.env* ./

# Criar diretório para uploads
RUN mkdir -p uploads/avatars && chown -R nestjs:nodejs uploads

# Trocar para usuário não-root
USER nestjs

# Expor porta da aplicação
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Comando para iniciar a aplicação
CMD ["dumb-init", "node", "dist/main"]