import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AutomationApiController } from './automation-api.controller';
import { AutomationApiService } from './automation-api.service';
import { User } from '../entities/user.entity';
import { Paciente } from '../entities/paciente.entity';
import { AgendaSessao } from '../entities/agenda-sessao.entity';
import { Pagamento } from '../entities/pagamento.entity';
import { Pacote } from '../entities/pacote.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User, 
      Paciente, 
      AgendaSessao, 
      Pagamento, 
      Pacote
    ]),
  ],
  controllers: [AutomationApiController],
  providers: [AutomationApiService],
  exports: [AutomationApiService],
})
export class AutomationApiModule {}
