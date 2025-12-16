import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ProfileController } from './profile.controller';
import { AuthModule } from '../auth/auth.module';
import { CloudflareR2Module } from '../services/cloudflare-r2.module';

@Module({
  imports: [
    AuthModule,
    CloudflareR2Module,
    MulterModule.register({
      dest: './uploads/avatars',
    }),
  ],
  controllers: [ProfileController],
  exports: [],
})
export class ProfileModule {} 