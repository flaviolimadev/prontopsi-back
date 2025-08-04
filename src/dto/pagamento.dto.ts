import { IsString, IsNumber, IsOptional, IsDateString, Min, IsIn, MaxLength } from 'class-validator';

export class CreatePagamentoDto {
  @IsString()
  pacienteId: string;

  @IsOptional()
  @IsString()
  pacoteId?: string;

  @IsOptional()
  @IsString()
  agendaSessaoId?: string;

  @IsDateString()
  data: string;

  @IsDateString()
  vencimento: string;

  @IsOptional()
  @IsNumber()
  @IsIn([0, 1, 2, 3])
  status?: number; // 0 pendente, 1 pago, 2 confirmado, 3 cancelado

  @IsNumber()
  @Min(0)
  value: number;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsOptional()
  @IsNumber()
  @IsIn([1, 2, 3, 4])
  type?: number; // 1 pix, 2 cartão, 3 boleto, 4 espécie

  @IsOptional()
  @IsString()
  @MaxLength(255)
  txid?: string;
}

export class UpdatePagamentoDto {
  @IsOptional()
  @IsString()
  pacienteId?: string;

  @IsOptional()
  @IsString()
  pacoteId?: string;

  @IsOptional()
  @IsString()
  agendaSessaoId?: string;

  @IsOptional()
  @IsDateString()
  data?: string;

  @IsOptional()
  @IsDateString()
  vencimento?: string;

  @IsOptional()
  @IsNumber()
  @IsIn([0, 1, 2, 3])
  status?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  value?: number;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsOptional()
  @IsNumber()
  @IsIn([1, 2, 3, 4])
  type?: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  txid?: string;
}

export class PagamentoResponseDto {
  id: string;
  userId: string;
  pacienteId: string;
  pacoteId: string | null;
  agendaSessaoId: string | null;
  data: string;
  vencimento: string;
  status: number;
  value: number;
  descricao: string | null;
  type: number | null;
  txid: string | null;
  createdAt: string;
  updatedAt: string;
  paciente?: {
    id: string;
    nome: string;
    email: string | null;
    telefone: string | null;
  };
  pacote?: {
    id: string;
    title: string;
    value: number;
  } | null;
  agendaSessao?: {
    id: string;
    data: Date;
    horario: string;
  } | null;
} 