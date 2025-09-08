import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
 

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
  
  // Subscribers
  subscribers: [__dirname + '/../**/*.subscriber{.ts,.js}'],
  
  // Configurações de sincronização
  synchronize: false,
  
  // Configurações de logging
  logging: false,
  
  // Estratégia de nomenclatura removida para manter nomes camelCase conforme migrations existentes
  
  // Configurações de SSL - Desabilitado para compatibilidade com servidor
  ssl: false,
  
  // Configurações de pool de conexões
  extra: {
    max: 5,
    min: 1,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
  },
}); 