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
✅ **Filtros flexíveis** - Suporte a filtros por data e paciente  
✅ **Respostas padronizadas** - Formato consistente para todas as operações  

## Estrutura da API

### Base URL
```
http://localhost:3000/automation-api
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
| POST | `/user/:userId/pacientes` | Cadastra novo paciente |
| POST | `/user/:userId/agenda-sessoes` | Agenda nova sessão |

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
curl -X GET "http://localhost:3000/automation-api/user/123e4567-e89b-12d3-a456-426614174000/pacientes"
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
    `http://localhost:3000/automation-api/user/${userId}/pacientes`
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
    url = f"http://localhost:3000/automation-api/user/{user_id}/pacientes"
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
    $url = "http://localhost:3000/automation-api/user/{$userId}/pacientes";
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

## Segurança e Limitações

### ✅ O que é permitido:
- Acesso a dados do usuário especificado
- Criação de pacientes e sessões
- Filtros por data e paciente
- Validação de existência do usuário

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
- [ ] Autenticação por API Key
- [ ] Rate limiting configurável
- [ ] Webhooks para eventos
- [ ] Cache de dados
- [ ] Métricas em tempo real
- [ ] Suporte a GraphQL

### Melhorias Planejadas
- [ ] Validação de dados mais robusta
- [ ] Logs de auditoria detalhados
- [ ] Suporte a múltiplos usuários
- [ ] Filtros avançados
- [ ] Paginação para grandes volumes de dados
