import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Prontuario } from '../entities/prontuario.entity';
import { CreateProntuarioDto, UpdateProntuarioDto, ProntuarioResponseDto } from '../dto/prontuario.dto';

@Injectable()
export class ProntuariosService {
  private readonly logger = new Logger(ProntuariosService.name);

  constructor(
    @InjectRepository(Prontuario)
    private prontuariosRepository: Repository<Prontuario>,
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async create(userId: string, createProntuarioDto: CreateProntuarioDto): Promise<ProntuarioResponseDto> {
    const prontuario = this.prontuariosRepository.create({
      ...createProntuarioDto,
      userId,
    });

    const savedProntuario = await this.prontuariosRepository.save(prontuario);
    return this.toResponseDto(savedProntuario);
  }

  async findByPaciente(userId: string, pacienteId: string): Promise<ProntuarioResponseDto | null> {
    try {
      this.logger.log(`Buscando prontuário para paciente ${pacienteId} e usuário ${userId}`);
      
      // Tentar usar query SQL direta como fallback se findOne falhar
      try {
        const prontuario = await this.prontuariosRepository.findOne({
          where: {
            pacienteId: pacienteId,
            userId: userId,
          },
        });

        this.logger.log(`Prontuário encontrado: ${!!prontuario}`);

        if (!prontuario) {
          this.logger.log('Nenhum prontuário encontrado');
          return null;
        }

        const responseDto = this.toResponseDto(prontuario);
        return responseDto;
      } catch (findOneError) {
        this.logger.warn('Erro ao usar findOne, tentando query SQL direta:', findOneError.message);
        
        // Fallback: usar query SQL direta
        const result = await this.dataSource.query(
          `SELECT * FROM prontuarios WHERE paciente_id = $1 AND user_id = $2 LIMIT 1`,
          [pacienteId, userId]
        );

        if (!result || result.length === 0) {
          this.logger.log('Nenhum prontuário encontrado (query SQL)');
          return null;
        }

        const rawProntuario = result[0];
        const prontuario = this.prontuariosRepository.create({
          id: rawProntuario.id,
          pacienteId: rawProntuario.paciente_id,
          userId: rawProntuario.user_id,
          avaliacaoDemanda: rawProntuario.avaliacao_demanda,
          evolucao: typeof rawProntuario.evolucao === 'string' ? JSON.parse(rawProntuario.evolucao) : rawProntuario.evolucao,
          encaminhamento: rawProntuario.encaminhamento,
          anexos: typeof rawProntuario.anexos === 'string' ? JSON.parse(rawProntuario.anexos) : rawProntuario.anexos,
          createdAt: rawProntuario.created_at,
          updatedAt: rawProntuario.updated_at,
        });

        const responseDto = this.toResponseDto(prontuario);
        return responseDto;
      }
    } catch (error) {
      this.logger.error('Erro ao buscar prontuário:', error);
      this.logger.error('Stack trace:', error.stack);
      this.logger.error('Error details:', {
        message: error.message,
        code: error.code,
        detail: error.detail,
        constraint: error.constraint,
        query: error.query,
        parameters: error.parameters,
      });
      throw error;
    }
  }

  async update(userId: string, pacienteId: string, updateProntuarioDto: UpdateProntuarioDto): Promise<ProntuarioResponseDto> {
    console.log('SERVICE - Update prontuário:', { userId, pacienteId, updateProntuarioDto });
    
    let prontuario = await this.prontuariosRepository.findOne({
      where: { pacienteId, userId },
    });

    console.log('SERVICE - Prontuário encontrado:', prontuario);

    if (!prontuario) {
      // Se não existe, criar um novo
      console.log('SERVICE - Criando novo prontuário');
      prontuario = this.prontuariosRepository.create({
        pacienteId,
        userId,
        ...updateProntuarioDto,
      });
    } else {
      // Se existe, atualizar apenas os campos fornecidos
      console.log('SERVICE - Atualizando prontuário existente');
      console.log('SERVICE - Campos a atualizar:', updateProntuarioDto);
      
      // Atualizar apenas os campos que foram enviados, preservando os existentes
      if (updateProntuarioDto.avaliacaoDemanda !== undefined) {
        prontuario.avaliacaoDemanda = updateProntuarioDto.avaliacaoDemanda;
      }
      if (updateProntuarioDto.encaminhamento !== undefined) {
        prontuario.encaminhamento = updateProntuarioDto.encaminhamento;
      }
      // Não atualizar evolucao e anexos aqui - eles têm endpoints específicos
      
      console.log('SERVICE - Prontuário após merge:', prontuario);
    }

    console.log('SERVICE - Prontuário antes de salvar:', prontuario);
    const savedProntuario = await this.prontuariosRepository.save(prontuario);
    console.log('SERVICE - Prontuário salvo:', savedProntuario);
    
    return this.toResponseDto(savedProntuario);
  }

  async addEvolucao(userId: string, pacienteId: string, evolucaoEntry: any): Promise<ProntuarioResponseDto> {
    console.log('SERVICE - addEvolucao - evolucaoEntry recebida:', evolucaoEntry);
    
    let prontuario = await this.prontuariosRepository.findOne({
      where: { pacienteId, userId },
    });

    console.log('SERVICE - addEvolucao - prontuario encontrado:', prontuario);

    if (!prontuario) {
      // Criar novo prontuário se não existir
      console.log('SERVICE - addEvolucao - criando novo prontuário');
      prontuario = this.prontuariosRepository.create({
        pacienteId,
        userId,
        evolucao: [evolucaoEntry],
      });
    } else {
      // Adicionar à evolução existente
      const evolucaoAtual = prontuario.evolucao || [];
      console.log('SERVICE - addEvolucao - evolucao atual:', evolucaoAtual);
      prontuario.evolucao = [...evolucaoAtual, evolucaoEntry];
      console.log('SERVICE - addEvolucao - nova evolucao:', prontuario.evolucao);
    }

    const savedProntuario = await this.prontuariosRepository.save(prontuario);
    console.log('SERVICE - addEvolucao - prontuario salvo:', savedProntuario);
    console.log('SERVICE - addEvolucao - evolucao salva:', savedProntuario.evolucao);
    
    const responseDto = this.toResponseDto(savedProntuario);
    console.log('SERVICE - addEvolucao - responseDto:', responseDto);
    
    return responseDto;
  }

  async deleteEvolucao(userId: string, pacienteId: string, evolucaoId: string): Promise<ProntuarioResponseDto> {
    const prontuario = await this.prontuariosRepository.findOne({
      where: { pacienteId, userId },
    });

    if (!prontuario) {
      throw new NotFoundException('Prontuário não encontrado');
    }

    const evolucaoAtual = prontuario.evolucao || [];
    prontuario.evolucao = evolucaoAtual.filter(entry => entry.id !== evolucaoId);

    const savedProntuario = await this.prontuariosRepository.save(prontuario);
    return this.toResponseDto(savedProntuario);
  }

  async addAnexo(userId: string, pacienteId: string, anexo: any): Promise<ProntuarioResponseDto> {
    try {
      this.logger.log('SERVICE - Adicionando anexo:', { userId, pacienteId, anexo });
      
      let prontuario = await this.prontuariosRepository.findOne({
        where: { pacienteId, userId },
      });

      this.logger.log('SERVICE - Prontuário encontrado:', !!prontuario);

      if (!prontuario) {
        // Criar novo prontuário se não existir
        this.logger.log('SERVICE - Criando novo prontuário com anexo');
        prontuario = this.prontuariosRepository.create({
          pacienteId,
          userId,
          anexos: [anexo],
        });
      } else {
        // Verificar limite de 10 anexos
        const anexosAtuais = Array.isArray(prontuario.anexos) ? prontuario.anexos : [];
        
        if (anexosAtuais.length >= 10) {
          this.logger.warn('SERVICE - Limite de 10 anexos atingido');
          throw new BadRequestException('Limite de 10 anexos atingido. Remova alguns anexos antes de adicionar novos.');
        }
        
        // Adicionar ao anexo existente
        this.logger.log(`SERVICE - Adicionando anexo. Total atual: ${anexosAtuais.length}`);
        prontuario.anexos = [...anexosAtuais, anexo];
      }

      this.logger.log('SERVICE - Salvando prontuário com anexo');
      const savedProntuario = await this.prontuariosRepository.save(prontuario);
      this.logger.log('SERVICE - Prontuário salvo com sucesso');
      
      return this.toResponseDto(savedProntuario);
    } catch (error) {
      this.logger.error('SERVICE - Erro ao adicionar anexo:', error);
      this.logger.error('SERVICE - Stack:', error.stack);
      throw error;
    }
  }

  async deleteAnexo(userId: string, pacienteId: string, anexoId: string): Promise<ProntuarioResponseDto> {
    const prontuario = await this.prontuariosRepository.findOne({
      where: { pacienteId, userId },
    });

    if (!prontuario) {
      throw new NotFoundException('Prontuário não encontrado');
    }

    const anexosAtuais = prontuario.anexos || [];
    prontuario.anexos = anexosAtuais.filter(anexo => anexo.id !== anexoId);

    const savedProntuario = await this.prontuariosRepository.save(prontuario);
    return this.toResponseDto(savedProntuario);
  }

  private toResponseDto(prontuario: Prontuario): ProntuarioResponseDto {
    // Tratar campos JSON que podem vir como string do PostgreSQL
    let evolucao = prontuario.evolucao;
    if (typeof evolucao === 'string') {
      try {
        evolucao = JSON.parse(evolucao);
      } catch (e) {
        console.warn('Erro ao fazer parse de evolucao:', e);
        evolucao = [];
      }
    }

    let anexos = prontuario.anexos;
    if (typeof anexos === 'string') {
      try {
        anexos = JSON.parse(anexos);
      } catch (e) {
        console.warn('Erro ao fazer parse de anexos:', e);
        anexos = [];
      }
    }

    return {
      id: prontuario.id,
      pacienteId: prontuario.pacienteId,
      userId: prontuario.userId,
      avaliacaoDemanda: prontuario.avaliacaoDemanda || null,
      evolucao: evolucao || [],
      encaminhamento: prontuario.encaminhamento || null,
      anexos: anexos || [],
      createdAt: prontuario.createdAt ? (typeof prontuario.createdAt === 'string' ? prontuario.createdAt : prontuario.createdAt.toISOString()) : new Date().toISOString(),
      updatedAt: prontuario.updatedAt ? (typeof prontuario.updatedAt === 'string' ? prontuario.updatedAt : prontuario.updatedAt.toISOString()) : new Date().toISOString(),
    };
  }
} 