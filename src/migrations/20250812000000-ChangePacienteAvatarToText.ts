import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangePacienteAvatarToText20250812000000 implements MigrationInterface {
  name = 'ChangePacienteAvatarToText20250812000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "pacientes"
      ALTER COLUMN "avatar" TYPE TEXT
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "pacientes"
      ALTER COLUMN "avatar" TYPE VARCHAR(1000)
    `);
  }
}
