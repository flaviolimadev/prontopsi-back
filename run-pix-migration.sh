#!/bin/bash

echo "🚀 Executando migration para tabela Pix Transactions..."

# Verificar se o banco está rodando
echo "📊 Verificando conexão com o banco..."
node check-db.js

if [ $? -ne 0 ]; then
    echo "❌ Erro: Banco de dados não está rodando!"
    exit 1
fi

echo "✅ Banco de dados conectado com sucesso!"

# Executar a migration
echo "🔄 Executando migration..."
npm run migration:run

if [ $? -eq 0 ]; then
    echo "✅ Migration executada com sucesso!"
    echo "🎉 Tabela 'pix_transactions' criada no banco de dados!"
    
    echo ""
    echo "📋 Resumo da implementação:"
    echo "   ✅ Entidade PixTransaction criada"
    echo "   ✅ Migration executada"
    echo "   ✅ Repository implementado"
    echo "   ✅ Serviço integrado com banco"
    echo "   ✅ Controller atualizado"
    echo "   ✅ Cron jobs configurados"
    echo "   ✅ Módulo integrado ao App"
    
    echo ""
    echo "🚀 Próximos passos:"
    echo "   1. Configure as variáveis de ambiente da Efí"
    echo "   2. Coloque o certificado P12 na pasta certs/"
    echo "   3. Teste a integração com: node test-efi-pix.js"
    echo "   4. Acesse os endpoints em /api/pix/*"
    
else
    echo "❌ Erro ao executar migration!"
    exit 1
fi
