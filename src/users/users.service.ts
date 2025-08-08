import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere, Not } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from '../dto/user.dto';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // CREATE - Criar novo usuário
  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    // Verificar se email já existe
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email }
    });

    if (existingUser) {
      throw new ConflictException('Email já está em uso');
    }

    // Gerar código único
    const code = this.generateUniqueCode();

    // Hash da senha
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Criar usuário
    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
      code,
      status: createUserDto.status || 1,
      pontos: createUserDto.pontos || 0,
      nivelId: createUserDto.nivelId || 1,
    });

    const savedUser = await this.usersRepository.save(user);
    return this.toResponseDto(savedUser);
  }

  // READ - Buscar todos os usuários (com paginação e filtros)
  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: number,
    nivelId?: number,
  ): Promise<{ users: UserResponseDto[]; total: number; page: number; totalPages: number }> {
    const skip = (page - 1) * limit;
    const whereConditions: FindOptionsWhere<User> = {};

    // Aplicar filtros
    if (search) {
      whereConditions.nome = Like(`%${search}%`);
    }
    if (status !== undefined) {
      whereConditions.status = status;
    }
    if (nivelId !== undefined) {
      whereConditions.nivelId = nivelId;
    }

    const [users, total] = await this.usersRepository.findAndCount({
      where: whereConditions,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      users: users.map(user => this.toResponseDto(user)),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // READ - Buscar usuário por ID
  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne({
      where: { id }
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return this.toResponseDto(user);
  }

  // READ - Buscar usuário por email
  async findByEmail(email: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { email }
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return user;
  }

  // READ - Buscar usuário por código
  async findByCode(code: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne({
      where: { code }
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return this.toResponseDto(user);
  }

  // UPDATE - Atualizar usuário
  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    console.log('Dados recebidos para atualização:', JSON.stringify(updateUserDto, null, 2));
    
    const user = await this.usersRepository.findOne({
      where: { id }
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Verificar se email já existe (se estiver sendo alterado)
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.usersRepository.findOne({
        where: { email: updateUserDto.email }
      });

      if (existingUser) {
        throw new ConflictException('Email já está em uso');
      }
    }

    // Hash da senha se estiver sendo alterada
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    // Atualizar usuário
    await this.usersRepository.update(id, updateUserDto);
    
    const updatedUser = await this.usersRepository.findOne({
      where: { id }
    });

    if (!updatedUser) {
      throw new NotFoundException('Usuário não encontrado após atualização');
    }

    return this.toResponseDto(updatedUser);
  }

  // DELETE - Deletar usuário
  async remove(id: string): Promise<{ message: string }> {
    const user = await this.usersRepository.findOne({
      where: { id }
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    await this.usersRepository.remove(user);

    return { message: 'Usuário deletado com sucesso' };
  }

  // SOFT DELETE - Desativar usuário
  async deactivate(id: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne({
      where: { id }
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    user.status = 0;
    const updatedUser = await this.usersRepository.save(user);

    return this.toResponseDto(updatedUser);
  }

  // REACTIVATE - Reativar usuário
  async reactivate(id: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne({
      where: { id }
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    user.status = 1;
    const updatedUser = await this.usersRepository.save(user);

    return this.toResponseDto(updatedUser);
  }

  // UPDATE PONTOS - Atualizar pontos do usuário
  async updatePontos(id: string, pontos: number): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne({
      where: { id }
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    user.pontos = pontos;
    const updatedUser = await this.usersRepository.save(user);

    return this.toResponseDto(updatedUser);
  }

  // UPDATE NÍVEL - Atualizar nível do usuário
  async updateNivel(id: string, nivelId: number): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne({
      where: { id }
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    user.nivelId = nivelId;
    const updatedUser = await this.usersRepository.save(user);

    return this.toResponseDto(updatedUser);
  }

  // UPDATE PLANO - Atualizar plano do usuário
  async updatePlano(id: string, planoId: string | null): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne({
      where: { id }
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    user.planoId = planoId;
    const updatedUser = await this.usersRepository.save(user);

    return this.toResponseDto(updatedUser);
  }

  // STATISTICS - Estatísticas dos usuários
  async getStatistics(): Promise<{
    total: number;
    active: number;
    inactive: number;
    premium: number;
    free: number;
  }> {
    const [total, active, inactive] = await Promise.all([
      this.usersRepository.count(),
      this.usersRepository.count({ where: { status: 1 } }),
      this.usersRepository.count({ where: { status: 0 } }),
    ]);

    // Contar usuários premium e free separadamente para evitar problemas de tipo
    const premium = await this.usersRepository
      .createQueryBuilder('user')
      .where('user.planoId IS NOT NULL')
      .getCount();

    const free = await this.usersRepository
      .createQueryBuilder('user')
      .where('user.planoId IS NULL')
      .getCount();

    return {
      total,
      active,
      inactive,
      premium,
      free,
    };
  }

  // CHANGE PASSWORD - Alterar senha do usuário
  async changePassword(id: string, currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const user = await this.usersRepository.findOne({
      where: { id }
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Verificar senha atual
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Senha atual incorreta');
    }

    // Hash da nova senha
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Atualizar senha
    user.password = hashedNewPassword;
    await this.usersRepository.save(user);

    return { message: 'Senha alterada com sucesso' };
  }

  // UPLOAD AVATAR - Upload de avatar do usuário
  async uploadAvatar(id: string, file: Express.Multer.File): Promise<UserResponseDto> {
    console.log('Iniciando upload de avatar para usuário:', id);
    console.log('Dados do arquivo:', {
      originalname: file?.originalname,
      mimetype: file?.mimetype,
      size: file?.size,
      buffer: file?.buffer ? 'presente' : 'ausente'
    });

    const user = await this.usersRepository.findOne({
      where: { id }
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (!file) {
      throw new BadRequestException('Nenhum arquivo foi enviado');
    }

    if (!file.buffer) {
      throw new BadRequestException('Arquivo não possui buffer válido');
    }

    try {
      // Gerar nome único para o arquivo (remover espaços e caracteres especiais)
      const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${id}-${Date.now()}-${sanitizedName}`;
      const filePath = `uploads/avatars/${fileName}`;

      // Salvar o arquivo no sistema de arquivos
      const fs = require('fs');
      const path = require('path');
      
      // Criar diretório se não existir
      const uploadDir = path.join(process.cwd(), 'uploads', 'avatars');
      console.log('Diretório de upload:', uploadDir);
      
      if (!fs.existsSync(uploadDir)) {
        console.log('Criando diretório de upload...');
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const fullPath = path.join(uploadDir, fileName);
      console.log('Salvando arquivo em:', fullPath);

      // Salvar arquivo
      fs.writeFileSync(fullPath, file.buffer);
      console.log('Arquivo salvo com sucesso');

      // Atualizar avatar do usuário com URL relativa (será servida pelo static assets)
      const avatarUrl = `/uploads/avatars/${fileName}`;
      user.avatar = avatarUrl;
      const updatedUser = await this.usersRepository.save(user);
      console.log('Avatar atualizado no banco:', avatarUrl);

      return this.toResponseDto(updatedUser);
    } catch (error) {
      console.error('Erro ao salvar avatar:', error);
      throw new BadRequestException(`Erro ao salvar avatar: ${error.message}`);
    }
  }

  // DELETE AVATAR - Deletar avatar do usuário
  async deleteAvatar(id: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne({
      where: { id }
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    user.avatar = null;
    const updatedUser = await this.usersRepository.save(user);

    return this.toResponseDto(updatedUser);
  }

  // EXPORT USER DATA - Exportar dados do usuário
  async exportUserData(id: string): Promise<any> {
    const user = await this.usersRepository.findOne({
      where: { id }
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Retornar dados do usuário para exportação
    return {
      user: this.toResponseDto(user),
      exportDate: new Date().toISOString(),
      format: 'json'
    };
  }

  // Métodos auxiliares
  private generateUniqueCode(): string {
    return uuidv4().substring(0, 8).toUpperCase();
  }

  private toResponseDto(user: User): UserResponseDto {
    return {
      id: user.id,
      nome: user.nome,
      sobrenome: user.sobrenome,
      email: user.email,
      code: user.code,
      contato: user.contato,
      phone: user.phone,
      crp: user.crp,
      clinicName: user.clinicName,
      address: user.address,
      bio: user.bio,
      whatsappNumber: user.whatsappNumber,
      whatsappReportsEnabled: user.whatsappReportsEnabled,
      whatsappReportTime: user.whatsappReportTime,
      reportConfig: user.reportConfig,
      status: user.status,
      pontos: user.pontos,
      nivelId: user.nivelId,
      planoId: user.planoId,
      avatar: user.avatar,
      descricao: user.descricao,
      referredAt: user.referredAt,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }
} 