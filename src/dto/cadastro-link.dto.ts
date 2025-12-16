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

  // Campos adicionais opcionais preenchidos no formulário público
  @IsOptional()
  @IsString()
  nascimento?: string; // yyyy-MM-dd

  @IsOptional()
  @IsString()
  genero?: string; // feminino | masculino | outro

  // Endereço estruturado
  @IsOptional()
  @IsString()
  enderecoLogradouro?: string;

  @IsOptional()
  @IsString()
  enderecoNumero?: string;

  @IsOptional()
  @IsString()
  enderecoBairro?: string;

  @IsOptional()
  @IsString()
  enderecoCidade?: string;

  @IsOptional()
  @IsString()
  enderecoEstado?: string;

  @IsOptional()
  @IsString()
  enderecoCep?: string;

  @IsOptional()
  @IsString()
  profissao?: string;

  // Contato de emergência
  @IsOptional()
  @IsString()
  contatoEmergenciaNome?: string;

  @IsOptional()
  @IsString()
  contatoEmergenciaTelefone?: string;

  @IsOptional()
  @IsString()
  contatoEmergenciaRelacao?: string;

  // Avatar (base64 opcional para exibição na triagem)
  @IsOptional()
  @IsString()
  avatar?: string;
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
