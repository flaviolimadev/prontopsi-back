const axios = require('axios');

// Configuração
const API_BASE_URL = 'http://localhost:3000/api';
const TEST_EMAIL = 'teste@exemplo.com'; // Substitua pelo seu email

// Função para testar registro com verificação de email
async function testEmailVerification() {
  console.log('🧪 Testando sistema de verificação de email...\n');
  
  try {
    // 1. Registrar novo usuário
    console.log('📝 1. Registrando novo usuário...');
    const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, {
      nome: 'Teste',
      sobrenome: 'Verificação',
      email: TEST_EMAIL,
      password: '123456',
      contato: '(11) 99999-9999'
    });
    
    console.log('✅ Usuário registrado:', registerResponse.data.message);
    console.log('📧 Email de verificação enviado\n');
    
    // 2. Tentar fazer login (deve falhar)
    console.log('🔐 2. Tentando fazer login (deve falhar)...');
    try {
      await axios.post(`${API_BASE_URL}/auth/login`, {
        email: TEST_EMAIL,
        password: '123456'
      });
      console.log('❌ Login não deveria ter funcionado');
    } catch (error) {
      console.log('✅ Login bloqueado corretamente:', error.response.data.message);
    }
    console.log('');
    
    // 3. Reenviar código de verificação
    console.log('📧 3. Reenviando código de verificação...');
    const resendResponse = await axios.post(`${API_BASE_URL}/auth/resend-verification`, {
      email: TEST_EMAIL
    });
    
    console.log('✅ Código reenviado:', resendResponse.data.message);
    console.log('');
    
    console.log('📋 Próximos passos:');
    console.log('1. Verifique seu email para o código de verificação');
    console.log('2. Use o endpoint /auth/verify-email para verificar o código');
    console.log('3. Após verificação, você poderá fazer login normalmente');
    console.log('');
    console.log('🔗 Endpoint para verificação:');
    console.log(`POST ${API_BASE_URL}/auth/verify-email`);
    console.log('Body: { "email": "' + TEST_EMAIL + '", "verificationCode": "123456" }');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
  }
}

// Função para testar verificação com código específico
async function testVerificationWithCode(verificationCode) {
  console.log(`🔐 Testando verificação com código: ${verificationCode}...\n`);
  
  try {
    const verifyResponse = await axios.post(`${API_BASE_URL}/auth/verify-email`, {
      email: TEST_EMAIL,
      verificationCode: verificationCode
    });
    
    console.log('✅ Email verificado com sucesso!');
    console.log('🎉 Token JWT gerado:', verifyResponse.data.token ? 'Sim' : 'Não');
    console.log('👤 Dados do usuário:', {
      id: verifyResponse.data.user.id,
      nome: verifyResponse.data.user.nome,
      email: verifyResponse.data.user.email,
      emailVerified: verifyResponse.data.user.emailVerified,
      status: verifyResponse.data.user.status
    });
    console.log('');
    
    // Testar login após verificação
    console.log('🔐 Testando login após verificação...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: TEST_EMAIL,
      password: '123456'
    });
    
    console.log('✅ Login realizado com sucesso após verificação!');
    console.log('🎉 Token JWT:', loginResponse.data.token ? 'Sim' : 'Não');
    
  } catch (error) {
    console.error('❌ Erro na verificação:', error.response?.data || error.message);
  }
}

// Função principal
async function runTests() {
  const args = process.argv.slice(2);
  
  if (args.length > 0 && args[0] === 'verify') {
    const code = args[1];
    if (!code) {
      console.log('❌ Código de verificação não fornecido');
      console.log('Uso: node test-email-verification.js verify <codigo>');
      return;
    }
    await testVerificationWithCode(code);
  } else {
    await testEmailVerification();
  }
}

// Executar testes
runTests().catch(console.error);
