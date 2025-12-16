import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminGuard } from './guards/admin.guard';
import { User } from '../entities/user.entity';
import { AgendaSessao } from '../entities/agenda-sessao.entity';
import { Paciente } from '../entities/paciente.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, AgendaSessao, Paciente]),
  ],
  controllers: [AdminController],
  providers: [AdminService, AdminGuard],
  exports: [AdminService],
})
export class AdminModule {}
