import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EfiPixService } from './efi-pix.service';

@Injectable()
export class PixSyncCron {
  private readonly logger = new Logger(PixSyncCron.name);

  constructor(private readonly efiPixService: EfiPixService) {}

  /**
   * Sincroniza transações pendentes a cada 5 minutos
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async syncPendingTransactions() {
    try {
      this.logger.log('Iniciando sincronização automática de transações Pix...');
      
      const result = await this.efiPixService.syncPixTransactions();
      
      this.logger.log(
        `Sincronização concluída: ${result.data?.synced || 0} sincronizadas, ${result.data?.updated || 0} atualizadas, ${result.data?.errors || 0} erros`
      );
    } catch (error) {
      this.logger.error('Erro na sincronização automática:', error.message);
    }
  }

  /**
   * Marca transações expiradas a cada hora
   */
  @Cron(CronExpression.EVERY_HOUR)
  async markExpiredTransactions() {
    try {
      this.logger.log('Verificando transações expiradas...');
      
      const count = await this.efiPixService.markExpiredTransactions();
      
      if (count > 0) {
        this.logger.log(`${count} transações marcadas como expiradas`);
      }
    } catch (error) {
      this.logger.error('Erro ao marcar transações expiradas:', error.message);
    }
  }

  /**
   * Verifica status da API Efí a cada 30 minutos
   */
  @Cron('0 */30 * * * *')
  async checkApiStatus() {
    try {
      this.logger.log('Verificando status da API Efí...');
      
      // Usar o novo método checkStatus
      const status = await this.efiPixService.checkStatus();
      
      if (status.status === 'online') {
        this.logger.log('✅ API Efí funcionando normalmente');
      } else {
        this.logger.warn(`⚠️ API Efí com problemas: ${status.message}`);
      }
    } catch (error) {
      this.logger.error('❌ Erro ao verificar status da API Efí:', error.message);
    }
  }
}
