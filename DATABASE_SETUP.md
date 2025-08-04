# Configuração do Banco de Dados - ProntoPsi Backend

## Pré-requisitos

1. **PostgreSQL** instalado (versão 12 ou superior)
2. **Node.js** (versão 18 ou superior)
3. **npm** para gerenciar dependências

## Configuração Inicial

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
# Configurações do Banco de Dados PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=prontopsi_db
DB_USER=postgres
DB_PASSWORD=sua_senha_aqui

# Configurações da Aplicação
PORT=3001
JWT_SECRET=your-super-secret-jwt-key-here
NODE_ENV=development
```

### 3. Criar Banco de Dados

```bash
# Conectar ao PostgreSQL
psql -U postgres

# Criar o banco de dados
CREATE DATABASE prontopsi_db;

# Verificar se foi criado
\l

# Sair do psql
\q
```

## Comandos de Migration

### Gerar Migration
```bash
npm run migration:generate -- src/migrations/NomeDaMigration
```

### Executar Migrations
```bash
npm run migration:run
```

### Reverter Última Migration
```bash
npm run migration:revert
```

### Sincronizar Schema (apenas desenvolvimento)
```bash
npm run schema:sync
```

### Dropar Schema (cuidado!)
```bash
npm run schema:drop
```

## Estrutura de Pastas

```
src/
├── entities/          # Entidades TypeORM
├── migrations/        # Migrations do banco
└── config/
    └── database.config.ts  # Configuração do TypeORM
```

## Desenvolvimento

### Iniciar em Modo Desenvolvimento
```bash
npm run start:dev
```

### Build para Produção
```bash
npm run build
npm run start:prod
```

## Troubleshooting

### Erro de Conexão
- Verifique se o PostgreSQL está rodando
- Confirme as credenciais no arquivo `.env`
- Verifique se a porta 5432 está livre

### Erro de Migration
- Verifique se o banco de dados existe
- Confirme se as entidades estão corretas
- Execute `npm run schema:sync` para sincronizar

### Reset Completo (Desenvolvimento)
```bash
# Dropar schema
npm run schema:drop

# Recriar schema
npm run schema:sync

# Ou executar migrations
npm run migration:run
```

## Próximos Passos

1. Criar entidades baseadas no frontend
2. Gerar migrations iniciais
3. Implementar controllers e serviços
4. Configurar autenticação JWT
5. Implementar APIs REST 