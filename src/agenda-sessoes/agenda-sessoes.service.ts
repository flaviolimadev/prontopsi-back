import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like } from 'typeorm';
import { AgendaSessao } from '../entities/agenda-sessao.entity';
import { CreateAgendaSessaoDto, UpdateAgendaSessaoDto, AgendaSessaoResponseDto } from '../dto/agenda-sessao.dto';

@Injectable()
export class AgendaSessoesService {
  constructor(
    @InjectRepository(AgendaSessao)
    private agendaSessoesRepository: Repository<AgendaSessao>,
  ) {}

  // CREATE - Criar nova sessão
  async create(userId: string, createAgendaSessaoDto: CreateAgendaSessaoDto): Promise<AgendaSessaoResponseDto> {
    const agendaSessao = this.agendaSessoesRepository.create({
      ...createAgendaSessaoDto,
      userId,
      data: new Date(createAgendaSessaoDto.data),
    });

    const savedAgendaSessao = await this.agendaSessoesRepository.save(agendaSessao);
    return this.toResponseDto(savedAgendaSessao);
  }

  // READ - Buscar todas as sessões do usuário
  async findAll(
    userId: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: number,
    dataInicio?: string,
    dataFim?: string,
  ): Promise<{ agendaSessoes: AgendaSessaoResponseDto[]; total: number; page: number; totalPages: number }> {
    const queryBuilder = this.agendaSessoesRepository
      .createQueryBuilder('agendaSessao')
      .leftJoinAndSelect('agendaSessao.paciente', 'paciente')
      .where('agendaSessao.userId = :userId', { userId });

    // Filtros
    if (search) {
      queryBuilder.andWhere(
        '(paciente.nome ILIKE :search OR agendaSessao.tipoDaConsulta ILIKE :search OR agendaSessao.modalidade ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (status !== undefined) {
      queryBuilder.andWhere('agendaSessao.status = :status', { status });
    }

    if (dataInicio && dataFim) {
      queryBuilder.andWhere('agendaSessao.data BETWEEN :dataInicio AND :dataFim', {
        dataInicio: new Date(dataInicio),
        dataFim: new Date(dataFim),
      });
    }

    // Ordenação
    queryBuilder.orderBy('agendaSessao.data', 'ASC')
      .addOrderBy('agendaSessao.horario', 'ASC');

    // Paginação
    const total = await queryBuilder.getCount();
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;

    const agendaSessoes = await queryBuilder
      .skip(offset)
      .take(limit)
      .getMany();

    return {
      agendaSessoes: agendaSessoes.map(sessao => this.toResponseDto(sessao)),
      total,
      page,
      totalPages,
    };
  }

  // READ - Buscar sessão por ID
  async findOne(userId: string, id: string): Promise<AgendaSessaoResponseDto> {
    const agendaSessao = await this.agendaSessoesRepository.findOne({
      where: { id, userId },
      relations: ['paciente', 'pagamentos'],
    });

    if (!agendaSessao) {
      throw new NotFoundException('Sessão não encontrada');
    }

    return this.toResponseDto(agendaSessao);
  }

  // READ - Buscar sessões por paciente
  async findByPaciente(userId: string, pacienteId: string): Promise<AgendaSessaoResponseDto[]> {
    const agendaSessoes = await this.agendaSessoesRepository.find({
      where: { userId, pacienteId },
      relations: ['paciente'],
      order: { data: 'ASC', horario: 'ASC' },
    });

    return agendaSessoes.map(sessao => this.toResponseDto(sessao));
  }

  // READ - Buscar sessões por data
  async findByDate(userId: string, data: string): Promise<AgendaSessaoResponseDto[]> {
    const agendaSessoes = await this.agendaSessoesRepository.find({
      where: { userId, data: new Date(data) },
      relations: ['paciente'],
      order: { horario: 'ASC' },
    });

    return agendaSessoes.map(sessao => this.toResponseDto(sessao));
  }

  // UPDATE - Atualizar sessão
  async update(userId: string, id: string, updateAgendaSessaoDto: UpdateAgendaSessaoDto): Promise<AgendaSessaoResponseDto> {
    const agendaSessao = await this.agendaSessoesRepository.findOne({
      where: { id, userId },
    });

    if (!agendaSessao) {
      throw new NotFoundException('Sessão não encontrada');
    }

    // Atualizar campos
    if (updateAgendaSessaoDto.data) {
      agendaSessao.data = new Date(updateAgendaSessaoDto.data);
    }
    if (updateAgendaSessaoDto.horario) {
      agendaSessao.horario = updateAgendaSessaoDto.horario;
    }
    if (updateAgendaSessaoDto.tipoDaConsulta) {
      agendaSessao.tipoDaConsulta = updateAgendaSessaoDto.tipoDaConsulta;
    }
    if (updateAgendaSessaoDto.modalidade) {
      agendaSessao.modalidade = updateAgendaSessaoDto.modalidade;
    }
    if (updateAgendaSessaoDto.tipoAtendimento) {
      agendaSessao.tipoAtendimento = updateAgendaSessaoDto.tipoAtendimento;
    }
    if (updateAgendaSessaoDto.duracao) {
      agendaSessao.duracao = updateAgendaSessaoDto.duracao;
    }
    if (updateAgendaSessaoDto.observacao !== undefined) {
      agendaSessao.observacao = updateAgendaSessaoDto.observacao;
    }
    if (updateAgendaSessaoDto.value !== undefined) {
      agendaSessao.value = updateAgendaSessaoDto.value;
    }
    if (updateAgendaSessaoDto.status !== undefined) {
      agendaSessao.status = updateAgendaSessaoDto.status;
    }

    const updatedAgendaSessao = await this.agendaSessoesRepository.save(agendaSessao);
    return this.toResponseDto(updatedAgendaSessao);
  }

  // DELETE - Deletar sessão
  async remove(userId: string, id: string): Promise<{ message: string }> {
    const agendaSessao = await this.agendaSessoesRepository.findOne({
      where: { id, userId },
    });

    if (!agendaSessao) {
      throw new NotFoundException('Sessão não encontrada');
    }

    await this.agendaSessoesRepository.remove(agendaSessao);
    return { message: 'Sessão deletada com sucesso' };
  }

  // UPDATE STATUS - Atualizar status da sessão
  async updateStatus(userId: string, id: string, status: number): Promise<AgendaSessaoResponseDto> {
    const agendaSessao = await this.agendaSessoesRepository.findOne({
      where: { id, userId },
    });

    if (!agendaSessao) {
      throw new NotFoundException('Sessão não encontrada');
    }

    if (status < 0 || status > 3) {
      throw new BadRequestException('Status inválido. Use: 0 (pendente), 1 (confirmado), 2 (realizado), 3 (cancelado)');
    }

    agendaSessao.status = status;
    const updatedAgendaSessao = await this.agendaSessoesRepository.save(agendaSessao);
    return this.toResponseDto(updatedAgendaSessao);
  }

  // STATISTICS - Estatísticas das sessões
  async getStatistics(userId: string): Promise<{
    total: number;
    pendentes: number;
    confirmadas: number;
    realizadas: number;
    canceladas: number;
    valorTotal: number;
    porMes: { [key: string]: number };
  }> {
    const agendaSessoes = await this.agendaSessoesRepository.find({
      where: { userId },
    });

    const total = agendaSessoes.length;
    const pendentes = agendaSessoes.filter(s => s.status === 0).length;
    const confirmadas = agendaSessoes.filter(s => s.status === 1).length;
    const realizadas = agendaSessoes.filter(s => s.status === 2).length;
    const canceladas = agendaSessoes.filter(s => s.status === 3).length;
    const valorTotal = agendaSessoes.reduce((sum, s) => sum + Number(s.value), 0);

    // Estatísticas por mês
    const porMes: { [key: string]: number } = {};
    agendaSessoes.forEach(sessao => {
      let data: Date;
      if (sessao.data instanceof Date) {
        data = sessao.data;
      } else if (typeof sessao.data === 'string') {
        data = new Date(sessao.data);
      } else {
        return; // Pular se não conseguir converter a data
      }
      
      const mes = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
      porMes[mes] = (porMes[mes] || 0) + 1;
    });

    return {
      total,
      pendentes,
      confirmadas,
      realizadas,
      canceladas,
      valorTotal,
      porMes,
    };
  }

  // Método auxiliar para converter entidade para DTO
  private toResponseDto(agendaSessao: AgendaSessao): AgendaSessaoResponseDto {
    // Tratar o campo data de forma robusta
    let dataString: string;
    if (agendaSessao.data instanceof Date) {
      dataString = agendaSessao.data.toISOString().split('T')[0];
    } else if (typeof agendaSessao.data === 'string') {
      dataString = agendaSessao.data;
    } else {
      dataString = ''; // Usar string vazia como fallback
    }

    return {
      id: agendaSessao.id,
      userId: agendaSessao.userId,
      pacienteId: agendaSessao.pacienteId,
      data: dataString,
      horario: agendaSessao.horario,
      tipoDaConsulta: agendaSessao.tipoDaConsulta,
      modalidade: agendaSessao.modalidade,
      tipoAtendimento: agendaSessao.tipoAtendimento,
      duracao: agendaSessao.duracao,
      observacao: agendaSessao.observacao,
      value: Number(agendaSessao.value),
      status: agendaSessao.status,
      createdAt: agendaSessao.createdAt.toISOString(),
      updatedAt: agendaSessao.updatedAt.toISOString(),
      paciente: agendaSessao.paciente ? {
        id: agendaSessao.paciente.id,
        nome: agendaSessao.paciente.nome,
        email: agendaSessao.paciente.email,
        telefone: agendaSessao.paciente.telefone,
      } : undefined,
      pagamentos: agendaSessao.pagamentos ? agendaSessao.pagamentos.map(pagamento => ({
        id: pagamento.id,
        value: Number(pagamento.value),
        status: pagamento.status,
        data: pagamento.data,
      })) : undefined,
    };
  }
} 