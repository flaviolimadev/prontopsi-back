const { Client } = require('pg');
require('dotenv').config();

async function findAndMakeAdmin() {
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

    // Buscar usuário Gabriel
    const result = await client.query('SELECT id, nome, sobrenome, email, is_admin, status FROM users WHERE email = $1', ['bielsantd@hotmail.com']);
    
    if (result.rows.length === 0) {
      console.log('Usuário Gabriel não encontrado. Vou tornar o primeiro usuário admin.');
      
      // Tornar o primeiro usuário admin
      const firstUserResult = await client.query('SELECT id, nome, sobrenome, email, is_admin FROM users ORDER BY created_at ASC LIMIT 1');
      
      if (firstUserResult.rows.length > 0) {
        const user = firstUserResult.rows[0];
        console.log('Usuário encontrado:', user);
        
        await client.query('UPDATE users SET is_admin = true WHERE id = $1', [user.id]);
        console.log('✅ Usuário atualizado para administrador');
        
        // Verificar se a atualização funcionou
        const updatedResult = await client.query('SELECT id, nome, sobrenome, email, is_admin FROM users WHERE id = $1', [user.id]);
        console.log('Usuário após atualização:', updatedResult.rows[0]);
      }
    } else {
      const user = result.rows[0];
      console.log('Usuário Gabriel encontrado:', user);
      
      if (!user.is_admin) {
        await client.query('UPDATE users SET is_admin = true WHERE id = $1', [user.id]);
        console.log('✅ Usuário Gabriel atualizado para administrador');
      } else {
        console.log('✅ Usuário Gabriel já é administrador');
      }
    }

  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await client.end();
  }
}

findAndMakeAdmin();

