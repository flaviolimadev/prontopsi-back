# 🔐 Configuração do Certificado Efí

## ❌ Problema Atual
O backend está funcionando, mas a API da Efí está offline porque o certificado `.p12` não foi encontrado.

## ✅ Solução

### 1. Obter o Certificado
- Acesse sua conta Efí: [https://www.efipay.com.br](https://www.efipay.com.br)
- Vá para **API** → **Minhas Aplicações**
- Selecione sua aplicação
- Clique em **Gerar Certificado**
- **IMPORTANTE**: Faça o download imediatamente (não será possível depois)

### 2. Colocar o Certificado
- Coloque o arquivo `.p12` na pasta `certs/` do backend
- O caminho deve ser: `backEnd/backprontupsi/certs/seu_certificado.p12`

### 3. Configurar Variáveis de Ambiente
Crie um arquivo `.env` na pasta `backEnd/backprontupsi/` com:

```env
# API Efí Pix
EFI_CLIENT_ID=seu_client_id_aqui
EFI_CLIENT_SECRET=seu_client_secret_aqui
EFI_CERT_PATH=./certs/seu_certificado.p12
EFI_CERT_PASSPHRASE=sua_senha_do_certificado
EFI_SANDBOX=true
EFI_PIX_KEY=prontupsi@gerencianet.com.br
```

### 4. Reiniciar o Backend
```bash
# Parar o backend atual (Ctrl+C)
# Recompilar
npm run build

# Iniciar novamente
npm start
```

## 🔍 Verificar Funcionamento

### Testar Status da API
```bash
curl http://localhost:3000/api/pix/status-publico
```

**Resposta Esperada:**
```json
{
  "status": "online",
  "message": "SDK Gerencianet funcionando perfeitamente!",
  "details": {
    "sdkVersion": "1.2.25",
    "integrationType": "sdk-oficial-gerencianet"
  }
}
```

### Testar Geração de Pix
```bash
curl -X POST http://localhost:3000/api/pix/teste-publico \
  -H "Content-Type: application/json" \
  -d '{"valor": 100, "descricao": "Teste"}'
```

## 🚨 Problemas Comuns

### 1. Certificado não encontrado
```
❌ Certificado não encontrado em: ./certs/seu_certificado.p12
```
**Solução**: Verifique se o arquivo está na pasta correta

### 2. Senha incorreta
```
❌ Falha na autenticação com a Efí
```
**Solução**: Verifique se `EFI_CERT_PASSPHRASE` está correto

### 3. Credenciais inválidas
```
❌ Client ID ou Secret inválidos
```
**Solução**: Verifique se `EFI_CLIENT_ID` e `EFI_CLIENT_SECRET` estão corretos

## 📁 Estrutura de Pastas
```
backEnd/backprontupsi/
├── certs/
│   └── seu_certificado.p12    # ← COLOCAR AQUI
├── src/
│   └── pagamentos/
│       └── efi-pix.service.ts
└── .env                        # ← CRIAR AQUI
```

## 🎯 Próximos Passos
1. ✅ Obter certificado da Efí
2. ✅ Colocar na pasta `certs/`
3. ✅ Criar arquivo `.env`
4. ✅ Reiniciar backend
5. ✅ Testar API

## 📞 Suporte
- **Efí**: suporte@efipay.com.br
- **Documentação**: [https://dev.efipay.com.br](https://dev.efipay.com.br)
