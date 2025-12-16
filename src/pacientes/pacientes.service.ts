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
      // Por padrão, novo paciente deve iniciar como ATIVO (1)
      // Mantém valor explícito se fornecido (incluindo 0)
      status: createPacienteDto.status ?? 1,
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
    console.log('Backend - Aplicando update com contatos_emergencia:', updatePacienteDto.contatos_emergencia);

    // Processar contatos de emergência - LÓGICA SIMPLIFICADA E CORRIGIDA
    if (updatePacienteDto.contatos_emergencia !== undefined) {
      console.log('=== INÍCIO PROCESSAMENTO CONTATOS DE EMERGÊNCIA ===');
      console.log('1. Contatos original:', updatePacienteDto.contatos_emergencia);
      
      let contatosValidos: Array<{id: string, nome: string, telefone: string}> = [];
      
      // LÓGICA SIMPLIFICADA: Se for array, processar diretamente
      if (Array.isArray(updatePacienteDto.contatos_emergencia)) {
        console.log('2. É array, processando diretamente');
        
        contatosValidos = updatePacienteDto.contatos_emergencia
          .filter(contato => contato && typeof contato === 'object')
          .map((contato, index) => ({
            id: String(contato?.id || Date.now() + index),
            nome: String(contato?.nome || ''),
            telefone: String(contato?.telefone || '')
          }));
        
        console.log('3. Contatos processados:', contatosValidos);
      } else {
        console.log('2. Não é array, ignorando');
      }
      
      // Salvar no banco
      paciente.contatos_emergencia = contatosValidos;
      console.log('4. Contatos salvos no paciente:', paciente.contatos_emergencia);
      console.log('=== FIM PROCESSAMENTO CONTATOS DE EMERGÊNCIA ===');
    }

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
       
       // Estratégia 2: Se for um array aninhado (como [ [objeto] ])
       if (Array.isArray(medicacaoFinal) && medicacaoFinal.length === 1 && Array.isArray(medicacaoFinal[0])) {
         console.log('Estratégia 2 - Array aninhado detectado');
         medicacaoFinal = medicacaoFinal[0];
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
      
             // Salvar no banco - mesma lógica simples
       paciente.medicacoes = medicacoesValidas;
      
      console.log('=== FIM PROCESSAMENTO MEDICAÇÕES ===');
    }

         // Atualizar outros campos (exceto medicacoes e contatos_emergencia que já foram tratados)
     const { medicacoes, contatos_emergencia, ...otherFields } = updatePacienteDto;
     if (Object.keys(otherFields).length > 0) {
       Object.assign(paciente, otherFields);
     }

     // Salvar tudo de uma vez (medicacoes, contatos_emergencia e outros campos)
     await this.pacientesRepository.save(paciente);

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

    try {
      await this.pacientesRepository.remove(paciente);
      return { message: 'Paciente deletado com sucesso' };
    } catch (error: any) {
      // 23503: foreign_key_violation
      if (error?.code === '23503') {
        throw new BadRequestException(
          'Não é possível excluir este paciente porque existem agendamentos ou pagamentos vinculados. Desative o paciente ou remova os vínculos antes de excluir.'
        );
      }
      throw error;
    }
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
      contatos_emergencia: paciente.contatos_emergencia,
      medicacoes: paciente.medicacoes,
      status: paciente.status,
      cor: paciente.cor,
      avatar: paciente.avatar,
      createdAt: paciente.createdAt.toISOString(),
      updatedAt: paciente.updatedAt.toISOString(),
    };
  }
} 