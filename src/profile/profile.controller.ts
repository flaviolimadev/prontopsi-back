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
import { memoryStorage } from 'multer';
import { extname } from 'path';
import { AuthService } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateProfileDto } from '../dto/profile.dto';
import { CloudflareR2Service } from '../services/cloudflare-r2.service';

@Controller('profile')
export class ProfileController {
  constructor(
    private authService: AuthService,
    private cloudflareR2Service: CloudflareR2Service
  ) {}

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
      storage: memoryStorage(),
      fileFilter: (req, file, cb) => {
        console.log('FileFilter chamado:', file.originalname);
        console.log('File mimetype:', file.mimetype);
        console.log('File size:', file.size);
        
        // Aceitar qualquer arquivo por enquanto para debug
        cb(null, true);
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  async uploadAvatar(@Request() req, @UploadedFile() file: Express.Multer.File) {
    console.log('UploadAvatar chamado');
    console.log('File recebido:', file);
    console.log('User:', req.user);

    if (!file) {
      throw new BadRequestException('Nenhum arquivo foi enviado');
    }

    try {
      // Fazer upload para o R2
      const uploadResult = await this.cloudflareR2Service.uploadFile(
        file,
        'avatars',
        `${req.user.sub}-${Date.now()}`
      );

      console.log('Upload R2 resultado:', uploadResult);

      // Atualizar o avatar do usuário
      console.log('Atualizando avatar no banco para usuário:', req.user.sub);
      console.log('URL do avatar:', uploadResult.url);
      
      const updateResult = await this.authService.updateProfile(req.user.sub, { avatar: uploadResult.url });
      console.log('Resultado da atualização:', updateResult);
      
      return {
        avatar_url: uploadResult.url,
        message: 'Avatar atualizado com sucesso',
      };
    } catch (error) {
      console.error('Erro no upload:', error);
      throw new BadRequestException(`Erro ao fazer upload: ${error.message}`);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete('avatar')
  async deleteAvatar(@Request() req) {
    try {
      // Buscar o usuário atual para obter o avatar
      const user = await this.authService.getProfile(req.user.sub);
      
      // Se existe um avatar e é do R2, deletar do R2
      if (user.avatar && this.cloudflareR2Service.isR2Url(user.avatar)) {
        const key = this.cloudflareR2Service.extractKeyFromUrl(user.avatar);
        if (key) {
          await this.cloudflareR2Service.deleteFile(key);
        }
      }
      
      // Remover o avatar do usuário
      await this.authService.updateProfile(req.user.sub, { avatar: null });
      
      return {
        message: 'Avatar removido com sucesso',
      };
    } catch (error) {
      // Se falhar ao deletar do R2, ainda remove do banco
      await this.authService.updateProfile(req.user.sub, { avatar: null });
      
      return {
        message: 'Avatar removido com sucesso',
      };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('avatar/presigned-url')
  async generateAvatarUploadUrl(@Request() req, @Body() body: { fileName: string; contentType: string }) {
    try {
      const { uploadUrl, key } = await this.cloudflareR2Service.generatePresignedUploadUrl(
        body.fileName,
        body.contentType,
        'avatars',
        3600 // 1 hora
      );

      return {
        uploadUrl,
        key,
        message: 'URL de upload gerada com sucesso',
      };
    } catch (error) {
      throw new BadRequestException(`Erro ao gerar URL de upload: ${error.message}`);
    }
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