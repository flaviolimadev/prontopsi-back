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
}
