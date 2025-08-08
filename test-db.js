const { Client } = require('pg');
require('dotenv').config();

async function testDatabase() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'prontupsi',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  });

  try {
    await client.connect();
    console.log('✅ Conectado ao banco de dados');

    // Verificar se as tabelas existem
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('cadastro_links', 'cadastro_submissions')
      ORDER BY table_name;
    `;
    
    const tablesResult = await client.query(tablesQuery);
    console.log('📋 Tabelas encontradas:', tablesResult.rows.map(row => row.table_name));

    // Verificar dados nas tabelas
    if (tablesResult.rows.some(row => row.table_name === 'cadastro_links')) {
      const linksQuery = 'SELECT COUNT(*) as count FROM cadastro_links';
      const linksResult = await client.query(linksQuery);
      console.log('🔗 Links cadastrados:', linksResult.rows[0].count);
      
      // Verificar o token específico
      const tokenQuery = "SELECT * FROM cadastro_links WHERE token = 'd8001eeda5b8f1a1abea73af60c9e154ba9cc41e70dc9cc11febf2c51bb82992'";
      const tokenResult = await client.query(tokenQuery);
      console.log('🔍 Token encontrado:', tokenResult.rows.length > 0 ? 'Sim' : 'Não');
      if (tokenResult.rows.length > 0) {
        console.log('📋 Dados do token:', tokenResult.rows[0]);
      }
    }

    if (tablesResult.rows.some(row => row.table_name === 'cadastro_submissions')) {
      const submissionsQuery = 'SELECT COUNT(*) as count FROM cadastro_submissions';
      const submissionsResult = await client.query(submissionsQuery);
      console.log('📝 Submissões:', submissionsResult.rows[0].count);
    }

    // Verificar usuários
    const usersQuery = 'SELECT COUNT(*) as count FROM users';
    const usersResult = await client.query(usersQuery);
    console.log('👥 Usuários:', usersResult.rows[0].count);

  } catch (error) {
    console.error('❌ Erro ao conectar ao banco:', error.message);
  } finally {
    await client.end();
  }
}

testDatabase();
