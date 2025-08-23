# API de Automação - ProntuPsi

## Visão Geral

A API de Automação do ProntuPsi foi criada para permitir que sistemas externos e automações acessem os dados da plataforma sem necessidade de autenticação JWT. Esta API é ideal para:

- Integrações com sistemas de terceiros
- Automações e scripts
- Dashboards externos
- Webhooks e notificações
- Sincronização de dados

## Características Principais

✅ **Sem autenticação JWT** - Apenas o ID do usuário é necessário  
✅ **Validação de usuário** - Verifica se o usuário existe antes de retornar dados  
✅ **Dados completos** - Acesso a pacientes, sessões, financeiro e estatísticas  
✅ **Operações de escrita** - Permite criar pacientes e agendar sessões  
✅ **Pesquisa de usuários** - Busca por nome, email ou CPF  
✅ **Filtros flexíveis** - Suporte a filtros por data e paciente  
✅ **Respostas padronizadas** - Formato consistente para todas as operações  
✅ **Validação robusta** - Verificação de dados duplicados e campos obrigatórios  

## Estrutura da API

### Base URL
```
http://localhost:3000/api/automation-api
```

### Endpoints Disponíveis

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/user/:userId/stats` | Estatísticas gerais do usuário |
| GET | `/user/:userId/pacientes` | Lista todos os pacientes |
| GET | `/user/:userId/paciente/:pacienteId` | Informações de um paciente específico |
| GET | `/user/:userId/agenda-sessoes` | Lista sessões agendadas |
| GET | `/user/:userId/paciente/:pacienteId/agenda-sessoes` | Sessões de um paciente específico |
| GET | `/user/:userId/financeiro` | Informações financeiras |
| POST | `/user/:userId/pacientes` | Cadastra novo paciente (JSON) |
| POST | `/user/:userId/agenda-sessoes` | Agenda nova sessão (JSON) |
| GET | `/user/:userId/pacientes/create` | Cadastra novo paciente (URL) |
| GET | `/user/:userId/agenda-sessoes/create` | Agenda nova sessão (URL) |
| GET | `/users/search?q=termo` | Pesquisa usuários por nome, email ou CPF |

## Como Usar

### 1. Obter o ID do Usuário

Primeiro, você precisa do ID único do usuário. Este ID pode ser obtido:
- Através da interface administrativa do ProntuPsi
- Consultando o banco de dados diretamente
- Usando a API de usuários (se disponível)

### 2. Fazer Requisições

Todas as requisições seguem o padrão REST e retornam JSON. Exemplo:

```bash
# Listar pacientes de um usuário
curl -X GET "http://localhost:3000/api/automation-api/user/123e4567-e89b-12d3-a456-426614174000/pacientes"
```

### 3. Tratar Respostas

Todas as respostas seguem o formato padrão:

```json
{
  "success": true,
  "data": { ... },
  "message": "Mensagem de sucesso" // apenas em operações de criação
}
```

## Exemplos Práticos

### JavaScript/Node.js

```javascript
const fetch = require('node-fetch');

async function getPacientes(userId) {
  const response = await fetch(
    `http://localhost:3000/api/automation-api/user/${userId}/pacientes`
  );
  const data = await response.json();
  return data;
}

// Uso
getPacientes('123e4567-e89b-12d3-a456-426614174000')
  .then(pacientes => console.log(pacientes))
  .catch(error => console.error(error));
```

### Python

```python
import requests

def get_pacientes(user_id):
    url = f"http://localhost:3000/api/automation-api/user/{user_id}/pacientes"
    response = requests.get(url)
    return response.json()

# Uso
pacientes = get_pacientes('123e4567-e89b-12d3-a456-426614174000')
print(pacientes)
```

### PHP

```php
<?php

function getPacientes($userId) {
    $url = "http://localhost:3000/api/automation-api/user/{$userId}/pacientes";
    $response = file_get_contents($url);
    return json_decode($response, true);
}

// Uso
$pacientes = getPacientes('123e4567-e89b-12d3-a456-426614174000');
print_r($pacientes);
```

## Casos de Uso Comuns

### 1. Sincronização de Dados

```javascript
// Sincronizar pacientes com sistema externo
async function syncPacientes(userId) {
  const pacientes = await getPacientes(userId);
  
  for (const paciente of pacientes.data) {
    // Enviar para sistema externo
    await sendToExternalSystem(paciente);
  }
}
```

### 2. Relatórios Automatizados

```javascript
// Gerar relatório financeiro mensal
async function generateMonthlyReport(userId) {
  const hoje = new Date();
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  
  const financeiro = await getFinancialInfo(
    userId,
    inicioMes.toISOString().split('T')[0],
    hoje.toISOString().split('T')[0]
  );
  
  return financeiro.data.resumo;
}
```

### 3. Notificações Automáticas

```javascript
// Verificar sessões do dia e enviar lembretes
async function checkTodaySessions(userId) {
  const hoje = new Date().toISOString().split('T')[0];
  
  const sessoes = await getAgendaSessoes(userId, hoje, hoje);
  
  for (const sessao of sessoes.data) {
    if (sessao.status === 1) { // Confirmada
      await sendReminder(sessao);
    }
  }
}
```

### 4. Pesquisa de Usuários

```javascript
// Pesquisar usuários por nome, email ou CPF
async function searchUsers(searchTerm) {
  const response = await fetch(
    `http://localhost:3000/api/automation-api/users/search?q=${encodeURIComponent(searchTerm)}`
  );
  const data = await response.json();
  
  console.log(`Encontrados ${data.total} usuários:`);
  data.data.forEach(user => {
    console.log(`- ${user.nome} ${user.sobrenome} (${user.email}) - ID: ${user.id}`);
  });
  
  return data;
}

// Exemplos de uso
searchUsers('Maria');           // Buscar por nome
searchUsers('silva@email.com'); // Buscar por email
searchUsers('12345678900');     // Buscar por CPF
```

### 5. Cadastro de Pacientes

```javascript
// Cadastrar novo paciente
async function createPaciente(userId, dadosPaciente) {
  const response = await fetch(
    `http://localhost:3000/api/automation-api/user/${userId}/pacientes`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dadosPaciente)
    }
  );
  
  const data = await response.json();
  
  if (data.success) {
    console.log(`✅ Paciente criado: ${data.data.nome} (ID: ${data.data.id})`);
  }
  
  return data;
}

// Exemplo de uso - Campos mínimos obrigatórios
const novoPaciente = {
  nome: 'João Silva',
  telefone: '(11) 99999-8888',
  nascimento: '1990-05-15',
  genero: 'Masculino'
};

createPaciente('123e4567-e89b-12d3-a456-426614174000', novoPaciente);

// Exemplo com dados completos
const pacienteCompleto = {
  nome: 'Maria Santos',
  email: 'maria.santos@email.com',
  telefone: '(11) 98765-4321',
  endereco: 'Rua das Flores, 123, São Paulo, SP',
  profissao: 'Engenheira',
  nascimento: '1985-03-20',
  cpf: '12345678900',
  genero: 'Feminino',
  observacao_geral: 'Paciente com histórico de ansiedade',
  contato_emergencia: 'João Santos - (11) 91234-5678',
  cor: '#3498db'
};

createPaciente('123e4567-e89b-12d3-a456-426614174000', pacienteCompleto);
```

### 6. Cadastro via URL (sem JSON)

```javascript
// Cadastrar paciente via GET com parâmetros na URL
async function createPacienteViaUrl(userId, dados) {
  const params = new URLSearchParams(dados);
  const response = await fetch(
    `http://localhost:3000/api/automation-api/user/${userId}/pacientes/create?${params}`
  );
  return response.json();
}

// Exemplo - Cadastro mínimo via URL
const dadosMinimos = {
  nome: 'Carlos Silva',
  telefone: '(11) 97777-6666',
  nascimento: '1988-07-25',
  genero: 'Masculino'
};

createPacienteViaUrl('123e4567-e89b-12d3-a456-426614174000', dadosMinimos);

// Exemplo - URL direta
const urlDireta = 'http://localhost:3000/api/automation-api/user/123e4567-e89b-12d3-a456-426614174000/pacientes/create?' +
  'nome=Ana Costa&' +
  'telefone=(11)95555-4444&' +
  'nascimento=1992-12-10&' +
  'genero=Feminino&' +
  'email=ana.costa@email.com&' +
  'cpf=12345678900';

fetch(urlDireta).then(response => response.json()).then(console.log);
```

### 7. Agendamento de Sessões

```javascript
// Agendar sessão via JSON (POST)
async function agendarSessao(userId, dadosSessao) {
  const response = await fetch(
    `http://localhost:3000/api/automation-api/user/${userId}/agenda-sessoes`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dadosSessao)
    }
  );
  return response.json();
}

// Agendar sessão via URL (GET)
async function agendarSessaoViaUrl(userId, dados) {
  const params = new URLSearchParams(dados);
  const response = await fetch(
    `http://localhost:3000/api/automation-api/user/${userId}/agenda-sessoes/create?${params}`
  );
  return response.json();
}

// Exemplo de agendamento
const novaSessao = {
  pacienteId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  data: '2025-02-15',
  horario: '14:00',
  tipoDaConsulta: 'Consulta Individual',
  modalidade: 'Presencial',
  tipoAtendimento: 'Psicoterapia',
  duracao: '60',
  observacao: 'Primeira sessão',
  value: '150.00',
  status: '1'
};

// Via JSON
agendarSessao('123e4567-e89b-12d3-a456-426614174000', novaSessao);

// Via URL
agendarSessaoViaUrl('123e4567-e89b-12d3-a456-426614174000', novaSessao);
```

## Segurança e Limitações

### ✅ O que é permitido:
- Acesso a dados do usuário especificado
- Criação de pacientes e sessões
- Pesquisa de usuários por nome, email ou CPF
- Filtros por data e paciente
- Validação de existência do usuário
- Verificação de dados duplicados (CPF e email)

### ⚠️ Limitações:
- Apenas dados do usuário especificado
- Sem acesso a dados de outros usuários
- Sem autenticação de dois fatores
- Sem logs de auditoria detalhados

### 🔒 Recomendações de Segurança:
- Use HTTPS em produção
- Limite o acesso por IP se necessário
- Monitore o uso da API
- Considere implementar rate limiting

## Tratamento de Erros

### Códigos de Status HTTP

| Código | Descrição |
|--------|------------|
| 200 | Sucesso |
| 201 | Criado com sucesso |
| 400 | Erro na requisição |
| 404 | Recurso não encontrado |
| 500 | Erro interno do servidor |

### Exemplo de Tratamento de Erro

```javascript
async function safeApiCall(userId) {
  try {
    const response = await fetch(`/user/${userId}/pacientes`);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Usuário não encontrado');
      }
      throw new Error(`Erro HTTP: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erro na API:', error);
    // Tratar erro apropriadamente
  }
}
```

## Monitoramento e Logs

### Logs Disponíveis
- Todas as requisições são logadas no servidor
- Erros são registrados com detalhes
- Acesso a dados é rastreado

### Métricas Recomendadas
- Número de requisições por usuário
- Tempo de resposta médio
- Taxa de erro
- Uso de recursos

## Suporte e Manutenção

### Documentação
- Este README
- Arquivo `AUTOMATION_API.md` com documentação completa
- Exemplos em `examples/` directory

### Contato
Para dúvidas ou problemas com a API de automação:
- Abra uma issue no repositório
- Entre em contato com a equipe de desenvolvimento
- Consulte a documentação da API principal

## Roadmap

### Funcionalidades Futuras
- [x] Pesquisa de usuários por nome, email ou CPF
- [x] Cadastro de pacientes via API
- [x] Validação de dados duplicados
- [ ] Autenticação por API Key
- [ ] Rate limiting configurável
- [ ] Webhooks para eventos
- [ ] Cache de dados
- [ ] Métricas em tempo real
- [ ] Suporte a GraphQL
- [ ] Agendamento de sessões via API

### Melhorias Planejadas
- [x] Validação de dados mais robusta
- [x] Logs detalhados de operações
- [ ] Logs de auditoria completos
- [ ] Suporte a múltiplos usuários
- [ ] Filtros avançados
- [ ] Paginação para grandes volumes de dados
- [ ] Bulk operations (criar múltiplos pacientes)
- [ ] Upload de arquivos para pacientes

## Referência Rápida

### URLs Principais
```
BASE: http://localhost:3000/api/automation-api

# Estatísticas
GET /user/{userId}/stats

# Pacientes
GET /user/{userId}/pacientes
GET /user/{userId}/paciente/{pacienteId}
POST /user/{userId}/pacientes                    # Via JSON
GET /user/{userId}/pacientes/create             # Via URL

# Sessões
GET /user/{userId}/agenda-sessoes
GET /user/{userId}/paciente/{pacienteId}/agenda-sessoes
POST /user/{userId}/agenda-sessoes              # Via JSON
GET /user/{userId}/agenda-sessoes/create        # Via URL

# Financeiro
GET /user/{userId}/financeiro

# Pesquisa
GET /users/search?q={termo}
```

### Campos Obrigatórios para Cadastro de Paciente
```json
{
  "nome": "string (obrigatório)",
  "telefone": "string (obrigatório)", 
  "nascimento": "YYYY-MM-DD (obrigatório)",
  "genero": "Masculino|Feminino|Prefiro não informar (obrigatório)"
}
```

### Códigos de Status
- `200` - Sucesso (GET)
- `201` - Criado (POST) 
- `400` - Erro na requisição
- `404` - Não encontrado
- `500` - Erro interno

### Exemplo Mínimo - cURL
```bash
# Buscar estatísticas
curl "http://localhost:3000/api/automation-api/user/{userId}/stats"

# Pesquisar usuários
curl "http://localhost:3000/api/automation-api/users/search?q=Maria"

# Cadastrar paciente via JSON
curl -X POST "http://localhost:3000/api/automation-api/user/{userId}/pacientes" \
  -H "Content-Type: application/json" \
  -d '{"nome":"João Silva","telefone":"(11)99999-8888","nascimento":"1990-01-01","genero":"Masculino"}'

# Cadastrar paciente via URL
curl "http://localhost:3000/api/automation-api/user/{userId}/pacientes/create?nome=João Silva&telefone=(11)99999-8888&nascimento=1990-01-01&genero=Masculino"

# Agendar sessão via URL
curl "http://localhost:3000/api/automation-api/user/{userId}/agenda-sessoes/create?pacienteId={pacienteId}&data=2025-02-15&horario=14:00&tipoDaConsulta=Consulta Individual&modalidade=Presencial&tipoAtendimento=Psicoterapia&duracao=60"
```
