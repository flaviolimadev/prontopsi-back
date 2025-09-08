const { Client } = require('pg');
require('dotenv').config();

async function makeUserAdmin() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: false, // Desabilitar SSL para conexão local
  });

  try {
    await client.connect();
    console.log('Conectado ao banco de dados');

    // Buscar o primeiro usuário
    const result = await client.query('SELECT id, nome, sobrenome, email, is_admin FROM users LIMIT 1');
    
    if (result.rows.length === 0) {
      console.log('Nenhum usuário encontrado no banco de dados');
      return;
    }

    const user = result.rows[0];
    console.log('Usuário encontrado:', {
      id: user.id,
      nome: user.nome,
      sobrenome: user.sobrenome,
      email: user.email,
      is_admin: user.is_admin
    });

    // Atualizar para admin se não for
    if (!user.is_admin) {
      await client.query('UPDATE users SET is_admin = true WHERE id = $1', [user.id]);
      console.log('✅ Usuário atualizado para administrador');
    } else {
      console.log('✅ Usuário já é administrador');
    }

    // Verificar se a atualização funcionou
    const updatedResult = await client.query('SELECT id, nome, sobrenome, email, is_admin FROM users WHERE id = $1', [user.id]);
    console.log('Usuário após atualização:', updatedResult.rows[0]);

  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await client.end();
  }
}

makeUserAdmin();

