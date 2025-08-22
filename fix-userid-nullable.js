const { Client } = require('pg');
require('dotenv').config();

async function fixUserIdNullable() {
  const client = new Client({
    host: process.env.DB_HOST || '108.181.224.233',
    port: process.env.DB_PORT || 5449,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'GpjOgm8zbE1BfktTh1Q6YG2zSM6Zd9I8FxXxhiZ5p1kL0jQF3xGeUcsEXS8mP7he',
    database: process.env.DB_NAME || 'postgres',
    ssl: false
  });

  try {
    console.log('🔧 Conectando ao banco para corrigir coluna userId...');
    await client.connect();
    console.log('✅ Conectado ao banco de dados');

    // Verificar status atual da coluna
    const columnInfo = await client.query(`
      SELECT is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'pix_transactions' 
      AND column_name = 'userId'
    `);

    if (columnInfo.rows.length > 0) {
      const isNullable = columnInfo.rows[0].is_nullable;
      console.log(`📋 Status atual da coluna userId: ${isNullable === 'YES' ? 'NULLABLE' : 'NOT NULL'}`);

      if (isNullable === 'NO') {
        console.log('🔧 Alterando coluna userId para nullable...');
        
        // Alterar coluna para permitir NULL
        await client.query(`
          ALTER TABLE "pix_transactions" 
          ALTER COLUMN "userId" DROP NOT NULL
        `);
        
        console.log('✅ Coluna userId alterada para nullable com sucesso!');
        
        // Verificar se a alteração foi aplicada
        const newColumnInfo = await client.query(`
          SELECT is_nullable 
          FROM information_schema.columns 
          WHERE table_name = 'pix_transactions' 
          AND column_name = 'userId'
        `);
        
        const newIsNullable = newColumnInfo.rows[0].is_nullable;
        console.log(`📋 Novo status da coluna userId: ${newIsNullable === 'YES' ? 'NULLABLE' : 'NOT NULL'}`);
        
      } else {
        console.log('ℹ️ Coluna userId já é nullable, nada a fazer');
      }
    } else {
      console.log('❌ Coluna userId não encontrada na tabela');
    }

  } catch (error) {
    console.error('❌ Erro ao corrigir coluna:', error.message);
  } finally {
    await client.end();
  }
}

fixUserIdNullable();
