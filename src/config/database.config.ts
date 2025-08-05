import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

export const getDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get<string>('DB_HOST', 'localhost'),
  port: configService.get<number>('DB_PORT', 5432),
  username: configService.get<string>('DB_USER', 'postgres'),
  password: configService.get<string>('DB_PASSWORD', 'password'),
  database: configService.get<string>('DB_NAME', 'prontopsi_db'),
  
  // Entidades e Migrations
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  migrationsRun: true,
  migrationsTableName: 'migrations',
  
  // Configurações de sincronização (desabilitar para melhor performance)
  synchronize: false, // configService.get<string>('NODE_ENV') === 'development',
  
  // Configurações de logging (desabilitar para melhor performance)
  logging: false, // configService.get<string>('NODE_ENV') === 'development',
  
  // Estratégia de nomenclatura (snake_case para o banco)
  namingStrategy: new SnakeNamingStrategy(),
  
  // Configurações de SSL (para produção)
  ssl: configService.get<string>('NODE_ENV') === 'production' 
    ? { rejectUnauthorized: false } 
    : false,
  
  // Configurações de pool de conexões otimizadas
  extra: {
    max: 10, // Reduzir número máximo de conexões
    min: 2,  // Manter conexões mínimas
    connectionTimeoutMillis: 10000, // Aumentar timeout de conexão
    idleTimeoutMillis: 60000, // Aumentar timeout de idle
    acquireTimeoutMillis: 10000, // Timeout para adquirir conexão
  },
  
  // Cache de queries para melhor performance
  cache: {
    duration: 30000, // 30 segundos de cache
  },
}); 