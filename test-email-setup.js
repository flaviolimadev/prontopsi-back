const axios = require('axios');

// Configuração
const API_BASE_URL = 'http://localhost:3000';
const TEST_EMAIL = 'teste@exemplo.com'; // Substitua pelo seu email

// Função para fazer login e obter token
async function login() {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'ctrlserr@gmail.com', // Substitua por um email válido
      password: '123456' // Substitua por uma senha válida
    });
    
    return response.data.token;
  } catch (error) {
    console.error('❌ Erro ao fazer login:', error.response?.data || error.message);
    return null;
  }
}

// Função para testar envio de email
async function testEmail(token, type, data = {}) {
  try {
    const response = await axios.post(`${API_BASE_URL}/email/test`, {
      to: TEST_EMAIL,
      type,
      data
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`✅ Email ${type} enviado com sucesso:`, response.data);
    return true;
  } catch (error) {
    console.error(`❌ Erro ao enviar email ${type}:`, error.response?.data || error.message);
    return false;
  }
}

// Função para testar email personalizado
async function testCustomEmail(token) {
  try {
    const response = await axios.post(`${API_BASE_URL}/email/custom`, {
      to: TEST_EMAIL,
      subject: 'Teste de Email Personalizado - ProntuPsi',
      html: `
        <h1>Teste de Email Personalizado</h1>
        <p>Este é um teste do sistema de email do ProntuPsi.</p>
        <p>Data: ${new Date().toLocaleString('pt-BR')}</p>
      `
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Email personalizado enviado com sucesso:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Erro ao enviar email personalizado:', error.response?.data || error.message);
    return false;
  }
}

// Função principal
async function runTests() {
  console.log('🧪 Iniciando testes do sistema de email...\n');
  
  // Fazer login
  console.log('🔐 Fazendo login...');
  const token = await login();
  
  if (!token) {
    console.error('❌ Não foi possível obter token de autenticação');
    return;
  }
  
  console.log('✅ Login realizado com sucesso\n');
  
  // Testar diferentes tipos de email
  const tests = [
    {
      type: 'welcome',
      description: 'Email de boas-vindas'
    },
    {
      type: 'password-reset',
      description: 'Email de recuperação de senha'
    },
    {
      type: 'appointment',
      description: 'Email de confirmação de agendamento',
      data: {
        patientName: 'João Silva',
        appointmentDate: '2024-01-15',
        appointmentTime: '14:00'
      }
    },
    {
      type: 'reminder',
      description: 'Email de lembrete de sessão',
      data: {
        patientName: 'Maria Santos',
        appointmentDate: '2024-01-16',
        appointmentTime: '15:30'
      }
    },
    {
      type: 'payment',
      description: 'Email de notificação de pagamento',
      data: {
        patientName: 'Pedro Costa',
        amount: 'R$ 150,00',
        paymentDate: '2024-01-15'
      }
    }
  ];
  
  let successCount = 0;
  let totalTests = tests.length + 1; // +1 para o email personalizado
  
  // Executar testes
  for (const test of tests) {
    console.log(`📧 Testando: ${test.description}...`);
    const success = await testEmail(token, test.type, test.data);
    if (success) successCount++;
    console.log('');
  }
  
  // Testar email personalizado
  console.log('📧 Testando: Email personalizado...');
  const customSuccess = await testCustomEmail(token);
  if (customSuccess) successCount++;
  console.log('');
  
  // Resultado final
  console.log('📊 Resultado dos testes:');
  console.log(`✅ Sucessos: ${successCount}/${totalTests}`);
  console.log(`❌ Falhas: ${totalTests - successCount}/${totalTests}`);
  
  if (successCount === totalTests) {
    console.log('\n🎉 Todos os testes passaram! O sistema de email está funcionando corretamente.');
  } else {
    console.log('\n⚠️ Alguns testes falharam. Verifique a configuração do Resend.com');
  }
  
  console.log('\n📋 Próximos passos:');
  console.log('1. Verifique se os emails chegaram na caixa de entrada');
  console.log('2. Configure os templates conforme necessário');
  console.log('3. Integre com os módulos da aplicação');
}

// Executar testes
runTests().catch(console.error);
