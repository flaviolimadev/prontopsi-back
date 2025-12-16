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
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { CreateUserDto, LoginUserDto, UpdateUserDto } from '../dto/user.dto';
import { RequestPasswordResetDto, VerifyResetCodeDto, ResetPasswordWithCodeDto } from '../dto/password-reset.dto';
import { TrialService } from '../services/trial.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private trialService: TrialService,
  ) {}

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

  // ========== ENDPOINTS DE TRIAL ==========

  @UseGuards(JwtAuthGuard)
  @Post('start-trial')
  async startTrial(
    @Request() req,
    @Body() body: { planType: 'pro' | 'advanced' },
  ) {
    console.log('🚀 AuthController.startTrial: Recebido:', {
      userId: req.user?.sub,
      planType: body?.planType,
      body: JSON.stringify(body),
    });
    
    try {
      const user = await this.trialService.startTrial(req.user.sub, body.planType);
      console.log('✅ AuthController.startTrial: Trial iniciado com sucesso');
      return {
        success: true,
        message: 'Trial iniciado com sucesso',
        data: {
          planType: user.planType,
          subscriptionStatus: user.subscriptionStatus,
          trialEndsAt: user.trialEndsAt,
          trialDaysRemaining: user.getTrialDaysRemaining(),
        },
      };
    } catch (error) {
      console.error('❌ AuthController.startTrial: Erro:', error.message, error.stack);
      throw new BadRequestException(error.message);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('trial-info')
  async getTrialInfo(@Request() req) {
    console.log('📊 AuthController.getTrialInfo: Buscando info para userId:', req.user.sub);
    const info = await this.trialService.getTrialInfo(req.user.sub);
    console.log('📊 AuthController.getTrialInfo: Dados retornados:', JSON.stringify(info, null, 2));
    return {
      success: true,
      data: info,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('can-start-trial')
  async canStartTrial(@Request() req) {
    const canStart = await this.trialService.canStartTrial(req.user.sub);
    return {
      success: true,
      canStartTrial: canStart,
    };
  }
} 