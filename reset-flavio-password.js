const bcrypt = require('bcrypt');
const { Client } = require('pg');
require('dotenv').config();

async function resetFlavioPassword() {
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

    // Nova senha
    const newPassword = '123456';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Atualizar senha do Flávio
    await client.query('UPDATE users SET password = $1 WHERE email = $2', [hashedPassword, 'flavio.pessoalbr@gmail.com']);
    
    console.log('✅ Senha do Flávio atualizada para:', newPassword);

    // Verificar se a atualização funcionou
    const result = await client.query('SELECT id, nome, sobrenome, email, is_admin, status FROM users WHERE email = $1', ['flavio.pessoalbr@gmail.com']);
    console.log('Usuário após atualização:', result.rows[0]);

  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await client.end();
  }
}

resetFlavioPassword();

