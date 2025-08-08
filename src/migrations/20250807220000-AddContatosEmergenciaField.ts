import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddContatosEmergenciaField20250807220000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE pacientes 
      ADD COLUMN contatos_emergencia JSON NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE pacientes 
      DROP COLUMN contatos_emergencia
    `);
  }
}
