import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  UseGuards,
  Request,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AuthService } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateProfileDto } from '../dto/profile.dto';

@Controller('profile')
export class ProfileController {
  constructor(private authService: AuthService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getProfile(@Request() req) {
    return this.authService.getProfile(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Put()
  async updateProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
    return this.authService.updateProfile(req.user.sub, updateProfileDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
          return cb(new BadRequestException('Apenas arquivos de imagem são permitidos'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  async uploadAvatar(@Request() req, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo foi enviado');
    }

    const avatarUrl = `/uploads/avatars/${file.filename}`;
    
    // Atualizar o avatar do usuário
    await this.authService.updateProfile(req.user.sub, { avatar: avatarUrl });
    
    return {
      avatar_url: avatarUrl,
      message: 'Avatar atualizado com sucesso',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('avatar')
  async deleteAvatar(@Request() req) {
    // Remover o avatar do usuário
    await this.authService.updateProfile(req.user.sub, { avatar: null });
    
    return {
      message: 'Avatar removido com sucesso',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(@Request() req, @Body() changePasswordDto: { currentPassword: string; newPassword: string }) {
    return this.authService.changePassword(req.user.sub, changePasswordDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('export')
  async exportUserData(@Request() req) {
    const user = await this.authService.getProfile(req.user.sub);
    
    // Aqui você pode adicionar lógica para exportar dados relacionados
    // como pacientes, agendamentos, etc.
    
    return {
      user: {
        id: user.id,
        nome: user.nome,
        sobrenome: user.sobrenome,
        email: user.email,
        contato: user.contato,
        avatar: user.avatar,
        descricao: user.descricao,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      exportDate: new Date().toISOString(),
      // Adicionar outros dados quando implementados
      patients: [],
      appointments: [],
      medicalRecords: [],
      financialRecords: [],
    };
  }

  @UseGuards(JwtAuthGuard)
  @Put('notifications')
  async updateNotificationSettings(@Request() req, @Body() settings: any) {
    // Implementar quando tivermos tabela de configurações
    return {
      message: 'Configurações de notificação atualizadas',
      settings,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Put('schedule')
  async updateScheduleSettings(@Request() req, @Body() settings: any) {
    // Implementar quando tivermos tabela de configurações
    return {
      message: 'Configurações de agenda atualizadas',
      settings,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Put('financial')
  async updateFinancialSettings(@Request() req, @Body() settings: any) {
    // Implementar quando tivermos tabela de configurações
    return {
      message: 'Configurações financeiras atualizadas',
      settings,
    };
  }
} 