import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreatePacientesTable1703123456789 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'pacientes',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'nome',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'endereco',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'telefone',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'profissao',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'nascimento',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'cpf',
            type: 'varchar',
            length: '14',
            isNullable: true,
          },
          {
            name: 'genero',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'observacao_geral',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'contato_emergencia',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'medicacoes',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'int',
            default: 0,
            isNullable: false,
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
        foreignKeys: [
          {
            columnNames: ['user_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'users',
            onDelete: 'CASCADE',
          },
        ],
      }),
      true,
    );

    // Adicionar índices para melhor performance
    await queryRunner.query(`
      CREATE INDEX idx_pacientes_user_id ON pacientes(user_id);
      CREATE INDEX idx_pacientes_nome ON pacientes(nome);
      CREATE INDEX idx_pacientes_cpf ON pacientes(cpf);
      CREATE INDEX idx_pacientes_email ON pacientes(email);
      CREATE INDEX idx_pacientes_status ON pacientes(status);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('pacientes');
  }
} 