const axios = require('axios');

async function testPublicRoute() {
  try {
    console.log('🔍 Testando rota pública...');
    
    const response = await axios.get('http://localhost:3000/api/cadastro-links/public/d8001eeda5b8f1a1abea73af60c9e154ba9cc41e70dc9cc11febf2c51bb82992');
    
    console.log('✅ Resposta da API:', response.data);
    console.log('📊 Status:', response.status);
  } catch (error) {
    console.error('❌ Erro na requisição:', error.response?.data || error.message);
    console.log('📊 Status:', error.response?.status);
  }
}

testPublicRoute();
