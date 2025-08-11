import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeUserAvatarToText20250812000001 implements MigrationInterface {
  name = 'ChangeUserAvatarToText20250812000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      ALTER COLUMN "avatar" TYPE TEXT
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      ALTER COLUMN "avatar" TYPE VARCHAR(1000)
    `);
  }
}
