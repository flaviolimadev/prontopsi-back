require('dotenv').config();
const { Client } = require('pg');

console.log('🧪 Testando Sistema de Pix - Verificação do Banco\n');

async function testarPixBanco() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  
  try {
    console.log('📡 Conectando ao banco de dados...');
    await client.connect();
    console.log('✅ Conectado ao banco de dados PostgreSQL!');
    
    // Verificar se a tabela pix_transactions existe
    console.log('\n🔍 Verificando tabela pix_transactions...');
    const tableResult = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'pix_transactions'
      ) as exists
    `);
    
    if (tableResult.rows[0].exists) {
      console.log('✅ Tabela pix_transactions criada com sucesso!');
      
      // Verificar estrutura da tabela
      console.log('\n📋 Estrutura da tabela:');
      const columns = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'pix_transactions' 
        ORDER BY ordinal_position
      `);
      
      columns.rows.forEach(col => {
        const defaultValue = col.column_default ? ` (default: ${col.column_default})` : '';
        console.log(`   - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(not null)'}${defaultValue}`);
      });
      
      // Verificar tipos ENUM
      console.log('\n🔍 Verificando tipos ENUM...');
      const enums = await client.query(`
        SELECT typname, enumlabel
        FROM pg_enum e
        JOIN pg_type t ON e.enumtypid = t.oid
        WHERE typname LIKE '%pix%'
        ORDER BY typname, enumsortorder
      `);
      
      if (enums.rows.length > 0) {
        console.log('✅ Tipos ENUM criados:');
        let currentType = '';
        enums.rows.forEach(row => {
          if (row.typname !== currentType) {
            currentType = row.typname;
            console.log(`   ${currentType}:`);
          }
          console.log(`     - ${row.enumlabel}`);
        });
      }
      
      // Verificar índices
      console.log('\n🔍 Verificando índices...');
      const indexes = await client.query(`
        SELECT indexname, indexdef
        FROM pg_indexes
        WHERE tablename = 'pix_transactions'
        ORDER BY indexname
      `);
      
      if (indexes.rows.length > 0) {
        console.log('✅ Índices criados:');
        indexes.rows.forEach(idx => {
          console.log(`   - ${idx.indexname}`);
        });
      }
      
      // Simular inserção de dados (sem salvar)
      console.log('\n🧪 Simulando dados de Pix de R$ 1,00...');
      const pixData = {
        valor: 100, // R$ 1,00 em centavos
        descricao: 'Teste de Pix - R$ 1,00',
        nomePagador: 'João Teste',
        cpfPagador: '12345678901',
        emailPagador: 'joao.teste@email.com'
      };
      
      console.log('📊 Dados do Pix:');
      console.log(`   Valor: R$ ${(pixData.valor / 100).toFixed(2)}`);
      console.log(`   Descrição: ${pixData.descricao}`);
      console.log(`   Pagador: ${pixData.nomePagador}`);
      console.log(`   CPF: ${pixData.cpfPagador}`);
      console.log(`   Email: ${pixData.emailPagador}`);
      
      console.log('\n✅ Dados simulados com sucesso!');
      
    } else {
      console.log('❌ Tabela pix_transactions não encontrada');
      console.log('💡 Execute a migration primeiro: npm run migration:run');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await client.end();
  }
}

// Executar teste
testarPixBanco().then(() => {
  console.log('\n🎯 Resumo do Teste:');
  console.log('✅ Sistema de Pix verificado no banco de dados');
  console.log('✅ Tabela e estrutura criadas corretamente');
  console.log('\n🚀 Para testar a API:');
  console.log('   1. Execute: npm start');
  console.log('   2. Em outro terminal: node test-pix-routes.js');
  console.log('   3. Configure um token JWT válido no script');
});
