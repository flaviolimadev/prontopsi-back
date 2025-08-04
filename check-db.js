const { Client } = require('pg');
require('dotenv').config();

async function checkDatabase() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'prontopsi_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
  });

  try {
    console.log('🔍 Verificando conexão com o banco de dados...');
    await client.connect();
    console.log('✅ Conexão com PostgreSQL estabelecida!');

    // Verificar se a tabela users existe
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'users'
    `);

    if (result.rows.length > 0) {
      console.log('✅ Tabela "users" encontrada!');
      
      // Verificar se há dados na tabela
      const countResult = await client.query('SELECT COUNT(*) FROM users');
      console.log(`📊 Total de usuários na tabela: ${countResult.rows[0].count}`);
    } else {
      console.log('❌ Tabela "users" não encontrada!');
      console.log('💡 Execute as migrações: npm run migration:run');
    }

  } catch (error) {
    console.error('❌ Erro ao conectar com o banco de dados:', error.message);
    console.log('\n🔧 Possíveis soluções:');
    console.log('1. Verifique se o PostgreSQL está rodando');
    console.log('2. Verifique as credenciais no arquivo .env');
    console.log('3. Verifique se o banco "prontopsi_db" existe');
    console.log('4. Execute: createdb prontopsi_db (se necessário)');
  } finally {
    await client.end();
  }
}

checkDatabase(); 