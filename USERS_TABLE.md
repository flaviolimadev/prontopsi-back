# Tabela Users - ProntoPsi

## Estrutura da Tabela

A tabela `users` armazena informações dos usuários do sistema ProntoPsi.

### Campos

| Campo | Tipo | Tamanho | Nullable | Default | Descrição |
|-------|------|---------|----------|---------|-----------|
| `id` | UUID | - | ❌ | `uuid_generate_v4()` | Chave primária |
| `nome` | VARCHAR | 100 | ❌ | - | Nome do usuário |
| `sobrenome` | VARCHAR | 100 | ❌ | - | Sobrenome do usuário |
| `email` | VARCHAR | 255 | ❌ | - | Email único do usuário |
| `code` | VARCHAR | 20 | ❌ | - | Código único gerado automaticamente |
| `contato` | VARCHAR | 20 | ✅ | NULL | Telefone/WhatsApp |
| `password` | VARCHAR | 255 | ❌ | - | Senha criptografada |
| `status` | INT | - | ❌ | 1 | Status do usuário (1=ativo, 0=inativo) |
| `pontos` | INT | - | ❌ | 0 | Pontos em centavos |
| `nivel_id` | INT | - | ❌ | 1 | ID do nível do usuário |
| `plano_id` | UUID | - | ✅ | NULL | ID do plano (referência futura) |
| `avatar` | VARCHAR | 255 | ✅ | NULL | URL do avatar |
| `descricao` | TEXT | - | ✅ | NULL | Descrição do usuário |
| `referred_at` | VARCHAR | 20 | ✅ | NULL | Código do usuário que indicou |
| `created_at` | TIMESTAMP | - | ❌ | `CURRENT_TIMESTAMP` | Data de criação |
| `updated_at` | TIMESTAMP | - | ❌ | `CURRENT_TIMESTAMP` | Data de atualização |

### Índices

- **Primário**: `id`
- **Único**: `email` (IDX_USERS_EMAIL_UNIQUE)
- **Único**: `code` (IDX_USERS_CODE_UNIQUE)
- **Performance**: `status` (IDX_USERS_STATUS)
- **Performance**: `plano_id` (IDX_USERS_PLANO_ID)
- **Performance**: `referred_at` (IDX_USERS_REFERRED_AT)

## Funcionalidades Especiais

### Geração Automática de Código

O campo `code` é gerado automaticamente no formato: `eDr5-tre1-2Gtfa`
- Formato: 4 caracteres - 4 caracteres - 5 caracteres
- Geração automática via subscriber do TypeORM
- Verificação de unicidade antes da inserção

### Sistema de Pontos

- Os pontos são armazenados em **centavos** para evitar problemas de precisão
- Métodos auxiliares para conversão:
  - `pontosEmReais`: Converte centavos para reais
  - `set pontosEmReais`: Converte reais para centavos

### Sistema de Referência

- Campo `referred_at` armazena o código do usuário que fez a indicação
- Permite rastrear indicações e implementar sistema de recompensas

## Exemplos de Uso

### Criar Usuário

```typescript
const user = new User();
user.nome = 'João';
user.sobrenome = 'Silva';
user.email = 'joao@email.com';
user.password = 'senha123';
user.contato = '+55 11 99999-9999';
user.referredAt = 'eDr5-tre1-2Gtfa'; // Código do usuário que indicou

// O código será gerado automaticamente
await userRepository.save(user);
```

### Consultar Usuário

```typescript
// Por email
const user = await userRepository.findOne({ where: { email: 'joao@email.com' } });

// Por código
const user = await userRepository.findOne({ where: { code: 'eDr5-tre1-2Gtfa' } });

// Usuários ativos
const activeUsers = await userRepository.find({ where: { status: 1 } });
```

### Atualizar Pontos

```typescript
const user = await userRepository.findOne({ where: { id: userId } });

// Adicionar R$ 50,00 em pontos
user.pontosEmReais = user.pontosEmReais + 50;

await userRepository.save(user);
```

## Relacionamentos Futuros

- `plano_id` → Tabela `planos` (quando criada)
- `referred_at` → Auto-relacionamento com `users.code`
- `nivel_id` → Tabela `niveis` (quando criada)

## Validações

- Email deve ser único
- Código deve ser único
- Status deve ser 0 ou 1
- Pontos não podem ser negativos
- Nível deve ser maior que 0 