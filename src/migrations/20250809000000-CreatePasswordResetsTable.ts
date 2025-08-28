import { MigrationInterface, QueryRunner, Table, ForeignKey } from 'typeorm';

export class CreatePasswordResetsTable20250809000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'password_resets',
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
            name: 'reset_token',
            type: 'varchar',
            length: '255',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'reset_code',
            type: 'varchar',
            length: '6',
            isNullable: false,
          },
          {
            name: 'expires_at',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'used',
            type: 'boolean',
            default: false,
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
        indices: [
          {
            name: 'IDX_PASSWORD_RESETS_USER_ID',
            columnNames: ['user_id'],
          },
          {
            name: 'IDX_PASSWORD_RESETS_TOKEN',
            columnNames: ['reset_token'],
            isUnique: true,
          },
          {
            name: 'IDX_PASSWORD_RESETS_CODE',
            columnNames: ['reset_code'],
          },
          {
            name: 'IDX_PASSWORD_RESETS_EXPIRES_AT',
            columnNames: ['expires_at'],
          },
        ],
        foreignKeys: [
          {
            name: 'FK_PASSWORD_RESETS_USER_ID',
            columnNames: ['user_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('password_resets');
  }
}








