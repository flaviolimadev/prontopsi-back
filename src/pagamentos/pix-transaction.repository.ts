import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, Between, Like, In } from 'typeorm';
import { PixTransaction, PixTransactionStatus, PixTransactionType } from '../entities/pix-transaction.entity';

export interface PixTransactionFilters {
  userId?: string;
  pacienteId?: string;
  status?: PixTransactionStatus | PixTransactionStatus[];
  type?: PixTransactionType | PixTransactionType[];
  startDate?: Date;
  endDate?: Date;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface PixTransactionStats {
  total: number;
  totalValue: number;
  pending: number;
  pendingValue: number;
  paid: number;
  paidValue: number;
  expired: number;
  expiredValue: number;
  cancelled: number;
  cancelledValue: number;
  refunded: number;
  refundedValue: number;
  failed: number;
  failedValue: number;
}

@Injectable()
export class PixTransactionRepository {
  constructor(
    @InjectRepository(PixTransaction)
    private readonly repository: Repository<PixTransaction>,
  ) {}

  /**
   * Cria uma nova transação Pix
   */
  async create(transaction: Partial<PixTransaction>): Promise<PixTransaction> {
    const newTransaction = this.repository.create(transaction);
    return await this.repository.save(newTransaction);
  }

  /**
   * Busca transação por ID
   */
  async findById(id: string): Promise<PixTransaction | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['user', 'paciente'],
    });
  }

  /**
   * Busca transação por TXID da Efí
   */
  async findByTxid(txid: string): Promise<PixTransaction | null> {
    return await this.repository.findOne({
      where: { txid },
      relations: ['user', 'paciente'],
    });
  }

  /**
   * Busca transação por E2E ID
   */
  async findByE2eId(e2eId: string): Promise<PixTransaction | null> {
    return await this.repository.findOne({
      where: { e2eId },
      relations: ['user', 'paciente'],
    });
  }

  /**
   * Busca transações com filtros
   */
  async findWithFilters(filters: PixTransactionFilters): Promise<{
    transactions: PixTransaction[];
    total: number;
  }> {
    const queryBuilder = this.repository.createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.user', 'user')
      .leftJoinAndSelect('transaction.paciente', 'paciente');

    this.applyFilters(queryBuilder, filters);

    // Contar total
    const total = await queryBuilder.getCount();

    // Aplicar paginação
    if (filters.limit) {
      queryBuilder.limit(filters.limit);
    }
    if (filters.offset) {
      queryBuilder.offset(filters.offset);
    }

    // Ordenar por data de criação (mais recente primeiro)
    queryBuilder.orderBy('transaction.createdAt', 'DESC');

    const transactions = await queryBuilder.getMany();

    return { transactions, total };
  }

  /**
   * Aplica filtros ao query builder
   */
  private applyFilters(queryBuilder: SelectQueryBuilder<PixTransaction>, filters: PixTransactionFilters): void {
    if (filters.userId) {
      queryBuilder.andWhere('transaction.userId = :userId', { userId: filters.userId });
    }

    if (filters.pacienteId) {
      queryBuilder.andWhere('transaction.pacienteId = :pacienteId', { pacienteId: filters.pacienteId });
    }

    if (filters.status) {
      if (Array.isArray(filters.status)) {
        queryBuilder.andWhere('transaction.status IN (:...status)', { status: filters.status });
      } else {
        queryBuilder.andWhere('transaction.status = :status', { status: filters.status });
      }
    }

    if (filters.type) {
      if (Array.isArray(filters.type)) {
        queryBuilder.andWhere('transaction.type IN (:...type)', { type: filters.type });
      } else {
        queryBuilder.andWhere('transaction.type = :type', { type: filters.type });
      }
    }

    if (filters.startDate && filters.endDate) {
      queryBuilder.andWhere('transaction.createdAt BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
    }

    if (filters.search) {
      queryBuilder.andWhere(
        '(transaction.descricao ILIKE :search OR transaction.chave ILIKE :search OR transaction.devedor->>\'nome\' ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }
  }

  /**
   * Atualiza uma transação
   */
  async update(id: string, updates: Partial<PixTransaction>): Promise<PixTransaction | null> {
    await this.repository.update(id, updates);
    return await this.findById(id);
  }

  /**
   * Atualiza status de uma transação
   */
  async updateStatus(id: string, status: PixTransactionStatus, additionalData?: Partial<PixTransaction>): Promise<void> {
    const updateData: Partial<PixTransaction> = { status, ...additionalData };
    
    if (status === PixTransactionStatus.PAID) {
      updateData.paidAt = new Date();
    }
    
    await this.repository.update(id, updateData);
  }

  /**
   * Busca transações pendentes que expiraram
   */
  async findExpiredPendingTransactions(): Promise<PixTransaction[]> {
    const now = new Date();
    return await this.repository.find({
      where: {
        status: PixTransactionStatus.PENDING,
        expiredAt: Between(new Date(0), now),
      },
    });
  }

  /**
   * Marca transações expiradas
   */
  async markExpiredTransactions(): Promise<number> {
    const result = await this.repository.update(
      {
        status: PixTransactionStatus.PENDING,
        expiredAt: Between(new Date(0), new Date()),
      },
      { status: PixTransactionStatus.EXPIRED }
    );
    return result.affected || 0;
  }

  /**
   * Busca estatísticas das transações
   */
  async getStats(userId?: string): Promise<PixTransactionStats> {
    const queryBuilder = this.repository.createQueryBuilder('transaction');
    
    if (userId) {
      queryBuilder.where('transaction.userId = :userId', { userId });
    }

    const stats = await queryBuilder
      .select([
        'COUNT(*) as total',
        'SUM(CASE WHEN transaction.status = :pending THEN transaction.valor ELSE 0 END) as pendingValue',
        'SUM(CASE WHEN transaction.status = :paid THEN transaction.valor ELSE 0 END) as paidValue',
        'SUM(CASE WHEN transaction.status = :expired THEN transaction.valor ELSE 0 END) as expiredValue',
        'SUM(CASE WHEN transaction.status = :cancelled THEN transaction.valor ELSE 0 END) as cancelledValue',
        'SUM(CASE WHEN transaction.status = :refunded THEN transaction.valor ELSE 0 END) as refundedValue',
        'SUM(CASE WHEN transaction.status = :failed THEN transaction.valor ELSE 0 END) as failedValue',
        'COUNT(CASE WHEN transaction.status = :pending THEN 1 END) as pending',
        'COUNT(CASE WHEN transaction.status = :paid THEN 1 END) as paid',
        'COUNT(CASE WHEN transaction.status = :expired THEN 1 END) as expired',
        'COUNT(CASE WHEN transaction.status = :cancelled THEN 1 END) as cancelled',
        'COUNT(CASE WHEN transaction.status = :refunded THEN 1 END) as refunded',
        'COUNT(CASE WHEN transaction.status = :failed THEN 1 END) as failed',
      ])
      .setParameters({
        pending: PixTransactionStatus.PENDING,
        paid: PixTransactionStatus.PAID,
        expired: PixTransactionStatus.EXPIRED,
        cancelled: PixTransactionStatus.CANCELLED,
        refunded: PixTransactionStatus.REFUNDED,
        failed: PixTransactionStatus.FAILED,
      })
      .getRawOne();

    return {
      total: parseInt(stats.total) || 0,
      totalValue: parseInt(stats.pendingValue || 0) + parseInt(stats.paidValue || 0),
      pending: parseInt(stats.pending) || 0,
      pendingValue: parseInt(stats.pendingValue) || 0,
      paid: parseInt(stats.paid) || 0,
      paidValue: parseInt(stats.paidValue) || 0,
      expired: parseInt(stats.expired) || 0,
      expiredValue: parseInt(stats.expiredValue) || 0,
      cancelled: parseInt(stats.cancelled) || 0,
      cancelledValue: parseInt(stats.cancelledValue) || 0,
      refunded: parseInt(stats.refunded) || 0,
      refundedValue: parseInt(stats.refundedValue) || 0,
      failed: parseInt(stats.failed) || 0,
      failedValue: parseInt(stats.failedValue) || 0,
    };
  }

  /**
   * Busca transações por paciente
   */
  async findByPaciente(pacienteId: string, limit: number = 50): Promise<PixTransaction[]> {
    return await this.repository.find({
      where: { pacienteId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Busca transações por usuário
   */
  async findByUser(userId: string, limit: number = 50): Promise<PixTransaction[]> {
    return await this.repository.find({
      where: { userId },
      relations: ['paciente'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Remove uma transação (apenas para casos especiais)
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected || 0) > 0;
  }

  /**
   * Busca transações que precisam de sincronização com a Efí
   */
  async findTransactionsForSync(): Promise<PixTransaction[]> {
    return await this.repository.find({
      where: {
        status: PixTransactionStatus.PENDING,
        txid: Like('txid_%'), // Transações que começam com txid_
      },
      order: { createdAt: 'ASC' },
      take: 100, // Limitar para não sobrecarregar a API
    });
  }
}
