import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddEmailVerificationFields1703123456791 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('users', [
      new TableColumn({
        name: 'email_verified',
        type: 'boolean',
        default: false,
        isNullable: false,
      }),
      new TableColumn({
        name: 'email_verification_code',
        type: 'varchar',
        length: '6',
        isNullable: true,
      }),
      new TableColumn({
        name: 'email_verification_expires',
        type: 'timestamp',
        isNullable: true,
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns('users', [
      'email_verified',
      'email_verification_code',
      'email_verification_expires',
    ]);
  }
}
