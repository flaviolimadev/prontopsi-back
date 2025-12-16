import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAnamnesesTable1705000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const exists = await queryRunner.hasTable('anamneses');
    if (!exists) {
      await queryRunner.query(`
        CREATE TABLE "anamneses" (
          "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
          "user_id" uuid NOT NULL,
          "paciente_id" uuid NOT NULL,
          "tipo" varchar(16) NOT NULL,
          "respostas" jsonb NOT NULL DEFAULT '{}'::jsonb,
          "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
          "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
        )
      `);
      await queryRunner.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS "UQ_anamneses_user_paciente" ON "anamneses" ("user_id", "paciente_id")
      `);
      // FKs
      await queryRunner.query(`
        ALTER TABLE "anamneses" ADD CONSTRAINT "FK_anamneses_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      `);
      await queryRunner.query(`
        ALTER TABLE "anamneses" ADD CONSTRAINT "FK_anamneses_paciente_id" FOREIGN KEY ("paciente_id") REFERENCES "pacientes"("id") ON DELETE CASCADE
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS "anamneses"');
  }
}


