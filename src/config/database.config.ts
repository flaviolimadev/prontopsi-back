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
  
  // Configurações de sincronização (apenas para desenvolvimento)
  synchronize: configService.get<string>('NODE_ENV') === 'development',
  
  // Configurações de logging
  logging: configService.get<string>('NODE_ENV') === 'development',
  
  // Estratégia de nomenclatura (snake_case para o banco)
  namingStrategy: new SnakeNamingStrategy(),
  
  // Configurações de SSL (para produção)
  ssl: configService.get<string>('NODE_ENV') === 'production' 
    ? { rejectUnauthorized: false } 
    : false,
  
  // Configurações de pool de conexões
  extra: {
    max: 20,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
  },
}); 