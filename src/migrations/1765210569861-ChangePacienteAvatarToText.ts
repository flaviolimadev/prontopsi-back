import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangePacienteAvatarToText1765210569861 implements MigrationInterface {
  name = 'ChangePacienteAvatarToText1765210569861';

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
