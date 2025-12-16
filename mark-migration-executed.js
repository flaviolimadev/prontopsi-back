const { Client } = require('pg');
require('dotenv').config();

async function markMigrationExecuted() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'prontopsi_db',
  });

  try {
    console.log('🔧 Marcando migration como executada...\n');
    
    await client.connect();
    console.log('✅ Conectado ao banco de dados');

    // Inserir registro na tabela de migrations
    const result = await client.query(`
      INSERT INTO migrations (timestamp, name)
      VALUES ($1, $2)
      RETURNING timestamp, name;
    `, [
      20250818000000,
      'CreatePixTransactionsTableSimple20250818000000'
    ]);

    if (result.rows.length > 0) {
      console.log('✅ Migration marcada como executada:');
      console.log(`   Timestamp: ${result.rows[0].timestamp}`);
      console.log(`   Nome: ${result.rows[0].name}`);
    } else {
      console.log('ℹ️ Migration já estava marcada como executada');
    }

    console.log('\n🎯 Agora você pode executar: npm run migration:run');
    console.log('💡 A migration será pulada porque já está marcada como executada');

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await client.end();
  }
}

markMigrationExecuted();
