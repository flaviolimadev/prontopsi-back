const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configurações da API Efí
const EFI_CONFIG = {
  baseURL: 'https://pix.api.efipay.com.br',
  clientId: process.env.EFI_CLIENT_ID || 'YOUR_CLIENT_ID',
  clientSecret: process.env.EFI_CLIENT_SECRET || 'YOUR_CLIENT_SECRET',
  certPath: process.env.EFI_CERT_PATH || './certs/certificado.p12',
  certPassphrase: process.env.EFI_CERT_PASSPHRASE || ''
};

// Função para obter token de acesso
async function getAccessToken() {
  try {
    console.log('🔐 Obtendo token de acesso...');
    
    // Verifica se o certificado existe
    if (!fs.existsSync(EFI_CONFIG.certPath)) {
      throw new Error(`Certificado não encontrado em: ${EFI_CONFIG.certPath}`);
    }

    const certBuffer = fs.readFileSync(path.resolve(EFI_CONFIG.certPath));
    
    const response = await axios.post('/oauth/token', {
      grant_type: 'client_credentials'
    }, {
      baseURL: EFI_CONFIG.baseURL,
      auth: {
        username: EFI_CONFIG.clientId,
        password: EFI_CONFIG.clientSecret
      },
      httpsAgent: new (require('https').Agent)({
        pfx: certBuffer,
        passphrase: EFI_CONFIG.certPassphrase
      })
    });

    console.log('✅ Token obtido com sucesso!');
    console.log(`Token: ${response.data.access_token.substring(0, 20)}...`);
    console.log(`Expira em: ${response.data.expires_in} segundos`);
    console.log(`Escopos: ${response.data.scope}`);
    
    return response.data.access_token;

  } catch (error) {
    console.error('❌ Erro ao obter token:', error.message);
    if (error.response) {
      console.error('Resposta da API:', error.response.data);
    }
    throw error;
  }
}

// Função para testar criação de cobrança
async function testCreatePixCharge(token) {
  try {
    console.log('\n💰 Testando criação de cobrança Pix...');
    
    const payload = {
      calendario: {
        expiracao: 3600
      },
      devedor: {
        nome: 'João Silva',
        cpf: '12345678901'
      },
      valor: {
        original: '50.00'
      },
      chave: 'teste@email.com',
      solicitacaoPagador: 'Teste de integração'
    };

    const response = await axios.post('/v2/cob', payload, {
      baseURL: EFI_CONFIG.baseURL,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Cobrança criada com sucesso!');
    console.log(`TXID: ${response.data.txid}`);
    console.log(`Status: ${response.data.status}`);
    
    return response.data;

  } catch (error) {
    console.error('❌ Erro ao criar cobrança:', error.message);
    if (error.response) {
      console.error('Resposta da API:', error.response.data);
    }
    throw error;
  }
}

// Função para testar consulta de cobrança
async function testGetPixCharge(token, txid) {
  try {
    console.log('\n🔍 Testando consulta de cobrança...');
    
    const response = await axios.get(`/v2/cob/${txid}`, {
      baseURL: EFI_CONFIG.baseURL,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Cobrança consultada com sucesso!');
    console.log(`Valor: R$ ${response.data.valor.original}`);
    console.log(`Chave: ${response.data.chave}`);
    
    return response.data;

  } catch (error) {
    console.error('❌ Erro ao consultar cobrança:', error.message);
    if (error.response) {
      console.error('Resposta da API:', error.response.data);
    }
    throw error;
  }
}

// Função para testar consulta de Pix recebidos
async function testGetReceivedPix(token) {
  try {
    console.log('\n📥 Testando consulta de Pix recebidos...');
    
    const hoje = new Date();
    const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString();
    const fim = hoje.toISOString();
    
    const response = await axios.get(`/v2/pix?inicio=${inicio}&fim=${fim}`, {
      baseURL: EFI_CONFIG.baseURL,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Pix recebidos consultados com sucesso!');
    console.log(`Total de Pix: ${response.data.pix?.length || 0}`);
    
    return response.data;

  } catch (error) {
    console.error('❌ Erro ao consultar Pix recebidos:', error.message);
    if (error.response) {
      console.error('Resposta da API:', error.response.data);
    }
    throw error;
  }
}

// Função principal de teste
async function runTests() {
  try {
    console.log('🚀 Iniciando testes da API Pix Efí...\n');
    
    // Verifica configurações
    if (EFI_CONFIG.clientId === 'YOUR_CLIENT_ID') {
      console.log('⚠️  Configure as variáveis de ambiente primeiro:');
      console.log('   EFI_CLIENT_ID=seu_client_id');
      console.log('   EFI_CLIENT_SECRET=seu_client_secret');
      console.log('   EFI_CERT_PATH=./certs/certificado.p12');
      console.log('   EFI_CERT_PASSPHRASE=sua_senha');
      return;
    }

    // Teste 1: Autenticação
    const token = await getAccessToken();
    
    // Teste 2: Criação de cobrança
    const cobranca = await testCreatePixCharge(token);
    
    // Teste 3: Consulta de cobrança
    await testGetPixCharge(token, cobranca.txid);
    
    // Teste 4: Consulta de Pix recebidos
    await testGetReceivedPix(token);
    
    console.log('\n🎉 Todos os testes passaram com sucesso!');
    console.log('✅ A integração com a API Pix da Efí está funcionando corretamente.');
    
  } catch (error) {
    console.error('\n💥 Teste falhou:', error.message);
    process.exit(1);
  }
}

// Executa os testes se o arquivo for executado diretamente
if (require.main === module) {
  runTests();
}

module.exports = {
  getAccessToken,
  testCreatePixCharge,
  testGetPixCharge,
  testGetReceivedPix
};
