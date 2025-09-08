const { Client } = require('pg');
require('dotenv').config();

async function makeFlavioAdmin() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: false,
  });

  try {
    await client.connect();
    console.log('Conectado ao banco de dados');

    // Buscar usuário Flávio
    const result = await client.query('SELECT id, nome, sobrenome, email, is_admin, status FROM users WHERE email = $1', ['flavio.pessoalbr@gmail.com']);
    
    if (result.rows.length === 0) {
      console.log('❌ Usuário Flávio não encontrado');
      return;
    }

    const user = result.rows[0];
    console.log('Usuário Flávio encontrado:', {
      id: user.id,
      nome: user.nome,
      sobrenome: user.sobrenome,
      email: user.email,
      is_admin: user.is_admin,
      status: user.status
    });

    // Tornar admin se não for
    if (!user.is_admin) {
      await client.query('UPDATE users SET is_admin = true WHERE id = $1', [user.id]);
      console.log('✅ Usuário Flávio atualizado para administrador');
    } else {
      console.log('✅ Usuário Flávio já é administrador');
    }

    // Verificar se a atualização funcionou
    const updatedResult = await client.query('SELECT id, nome, sobrenome, email, is_admin, status FROM users WHERE id = $1', [user.id]);
    console.log('Usuário após atualização:', updatedResult.rows[0]);

  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await client.end();
  }
}

makeFlavioAdmin();

