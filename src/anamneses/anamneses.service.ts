import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Anamnese } from '../entities/anamnese.entity';

export interface UpsertAnamneseDto {
  pacienteId: string;
  tipo: 'adulto' | 'menor';
  respostas: Record<string, any>;
}

@Injectable()
export class AnamnesesService {
  constructor(
    @InjectRepository(Anamnese)
    private anamneseRepository: Repository<Anamnese>,
  ) {}

  async getByPaciente(userId: string, pacienteId: string): Promise<Anamnese | null> {
    return this.anamneseRepository.findOne({ where: { userId, pacienteId } });
  }

  async upsert(userId: string, dto: UpsertAnamneseDto): Promise<Anamnese> {
    let entity = await this.anamneseRepository.findOne({ where: { userId, pacienteId: dto.pacienteId } });
    if (!entity) {
      entity = this.anamneseRepository.create({ userId, pacienteId: dto.pacienteId, tipo: dto.tipo, respostas: dto.respostas });
    } else {
      entity.tipo = dto.tipo;
      entity.respostas = dto.respostas;
    }
    return this.anamneseRepository.save(entity);
  }
}


