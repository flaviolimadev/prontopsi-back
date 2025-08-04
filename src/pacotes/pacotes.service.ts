import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pacote } from '../entities/pacote.entity';
import { CreatePacoteDto, UpdatePacoteDto, PacoteResponseDto } from '../dto/pacote.dto';

@Injectable()
export class PacotesService {
  constructor(
    @InjectRepository(Pacote)
    private pacoteRepository: Repository<Pacote>,
  ) {}

  async create(userId: string, createPacoteDto: CreatePacoteDto): Promise<PacoteResponseDto> {
    const pacote = this.pacoteRepository.create({
      ...createPacoteDto,
      userId,
    });

    const savedPacote = await this.pacoteRepository.save(pacote);
    return this.toResponseDto(savedPacote);
  }

  async findAll(userId: string, page: number = 1, limit: number = 10, search?: string, ativo?: boolean): Promise<{ data: PacoteResponseDto[]; total: number; page: number; totalPages: number }> {
    const queryBuilder = this.pacoteRepository
      .createQueryBuilder('pacote')
      .where('pacote.userId = :userId', { userId });

    if (search) {
      queryBuilder.andWhere('(pacote.title ILIKE :search OR pacote.descricao ILIKE :search)', {
        search: `%${search}%`,
      });
    }

    if (ativo !== undefined) {
      queryBuilder.andWhere('pacote.ativo = :ativo', { ativo });
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

  async findByTitle(userId: string, title: string): Promise<PacoteResponseDto | null> {
    const pacote = await this.pacoteRepository.findOne({
      where: { title, userId },
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

    // Verificar se o título já existe (se foi alterado)
    if (updatePacoteDto.title && updatePacoteDto.title !== pacote.title) {
      const existingPacote = await this.findByTitle(userId, updatePacoteDto.title);
      if (existingPacote) {
        throw new BadRequestException('Já existe um pacote com este título');
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

    pacote.ativo = false;
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

    pacote.ativo = true;
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
      this.pacoteRepository.count({ where: { userId, ativo: true } }),
      this.pacoteRepository.count({ where: { userId, ativo: false } }),
      this.pacoteRepository
        .createQueryBuilder('pacote')
        .select('SUM(pacote.value)', 'total')
        .where('pacote.userId = :userId', { userId })
        .getRawOne(),
      this.pacoteRepository
        .createQueryBuilder('pacote')
        .select('AVG(pacote.value)', 'media')
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
      value: pacote.value,
      title: pacote.title,
      descricao: pacote.descricao,
      ativo: pacote.ativo,
      createdAt: pacote.createdAt.toISOString(),
      updatedAt: pacote.updatedAt.toISOString(),
    };
  }
} 