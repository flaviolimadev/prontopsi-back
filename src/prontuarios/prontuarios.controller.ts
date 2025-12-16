import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, HttpException, HttpStatus } from '@nestjs/common';
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
    try {
      console.log('='.repeat(80));
      console.log('GET /prontuarios/paciente/:pacienteId - Requisição recebida');
      console.log('User:', JSON.stringify(req.user, null, 2));
      console.log('PacienteId:', pacienteId);
      console.log('='.repeat(80));
      
      const result = await this.prontuariosService.findByPaciente(req.user.sub, pacienteId);
      
      console.log('='.repeat(80));
      console.log('CONTROLLER - Resultado final:', JSON.stringify(result, null, 2));
      console.log('='.repeat(80));
      
      return result;
    } catch (error) {
      console.error('='.repeat(80));
      console.error('CONTROLLER - ERRO CAPTURADO:');
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      console.error('Error code:', error.code);
      console.error('Error detail:', error.detail);
      console.error('Error constraint:', error.constraint);
      console.error('='.repeat(80));
      
      // Retornar erro mais detalhado
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message || 'Erro ao buscar prontuário',
          error: error.name || 'InternalServerError',
          details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
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
    try {
      console.log('CONTROLLER - Adicionar anexo:', {
        userId: req.user.sub,
        pacienteId,
        anexo
      });
      const result = await this.prontuariosService.addAnexo(req.user.sub, pacienteId, anexo);
      console.log('CONTROLLER - Resultado anexo:', result);
      return result;
    } catch (error) {
      console.error('CONTROLLER - Erro ao adicionar anexo:', error);
      console.error('CONTROLLER - Stack:', error.stack);
      throw error;
    }
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