import { IsString, IsNumber, IsOptional, IsNotEmpty, IsDateString, Min, Max } from 'class-validator';

export class CreatePixChargeDto {
  @IsNumber()
  @Min(1)
  valor: number; // Em centavos

  @IsString()
  @IsNotEmpty()
  chave: string;

  @IsString()
  @IsNotEmpty()
  descricao: string;

  @IsString()
  @IsOptional()
  nomePagador?: string;

  @IsString()
  @IsOptional()
  cpfPagador?: string;

  @IsString()
  @IsOptional()
  emailPagador?: string;
}

export class SendPixDto {
  @IsNumber()
  @Min(1)
  valor: number; // Em centavos

  @IsString()
  @IsNotEmpty()
  chave: string;

  @IsString()
  @IsNotEmpty()
  descricao: string;

  @IsString()
  @IsNotEmpty()
  favorecido: {
    nome: string;
    cpf?: string;
    cnpj?: string;
  };
}

export class RefundPixDto {
  @IsString()
  @IsNotEmpty()
  e2eId: string;

  @IsNumber()
  @Min(1)
  valor: number; // Em centavos

  @IsString()
  @IsNotEmpty()
  descricao: string;
}

export class QueryPixDto {
  @IsDateString()
  inicio: string; // ISO 8601 format

  @IsDateString()
  fim: string; // ISO 8601 format

  @IsString()
  @IsOptional()
  cpf?: string;

  @IsString()
  @IsOptional()
  cnpj?: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(100)
  paginaAtual?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(100)
  itensPorPagina?: number;
}

export class PixChargeResponseDto {
  txid: string;
  calendario: {
    criacao: string;
    expiracao: number;
  };
  status: string;
  devedor: {
    nome: string;
    cpf: string;
  };
  valor: {
    original: string;
  };
  chave: string;
  solicitacaoPagador: string;
  qrcode?: string;
  qrcodeImage?: string;
}

export class PixReceivedResponseDto {
  e2eId: string;
  valor: string;
  chave: string;
  horario: string;
  infoPagador: string;
  devedor: {
    nome: string;
    cpf: string;
  };
  favorecido: {
    nome: string;
    cpf: string;
    conta: string;
  };
}

export class PixSentResponseDto {
  id: string;
  valor: string;
  chave: string;
  descricao: string;
  favorecido: {
    nome: string;
    cpf: string;
  };
  horario: string;
  status: string;
}
