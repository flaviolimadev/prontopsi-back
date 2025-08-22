require('dotenv').config();
const { Client } = require('pg');

async function checkUsersTable() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  
  try {
    await client.connect();
    console.log('🔍 Verificando estrutura da tabela users...\n');
    
    // Verificar colunas da tabela users
    const columnsResult = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Colunas da tabela users:');
    columnsResult.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type} ${row.is_nullable === 'YES' ? '(nullable)' : '(not null)'}`);
    });
    
    console.log('\n🔍 Verificando se a coluna id é UUID...');
    const idColumn = columnsResult.rows.find(col => col.column_name === 'id');
    if (idColumn) {
      console.log(`  ✅ Coluna 'id' encontrada: ${idColumn.data_type}`);
    } else {
      console.log('  ❌ Coluna "id" não encontrada!');
    }
    
    // Verificar se a tabela pix_transactions já existe
    const pixTableResult = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'pix_transactions'
      ) as exists
    `);
    
    console.log('\n🔍 Verificando tabela pix_transactions...');
    if (pixTableResult.rows[0].exists) {
      console.log('  ✅ Tabela pix_transactions já existe');
      
      // Verificar estrutura da tabela pix_transactions
      const pixColumnsResult = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'pix_transactions' 
        ORDER BY ordinal_position
      `);
      
      console.log('\n📋 Colunas da tabela pix_transactions:');
      pixColumnsResult.rows.forEach(row => {
        console.log(`  ${row.column_name}: ${row.data_type} ${row.is_nullable === 'YES' ? '(nullable)' : '(not null)'}`);
      });
    } else {
      console.log('  ❌ Tabela pix_transactions não existe');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await client.end();
  }
}

checkUsersTable();
