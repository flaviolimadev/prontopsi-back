import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}

export interface EmailTemplate {
  name: string;
  subject: string;
  html: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private resend: Resend;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  /**
   * Envia um email usando o Resend
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const { to, subject, html, from, replyTo } = options;

      const result = await this.resend.emails.send({
        from: from || process.env.RESEND_FROM_EMAIL || 'noreply@prontupsi.com',
        to: [to],
        subject,
        html,
        replyTo: replyTo || process.env.RESEND_REPLY_TO,
      });

      this.logger.log(`Email enviado com sucesso para: ${to}`);
      this.logger.debug(`Email ID: ${result.data?.id}`);
      
      return true;
    } catch (error) {
      this.logger.error(`Erro ao enviar email para ${options.to}:`, error);
      return false;
    }
  }

  /**
   * Envia email de boas-vindas para novos usuários
   */
  async sendWelcomeEmail(userEmail: string, userName: string): Promise<boolean> {
    const subject = 'Bem-vindo ao ProntuPsi! 🎉';
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Bem-vindo ao ProntuPsi</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Bem-vindo ao ProntuPsi!</h1>
              <p>Sua jornada para uma gestão psicológica mais eficiente começa agora</p>
            </div>
            <div class="content">
              <h2>Olá, ${userName}!</h2>
              <p>Estamos muito felizes em tê-lo conosco! O ProntuPsi foi desenvolvido para transformar a forma como você gerencia seu consultório psicológico.</p>
              
              <h3>🚀 O que você pode fazer agora:</h3>
              <ul>
                <li>📋 Gerenciar prontuários de forma segura e organizada</li>
                <li>📅 Agendar sessões com facilidade</li>
                <li>💰 Controlar pagamentos e financeiro</li>
                <li>📊 Gerar relatórios detalhados</li>
                <li>📱 Acessar de qualquer dispositivo</li>
              </ul>

              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'https://app.prontupsi.com'}" class="button">
                  Acessar Minha Conta
                </a>
              </div>

              <h3>💡 Dicas para começar:</h3>
              <ol>
                <li>Complete seu perfil profissional</li>
                <li>Adicione seus primeiros pacientes</li>
                <li>Configure sua agenda de atendimento</li>
                <li>Explore os recursos disponíveis</li>
              </ol>

              <p><strong>Precisa de ajuda?</strong> Nossa equipe está sempre disponível para auxiliá-lo. Basta responder este email ou entrar em contato através do chat em nossa plataforma.</p>
            </div>
            <div class="footer">
              <p>© 2024 ProntuPsi. Todos os direitos reservados.</p>
              <p>Este email foi enviado para ${userEmail}</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({ to: userEmail, subject, html });
  }

  /**
   * Envia código de verificação de email
   */
  async sendEmailVerificationCode(userEmail: string, userName: string, verificationCode: string): Promise<boolean> {
    const subject = '🔐 Código de Verificação - ProntuPsi';
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Código de Verificação</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .verification-code { background: #e3f2fd; border: 2px solid #2196f3; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center; }
            .code { font-size: 32px; font-weight: bold; color: #2196f3; letter-spacing: 5px; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Verificação de Email</h1>
              <p>ProntuPsi - Sistema de Gestão Psicológica</p>
            </div>
            <div class="content">
              <h2>Olá, ${userName}!</h2>
              <p>Para completar seu cadastro no ProntuPsi, precisamos verificar seu endereço de email.</p>
              
              <div class="verification-code">
                <h3>Seu código de verificação:</h3>
                <div class="code">${verificationCode}</div>
                <p>Digite este código na tela de verificação para ativar sua conta.</p>
              </div>

              <div class="warning">
                <strong>⚠️ Importante:</strong>
                <ul>
                  <li>Este código é válido por 10 minutos</li>
                  <li>Não compartilhe este código com outras pessoas</li>
                  <li>Se você não solicitou esta verificação, ignore este email</li>
                </ul>
              </div>

              <p><strong>Problemas com o código?</strong> Você pode solicitar um novo código na tela de verificação.</p>
            </div>
            <div class="footer">
              <p>© 2024 ProntuPsi. Todos os direitos reservados.</p>
              <p>Este email foi enviado para ${userEmail}</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({ to: userEmail, subject, html });
  }

  /**
   * Envia email de recuperação de senha
   */
  async sendPasswordResetEmail(userEmail: string, resetToken: string, userName: string): Promise<boolean> {
    const resetUrl = `${process.env.FRONTEND_URL || 'https://app.prontupsi.com'}/reset-password?token=${resetToken}`;
    const subject = '🔐 Recuperação de Senha - ProntuPsi';
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Recuperação de Senha</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Recuperação de Senha</h1>
              <p>ProntuPsi - Sistema de Gestão Psicológica</p>
            </div>
            <div class="content">
              <h2>Olá, ${userName}!</h2>
              <p>Recebemos uma solicitação para redefinir sua senha no ProntuPsi.</p>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">
                  Redefinir Minha Senha
                </a>
              </div>

              <div class="warning">
                <strong>⚠️ Importante:</strong>
                <ul>
                  <li>Este link é válido por 1 hora</li>
                  <li>Se você não solicitou esta recuperação, ignore este email</li>
                  <li>Nunca compartilhe este link com outras pessoas</li>
                </ul>
              </div>

              <p>Se o botão não funcionar, copie e cole este link no seu navegador:</p>
              <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>

              <p><strong>Precisa de ajuda?</strong> Entre em contato conosco respondendo este email.</p>
            </div>
            <div class="footer">
              <p>© 2024 ProntuPsi. Todos os direitos reservados.</p>
              <p>Este email foi enviado para ${userEmail}</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({ to: userEmail, subject, html });
  }

  /**
   * Envia email de confirmação de agendamento
   */
  async sendAppointmentConfirmation(
    userEmail: string, 
    userName: string, 
    patientName: string, 
    appointmentDate: string, 
    appointmentTime: string
  ): Promise<boolean> {
    const subject = '📅 Confirmação de Agendamento - ProntuPsi';
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Confirmação de Agendamento</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .appointment-details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #667eea; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📅 Agendamento Confirmado</h1>
              <p>ProntuPsi - Sistema de Gestão Psicológica</p>
            </div>
            <div class="content">
              <h2>Olá, ${userName}!</h2>
              <p>Seu agendamento foi confirmado com sucesso.</p>
              
              <div class="appointment-details">
                <h3>📋 Detalhes do Agendamento:</h3>
                <p><strong>Paciente:</strong> ${patientName}</p>
                <p><strong>Data:</strong> ${appointmentDate}</p>
                <p><strong>Horário:</strong> ${appointmentTime}</p>
              </div>

              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'https://app.prontupsi.com'}/agenda" class="button">
                  Ver Minha Agenda
                </a>
              </div>

              <p><strong>Lembrete:</strong> Você receberá um lembrete 24 horas antes da sessão.</p>
              
              <p><strong>Precisa alterar o agendamento?</strong> Acesse sua agenda e faça as alterações necessárias.</p>
            </div>
            <div class="footer">
              <p>© 2024 ProntuPsi. Todos os direitos reservados.</p>
              <p>Este email foi enviado para ${userEmail}</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({ to: userEmail, subject, html });
  }

  /**
   * Envia email de lembrete de sessão
   */
  async sendSessionReminder(
    userEmail: string, 
    userName: string, 
    patientName: string, 
    appointmentDate: string, 
    appointmentTime: string
  ): Promise<boolean> {
    const subject = '⏰ Lembrete de Sessão - ProntuPsi';
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Lembrete de Sessão</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .reminder { background: #e3f2fd; border: 1px solid #2196f3; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⏰ Lembrete de Sessão</h1>
              <p>ProntuPsi - Sistema de Gestão Psicológica</p>
            </div>
            <div class="content">
              <h2>Olá, ${userName}!</h2>
              <p>Você tem uma sessão agendada para amanhã.</p>
              
              <div class="reminder">
                <h3>📅 Sessão Agendada:</h3>
                <p><strong>Paciente:</strong> ${patientName}</p>
                <p><strong>Data:</strong> ${appointmentDate}</p>
                <p><strong>Horário:</strong> ${appointmentTime}</p>
              </div>

              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'https://app.prontupsi.com'}/agenda" class="button">
                  Ver Detalhes da Sessão
                </a>
              </div>

              <p><strong>Dica:</strong> Prepare o prontuário do paciente com antecedência para otimizar o tempo da sessão.</p>
            </div>
            <div class="footer">
              <p>© 2024 ProntuPsi. Todos os direitos reservados.</p>
              <p>Este email foi enviado para ${userEmail}</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({ to: userEmail, subject, html });
  }

  /**
   * Envia email de notificação de pagamento
   */
  async sendPaymentNotification(
    userEmail: string, 
    userName: string, 
    patientName: string, 
    amount: string, 
    paymentDate: string
  ): Promise<boolean> {
    const subject = '💰 Notificação de Pagamento - ProntuPsi';
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Notificação de Pagamento</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .payment { background: #e8f5e8; border: 1px solid #4caf50; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💰 Pagamento Recebido</h1>
              <p>ProntuPsi - Sistema de Gestão Psicológica</p>
            </div>
            <div class="content">
              <h2>Olá, ${userName}!</h2>
              <p>Um pagamento foi registrado em sua conta.</p>
              
              <div class="payment">
                <h3>💳 Detalhes do Pagamento:</h3>
                <p><strong>Paciente:</strong> ${patientName}</p>
                <p><strong>Valor:</strong> ${amount}</p>
                <p><strong>Data:</strong> ${paymentDate}</p>
              </div>

              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'https://app.prontupsi.com'}/financeiro" class="button">
                  Ver Financeiro
                </a>
              </div>

              <p><strong>Dica:</strong> Mantenha seus registros financeiros sempre atualizados para um melhor controle.</p>
            </div>
            <div class="footer">
              <p>© 2024 ProntuPsi. Todos os direitos reservados.</p>
              <p>Este email foi enviado para ${userEmail}</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({ to: userEmail, subject, html });
  }
}
