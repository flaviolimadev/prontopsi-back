import { IsString, IsEmail, IsOptional, MinLength, IsNumber, IsUUID, IsBoolean, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ReportConfigDto {
  @IsBoolean()
  includeTodaySchedule: boolean;

  @IsBoolean()
  includeBirthdays: boolean;

  @IsBoolean()
  includeOverdue: boolean;

  @IsString()
  customMessage: string;
}

export class CreateUserDto {
  @IsString()
  nome: string;

  @IsString()
  sobrenome: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  contato: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  crp?: string;

  @IsOptional()
  @IsString()
  clinicName?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  whatsappNumber?: string;

  @IsOptional()
  @IsBoolean()
  whatsappReportsEnabled?: boolean;

  @IsOptional()
  @IsString()
  whatsappReportTime?: string;

  @IsOptional()
  reportConfig?: {
    includeTodaySchedule: boolean;
    includeBirthdays: boolean;
    includeOverdue: boolean;
    customMessage: string;
  };

  @IsOptional()
  @IsString()
  referredAt?: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsOptional()
  @IsNumber()
  status?: number;

  @IsOptional()
  @IsNumber()
  pontos?: number;

  @IsOptional()
  @IsNumber()
  nivelId?: number;

  @IsOptional()
  @IsUUID()
  planoId?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsBoolean()
  isAdmin?: boolean;
}

export class UpdateUserDto {
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
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsString()
  contato?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  crp?: string;

  @IsOptional()
  @IsString()
  clinicName?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  whatsappNumber?: string;

  @IsOptional()
  @IsBoolean()
  whatsappReportsEnabled?: boolean;

  @IsOptional()
  @IsString()
  whatsappReportTime?: string;

  @IsOptional()
  reportConfig?: {
    includeTodaySchedule: boolean;
    includeBirthdays: boolean;
    includeOverdue: boolean;
    customMessage: string;
  };

  @IsOptional()
  @IsString()
  referredAt?: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsOptional()
  @IsNumber()
  status?: number;

  @IsOptional()
  @IsNumber()
  pontos?: number;

  @IsOptional()
  @IsNumber()
  nivelId?: number;

  @IsOptional()
  @IsUUID()
  planoId?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsBoolean()
  isAdmin?: boolean;
}

export class LoginUserDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class UserResponseDto {
  id: string;
  nome: string;
  sobrenome: string;
  email: string;
  code: string;
  contato?: string | null;
  phone?: string | null;
  crp?: string | null;
  clinicName?: string | null;
  address?: string | null;
  bio?: string | null;
  whatsappNumber?: string | null;
  whatsappReportsEnabled?: boolean;
  whatsappReportTime?: string | null;
  reportConfig?: {
    includeTodaySchedule: boolean;
    includeBirthdays: boolean;
    includeOverdue: boolean;
    customMessage: string;
  } | null;
  status: number;
  pontos: number;
  nivelId: number;
  planoId?: string | null;
  avatar?: string | null;
  descricao?: string | null;
  referredAt?: string | null;
  emailVerified?: boolean;
  isAdmin?: boolean;
  createdAt: string;
  updatedAt: string;
} 