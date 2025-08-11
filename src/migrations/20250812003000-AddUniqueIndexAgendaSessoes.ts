import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUniqueIndexAgendaSessoes20250812003000 implements MigrationInterface {
  name = 'AddUniqueIndexAgendaSessoes20250812003000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_agenda_user_data_horario" ON "agenda_sessoes" ("user_id", "data", "horario");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS "UQ_agenda_user_data_horario";
    `);
  }
}
