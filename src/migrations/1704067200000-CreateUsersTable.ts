import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateUsersTable1704067200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Habilitar extensão uuid-ossp se não estiver habilitada
    await queryRunner.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    `);

    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'nome',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'sobrenome',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'code',
            type: 'varchar',
            length: '20',
            isNullable: false,
          },
          {
            name: 'contato',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'password',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'int',
            default: 1,
            isNullable: false,
          },
          {
            name: 'pontos',
            type: 'int',
            default: 0,
            isNullable: false,
            comment: 'Valores em centavos',
          },
          {
            name: 'nivel_id',
            type: 'int',
            default: 1,
            isNullable: false,
          },
          {
            name: 'plano_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'avatar',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'descricao',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'referred_at',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
        indices: [
          {
            name: 'IDX_USERS_EMAIL_UNIQUE',
            columnNames: ['email'],
            isUnique: true,
          },
          {
            name: 'IDX_USERS_CODE_UNIQUE',
            columnNames: ['code'],
            isUnique: true,
          },
          {
            name: 'IDX_USERS_STATUS',
            columnNames: ['status'],
          },
          {
            name: 'IDX_USERS_PLANO_ID',
            columnNames: ['plano_id'],
          },
          {
            name: 'IDX_USERS_REFERRED_AT',
            columnNames: ['referred_at'],
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remover tabela (os índices serão removidos automaticamente)
    await queryRunner.dropTable('users');
  }
} 