import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prontuario } from '../entities/prontuario.entity';
import { CreateProntuarioDto, UpdateProntuarioDto, ProntuarioResponseDto } from '../dto/prontuario.dto';

@Injectable()
export class ProntuariosService {
  constructor(
    @InjectRepository(Prontuario)
    private prontuariosRepository: Repository<Prontuario>,
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
    console.log('SERVICE - Buscando prontuário:', { userId, pacienteId });
    
    const prontuario = await this.prontuariosRepository.findOne({
      where: { pacienteId, userId },
    });

    console.log('SERVICE - Prontuário encontrado no banco:', prontuario);
    console.log('SERVICE - Evolução encontrada:', prontuario?.evolucao);

    if (!prontuario) {
      console.log('SERVICE - Nenhum prontuário encontrado');
      return null;
    }

    const responseDto = this.toResponseDto(prontuario);
    console.log('SERVICE - DTO de resposta:', responseDto);
    console.log('SERVICE - Evolução no DTO:', responseDto.evolucao);
    
    return responseDto;
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
    let prontuario = await this.prontuariosRepository.findOne({
      where: { pacienteId, userId },
    });

    if (!prontuario) {
      // Criar novo prontuário se não existir
      prontuario = this.prontuariosRepository.create({
        pacienteId,
        userId,
        anexos: [anexo],
      });
    } else {
      // Adicionar ao anexo existente
      const anexosAtuais = prontuario.anexos || [];
      prontuario.anexos = [...anexosAtuais, anexo];
    }

    const savedProntuario = await this.prontuariosRepository.save(prontuario);
    return this.toResponseDto(savedProntuario);
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
    return {
      id: prontuario.id,
      pacienteId: prontuario.pacienteId,
      userId: prontuario.userId,
      avaliacaoDemanda: prontuario.avaliacaoDemanda,
      evolucao: prontuario.evolucao,
      encaminhamento: prontuario.encaminhamento,
      anexos: prontuario.anexos,
      createdAt: prontuario.createdAt,
      updatedAt: prontuario.updatedAt,
    };
  }
} 