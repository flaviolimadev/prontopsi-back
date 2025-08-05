import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProntuariosService } from './prontuarios.service';
import { CreateProntuarioDto, UpdateProntuarioDto } from '../dto/prontuario.dto';

@Controller('prontuarios')
@UseGuards(JwtAuthGuard)
export class ProntuariosController {
  constructor(private readonly prontuariosService: ProntuariosService) {
    console.log('ProntuariosController inicializado');
  }

  @Get('paciente/:pacienteId')
  async findByPaciente(@Request() req, @Param('pacienteId') pacienteId: string) {
    console.log('GET /prontuarios/paciente/:pacienteId - Requisição recebida');
    console.log('User:', req.user);
    console.log('PacienteId:', pacienteId);
    
    const result = await this.prontuariosService.findByPaciente(req.user.sub, pacienteId);
    console.log('CONTROLLER - Resultado final:', result);
    console.log('CONTROLLER - Evolução no resultado:', result?.evolucao);
    
    return result;
  }

  @Post()
  async create(@Request() req, @Body() createProntuarioDto: CreateProntuarioDto) {
    return this.prontuariosService.create(req.user.sub, createProntuarioDto);
  }

  @Put('paciente/:pacienteId')
  async update(
    @Request() req,
    @Param('pacienteId') pacienteId: string,
    @Body() updateProntuarioDto: UpdateProntuarioDto,
  ) {
    console.log('CONTROLLER - Update prontuário:', {
      userId: req.user.sub,
      pacienteId,
      updateProntuarioDto
    });
    const result = await this.prontuariosService.update(req.user.sub, pacienteId, updateProntuarioDto);
    console.log('CONTROLLER - Resultado update:', result);
    return result;
  }

  @Post('paciente/:pacienteId/evolucao')
  async addEvolucao(
    @Request() req,
    @Param('pacienteId') pacienteId: string,
    @Body() evolucaoEntry: any,
  ) {
    console.log('CONTROLLER - Adicionar evolução:', {
      userId: req.user.sub,
      pacienteId,
      evolucaoEntry
    });
    const result = await this.prontuariosService.addEvolucao(req.user.sub, pacienteId, evolucaoEntry);
    console.log('CONTROLLER - Resultado evolução:', result);
    return result;
  }

  @Delete('paciente/:pacienteId/evolucao/:evolucaoId')
  async deleteEvolucao(
    @Request() req,
    @Param('pacienteId') pacienteId: string,
    @Param('evolucaoId') evolucaoId: string,
  ) {
    return this.prontuariosService.deleteEvolucao(req.user.sub, pacienteId, evolucaoId);
  }

  @Post('paciente/:pacienteId/anexo')
  async addAnexo(
    @Request() req,
    @Param('pacienteId') pacienteId: string,
    @Body() anexo: any,
  ) {
    return this.prontuariosService.addAnexo(req.user.sub, pacienteId, anexo);
  }

  @Delete('paciente/:pacienteId/anexo/:anexoId')
  async deleteAnexo(
    @Request() req,
    @Param('pacienteId') pacienteId: string,
    @Param('anexoId') anexoId: string,
  ) {
    return this.prontuariosService.deleteAnexo(req.user.sub, pacienteId, anexoId);
  }
} 