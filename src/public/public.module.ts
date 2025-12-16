import { Module } from '@nestjs/common';
import { PublicController } from './public.controller';
import { CloudflareR2Module } from '../services/cloudflare-r2.module';

@Module({
  imports: [CloudflareR2Module],
  controllers: [PublicController],
})
export class PublicModule {}



