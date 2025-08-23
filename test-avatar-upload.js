const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function testAvatarUpload() {
  console.log('🔍 Testando upload de avatar...\n');

  try {
    // Primeiro, fazer login para obter o token
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'ctrlserr@gmail.com',
      password: '123456'
    });

    const token = loginResponse.data.access_token;
    console.log('✅ Login realizado com sucesso');

    // Criar um arquivo de teste (1x1 pixel PNG)
    const testImagePath = path.join(__dirname, 'test-image.png');
    
    // Se o arquivo não existir, criar um PNG simples
    if (!fs.existsSync(testImagePath)) {
      // PNG de 1x1 pixel (base64)
      const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      fs.writeFileSync(testImagePath, Buffer.from(pngBase64, 'base64'));
      console.log('📁 Arquivo de teste criado');
    }

    // Criar FormData
    const formData = new FormData();
    formData.append('avatar', fs.createReadStream(testImagePath));

    console.log('📤 Enviando arquivo...');

    // Fazer upload
    const uploadResponse = await axios.post('http://localhost:3000/api/profile/avatar', formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        ...formData.getHeaders()
      }
    });

    console.log('✅ Upload realizado com sucesso!');
    console.log('📋 Resposta:', uploadResponse.data);

  } catch (error) {
    console.log('❌ Erro no upload:');
    console.log(`   Status: ${error.response?.status}`);
    console.log(`   Mensagem: ${error.response?.data?.message || error.message}`);
    console.log(`   URL: ${error.config?.url}`);
    
    if (error.response?.data) {
      console.log('📋 Detalhes do erro:', error.response.data);
    }
  }
}

testAvatarUpload().catch(console.error);







