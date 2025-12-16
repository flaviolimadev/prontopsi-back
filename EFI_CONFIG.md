# Configuração da API Pix Efí

Este documento explica como configurar as credenciais necessárias para integração com a API Pix da Efí.

## Variáveis de Ambiente

Adicione as seguintes variáveis ao seu arquivo `.env`:

```env
# API Efí Pix
EFI_API_URL=https://pix.api.efipay.com.br
EFI_CLIENT_ID=seu_client_id_aqui
EFI_CLIENT_SECRET=seu_client_secret_aqui
EFI_CERT_PATH=./certs/certificado.p12
EFI_CERT_PASSPHRASE=sua_senha_do_certificado
```

## Como Obter as Credenciais

### 1. Criar Conta na Efí
- Acesse [https://www.efipay.com.br](https://www.efipay.com.br)
- Crie uma conta digital
- Complete a verificação de identidade

### 2. Configurar API
- Acesse sua conta Efí
- Vá para o menu "API" na parte inferior esquerda
- Clique em "Criar aplicação"
- Habilite a API Pix
- Selecione os escopos necessários:
  - `cob.write` - Criar cobranças
  - `cob.read` - Consultar cobranças
  - `pix.read` - Consultar Pix recebidos
  - `pix.send` - Enviar Pix
  - `gn.balance.read` - Consultar saldo

### 3. Gerar Certificado
- Na configuração da aplicação, gere um certificado P12
- **IMPORTANTE**: Faça o download imediatamente, não será possível baixar depois
- Armazene o certificado em local seguro
- Configure o caminho no `EFI_CERT_PATH`

### 4. Obter Credenciais
- Anote o `Client ID` e `Client Secret` da aplicação
- Configure nas variáveis de ambiente

## Estrutura de Pastas

```
backprontupsi/
├── certs/
│   └── certificado.p12    # Certificado da Efí
├── src/
│   └── pagamentos/
│       ├── efi-pix.service.ts
│       ├── efi-pix.controller.ts
│       └── efi-pix.module.ts
└── .env                   # Variáveis de ambiente
```

## Endpoints Disponíveis

### Cobranças
- `POST /api/pix/cobranca` - Criar cobrança Pix
- `GET /api/pix/cobranca/:txid` - Consultar cobrança
- `GET /api/pix/qrcode/:txid` - Gerar QR Code

### Pix Recebidos
- `GET /api/pix/recebidos` - Consultar Pix recebidos

### Envio e Devolução
- `POST /api/pix/enviar` - Enviar Pix
- `PUT /api/pix/devolver/:e2eId` - Devolver Pix

### Status
- `GET /api/pix/status` - Verificar status da API

## Exemplo de Uso

### Criar Cobrança
```bash
curl -X POST http://localhost:3000/api/pix/cobranca \
  -H "Authorization: Bearer SEU_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "valor": 5000,
    "chave": "seu@email.com",
    "descricao": "Consulta psicológica",
    "nomePagador": "João Silva",
    "cpfPagador": "12345678901"
  }'
```

### Consultar Pix Recebidos
```bash
curl -X GET "http://localhost:3000/api/pix/recebidos?inicio=2024-01-01T00:00:00Z&fim=2024-01-31T23:59:59Z" \
  -H "Authorization: Bearer SEU_JWT_TOKEN"
```

## Segurança

- Nunca commite o certificado P12 no repositório
- Use variáveis de ambiente para credenciais
- Implemente autenticação de dois fatores
- Monitore logs de acesso à API
- Configure webhooks para notificações de pagamento

## Troubleshooting

### Erro de Certificado
- Verifique se o caminho do certificado está correto
- Confirme se a senha do certificado está correta
- Certifique-se de que o certificado não expirou

### Erro de Autenticação
- Verifique se o Client ID e Secret estão corretos
- Confirme se os escopos estão habilitados na aplicação
- Verifique se a conta Efí está ativa

### Erro de API
- Verifique se está usando a URL correta (homologação vs produção)
- Confirme se a API Pix está habilitada na aplicação
- Verifique os logs de erro da Efí

## Suporte

Para suporte técnico da Efí:
- Email: suporte@efipay.com.br
- Telefone: (11) 2394 2208
- Documentação: [https://dev.efipay.com.br](https://dev.efipay.com.br)
