# Integração Cloudflare R2 - ProntuPsi

Esta documentação explica como a integração com Cloudflare R2 foi implementada no ProntuPsi para armazenamento de arquivos.

## 🚀 Funcionalidades Implementadas

### ✅ Backend
- **Serviço R2**: `CloudflareR2Service` para gerenciar uploads
- **Upload de arquivos**: Suporte a avatars e outros arquivos
- **Deleção de arquivos**: Remoção automática do R2
- **URLs assinadas**: Geração de URLs para upload direto
- **Validação**: Verificação de tipos e tamanhos de arquivo
- **Organização**: Estrutura de pastas organizada

### ✅ Frontend
- **Upload de avatar**: Interface para upload de fotos de perfil
- **Visualização**: Exibição de avatars do R2
- **Remoção**: Funcionalidade para deletar avatars
- **Progresso**: Indicador de progresso durante upload

## 📁 Estrutura de Arquivos

```
backEnd/backprontupsi/
├── src/
│   ├── services/
│   │   ├── cloudflare-r2.service.ts    # Serviço principal R2
│   │   └── cloudflare-r2.module.ts     # Módulo R2
│   └── profile/
│       ├── profile.controller.ts       # Controller com endpoints R2
│       └── profile.module.ts           # Módulo do perfil
├── CLOUDFLARE_R2_SETUP.md              # Guia de configuração
├── test-r2-connection.js               # Script de teste
└── README_R2_INTEGRATION.md            # Esta documentação
```

## 🔧 Configuração

### 1. Variáveis de Ambiente

Adicione ao arquivo `.env`:

```env
# Cloudflare R2
CLOUDFLARE_ACCOUNT_ID=seu_account_id_aqui
CLOUDFLARE_ACCESS_KEY_ID=seu_access_key_id_aqui
CLOUDFLARE_SECRET_ACCESS_KEY=seu_secret_access_key_aqui
CLOUDFLARE_R2_BUCKET_NAME=nome_do_seu_bucket_aqui
```

### 2. Testar Conexão

Execute o script de teste:

```bash
node test-r2-connection.js
```

## 📡 Endpoints da API

### Upload de Avatar
```http
POST /profile/avatar
Content-Type: multipart/form-data

FormData:
- avatar: File (imagem)
```

**Resposta:**
```json
{
  "avatar_url": "https://bucket.r2.dev/avatars/user-id-timestamp.jpg",
  "message": "Avatar atualizado com sucesso"
}
```

### Deletar Avatar
```http
DELETE /profile/avatar
```

**Resposta:**
```json
{
  "message": "Avatar removido com sucesso"
}
```

### Gerar URL Assinada
```http
POST /profile/avatar/presigned-url
Content-Type: application/json

{
  "fileName": "avatar.jpg",
  "contentType": "image/jpeg"
}
```

**Resposta:**
```json
{
  "uploadUrl": "https://...",
  "key": "avatars/uuid.jpg",
  "message": "URL de upload gerada com sucesso"
}
```

## 🛠️ Serviço R2

### Métodos Principais

```typescript
// Upload de arquivo
await cloudflareR2Service.uploadFile(file, 'avatars', customName);

// Upload de buffer
await cloudflareR2Service.uploadBuffer(buffer, originalName, mimetype, 'avatars');

// Deletar arquivo
await cloudflareR2Service.deleteFile(key);

// Gerar URL assinada
await cloudflareR2Service.generatePresignedUploadUrl(fileName, contentType);

// Verificar se URL é do R2
cloudflareR2Service.isR2Url(url);

// Extrair chave da URL
cloudflareR2Service.extractKeyFromUrl(url);
```

## 📦 Estrutura no R2

```
bucket-name/
├── avatars/
│   ├── user-id-timestamp.jpg
│   ├── user-id-timestamp.png
│   └── user-id-timestamp.webp
├── documents/
│   └── (futuros documentos)
└── uploads/
    └── (outros uploads)
```

## 🔒 Segurança

- **Validação de tipos**: Apenas imagens (jpg, jpeg, png, gif, webp)
- **Limite de tamanho**: Máximo 5MB por arquivo
- **Nomes únicos**: UUID + timestamp para evitar conflitos
- **ACL público**: Arquivos acessíveis via URL direta
- **Validação no backend**: Verificação de tipos e tamanhos

## 🎯 Casos de Uso

### 1. Upload de Avatar
1. Usuário seleciona imagem
2. Frontend envia para `/profile/avatar`
3. Backend valida arquivo
4. Upload para R2 em `avatars/user-id-timestamp.ext`
5. URL salva no banco de dados
6. Frontend atualiza interface

### 2. Remoção de Avatar
1. Usuário clica em "Remover"
2. Backend busca avatar atual
3. Se URL é do R2, deleta arquivo
4. Remove URL do banco de dados
5. Frontend atualiza interface

### 3. Upload Direto (Futuro)
1. Frontend solicita URL assinada
2. Backend gera URL com expiração
3. Frontend faz upload direto para R2
4. Backend confirma upload

## 🐛 Troubleshooting

### Erro: "Configurações do Cloudflare R2 não encontradas"
- Verifique se todas as variáveis estão no `.env`
- Reinicie o servidor após adicionar variáveis

### Erro: "Access Denied"
- Verifique credenciais do R2
- Confirme Account ID
- Verifique permissões do token

### Erro: "Bucket not found"
- Verifique nome do bucket
- Confirme se bucket foi criado

### Erro: "File too large"
- Verifique tamanho do arquivo (máx 5MB)
- Comprima imagem se necessário

## 🔄 Migração de Uploads Existentes

Para migrar uploads existentes do sistema local para o R2:

1. **Backup**: Faça backup dos arquivos em `uploads/`
2. **Script de migração**: Crie script para upload em lote
3. **Atualização de URLs**: Atualize URLs no banco de dados
4. **Teste**: Verifique se todos os avatars carregam

## 📈 Próximos Passos

### Funcionalidades Futuras
- [ ] Upload de documentos de pacientes
- [ ] Upload de prontuários
- [ ] Upload de imagens de sessões
- [ ] Compressão automática de imagens
- [ ] CDN personalizado
- [ ] Backup automático

### Melhorias Técnicas
- [ ] Cache de URLs
- [ ] Retry automático em falhas
- [ ] Métricas de uso
- [ ] Limpeza automática de arquivos órfãos

## 📞 Suporte

Para dúvidas sobre a integração R2:

1. Verifique a documentação do Cloudflare R2
2. Execute o script de teste
3. Verifique logs do servidor
4. Consulte a documentação de setup

---

**Status**: ✅ Implementado e funcionando
**Versão**: 1.0.0
**Última atualização**: Dezembro 2024








