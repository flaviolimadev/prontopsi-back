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
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from '../dto/user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // CREATE - Criar novo usuário
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // READ - Listar todos os usuários (com paginação e filtros)
  @Get()
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('nivelId') nivelId?: string,
  ) {
    return this.usersService.findAll(
      parseInt(page),
      parseInt(limit),
      search,
      status ? parseInt(status) : undefined,
      nivelId ? parseInt(nivelId) : undefined,
    );
  }

  // READ - Buscar usuário por código
  @Get('code/:code')
  async getUserByCode(@Param('code') code: string) {
    return this.usersService.findByCode(code);
  }

  // STATISTICS - Estatísticas dos usuários
  @Get('statistics/overview')
  async getStatistics() {
    return this.usersService.getStatistics();
  }

  // Endpoints para usuário atual (devem vir ANTES dos endpoints com :id)
  @Get('me/profile')
  async getCurrentUser(@Request() req) {
    return this.usersService.findOne(req.user.sub);
  }

  @Put('me/profile')
  async updateCurrentUser(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(req.user.sub, updateUserDto);
  }

  // Alterar senha
  @Put('me/password')
  async changePassword(
    @Request() req,
    @Body() body: { currentPassword: string; newPassword: string }
  ) {
    return this.usersService.changePassword(req.user.sub, body.currentPassword, body.newPassword);
  }

  // Upload de avatar
  @Post('me/avatar')
  @UseInterceptors(FileInterceptor('avatar', {
    storage: require('multer').memoryStorage(),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
    },
  }))
  async uploadAvatar(@Request() req, @UploadedFile() file: Express.Multer.File) {
    console.log('Upload de avatar recebido:', {
      originalname: file?.originalname,
      mimetype: file?.mimetype,
      size: file?.size,
      buffer: file?.buffer ? 'presente' : 'ausente'
    });
    
    if (!file) {
      throw new BadRequestException('Nenhum arquivo foi enviado');
    }
    
    return this.usersService.uploadAvatar(req.user.sub, file);
  }

  // Deletar avatar
  @Delete('me/avatar')
  async deleteAvatar(@Request() req) {
    return this.usersService.deleteAvatar(req.user.sub);
  }

  // Exportar dados
  @Get('me/export')
  async exportUserData(@Request() req) {
    return this.usersService.exportUserData(req.user.sub);
  }

  // Deletar conta do usuário atual
  @Delete('me')
  async deleteCurrentUser(@Request() req) {
    return this.usersService.remove(req.user.sub);
  }

  // READ - Buscar usuário por ID
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  // UPDATE - Atualizar usuário
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  // DELETE - Deletar usuário
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.usersService.remove(id);
  }

  // SOFT DELETE - Desativar usuário
  @Put(':id/deactivate')
  async deactivate(@Param('id') id: string) {
    return this.usersService.deactivate(id);
  }

  // REACTIVATE - Reativar usuário
  @Put(':id/reactivate')
  async reactivate(@Param('id') id: string) {
    return this.usersService.reactivate(id);
  }

  // UPDATE PONTOS - Atualizar pontos do usuário
  @Put(':id/pontos')
  async updatePontos(
    @Param('id') id: string,
    @Body() body: { pontos: number }
  ) {
    return this.usersService.updatePontos(id, body.pontos);
  }

  // UPDATE NÍVEL - Atualizar nível do usuário
  @Put(':id/nivel')
  async updateNivel(
    @Param('id') id: string,
    @Body() body: { nivelId: number }
  ) {
    return this.usersService.updateNivel(id, body.nivelId);
  }

  // UPDATE PLANO - Atualizar plano do usuário
  @Put(':id/plano')
  async updatePlano(
    @Param('id') id: string,
    @Body() body: { planoId: string | null }
  ) {
    return this.usersService.updatePlano(id, body.planoId);
  }
} 