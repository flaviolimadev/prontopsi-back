import EfiPay from 'sdk-node-apis-efi';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração da SDK
const options = {
  sandbox: true, // true = HOMOLOGAÇÃO, false = PRODUÇÃO
  client_id: 'Client_Id_044f589f18fbec7a94408358c47859110a6118e5',
  client_secret: 'Client_Secret_28ede6f9c7658d72eb620496916ee8dca07cde34',
  certificate: path.resolve('./certs/producao-811773-prontupsi.p12'),
};

console.log('🔧 Configuração da SDK:');
console.log('📁 Certificado:', options.certificate);
console.log('🔑 Client ID:', options.client_id);
console.log('🔒 Client Secret:', options.client_secret);
console.log('🧪 Sandbox:', options.sandbox);
console.log('');

// Verificar se o certificado existe
if (!fs.existsSync(options.certificate)) {
  console.error('❌ Certificado não encontrado em:', options.certificate);
  process.exit(1);
}

console.log('✅ Certificado encontrado!');
console.log('📊 Tamanho:', fs.statSync(options.certificate).size, 'bytes');
console.log('');

try {
  // Inicializar SDK
  console.log('🚀 Inicializando SDK Gerencianet...');
  const efipay = new EfiPay(options);
  console.log('✅ SDK inicializada com sucesso!');
  console.log('');

  // Testar conexão
  console.log('🔍 Testando conexão com a API...');
  
  // Testar método simples
  const response = await efipay.pixGetCharges({});
  console.log('✅ Conexão testada com sucesso!');
  console.log('📊 Resposta:', JSON.stringify(response, null, 2));
  
} catch (error) {
  console.error('❌ Erro ao testar SDK:', error.message);
  
  if (error.code) {
    console.error('🔍 Código de erro:', error.code);
  }
  
  if (error.response) {
    console.error('📊 Resposta da API:', error.response.data);
  }
  
  console.error('📋 Stack trace:', error.stack);
}
