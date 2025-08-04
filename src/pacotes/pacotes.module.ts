import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PacotesService } from './pacotes.service';
import { PacotesController } from './pacotes.controller';
import { Pacote } from '../entities/pacote.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Pacote])],
  controllers: [PacotesController],
  providers: [PacotesService],
  exports: [PacotesService],
})
export class PacotesModule {} 