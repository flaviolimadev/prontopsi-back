# API de Automação - ProntuPsi

Esta API permite que sistemas externos e automações acessem os dados do ProntuPsi sem necessidade de autenticação JWT, apenas fornecendo o ID do usuário.

## Base URL
```
http://localhost:3000/automation-api
```

## Endpoints Disponíveis

### 1. Estatísticas do Usuário
**GET** `/user/:userId/stats`

Retorna estatísticas gerais do usuário.

**Parâmetros:**
- `userId` (path): ID único do usuário

**Resposta:**
```json
{
  "success": true,
  "data": {
    "totalPacientes": 25,
    "totalSessoes": 150,
    "totalPagamentos": 120,
    "totalRecebido": 15000.50
  }
}
```

### 2. Listar Pacientes
**GET** `/user/:userId/pacientes`

Retorna todos os pacientes de um usuário.

**Parâmetros:**
- `userId` (path): ID único do usuário

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-do-paciente",
      "nome": "João Silva",
      "email": "joao@email.com",
      "telefone": "(11) 99999-9999",
      "cpf": "123.456.789-00",
      "nascimento": "1990-01-01",
      "status": 1
    }
  ],
  "total": 1
}
```

### 3. Informações de um Paciente
**GET** `/user/:userId/paciente/:pacienteId`

Retorna informações detalhadas de um paciente específico.

**Parâmetros:**
- `userId` (path): ID único do usuário
- `pacienteId` (path): ID único do paciente

**Resposta:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-do-paciente",
    "nome": "João Silva",
    "email": "joao@email.com",
    "telefone": "(11) 99999-9999",
    "cpf": "123.456.789-00",
    "nascimento": "1990-01-01",
    "endereco": "Rua A, 123",
    "profissao": "Engenheiro",
    "genero": "Masculino",
    "status": 1
  }
}
```

### 4. Listar Sessões (Agendas)
**GET** `/user/:userId/agenda-sessoes`

Retorna todas as sessões agendadas de um usuário.

**Parâmetros:**
- `userId` (path): ID único do usuário
- `dataInicio` (query, opcional): Data de início (YYYY-MM-DD)
- `dataFim` (query, opcional): Data de fim (YYYY-MM-DD)
- `pacienteId` (query, opcional): Filtrar por paciente específico

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-da-sessao",
      "data": "2024-01-15",
      "horario": "14:00:00",
      "tipoDaConsulta": "Terapia Individual",
      "modalidade": "Online",
      "tipoAtendimento": "Primeira Consulta",
      "duracao": 60,
      "value": 15000,
      "status": 1,
      "paciente": {
        "id": "uuid-do-paciente",
        "nome": "João Silva"
      }
    }
  ],
  "total": 1
}
```

### 5. Sessões de um Paciente
**GET** `/user/:userId/paciente/:pacienteId/agenda-sessoes`

Retorna todas as sessões de um paciente específico.

**Parâmetros:**
- `userId` (path): ID único do usuário
- `pacienteId` (path): ID único do paciente

**Resposta:** Mesmo formato da listagem de sessões, mas filtrado por paciente.

### 6. Informações Financeiras
**GET** `/user/:userId/financeiro`

Retorna informações financeiras do usuário.

**Parâmetros:**
- `userId` (path): ID único do usuário
- `dataInicio` (query, opcional): Data de início (YYYY-MM-DD)
- `dataFim` (query, opcional): Data de fim (YYYY-MM-DD)

**Resposta:**
```json
{
  "success": true,
  "data": {
    "pagamentos": [
      {
        "id": "uuid-do-pagamento",
        "value": 15000,
        "data": "2024-01-15",
        "status": 1,
        "paciente": {
          "id": "uuid-do-paciente",
          "nome": "João Silva"
        }
      }
    ],
    "resumo": {
      "totalRecebido": 15000.00,
      "totalPendente": 5000.00,
      "totalCancelado": 0.00,
      "totalPagamentos": 1
    }
  }
}
```

### 7. Cadastrar Novo Paciente
**POST** `/user/:userId/pacientes`

Cadastra um novo paciente para o usuário.

**Parâmetros:**
- `userId` (path): ID único do usuário
- `body`: Dados do paciente

**Body:**
```json
{
  "nome": "Maria Santos",
  "email": "maria@email.com",
  "telefone": "(11) 88888-8888",
  "cpf": "987.654.321-00",
  "nascimento": "1985-05-15",
  "endereco": "Rua B, 456",
  "profissao": "Advogada",
  "genero": "Feminino"
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Paciente criado com sucesso",
  "data": {
    "id": "uuid-gerado",
    "nome": "Maria Santos",
    "email": "maria@email.com"
  }
}
```

### 8. Agendar Nova Sessão
**POST** `/user/:userId/agenda-sessoes`

Agenda uma nova sessão para um paciente.

**Parâmetros:**
- `userId` (path): ID único do usuário
- `body`: Dados da sessão

**Body:**
```json
{
  "pacienteId": "uuid-do-paciente",
  "data": "2024-01-20",
  "horario": "15:00:00",
  "tipoDaConsulta": "Terapia Individual",
  "modalidade": "Online",
  "tipoAtendimento": "Acompanhamento",
  "duracao": 60,
  "value": 15000,
  "observacao": "Sessão de acompanhamento semanal"
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Sessão agendada com sucesso",
  "data": {
    "id": "uuid-gerado",
    "data": "2024-01-20",
    "horario": "15:00:00"
  }
}
```

## Códigos de Status

- **200**: Sucesso
- **201**: Criado com sucesso
- **400**: Erro na requisição (dados inválidos)
- **404**: Recurso não encontrado
- **500**: Erro interno do servidor

## Observações Importantes

1. **Valores Monetários**: Todos os valores são retornados em centavos no banco de dados, mas a API converte automaticamente para reais nos resumos financeiros.

2. **Datas**: Use o formato ISO (YYYY-MM-DD) para datas.

3. **Horários**: Use o formato 24h (HH:MM:SS) para horários.

4. **Segurança**: Esta API não requer autenticação JWT, mas valida se o usuário existe antes de retornar dados.

5. **Filtros**: Os filtros de data são opcionais e permitem buscar dados em um período específico.

## Exemplos de Uso

### cURL - Listar Pacientes
```bash
curl -X GET "http://localhost:3000/automation-api/user/123e4567-e89b-12d3-a456-426614174000/pacientes"
```

### cURL - Cadastrar Paciente
```bash
curl -X POST "http://localhost:3000/automation-api/user/123e4567-e89b-12d3-a456-426614174000/pacientes" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "email": "joao@email.com",
    "telefone": "(11) 99999-9999"
  }'
```

### cURL - Agendar Sessão
```bash
curl -X POST "http://localhost:3000/automation-api/user/123e4567-e89b-12d3-a456-426614174000/agenda-sessoes" \
  -H "Content-Type: application/json" \
  -d '{
    "pacienteId": "456e7890-e89b-12d3-a456-426614174000",
    "data": "2024-01-25",
    "horario": "14:00:00",
    "tipoDaConsulta": "Terapia Individual",
    "modalidade": "Online",
    "tipoAtendimento": "Primeira Consulta",
    "duracao": 60,
    "value": 15000
  }'
```

## Suporte

Para dúvidas ou problemas com a API, entre em contato com a equipe de desenvolvimento do ProntuPsi.
