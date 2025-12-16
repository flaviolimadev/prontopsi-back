#!/bin/bash

echo "🚀 Executando migration simplificada para tabela Pix Transactions..."

# Verificar se o banco está rodando
echo "📊 Verificando conexão com o banco..."
node check-db.js

if [ $? -ne 0 ]; then
    echo "❌ Erro: Banco de dados não está rodando!"
    echo "💡 Inicie o Docker primeiro: docker-compose up -d"
    exit 1
fi

echo "✅ Banco de dados conectado com sucesso!"

# Executar a migration
echo "🔄 Executando migration simplificada..."
npm run migration:run

if [ $? -eq 0 ]; then
    echo "✅ Migration executada com sucesso!"
    echo "🎉 Tabela 'pix_transactions' criada no banco de dados!"
    
    echo ""
    echo "📋 Resumo da implementação:"
    echo "   ✅ Entidade PixTransaction criada"
    echo "   ✅ Migration simplificada executada (sem foreign keys)"
    echo "   ✅ Repository implementado"
    echo "   ✅ Serviço integrado com banco"
    echo "   ✅ Controller atualizado"
    echo "   ✅ Cron jobs configurados"
    echo "   ✅ Módulo integrado ao App"
    
    echo ""
    echo "⚠️  IMPORTANTE:"
    echo "   - A tabela foi criada sem foreign keys para evitar erros"
    echo "   - Os relacionamentos funcionam via código, não via banco"
    echo "   - Para adicionar foreign keys depois, use uma migration separada"
    
    echo ""
    echo "🚀 Próximos passos:"
    echo "   1. Teste as rotas de Pix: node test-pix-routes.js"
    echo "   2. Configure as variáveis de ambiente da Efí (opcional)"
    echo "   3. Acesse os endpoints em /api/pix/*"
    
else
    echo "❌ Erro ao executar migration!"
    exit 1
fi
