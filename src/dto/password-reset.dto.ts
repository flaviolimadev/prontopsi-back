import { IsEmail, IsString, IsNotEmpty, MinLength } from 'class-validator';

export class RequestPasswordResetDto {
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  email: string;
}

export class VerifyResetCodeDto {
  @IsString({ message: 'Código deve ser uma string' })
  @IsNotEmpty({ message: 'Código é obrigatório' })
  @MinLength(6, { message: 'Código deve ter 6 dígitos' })
  code: string;

  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  email: string;
}

export class ResetPasswordDto {
  @IsString({ message: 'Token deve ser uma string' })
  @IsNotEmpty({ message: 'Token é obrigatório' })
  token: string;

  @IsString({ message: 'Nova senha deve ser uma string' })
  @IsNotEmpty({ message: 'Nova senha é obrigatória' })
  @MinLength(6, { message: 'Senha deve ter pelo menos 6 caracteres' })
  newPassword: string;
}

export class ResetPasswordWithCodeDto {
  @IsString({ message: 'Código deve ser uma string' })
  @IsNotEmpty({ message: 'Código é obrigatório' })
  @MinLength(6, { message: 'Código deve ter 6 dígitos' })
  code: string;

  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  email: string;

  @IsString({ message: 'Nova senha deve ser uma string' })
  @IsNotEmpty({ message: 'Nova senha é obrigatória' })
  @MinLength(6, { message: 'Senha deve ter pelo menos 6 caracteres' })
  newPassword: string;
}

