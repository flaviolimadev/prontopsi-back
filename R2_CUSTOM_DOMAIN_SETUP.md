# 🔧 Configuração de Custom Domain no Cloudflare R2

## 📋 Passos para Configurar

### 1. **Acesse o Dashboard do Cloudflare**
- Vá para [dash.cloudflare.com](https://dash.cloudflare.com)
- Selecione sua conta

### 2. **Configure o R2**
- Vá para **R2 Object Storage**
- Selecione seu bucket `prontupsi`

### 3. **Adicione Custom Domain**
- Clique em **Settings** (Configurações)
- Procure por **Custom Domains**
- Clique em **Add Custom Domain**
- Digite: `files.prontupsi.com` (ou seu domínio)
- Clique em **Add Custom Domain**

### 4. **Configure DNS**
- O Cloudflare vai criar automaticamente um registro CNAME
- Aguarde a propagação (pode levar alguns minutos)

### 5. **Atualize o Backend**
Após configurar, atualize o `.env`:

```env
CLOUDFLARE_R2_CUSTOM_DOMAIN=https://files.prontupsi.com
```

### 6. **Atualize o CloudflareR2Service**
Modifique o método `uploadFile` para usar a custom domain:

```typescript
// Em vez de:
const url = `https://${this.bucketName}.r2.dev/${key}`;

// Use:
const customDomain = this.configService.get<string>('CLOUDFLARE_R2_CUSTOM_DOMAIN');
const url = customDomain ? `${customDomain}/${key}` : `https://${this.bucketName}.r2.dev/${key}`;
```

## ✅ **Vantagens**
- URLs públicas e acessíveis
- Melhor performance
- Controle total sobre o domínio
- HTTPS automático

## ⚠️ **Alternativa Temporária**
Se não quiser configurar custom domain agora, podemos usar URLs assinadas temporárias.








