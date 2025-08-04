import { IsUUID, IsDateString, IsString, IsNumber, IsOptional, IsInt, Min, Max } from 'class-validator';

export class CreateAgendaSessaoDto {
  @IsUUID()
  pacienteId: string;

  @IsDateString()
  data: string;

  @IsString()
  horario: string;

  @IsString()
  tipoDaConsulta: string;

  @IsString()
  modalidade: string;

  @IsString()
  tipoAtendimento: string;

  @IsInt()
  @Min(15)
  @Max(480) // 8 horas máximo
  duracao: number;

  @IsOptional()
  @IsString()
  observacao?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  value?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(3) // 0: pendente, 1: confirmado, 2: realizado, 3: cancelado
  status?: number;
}

export class UpdateAgendaSessaoDto {
  @IsOptional()
  @IsDateString()
  data?: string;

  @IsOptional()
  @IsString()
  horario?: string;

  @IsOptional()
  @IsString()
  tipoDaConsulta?: string;

  @IsOptional()
  @IsString()
  modalidade?: string;

  @IsOptional()
  @IsString()
  tipoAtendimento?: string;

  @IsOptional()
  @IsInt()
  @Min(15)
  @Max(480)
  duracao?: number;

  @IsOptional()
  @IsString()
  observacao?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  value?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(3)
  status?: number;
}

export class AgendaSessaoResponseDto {
  id: string;
  userId: string;
  pacienteId: string;
  data: string;
  horario: string;
  tipoDaConsulta: string;
  modalidade: string;
  tipoAtendimento: string;
  duracao: number;
  observacao: string | null;
  value: number;
  status: number;
  createdAt: string;
  updatedAt: string;
  paciente?: {
    id: string;
    nome: string;
    email: string | null;
    telefone: string | null;
  };
  pagamentos?: {
    id: string;
    value: number;
    status: number;
    data: string;
  }[];
} 