import { IsString, IsNumber, IsBoolean, IsOptional, Min, MaxLength } from 'class-validator';

export class CreatePacoteDto {
  @IsNumber()
  @Min(0)
  value: number;

  @IsString()
  @MaxLength(255)
  title: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}

export class UpdatePacoteDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  nome?: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  valorTotal?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  valorPorSessao?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  sessoesTotal?: number;

  @IsOptional()
  @IsNumber()
  status?: number;
}

export class PacoteResponseDto {
  id: string;
  userId: string;
  value: number;
  title: string;
  descricao: string | null;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
} 