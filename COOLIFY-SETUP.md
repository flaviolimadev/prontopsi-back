# 🌐 Coolify Setup - ProntuPsi Backend

## 📋 Configuração Completa no Coolify

### **1. Configuração do Projeto**

#### **Build Settings:**
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Dockerfile**: `backEnd/backprontupsi/Dockerfile`
- **Context**: `backEnd/backprontupsi/`
- **Port**: `3000`

#### **Health Check:**
- **URL**: `http://localhost:3000/api/health`
- **Interval**: 30s
- **Timeout**: 10s
- **Retries**: 3

### **2. Variáveis de Ambiente Obrigatórias**

Configure estas variáveis no painel do Coolify:

```env
# Configurações da Aplicação
NODE_ENV=production
PORT=3000

# Database (PostgreSQL)
DB_HOST=postgres
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=prontupsi123
DB_NAME=prontopsi_db

# JWT
JWT_SECRET=prontupsi-super-secret-jwt-key-for-production
JWT_EXPIRES_IN=7d

# CORS
FRONTEND_URL=https://prontupsi.seudominio.com

# Uploads
UPLOAD_DEST=uploads
MAX_FILE_SIZE=10485760
```

### **3. Configuração do Banco de Dados**

#### **PostgreSQL (Recomendado):**
```env
# Se usando PostgreSQL no Coolify
DB_HOST=postgres
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=sua_senha_segura
DB_NAME=prontopsi_db
```

#### **PostgreSQL Externo:**
```env
# Se usando PostgreSQL externo
DB_HOST=seu-postgres-host.com
DB_PORT=5432
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_NAME=prontopsi_db
```

### **4. Configuração de Domínio**

#### **Domínio da API:**
- **Domain**: `api.seudominio.com`
- **SSL**: Automático (Let's Encrypt)
- **Port**: `3000`

### **5. Ordem de Deploy**

1. **Primeiro**: Configure o banco de dados
2. **Segundo**: Deploy do Backend
3. **Terceiro**: Configure variáveis de ambiente
4. **Quarto**: Deploy do Frontend

### **6. Troubleshooting**

#### **Erro: "Dockerfile not found"**
**Solução**: Configure o contexto correto no Coolify:
- **Context**: `backEnd/backprontupsi/`
- **Dockerfile**: `Dockerfile` (relativo ao contexto)

#### **Erro: "Database connection failed"**
**Solução**: Verifique as variáveis de banco de dados:
```bash
# Teste conexão
curl http://localhost:3000/api/health
```

#### **Erro: "JWT_SECRET not defined"**
**Solução**: Configure JWT_SECRET:
```env
JWT_SECRET=sua-chave-super-secreta-muito-longa
```

#### **Erro: "Cannot find module '/app/dist/main'"**
**Solução**: O Dockerfile foi corrigido para:
- Instalar todas as dependências (incluindo devDependencies)
- Executar build corretamente
- Usar `dist/main.js` em vez de `dist/main`

**Verificação**:
```bash
# Testar build local
cd backEnd/backprontupsi/
./test-build.sh
```

### **7. URLs Finais**

- **Backend API**: `https://api.seudominio.com/api`
- **Health Check**: `https://api.seudominio.com/api/health`
- **Swagger Docs**: `https://api.seudominio.com/api/docs`

### **8. Configuração no Coolify UI**

#### **Passo a Passo:**

1. **Criar Novo Projeto**
   - Nome: `prontupsi-backend`
   - Tipo: Application
   - Framework: Docker

2. **Configurar Build**
   - **Context**: `backEnd/backprontupsi/`
   - **Dockerfile**: `Dockerfile`
   - **Port**: `3000`

3. **Adicionar Variáveis de Ambiente**
   - Copie todas as variáveis da seção 2

4. **Configurar Domínio**
   - Domain: `api.seudominio.com`
   - SSL: Automático

5. **Deploy**
   - Clique em "Deploy"
   - Acompanhe os logs

### **9. Verificação Pós-Deploy**

```bash
# Health check
curl https://api.seudominio.com/api/health

# Deve retornar:
{
  "status": "ok",
  "timestamp": "2025-08-05T21:55:00.000Z",
  "uptime": 123.456,
  "environment": "production",
  "version": "1.0.0"
}
```

---

**🎯 Resultado**: Backend rodando com API funcional!