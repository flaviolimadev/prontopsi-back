import { IsString, IsNumber, IsOptional, IsNotEmpty, Min, Max, IsEmail, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

export class CustomerDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  cpf: string;

  @IsString()
  @IsOptional()
  birth?: string;

  @IsString()
  @IsOptional()
  phone_number?: string;
}

export class BillingAddressDto {
  @IsString()
  @IsNotEmpty()
  street: string;

  @IsNumber()
  number: number;

  @IsString()
  @IsNotEmpty()
  neighborhood: string;

  @IsString()
  @IsNotEmpty()
  zipcode: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  state: string;
}

export class GetInstallmentsDto {
  @IsString()
  @IsNotEmpty()
  brand: string; // visa, mastercard, amex, etc.

  @IsNumber()
  @Min(1)
  totalInCents: number;
}

export class CreateCardChargeDto {
  @IsNumber()
  @Min(1)
  amountInCents: number;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  paymentToken: string; // Gerado no frontend pela SDK JavaScript da EFI

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(12)
  installments?: number;

  @ValidateNested()
  @Type(() => CustomerDto)
  customer: CustomerDto;

  @ValidateNested()
  @Type(() => BillingAddressDto)
  billing: BillingAddressDto;
}

export class RefundCardDto {
  @IsNumber()
  @Min(1)
  @IsOptional()
  valueInCents?: number; // Se não informado, reembolsa o valor total
}

