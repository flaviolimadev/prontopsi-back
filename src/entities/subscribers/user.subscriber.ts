import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntitySubscriberInterface, InsertEvent } from 'typeorm';
import { User } from '../user.entity';
import { generateUniqueCode } from '../../utils/code-generator.util';

@Injectable()
export class UserSubscriber implements EntitySubscriberInterface<User> {
  constructor(@InjectDataSource() private dataSource: DataSource) {
    this.dataSource.subscribers.push(this);
  }

  listenTo() {
    return User;
  }

  async beforeInsert(event: InsertEvent<User>) {
    // Gera código único se não foi fornecido
    if (!event.entity.code) {
      event.entity.code = await this.generateUniqueCode();
    }
  }

  private async generateUniqueCode(): Promise<string> {
    const maxAttempts = 10;
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const code = generateUniqueCode();
      
      // Verifica se o código já existe
      const exists = await this.dataSource
        .getRepository(User)
        .findOne({ where: { code } });
      
      if (!exists) {
        return code;
      }
    }
    
    throw new Error('Não foi possível gerar um código único após várias tentativas');
  }
} 