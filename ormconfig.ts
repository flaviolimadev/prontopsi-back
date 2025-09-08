import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import * as dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'prontopsi_db',
  
  // Entidades e Migrations
  entities: ['src/entities/*.entity{.ts,.js}'],
  migrations: ['src/migrations/*{.ts,.js}'],
  migrationsTableName: 'migrations',
  
  // Estratégia de nomenclatura - REMOVIDA para evitar conflitos com migrations existentes
  // namingStrategy: new SnakeNamingStrategy(),
  
  // Configurações de logging
  logging: process.env.NODE_ENV === 'development',
  
  // Configurações de SSL - Desabilitado para compatibilidade com servidor
  ssl: false,
}); 