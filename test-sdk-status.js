const fs = require('fs');
const path = require('path');

console.log('🔍 Testando status da SDK Efí...\n');

// Verificar se o certificado existe
const certPath = './certs/certificado.p12';
const certExists = fs.existsSync(path.resolve(certPath));

console.log(`📁 Caminho do certificado: ${certPath}`);
console.log(`✅ Certificado existe: ${certExists ? 'SIM' : 'NÃO'}`);

// Verificar variáveis de ambiente
const envVars = {
  EFI_CLIENT_ID: process.env.EFI_CLIENT_ID || 'NÃO CONFIGURADO',
  EFI_CLIENT_SECRET: process.env.EFI_CLIENT_SECRET ? '***' : 'NÃO CONFIGURADO',
  EFI_CERT_PATH: process.env.EFI_CERT_PATH || './certs/certificado.p12',
  EFI_SANDBOX: process.env.EFI_SANDBOX || 'true'
};

console.log('\n🔧 Variáveis de ambiente:');
Object.entries(envVars).forEach(([key, value]) => {
  console.log(`   ${key}: ${value}`);
});

// Verificar se a SDK deve ser inicializada
const shouldInitialize = certExists && 
  envVars.EFI_CLIENT_ID !== 'NÃO CONFIGURADO' && 
  envVars.EFI_CLIENT_SECRET !== 'NÃO CONFIGURADO';

console.log(`\n🚀 SDK deve ser inicializada: ${shouldInitialize ? 'SIM' : 'NÃO'}`);

if (!shouldInitialize) {
  console.log('\n📝 Para ativar a SDK, configure:');
  console.log('   1. Coloque o certificado .p12 na pasta certs/');
  console.log('   2. Configure as variáveis de ambiente:');
  console.log('      - EFI_CLIENT_ID');
  console.log('      - EFI_CLIENT_SECRET');
  console.log('      - EFI_CERT_PATH');
} else {
  console.log('\n✅ Todas as configurações estão corretas!');
}

console.log('\n🔍 Verificando pasta certs/...');
try {
  const certsDir = fs.readdirSync('./certs');
  console.log('📁 Arquivos na pasta certs/:');
  certsDir.forEach(file => {
    console.log(`   - ${file}`);
  });
} catch (error) {
  console.log('❌ Erro ao ler pasta certs/:', error.message);
}
