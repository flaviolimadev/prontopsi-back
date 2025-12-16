import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgendaSessoesService } from './agenda-sessoes.service';
import { AgendaSessoesController } from './agenda-sessoes.controller';
import { AgendaSessao } from '../entities/agenda-sessao.entity';
import { Pagamento } from '../entities/pagamento.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AgendaSessao, Pagamento])],
  controllers: [AgendaSessoesController],
  providers: [AgendaSessoesService],
  exports: [AgendaSessoesService],
})
export class AgendaSessoesModule {} 