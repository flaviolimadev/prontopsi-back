const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
let envContent = '';

// Ler o arquivo .env existente se houver
if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
}

// Criar ou atualizar as variáveis de ambiente
const updates = {
  'DB_HOST': 'localhost',
  'DB_PORT': '5432',
  'DB_USER': 'joaopedrosantos',
  'DB_PASSWORD': '',
  'DB_NAME': 'prontopsi_db'
};

Object.entries(updates).forEach(([key, value]) => {
  const regex = new RegExp(`^${key}=.*$`, 'm');
  if (regex.test(envContent)) {
    envContent = envContent.replace(regex, `${key}=${value}`);
  } else {
    envContent += `\n${key}=${value}`;
  }
});

// Salvar o arquivo .env
fs.writeFileSync(envPath, envContent.trim() + '\n');

console.log('✅ Arquivo .env atualizado com sucesso!');
console.log('\nConfigurações do banco:');
console.log('  DB_HOST=localhost');
console.log('  DB_PORT=5432');
console.log('  DB_USER=joaopedrosantos');
console.log('  DB_PASSWORD=(em branco)');
console.log('  DB_NAME=prontopsi_db');

