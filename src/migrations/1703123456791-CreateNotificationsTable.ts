import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateNotificationsTable1703123456791 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'notifications',
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
          },
          {
            name: 'title',
            type: 'varchar',
          },
          {
            name: 'message',
            type: 'text',
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['info', 'success', 'warning', 'error', 'system'],
            default: "'info'",
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['unread', 'read'],
            default: "'unread'",
          },
          {
            name: 'metadata',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'action_url',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
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
      true
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('notifications');
    if (table) {
      const foreignKey = table.foreignKeys.find(fk => fk.columnNames.indexOf('user_id') !== -1);
      if (foreignKey) {
        await queryRunner.dropForeignKey('notifications', foreignKey);
      }
    }
    await queryRunner.dropTable('notifications');
  }
}
