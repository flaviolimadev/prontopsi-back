import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ProfileController } from './profile.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AuthModule,
    MulterModule.register({
      dest: './uploads/avatars',
    }),
  ],
  controllers: [ProfileController],
  exports: [],
})
export class ProfileModule {} 