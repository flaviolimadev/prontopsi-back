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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { PacientesService } from './pacientes.service';
import { CreatePacienteDto, UpdatePacienteDto } from '../dto/paciente.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CloudflareR2Service } from '../services/cloudflare-r2.service';

@Controller('pacientes')
@UseGuards(JwtAuthGuard)
export class PacientesController {
  constructor(
    private readonly pacientesService: PacientesService,
    private readonly cloudflareR2Service: CloudflareR2Service,
  ) {}

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
    console.log('=== CONTROLLER UPDATE PACIENTE ===');
    console.log('CONTROLLER - ID recebido:', id);
    console.log('CONTROLLER - User ID:', req.user.sub);
    console.log('CONTROLLER - Raw body recebido:', JSON.stringify(updatePacienteDto, null, 2));
    console.log('CONTROLLER - req.body direto:', JSON.stringify(req.body, null, 2));
    console.log('CONTROLLER - Campo cor presente:', updatePacienteDto.cor);
    console.log('CONTROLLER - Tipo do campo cor:', typeof updatePacienteDto.cor);
    
    // Se medicacoes estiver vazio no DTO mas cheio no req.body, usar req.body
    if (updatePacienteDto.medicacoes && Array.isArray(updatePacienteDto.medicacoes) && 
        updatePacienteDto.medicacoes.length > 0 && Array.isArray(updatePacienteDto.medicacoes[0]) &&
        updatePacienteDto.medicacoes[0].length === 0 && req.body.medicacoes) {
      console.log('CONTROLLER - Detectado problema de serialização, usando req.body');
      updatePacienteDto.medicacoes = req.body.medicacoes;
    }
    
    try {
      const result = await this.pacientesService.update(req.user.sub, id, updatePacienteDto);
      console.log('CONTROLLER - Update realizado com sucesso');
      return result;
    } catch (error) {
      console.error('CONTROLLER - Erro no update:', error);
      console.error('CONTROLLER - Stack trace:', error.stack);
      throw error;
    }
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

  // UPDATE COLOR - Atualizar cor do paciente
  @Put(':id/color')
  async updateColor(
    @Request() req,
    @Param('id') id: string,
    @Body() body: { cor: string },
  ) {
    console.log('=== CONTROLLER UPDATE COLOR ===');
    console.log('CONTROLLER - ID recebido:', id);
    console.log('CONTROLLER - Cor recebida:', body.cor);
    console.log('CONTROLLER - Tipo da cor:', typeof body.cor);
    
    return this.pacientesService.update(req.user.sub, id, { cor: body.cor });
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

  // POST - Upload avatar do paciente
  @Post(':id/avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: memoryStorage(),
      fileFilter: (req, file, cb) => {
        console.log('FileFilter chamado:', file.originalname);
        console.log('File mimetype:', file.mimetype);
        console.log('File size:', file.size);
        cb(null, true); // Accept any file for now for debug
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB (Increased for debug)
      },
    }),
  )
  async uploadAvatar(
    @Request() req,
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    console.log('UploadAvatar chamado para paciente:', id);
    console.log('File recebido:', file);
    console.log('User:', req.user);

    if (!file) {
      throw new BadRequestException('Nenhum arquivo foi enviado');
    }

    try {
      // Upload para R2
      const uploadResult = await this.cloudflareR2Service.uploadFile(file, 'pacientes');
      console.log('Upload R2 resultado:', uploadResult);

      // Atualizar o avatar do paciente
      console.log('Atualizando avatar no banco para paciente:', id);
      console.log('URL do avatar:', uploadResult.url);
      
      const updateResult = await this.pacientesService.update(req.user.sub, id, { avatar: uploadResult.url });
      console.log('Resultado da atualização:', updateResult);

      return {
        message: 'Avatar do paciente atualizado com sucesso',
        avatar_url: uploadResult.url,
        paciente: updateResult,
      };
    } catch (error) {
      console.error('Erro ao fazer upload do avatar:', error);
      throw new BadRequestException('Erro ao fazer upload do avatar');
    }
  }

  // DELETE - Remover avatar do paciente
  @Delete(':id/avatar')
  async deleteAvatar(@Request() req, @Param('id') id: string) {
    try {
      // Buscar paciente para pegar o avatar atual
      const paciente = await this.pacientesService.findOne(req.user.sub, id);
      
      if (paciente.avatar) {
        // Extrair o nome do arquivo da URL
        const urlParts = paciente.avatar.split('/');
        const fileName = urlParts[urlParts.length - 1];
        
        // Deletar do R2
        await this.cloudflareR2Service.deleteFile(fileName);
      }

      // Atualizar paciente removendo o avatar
      const updateResult = await this.pacientesService.update(req.user.sub, id, { avatar: undefined });

      return {
        message: 'Avatar do paciente removido com sucesso',
        paciente: updateResult,
      };
    } catch (error) {
      console.error('Erro ao remover avatar:', error);
      throw new BadRequestException('Erro ao remover avatar');
    }
  }
} 