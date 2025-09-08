import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EfiCardService } from './efi-card.service';
import { EfiCardController } from './efi-card.controller';

@Module({
  imports: [ConfigModule],
  providers: [EfiCardService],
  controllers: [EfiCardController],
  exports: [EfiCardService],
})
export class EfiCardModule {}






