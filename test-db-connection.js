const { Client } = require('pg');
require('dotenv').config();

async function testDatabaseConnection() {
  const client = new Client({
    host: process.env.DB_HOST || '108.181.224.233',
    port: process.env.DB_PORT || 5449,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'GpjOgm8zbE1BfktTh1Q6YG2zSM6Zd9I8FxXxhiZ5p1kL0jQF3xGeUcsEXS8mP7he',
    database: process.env.DB_NAME || 'postgres',
    ssl: false // Para desenvolvimento
  });

  try {
    console.log('🔌 Testando conexão com o banco de dados...\n');
    console.log(`📡 Host: ${process.env.DB_HOST}`);
    console.log(`🔌 Porta: ${process.env.DB_PORT}`);
    console.log(`🗄️  Banco: ${process.env.DB_NAME}`);
    console.log(`👤 Usuário: ${process.env.DB_USER}`);
    
    await client.connect();
    console.log('✅ Conectado ao banco de dados com sucesso!');

    // Verificar se a tabela pix_transactions existe
    console.log('\n🔍 Verificando tabela pix_transactions...');
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'pix_transactions'
      );
    `);

    if (!tableExists.rows[0].exists) {
      console.log('❌ Tabela pix_transactions NÃO existe!');
      return;
    }

    console.log('✅ Tabela pix_transactions existe');

    // Verificar estrutura da tabela
    const columns = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'pix_transactions'
      ORDER BY ordinal_position;
    `);

    console.log('\n📋 Estrutura da tabela:');
    columns.rows.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(not null)'}`);
    });

    // Verificar se a coluna qrcodeImage existe
    const hasQrcodeImage = columns.rows.some(col => col.column_name === 'qrcodeImage');
    
    if (!hasQrcodeImage) {
      console.log('\n❌ Coluna qrcodeImage NÃO existe!');
      console.log('💡 Isso explica o erro 500 que você está recebendo');
      console.log('🔧 Soluções:');
      console.log('   1. Executar a migration: npm run migration:run');
      console.log('   2. Ou criar a coluna manualmente no banco');
    } else {
      console.log('\n✅ Coluna qrcodeImage existe');
    }

    // Verificar se há dados na tabela
    const countResult = await client.query(`
      SELECT COUNT(*) as total FROM pix_transactions;
    `);
    
    console.log(`\n📊 Total de registros na tabela: ${countResult.rows[0].total}`);

  } catch (error) {
    console.error('❌ Erro na conexão:', error.message);
  } finally {
    await client.end();
  }
}

testDatabaseConnection();
