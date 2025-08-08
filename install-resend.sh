#!/bin/bash

echo "📧 Instalando dependências do Resend.com..."

# Instalar dependências
npm install resend @types/nodemailer

echo "✅ Dependências instaladas com sucesso!"
echo ""
echo "📋 Próximos passos:"
echo "1. Configure sua API Key do Resend no arquivo .env"
echo "2. Teste os endpoints de email"
echo "3. Consulte a documentação em RESEND_SETUP.md"
echo ""
echo "🔧 Variáveis necessárias no .env:"
echo "RESEND_API_KEY=sua_api_key_aqui"
echo "RESEND_FROM_EMAIL=noreply@prontupsi.com"
echo "RESEND_REPLY_TO=suporte@prontupsi.com"
echo "FRONTEND_URL=http://localhost:8080"
