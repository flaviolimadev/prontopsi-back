const axios = require('axios');

// Configuração para testes
const BASE_URL = 'http://localhost:3000';
const TEST_TOKEN = 'seu_token_jwt_aqui'; // Substitua pelo token real

// Headers para autenticação
const headers = {
  'Authorization': `Bearer ${TEST_TOKEN}`,
  'Content-Type': 'application/json'
};

// Função para testar geração de Pix
async function testarGerarPix() {
  try {
    console.log('🧪 Testando geração de Pix...');
    
    const pixData = {
      valor: 5000, // R$ 50,00 em centavos
      descricao: 'Consulta psicológica de teste',
      nomePagador: 'João Silva Teste',
      cpfPagador: '12345678901',
      emailPagador: 'joao.teste@email.com',
      pacienteId: 'uuid-do-paciente-teste' // Opcional
    };

    const response = await axios.post(
      `${BASE_URL}/api/pix/teste-gerar-pix`,
      pixData,
      { headers }
    );

    console.log('✅ Pix gerado com sucesso!');
    console.log('📊 Dados do Pix:');
    console.log(`   TXID: ${response.data.data.txid}`);
    console.log(`   Valor: ${response.data.data.valor}`);
    console.log(`   Status: ${response.data.data.status}`);
    console.log(`   QR Code: ${response.data.data.qrcode}`);
    console.log(`   Expira em: ${response.data.data.expiredAt}`);
    
    return response.data.data.txid;

  } catch (error) {
    console.error('❌ Erro ao gerar Pix:', error.response?.data || error.message);
    throw error;
  }
}

// Função para testar simulação de pagamento
async function testarSimularPagamento(txid) {
  try {
    console.log(`🧪 Testando simulação de pagamento para TXID: ${txid}...`);
    
    const response = await axios.post(
      `${BASE_URL}/api/pix/teste-simular-pagamento/${txid}`,
      {},
      { headers }
    );

    console.log('✅ Pagamento simulado com sucesso!');
    console.log('📊 Dados do pagamento:');
    console.log(`   TXID: ${response.data.data.txid}`);
    console.log(`   Valor: ${response.data.data.valor}`);
    console.log(`   Status: ${response.data.data.status}`);
    console.log(`   Pago em: ${response.data.data.paidAt}`);

  } catch (error) {
    console.error('❌ Erro ao simular pagamento:', error.response?.data || error.message);
    throw error;
  }
}

// Função para listar Pixes de teste
async function testarListarPixes() {
  try {
    console.log('🧪 Testando listagem de Pixes de teste...');
    
    const response = await axios.get(
      `${BASE_URL}/api/pix/teste-listar`,
      { headers }
    );

    console.log('✅ Listagem realizada com sucesso!');
    console.log(`📊 Total de Pixes de teste: ${response.data.data.length}`);
    
    if (response.data.data.length > 0) {
      console.log('📋 Pixes encontrados:');
      response.data.data.forEach((pix, index) => {
        console.log(`   ${index + 1}. TXID: ${pix.txid}`);
        console.log(`      Valor: ${pix.valor}`);
        console.log(`      Status: ${pix.status}`);
        console.log(`      Criado em: ${pix.createdAt}`);
        console.log(`      Expira em: ${pix.expiredAt}`);
        console.log(`      Expirado: ${pix.isExpired ? 'Sim' : 'Não'}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Erro ao listar Pixes:', error.response?.data || error.message);
    throw error;
  }
}

// Função para testar estatísticas
async function testarEstatisticas() {
  try {
    console.log('🧪 Testando estatísticas de transações...');
    
    const response = await axios.get(
      `${BASE_URL}/api/pix/estatisticas`,
      { headers }
    );

    console.log('✅ Estatísticas obtidas com sucesso!');
    console.log('📊 Resumo das transações:');
    console.log(`   Total: ${response.data.total}`);
    console.log(`   Pendentes: ${response.data.pending} (R$ ${(response.data.pendingValue / 100).toFixed(2)})`);
    console.log(`   Pagas: ${response.data.paid} (R$ ${(response.data.paidValue / 100).toFixed(2)})`);
    console.log(`   Expiradas: ${response.data.expired} (R$ ${(response.data.expiredValue / 100).toFixed(2)})`);
    console.log(`   Canceladas: ${response.data.cancelled} (R$ ${(response.data.cancelledValue / 100).toFixed(2)})`);

  } catch (error) {
    console.error('❌ Erro ao obter estatísticas:', error.response?.data || error.message);
    throw error;
  }
}

// Função para testar filtros de transações
async function testarFiltrosTransacoes() {
  try {
    console.log('🧪 Testando filtros de transações...');
    
    const response = await axios.get(
      `${BASE_URL}/api/pix/transacoes?status=PENDING&limit=5`,
      { headers }
    );

    console.log('✅ Filtros aplicados com sucesso!');
    console.log(`📊 Transações pendentes encontradas: ${response.data.total}`);
    
    if (response.data.transactions.length > 0) {
      console.log('📋 Primeiras transações:');
      response.data.transactions.slice(0, 3).forEach((trans, index) => {
        console.log(`   ${index + 1}. TXID: ${trans.txid}`);
        console.log(`      Valor: R$ ${(trans.valor / 100).toFixed(2)}`);
        console.log(`      Status: ${trans.status}`);
        console.log(`      Criado em: ${trans.createdAt}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Erro ao aplicar filtros:', error.response?.data || error.message);
    throw error;
  }
}

// Função para limpar Pixes de teste
async function testarLimparPixes() {
  try {
    console.log('🧪 Testando limpeza de Pixes de teste...');
    
    const response = await axios.post(
      `${BASE_URL}/api/pix/teste-limpar`,
      {},
      { headers }
    );

    console.log('✅ Limpeza realizada com sucesso!');
    console.log(`🗑️  Pixes removidos: ${response.data.data.deletedCount}`);

  } catch (error) {
    console.error('❌ Erro ao limpar Pixes:', error.response?.data || error.message);
    throw error;
  }
}

// Função principal para executar todos os testes
async function executarTestes() {
  console.log('🚀 Iniciando testes das rotas de Pix...\n');
  
  try {
    // 1. Gerar Pix de teste
    const txid = await testarGerarPix();
    console.log('');
    
    // 2. Listar Pixes antes do pagamento
    await testarListarPixes();
    console.log('');
    
    // 3. Simular pagamento
    await testarSimularPagamento(txid);
    console.log('');
    
    // 4. Listar Pixes após o pagamento
    await testarListarPixes();
    console.log('');
    
    // 5. Verificar estatísticas
    await testarEstatisticas();
    console.log('');
    
    // 6. Testar filtros
    await testarFiltrosTransacoes();
    console.log('');
    
    // 7. Limpar Pixes de teste
    await testarLimparPixes();
    console.log('');
    
    console.log('🎉 Todos os testes foram executados com sucesso!');
    
  } catch (error) {
    console.error('💥 Falha nos testes:', error.message);
    process.exit(1);
  }
}

// Executar testes se o arquivo for chamado diretamente
if (require.main === module) {
  // Verificar se o token foi configurado
  if (TEST_TOKEN === 'seu_token_jwt_aqui') {
    console.error('❌ Configure o TEST_TOKEN no arquivo antes de executar os testes!');
    console.log('💡 Para obter um token:');
    console.log('   1. Faça login na aplicação');
    console.log('   2. Copie o token JWT do localStorage ou headers');
    console.log('   3. Substitua o valor de TEST_TOKEN neste arquivo');
    process.exit(1);
  }
  
  executarTestes();
}

module.exports = {
  testarGerarPix,
  testarSimularPagamento,
  testarListarPixes,
  testarEstatisticas,
  testarFiltrosTransacoes,
  testarLimparPixes
};
