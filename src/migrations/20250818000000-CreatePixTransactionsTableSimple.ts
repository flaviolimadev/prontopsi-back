import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreatePixTransactionsTableSimple20250818000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Primeiro, criar os tipos ENUM (se não existirem)
    try {
      await queryRunner.query(`
        CREATE TYPE "public"."pix_transaction_status_enum" AS ENUM(
          'PENDING', 'PAID', 'EXPIRED', 'CANCELLED', 'REFUNDED', 'FAILED'
        )
      `);
      console.log('✅ Tipo ENUM pix_transaction_status_enum criado');
    } catch (error) {
      console.log('ℹ️ Tipo ENUM pix_transaction_status_enum já existe');
    }

    try {
      await queryRunner.query(`
        CREATE TYPE "public"."pix_transaction_type_enum" AS ENUM(
          'CHARGE', 'SEND', 'REFUND'
        )
      `);
      console.log('✅ Tipo ENUM pix_transaction_type_enum criado');
    } catch (error) {
      console.log('ℹ️ Tipo ENUM pix_transaction_type_enum já existe');
    }

    // Verificar se a tabela já existe
    const tableExists = await queryRunner.hasTable('pix_transactions');
    
    if (tableExists) {
      console.log('ℹ️ Tabela pix_transactions já existe, pulando criação');
      return;
    }

    console.log('✅ Criando tabela pix_transactions...');
    
    // Criar a tabela principal sem foreign keys
    await queryRunner.createTable(
      new Table({
        name: 'pix_transactions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'txid',
            type: 'varchar',
            length: '100',
            isUnique: true,
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['CHARGE', 'SEND', 'REFUND'],
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['PENDING', 'PAID', 'EXPIRED', 'CANCELLED', 'REFUNDED', 'FAILED'],
            default: "'PENDING'",
          },
          {
            name: 'valor',
            type: 'int',
          },
          {
            name: 'chave',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'descricao',
            type: 'text',
          },
          {
            name: 'qrcode',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'qrcodeImage',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'devedor',
            type: 'jsonb',
          },
          {
            name: 'favorecido',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'paidAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'expiredAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'userId',
            type: 'varchar',
            length: '36',
          },
          {
            name: 'pacienteId',
            type: 'varchar',
            length: '36',
            isNullable: true,
          },
          {
            name: 'e2eId',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'refundId',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'efipayResponse',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Criar índices para performance
    await queryRunner.createIndex(
      'pix_transactions',
      new TableIndex({
        name: 'IDX_PIX_TRANSACTIONS_TXID',
        columnNames: ['txid'],
      }),
    );

    await queryRunner.createIndex(
      'pix_transactions',
      new TableIndex({
        name: 'IDX_PIX_TRANSACTIONS_USER_STATUS',
        columnNames: ['userId', 'status'],
      }),
    );

    await queryRunner.createIndex(
      'pix_transactions',
      new TableIndex({
        name: 'IDX_PIX_TRANSACTIONS_PACIENTE_STATUS',
        columnNames: ['pacienteId', 'status'],
      }),
    );

    await queryRunner.createIndex(
      'pix_transactions',
      new TableIndex({
        name: 'IDX_PIX_TRANSACTIONS_CREATED_AT',
        columnNames: ['createdAt'],
      }),
    );

    await queryRunner.createIndex(
      'pix_transactions',
      new TableIndex({
        name: 'IDX_PIX_TRANSACTIONS_STATUS',
        columnNames: ['status'],
      }),
    );

    // Criar trigger para atualizar updatedAt
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updatedAt = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    await queryRunner.query(`
      CREATE TRIGGER update_pix_transactions_updated_at
      BEFORE UPDATE ON pix_transactions
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `);

    console.log('✅ Tabela pix_transactions criada com sucesso (sem foreign keys)');
    console.log('⚠️  Foreign keys devem ser criadas manualmente após verificar as tabelas existentes');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remover trigger
    await queryRunner.query(`
      DROP TRIGGER IF EXISTS update_pix_transactions_updated_at ON pix_transactions;
    `);

    // Remover função
    await queryRunner.query(`
      DROP FUNCTION IF EXISTS update_updated_at_column();
    `);

    // Remover índices
    await queryRunner.dropIndex('pix_transactions', 'IDX_PIX_TRANSACTIONS_TXID');
    await queryRunner.dropIndex('pix_transactions', 'IDX_PIX_TRANSACTIONS_USER_STATUS');
    await queryRunner.dropIndex('pix_transactions', 'IDX_PIX_TRANSACTIONS_PACIENTE_STATUS');
    await queryRunner.dropIndex('pix_transactions', 'IDX_PIX_TRANSACTIONS_CREATED_AT');
    await queryRunner.dropIndex('pix_transactions', 'IDX_PIX_TRANSACTIONS_STATUS');

    // Remover tabela
    await queryRunner.dropTable('pix_transactions');

    // Remover tipos ENUM
    await queryRunner.query(`
      DROP TYPE IF EXISTS "public"."pix_transaction_status_enum";
    `);
    await queryRunner.query(`
      DROP TYPE IF EXISTS "public"."pix_transaction_type_enum";
    `);
  }
}
