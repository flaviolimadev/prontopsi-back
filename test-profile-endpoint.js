const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
require('dotenv').config();

async function testProfileEndpoint() {
  console.log('🔍 Testando endpoint de profile...\n');

  try {
    // Primeiro, fazer login para obter o token
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'ctrlserr@gmail.com',
      password: '123456'
    });

    const token = loginResponse.data.access_token;
    console.log('✅ Login realizado com sucesso');

    // Testar GET /profile
    const profileResponse = await axios.get('http://localhost:3000/api/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ GET /profile funcionando');
    console.log('📋 Dados do perfil:', profileResponse.data);

    // Testar POST /profile/avatar (sem arquivo primeiro)
    try {
      const avatarResponse = await axios.post('http://localhost:3000/api/profile/avatar', {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
    } catch (error) {
      console.log('📋 Erro esperado ao tentar upload sem arquivo:');
      console.log(`   Status: ${error.response?.status}`);
      console.log(`   Mensagem: ${error.response?.data?.message}`);
    }

  } catch (error) {
    console.log('❌ Erro no teste:');
    console.log(`   Status: ${error.response?.status}`);
    console.log(`   Mensagem: ${error.response?.data?.message || error.message}`);
    console.log(`   URL: ${error.config?.url}`);
  }
}

testProfileEndpoint().catch(console.error);










