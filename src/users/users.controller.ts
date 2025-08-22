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
import { Public } from '../auth/decorators/public.decorator';
import { CreateUserDto, UpdateUserDto } from '../dto/user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  // POST - Retornar plano por número WhatsApp
  // Body esperado: { "whatsapp": "558496837510@s.whatsapp.net" }
  @Public()
  @Post('plano/by-whatsapp')
  async getPlanoByWhatsapp(@Body() body: { whatsapp: string }) {
    const raw = String(body.whatsapp || '');
    // Extrair apenas dígitos (antes do @, se houver)
    const idPart = raw.split('@')[0] || raw;
    const digitsFull = idPart.replace(/\D/g, '');
    // Normalizamos para os últimos 11 dígitos (DDD + 9 dígitos no Brasil)
    const digits = digitsFull.length > 11 ? digitsFull.slice(-11) : digitsFull;
    if (!digits) {
      return { found: false, message: 'Número inválido' };
    }

    // Gerar possíveis formatos: (84) 9683-7510, (84) 96837-510 etc.
    const d = digits;
    // Pegar últimos 11 dígitos se vier com DDI
    const last11 = d.length > 11 ? d.slice(-11) : d;
    const area = last11.slice(0, 2);
    const rest = last11.slice(2); // 9 dígitos (se celular) ou 8 (se fixo)
    // Celular 9 dígitos: 5-4. Sem o 9: 4-4
    const hasLeadingNine = rest.length === 9 && rest.startsWith('9');
    const restWithoutNine = hasLeadingNine ? rest.slice(1) : rest;
    const formattedA = rest.length >= 9
      ? `(${area}) ${rest.slice(0, 5)}-${rest.slice(5)}` // (84) 99683-7510
      : `(${area}) ${rest.slice(0, 4)}-${rest.slice(4)}`; // fallback
    const formattedB = `(${area}) ${restWithoutNine.slice(0, 4)}-${restWithoutNine.slice(4)}`; // (84) 9683-7510

    // Buscar usuário por phone aproximado
    const user = await this.usersService.findByPhoneLike(formattedA, formattedB, digits);

    if (!user) {
      return { found: false, message: 'Usuário não encontrado' };
    }
    const nomeCompleto = `${user.nome || ''} ${user.sobrenome || ''}`.trim();
    return { found: true, userId: user.id, planoId: user.planoId, nome: nomeCompleto, email: user.email };
  }

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