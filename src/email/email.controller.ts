import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { EmailService } from '../services/email.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface SendTestEmailDto {
  to: string;
  type: 'welcome' | 'password-reset' | 'appointment' | 'reminder' | 'payment';
  data?: any;
}

@Controller('email')
@UseGuards(JwtAuthGuard)
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('test')
  async sendTestEmail(@Body() dto: SendTestEmailDto, @Request() req) {
    const { to, type, data } = dto;
    const user = req.user;

    try {
      let success = false;

      switch (type) {
        case 'welcome':
          success = await this.emailService.sendWelcomeEmail(to, user.nome || 'Usuário');
          break;
        
        case 'password-reset':
          const resetToken = 'test-token-123';
          success = await this.emailService.sendPasswordResetEmail(to, resetToken, user.nome || 'Usuário');
          break;
        
        case 'appointment':
          success = await this.emailService.sendAppointmentConfirmation(
            to,
            user.nome || 'Usuário',
            data?.patientName || 'Paciente Teste',
            data?.appointmentDate || '2024-01-15',
            data?.appointmentTime || '14:00'
          );
          break;
        
        case 'reminder':
          success = await this.emailService.sendSessionReminder(
            to,
            user.nome || 'Usuário',
            data?.patientName || 'Paciente Teste',
            data?.appointmentDate || '2024-01-15',
            data?.appointmentTime || '14:00'
          );
          break;
        
        case 'payment':
          success = await this.emailService.sendPaymentNotification(
            to,
            user.nome || 'Usuário',
            data?.patientName || 'Paciente Teste',
            data?.amount || 'R$ 150,00',
            data?.paymentDate || '2024-01-15'
          );
          break;
        
        default:
          return { success: false, message: 'Tipo de email inválido' };
      }

      return {
        success,
        message: success ? 'Email enviado com sucesso' : 'Erro ao enviar email',
        type,
        to
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      };
    }
  }

  @Post('custom')
  async sendCustomEmail(@Body() dto: { to: string; subject: string; html: string }, @Request() req) {
    const { to, subject, html } = dto;

    try {
      const success = await this.emailService.sendEmail({
        to,
        subject,
        html
      });

      return {
        success,
        message: success ? 'Email personalizado enviado com sucesso' : 'Erro ao enviar email',
        to
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      };
    }
  }
}
