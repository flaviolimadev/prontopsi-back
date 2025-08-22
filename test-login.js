const axios = require('axios');
require('dotenv').config();

async function testLogin() {
  console.log('🔍 Testando login...\n');

  try {
    // Testar login
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'ctrlserr@gmail.com',
      password: '123456'
    });

    console.log('✅ Login realizado com sucesso!');
    console.log('📋 Token:', loginResponse.data.token);
    console.log('📋 User:', loginResponse.data.user);

    const token = loginResponse.data.token;

    // Testar GET /profile
    const profileResponse = await axios.get('http://localhost:3000/api/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('\n✅ GET /profile funcionando');
    console.log('📋 Dados do perfil:', profileResponse.data);

  } catch (error) {
    console.log('❌ Erro no login:');
    console.log(`   Status: ${error.response?.status}`);
    console.log(`   Mensagem: ${error.response?.data?.message || error.message}`);
    
    if (error.response?.data) {
      console.log('📋 Detalhes do erro:', error.response.data);
    }
  }
}

testLogin().catch(console.error);






