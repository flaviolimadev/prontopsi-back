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
    private emailService: EmailService, // Adicionar EmailService
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { email } });
    
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    
    return null;
  }

  async login(loginDto: LoginUserDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    if (user.status !== 1) {
      throw new UnauthorizedException('Usuário inativo');
    }

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
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  async register(createUserDto: CreateUserDto) {
    // Validar campos obrigatórios
    if (!createUserDto.nome || !createUserDto.sobrenome || !createUserDto.email || 
        !createUserDto.password || !createUserDto.contato) {
      throw new BadRequestException('Nome, sobrenome, email, senha e contato são obrigatórios');
    }

    // Verificar se o email já existe
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email já cadastrado');
    }

    // Verificar se o código de referência existe (se fornecido)
    if (createUserDto.referredAt) {
      const referredUser = await this.userRepository.findOne({
        where: { code: createUserDto.referredAt },
      });

      if (!referredUser) {
        throw new ConflictException('Código de referência inválido');
      }
    }

    // Criar hash da senha
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(createUserDto.password, saltRounds);

    // Criar usuário
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    const savedUser = await this.userRepository.save(user);

    // Enviar email de boas-vindas
    try {
      await this.emailService.sendWelcomeEmail(
        savedUser.email,
        savedUser.nome
      );
    } catch (error) {
      // Log do erro mas não falhar o registro
      console.error('Erro ao enviar email de boas-vindas:', error);
    }

    const { password, ...result } = savedUser;
    return result;
  }

  async requestPasswordReset(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    
    if (!user) {
      // Por segurança, não revelar se o email existe ou não
      return { message: 'Se o email existir, você receberá um link de recuperação' };
    }

    // Gerar token de reset (implementar lógica de token)
    const resetToken = this.generateResetToken();
    
    // Salvar token no banco (implementar entidade para tokens de reset)
    // await this.saveResetToken(user.id, resetToken);

    // Gerar código de reset
    const resetCode = this.generateResetCode();
    
    // Enviar email de recuperação
    try {
      await this.emailService.sendPasswordResetEmail(
        user.email,
        resetToken,
        resetCode,
        user.nome
      );
    } catch (error) {
      console.error('Erro ao enviar email de recuperação:', error);
      throw new BadRequestException('Erro ao enviar email de recuperação');
    }

    return { message: 'Email de recuperação enviado com sucesso' };
  }

  async resetPassword(token: string, newPassword: string) {
    // Validar token (implementar lógica)
    // const resetToken = await this.validateResetToken(token);
    
    // if (!resetToken) {
    //   throw new BadRequestException('Token inválido ou expirado');
    // }

    // Atualizar senha
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // await this.userRepository.update(resetToken.userId, { password: hashedPassword });
    
    // Invalidar token usado
    // await this.invalidateResetToken(token);

    return { message: 'Senha alterada com sucesso' };
  }

  private generateResetToken(): string {
    // Implementar geração de token seguro
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  private generateResetCode(): string {
    // Gerar código de 6 dígitos
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // ... outros métodos existentes
}
