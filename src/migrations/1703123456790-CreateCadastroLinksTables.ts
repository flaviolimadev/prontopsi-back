import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateCadastroLinksTables1703123456790 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Criar tabela cadastro_links
    await queryRunner.createTable(
      new Table({
        name: 'cadastro_links',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'userId',
            type: 'uuid',
          },
          {
            name: 'token',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'title',
            type: 'varchar',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
          },
          {
            name: 'maxUses',
            type: 'int',
            default: 0,
          },
          {
            name: 'currentUses',
            type: 'int',
            default: 0,
          },
          {
            name: 'expiresAt',
            type: 'timestamp',
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
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
    );

    // Criar tabela cadastro_submissions
    await queryRunner.createTable(
      new Table({
        name: 'cadastro_submissions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'cadastroLinkId',
            type: 'uuid',
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['pending', 'approved', 'rejected'],
            default: "'pending'",
          },
          {
            name: 'pacienteData',
            type: 'json',
          },
          {
            name: 'observacoes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'approvedPacienteId',
            type: 'uuid',
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
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
    );

    // Adicionar foreign keys
    await queryRunner.createForeignKey(
      'cadastro_links',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'cadastro_submissions',
      new TableForeignKey({
        columnNames: ['cadastroLinkId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'cadastro_links',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'cadastro_submissions',
      new TableForeignKey({
        columnNames: ['approvedPacienteId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'pacientes',
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remover foreign keys
    const cadastroSubmissionsTable = await queryRunner.getTable('cadastro_submissions');
    const cadastroLinksTable = await queryRunner.getTable('cadastro_links');

    if (cadastroSubmissionsTable) {
      const approvedPacienteForeignKey = cadastroSubmissionsTable.foreignKeys.find(
        fk => fk.columnNames.indexOf('approvedPacienteId') !== -1,
      );
      if (approvedPacienteForeignKey) {
        await queryRunner.dropForeignKey('cadastro_submissions', approvedPacienteForeignKey);
      }

      const cadastroLinkForeignKey = cadastroSubmissionsTable.foreignKeys.find(
        fk => fk.columnNames.indexOf('cadastroLinkId') !== -1,
      );
      if (cadastroLinkForeignKey) {
        await queryRunner.dropForeignKey('cadastro_submissions', cadastroLinkForeignKey);
      }
    }

    if (cadastroLinksTable) {
      const userForeignKey = cadastroLinksTable.foreignKeys.find(
        fk => fk.columnNames.indexOf('userId') !== -1,
      );
      if (userForeignKey) {
        await queryRunner.dropForeignKey('cadastro_links', userForeignKey);
      }
    }

    // Remover tabelas
    await queryRunner.dropTable('cadastro_submissions');
    await queryRunner.dropTable('cadastro_links');
  }
}
