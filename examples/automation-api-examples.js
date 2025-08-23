// Exemplos de uso da API de Automação do ProntuPsi
// Este arquivo demonstra como consumir a API em diferentes cenários

const BASE_URL = 'http://localhost:3000/automation-api';
const USER_ID = '123e4567-e89b-12d3-a456-426614174000'; // Substitua pelo ID real do usuário

// Função auxiliar para fazer requisições HTTP
async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erro na requisição:', error);
    throw error;
  }
}

// 1. Buscar estatísticas do usuário
async function getUserStats() {
  console.log('=== Buscando estatísticas do usuário ===');
  
  try {
    const stats = await makeRequest(`${BASE_URL}/user/${USER_ID}/stats`);
    console.log('Estatísticas:', stats);
    return stats;
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
  }
}

// 2. Listar todos os pacientes
async function getPacientes() {
  console.log('\n=== Listando pacientes ===');
  
  try {
    const pacientes = await makeRequest(`${BASE_URL}/user/${USER_ID}/pacientes`);
    console.log(`Total de pacientes: ${pacientes.total}`);
    console.log('Pacientes:', pacientes.data);
    return pacientes;
  } catch (error) {
    console.error('Erro ao listar pacientes:', error);
  }
}

// 3. Buscar informações de um paciente específico
async function getPacienteById(pacienteId) {
  console.log(`\n=== Buscando paciente ${pacienteId} ===`);
  
  try {
    const paciente = await makeRequest(`${BASE_URL}/user/${USER_ID}/paciente/${pacienteId}`);
    console.log('Paciente:', paciente.data);
    return paciente;
  } catch (error) {
    console.error('Erro ao buscar paciente:', error);
  }
}

// 4. Listar sessões (agendas)
async function getAgendaSessoes(dataInicio, dataFim) {
  console.log('\n=== Listando sessões ===');
  
  try {
    let url = `${BASE_URL}/user/${USER_ID}/agenda-sessoes`;
    const params = new URLSearchParams();
    
    if (dataInicio) params.append('dataInicio', dataInicio);
    if (dataFim) params.append('dataFim', dataFim);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const sessoes = await makeRequest(url);
    console.log(`Total de sessões: ${sessoes.total}`);
    console.log('Sessões:', sessoes.data);
    return sessoes;
  } catch (error) {
    console.error('Erro ao listar sessões:', error);
  }
}

// 5. Buscar informações financeiras
async function getFinancialInfo(dataInicio, dataFim) {
  console.log('\n=== Buscando informações financeiras ===');
  
  try {
    let url = `${BASE_URL}/user/${USER_ID}/financeiro`;
    const params = new URLSearchParams();
    
    if (dataInicio) params.append('dataInicio', dataInicio);
    if (dataFim) params.append('dataFim', dataFim);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const financeiro = await makeRequest(url);
    console.log('Resumo financeiro:', financeiro.data.resumo);
    console.log('Total de pagamentos:', financeiro.data.pagamentos.length);
    return financeiro;
  } catch (error) {
    console.error('Erro ao buscar informações financeiras:', error);
  }
}

// 6. Cadastrar novo paciente
async function createPaciente(pacienteData) {
  console.log('\n=== Cadastrando novo paciente ===');
  
  try {
    const novoPaciente = await makeRequest(`${BASE_URL}/user/${USER_ID}/pacientes`, {
      method: 'POST',
      body: JSON.stringify(pacienteData),
    });
    
    console.log('Paciente criado:', novoPaciente.data);
    return novoPaciente;
  } catch (error) {
    console.error('Erro ao criar paciente:', error);
  }
}

// 7. Agendar nova sessão
async function createAgendaSessao(sessaoData) {
  console.log('\n=== Agendando nova sessão ===');
  
  try {
    const novaSessao = await makeRequest(`${BASE_URL}/user/${USER_ID}/agenda-sessoes`, {
      method: 'POST',
      body: JSON.stringify(sessaoData),
    });
    
    console.log('Sessão agendada:', novaSessao.data);
    return novaSessao;
  } catch (error) {
    console.error('Erro ao agendar sessão:', error);
  }
}

// 8. Exemplo de automação completa
async function runAutomation() {
  console.log('🚀 Iniciando automação do ProntuPsi...\n');
  
  try {
    // 1. Verificar estatísticas
    await getUserStats();
    
    // 2. Listar pacientes
    const pacientes = await getPacientes();
    
    if (pacientes && pacientes.data.length > 0) {
      // 3. Buscar informações do primeiro paciente
      const primeiroPaciente = pacientes.data[0];
      await getPacienteById(primeiroPaciente.id);
      
      // 4. Listar sessões do primeiro paciente
      await makeRequest(`${BASE_URL}/user/${USER_ID}/paciente/${primeiroPaciente.id}/agenda-sessoes`);
    }
    
    // 5. Listar sessões dos últimos 30 dias
    const hoje = new Date();
    const trintaDiasAtras = new Date(hoje.getTime() - (30 * 24 * 60 * 60 * 1000));
    
    await getAgendaSessoes(
      trintaDiasAtras.toISOString().split('T')[0],
      hoje.toISOString().split('T')[0]
    );
    
    // 6. Buscar informações financeiras dos últimos 30 dias
    await getFinancialInfo(
      trintaDiasAtras.toISOString().split('T')[0],
      hoje.toISOString().split('T')[0]
    );
    
    // 7. Exemplo de criação de paciente (comentado para não executar automaticamente)
    /*
    const novoPaciente = await createPaciente({
      nome: 'João Silva',
      email: 'joao@email.com',
      telefone: '(11) 99999-9999',
      cpf: '123.456.789-00',
      nascimento: '1990-01-01',
      endereco: 'Rua A, 123',
      profissao: 'Engenheiro',
      genero: 'Masculino'
    });
    
    if (novoPaciente) {
      // 8. Agendar sessão para o novo paciente
      await createAgendaSessao({
        pacienteId: novoPaciente.data.id,
        data: '2024-01-25',
        horario: '14:00:00',
        tipoDaConsulta: 'Terapia Individual',
        modalidade: 'Online',
        tipoAtendimento: 'Primeira Consulta',
        duracao: 60,
        value: 15000,
        observacao: 'Sessão criada via automação'
      });
    }
    */
    
    console.log('\n✅ Automação concluída com sucesso!');
    
  } catch (error) {
    console.error('\n❌ Erro na automação:', error);
  }
}

// Executar automação se este arquivo for executado diretamente
if (require.main === module) {
  runAutomation();
}

// Exportar funções para uso em outros módulos
module.exports = {
  getUserStats,
  getPacientes,
  getPacienteById,
  getAgendaSessoes,
  getFinancialInfo,
  createPaciente,
  createAgendaSessao,
  runAutomation,
};
