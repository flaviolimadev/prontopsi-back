import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAvatarToPacientes1704067200002 implements MigrationInterface {
  name = 'AddAvatarToPacientes1704067200002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "pacientes" 
      ADD COLUMN "avatar" VARCHAR(1000)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "pacientes" 
      DROP COLUMN "avatar"
    `);
  }
}

