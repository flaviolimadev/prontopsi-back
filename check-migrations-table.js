const { Client } = require('pg');
require('dotenv').config();

async function checkMigrationsTable() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'prontopsi_db',
  });

  try {
    console.log('🔍 Verificando estrutura da tabela migrations...\n');
    
    await client.connect();
    console.log('✅ Conectado ao banco de dados');

    // Verificar estrutura da tabela migrations
    const columns = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'migrations'
      ORDER BY ordinal_position;
    `);

    console.log('📋 Estrutura da tabela migrations:');
    columns.rows.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(not null)'}`);
    });

    // Verificar registros existentes
    const migrations = await client.query(`
      SELECT * FROM migrations ORDER BY timestamp;
    `);

    console.log(`\n📊 Total de migrations: ${migrations.rows.length}`);
    if (migrations.rows.length > 0) {
      console.log('📋 Últimas migrations:');
      migrations.rows.slice(-5).forEach(migration => {
        console.log(`   ${migration.timestamp}: ${migration.name}`);
      });
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await client.end();
  }
}

checkMigrationsTable();
