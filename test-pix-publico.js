const axios = require('axios');

// Configuração para teste
const BASE_URL = 'http://localhost:3000';

// Dados para gerar Pix de R$ 1,00
const pixData = {
  valor: 100, // R$ 1,00 em centavos
  descricao: 'Teste de Pix Público - R$ 1,00',
  nomePagador: 'João Teste Público',
  cpfPagador: '12345678901',
  emailPagador: 'joao.teste.publico@email.com'
};

async function testarPixPublico() {
  try {
    console.log('🧪 Testando rota PÚBLICA de Pix - R$ 1,00\n');
    
    // Primeiro, vamos verificar se o backend está rodando
    console.log('📡 Verificando se o backend está rodando...');
    try {
      await axios.get(`${BASE_URL}/api/health`);
      console.log('✅ Backend está rodando!');
    } catch (error) {
      console.log('❌ Backend não está rodando ou não responde');
      console.log('💡 Execute: npm start');
      return;
    }
    
    console.log('\n🚀 Tentando gerar Pix PÚBLICO de teste...');
    console.log('📊 Dados do Pix:');
    console.log(`   Valor: R$ ${(pixData.valor / 100).toFixed(2)}`);
    console.log(`   Descrição: ${pixData.descricao}`);
    console.log(`   Pagador: ${pixData.nomePagador}`);
    console.log(`   CPF: ${pixData.cpfPagador}`);
    console.log(`   Email: ${pixData.emailPagador}`);
    
    console.log('\n🔓 Rota PÚBLICA - sem necessidade de token JWT!');
    
    // Tentar gerar o Pix (sem autenticação)
    try {
      const response = await axios.post(
        `${BASE_URL}/api/pix/teste-publico`,
        pixData
      );
      
      console.log('\n🎉 Pix PÚBLICO gerado com sucesso!');
      console.log('📋 Resposta:');
      console.log(JSON.stringify(response.data, null, 2));
      
      console.log('\n🔍 Dados importantes:');
      console.log(`   TXID: ${response.data.data.txid}`);
      console.log(`   Valor: ${response.data.data.valor}`);
      console.log(`   Status: ${response.data.data.status}`);
      console.log(`   QR Code: ${response.data.data.qrcode}`);
      console.log(`   ID no Banco: ${response.data.data.databaseId}`);
      
    } catch (error) {
      console.log('\n❌ Erro ao gerar Pix:');
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Mensagem: ${error.response.data?.message || error.response.statusText}`);
      } else {
        console.log(`   Erro: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('💥 Erro geral:', error.message);
  }
}

// Executar teste
testarPixPublico();
