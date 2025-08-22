const { Client } = require('pg');

const client = new Client({
  host: '108.181.224.233',
  port: 5449,
  database: 'postgres',
  user: 'postgres',
  password: 'GpjOgm8zbE1BfktTh1Q6YG2zSM6Zd9I8FxXxhiZ5p1kL0jQF3xGeUcsEXS8mP7he'
});

async function checkNotificationsTable() {
  try {
    await client.connect();
    console.log('✅ Conectado ao banco de dados');

    // Verificar estrutura da tabela
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'notifications' 
      ORDER BY ordinal_position
    `);

    console.log('\n📊 Estrutura da tabela notifications:');
    console.log('=====================================');
    
    result.rows.forEach(row => {
      console.log(`${row.column_name.padEnd(20)} | ${row.data_type.padEnd(15)} | ${row.is_nullable.padEnd(8)} | ${row.column_default || 'NULL'}`);
    });

    // Verificar se a coluna action_url existe
    const actionUrlExists = result.rows.some(row => row.column_name === 'action_url');
    
    if (actionUrlExists) {
      console.log('\n✅ Coluna action_url encontrada!');
    } else {
      console.log('\n❌ Coluna action_url NÃO encontrada!');
      
      // Tentar adicionar a coluna
      console.log('🔧 Tentando adicionar a coluna action_url...');
      try {
        await client.query(`
          ALTER TABLE notifications 
          ADD COLUMN action_url VARCHAR NULL
        `);
        console.log('✅ Coluna action_url adicionada com sucesso!');
      } catch (addError) {
        console.error('❌ Erro ao adicionar coluna:', addError.message);
      }
    }

    // Verificar dados da tabela
    const countResult = await client.query('SELECT COUNT(*) FROM notifications');
    console.log(`\n📈 Total de notificações: ${countResult.rows[0].count}`);

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await client.end();
    console.log('\n🔌 Conexão encerrada');
  }
}

checkNotificationsTable();
