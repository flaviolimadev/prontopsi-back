import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUniqueIndexAgendaSessoes1765210569864 implements MigrationInterface {
  name = 'AddUniqueIndexAgendaSessoes1765210569864';

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
