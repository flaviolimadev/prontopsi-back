# Dockerfile para ProntuPsi Backend (NestJS)
# Versão com debug completo e build forçado

FROM node:18-alpine

# Instalar dependências do sistema
RUN apk add --no-cache curl dumb-init python3 make g++

# Definir diretório de trabalho
WORKDIR /app

# Copiar package.json primeiro (para cache)
COPY package*.json ./

# Instalar todas as dependências com debug
RUN npm ci --verbose

# Copiar todo o código fonte
COPY . .

# Verificar se os arquivos foram copiados
RUN echo "📁 Arquivos copiados:" && ls -la

# Verificar se src/main.ts existe
RUN echo "🔍 Verificando src/main.ts:" && ls -la src/main.ts

# Verificar se @nestjs/cli está disponível
RUN echo "🔧 Verificando @nestjs/cli:" && npx nest --version

# Executar build com debug completo
RUN echo "🔨 Iniciando build..." && \
    npm run build || (echo "❌ Build falhou!" && exit 1)

# Verificar se o build foi bem-sucedido
RUN echo "✅ Build completed successfully" && \
    echo "📁 Conteúdo do diretório dist/:" && \
    ls -la dist/ && \
           echo "🔍 Verificando dist/src/main.js:" && \
       ls -la dist/src/main.js && \
       echo "📏 Tamanho do main.js:" && \
       ls -lh dist/src/main.js

# Criar diretório para uploads
RUN mkdir -p uploads/avatars

# Expor porta da aplicação
EXPOSE 3019

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3019/api/health || exit 1

# Comando para iniciar a aplicação
CMD ["dumb-init", "node", "dist/src/main.js"]