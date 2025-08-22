const { Client } = require('pg');
require('dotenv').config();

async function checkPixTable() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'prontopsi_db',
  });

  try {
    console.log('🔍 Verificando tabela pix_transactions...\n');
    
    await client.connect();
    console.log('✅ Conectado ao banco de dados');

    // Verificar se a tabela existe
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'pix_transactions'
      );
    `);

    if (!tableExists.rows[0].exists) {
      console.log('❌ Tabela pix_transactions NÃO existe!');
      console.log('💡 Execute a migration: npm run migration:run');
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

    // Verificar se a coluna qrcode_image existe
    const hasQrcodeImage = columns.rows.some(col => col.column_name === 'qrcode_image');
    
    if (!hasQrcodeImage) {
      console.log('\n❌ Coluna qrcode_image NÃO existe!');
      console.log('💡 Isso explica o erro 500 que você está recebendo');
      console.log('🔧 Soluções:');
      console.log('   1. Executar a migration: npm run migration:run');
      console.log('   2. Ou criar a coluna manualmente no banco');
    } else {
      console.log('\n✅ Coluna qrcode_image existe');
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await client.end();
  }
}

checkPixTable();
