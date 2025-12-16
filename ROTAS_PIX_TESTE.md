# 🧪 Rotas de Teste para Pix - ProntuPsi

Este documento descreve as rotas de teste implementadas para testar a funcionalidade de Pix sem precisar de credenciais reais da Efí.

## 🎯 **Objetivo**

As rotas de teste permitem:
- ✅ Testar o fluxo completo de Pix
- ✅ Verificar a integração com o banco de dados
- ✅ Simular pagamentos e mudanças de status
- ✅ Validar a estrutura de dados e relacionamentos
- ✅ Testar filtros e estatísticas

## 🚀 **Rotas Disponíveis**

### 1. **Gerar Pix de Teste PÚBLICO** ⭐ **NOVO!**
```http
POST /api/pix/teste-publico
```

**Autenticação:** ❌ **SEM JWT** (para testes rápidos)

**Body:**
```json
{
  "valor": 100,                           // Valor em centavos (R$ 1,00)
  "descricao": "Teste de Pix Público",    // Descrição do pagamento
  "nomePagador": "João Teste Público",    // Nome do pagador (opcional)
  "cpfPagador": "12345678901",            // CPF do pagador (opcional)
  "emailPagador": "joao.publico@email.com", // Email do pagador (opcional)
  "pacienteId": "uuid-paciente"           // ID do paciente (opcional)
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Pix de teste PÚBLICO gerado com sucesso!",
  "data": {
    "txid": "txid_test_1234567890_abc123",
    "valor": "R$ 1,00",
    "descricao": "Teste de Pix Público",
    "qrcode": "00020126580014br.gov.bcb.pix...",
    "qrcodeImage": "https://api.qrserver.com/...",
    "devedor": {
      "nome": "João Teste Público",
      "cpf": "12345678901",
      "email": "joao.publico@email.com"
    },
    "expiredAt": "2024-01-15T15:30:00.000Z",
    "status": "PENDING",
    "databaseId": "uuid-transacao",
    "isTest": true,
    "isPublicTest": true,
    "instructions": [
      "Este é um Pix de TESTE PÚBLICO - não precisa de autenticação",
      "Use o QR Code para simular o pagamento",
      "O status será atualizado manualmente para simular o fluxo completo",
      "Para testar com autenticação, use: /api/pix/teste-gerar-pix"
    ]
  }
}
```

### 2. **Gerar Pix de Teste (com autenticação)**
```http
POST /api/pix/teste-gerar-pix
```

**Body:**
```json
{
  "valor": 5000,                    // Valor em centavos (R$ 50,00)
  "descricao": "Consulta teste",    // Descrição do pagamento
  "nomePagador": "João Silva",      // Nome do pagador (opcional)
  "cpfPagador": "12345678901",      // CPF do pagador (opcional)
  "emailPagador": "joao@email.com", // Email do pagador (opcional)
  "pacienteId": "uuid-paciente"     // ID do paciente (opcional)
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Pix de teste gerado com sucesso!",
  "data": {
    "txid": "txid_test_1234567890_abc123",
    "valor": "R$ 50,00",
    "descricao": "Consulta teste",
    "qrcode": "00020126580014br.gov.bcb.pix...",
    "qrcodeImage": "https://api.qrserver.com/...",
    "devedor": {
      "nome": "João Silva",
      "cpf": "12345678901",
      "email": "joao@email.com"
    },
    "expiredAt": "2024-01-15T15:30:00.000Z",
    "status": "PENDING",
    "databaseId": "uuid-transacao",
    "isTest": true,
    "instructions": [
      "Este é um Pix de TESTE - não será processado pela Efí",
      "Use o QR Code para simular o pagamento",
      "O status será atualizado manualmente para simular o fluxo completo"
    ]
  }
}
```

### 3. **Simular Pagamento**
```http
POST /api/pix/teste-simular-pagamento/:txid
```

**Parâmetros:**
- `txid`: ID da transação Pix

**Resposta:**
```json
{
  "success": true,
  "message": "Pagamento Pix simulado com sucesso!",
  "data": {
    "txid": "txid_test_1234567890_abc123",
    "valor": "R$ 50,00",
    "status": "PAID",
    "paidAt": "2024-01-15T14:30:00.000Z",
    "isTest": true,
    "message": "Este pagamento foi simulado para fins de teste"
  }
}
```

### 4. **Listar Pixes de Teste**
```http
GET /api/pix/teste-listar
```

**Resposta:**
```json
{
  "success": true,
  "message": "5 Pixes de teste encontrados",
  "data": [
    {
      "id": "uuid-1",
      "txid": "txid_test_1234567890_abc123",
      "valor": "R$ 50,00",
      "descricao": "Consulta teste",
      "status": "PAID",
      "createdAt": "2024-01-15T13:30:00.000Z",
      "expiredAt": "2024-01-15T15:30:00.000Z",
      "paidAt": "2024-01-15T14:30:00.000Z",
      "devedor": {
        "nome": "João Silva",
        "cpf": "12345678901"
      },
      "isExpired": false,
      "daysUntilExpiration": 0
    }
  ]
}
```

### 5. **Limpar Pixes de Teste**
```http
POST /api/pix/teste-limpar
```

**Resposta:**
```json
{
  "success": true,
  "message": "3 Pixes de teste removidos com sucesso",
  "data": {
    "deletedCount": 3,
    "totalTestPixes": 3
  }
}
```

## 🔧 **Como Usar**

### **1. Configurar Token JWT**
```bash
# Editar o arquivo test-pix-routes.js
# Substituir 'seu_token_jwt_aqui' pelo token real
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

### **2. Executar Testes**
```bash
# Instalar dependências (se necessário)
npm install axios

# Executar todos os testes
node test-pix-routes.js

# Ou executar testes específicos
node -e "
const { testarGerarPix } = require('./test-pix-routes.js');
testarGerarPix();
"
```

### **3. Testar via Postman/Insomnia**
```bash
# URL Base
http://localhost:3000

# Headers
Authorization: Bearer seu_token_jwt_aqui
Content-Type: application/json

# Exemplo de requisição
POST /api/pix/teste-gerar-pix
{
  "valor": 10000,
  "descricao": "Sessão de terapia"
}
```

## 📊 **Dados Simulados**

### **QR Code:**
- Gera QR Code válido no formato PIX
- Usa serviço externo para gerar imagem
- Formato: `00020126580014br.gov.bcb.pix0136{txid}...`

### **Valores:**
- **Entrada**: Sempre em centavos (ex: 5000 = R$ 50,00)
- **Saída**: Formatação brasileira (R$ 50,00)
- **Conversão**: Automática no backend

### **Datas:**
- **Criação**: Timestamp atual
- **Expiração**: 1 hora após criação
- **Pagamento**: Timestamp quando simulado

### **Status:**
- **PENDING**: Pix criado, aguardando pagamento
- **PAID**: Pagamento simulado
- **EXPIRED**: Expirado automaticamente
- **CANCELLED**: Cancelado manualmente

## 🧪 **Cenários de Teste**

### **Cenário 1: Fluxo Completo**
1. ✅ Gerar Pix de teste
2. ✅ Verificar status PENDING
3. ✅ Simular pagamento
4. ✅ Verificar status PAID
5. ✅ Verificar estatísticas atualizadas

### **Cenário 2: Múltiplos Pixes**
1. ✅ Gerar 3 Pixes diferentes
2. ✅ Listar todos os Pixes
3. ✅ Simular pagamento de 2 Pixes
4. ✅ Verificar estatísticas parciais
5. ✅ Limpar todos os Pixes

### **Cenário 3: Validações**
1. ✅ Testar com dados mínimos
2. ✅ Testar com dados completos
3. ✅ Verificar formatação de valores
4. ✅ Verificar relacionamentos com usuário

## 🔍 **Verificações Importantes**

### **Banco de Dados:**
- ✅ Transação criada com `metadata.isTest = true`
- ✅ Relacionamentos com usuário e paciente
- ✅ Timestamps automáticos
- ✅ Índices funcionando

### **Validações:**
- ✅ Formato de valores (centavos → reais)
- ✅ Status das transações
- ✅ Datas de expiração
- ✅ QR Codes válidos

### **Segurança:**
- ✅ Autenticação JWT obrigatória (para rotas protegidas)
- ✅ Rota pública para testes rápidos (`/teste-publico`)
- ✅ Controle de acesso por roles (para rotas protegidas)
- ✅ Validação de entrada
- ✅ Isolamento por usuário (para rotas protegidas)

## 🚨 **Limitações**

### **O que NÃO funciona:**
- ❌ Pagamento real via Efí
- ❌ Webhooks da Efí
- ❌ Sincronização com API externa
- ❌ QR Codes escaneáveis reais

### **O que funciona:**
- ✅ Criação de transações no banco
- ✅ Simulação de pagamentos
- ✅ Estatísticas e relatórios
- ✅ Filtros e consultas
- ✅ Relacionamentos completos

## 🚀 **Uso Rápido**

### **Teste Básico (SEM autenticação)** ⭐ **RECOMENDADO para testes rápidos**
```bash
# 1. Gerar Pix de teste PÚBLICO
curl -X POST http://localhost:3000/api/pix/teste-publico \
  -H "Content-Type: application/json" \
  -d '{
    "valor": 100,
    "descricao": "Teste de Pix Público - R$ 1,00"
  }'
```

### **Teste com Autenticação**
```bash
# 1. Gerar Pix de teste (com JWT)
curl -X POST http://localhost:3000/api/pix/teste-gerar-pix \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "valor": 100,
    "descricao": "Teste de Pix - R$ 1,00"
  }'
```

### **Scripts de Teste**
```bash
# Teste público (sem JWT)
node test-pix-publico.js

# Teste completo (com JWT)
node test-pix-routes.js
```

## 📝 **Logs e Debug**

### **Logs do Backend:**
```bash
# Ver logs em tempo real
npm run start:dev

# Filtrar logs de Pix
grep "Pix" logs/app.log
```

### **Logs de Teste:**
```bash
# Executar com debug
DEBUG=pix:* node test-pix-routes.js

# Ver detalhes das requisições
node test-pix-routes.js --verbose
```

## 🔄 **Próximos Passos**

### **Para Produção:**
1. ✅ Remover rotas de teste
2. ✅ Configurar credenciais Efí reais
3. ✅ Implementar webhooks reais
4. ✅ Adicionar validações de produção

### **Para Desenvolvimento:**
1. ✅ Adicionar mais cenários de teste
2. ✅ Implementar testes automatizados
3. ✅ Adicionar validações de negócio
4. ✅ Melhorar logs de debug

## 📞 **Suporte**

### **Problemas Comuns:**
- **Token inválido**: Verificar JWT e expiração
- **Usuário não encontrado**: Verificar autenticação
- **Erro de banco**: Verificar migration e conexão
- **Permissão negada**: Verificar roles do usuário

### **Contato:**
- **Desenvolvedor**: Equipe ProntuPsi
- **Documentação**: Este arquivo
- **Issues**: Repositório do projeto

---

**🎯 Sistema de Teste para Pix - ProntuPsi**  
**📅 Última atualização**: Janeiro 2024  
**🔒 Ambiente**: Desenvolvimento/Teste
