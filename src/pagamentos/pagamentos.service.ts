import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pagamento } from '../entities/pagamento.entity';
import { CreatePagamentoDto, UpdatePagamentoDto, PagamentoResponseDto } from '../dto/pagamento.dto';

@Injectable()
export class PagamentosService {
  constructor(
    @InjectRepository(Pagamento)
    private pagamentoRepository: Repository<Pagamento>,
  ) {}

  async create(userId: string, createPagamentoDto: CreatePagamentoDto): Promise<PagamentoResponseDto> {
    const pagamento = this.pagamentoRepository.create({
      ...createPagamentoDto,
      userId,
      data: new Date(createPagamentoDto.data),
      vencimento: new Date(createPagamentoDto.vencimento),
    });

    const savedPagamento = await this.pagamentoRepository.save(pagamento);
    return this.toResponseDto(savedPagamento);
  }

  async findAll(
    userId: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: number,
    dataInicio?: string,
    dataFim?: string,
    pacienteId?: string,
    pacoteId?: string,
  ): Promise<{ data: PagamentoResponseDto[]; total: number; page: number; totalPages: number }> {
    const queryBuilder = this.pagamentoRepository
      .createQueryBuilder('pagamento')
      .leftJoinAndSelect('pagamento.paciente', 'paciente')
      .leftJoinAndSelect('pagamento.pacote', 'pacote')
      .where('pagamento.userId = :userId', { userId });

    if (search) {
      queryBuilder.andWhere(
        '(pagamento.descricao ILIKE :search OR paciente.nome ILIKE :search OR pagamento.txid ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (status !== undefined) {
      queryBuilder.andWhere('pagamento.status = :status', { status });
    }

    if (dataInicio) {
      queryBuilder.andWhere('pagamento.data >= :dataInicio', { dataInicio: new Date(dataInicio) });
    }

    if (dataFim) {
      queryBuilder.andWhere('pagamento.data <= :dataFim', { dataFim: new Date(dataFim) });
    }

    if (pacienteId) {
      queryBuilder.andWhere('pagamento.pacienteId = :pacienteId', { pacienteId });
    }

    if (pacoteId) {
      queryBuilder.andWhere('pagamento.pacoteId = :pacoteId', { pacoteId });
    }

    const total = await queryBuilder.getCount();
    const totalPages = Math.ceil(total / limit);

    const pagamentos = await queryBuilder
      .orderBy('pagamento.data', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data: pagamentos.map(pagamento => this.toResponseDto(pagamento)),
      total,
      page,
      totalPages,
    };
  }

  async findOne(userId: string, id: string): Promise<PagamentoResponseDto> {
    const pagamento = await this.pagamentoRepository.findOne({
      where: { id, userId },
      relations: ['paciente', 'pacote'],
    });

    if (!pagamento) {
      throw new NotFoundException('Pagamento não encontrado ou não pertence ao usuário');
    }

    return this.toResponseDto(pagamento);
  }

  async findByPaciente(userId: string, pacienteId: string): Promise<PagamentoResponseDto[]> {
    const pagamentos = await this.pagamentoRepository.find({
      where: { userId, pacienteId },
      relations: ['paciente', 'pacote'],
      order: { data: 'DESC' },
    });

    return pagamentos.map(pagamento => this.toResponseDto(pagamento));
  }

  async findByPacote(userId: string, pacoteId: string): Promise<PagamentoResponseDto[]> {
    const pagamentos = await this.pagamentoRepository.find({
      where: { userId, pacoteId },
      relations: ['paciente', 'pacote'],
      order: { data: 'DESC' },
    });

    return pagamentos.map(pagamento => this.toResponseDto(pagamento));
  }

  async findByDate(userId: string, data: string): Promise<PagamentoResponseDto[]> {
    const pagamentos = await this.pagamentoRepository.find({
      where: { userId, data: new Date(data) },
      relations: ['paciente', 'pacote'],
      order: { data: 'DESC' },
    });

    return pagamentos.map(pagamento => this.toResponseDto(pagamento));
  }

  async findByAgendaSessao(userId: string, agendaSessaoId: string): Promise<PagamentoResponseDto[]> {
    const pagamentos = await this.pagamentoRepository.find({
      where: { userId, agendaSessaoId },
      relations: ['paciente', 'pacote', 'agendaSessao'],
      order: { data: 'DESC' },
    });

    return pagamentos.map(pagamento => this.toResponseDto(pagamento));
  }

  async update(userId: string, id: string, updatePagamentoDto: UpdatePagamentoDto): Promise<PagamentoResponseDto> {
    const pagamento = await this.pagamentoRepository.findOne({
      where: { id, userId },
    });

    if (!pagamento) {
      throw new NotFoundException('Pagamento não encontrado ou não pertence ao usuário');
    }

    // Converter datas de string para Date se fornecidas
    const updateData: any = { ...updatePagamentoDto };
    if (updatePagamentoDto.data) {
      updateData.data = new Date(updatePagamentoDto.data);
    }
    if (updatePagamentoDto.vencimento) {
      updateData.vencimento = new Date(updatePagamentoDto.vencimento);
    }

    Object.assign(pagamento, updateData);
    const updatedPagamento = await this.pagamentoRepository.save(pagamento);
    return this.toResponseDto(updatedPagamento);
  }

  async remove(userId: string, id: string): Promise<void> {
    const pagamento = await this.pagamentoRepository.findOne({
      where: { id, userId },
    });

    if (!pagamento) {
      throw new NotFoundException('Pagamento não encontrado ou não pertence ao usuário');
    }

    await this.pagamentoRepository.remove(pagamento);
  }

  async updateStatus(userId: string, id: string, status: number): Promise<PagamentoResponseDto> {
    const pagamento = await this.pagamentoRepository.findOne({
      where: { id, userId },
    });

    if (!pagamento) {
      throw new NotFoundException('Pagamento não encontrado ou não pertence ao usuário');
    }

    if (![0, 1, 2, 3].includes(status)) {
      throw new BadRequestException('Status inválido');
    }

    pagamento.status = status;
    const updatedPagamento = await this.pagamentoRepository.save(pagamento);
    return this.toResponseDto(updatedPagamento);
  }

  async getStatistics(userId: string): Promise<{
    total: number;
    pendentes: number;
    pagos: number;
    confirmados: number;
    cancelados: number;
    valorTotal: number;
    valorPendente: number;
    valorPago: number;
    porMes: { [key: string]: number };
  }> {
    const [total, pendentes, pagos, confirmados, cancelados, valorTotal, valorPendente, valorPago, pagamentos] = await Promise.all([
      this.pagamentoRepository.count({ where: { userId } }),
      this.pagamentoRepository.count({ where: { userId, status: 0 } }),
      this.pagamentoRepository.count({ where: { userId, status: 1 } }),
      this.pagamentoRepository.count({ where: { userId, status: 2 } }),
      this.pagamentoRepository.count({ where: { userId, status: 3 } }),
      this.pagamentoRepository
        .createQueryBuilder('pagamento')
        .select('SUM(pagamento.value)', 'total')
        .where('pagamento.userId = :userId', { userId })
        .getRawOne(),
      this.pagamentoRepository
        .createQueryBuilder('pagamento')
        .select('SUM(pagamento.value)', 'total')
        .where('pagamento.userId = :userId AND pagamento.status = 0', { userId })
        .getRawOne(),
      this.pagamentoRepository
        .createQueryBuilder('pagamento')
        .select('SUM(pagamento.value)', 'total')
        .where('pagamento.userId = :userId AND pagamento.status IN (1, 2)', { userId })
        .getRawOne(),
      this.pagamentoRepository.find({
        where: { userId },
        select: ['data', 'value'],
      }),
    ]);

    // Calcular estatísticas por mês
    const porMes: { [key: string]: number } = {};
    pagamentos.forEach(pagamento => {
      const data = new Date(pagamento.data);
      const mes = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
      porMes[mes] = (porMes[mes] || 0) + parseFloat(pagamento.value.toString());
    });

    return {
      total,
      pendentes,
      pagos,
      confirmados,
      cancelados,
      valorTotal: parseFloat(valorTotal?.total || '0'),
      valorPendente: parseFloat(valorPendente?.total || '0'),
      valorPago: parseFloat(valorPago?.total || '0'),
      porMes,
    };
  }

  private toResponseDto(pagamento: Pagamento): PagamentoResponseDto {
    // Formatar datas para string YYYY-MM-DD
    const formatDate = (date: any): string => {
      if (!date) return '';
      
      let dateObj: Date;
      if (date instanceof Date) {
        dateObj = date;
      } else if (typeof date === 'string') {
        dateObj = new Date(date);
      } else {
        return '';
      }
      
      if (isNaN(dateObj.getTime())) {
        return '';
      }
      
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    return {
      id: pagamento.id,
      userId: pagamento.userId,
      pacienteId: pagamento.pacienteId,
      pacoteId: pagamento.pacoteId,
      agendaSessaoId: pagamento.agendaSessaoId,
      data: formatDate(pagamento.data),
      vencimento: formatDate(pagamento.vencimento),
      status: pagamento.status,
      value: pagamento.value,
      descricao: pagamento.descricao,
      type: pagamento.type,
      txid: pagamento.txid,
      createdAt: pagamento.createdAt.toISOString(),
      updatedAt: pagamento.updatedAt.toISOString(),
      paciente: pagamento.paciente ? {
        id: pagamento.paciente.id,
        nome: pagamento.paciente.nome,
        email: pagamento.paciente.email,
        telefone: pagamento.paciente.telefone,
      } : undefined,
      pacote: pagamento.pacote ? {
        id: pagamento.pacote.id,
        title: pagamento.pacote.title,
        value: pagamento.pacote.value,
      } : null,
      agendaSessao: pagamento.agendaSessao ? {
        id: pagamento.agendaSessao.id,
        data: pagamento.agendaSessao.data,
        horario: pagamento.agendaSessao.horario,
      } : null,
    };
  }
} 