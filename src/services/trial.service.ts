import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { User } from '../entities/user.entity';

@Injectable()
export class TrialService {
  private readonly logger = new Logger(TrialService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Inicia um período de trial de 7 dias para um usuário
   */
  async startTrial(userId: string, planType: 'pro' | 'advanced'): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    if (user.trialUsed) {
      throw new Error('Trial já foi utilizado anteriormente');
    }

    if (user.subscriptionStatus === 'trial') {
      throw new Error('Já está em período de trial');
    }

    if (user.subscriptionStatus === 'paid') {
      throw new Error('Já possui uma assinatura ativa');
    }

    const now = new Date();
    const trialEndsAt = new Date(now);
    trialEndsAt.setDate(trialEndsAt.getDate() + 7); // 7 dias de trial

    user.planType = planType;
    user.subscriptionStatus = 'trial';
    user.trialStartedAt = now;
    user.trialEndsAt = trialEndsAt;
    user.trialUsed = true;

    await this.userRepository.save(user);

    this.logger.log(
      `✅ Trial iniciado para usuário ${user.email} - Plano: ${planType} - Expira em: ${trialEndsAt.toISOString()}`,
    );

    return user;
  }

  /**
   * Verifica se um usuário pode iniciar um trial
   */
  async canStartTrial(userId: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      return false;
    }

    return user.canStartTrial();
  }

  /**
   * Expira todos os trials que venceram
   * Executa diariamente às 00:00
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async expireTrials() {
    this.logger.log('🔄 Iniciando verificação de trials expirados...');

    try {
      const now = new Date();

      // Buscar todos os usuários com trial expirado
      const expiredTrialUsers = await this.userRepository.find({
        where: {
          subscriptionStatus: 'trial',
          trialEndsAt: LessThan(now),
        },
      });

      if (expiredTrialUsers.length === 0) {
        this.logger.log('✅ Nenhum trial expirado encontrado');
        return;
      }

      this.logger.log(`⚠️  Encontrados ${expiredTrialUsers.length} trials expirados`);

      // Expirar cada trial
      for (const user of expiredTrialUsers) {
        await this.expireUserTrial(user);
      }

      this.logger.log(`✅ ${expiredTrialUsers.length} trials expirados com sucesso`);
    } catch (error) {
      this.logger.error('❌ Erro ao expirar trials:', error);
    }
  }

  /**
   * Expira o trial de um usuário específico
   */
  async expireUserTrial(user: User): Promise<User> {
    this.logger.log(
      `⏰ Expirando trial do usuário: ${user.email} (ID: ${user.id}) - Plano: ${user.planType}`,
    );

    // Volta para o plano gratuito
    user.planType = 'gratuito';
    user.subscriptionStatus = 'active';
    user.trialStartedAt = null;
    user.trialEndsAt = null;

    await this.userRepository.save(user);

    this.logger.log(`✅ Trial expirado para ${user.email} - Voltou para plano gratuito`);

    // TODO: Aqui você pode adicionar lógica para:
    // - Enviar email notificando que o trial expirou
    // - Criar notificação no sistema
    // - Registrar evento em sistema de analytics

    return user;
  }

  /**
   * Obtém informações sobre o trial de um usuário
   */
  async getTrialInfo(userId: string): Promise<{
    isOnTrial: boolean;
    isTrialExpired: boolean;
    trialDaysRemaining: number;
    canStartTrial: boolean;
    trialEndsAt: Date | null;
    planType: string;
    trial_used: boolean;
  }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    const info = {
      isOnTrial: user.isOnTrial(),
      isTrialExpired: user.isTrialExpired(),
      trialDaysRemaining: user.getTrialDaysRemaining(),
      canStartTrial: user.canStartTrial(),
      trialEndsAt: user.trialEndsAt,
      planType: user.planType,
      trial_used: user.trialUsed,
    };

    this.logger.log(`📊 TrialService.getTrialInfo para ${user.email}:`);
    this.logger.log(`   - planType: ${info.planType}`);
    this.logger.log(`   - subscriptionStatus: ${user.subscriptionStatus}`);
    this.logger.log(`   - isOnTrial: ${info.isOnTrial}`);
    this.logger.log(`   - trialDaysRemaining: ${info.trialDaysRemaining}`);
    this.logger.log(`   - trialEndsAt: ${info.trialEndsAt}`);

    return info;
  }

  /**
   * Força a expiração de um trial (para testes ou admin)
   */
  async forceExpireTrial(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    if (user.subscriptionStatus !== 'trial') {
      throw new Error('Usuário não está em período de trial');
    }

    return await this.expireUserTrial(user);
  }

  /**
   * Lista todos os usuários em trial (para admin)
   */
  async listActiveTrials(): Promise<User[]> {
    return await this.userRepository.find({
      where: {
        subscriptionStatus: 'trial',
      },
      order: {
        trialEndsAt: 'ASC',
      },
    });
  }

  /**
   * Obtém estatísticas de trials
   */
  async getTrialStats(): Promise<{
    activeTrials: number;
    expiredTrials: number;
    usersWhoUsedTrial: number;
    conversationRate: number;
  }> {
    const activeTrials = await this.userRepository.count({
      where: { subscriptionStatus: 'trial' },
    });

    const usersWhoUsedTrial = await this.userRepository.count({
      where: { trialUsed: true },
    });

    const convertedToPaid = await this.userRepository.count({
      where: {
        trialUsed: true,
        subscriptionStatus: 'paid',
      },
    });

    const conversationRate =
      usersWhoUsedTrial > 0 ? (convertedToPaid / usersWhoUsedTrial) * 100 : 0;

    return {
      activeTrials,
      expiredTrials: usersWhoUsedTrial - activeTrials,
      usersWhoUsedTrial,
      conversationRate,
    };
  }
}

