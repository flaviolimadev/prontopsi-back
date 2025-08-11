import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreatePacienteArquivos20250812001000 implements MigrationInterface {
  name = 'CreatePacienteArquivos20250812001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'paciente_arquivos',
      columns: [
        { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
        { name: 'user_id', type: 'uuid', isNullable: false },
        { name: 'paciente_id', type: 'uuid', isNullable: false },
        { name: 'nome', type: 'varchar', length: '255', isNullable: false },
        { name: 'tipo', type: 'varchar', length: '255', isNullable: true },
        { name: 'tamanho', type: 'int', isNullable: true },
        { name: 'url', type: 'text', isNullable: false },
        { name: 'chave', type: 'varchar', length: '512', isNullable: true },
        { name: 'created_at', type: 'timestamp', default: 'now()' },
        { name: 'updated_at', type: 'timestamp', default: 'now()' },
      ],
      foreignKeys: [
        {
          columnNames: ['paciente_id'],
          referencedTableName: 'pacientes',
          referencedColumnNames: ['id'],
          onDelete: 'CASCADE',
        },
      ],
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "paciente_arquivos"');
  }
}
