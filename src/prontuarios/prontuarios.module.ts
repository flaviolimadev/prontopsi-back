import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProntuariosController } from './prontuarios.controller';
import { ProntuariosService } from './prontuarios.service';
import { Prontuario } from '../entities/prontuario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Prontuario])],
  controllers: [ProntuariosController],
  providers: [ProntuariosService],
  exports: [ProntuariosService],
})
export class ProntuariosModule {} 