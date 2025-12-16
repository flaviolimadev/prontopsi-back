import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnamnesesService } from './anamneses.service';
import { AnamnesesController } from './anamneses.controller';
import { Anamnese } from '../entities/anamnese.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Anamnese])],
  controllers: [AnamnesesController],
  providers: [AnamnesesService],
  exports: [AnamnesesService],
})
export class AnamnesesModule {}


