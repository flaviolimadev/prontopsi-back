import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { AgendaSessoesService } from './agenda-sessoes.service';
import { CreateAgendaSessaoDto, UpdateAgendaSessaoDto } from '../dto/agenda-sessao.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('agenda-sessoes')
export class AgendaSessoesController {
  constructor(private readonly agendaSessoesService: AgendaSessoesService) {}

  // CREATE - Criar nova sessão
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Request() req, @Body() createAgendaSessaoDto: CreateAgendaSessaoDto) {
    return this.agendaSessoesService.create(req.user.sub, createAgendaSessaoDto);
  }

  // READ - Buscar todas as sessões
  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(
    @Request() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('dataInicio') dataInicio?: string,
    @Query('dataFim') dataFim?: string,
  ) {
    return this.agendaSessoesService.findAll(
      req.user.sub,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      search,
      status ? parseInt(status) : undefined,
      dataInicio,
      dataFim,
    );
  }

  // READ - Buscar sessões por paciente
  @Get('paciente/:pacienteId')
  @UseGuards(JwtAuthGuard)
  async findByPaciente(@Request() req, @Param('pacienteId') pacienteId: string) {
    return this.agendaSessoesService.findByPaciente(req.user.sub, pacienteId);
  }

  // READ - Buscar sessões por data
  @Get('data/:data')
  @UseGuards(JwtAuthGuard)
  async findByDate(@Request() req, @Param('data') data: string) {
    return this.agendaSessoesService.findByDate(req.user.sub, data);
  }

  // STATISTICS - Estatísticas das sessões
  @Get('statistics/overview')
  @UseGuards(JwtAuthGuard)
  async getStatistics(@Request() req) {
    return this.agendaSessoesService.getStatistics(req.user.sub);
  }

  // READ - Buscar sessão por ID (deve vir por último para não conflitar com outras rotas)
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Request() req, @Param('id') id: string) {
    return this.agendaSessoesService.findOne(req.user.sub, id);
  }

  // UPDATE - Atualizar sessão
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateAgendaSessaoDto: UpdateAgendaSessaoDto,
  ) {
    return this.agendaSessoesService.update(req.user.sub, id, updateAgendaSessaoDto);
  }

  // DELETE - Deletar sessão
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async remove(@Request() req, @Param('id') id: string) {
    return this.agendaSessoesService.remove(req.user.sub, id);
  }

  // UPDATE STATUS - Atualizar status da sessão
  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  async updateStatus(
    @Request() req,
    @Param('id') id: string,
    @Body() body: { status: number },
  ) {
    return this.agendaSessoesService.updateStatus(req.user.sub, id, body.status);
  }
} 