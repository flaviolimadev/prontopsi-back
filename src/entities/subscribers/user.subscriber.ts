import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntitySubscriberInterface, InsertEvent } from 'typeorm';
import { User } from '../user.entity';
import { generateUniqueCode } from '../../utils/code-generator.util';

@Injectable()
export class UserSubscriber implements EntitySubscriberInterface<User> {
  constructor(@InjectDataSource() private dataSource: DataSource) {
    console.log('🔧 UserSubscriber: Construtor chamado');
    this.dataSource.subscribers.push(this);
    console.log('🔧 UserSubscriber: Subscriber registrado');
  }

  listenTo() {
    return User;
  }

  async beforeInsert(event: InsertEvent<User>) {
    console.log('🔧 UserSubscriber: beforeInsert chamado para:', event.entity.email);
    console.log('🔧 UserSubscriber: código atual:', event.entity.code);
    
    // Gera código único se não foi fornecido
    if (!event.entity.code) {
      console.log('🔧 UserSubscriber: Gerando código único...');
      event.entity.code = await this.generateUniqueCode();
      console.log('🔧 UserSubscriber: Código gerado:', event.entity.code);
    }
  }

  private async generateUniqueCode(): Promise<string> {
    const maxAttempts = 10;
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const code = generateUniqueCode();
      console.log(`🔧 UserSubscriber: Tentativa ${attempt + 1} - Código gerado:`, code);
      
      try {
        // Verifica se o código já existe
        const exists = await this.dataSource
          .getRepository(User)
          .findOne({ where: { code } });
        
        if (!exists) {
          console.log('🔧 UserSubscriber: Código único encontrado:', code);
          return code;
        } else {
          console.log('🔧 UserSubscriber: Código já existe, tentando novamente...');
        }
      } catch (error) {
        console.error('🔧 UserSubscriber: Erro ao verificar código:', error);
        // Em caso de erro, continua tentando
      }
    }
    
    console.error('🔧 UserSubscriber: Não foi possível gerar um código único após várias tentativas');
    throw new Error('Não foi possível gerar um código único após várias tentativas');
  }
} 