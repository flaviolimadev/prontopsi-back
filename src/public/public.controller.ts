import { Controller, Get, Param, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { CloudflareR2Service } from '../services/cloudflare-r2.service';

@Controller('public')
export class PublicController {
  constructor(private readonly cloudflareR2Service: CloudflareR2Service) {}

  @Get('avatars/:filename')
  async getAvatarImage(@Param('filename') filename: string, @Res() res: Response) {
    try {
      // Gerar URL assinada para o avatar
      const key = `avatars/${filename}`;
      const signedUrl = await this.cloudflareR2Service.generatePresignedDownloadUrl(key, 3600); // 1 hora
      
      // Redirecionar para a URL assinada
      return res.redirect(302, signedUrl);
    } catch (error) {
      console.error('Erro ao buscar avatar:', error);
      return res.status(HttpStatus.NOT_FOUND).json({
        message: 'Avatar não encontrado',
        error: 'Not Found',
        statusCode: 404,
      });
    }
  }
}



