import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTrialFieldsToUsers1765210569866 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Adicionar campos de trial e plano
    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD COLUMN IF NOT EXISTS "plan_type" varchar(20) DEFAULT 'gratuito',
      ADD COLUMN IF NOT EXISTS "subscription_status" varchar(20) DEFAULT 'active',
      ADD COLUMN IF NOT EXISTS "trial_started_at" timestamp NULL,
      ADD COLUMN IF NOT EXISTS "trial_ends_at" timestamp NULL,
      ADD COLUMN IF NOT EXISTS "trial_used" boolean DEFAULT false,
      ADD COLUMN IF NOT EXISTS "subscription_started_at" timestamp NULL,
      ADD COLUMN IF NOT EXISTS "subscription_ends_at" timestamp NULL
    `);

    // Criar índices para performance
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_users_plan_type" ON "users" ("plan_type");
    `);
    
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_users_subscription_status" ON "users" ("subscription_status");
    `);
    
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_users_trial_ends_at" ON "users" ("trial_ends_at");
    `);

    console.log('✅ Campos de trial adicionados à tabela users');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remover índices
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_users_trial_ends_at"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_users_subscription_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_users_plan_type"`);

    // Remover colunas
    await queryRunner.query(`
      ALTER TABLE "users" 
      DROP COLUMN IF EXISTS "subscription_ends_at",
      DROP COLUMN IF EXISTS "subscription_started_at",
      DROP COLUMN IF EXISTS "trial_used",
      DROP COLUMN IF EXISTS "trial_ends_at",
      DROP COLUMN IF EXISTS "trial_started_at",
      DROP COLUMN IF EXISTS "subscription_status",
      DROP COLUMN IF EXISTS "plan_type"
    `);
  }
}

