# Comunicação Frontend ↔ Backend - ProntoPsi

## Configuração da Comunicação

### Frontend (React + Vite)

**Arquivo**: `frontEnd/.env`
```env
# Configurações da API Backend
VITE_API_URL=http://localhost:3001/api

# Configurações da Aplicação
VITE_APP_NAME=ProntoPsi
VITE_APP_VERSION=1.0.0
NODE_ENV=development
```

**Serviço de API**: `frontEnd/src/services/api.service.ts`
- Cliente Axios configurado
- Interceptors para autenticação
- Métodos para todas as operações CRUD
- Tratamento automático de erros 401

### Backend (NestJS)

**Arquivo**: `backEnd/backprontupsi/.env`
```env
# Configurações do Banco de Dados PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=prontopsi_db
DB_USER=postgres
DB_PASSWORD=password

# Configurações da Aplicação
PORT=3001
JWT_SECRET=your-super-secret-jwt-key-here
NODE_ENV=development

# Configurações do Frontend
FRONTEND_URL=http://localhost:8080
```

**CORS Configurado**: `backEnd/backprontupsi/src/main.ts`
- Aceita múltiplas origens do frontend
- Credenciais habilitadas
- Headers de autorização permitidos

## Estrutura da API

### Base URL
```
http://localhost:3001/api
```

### Endpoints Principais

#### Autenticação
- `POST /auth/login` - Login do usuário
- `POST /auth/register` - Registro de usuário
- `POST /auth/logout` - Logout

#### Usuários
- `GET /users/me` - Usuário atual
- `PUT /users/:id` - Atualizar usuário
- `GET /users/code/:code` - Buscar por código

#### Pacientes (futuro)
- `GET /patients` - Listar pacientes
- `POST /patients` - Criar paciente
- `PUT /patients/:id` - Atualizar paciente
- `DELETE /patients/:id` - Deletar paciente

#### Agendamentos (futuro)
- `GET /appointments` - Listar agendamentos
- `POST /appointments` - Criar agendamento
- `PUT /appointments/:id` - Atualizar agendamento
- `DELETE /appointments/:id` - Deletar agendamento

#### Prontuários (futuro)
- `GET /medical-records` - Listar prontuários
- `POST /medical-records` - Criar prontuário
- `PUT /medical-records/:id` - Atualizar prontuário
- `DELETE /medical-records/:id` - Deletar prontuário

#### Financeiro (futuro)
- `GET /financial-records` - Listar registros financeiros
- `POST /financial-records` - Criar registro financeiro
- `PUT /financial-records/:id` - Atualizar registro financeiro
- `DELETE /financial-records/:id` - Deletar registro financeiro

#### Arquivos (futuro)
- `POST /files/upload` - Upload de arquivo
- `GET /files` - Listar arquivos
- `DELETE /files/:id` - Deletar arquivo

#### Relatórios (futuro)
- `GET /reports` - Listar relatórios
- `POST /reports/generate` - Gerar relatório
- `GET /reports/:id/export` - Exportar relatório

## Autenticação

### JWT Token
- Token armazenado no `localStorage` como `auth_token`
- Interceptor adiciona automaticamente o header `Authorization: Bearer <token>`
- Erro 401 redireciona para `/login`

### Exemplo de Uso

```typescript
// Login
const { token, user } = await apiService.login('email@exemplo.com', 'senha123');
localStorage.setItem('auth_token', token);
localStorage.setItem('user', JSON.stringify(user));

// Requisição autenticada (token adicionado automaticamente)
const patients = await apiService.getPatients();

// Logout
await apiService.logout();
localStorage.removeItem('auth_token');
localStorage.removeItem('user');
```

## Tratamento de Erros

### Frontend
- Interceptor captura erros 401 e redireciona para login
- Timeout de 10 segundos para requisições
- Tratamento de erros de rede

### Backend
- Validação global com class-validator
- Respostas padronizadas
- Logs de erro detalhados

## Desenvolvimento

### Iniciar Backend
```bash
cd backEnd/backprontupsi
npm run start:dev
```

### Iniciar Frontend
```bash
cd frontEnd
npm run dev
```

### URLs de Desenvolvimento
- **Backend**: http://localhost:3001/api
- **Frontend**: http://localhost:8080

## Produção

### Variáveis de Ambiente
- `VITE_API_URL` - URL da API em produção
- `FRONTEND_URL` - URL do frontend em produção
- `NODE_ENV=production` - Modo produção

### CORS em Produção
- Configurar apenas as origens necessárias
- Desabilitar credenciais se não necessário
- Usar HTTPS

## Troubleshooting

### Erro de CORS
- Verificar se as URLs estão corretas no CORS
- Confirmar se o frontend está rodando na porta correta
- Verificar se o backend está aceitando a origem

### Erro de Conexão
- Verificar se o backend está rodando
- Confirmar se a URL da API está correta
- Verificar se não há firewall bloqueando

### Erro de Autenticação
- Verificar se o token está sendo enviado
- Confirmar se o token não expirou
- Verificar se o JWT_SECRET está configurado 