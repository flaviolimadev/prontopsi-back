import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { User } from '../entities/user.entity';
import { Paciente } from '../entities/paciente.entity';
import { AgendaSessao } from '../entities/agenda-sessao.entity';
import { Pagamento } from '../entities/pagamento.entity';
import { Pacote } from '../entities/pacote.entity';
import { CreatePacienteDto } from '../dto/paciente.dto';

@Injectable()
export class AutomationApiService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Paciente)
    private readonly pacienteRepository: Repository<Paciente>,
    @InjectRepository(AgendaSessao)
    private readonly agendaSessaoRepository: Repository<AgendaSessao>,
    @InjectRepository(Pagamento)
    private readonly pagamentoRepository: Repository<Pagamento>,
    @InjectRepository(Pacote)
    private readonly pacoteRepository: Repository<Pacote>,
  ) {}

  // Método simples para teste
  async getTestMessage(): Promise<string> {
    return 'Serviço de Automação está funcionando com banco de dados!';
  }

  // Verificar se o usuário existe
  async validateUser(userId: string): Promise<User> {
    try {
      console.log('🔍 Validando usuário:', userId);
      const user = await this.userRepository.findOne({ where: { id: userId } });
      console.log('👤 Usuário encontrado:', user ? 'sim' : 'não');
      if (!user) {
        throw new NotFoundException('Usuário não encontrado');
      }
      return user;
    } catch (error) {
      console.error('❌ Erro ao validar usuário:', error);
      throw error;
    }
  }

  // Buscar estatísticas gerais do usuário
  async getUserStats(userId: string) {
    try {
      console.log('📊 Buscando estatísticas para usuário:', userId);
      
      // Primeiro, vamos validar o usuário
      await this.validateUser(userId);
      console.log('✅ Usuário validado com sucesso');
      
      // Agora vamos buscar os dados reais
      const [pacientesCount, sessoesCount, pagamentosCount] = await Promise.all([
        this.pacienteRepository.count({ where: { userId } }),
        this.agendaSessaoRepository.count({ where: { userId } }),
        this.pagamentoRepository.count({ where: { userId } }),
      ]);

      console.log('📈 Contadores encontrados:');
      console.log('  - Pacientes:', pacientesCount);
      console.log('  - Sessões:', sessoesCount);
      console.log('  - Pagamentos:', pagamentosCount);

      // Buscar valor total recebido
      const pagamentos = await this.pagamentoRepository.find({
        where: { userId, status: 1 }, // status 1 = pago
        select: ['value'],
      });

      const totalRecebido = pagamentos.reduce((sum, p) => sum + Number(p.value), 0);
      console.log('💰 Total recebido (centavos):', totalRecebido);
      console.log('💰 Total recebido (reais):', totalRecebido / 100);

      return {
        success: true,
        data: {
          totalPacientes: pacientesCount,
          totalSessoes: sessoesCount,
          totalPagamentos: pagamentosCount,
          totalRecebido: totalRecebido / 100, // Converter de centavos para reais
        },
      };
    } catch (error) {
      console.error('❌ Erro ao buscar estatísticas:', error);
      throw error;
    }
  }

  // Buscar pacientes de um usuário
  async getPacientesByUserId(userId: string) {
    try {
      await this.validateUser(userId);
      
      const pacientes = await this.pacienteRepository.find({
        where: { userId },
        order: { nome: 'ASC' },
      });

      return {
        success: true,
        data: pacientes,
        total: pacientes.length,
      };
    } catch (error) {
      console.error('❌ Erro ao buscar pacientes:', error);
      throw error;
    }
  }

  // Buscar informações de um paciente específico do usuário
  async getPacienteById(userId: string, pacienteId: string) {
    try {
      await this.validateUser(userId);
      
      const paciente = await this.pacienteRepository.findOne({
        where: { id: pacienteId, userId },
      });

      if (!paciente) {
        throw new NotFoundException('Paciente não encontrado para este usuário');
      }

      return {
        success: true,
        data: paciente,
      };
    } catch (error) {
      console.error('❌ Erro ao buscar paciente:', error);
      throw error;
    }
  }

  // Buscar sessões (agendas) de um usuário
  async getAgendaSessoesByUserId(
    userId: string,
    dataInicio?: string,
    dataFim?: string,
    pacienteId?: string,
  ) {
    try {
      await this.validateUser(userId);
      
      let whereClause: any = { userId };
      
      if (pacienteId) {
        whereClause.pacienteId = pacienteId;
      }
      
      if (dataInicio && dataFim) {
        whereClause.data = Between(new Date(dataInicio), new Date(dataFim));
      }

      const sessoes = await this.agendaSessaoRepository.find({
        where: whereClause,
        relations: ['paciente'],
        order: { data: 'ASC', horario: 'ASC' },
      });

      return {
        success: true,
        data: sessoes,
        total: sessoes.length,
      };
    } catch (error) {
      console.error('❌ Erro ao buscar sessões:', error);
      throw error;
    }
  }

  // Buscar informações financeiras de um usuário
  async getFinancialInfoByUserId(
    userId: string,
    dataInicio?: string,
    dataFim?: string,
  ) {
    try {
      await this.validateUser(userId);
      
      let whereClause: any = { userId };
      
      if (dataInicio && dataFim) {
        whereClause.data = Between(new Date(dataInicio), new Date(dataFim));
      }

      const pagamentos = await this.pagamentoRepository.find({
        where: whereClause,
        relations: ['paciente', 'agendaSessao', 'pacote'],
        order: { data: 'DESC' },
      });

      // Calcular totais
      const totalRecebido = pagamentos
        .filter(p => p.status === 1) // Pago
        .reduce((sum, p) => sum + Number(p.value), 0);

      const totalPendente = pagamentos
        .filter(p => p.status === 0) // Pendente
        .reduce((sum, p) => sum + Number(p.value), 0);

      const totalCancelado = pagamentos
        .filter(p => p.status === 3) // Cancelado
        .reduce((sum, p) => sum + Number(p.value), 0);

      return {
        success: true,
        data: {
          pagamentos,
          resumo: {
            totalRecebido: totalRecebido / 100, // Converter de centavos para reais
            totalPendente: totalPendente / 100,
            totalCancelado: totalCancelado / 100,
            totalPagamentos: pagamentos.length,
          },
        },
      };
    } catch (error) {
      console.error('❌ Erro ao buscar informações financeiras:', error);
      throw error;
    }
  }

  // Cadastrar novo paciente para um usuário
  async createPaciente(userId: string, createPacienteDto: CreatePacienteDto) {
    try {
      console.log('👤 Cadastrando novo paciente para usuário:', userId);
      console.log('📝 Dados do paciente:', createPacienteDto);
      
      // Validar usuário
      await this.validateUser(userId);
      console.log('✅ Usuário validado para cadastro');
      
      // Verificar se já existe paciente com mesmo CPF (se informado)
      if (createPacienteDto.cpf) {
        const existingPaciente = await this.pacienteRepository.findOne({
          where: { cpf: createPacienteDto.cpf, userId },
        });
        
        if (existingPaciente) {
          throw new BadRequestException('Já existe um paciente com este CPF para este usuário');
        }
      }
      
      // Verificar se já existe paciente com mesmo email (se informado)
      if (createPacienteDto.email) {
        const existingPacienteEmail = await this.pacienteRepository.findOne({
          where: { email: createPacienteDto.email, userId },
        });
        
        if (existingPacienteEmail) {
          throw new BadRequestException('Já existe um paciente com este email para este usuário');
        }
      }
      
      // Criar o paciente
      const paciente = this.pacienteRepository.create({
        ...createPacienteDto,
        userId,
        status: createPacienteDto.status || 1, // 1 = ativo por padrão
      });

      const savedPaciente = await this.pacienteRepository.save(paciente);
      console.log('✅ Paciente criado com sucesso. ID:', savedPaciente.id);

      return {
        success: true,
        message: 'Paciente criado com sucesso',
        data: savedPaciente,
      };
    } catch (error) {
      console.error('❌ Erro ao criar paciente:', error.message);
      throw error;
    }
  }
}
