import { Module } from '@nestjs/common';
import { EfiCardModule } from './efi-card.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PagamentosService } from './pagamentos.service';
import { PagamentosController } from './pagamentos.controller';
import { Pagamento } from '../entities/pagamento.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Pagamento]), EfiCardModule],
  controllers: [PagamentosController],
  providers: [PagamentosService],
  exports: [PagamentosService],
})
export class PagamentosModule {} 