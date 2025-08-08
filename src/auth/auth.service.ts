import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { CreateUserDto, LoginUserDto } from '../dto/user.dto';
import { EmailService } from '../services/email.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    console.log('🔍 AuthService: Validando usuário para email:', email);
    
    const user = await this.userRepository.findOne({ where: { email } });
    
    if (!user) {
      console.log('❌ AuthService: Usuário não encontrado para email:', email);
      return null;
    }
    
    console.log('🔍 AuthService: Usuário encontrado no banco:', {
      id: user.id,
      email: user.email,
      status: user.status,
      emailVerified: user.emailVerified
    });
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('🔍 AuthService: Senha válida:', isPasswordValid);
    
    if (isPasswordValid) {
      const { password, ...result } = user;
      console.log('✅ AuthService: Validação bem-sucedida para:', email);
      return result;
    }
    
    console.log('❌ AuthService: Senha inválida para email:', email);
    return null;
  }

  async login(loginDto: LoginUserDto) {
    console.log('🔍 AuthService: Iniciando login para email:', loginDto.email);
    
    const user = await this.validateUser(loginDto.email, loginDto.password);
    
    if (!user) {
      console.log('❌ AuthService: Credenciais inválidas para email:', loginDto.email);
      throw new UnauthorizedException('Credenciais inválidas');
    }

    console.log('🔍 AuthService: Usuário encontrado:', {
      id: user.id,
      email: user.email,
      status: user.status,
      emailVerified: user.emailVerified
    });

    // Verificar se o email foi verificado (prioridade sobre status)
    if (!user.emailVerified) {
      console.log('❌ AuthService: Email não verificado para:', loginDto.email);
      throw new UnauthorizedException('Email não verificado');
    }

    // Verificar se o usuário está ativo
    if (user.status !== 1) {
      console.log('❌ AuthService: Usuário inativo (status:', user.status, ') para email:', loginDto.email);
      throw new UnauthorizedException('Usuário inativo');
    }

    console.log('✅ AuthService: Login bem-sucedido para:', loginDto.email);

    const payload = { 
      sub: user.id, 
      email: user.email,
      code: user.code 
    };

    return {
      token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        nome: user.nome,
        sobrenome: user.sobrenome,
        email: user.email,
        code: user.code,
        contato: user.contato,
        status: user.status,
        pontos: user.pontos,
        nivelId: user.nivelId,
        planoId: user.planoId,
        avatar: user.avatar,
        descricao: user.descricao,
        referredAt: user.referredAt,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  async register(createUserDto: CreateUserDto) {
    console.log('🔍 AuthService: Iniciando registro para email:', createUserDto.email);
    
    // Validar campos obrigatórios
    if (!createUserDto.nome || !createUserDto.sobrenome || !createUserDto.email || 
        !createUserDto.password || !createUserDto.contato) {
      console.log('❌ AuthService: Campos obrigatórios faltando para:', createUserDto.email);
      throw new BadRequestException('Nome, sobrenome, email, senha e contato são obrigatórios');
    }

    // Verificar se o email já existe
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      console.log('❌ AuthService: Email já cadastrado:', createUserDto.email);
      throw new ConflictException('Email já cadastrado');
    }

    console.log('✅ AuthService: Email disponível para registro:', createUserDto.email);

    // Verificar se o código de referência existe (se fornecido)
    if (createUserDto.referredAt) {
      const referredUser = await this.userRepository.findOne({
        where: { code: createUserDto.referredAt },
      });

      if (!referredUser) {
        console.log('❌ AuthService: Código de referência inválido:', createUserDto.referredAt);
        throw new ConflictException('Código de referência inválido');
      }
      
      console.log('✅ AuthService: Código de referência válido:', createUserDto.referredAt);
    }

    // Criar hash da senha
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(createUserDto.password, saltRounds);

    // Gerar código de verificação
    const verificationCode = this.generateVerificationCode();
    const verificationExpires = new Date();
    verificationExpires.setMinutes(verificationExpires.getMinutes() + 10); // 10 minutos

    // Criar usuário
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
      status: 0, // Usuário inativo até verificar email
      pontos: createUserDto.pontos ?? 0,
      nivelId: createUserDto.nivelId ?? 1,
      emailVerified: false,
      emailVerificationCode: verificationCode,
      emailVerificationExpires: verificationExpires,
    });

    // O código será gerado automaticamente pelo subscriber
    const savedUser = await this.userRepository.save(user);

    console.log('✅ AuthService: Usuário salvo no banco:', {
      id: savedUser.id,
      email: savedUser.email,
      status: savedUser.status,
      emailVerified: savedUser.emailVerified
    });

    // Enviar email de verificação
    try {
      await this.emailService.sendEmailVerificationCode(
        savedUser.email,
        savedUser.nome,
        verificationCode
      );
      console.log('✅ AuthService: Email de verificação enviado para:', savedUser.email);
    } catch (error) {
      // Log do erro mas não falhar o registro
      console.error('❌ AuthService: Erro ao enviar email de verificação:', error);
    }

    const { password, emailVerificationCode, ...userWithoutPassword } = savedUser;

    console.log('✅ AuthService: Registro concluído com sucesso para:', savedUser.email);

    return {
      message: 'Usuário registrado com sucesso. Verifique seu email para ativar sua conta.',
      user: userWithoutPassword,
      requiresVerification: true,
    };
  }

  /**
   * Gera um código de verificação de 6 dígitos
   */
  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Verifica o código de verificação de email
   */
  async verifyEmail(email: string, verificationCode: string) {
    console.log('🔍 AuthService: Iniciando verificação de email:', email);
    console.log('🔍 AuthService: Código recebido:', verificationCode);
    
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      console.log('❌ AuthService: Usuário não encontrado para email:', email);
      throw new BadRequestException('Usuário não encontrado');
    }

    console.log('🔍 AuthService: Usuário encontrado:', {
      id: user.id,
      email: user.email,
      emailVerified: user.emailVerified,
      hasVerificationCode: !!user.emailVerificationCode,
      verificationExpires: user.emailVerificationExpires
    });

    if (user.emailVerified) {
      console.log('❌ AuthService: Email já verificado para:', email);
      throw new BadRequestException('Email já foi verificado');
    }

    if (!user.emailVerificationCode) {
      console.log('❌ AuthService: Código de verificação não encontrado para:', email);
      throw new BadRequestException('Código de verificação não encontrado');
    }

    if (user.emailVerificationCode !== verificationCode) {
      console.log('❌ AuthService: Código inválido para:', email, 'Esperado:', user.emailVerificationCode, 'Recebido:', verificationCode);
      throw new BadRequestException('Código de verificação inválido');
    }

    if (user.emailVerificationExpires && user.emailVerificationExpires < new Date()) {
      console.log('❌ AuthService: Código expirado para:', email, 'Expira em:', user.emailVerificationExpires);
      throw new BadRequestException('Código de verificação expirado');
    }

    console.log('✅ AuthService: Código válido, ativando usuário:', email);

    // Ativar usuário
    await this.userRepository.update(user.id, {
      emailVerified: true,
      status: 1,
      emailVerificationCode: null,
      emailVerificationExpires: null,
    });

    console.log('✅ AuthService: Usuário ativado com sucesso:', email);

    // Gerar token JWT
    const payload = { 
      sub: user.id, 
      email: user.email,
      code: user.code 
    };

    const { password, emailVerificationCode, ...userWithoutPassword } = user;

    return {
      message: 'Email verificado com sucesso!',
      token: this.jwtService.sign(payload),
      user: {
        ...userWithoutPassword,
        emailVerified: true,
        status: 1,
      },
    };
  }

  /**
   * Reenvia código de verificação
   */
  async resendVerificationCode(email: string) {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException('Usuário não encontrado');
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email já foi verificado');
    }

    // Gerar novo código de verificação
    const verificationCode = this.generateVerificationCode();
    const verificationExpires = new Date();
    verificationExpires.setMinutes(verificationExpires.getMinutes() + 10); // 10 minutos

    // Atualizar código no banco
    await this.userRepository.update(user.id, {
      emailVerificationCode: verificationCode,
      emailVerificationExpires: verificationExpires,
    });

    // Enviar novo email de verificação
    try {
      await this.emailService.sendEmailVerificationCode(
        user.email,
        user.nome,
        verificationCode
      );
    } catch (error) {
      console.error('Erro ao reenviar email de verificação:', error);
      throw new BadRequestException('Erro ao enviar email de verificação');
    }

    return {
      message: 'Novo código de verificação enviado com sucesso',
    };
  }

  async logout(userId: string) {
    // Em uma implementação mais robusta, você pode invalidar o token
    // Por enquanto, apenas retornamos sucesso
    return { message: 'Logout realizado com sucesso' };
  }

  async getProfile(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateProfile(userId: string, updateUserDto: any) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    // Se estiver atualizando o email, verificar se já existe
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateUserDto.email },
      });

      if (existingUser) {
        throw new ConflictException('Email já cadastrado');
      }
    }

    // Se estiver atualizando a senha, fazer hash
    if (updateUserDto.password) {
      const saltRounds = 10;
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, saltRounds);
    }

    // Atualizar usuário
    await this.userRepository.update(userId, updateUserDto);
    
    // Retornar usuário atualizado
    const updatedUser = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!updatedUser) {
      throw new UnauthorizedException('Erro ao atualizar usuário');
    }
    
    const { password, ...userWithoutPassword } = updatedUser;
    
    return userWithoutPassword;
  }

  async getUserByCode(code: string) {
    const user = await this.userRepository.findOne({ where: { code } });
    
    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async changePassword(userId: string, changePasswordDto: { currentPassword: string; newPassword: string }) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    // Verificar se a senha atual está correta
    const isCurrentPasswordValid = await bcrypt.compare(changePasswordDto.currentPassword, user.password);
    
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Senha atual incorreta');
    }

    // Criar hash da nova senha
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(changePasswordDto.newPassword, saltRounds);

    // Atualizar a senha
    await this.userRepository.update(userId, { password: hashedNewPassword });
    
    return {
      message: 'Senha alterada com sucesso',
    };
  }
} 