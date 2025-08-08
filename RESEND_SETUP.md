# Configuração do Resend.com para Envio de Emails

## 📧 Configuração do Resend.com

### 1. Criar conta no Resend.com
1. Acesse [resend.com](https://resend.com)
2. Crie uma conta gratuita
3. Verifique seu domínio ou use o domínio de teste do Resend

### 2. Obter API Key
1. No dashboard do Resend, vá para "API Keys"
2. Crie uma nova API Key
3. Copie a chave gerada

### 3. Configurar Variáveis de Ambiente

Adicione as seguintes variáveis ao seu arquivo `.env`:

```env
# Resend Email Configuration
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@prontupsi.com
RESEND_REPLY_TO=suporte@prontupsi.com

# Frontend URL (para links nos emails)
FRONTEND_URL=http://localhost:8080
```

### 4. Configurar Domínio (Opcional)

Para usar seu próprio domínio:
1. No Resend, vá para "Domains"
2. Adicione seu domínio
3. Configure os registros DNS conforme instruído
4. Aguarde a verificação

### 5. Testar o Envio

Use os endpoints de teste:

```bash
# Testar email de boas-vindas
curl -X POST http://localhost:3000/email/test \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "seu-email@exemplo.com",
    "type": "welcome"
  }'

# Testar email de recuperação de senha
curl -X POST http://localhost:3000/email/test \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "seu-email@exemplo.com",
    "type": "password-reset"
  }'

# Testar email de confirmação de agendamento
curl -X POST http://localhost:3000/email/test \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "seu-email@exemplo.com",
    "type": "appointment",
    "data": {
      "patientName": "João Silva",
      "appointmentDate": "2024-01-15",
      "appointmentTime": "14:00"
    }
  }'
```

## 📋 Tipos de Email Disponíveis

### 1. Email de Boas-vindas
- **Endpoint**: `POST /email/test`
- **Tipo**: `welcome`
- **Uso**: Enviado quando um usuário se registra

### 2. Recuperação de Senha
- **Endpoint**: `POST /email/test`
- **Tipo**: `password-reset`
- **Uso**: Enviado quando usuário solicita recuperação de senha

### 3. Confirmação de Agendamento
- **Endpoint**: `POST /email/test`
- **Tipo**: `appointment`
- **Dados**: `patientName`, `appointmentDate`, `appointmentTime`

### 4. Lembrete de Sessão
- **Endpoint**: `POST /email/test`
- **Tipo**: `reminder`
- **Dados**: `patientName`, `appointmentDate`, `appointmentTime`

### 5. Notificação de Pagamento
- **Endpoint**: `POST /email/test`
- **Tipo**: `payment`
- **Dados**: `patientName`, `amount`, `paymentDate`

### 6. Email Personalizado
- **Endpoint**: `POST /email/custom`
- **Dados**: `to`, `subject`, `html`

## 🔧 Integração com Outros Módulos

### Exemplo de uso no AuthService:

```typescript
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
      createUserDto.email,
      createUserDto.nome
    );
  }

  async requestPasswordReset(email: string) {
    // ... gerar token de reset
    
    // Enviar email de recuperação
    await this.emailService.sendPasswordResetEmail(
      email,
      resetToken,
      user.nome
    );
  }
}
```

### Exemplo de uso no AgendaSessoesService:

```typescript
import { EmailService } from '../services/email.service';

@Injectable()
export class AgendaSessoesService {
  constructor(
    private emailService: EmailService,
    // ... outros serviços
  ) {}

  async createAppointment(createAppointmentDto: CreateAgendaSessaoDto) {
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

## 🚀 Próximos Passos

1. **Configurar Resend.com** com sua API Key
2. **Testar os endpoints** de email
3. **Integrar com os módulos** existentes
4. **Configurar templates** personalizados se necessário
5. **Implementar filas** para envio em lote (opcional)

## 📊 Monitoramento

O Resend.com oferece:
- Dashboard com estatísticas de envio
- Logs detalhados de cada email
- Taxa de entrega e abertura
- Relatórios de bounce e spam

## 🔒 Segurança

- Nunca exponha sua API Key no frontend
- Use variáveis de ambiente
- Configure rate limiting se necessário
- Monitore logs de erro
