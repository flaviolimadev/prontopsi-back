import { IsString, IsOptional, IsNumber, IsDateString, IsBoolean } from 'class-validator';

export class CreateCadastroLinkDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  maxUses?: number;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateCadastroLinkDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  maxUses?: number;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateCadastroSubmissionDto {
  @IsString()
  token: string;

  @IsString()
  nome: string;

  @IsString()
  email: string;

  @IsString()
  cpf: string;

  @IsString()
  telefone: string;

  @IsOptional()
  @IsString()
  dataConsulta?: string;

  @IsOptional()
  @IsString()
  horaConsulta?: string;
}

export class UpdateCadastroSubmissionDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  observacoes?: string;

  @IsOptional()
  @IsString()
  pacienteId?: string;
}
