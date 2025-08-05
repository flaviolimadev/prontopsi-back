import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { Paciente } from '../entities/paciente.entity';
import { CreatePacienteDto, UpdatePacienteDto, PacienteResponseDto } from '../dto/paciente.dto';

@Injectable()
export class PacientesService {
  constructor(
    @InjectRepository(Paciente)
    private pacientesRepository: Repository<Paciente>,
  ) {}

  // CREATE - Criar novo paciente
  async create(userId: string, createPacienteDto: CreatePacienteDto): Promise<PacienteResponseDto> {
    const paciente = this.pacientesRepository.create({
      ...createPacienteDto,
      userId,
      status: createPacienteDto.status || 0,
    });

    const savedPaciente = await this.pacientesRepository.save(paciente);
    return this.toResponseDto(savedPaciente);
  }

  // READ - Buscar todos os pacientes de um usuário (com paginação e filtros)
  async findAll(
    userId: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: number,
  ): Promise<{ pacientes: PacienteResponseDto[]; total: number; page: number; totalPages: number }> {
    const skip = (page - 1) * limit;
    const whereConditions: FindOptionsWhere<Paciente> = { userId };

    // Aplicar filtros
    if (search) {
      whereConditions.nome = Like(`%${search}%`);
    }
    if (status !== undefined) {
      whereConditions.status = status;
    }

    const [pacientes, total] = await this.pacientesRepository.findAndCount({
      where: whereConditions,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
      cache: 30000, // Cache de 30 segundos
    });

    return {
      pacientes: pacientes.map(paciente => this.toResponseDto(paciente)),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // READ - Buscar paciente por ID
  async findOne(userId: string, id: string): Promise<PacienteResponseDto> {
    const paciente = await this.pacientesRepository.findOne({
      where: { id, userId },
      cache: 30000, // Cache de 30 segundos
    });

    if (!paciente) {
      throw new NotFoundException('Paciente não encontrado');
    }

    return this.toResponseDto(paciente);
  }

  // READ - Buscar paciente por CPF
  async findByCpf(userId: string, cpf: string): Promise<PacienteResponseDto> {
    const paciente = await this.pacientesRepository.findOne({
      where: { cpf, userId }
    });

    if (!paciente) {
      throw new NotFoundException('Paciente não encontrado');
    }

    return this.toResponseDto(paciente);
  }

  // READ - Buscar paciente por email
  async findByEmail(userId: string, email: string): Promise<PacienteResponseDto> {
    const paciente = await this.pacientesRepository.findOne({
      where: { email, userId }
    });

    if (!paciente) {
      throw new NotFoundException('Paciente não encontrado');
    }

    return this.toResponseDto(paciente);
  }

  // UPDATE - Atualizar paciente
  async update(userId: string, id: string, updatePacienteDto: UpdatePacienteDto): Promise<PacienteResponseDto> {
    console.log('Backend - Dados recebidos para update:', { userId, id, updatePacienteDto });
    
    const paciente = await this.pacientesRepository.findOne({
      where: { id, userId }
    });

    if (!paciente) {
      throw new NotFoundException('Paciente não encontrado');
    }

    console.log('Backend - Paciente encontrado:', { 
      id: paciente.id, 
      medicacoes: paciente.medicacoes 
    });

    // Verificar se CPF já existe (se estiver sendo alterado)
    if (updatePacienteDto.cpf && updatePacienteDto.cpf !== paciente.cpf) {
      const existingPaciente = await this.pacientesRepository.findOne({
        where: { cpf: updatePacienteDto.cpf, userId }
      });

      if (existingPaciente) {
        throw new BadRequestException('CPF já está em uso por outro paciente');
      }
    }

    // Verificar se email já existe (se estiver sendo alterado)
    if (updatePacienteDto.email && updatePacienteDto.email !== paciente.email) {
      const existingPaciente = await this.pacientesRepository.findOne({
        where: { email: updatePacienteDto.email, userId }
      });

      if (existingPaciente) {
        throw new BadRequestException('Email já está em uso por outro paciente');
      }
    }

    console.log('Backend - Aplicando update com medicacoes:', updatePacienteDto.medicacoes);

    // Processar medicações - versão simplificada com logs detalhados
    if (updatePacienteDto.medicacoes !== undefined) {
      console.log('=== INÍCIO PROCESSAMENTO MEDICAÇÕES ===');
      console.log('1. Medicacoes original:', updatePacienteDto.medicacoes);
      console.log('2. Tipo:', typeof updatePacienteDto.medicacoes);
      console.log('3. É array:', Array.isArray(updatePacienteDto.medicacoes));
      console.log('4. JSON stringify:', JSON.stringify(updatePacienteDto.medicacoes, null, 2));
      
      let medicacaoFinal = updatePacienteDto.medicacoes;
      
      // Tentar diferentes estratégias para extrair os dados
      console.log('=== TENTATIVAS DE EXTRAÇÃO ===');
      
      // Estratégia 1: Se for array com elementos
      if (Array.isArray(medicacaoFinal) && medicacaoFinal.length > 0) {
        console.log('Estratégia 1 - Array com elementos');
        console.log('Primeiro elemento:', medicacaoFinal[0]);
        console.log('Tipo do primeiro:', typeof medicacaoFinal[0]);
        console.log('É array o primeiro?', Array.isArray(medicacaoFinal[0]));
        
        // Se o primeiro elemento for um array, usar ele
        if (Array.isArray(medicacaoFinal[0])) {
          console.log('Primeiro elemento é array - usando ele');
          medicacaoFinal = medicacaoFinal[0];
        } else if (typeof medicacaoFinal[0] === 'object' && medicacaoFinal[0] !== null) {
          console.log('Primeiro elemento é objeto - já está correto');
          // medicacaoFinal já está correto como array de objetos
        }
      }
      
      console.log('5. Medicação após processamento:', medicacaoFinal);
      console.log('6. Tipo final:', typeof medicacaoFinal);
      console.log('7. É array final:', Array.isArray(medicacaoFinal));
      
      // Validar e converter para formato correto
      let medicacoesValidas: Array<{id: string, nome: string, prescricao: string}> = [];
      
      if (Array.isArray(medicacaoFinal)) {
        console.log('=== PROCESSANDO CADA MEDICAMENTO ===');
        medicacoesValidas = medicacaoFinal.map((med, index) => {
          console.log(`Medicamento ${index}:`, med);
          console.log(`Tipo ${index}:`, typeof med);
          console.log(`Keys ${index}:`, Object.keys(med || {}));
          
          return {
            id: String(med?.id || Date.now() + index),
            nome: String(med?.nome || ''),
            prescricao: String(med?.prescricao || '')
          };
        });
      } else {
        console.log('Não é um array válido, não processando');
      }
      
      console.log('8. Medicações válidas final:', JSON.stringify(medicacoesValidas, null, 2));
      
      // Salvar no banco
      try {
        console.log('=== TENTANDO SALVAR NO BANCO ===');
        console.log('Dados para salvar:', JSON.stringify(medicacoesValidas, null, 2));
        console.log('Query params:', { id, userId });
        
        const updateResult = await this.pacientesRepository
          .createQueryBuilder()
          .update(Paciente)
          .set({ medicacoes: medicacoesValidas as any })
          .where('id = :id AND userId = :userId', { id, userId })
          .execute();
        
        console.log('9. RESULTADO da query:', updateResult);
        console.log('9. Linhas afetadas:', updateResult.affected);
        
        if (updateResult.affected === 0) {
          console.log('⚠️ NENHUMA LINHA FOI ATUALIZADA - Verificar se paciente existe');
        } else {
          console.log('✅ SUCESSO - Salvo no banco');
        }
        
        // Verificar se realmente foi salvo
        const pacienteVerificacao = await this.pacientesRepository.findOne({
          where: { id, userId }
        });
        console.log('10. VERIFICAÇÃO - Medicacoes no banco:', pacienteVerificacao?.medicacoes);
        
      } catch (error) {
        console.log('9. ERRO ao salvar no banco:', error);
        throw error;
      }
      
      console.log('=== FIM PROCESSAMENTO MEDICAÇÕES ===');
    }

    // Atualizar outros campos (exceto medicacoes que já foi tratado)
    const { medicacoes, ...otherFields } = updatePacienteDto;
    if (Object.keys(otherFields).length > 0) {
      Object.assign(paciente, otherFields);
      await this.pacientesRepository.save(paciente);
    }

    // Buscar o paciente atualizado
    const updatedPaciente = await this.pacientesRepository.findOne({
      where: { id, userId }
    });

    if (!updatedPaciente) {
      throw new NotFoundException('Paciente não encontrado após atualização');
    }

    console.log('Backend - Paciente atualizado:', { 
      id: updatedPaciente.id, 
      medicacoes: updatedPaciente.medicacoes 
    });

    return this.toResponseDto(updatedPaciente);
  }

  // DELETE - Deletar paciente
  async remove(userId: string, id: string): Promise<{ message: string }> {
    const paciente = await this.pacientesRepository.findOne({
      where: { id, userId }
    });

    if (!paciente) {
      throw new NotFoundException('Paciente não encontrado');
    }

    await this.pacientesRepository.remove(paciente);

    return { message: 'Paciente deletado com sucesso' };
  }

  // SOFT DELETE - Desativar paciente
  async deactivate(userId: string, id: string): Promise<PacienteResponseDto> {
    const paciente = await this.pacientesRepository.findOne({
      where: { id, userId }
    });

    if (!paciente) {
      throw new NotFoundException('Paciente não encontrado');
    }

    paciente.status = 0;
    const updatedPaciente = await this.pacientesRepository.save(paciente);

    return this.toResponseDto(updatedPaciente);
  }

  // REACTIVATE - Reativar paciente
  async reactivate(userId: string, id: string): Promise<PacienteResponseDto> {
    const paciente = await this.pacientesRepository.findOne({
      where: { id, userId }
    });

    if (!paciente) {
      throw new NotFoundException('Paciente não encontrado');
    }

    paciente.status = 1;
    const updatedPaciente = await this.pacientesRepository.save(paciente);

    return this.toResponseDto(updatedPaciente);
  }

  // UPDATE STATUS - Atualizar status do paciente
  async updateStatus(userId: string, id: string, status: number): Promise<PacienteResponseDto> {
    const paciente = await this.pacientesRepository.findOne({
      where: { id, userId }
    });

    if (!paciente) {
      throw new NotFoundException('Paciente não encontrado');
    }

    paciente.status = status;
    const updatedPaciente = await this.pacientesRepository.save(paciente);

    return this.toResponseDto(updatedPaciente);
  }

  // ADD MEDICATION - Adicionar medicação
  async addMedication(userId: string, id: string, medication: any): Promise<PacienteResponseDto> {
    const paciente = await this.pacientesRepository.findOne({
      where: { id, userId }
    });

    if (!paciente) {
      throw new NotFoundException('Paciente não encontrado');
    }

    const medicacoes = paciente.medicacoes || [];
    medicacoes.push(medication);
    paciente.medicacoes = medicacoes;

    const updatedPaciente = await this.pacientesRepository.save(paciente);

    return this.toResponseDto(updatedPaciente);
  }

  // REMOVE MEDICATION - Remover medicação
  async removeMedication(userId: string, id: string, medicationIndex: number): Promise<PacienteResponseDto> {
    const paciente = await this.pacientesRepository.findOne({
      where: { id, userId }
    });

    if (!paciente) {
      throw new NotFoundException('Paciente não encontrado');
    }

    const medicacoes = paciente.medicacoes || [];
    if (medicationIndex >= 0 && medicationIndex < medicacoes.length) {
      medicacoes.splice(medicationIndex, 1);
      paciente.medicacoes = medicacoes;
    }

    const updatedPaciente = await this.pacientesRepository.save(paciente);

    return this.toResponseDto(updatedPaciente);
  }

  // STATISTICS - Estatísticas dos pacientes
  async getStatistics(userId: string): Promise<{
    total: number;
    active: number;
    inactive: number;
    byGender: { [key: string]: number };
    byAge: { [key: string]: number };
  }> {
    const [total, active, inactive] = await Promise.all([
      this.pacientesRepository.count({ where: { userId } }),
      this.pacientesRepository.count({ where: { userId, status: 1 } }),
      this.pacientesRepository.count({ where: { userId, status: 0 } }),
    ]);

    // Estatísticas por gênero
    const genderStats = await this.pacientesRepository
      .createQueryBuilder('paciente')
      .select('paciente.genero', 'genero')
      .addSelect('COUNT(*)', 'count')
      .where('paciente.userId = :userId', { userId })
      .groupBy('paciente.genero')
      .getRawMany();

    const byGender = {};
    genderStats.forEach(stat => {
      byGender[stat.genero || 'Não informado'] = parseInt(stat.count);
    });

    // Estatísticas por faixa etária
    const ageStats = await this.pacientesRepository
      .createQueryBuilder('paciente')
      .select(`
        CASE 
          WHEN paciente.nascimento IS NULL THEN 'Não informado'
          WHEN EXTRACT(YEAR FROM AGE(paciente.nascimento)) < 18 THEN '0-17'
          WHEN EXTRACT(YEAR FROM AGE(paciente.nascimento)) < 30 THEN '18-29'
          WHEN EXTRACT(YEAR FROM AGE(paciente.nascimento)) < 50 THEN '30-49'
          WHEN EXTRACT(YEAR FROM AGE(paciente.nascimento)) < 65 THEN '50-64'
          ELSE '65+'
        END`, 'age_group')
      .addSelect('COUNT(*)', 'count')
      .where('paciente.userId = :userId', { userId })
      .groupBy('age_group')
      .getRawMany();

    const byAge = {};
    ageStats.forEach(stat => {
      byAge[stat.age_group] = parseInt(stat.count);
    });

    return {
      total,
      active,
      inactive,
      byGender,
      byAge,
    };
  }

  // Métodos auxiliares
  private toResponseDto(paciente: Paciente): PacienteResponseDto {
    return {
      id: paciente.id,
      userId: paciente.userId,
      nome: paciente.nome,
      email: paciente.email,
      endereco: paciente.endereco,
      telefone: paciente.telefone,
      profissao: paciente.profissao,
      nascimento: paciente.nascimento ? (paciente.nascimento instanceof Date ? paciente.nascimento.toISOString().split('T')[0] : paciente.nascimento) : null,
      cpf: paciente.cpf,
      genero: paciente.genero,
      observacao_geral: paciente.observacao_geral,
      contato_emergencia: paciente.contato_emergencia,
      medicacoes: paciente.medicacoes,
      status: paciente.status,
      createdAt: paciente.createdAt.toISOString(),
      updatedAt: paciente.updatedAt.toISOString(),
    };
  }
} 