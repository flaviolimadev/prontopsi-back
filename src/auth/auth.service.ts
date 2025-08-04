import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { CreateUserDto, LoginUserDto } from '../dto/user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
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
      status: createUserDto.status ?? 1,
      pontos: createUserDto.pontos ?? 0,
      nivelId: createUserDto.nivelId ?? 1,
    });

    // O código será gerado automaticamente pelo subscriber
    const savedUser = await this.userRepository.save(user);

    // Gerar token JWT
    const payload = { 
      sub: savedUser.id, 
      email: savedUser.email,
      code: savedUser.code 
    };

    const { password, ...userWithoutPassword } = savedUser;

    return {
      token: this.jwtService.sign(payload),
      user: userWithoutPassword,
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