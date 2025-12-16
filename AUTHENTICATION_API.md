# API de Autenticação - ProntoPsi

## Endpoints de Autenticação

### Base URL
```
http://localhost:3001/api
```

## 1. Registro de Usuário

**POST** `/auth/register`

Registra um novo usuário no sistema.

### Request Body
```json
{
  "nome": "João",
  "sobrenome": "Silva",
  "email": "joao@email.com",
  "password": "senha123",
  "contato": "+55 11 99999-9999",
  "referredAt": "eDr5-tre1-2Gtfa",
  "descricao": "Psicólogo especializado em TCC"
}
```

### Response (200)
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-do-usuario",
    "nome": "João",
    "sobrenome": "Silva",
    "email": "joao@email.com",
    "code": "eDr5-tre1-2Gtfa",
    "contato": "+55 11 99999-9999",
    "status": 1,
    "pontos": 0,
    "nivelId": 1,
    "planoId": null,
    "avatar": null,
    "descricao": "Psicólogo especializado em TCC",
    "referredAt": "eDr5-tre1-2Gtfa",
    "createdAt": "2024-01-01T10:00:00Z",
    "updatedAt": "2024-01-01T10:00:00Z"
  }
}
```

### Erros
- **400** - Dados inválidos
- **409** - Email já cadastrado
- **409** - Código de referência inválido

## 2. Login

**POST** `/auth/login`

Realiza login do usuário.

### Request Body
```json
{
  "email": "joao@email.com",
  "password": "senha123"
}
```

### Response (200)
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-do-usuario",
    "nome": "João",
    "sobrenome": "Silva",
    "email": "joao@email.com",
    "code": "eDr5-tre1-2Gtfa",
    "contato": "+55 11 99999-9999",
    "status": 1,
    "pontos": 0,
    "nivelId": 1,
    "planoId": null,
    "avatar": null,
    "descricao": "Psicólogo especializado em TCC",
    "referredAt": "eDr5-tre1-2Gtfa",
    "createdAt": "2024-01-01T10:00:00Z",
    "updatedAt": "2024-01-01T10:00:00Z"
  }
}
```

### Erros
- **401** - Credenciais inválidas
- **401** - Usuário inativo

## 3. Logout

**POST** `/auth/logout`

Realiza logout do usuário.

### Headers
```
Authorization: Bearer <token>
```

### Response (200)
```json
{
  "message": "Logout realizado com sucesso"
}
```

## 4. Perfil do Usuário

### 4.1 Obter Perfil

**GET** `/auth/me` ou **GET** `/users/me`

Obtém o perfil do usuário autenticado.

### Headers
```
Authorization: Bearer <token>
```

### Response (200)
```json
{
  "id": "uuid-do-usuario",
  "nome": "João",
  "sobrenome": "Silva",
  "email": "joao@email.com",
  "code": "eDr5-tre1-2Gtfa",
  "contato": "+55 11 99999-9999",
  "status": 1,
  "pontos": 0,
  "nivelId": 1,
  "planoId": null,
  "avatar": null,
  "descricao": "Psicólogo especializado em TCC",
  "referredAt": "eDr5-tre1-2Gtfa",
  "createdAt": "2024-01-01T10:00:00Z",
  "updatedAt": "2024-01-01T10:00:00Z"
}
```

### 4.2 Atualizar Perfil

**PUT** `/auth/profile` ou **PUT** `/users/me`

Atualiza o perfil do usuário autenticado.

### Headers
```
Authorization: Bearer <token>
```

### Request Body
```json
{
  "nome": "João Pedro",
  "contato": "+55 11 88888-8888",
  "descricao": "Psicólogo especializado em TCC e EMDR"
}
```

### Response (200)
```json
{
  "id": "uuid-do-usuario",
  "nome": "João Pedro",
  "sobrenome": "Silva",
  "email": "joao@email.com",
  "code": "eDr5-tre1-2Gtfa",
  "contato": "+55 11 88888-8888",
  "status": 1,
  "pontos": 0,
  "nivelId": 1,
  "planoId": null,
  "avatar": null,
  "descricao": "Psicólogo especializado em TCC e EMDR",
  "referredAt": "eDr5-tre1-2Gtfa",
  "createdAt": "2024-01-01T10:00:00Z",
  "updatedAt": "2024-01-01T10:00:00Z"
}
```

## 5. Buscar Usuário por Código

**GET** `/auth/user/:code` ou **GET** `/users/code/:code`

Busca um usuário pelo código de referência.

### Response (200)
```json
{
  "id": "uuid-do-usuario",
  "nome": "João",
  "sobrenome": "Silva",
  "email": "joao@email.com",
  "code": "eDr5-tre1-2Gtfa",
  "contato": "+55 11 99999-9999",
  "status": 1,
  "pontos": 0,
  "nivelId": 1,
  "planoId": null,
  "avatar": null,
  "descricao": "Psicólogo especializado em TCC",
  "referredAt": "eDr5-tre1-2Gtfa",
  "createdAt": "2024-01-01T10:00:00Z",
  "updatedAt": "2024-01-01T10:00:00Z"
}
```

### Erros
- **401** - Usuário não encontrado

## Autenticação

### JWT Token
- O token JWT é retornado no login e registro
- Deve ser incluído no header `Authorization: Bearer <token>`
- Expira em 7 dias
- Contém: `sub` (user ID), `email`, `code`

### Exemplo de Uso

```javascript
// Login
const response = await fetch('http://localhost:3001/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'joao@email.com',
    password: 'senha123'
  })
});

const { token, user } = await response.json();

// Requisição autenticada
const profileResponse = await fetch('http://localhost:3001/api/users/me', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## Validações

### Registro
- Email deve ser único
- Senha deve ter pelo menos 6 caracteres
- Código de referência deve existir (se fornecido)
- Nome e sobrenome são obrigatórios

### Login
- Email e senha são obrigatórios
- Usuário deve estar ativo (status = 1)

### Atualização de Perfil
- Email deve ser único (se alterado)
- Senha é opcional (se fornecida, será hasheada)

## Segurança

- Senhas são hasheadas com bcrypt (10 rounds)
- Tokens JWT expiram em 7 dias
- Validação de usuário ativo em todas as requisições autenticadas
- CORS configurado para frontend
- Validação de entrada com class-validator 