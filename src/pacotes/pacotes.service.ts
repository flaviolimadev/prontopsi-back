import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pacote } from '../entities/pacote.entity';
import { CreatePacoteDto, UpdatePacoteDto, PacoteResponseDto } from '../dto/pacote.dto';

@Injectable()
export class PacotesService {
  private readonly logger = new Logger(PacotesService.name);

  constructor(
    @InjectRepository(Pacote)
    private pacoteRepository: Repository<Pacote>,
  ) {}

  async create(userId: string, createPacoteDto: CreatePacoteDto): Promise<PacoteResponseDto> {
    try {
      // Mapear DTO para entidade: value -> valorTotal, title -> nome, ativo -> status
      // Converter valor para número decimal (pode vir como string ou número)
      const valorTotal = typeof createPacoteDto.value === 'string' 
        ? parseFloat((createPacoteDto.value as string).replace(/[^\d,]/g, '').replace(',', '.'))
        : Number(createPacoteDto.value);

      if (isNaN(valorTotal) || valorTotal < 0) {
        throw new BadRequestException('Valor inválido para o pacote');
      }

      // Formatar data para o tipo date do banco (YYYY-MM-DD)
      const hoje = new Date();
      const dataInicioFormatada = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());

      const pacote = this.pacoteRepository.create({
        nome: createPacoteDto.title,
        valorTotal: valorTotal,
        descricao: createPacoteDto.descricao || null,
        status: createPacoteDto.ativo !== false ? 1 : 0, // Default ativo se não especificado
        sessoesTotal: 0, // Valor padrão, pode ser ajustado depois
        sessoesUsadas: 0,
        valorPorSessao: valorTotal, // Valor padrão igual ao total
        dataInicio: dataInicioFormatada, // Data atual como padrão (sem hora)
        dataFim: null,
        pacienteId: null, // Opcional, pode ser associado depois
        userId,
      });

      const savedPacote = await this.pacoteRepository.save(pacote);
      return this.toResponseDto(savedPacote);
    } catch (error) {
      // Log do erro para debug
      this.logger.error('Erro ao criar pacote:', error);
      this.logger.error('DTO recebido:', JSON.stringify(createPacoteDto, null, 2));
      this.logger.error('UserId:', userId);
      
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      // Se for erro do TypeORM, extrair mensagem mais detalhada
      if (error?.code || error?.detail) {
        this.logger.error('Erro do banco de dados:', {
          code: error.code,
          detail: error.detail,
          message: error.message,
        });
        throw new BadRequestException(`Erro ao criar pacote: ${error.detail || error.message || 'Erro desconhecido'}`);
      }
      
      throw new BadRequestException(`Erro ao criar pacote: ${error.message || 'Erro desconhecido'}`);
    }
  }

  async findAll(userId: string, page: number = 1, limit: number = 10, search?: string, ativo?: boolean): Promise<{ data: PacoteResponseDto[]; total: number; page: number; totalPages: number }> {
    const queryBuilder = this.pacoteRepository
      .createQueryBuilder('pacote')
      .where('pacote.userId = :userId', { userId });

    if (search) {
      queryBuilder.andWhere('(pacote.nome ILIKE :search OR pacote.descricao ILIKE :search)', {
        search: `%${search}%`,
      });
    }

    if (ativo !== undefined) {
      queryBuilder.andWhere('pacote.status = :status', { status: ativo ? 1 : 0 });
    }

    const total = await queryBuilder.getCount();
    const totalPages = Math.ceil(total / limit);

    const pacotes = await queryBuilder
      .orderBy('pacote.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data: pacotes.map(pacote => this.toResponseDto(pacote)),
      total,
      page,
      totalPages,
    };
  }

  async findOne(userId: string, id: string): Promise<PacoteResponseDto> {
    const pacote = await this.pacoteRepository.findOne({
      where: { id, userId },
    });

    if (!pacote) {
      throw new NotFoundException('Pacote não encontrado');
    }

    return this.toResponseDto(pacote);
  }

  async findByTitle(userId: string, nome: string): Promise<PacoteResponseDto | null> {
    const pacote = await this.pacoteRepository.findOne({
      where: { nome, userId },
    });

    return pacote ? this.toResponseDto(pacote) : null;
  }

  async update(userId: string, id: string, updatePacoteDto: UpdatePacoteDto): Promise<PacoteResponseDto> {
    const pacote = await this.pacoteRepository.findOne({
      where: { id, userId },
    });

    if (!pacote) {
      throw new NotFoundException('Pacote não encontrado');
    }

    // Verificar se o nome já existe (se foi alterado)
    if (updatePacoteDto.nome && updatePacoteDto.nome !== pacote.nome) {
      const existingPacote = await this.findByTitle(userId, updatePacoteDto.nome);
      if (existingPacote) {
        throw new BadRequestException('Já existe um pacote com este nome');
      }
    }

    Object.assign(pacote, updatePacoteDto);
    const updatedPacote = await this.pacoteRepository.save(pacote);
    return this.toResponseDto(updatedPacote);
  }

  async remove(userId: string, id: string): Promise<void> {
    const pacote = await this.pacoteRepository.findOne({
      where: { id, userId },
    });

    if (!pacote) {
      throw new NotFoundException('Pacote não encontrado');
    }

    await this.pacoteRepository.remove(pacote);
  }

  async deactivate(userId: string, id: string): Promise<PacoteResponseDto> {
    const pacote = await this.pacoteRepository.findOne({
      where: { id, userId },
    });

    if (!pacote) {
      throw new NotFoundException('Pacote não encontrado');
    }

    pacote.status = 0;
    const updatedPacote = await this.pacoteRepository.save(pacote);
    return this.toResponseDto(updatedPacote);
  }

  async activate(userId: string, id: string): Promise<PacoteResponseDto> {
    const pacote = await this.pacoteRepository.findOne({
      where: { id, userId },
    });

    if (!pacote) {
      throw new NotFoundException('Pacote não encontrado');
    }

    pacote.status = 1;
    const updatedPacote = await this.pacoteRepository.save(pacote);
    return this.toResponseDto(updatedPacote);
  }

  async getStatistics(userId: string): Promise<{
    total: number;
    ativos: number;
    inativos: number;
    valorTotal: number;
    valorMedio: number;
  }> {
    const [total, ativos, inativos, valorTotal, valorMedio] = await Promise.all([
      this.pacoteRepository.count({ where: { userId } }),
      this.pacoteRepository.count({ where: { userId, status: 1 } }),
      this.pacoteRepository.count({ where: { userId, status: 0 } }),
      this.pacoteRepository
        .createQueryBuilder('pacote')
        .select('SUM(pacote.valor_total)', 'total')
        .where('pacote.userId = :userId', { userId })
        .getRawOne(),
      this.pacoteRepository
        .createQueryBuilder('pacote')
        .select('AVG(pacote.valor_total)', 'media')
        .where('pacote.userId = :userId', { userId })
        .getRawOne(),
    ]);

    return {
      total,
      ativos,
      inativos,
      valorTotal: parseFloat(valorTotal?.total || '0'),
      valorMedio: parseFloat(valorMedio?.media || '0'),
    };
  }

  private toResponseDto(pacote: Pacote): PacoteResponseDto {
    return {
      id: pacote.id,
      userId: pacote.userId,
      value: parseFloat(pacote.valorTotal?.toString() || '0'),
      title: pacote.nome,
      descricao: pacote.descricao,
      ativo: pacote.status === 1,
      createdAt: pacote.createdAt.toISOString(),
      updatedAt: pacote.updatedAt.toISOString(),
    };
  }
} 