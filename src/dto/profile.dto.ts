import { IsString, IsOptional, IsEmail, MinLength, IsBoolean, IsObject } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  nome?: string;

  @IsOptional()
  @IsString()
  sobrenome?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  contato?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  crp?: string;

  @IsOptional()
  @IsString()
  clinic_name?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  whatsapp_number?: string;

  @IsOptional()
  @IsBoolean()
  whatsapp_reports_enabled?: boolean;

  @IsOptional()
  @IsString()
  whatsapp_report_time?: string;

  @IsOptional()
  @IsObject()
  report_config?: {
    includeTodaySchedule: boolean;
    includeBirthdays: boolean;
    includeOverdue: boolean;
    customMessage: string;
  };
}

export class ChangePasswordDto {
  @IsString()
  @MinLength(6)
  currentPassword: string;

  @IsString()
  @MinLength(6)
  newPassword: string;
} 