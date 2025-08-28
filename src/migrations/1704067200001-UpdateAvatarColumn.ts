import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateAvatarColumn1704067200001 implements MigrationInterface {
  name = 'UpdateAvatarColumn1704067200001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users" 
      ALTER COLUMN "avatar" TYPE VARCHAR(1000)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users" 
      ALTER COLUMN "avatar" TYPE VARCHAR(255)
    `);
  }
}








