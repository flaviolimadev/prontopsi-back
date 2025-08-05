import { IsString, IsOptional, IsArray, IsUUID } from 'class-validator';

export class CreateProntuarioDto {
  @IsUUID()
  pacienteId: string;

  @IsOptional()
  @IsString()
  avaliacaoDemanda?: string;

  @IsOptional()
  @IsArray()
  evolucao?: any[];

  @IsOptional()
  @IsString()
  encaminhamento?: string;

  @IsOptional()
  @IsArray()
  anexos?: any[];
}

export class UpdateProntuarioDto {
  @IsOptional()
  @IsString()
  avaliacaoDemanda?: string;

  @IsOptional()
  @IsArray()
  evolucao?: any[];

  @IsOptional()
  @IsString()
  encaminhamento?: string;

  @IsOptional()
  @IsArray()
  anexos?: any[];
}

export class ProntuarioResponseDto {
  id: string;
  pacienteId: string;
  userId: string;
  avaliacaoDemanda: string | null;
  evolucao: any[] | null;
  encaminhamento: string | null;
  anexos: any[] | null;
  createdAt: Date;
  updatedAt: Date;
} 