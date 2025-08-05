import { IsString, IsEmail, IsOptional, IsUUID, IsDateString, IsArray, IsNumber, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreatePacienteDto {
  @IsString()
  @Transform(({ value }) => value.toUpperCase())
  nome: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  endereco?: string;

  @IsString()
  telefone: string;

  @IsOptional()
  @IsString()
  profissao?: string;

  @IsDateString()
  nascimento: string;

  @IsString()
  cpf: string;

  @IsString()
  @IsIn(['Masculino', 'Feminino', 'Não-binário', 'Prefere não informar'])
  genero: string;

  @IsOptional()
  @IsString()
  observacao_geral?: string;

  @IsOptional()
  @IsString()
  contato_emergencia?: string;

  @IsOptional()
  medicacoes?: any[];

  @IsOptional()
  @IsNumber()
  status?: number;
}

export class UpdatePacienteDto {
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.toUpperCase())
  nome?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  endereco?: string;

  @IsOptional()
  @IsString()
  telefone?: string;

  @IsOptional()
  @IsString()
  profissao?: string;

  @IsOptional()
  @IsDateString()
  nascimento?: string;

  @IsOptional()
  @IsString()
  cpf?: string;

  @IsOptional()
  @IsString()
  @IsIn(['Masculino', 'Feminino', 'Não-binário', 'Prefere não informar'])
  genero?: string;

  @IsOptional()
  @IsString()
  observacao_geral?: string;

  @IsOptional()
  @IsString()
  contato_emergencia?: string;

  @IsOptional()
  medicacoes?: any[];

  @IsOptional()
  @IsNumber()
  status?: number;
}

export class PacienteResponseDto {
  id: string;
  userId: string;
  nome: string;
  email: string | null;
  endereco: string | null;
  telefone: string | null;
  profissao: string | null;
  nascimento: string | null;
  cpf: string | null;
  genero: string | null;
  observacao_geral: string | null;
  contato_emergencia: string | null;
  medicacoes: any[] | null;
  status: number;
  createdAt: string;
  updatedAt: string;
} 