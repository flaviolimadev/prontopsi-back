import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { User } from '../entities/user.entity';
import { Paciente } from '../entities/paciente.entity';
import { AgendaSessao } from '../entities/agenda-sessao.entity';
import { Pagamento } from '../entities/pagamento.entity';
import { Pacote } from '../entities/pacote.entity';
import { CreatePacienteDto } from '../dto/paciente.dto';
import { CreateAgendaSessaoDto } from '../dto/agenda-sessao.dto';

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

  // Pesquisar usuários por nome, email ou CPF
  async searchUsers(searchTerm: string) {
    try {
      console.log('🔍 Pesquisando usuários com termo:', searchTerm);
      
      if (!searchTerm || searchTerm.trim().length < 2) {
        throw new BadRequestException('Termo de pesquisa deve ter pelo menos 2 caracteres');
      }

      const searchTermUpper = searchTerm.trim().toUpperCase();
      
      // Buscar usuários por nome, email ou CPF
      const users = await this.userRepository
        .createQueryBuilder('user')
        .where('UPPER(user.nome) LIKE :searchTerm', { searchTerm: `%${searchTermUpper}%` })
        .orWhere('UPPER(user.sobrenome) LIKE :searchTerm', { searchTerm: `%${searchTermUpper}%` })
        .orWhere('UPPER(user.email) LIKE :searchTerm', { searchTerm: `%${searchTermUpper}%` })
        .orWhere('user.cpf LIKE :searchTerm', { searchTerm: `%${searchTerm.replace(/\D/g, '')}%` })
        .select([
          'user.id',
          'user.nome', 
          'user.sobrenome',
          'user.email',
          'user.code',
          'user.contato',
          'user.phone',
          'user.crp',
          'user.clinicName',
          'user.status',
          'user.createdAt'
        ])
        .orderBy('user.nome', 'ASC')
        .limit(50) // Limitar resultados para performance
        .getMany();

      console.log(`📋 Encontrados ${users.length} usuários`);

      return {
        success: true,
        data: users,
        total: users.length,
        searchTerm: searchTerm,
      };
    } catch (error) {
      console.error('❌ Erro ao pesquisar usuários:', error.message);
      throw error;
    }
  }

  // Agendar nova sessão para um paciente
  async createAgendaSessao(userId: string, createAgendaSessaoDto: CreateAgendaSessaoDto) {
    try {
      console.log('📅 Agendando nova sessão para usuário:', userId);
      console.log('📝 Dados da sessão:', createAgendaSessaoDto);
      
      // Validar usuário
      await this.validateUser(userId);
      console.log('✅ Usuário validado para agendamento');
      
      // Verificar se o paciente pertence ao usuário
      const paciente = await this.pacienteRepository.findOne({
        where: { id: createAgendaSessaoDto.pacienteId, userId },
      });

      if (!paciente) {
        throw new BadRequestException('Paciente não encontrado para este usuário');
      }
      
      console.log('👤 Paciente validado:', paciente.nome);
      
      // Verificar se já existe uma sessão no mesmo horário
      const existingSessao = await this.agendaSessaoRepository.findOne({
        where: { 
          userId, 
          data: new Date(createAgendaSessaoDto.data), 
          horario: createAgendaSessaoDto.horario 
        },
      });
      
      if (existingSessao) {
        throw new BadRequestException('Já existe uma sessão agendada para este horário');
      }
      
      // Criar a sessão
      const sessao = this.agendaSessaoRepository.create({
        ...createAgendaSessaoDto,
        userId,
        duracao: createAgendaSessaoDto.duracao || 50, // 50 minutos por padrão
        status: createAgendaSessaoDto.status || 1, // 1 = confirmado por padrão
        value: createAgendaSessaoDto.value || 0, // 0 por padrão se não informado
      });

      const savedSessao = await this.agendaSessaoRepository.save(sessao);
      console.log('✅ Sessão agendada com sucesso. ID:', savedSessao.id);

      return {
        success: true,
        message: 'Sessão agendada com sucesso',
        data: savedSessao,
      };
    } catch (error) {
      console.error('❌ Erro ao agendar sessão:', error.message);
      throw error;
    }
  }

  // Pesquisar pacientes de um usuário específico por nome, email ou CPF
  async searchPacientes(userId: string, searchTerm: string) {
    try {
      console.log('🔍 Pesquisando pacientes do usuário:', userId, 'com termo:', searchTerm);
      
      // Validar usuário
      await this.validateUser(userId);
      
      if (!searchTerm || searchTerm.trim().length < 2) {
        throw new BadRequestException('Termo de pesquisa deve ter pelo menos 2 caracteres');
      }

      const searchTermUpper = searchTerm.trim().toUpperCase();
      
      // Buscar pacientes por nome, email ou CPF (apenas do usuário específico)
      const pacientes = await this.pacienteRepository
        .createQueryBuilder('paciente')
        .where('paciente.userId = :userId', { userId })
        .andWhere('(' +
          'UPPER(paciente.nome) LIKE :searchTerm OR ' +
          'UPPER(paciente.email) LIKE :searchTerm OR ' +
          'paciente.cpf LIKE :cpfTerm' +
        ')', { 
          searchTerm: `%${searchTermUpper}%`,
          cpfTerm: `%${searchTerm.replace(/\D/g, '')}%`
        })
        .select([
          'paciente.id',
          'paciente.nome', 
          'paciente.email',
          'paciente.telefone',
          'paciente.cpf',
          'paciente.nascimento',
          'paciente.genero',
          'paciente.endereco',
          'paciente.profissao',
          'paciente.status',
          'paciente.cor',
          'paciente.createdAt'
        ])
        .orderBy('paciente.nome', 'ASC')
        .limit(50) // Limitar resultados para performance
        .getMany();

      console.log(`📋 Encontrados ${pacientes.length} pacientes para o usuário ${userId}`);

      return {
        success: true,
        data: pacientes,
        total: pacientes.length,
        searchTerm: searchTerm,
        userId: userId,
      };
    } catch (error) {
      console.error('❌ Erro ao pesquisar pacientes:', error.message);
      throw error;
    }
  }

  // Editar paciente
  async editPaciente(userId: string, pacienteId: string, updateData: any) {
    try {
      console.log('✏️ Editando paciente:', pacienteId, 'para usuário:', userId);
      console.log('📝 Dados para atualização:', updateData);
      
      // Validar usuário
      await this.validateUser(userId);
      console.log('✅ Usuário validado para edição de paciente');
      
      // Verificar se o paciente pertence ao usuário
      const paciente = await this.pacienteRepository.findOne({
        where: { id: pacienteId, userId },
      });

      if (!paciente) {
        throw new BadRequestException('Paciente não encontrado para este usuário');
      }
      
      console.log('👤 Paciente encontrado:', paciente.nome);
      
      // Atualizar o paciente
      await this.pacienteRepository.update(
        { id: pacienteId, userId },
        updateData
      );
      
      // Buscar paciente atualizado
      const pacienteAtualizado = await this.pacienteRepository.findOne({
        where: { id: pacienteId, userId },
      });
      
      console.log('✅ Paciente editado com sucesso');

      return {
        success: true,
        message: 'Paciente editado com sucesso',
        data: pacienteAtualizado,
        updated_fields: Object.keys(updateData),
      };
    } catch (error) {
      console.error('❌ Erro ao editar paciente:', error.message);
      throw error;
    }
  }

  // Editar agenda sessão
  async editAgendaSessao(userId: string, sessaoId: string, updateData: any) {
    try {
      console.log('✏️ Editando sessão:', sessaoId, 'para usuário:', userId);
      console.log('📝 Dados para atualização:', updateData);
      
      // Validar usuário
      await this.validateUser(userId);
      console.log('✅ Usuário validado para edição de sessão');
      
      // Verificar se a sessão pertence ao usuário
      const sessao = await this.agendaSessaoRepository.findOne({
        where: { id: sessaoId, userId },
        relations: ['paciente'],
      });

      if (!sessao) {
        throw new BadRequestException('Sessão não encontrada para este usuário');
      }
      
      console.log('📅 Sessão encontrada:', sessao.tipoDaConsulta, 'para paciente:', sessao.paciente?.nome);
      
      // Se a data foi alterada, converter string para Date
      if (updateData.data) {
        updateData.data = new Date(updateData.data);
      }
      
      // Atualizar a sessão
      await this.agendaSessaoRepository.update(
        { id: sessaoId, userId },
        updateData
      );
      
      // Buscar sessão atualizada
      const sessaoAtualizada = await this.agendaSessaoRepository.findOne({
        where: { id: sessaoId, userId },
        relations: ['paciente'],
      });
      
      console.log('✅ Sessão editada com sucesso');

      return {
        success: true,
        message: 'Sessão editada com sucesso',
        data: sessaoAtualizada,
        updated_fields: Object.keys(updateData),
      };
    } catch (error) {
      console.error('❌ Erro ao editar sessão:', error.message);
      throw error;
    }
  }
}
