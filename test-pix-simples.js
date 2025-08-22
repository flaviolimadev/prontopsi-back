const axios = require('axios');

// Configuração para teste
const BASE_URL = 'http://localhost:3000';

// Dados para gerar Pix de R$ 1,00
const pixData = {
  valor: 100, // R$ 1,00 em centavos
  descricao: 'Teste de Pix - R$ 1,00',
  nomePagador: 'João Teste',
  cpfPagador: '12345678901',
  emailPagador: 'joao.teste@email.com'
};

async function testarPixSimples() {
  try {
    console.log('🧪 Testando geração de Pix de R$ 1,00...\n');
    
    // Primeiro, vamos verificar se o backend está rodando
    console.log('📡 Verificando se o backend está rodando...');
    try {
      await axios.get(`${BASE_URL}/api/pix/status`);
      console.log('✅ Backend está rodando!');
    } catch (error) {
      console.log('❌ Backend não está rodando ou não responde');
      console.log('💡 Execute: npm start');
      return;
    }
    
    console.log('\n🚀 Tentando gerar Pix de teste...');
    console.log('📊 Dados do Pix:');
    console.log(`   Valor: R$ ${(pixData.valor / 100).toFixed(2)}`);
    console.log(`   Descrição: ${pixData.descricao}`);
    console.log(`   Pagador: ${pixData.nomePagador}`);
    console.log(`   CPF: ${pixData.cpfPagador}`);
    console.log(`   Email: ${pixData.emailPagador}`);
    
    // Tentar gerar o Pix (sem autenticação primeiro para ver o erro)
    try {
      const response = await axios.post(
        `${BASE_URL}/api/pix/teste-gerar-pix`,
        pixData
      );
      
      console.log('\n🎉 Pix gerado com sucesso!');
      console.log('📋 Resposta:');
      console.log(JSON.stringify(response.data, null, 2));
      
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('\n🔒 Erro de autenticação (esperado)');
        console.log('✅ O endpoint está funcionando, mas precisa de token JWT');
        console.log('\n💡 Para testar completamente:');
        console.log('   1. Faça login na aplicação');
        console.log('   2. Copie o token JWT do localStorage');
        console.log('   3. Configure o token no script test-pix-routes.js');
        console.log('   4. Execute: node test-pix-routes.js');
      } else {
        console.log('\n❌ Erro inesperado:');
        console.log(error.response?.data || error.message);
      }
    }
    
  } catch (error) {
    console.error('💥 Erro geral:', error.message);
  }
}

// Executar teste
testarPixSimples();
