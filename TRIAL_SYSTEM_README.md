# 🎯 Sistema de Trial de 7 Dias - ProntoPsi

## 📋 Visão Geral

Sistema completo de gerenciamento de períodos de teste (trial) de 7 dias para os planos **Profissional** e **Premium**, com expiração automática implementada no backend.

## ✅ Funcionalidades Implementadas

### 1. **Campos no Banco de Dados** (Migration executada)
- `plan_type`: Tipo do plano (gratuito, pro, advanced)
- `subscription_status`: Status da assinatura (active, trial, paid, expired)
- `trial_started_at`: Data de início do trial
- `trial_ends_at`: Data de término do trial (7 dias após início)
- `trial_used`: Flag indicando se o usuário já usou o trial
- `subscription_started_at`: Data de início da assinatura paga
- `subscription_ends_at`: Data de término da assinatura paga

### 2. **Entidade User Atualizada**
Métodos auxiliares adicionados:
- `isOnTrial()`: Verifica se está em trial ativo
- `isTrialExpired()`: Verifica se o trial expirou
- `getTrialDaysRemaining()`: Retorna dias restantes do trial
- `canStartTrial()`: Verifica se pode iniciar um trial

### 3. **TrialService** (`src/services/trial.service.ts`)

#### Principais Métodos:

**`startTrial(userId, planType)`**
- Inicia um trial de 7 dias para o usuário
- Valida se o usuário já usou o trial
- Define `trial_ends_at` para 7 dias no futuro
- Marca `trial_used = true`

**`expireTrials()` - JOB AUTOMÁTICO**
- **Executa diariamente às 00:00** (usando @Cron)
- Busca todos os usuários com `subscription_status = 'trial'` e `trial_ends_at < now`
- Expira automaticamente os trials vencidos
- Volta o usuário para o plano gratuito
- Loga todas as ações para auditoria

**`getTrialInfo(userId)`**
- Retorna informações completas sobre o trial do usuário
- Status atual, dias restantes, etc.

**`forceExpireTrial(userId)`**
- Força a expiração de um trial (útil para testes/admin)

**`getTrialStats()`**
- Retorna estatísticas sobre trials (conversão, ativos, etc.)

### 4. **Endpoints da API**

#### `POST /api/auth/start-trial`
Inicia um trial de 7 dias (requer autenticação)

**Request:**
```json
{
  "planType": "pro" // ou "advanced"
}
```

**Response Sucesso:**
```json
{
  "success": true,
  "message": "Trial iniciado com sucesso",
  "data": {
    "planType": "pro",
    "subscriptionStatus": "trial",
    "trialEndsAt": "2025-12-23T15:30:00.000Z",
    "trialDaysRemaining": 7
  }
}
```

**Response Erro:**
```json
{
  "statusCode": 400,
  "message": "Trial já foi utilizado anteriormente"
}
```

#### `GET /api/auth/trial-info`
Obtém informações sobre o trial do usuário (requer autenticação)

**Response:**
```json
{
  "success": true,
  "data": {
    "isOnTrial": true,
    "isTrialExpired": false,
    "trialDaysRemaining": 5,
    "canStartTrial": false,
    "trialEndsAt": "2025-12-23T15:30:00.000Z",
    "planType": "pro"
  }
}
```

#### `GET /api/auth/can-start-trial`
Verifica se o usuário pode iniciar um trial (requer autenticação)

**Response:**
```json
{
  "success": true,
  "canStartTrial": true
}
```

## 🔄 Fluxo Completo do Trial

### 1. **Início do Trial**
```
Usuário no plano gratuito
  ↓
Clica em "Testar Pro/Premium por 7 dias"
  ↓
Frontend chama POST /api/auth/start-trial
  ↓
Backend valida e cria trial
  ↓
Usuário tem acesso total ao plano por 7 dias
```

### 2. **Durante o Trial**
- Usuário tem acesso a todos os recursos do plano escolhido
- Frontend mostra banner com dias restantes
- A cada login, verifica se trial ainda está válido

### 3. **Expiração Automática**
```
Job roda diariamente às 00:00
  ↓
Busca trials com trial_ends_at < now
  ↓
Para cada usuário:
  - Muda plan_type para "gratuito"
  - Muda subscription_status para "active"
  - Remove trial_started_at e trial_ends_at
  - Mantém trial_used = true (não pode usar novamente)
  ↓
Usuário volta ao plano gratuito automaticamente
```

## 🧪 Como Testar

### 1. **Teste Manual com cURL**

```bash
# 1. Login (obtenha o token)
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"seu@email.com","password":"senha"}' \
  | jq -r '.access_token')

# 2. Verificar se pode iniciar trial
curl -X GET http://localhost:3000/api/auth/can-start-trial \
  -H "Authorization: Bearer $TOKEN"

# 3. Iniciar trial do plano Pro
curl -X POST http://localhost:3000/api/auth/start-trial \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"planType":"pro"}'

# 4. Verificar informações do trial
curl -X GET http://localhost:3000/api/auth/trial-info \
  -H "Authorization: Bearer $TOKEN"
```

### 2. **Teste do Job de Expiração**

Para testar a expiração automática sem esperar 7 dias:

```typescript
// No TrialService, temporariamente mude o job para executar a cada minuto
@Cron('*/1 * * * *') // Executa a cada minuto
async expireTrials() { ... }

// Ou force a expiração via código:
const user = await userRepository.findOne({ where: { id: userId } });
user.trialEndsAt = new Date(Date.now() - 1000); // 1 segundo atrás
await userRepository.save(user);
// Aguarde o job rodar ou chame manualmente
await trialService.expireTrials();
```

## 📊 Monitoramento

### Verificar Trials Ativos no Banco

```sql
-- Usuários em trial
SELECT id, email, plan_type, trial_ends_at, 
       AGE(trial_ends_at, NOW()) as tempo_restante
FROM users 
WHERE subscription_status = 'trial'
ORDER BY trial_ends_at ASC;

-- Usuários que já usaram trial
SELECT COUNT(*) as total_trials_usados
FROM users 
WHERE trial_used = true;

-- Trials expirados hoje
SELECT COUNT(*) as expirados_hoje
FROM users 
WHERE subscription_status = 'active'
  AND plan_type = 'gratuito'
  AND trial_used = true
  AND DATE(updated_at) = CURRENT_DATE;
```

### Logs do Sistema

O TrialService registra logs detalhados:

```
✅ Trial iniciado para usuário teste@email.com - Plano: pro - Expira em: 2025-12-23T15:30:00.000Z
🔄 Iniciando verificação de trials expirados...
⚠️  Encontrados 3 trials expirados
⏰ Expirando trial do usuário: user@email.com (ID: xxx) - Plano: pro
✅ Trial expirado para user@email.com - Voltou para plano gratuito
```

## 🔐 Segurança e Validações

1. **Não pode usar trial duas vezes**: Flag `trial_used` é permanente
2. **Validação de status**: Não permite trial se já está em trial ou assinatura paga
3. **Expiração garantida**: Job automático roda independente de login do usuário
4. **Auditoria completa**: Todos os campos datados (started_at, ends_at)

## 🎨 Integração com Frontend

O frontend precisa atualizar para usar os endpoints do backend:

```typescript
// SubscriptionContext.tsx - ATUALIZAR

const startTrial = async (planType: 'pro' | 'advanced') => {
  const response = await api.post('/auth/start-trial', { planType });
  if (response.data.success) {
    // Atualizar estado local
    await fetchTrialInfo();
  }
  return response.data.success;
};

const fetchTrialInfo = async () => {
  const response = await api.get('/auth/trial-info');
  setSubscription(response.data.data);
};
```

## 📈 Próximos Passos (Sugestões)

1. **Notificações**:
   - Email quando trial inicia
   - Email 2 dias antes de expirar
   - Email quando trial expira

2. **Analytics**:
   - Taxa de conversão trial → assinatura
   - Plano mais testado
   - Tempo médio de decisão

3. **Upgrade durante trial**:
   - Permitir upgrade para assinatura paga durante trial
   - Manter dias restantes como bonus

## ✅ Status Final

- ✅ Migration criada e executada
- ✅ Entidade User atualizada
- ✅ TrialService implementado
- ✅ Job automático de expiração (00:00 diariamente)
- ✅ Endpoints da API criados
- ✅ Validações e segurança
- ✅ Logs e auditoria
- ✅ Backend rodando sem erros

**O sistema está 100% funcional e pronto para uso em produção!** 🎉

