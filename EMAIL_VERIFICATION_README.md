# Sistema de Verificação de Email - ProntuPsi

## 📧 Visão Geral

O sistema de verificação de email foi implementado para garantir que apenas usuários com emails válidos possam acessar a plataforma ProntuPsi. Quando um usuário se registra, ele recebe um código de verificação por email e deve confirmá-lo antes de poder fazer login.

## 🔧 Funcionalidades Implementadas

### 1. Registro com Verificação
- Usuário se registra normalmente
- Sistema gera código de verificação de 6 dígitos
- Email é enviado automaticamente com o código
- Usuário fica inativo até verificar o email

### 2. Verificação de Email
- Usuário insere o código recebido por email
- Sistema valida o código e expiração
- Usuário é ativado e recebe token JWT
- Pode fazer login normalmente

### 3. Reenvio de Código
- Usuário pode solicitar novo código
- Código anterior é invalidado
- Novo email é enviado automaticamente

## 🚀 Endpoints da API

### POST `/auth/register`
**Registra novo usuário e envia código de verificação**

```json
{
  "nome": "João",
  "sobrenome": "Silva",
  "email": "joao@exemplo.com",
  "password": "123456",
  "contato": "(11) 99999-9999"
}
```

**Resposta:**
```json
{
  "message": "Usuário registrado com sucesso. Verifique seu email para ativar sua conta.",
  "user": {
    "id": "uuid",
    "nome": "João",
    "email": "joao@exemplo.com",
    "emailVerified": false,
    "status": 0
  },
  "requiresVerification": true
}
```

### POST `/auth/verify-email`
**Verifica código de confirmação**

```json
{
  "email": "joao@exemplo.com",
  "verificationCode": "123456"
}
```

**Resposta:**
```json
{
  "message": "Email verificado com sucesso!",
  "token": "jwt_token_aqui",
  "user": {
    "id": "uuid",
    "nome": "João",
    "email": "joao@exemplo.com",
    "emailVerified": true,
    "status": 1
  }
}
```

### POST `/auth/resend-verification`
**Reenvia código de verificação**

```json
{
  "email": "joao@exemplo.com"
}
```

**Resposta:**
```json
{
  "message": "Novo código de verificação enviado com sucesso"
}
```

### POST `/auth/login`
**Login (apenas após verificação)**

```json
{
  "email": "joao@exemplo.com",
  "password": "123456"
}
```

**Resposta (se email não verificado):**
```json
{
  "message": "Email não verificado. Verifique seu email para ativar sua conta.",
  "statusCode": 401
}
```

## 📊 Estrutura do Banco de Dados

### Campos Adicionados à Tabela `users`:

```sql
ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN email_verification_code VARCHAR(6);
ALTER TABLE users ADD COLUMN email_verification_expires TIMESTAMP;
```

### Descrição dos Campos:
- `email_verified`: Indica se o email foi verificado
- `email_verification_code`: Código de 6 dígitos para verificação
- `email_verification_expires`: Data/hora de expiração do código (10 minutos)

## 🔒 Segurança

### Validações Implementadas:
1. **Código de 6 dígitos**: Geração aleatória
2. **Expiração**: 10 minutos após geração
3. **Único uso**: Código é invalidado após verificação
4. **Bloqueio de login**: Usuários não verificados não podem fazer login
5. **Reenvio seguro**: Novo código invalida o anterior

### Fluxo de Segurança:
```
Registro → Email enviado → Usuário inativo → Verificação → Usuário ativo → Login permitido
```

## 📧 Template de Email

O email de verificação inclui:
- **Design responsivo** com cores da marca
- **Código destacado** em fonte grande
- **Instruções claras** de uso
- **Avisos de segurança** sobre não compartilhar
- **Informações de expiração** (10 minutos)

## 🧪 Testes

### Script de Teste Automatizado:
```bash
# Testar registro e envio de email
node test-email-verification.js

# Testar verificação com código específico
node test-email-verification.js verify 123456
```

### Testes Manuais:
1. **Registro**: Criar conta e verificar email recebido
2. **Login bloqueado**: Tentar login antes da verificação
3. **Verificação**: Inserir código correto
4. **Login liberado**: Fazer login após verificação
5. **Reenvio**: Solicitar novo código
6. **Código expirado**: Tentar usar código antigo

## 🔧 Configuração

### Variáveis de Ambiente Necessárias:
```env
# Resend Email Configuration
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@prontupsi.com
RESEND_REPLY_TO=suporte@prontupsi.com

# Frontend URL (para links nos emails)
FRONTEND_URL=http://localhost:8080
```

## 📱 Integração com Frontend

### Fluxo Recomendado:
1. **Página de Registro**: Formulário normal
2. **Página de Verificação**: Campo para código + botão reenviar
3. **Redirecionamento**: Para dashboard após verificação
4. **Tratamento de Erros**: Mensagens claras para cada situação

### Estados do Usuário:
- `status: 0, emailVerified: false` → Aguardando verificação
- `status: 1, emailVerified: true` → Usuário ativo

## 🚨 Tratamento de Erros

### Códigos de Erro Comuns:
- **400**: Código inválido ou expirado
- **401**: Email não verificado (tentativa de login)
- **409**: Email já verificado
- **500**: Erro no envio de email

### Mensagens de Erro:
- "Código de verificação inválido"
- "Código de verificação expirado"
- "Email não verificado. Verifique seu email para ativar sua conta."
- "Email já foi verificado"

## 🔄 Próximos Passos

### Melhorias Sugeridas:
1. **Rate Limiting**: Limitar tentativas de verificação
2. **Logs Detalhados**: Rastreamento de tentativas
3. **Notificações**: Alertas para códigos expirando
4. **Múltiplos Idiomas**: Templates em português/inglês
5. **Testes Unitários**: Cobertura completa de testes

### Integrações Futuras:
1. **SMS**: Verificação por SMS como alternativa
2. **2FA**: Autenticação de dois fatores
3. **Sessões**: Gerenciamento de sessões ativas
4. **Auditoria**: Log de todas as verificações

## 📞 Suporte

Para dúvidas ou problemas:
- Verifique os logs do servidor
- Teste com o script automatizado
- Confirme configuração do Resend.com
- Valide variáveis de ambiente
