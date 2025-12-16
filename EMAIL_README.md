# 📧 Sistema de Email - ProntuPsi

## 🚀 Visão Geral

O sistema de email do ProntuPsi utiliza o **Resend.com** para envio de emails transacionais e notificações. O sistema está configurado para enviar emails automáticos em diferentes situações da aplicação.

## 📋 Funcionalidades Implementadas

### ✅ Tipos de Email Disponíveis

1. **Email de Boas-vindas** - Enviado quando um usuário se registra
2. **Recuperação de Senha** - Enviado quando usuário solicita reset de senha
3. **Confirmação de Agendamento** - Enviado quando uma sessão é agendada
4. **Lembrete de Sessão** - Enviado 24h antes da sessão
5. **Notificação de Pagamento** - Enviado quando um pagamento é registrado
6. **Email Personalizado** - Para envio de emails customizados

### ✅ Templates HTML Responsivos

- Design moderno e profissional
- Compatível com diferentes clientes de email
- Templates em português brasileiro
- Links para a aplicação integrados

## 🛠️ Configuração

### 1. Instalar Dependências

```bash
# Executar o script de instalação
chmod +x install-resend.sh
./install-resend.sh

# Ou instalar manualmente
npm install resend @types/nodemailer
```

### 2. Configurar Variáveis de Ambiente

Adicione ao seu arquivo `.env`:

```env
# Resend Email Configuration
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@prontupsi.com
RESEND_REPLY_TO=suporte@prontupsi.com

# Frontend URL (para links nos emails)
FRONTEND_URL=http://localhost:8080
```

### 3. Obter API Key do Resend

1. Acesse [resend.com](https://resend.com)
2. Crie uma conta gratuita
3. Vá para "API Keys" no dashboard
4. Crie uma nova API Key
5. Copie a chave e adicione ao `.env`

## 🧪 Testando o Sistema

### 1. Executar Script de Teste

```bash
# Editar o arquivo de teste primeiro
nano test-email-setup.js

# Configurar seu email de teste
const TEST_EMAIL = 'seu-email@exemplo.com';

# Executar os testes
node test-email-setup.js
```

### 2. Testar via API

```bash
# Fazer login para obter token
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "seu-email@exemplo.com", "password": "sua-senha"}'

# Testar email de boas-vindas
curl -X POST http://localhost:3000/email/test \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "teste@exemplo.com",
    "type": "welcome"
  }'
```

## 📁 Estrutura de Arquivos

```
src/
├── services/
│   └── email.service.ts          # Serviço principal de email
├── email/
│   ├── email.module.ts           # Módulo de email
│   └── email.controller.ts       # Controller para testes
└── auth/
    └── auth.service.example.ts   # Exemplo de integração

# Arquivos de configuração
├── RESEND_SETUP.md              # Documentação completa
├── EMAIL_README.md              # Este arquivo
├── install-resend.sh            # Script de instalação
└── test-email-setup.js          # Script de teste
```

## 🔧 Integração com Outros Módulos

### Exemplo: Integrar com AuthService

```typescript
// auth.service.ts
import { EmailService } from '../services/email.service';

@Injectable()
export class AuthService {
  constructor(
    private emailService: EmailService,
    // ... outros serviços
  ) {}

  async register(createUserDto: CreateUserDto) {
    // ... lógica de registro
    
    // Enviar email de boas-vindas
    await this.emailService.sendWelcomeEmail(
      savedUser.email,
      savedUser.nome
    );
  }
}
```

### Exemplo: Integrar com AgendaSessoesService

```typescript
// agenda-sessoes.service.ts
import { EmailService } from '../services/email.service';

@Injectable()
export class AgendaSessoesService {
  constructor(
    private emailService: EmailService,
    // ... outros serviços
  ) {}

  async createAppointment(dto: CreateAgendaSessaoDto) {
    // ... criar agendamento
    
    // Enviar confirmação
    await this.emailService.sendAppointmentConfirmation(
      user.email,
      user.nome,
      paciente.nome,
      appointmentDate,
      appointmentTime
    );
  }
}
```

## 📊 Endpoints Disponíveis

### POST `/email/test`
Testa diferentes tipos de email.

**Body:**
```json
{
  "to": "email@exemplo.com",
  "type": "welcome|password-reset|appointment|reminder|payment",
  "data": {
    "patientName": "Nome do Paciente",
    "appointmentDate": "2024-01-15",
    "appointmentTime": "14:00",
    "amount": "R$ 150,00",
    "paymentDate": "2024-01-15"
  }
}
```

### POST `/email/custom`
Envia email personalizado.

**Body:**
```json
{
  "to": "email@exemplo.com",
  "subject": "Assunto do Email",
  "html": "<h1>Conteúdo HTML</h1>"
}
```

## 🎨 Personalização de Templates

### Modificar Templates

Os templates estão no arquivo `email.service.ts`. Para personalizar:

1. Localize o método desejado (ex: `sendWelcomeEmail`)
2. Modifique o HTML dentro da string template
3. Teste o novo template

### Adicionar Novos Templates

```typescript
// email.service.ts
async sendNewTemplate(userEmail: string, userName: string): Promise<boolean> {
  const subject = 'Novo Template - ProntuPsi';
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Novo Template</title>
      </head>
      <body>
        <h1>Olá, ${userName}!</h1>
        <p>Conteúdo do novo template...</p>
      </body>
    </html>
  `;

  return this.sendEmail({ to: userEmail, subject, html });
}
```

## 🔒 Segurança

- ✅ API Key protegida em variáveis de ambiente
- ✅ Autenticação JWT obrigatória para endpoints
- ✅ Validação de entrada nos controllers
- ✅ Tratamento de erros robusto
- ✅ Logs detalhados para debugging

## 📈 Monitoramento

### Logs do Sistema

O sistema registra:
- ✅ Emails enviados com sucesso
- ✅ Erros de envio
- ✅ IDs dos emails (para rastreamento)
- ✅ Tentativas de envio

### Dashboard do Resend

Acesse o dashboard do Resend para:
- 📊 Estatísticas de envio
- 📈 Taxa de entrega
- 📧 Logs detalhados
- 🚫 Relatórios de bounce/spam

## 🚀 Próximos Passos

1. **Configurar Resend.com** com sua API Key
2. **Testar todos os templates** usando o script de teste
3. **Integrar com módulos existentes** (Auth, Agenda, etc.)
4. **Configurar domínio personalizado** (opcional)
5. **Implementar filas** para envio em lote (opcional)
6. **Adicionar mais templates** conforme necessário

## 🆘 Troubleshooting

### Erro: "Invalid API Key"
- Verifique se a `RESEND_API_KEY` está correta
- Confirme se a chave está ativa no dashboard do Resend

### Erro: "Domain not verified"
- Use o domínio de teste do Resend ou
- Configure seu próprio domínio no dashboard

### Emails não chegam
- Verifique a pasta de spam
- Confirme se o email de destino está correto
- Verifique os logs do Resend

### Erro de CORS
- Configure o `FRONTEND_URL` corretamente
- Verifique se o frontend está rodando

## 📞 Suporte

Para dúvidas sobre:
- **Resend.com**: [Documentação oficial](https://resend.com/docs)
- **NestJS**: [Documentação oficial](https://docs.nestjs.com)
- **ProntuPsi**: Consulte a documentação do projeto
