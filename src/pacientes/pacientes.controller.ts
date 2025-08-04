import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PacientesService } from './pacientes.service';
import { CreatePacienteDto, UpdatePacienteDto } from '../dto/paciente.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('pacientes')
@UseGuards(JwtAuthGuard)
export class PacientesController {
  constructor(private readonly pacientesService: PacientesService) {}

  // CREATE - Criar novo paciente
  @Post()
  async create(@Request() req, @Body() createPacienteDto: CreatePacienteDto) {
    console.log('Dados recebidos no controller:', createPacienteDto);
    console.log('User ID:', req.user.sub);
    try {
      return await this.pacientesService.create(req.user.sub, createPacienteDto);
    } catch (error) {
      console.error('Erro ao criar paciente:', error);
      throw error;
    }
  }

  // READ - Buscar todos os pacientes do usuário
  @Get()
  async findAll(
    @Request() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.pacientesService.findAll(
      req.user.sub,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      search,
      status ? parseInt(status) : undefined,
    );
  }

  // READ - Buscar paciente por ID
  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    return this.pacientesService.findOne(req.user.sub, id);
  }

  // READ - Buscar paciente por CPF
  @Get('cpf/:cpf')
  async findByCpf(@Request() req, @Param('cpf') cpf: string) {
    return this.pacientesService.findByCpf(req.user.sub, cpf);
  }

  // READ - Buscar paciente por email
  @Get('email/:email')
  async findByEmail(@Request() req, @Param('email') email: string) {
    return this.pacientesService.findByEmail(req.user.sub, email);
  }

  // UPDATE - Atualizar paciente
  @Put(':id')
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updatePacienteDto: UpdatePacienteDto,
  ) {
    return this.pacientesService.update(req.user.sub, id, updatePacienteDto);
  }

  // DELETE - Deletar paciente
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Request() req, @Param('id') id: string) {
    return this.pacientesService.remove(req.user.sub, id);
  }

  // SOFT DELETE - Desativar paciente
  @Put(':id/deactivate')
  async deactivate(@Request() req, @Param('id') id: string) {
    return this.pacientesService.deactivate(req.user.sub, id);
  }

  // REACTIVATE - Reativar paciente
  @Put(':id/reactivate')
  async reactivate(@Request() req, @Param('id') id: string) {
    return this.pacientesService.reactivate(req.user.sub, id);
  }

  // UPDATE STATUS - Atualizar status do paciente
  @Put(':id/status')
  async updateStatus(
    @Request() req,
    @Param('id') id: string,
    @Body() body: { status: number },
  ) {
    return this.pacientesService.updateStatus(req.user.sub, id, body.status);
  }

  // ADD MEDICATION - Adicionar medicação
  @Post(':id/medications')
  async addMedication(
    @Request() req,
    @Param('id') id: string,
    @Body() medication: any,
  ) {
    return this.pacientesService.addMedication(req.user.sub, id, medication);
  }

  // REMOVE MEDICATION - Remover medicação
  @Delete(':id/medications/:index')
  async removeMedication(
    @Request() req,
    @Param('id') id: string,
    @Param('index') index: string,
  ) {
    return this.pacientesService.removeMedication(req.user.sub, id, parseInt(index));
  }

  // STATISTICS - Estatísticas dos pacientes
  @Get('statistics/overview')
  async getStatistics(@Request() req) {
    return this.pacientesService.getStatistics(req.user.sub);
  }
} 