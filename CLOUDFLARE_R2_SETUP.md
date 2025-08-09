# Configuração do Cloudflare R2

Este documento explica como configurar o Cloudflare R2 para armazenamento de arquivos no ProntuPsi.

## 1. Criar conta no Cloudflare

1. Acesse [cloudflare.com](https://cloudflare.com)
2. Crie uma conta ou faça login
3. Vá para o dashboard

## 2. Configurar R2 Storage

1. No dashboard do Cloudflare, vá para "R2 Object Storage"
2. Clique em "Create bucket"
3. Digite um nome para o bucket (ex: `prontupsi-uploads`)
4. Escolha a região mais próxima
5. Clique em "Create bucket"

## 3. Configurar API Tokens

1. No dashboard do Cloudflare, vá para "My Profile" > "API Tokens"
2. Clique em "Create Token"
3. Use o template "Custom token"
4. Configure as permissões:
   - **Account Resources**: Include > All accounts
   - **Zone Resources**: Include > All zones
   - **Permissions**:
     - Account > Cloudflare R2 > Edit
     - Zone > Cloudflare R2 > Edit
5. Clique em "Continue to summary" e depois "Create Token"
6. **IMPORTANTE**: Copie o token gerado, você não poderá vê-lo novamente

## 4. Obter Account ID

1. No dashboard do Cloudflare, vá para "My Profile" > "Account Home"
2. Copie o "Account ID" que aparece no lado direito

## 5. Configurar variáveis de ambiente

Adicione as seguintes variáveis ao seu arquivo `.env`:

```env
# Cloudflare R2
CLOUDFLARE_ACCOUNT_ID=seu_account_id_aqui
CLOUDFLARE_ACCESS_KEY_ID=seu_access_key_id_aqui
CLOUDFLARE_SECRET_ACCESS_KEY=seu_secret_access_key_aqui
CLOUDFLARE_R2_BUCKET_NAME=nome_do_seu_bucket_aqui
```

## 6. Configurar CORS (Opcional)

Se você quiser acessar os arquivos diretamente do frontend, configure o CORS no bucket:

1. No dashboard do R2, vá para seu bucket
2. Clique em "Settings" > "CORS"
3. Adicione a seguinte configuração:

```json
[
  {
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3000
  }
]
```

## 7. Testar a configuração

Após configurar todas as variáveis, reinicie o servidor e teste o upload de um avatar.

## Estrutura de pastas no R2

O sistema organiza os arquivos da seguinte forma:

```
bucket-name/
├── avatars/
│   ├── user-id-timestamp.jpg
│   └── user-id-timestamp.png
├── documents/
│   └── ...
└── uploads/
    └── ...
```

## URLs dos arquivos

Os arquivos ficam disponíveis em:
- `https://bucket-name.r2.dev/avatars/filename.jpg`

## Segurança

- Todos os arquivos são públicos (ACL: public-read)
- Os nomes dos arquivos são únicos (UUID + timestamp)
- Validação de tipos de arquivo no backend
- Limite de tamanho: 5MB por arquivo

## Troubleshooting

### Erro: "Configurações do Cloudflare R2 não encontradas"
- Verifique se todas as variáveis de ambiente estão configuradas
- Reinicie o servidor após adicionar as variáveis

### Erro: "Access Denied"
- Verifique se as credenciais estão corretas
- Verifique se o bucket existe e está acessível
- Verifique se o Account ID está correto

### Erro: "Bucket not found"
- Verifique se o nome do bucket está correto
- Verifique se o bucket foi criado na conta correta
