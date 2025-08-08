import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CadastroLinksController } from './cadastro-links.controller';
import { CadastroLinksService } from './cadastro-links.service';
import { CadastroLink, CadastroSubmission } from '../entities/cadastro-link.entity';
import { Paciente } from '../entities/paciente.entity';
import { AgendaSessao } from '../entities/agenda-sessao.entity';
import { PacientesModule } from '../pacientes/pacientes.module';
import { AgendaSessoesModule } from '../agenda-sessoes/agenda-sessoes.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CadastroLink, CadastroSubmission, Paciente, AgendaSessao]),
    PacientesModule,
    AgendaSessoesModule,
    NotificationsModule,
  ],
  controllers: [CadastroLinksController],
  providers: [CadastroLinksService],
  exports: [CadastroLinksService],
})
export class CadastroLinksModule {}
