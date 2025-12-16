import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { AutomationApiService } from './automation-api.service';
import { CreatePacienteDto } from '../dto/paciente.dto';
import { CreateAgendaSessaoDto } from '../dto/agenda-sessao.dto';

@Controller('automation-api')
export class AutomationApiController {
  constructor(private readonly automationApiService: AutomationApiService) {}

  // GET /automation-api/status
  // Endpoint de status mais simples possível
  @Get('status')
  async status() {
    return {
      success: true,
      message: 'API de Automação está ativa!',
      timestamp: new Date().toISOString(),
    };
  }

  // GET /automation-api/hello
  // Endpoint de teste mais simples possível
  @Get('hello')
  async hello() {
    return {
      success: true,
      message: 'Hello World - API de Automação!',
      timestamp: new Date().toISOString(),
    };
  }

  // GET /automation-api/health
  // Endpoint de saúde da API
  @Get('health')
  async health() {
    return {
      success: true,
      message: 'API de Automação está saudável!',
      timestamp: new Date().toISOString(),
      status: 'OK',
    };
  }

  // GET /automation-api/ping
  // Endpoint de teste simples para verificar se a API está funcionando
  @Get('ping')
  async ping() {
    return {
      success: true,
      message: 'PONG - API de Automação está funcionando!',
      timestamp: new Date().toISOString(),
    };
  }

  // GET /automation-api/test
  // Endpoint de teste para verificar se a API está funcionando
  @Get('test')
  async test() {
    const message = await this.automationApiService.getTestMessage();
    return {
      success: true,
      message,
      timestamp: new Date().toISOString(),
    };
  }

  // GET /automation-api/user/:userId/stats
  // Buscar estatísticas gerais do usuário
  @Get('user/:userId/stats')
  async getUserStats(@Param('userId') userId: string) {
    if (!userId) {
      throw new BadRequestException('ID do usuário é obrigatório');
    }
    return this.automationApiService.getUserStats(userId);
  }

  // GET /automation-api/user/:userId/pacientes
  // Buscar todos os pacientes de um usuário
  @Get('user/:userId/pacientes')
  async getPacientesByUserId(@Param('userId') userId: string) {
    if (!userId) {
      throw new BadRequestException('ID do usuário é obrigatório');
    }
    return this.automationApiService.getPacientesByUserId(userId);
  }

  // GET /automation-api/user/:userId/paciente/:pacienteId
  // Buscar informações de um paciente específico
  @Get('user/:userId/paciente/:pacienteId')
  async getPacienteById(
    @Param('userId') userId: string,
    @Param('pacienteId') pacienteId: string,
  ) {
    if (!userId || !pacienteId) {
      throw new BadRequestException('IDs do usuário e paciente são obrigatórios');
    }
    return this.automationApiService.getPacienteById(userId, pacienteId);
  }

  // GET /automation-api/user/:userId/agenda-sessoes
  // Buscar sessões (agendas) de um usuário
  @Get('user/:userId/agenda-sessoes')
  async getAgendaSessoesByUserId(
    @Param('userId') userId: string,
    @Query('dataInicio') dataInicio?: string,
    @Query('dataFim') dataFim?: string,
    @Query('pacienteId') pacienteId?: string,
  ) {
    if (!userId) {
      throw new BadRequestException('ID do usuário é obrigatório');
    }
    return this.automationApiService.getAgendaSessoesByUserId(
      userId,
      dataInicio,
      dataFim,
      pacienteId,
    );
  }

  // GET /automation-api/user/:userId/financeiro
  // Buscar informações financeiras de um usuário
  @Get('user/:userId/financeiro')
  async getFinancialInfoByUserId(
    @Param('userId') userId: string,
    @Query('dataInicio') dataInicio?: string,
    @Query('dataFim') dataFim?: string,
  ) {
    if (!userId) {
      throw new BadRequestException('ID do usuário é obrigatório');
    }
    return this.automationApiService.getFinancialInfoByUserId(userId, dataInicio, dataFim);
  }

  // POST /automation-api/user/:userId/pacientes
  // Cadastrar novo paciente para um usuário
  @Post('user/:userId/pacientes')
  @HttpCode(HttpStatus.CREATED)
  async createPaciente(
    @Param('userId') userId: string,
    @Body() createPacienteDto: CreatePacienteDto,
  ) {
    if (!userId) {
      throw new BadRequestException('ID do usuário é obrigatório');
    }
    if (!createPacienteDto.nome) {
      throw new BadRequestException('Nome do paciente é obrigatório');
    }
    if (!createPacienteDto.telefone) {
      throw new BadRequestException('Telefone do paciente é obrigatório');
    }
    if (!createPacienteDto.nascimento) {
      throw new BadRequestException('Data de nascimento é obrigatória');
    }
    if (!createPacienteDto.genero) {
      throw new BadRequestException('Gênero é obrigatório');
    }
    
    return this.automationApiService.createPaciente(userId, createPacienteDto);
  }

  // GET /automation-api/user/:userId/pacientes/create
  // Cadastrar novo paciente via URL parameters
  @Get('user/:userId/pacientes/create')
  async createPacienteViaUrl(
    @Param('userId') userId: string,
    @Query('nome') nome: string,
    @Query('telefone') telefone: string,
    @Query('nascimento') nascimento: string,
    @Query('genero') genero: string,
    @Query('email') email?: string,
    @Query('endereco') endereco?: string,
    @Query('profissao') profissao?: string,
    @Query('cpf') cpf?: string,
    @Query('observacao_geral') observacao_geral?: string,
    @Query('contato_emergencia') contato_emergencia?: string,
    @Query('cor') cor?: string,
    @Query('status') status?: string,
  ) {
    if (!userId) {
      throw new BadRequestException('ID do usuário é obrigatório');
    }
    if (!nome) {
      throw new BadRequestException('Nome do paciente é obrigatório');
    }
    if (!telefone) {
      throw new BadRequestException('Telefone do paciente é obrigatório');
    }
    if (!nascimento) {
      throw new BadRequestException('Data de nascimento é obrigatória');
    }
    if (!genero) {
      throw new BadRequestException('Gênero é obrigatório');
    }

    // Converter status string para number se fornecido
    const statusNumber = status ? parseInt(status, 10) : undefined;

    const createPacienteDto: CreatePacienteDto = {
      nome,
      telefone,
      nascimento,
      genero,
      email: email || undefined,
      endereco: endereco || undefined,
      profissao: profissao || undefined,
      cpf: cpf || undefined,
      observacao_geral: observacao_geral || undefined,
      contato_emergencia: contato_emergencia || undefined,
      cor: cor || undefined,
      status: statusNumber,
    };
    
    return this.automationApiService.createPaciente(userId, createPacienteDto);
  }

  // POST /automation-api/user/:userId/agenda-sessoes
  // Agendar nova sessão para um paciente
  @Post('user/:userId/agenda-sessoes')
  @HttpCode(HttpStatus.CREATED)
  async createAgendaSessao(
    @Param('userId') userId: string,
    @Body() createAgendaSessaoDto: CreateAgendaSessaoDto,
  ) {
    if (!userId) {
      throw new BadRequestException('ID do usuário é obrigatório');
    }
    if (!createAgendaSessaoDto.pacienteId) {
      throw new BadRequestException('ID do paciente é obrigatório');
    }
    if (!createAgendaSessaoDto.data) {
      throw new BadRequestException('Data da sessão é obrigatória');
    }
    if (!createAgendaSessaoDto.horario) {
      throw new BadRequestException('Horário da sessão é obrigatório');
    }
    if (!createAgendaSessaoDto.tipoDaConsulta) {
      throw new BadRequestException('Tipo da consulta é obrigatório');
    }
    if (!createAgendaSessaoDto.modalidade) {
      throw new BadRequestException('Modalidade é obrigatória');
    }
    if (!createAgendaSessaoDto.tipoAtendimento) {
      throw new BadRequestException('Tipo de atendimento é obrigatório');
    }
    // Duração é opcional, padrão 50 minutos
    
    return this.automationApiService.createAgendaSessao(userId, createAgendaSessaoDto);
  }

  // GET /automation-api/user/:userId/agenda-sessoes/create
  // Agendar nova sessão via URL parameters
  @Get('user/:userId/agenda-sessoes/create')
  async createAgendaSessaoViaUrl(
    @Param('userId') userId: string,
    @Query('pacienteId') pacienteId: string,
    @Query('data') data: string,
    @Query('horario') horario: string,
    @Query('tipoDaConsulta') tipoDaConsulta: string,
    @Query('modalidade') modalidade: string,
    @Query('tipoAtendimento') tipoAtendimento: string,
    @Query('duracao') duracao?: string,
    @Query('observacao') observacao?: string,
    @Query('value') value?: string,
    @Query('status') status?: string,
  ) {
    if (!userId) {
      throw new BadRequestException('ID do usuário é obrigatório');
    }
    if (!pacienteId) {
      throw new BadRequestException('ID do paciente é obrigatório');
    }
    if (!data) {
      throw new BadRequestException('Data da sessão é obrigatória');
    }
    if (!horario) {
      throw new BadRequestException('Horário da sessão é obrigatório');
    }
    if (!tipoDaConsulta) {
      throw new BadRequestException('Tipo da consulta é obrigatório');
    }
    if (!modalidade) {
      throw new BadRequestException('Modalidade é obrigatória');
    }
    if (!tipoAtendimento) {
      throw new BadRequestException('Tipo de atendimento é obrigatório');
    }
    // Duração é opcional, padrão 50 minutos
    const duracaoNumber = duracao ? parseInt(duracao, 10) : undefined;
    const valueNumber = value ? parseFloat(value) : undefined;
    const statusNumber = status ? parseInt(status, 10) : undefined;

    if (duracao && duracaoNumber !== undefined && isNaN(duracaoNumber)) {
      throw new BadRequestException('Duração deve ser um número válido se fornecida');
    }

    const createAgendaSessaoDto: CreateAgendaSessaoDto = {
      pacienteId,
      data,
      horario,
      tipoDaConsulta,
      modalidade,
      tipoAtendimento,
      duracao: duracaoNumber,
      observacao: observacao || undefined,
      value: valueNumber,
      status: statusNumber,
    };
    
    return this.automationApiService.createAgendaSessao(userId, createAgendaSessaoDto);
  }

  // GET /automation-api/users/search?q=termo
  // Pesquisar usuários por nome, email ou CPF
  @Get('users/search')
  async searchUsers(@Query('q') searchTerm: string) {
    if (!searchTerm) {
      throw new BadRequestException('Parâmetro de pesquisa "q" é obrigatório');
    }
    
    return this.automationApiService.searchUsers(searchTerm);
  }

  // GET /automation-api/user/:userId/pacientes/search?q=termo
  // Pesquisar pacientes de um usuário específico por nome, email ou CPF
  @Get('user/:userId/pacientes/search')
  async searchPacientes(
    @Param('userId') userId: string,
    @Query('q') searchTerm: string
  ) {
    if (!userId) {
      throw new BadRequestException('ID do usuário é obrigatório');
    }
    if (!searchTerm) {
      throw new BadRequestException('Parâmetro de pesquisa "q" é obrigatório');
    }
    
    return this.automationApiService.searchPacientes(userId, searchTerm);
  }

  // GET /automation-api/user/:userId/pacientes/:pacienteId/edit
  // Editar paciente via URL parameters
  @Get('user/:userId/pacientes/:pacienteId/edit')
  async editPacienteViaUrl(
    @Param('userId') userId: string,
    @Param('pacienteId') pacienteId: string,
    @Query('nome') nome?: string,
    @Query('telefone') telefone?: string,
    @Query('nascimento') nascimento?: string,
    @Query('genero') genero?: string,
    @Query('email') email?: string,
    @Query('endereco') endereco?: string,
    @Query('profissao') profissao?: string,
    @Query('cpf') cpf?: string,
    @Query('observacao_geral') observacao_geral?: string,
    @Query('contato_emergencia') contato_emergencia?: string,
    @Query('cor') cor?: string,
    @Query('status') status?: string,
  ) {
    if (!userId) {
      throw new BadRequestException('ID do usuário é obrigatório');
    }
    if (!pacienteId) {
      throw new BadRequestException('ID do paciente é obrigatório');
    }

    // Criar objeto com apenas os campos fornecidos (não nulos/undefined)
    const updateData: any = {};
    if (nome) updateData.nome = nome;
    if (telefone) updateData.telefone = telefone;
    if (nascimento) updateData.nascimento = nascimento;
    if (genero) updateData.genero = genero;
    if (email) updateData.email = email;
    if (endereco) updateData.endereco = endereco;
    if (profissao) updateData.profissao = profissao;
    if (cpf) updateData.cpf = cpf;
    if (observacao_geral) updateData.observacao_geral = observacao_geral;
    if (contato_emergencia) updateData.contato_emergencia = contato_emergencia;
    if (cor) updateData.cor = cor;
    if (status) updateData.status = parseInt(status, 10);

    // Verificar se pelo menos um campo foi fornecido
    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException('Pelo menos um campo deve ser fornecido para edição');
    }
    
    return this.automationApiService.editPaciente(userId, pacienteId, updateData);
  }

  // GET /automation-api/user/:userId/agenda-sessoes/:sessaoId/edit
  // Editar agenda sessão via URL parameters
  @Get('user/:userId/agenda-sessoes/:sessaoId/edit')
  async editAgendaSessaoViaUrl(
    @Param('userId') userId: string,
    @Param('sessaoId') sessaoId: string,
    @Query('data') data?: string,
    @Query('horario') horario?: string,
    @Query('tipoDaConsulta') tipoDaConsulta?: string,
    @Query('modalidade') modalidade?: string,
    @Query('tipoAtendimento') tipoAtendimento?: string,
    @Query('duracao') duracao?: string,
    @Query('observacao') observacao?: string,
    @Query('value') value?: string,
    @Query('status') status?: string,
  ) {
    if (!userId) {
      throw new BadRequestException('ID do usuário é obrigatório');
    }
    if (!sessaoId) {
      throw new BadRequestException('ID da sessão é obrigatório');
    }

    // Criar objeto com apenas os campos fornecidos (não nulos/undefined)
    const updateData: any = {};
    if (data) updateData.data = data;
    if (horario) updateData.horario = horario;
    if (tipoDaConsulta) updateData.tipoDaConsulta = tipoDaConsulta;
    if (modalidade) updateData.modalidade = modalidade;
    if (tipoAtendimento) updateData.tipoAtendimento = tipoAtendimento;
    if (duracao) {
      const duracaoNumber = parseInt(duracao, 10);
      if (isNaN(duracaoNumber)) {
        throw new BadRequestException('Duração deve ser um número válido');
      }
      updateData.duracao = duracaoNumber;
    }
    if (observacao) updateData.observacao = observacao;
    if (value) {
      const valueNumber = parseFloat(value);
      if (isNaN(valueNumber)) {
        throw new BadRequestException('Valor deve ser um número válido');
      }
      updateData.value = valueNumber;
    }
    if (status) {
      const statusNumber = parseInt(status, 10);
      if (isNaN(statusNumber)) {
        throw new BadRequestException('Status deve ser um número válido');
      }
      updateData.status = statusNumber;
    }

    // Verificar se pelo menos um campo foi fornecido
    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException('Pelo menos um campo deve ser fornecido para edição');
    }
    
    return this.automationApiService.editAgendaSessao(userId, sessaoId, updateData);
  }
}
