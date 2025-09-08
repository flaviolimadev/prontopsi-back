import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Usuário não autenticado');
    }

    // Buscar usuário no banco para verificar isAdmin
    const dbUser = await this.usersRepository.findOne({
      where: { id: user.sub },
      select: ['id', 'isAdmin']
    });

    if (!dbUser) {
      throw new ForbiddenException('Usuário não encontrado');
    }

    if (!dbUser.isAdmin) {
      throw new ForbiddenException('Acesso negado. Privilégios de administrador necessários.');
    }

    return true;
  }
}
