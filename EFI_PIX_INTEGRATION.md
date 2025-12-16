# Integração com API Pix da Efí

Este documento descreve a implementação completa da integração com a API Pix da Efí no backend do ProntuPsi.

## 🏗️ Arquitetura

A integração foi implementada seguindo os padrões do NestJS e as melhores práticas de segurança:

```
src/pagamentos/
├── efi-pix.service.ts           # Lógica de negócio e comunicação com a API
├── efi-pix.controller.ts        # Endpoints da API REST
├── efi-pix.module.ts            # Organização do módulo
├── pix-transaction.repository.ts # Operações no banco de dados
├── pix-sync.cron.ts             # Cron jobs para sincronização
└── entities/
    └── pix-transaction.entity.ts # Entidade do banco de dados
```

## 🔐 Autenticação OAuth2

A integração utiliza autenticação OAuth2 com certificado P12, conforme especificado na [documentação oficial da Efí](https://dev.efipay.com.br/docs/api-pix/credenciais).

### Fluxo de Autenticação:
1. **Certificado P12**: Leitura do certificado digital fornecido pela Efí
2. **Client Credentials**: Autenticação usando Client ID e Secret
3. **Token Caching**: Cache automático do token de acesso (expira 1 min antes)
4. **Renovação Automática**: Renovação transparente quando necessário

## 📡 Endpoints Disponíveis

### 1. Cobranças Pix
- **POST** `/api/pix/cobranca` - Criar nova cobrança
- **GET** `/api/pix/cobranca/:txid` - Consultar cobrança específica
- **GET** `/api/pix/qrcode/:txid` - Gerar QR Code para pagamento

### 2. Pix Recebidos
- **GET** `/api/pix/recebidos` - Consultar Pix recebidos com filtros

### 3. Envio e Devolução
- **POST** `/api/pix/enviar` - Enviar Pix para outra chave
- **PUT** `/api/pix/devolver/:e2eId` - Devolver Pix recebido

### 4. Status e Monitoramento
- **GET** `/api/pix/status` - Verificar status da API Efí

### 5. Transações e Estatísticas
- **GET** `/api/pix/transacoes` - Listar transações do usuário
- **GET** `/api/pix/estatisticas` - Estatísticas das transações
- **POST** `/api/pix/sincronizar` - Sincronizar transações pendentes
- **POST** `/api/pix/expirar` - Marcar transações expiradas

### 6. Webhooks
- **POST** `/api/pix/webhook` - Receber notificações da Efí Efí

## 🛡️ Segurança

### Controles de Acesso:
- **JWT Authentication**: Todas as rotas requerem token JWT válido
- **Role-based Access**: Apenas usuários ADMIN e PSYCHOLOGIST podem acessar
- **Input Validation**: Validação rigorosa de todos os inputs usando class-validator

### Proteção de Dados:
- **Certificado Seguro**: Certificado P12 armazenado localmente
- **Variáveis de Ambiente**: Credenciais sensíveis em variáveis de ambiente
- **Logs Seguros**: Logs sem exposição de dados sensíveis

## 🔧 Configuração

### 1. Variáveis de Ambiente
```env
# API Efí Pix
EFI_API_URL=https://pix.api.efipay.com.br
EFI_CLIENT_ID=seu_client_id_aqui
EFI_CLIENT_SECRET=seu_client_secret_aqui
EFI_CERT_PATH=./certs/certificado.p12
EFI_CERT_PASSPHRASE=sua_senha_do_certificado
```

### 2. Estrutura de Pastas
```
backprontupsi/
├── certs/
│   ├── .gitignore          # Protege certificados
│   └── certificado.p12     # Certificado da Efí (não commitar)
├── src/pagamentos/
│   ├── efi-pix.service.ts
│   ├── efi-pix.controller.ts
│   └── efi-pix.module.ts
└── .env                    # Variáveis de ambiente
```

## 📊 DTOs e Validação

### Input DTOs:
- **CreatePixChargeDto**: Validação de criação de cobrança
- **SendPixDto**: Validação de envio de Pix
- **RefundPixDto**: Validação de devolução
- **QueryPixDto**: Validação de consultas

### Response DTOs:
- **PixChargeResponseDto**: Resposta de cobrança
- **PixReceivedResponseDto**: Resposta de Pix recebido
- **PixSentResponseDto**: Resposta de Pix enviado

## 🧪 Testes

### Arquivo de Teste:
- **test-efi-pix.js**: Script de teste completo da integração

### Como Executar:
```bash
# Configure as variáveis de ambiente primeiro
export EFI_CLIENT_ID=seu_client_id
export EFI_CLIENT_SECRET=seu_client_secret
export EFI_CERT_PATH=./certs/certificado.p12
export EFI_CERT_PASSPHRASE=sua_senha

# Execute o teste
node test-efi-pix.js
```

### Testes Incluídos:
1. ✅ Autenticação OAuth2
2. ✅ Criação de cobrança Pix
3. ✅ Consulta de cobrança
4. ✅ Consulta de Pix recebidos

## 🚀 Uso no Frontend

### Exemplo de Criação de Cobrança:
```typescript
const response = await fetch('/api/pix/cobranca', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    valor: 5000, // R$ 50,00 em centavos
    chave: 'seu@email.com',
    descricao: 'Consulta psicológica',
    nomePagador: 'João Silva',
    cpfPagador: '12345678901'
  })
});

const cobranca = await response.json();
console.log('TXID:', cobranca.txid);
```

### Exemplo de Consulta de Pix Recebidos:
```typescript
const response = await fetch('/api/pix/recebidos?inicio=2024-01-01T00:00:00Z&fim=2024-01-31T23:59:59Z', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const pixRecebidos = await response.json();
console.log('Total de Pix:', pixRecebidos.total);
```

## 📋 Checklist de Implementação

### ✅ Backend:
- [x] Serviço de integração com API Efí
- [x] Controller com endpoints REST
- [x] Módulo organizado
- [x] DTOs com validação
- [x] Tratamento de erros
- [x] Logs e monitoramento
- [x] Testes de integração

### 🔄 Próximos Passos:
- [ ] Integração com módulo de pagamentos existente
- [ ] Webhooks para notificações automáticas
- [ ] Dashboard de transações Pix
- [ ] Relatórios financeiros integrados
- [ ] Testes unitários e e2e

## 🆘 Suporte e Troubleshooting

### Problemas Comuns:

#### 1. Erro de Certificado
```
Error: Certificado não encontrado
```
**Solução**: Verifique se o certificado está no caminho correto e se a senha está correta.

#### 2. Erro de Autenticação
```
Error: Falha na autenticação com a Efí
```
**Solução**: Verifique Client ID, Secret e se os escopos estão habilitados.

#### 3. Erro de API
```
Error: Falha ao criar cobrança Pix
```
**Solução**: Verifique se a API Pix está habilitada na aplicação Efí.

### Logs e Debug:
- Todos os erros são logados com detalhes
- Use `EFI_PIX_DEBUG=true` para logs mais detalhados
- Verifique os logs do NestJS para troubleshooting

## 📚 Recursos Adicionais

- [Documentação Oficial da Efí](https://dev.efipay.com.br/docs/api-pix/credenciais)
- [Guia de Segurança PIX](https://www.bcb.gov.br/novopix)
- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)

## 🤝 Contribuição

Para contribuir com melhorias na integração:

1. Crie uma branch para sua feature
2. Implemente as mudanças seguindo os padrões existentes
3. Adicione testes para novas funcionalidades
4. Atualize a documentação
5. Abra um Pull Request

---

**Desenvolvido para ProntuPsi** - Sistema de Gestão para Psicólogos
