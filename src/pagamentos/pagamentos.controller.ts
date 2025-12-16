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
import { PagamentosService } from './pagamentos.service';
import { CreatePagamentoDto, UpdatePagamentoDto } from '../dto/pagamento.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('pagamentos')
export class PagamentosController {
  constructor(private readonly pagamentosService: PagamentosService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Request() req, @Body() createPagamentoDto: CreatePagamentoDto) {
    return this.pagamentosService.create(req.user.sub, createPagamentoDto);
  }

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
    @Query('pacienteId') pacienteId?: string,
    @Query('pacoteId') pacoteId?: string,
  ) {
    return this.pagamentosService.findAll(
      req.user.sub,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      search,
      status ? parseInt(status) : undefined,
      dataInicio,
      dataFim,
      pacienteId,
      pacoteId,
    );
  }

  @Get('paciente/:pacienteId')
  @UseGuards(JwtAuthGuard)
  async findByPaciente(@Request() req, @Param('pacienteId') pacienteId: string) {
    return this.pagamentosService.findByPaciente(req.user.sub, pacienteId);
  }

  @Get('pacote/:pacoteId')
  @UseGuards(JwtAuthGuard)
  async findByPacote(@Request() req, @Param('pacoteId') pacoteId: string) {
    return this.pagamentosService.findByPacote(req.user.sub, pacoteId);
  }

  @Get('data/:data')
  @UseGuards(JwtAuthGuard)
  async findByDate(@Request() req, @Param('data') data: string) {
    return this.pagamentosService.findByDate(req.user.sub, data);
  }

  @Get('agenda-sessao/:agendaSessaoId')
  @UseGuards(JwtAuthGuard)
  async findByAgendaSessao(@Request() req, @Param('agendaSessaoId') agendaSessaoId: string) {
    return this.pagamentosService.findByAgendaSessao(req.user.sub, agendaSessaoId);
  }

  @Get('statistics/overview')
  @UseGuards(JwtAuthGuard)
  async getStatistics(@Request() req) {
    return this.pagamentosService.getStatistics(req.user.sub);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Request() req, @Param('id') id: string) {
    return this.pagamentosService.findOne(req.user.sub, id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updatePagamentoDto: UpdatePagamentoDto,
  ) {
    return this.pagamentosService.update(req.user.sub, id, updatePagamentoDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async remove(@Request() req, @Param('id') id: string) {
    return this.pagamentosService.remove(req.user.sub, id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  async updateStatus(@Request() req, @Param('id') id: string, @Body() body: { status: number }) {
    return this.pagamentosService.updateStatus(req.user.sub, id, body.status);
  }
} 