import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { CreateUserDto, LoginUserDto, UpdateUserDto } from '../dto/user.dto';
import { RequestPasswordResetDto, VerifyResetCodeDto, ResetPasswordWithCodeDto } from '../dto/password-reset.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginUserDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Request() req) {
    return this.authService.logout(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Request() req) {
    return this.authService.getProfile(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async updateProfile(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    return this.authService.updateProfile(req.user.sub, updateUserDto);
  }

  @Get('user/:code')
  async getUserByCode(@Request() req) {
    const code = req.params.code;
    return this.authService.getUserByCode(code);
  }

  @Post('verify-email')
  async verifyEmail(@Body() body: { email: string; verificationCode: string }) {
    return this.authService.verifyEmail(body.email, body.verificationCode);
  }

  @Post('resend-verification')
  async resendVerificationCode(@Body() body: { email: string }) {
    return this.authService.resendVerificationCode(body.email);
  }

  @Post('request-password-reset')
  async requestPasswordReset(@Body() requestDto: RequestPasswordResetDto) {
    return this.authService.requestPasswordReset(requestDto);
  }

  @Post('verify-reset-code')
  async verifyResetCode(@Body() verifyDto: VerifyResetCodeDto) {
    return this.authService.verifyResetCode(verifyDto);
  }

  @Post('reset-password')
  async resetPassword(@Body() resetDto: ResetPasswordWithCodeDto) {
    return this.authService.resetPasswordWithCode(resetDto);
  }
} 