import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PacientesController } from './pacientes.controller';
import { PacientesService } from './pacientes.service';
import { Paciente } from '../entities/paciente.entity';
import { CloudflareR2Module } from '../services/cloudflare-r2.module';

@Module({
  imports: [TypeOrmModule.forFeature([Paciente]), CloudflareR2Module],
  controllers: [PacientesController],
  providers: [PacientesService],
  exports: [PacientesService],
})
export class PacientesModule {} 