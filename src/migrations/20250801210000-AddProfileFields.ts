import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProfileFields1703120000000 implements MigrationInterface {
    name = 'AddProfileFields1703120000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Adicionar colunas de perfil à tabela users
        await queryRunner.query(`
            ALTER TABLE "users" 
            ADD COLUMN IF NOT EXISTS "phone" varchar(20) NULL,
            ADD COLUMN IF NOT EXISTS "crp" varchar(20) NULL,
            ADD COLUMN IF NOT EXISTS "clinic_name" varchar(255) NULL,
            ADD COLUMN IF NOT EXISTS "address" text NULL,
            ADD COLUMN IF NOT EXISTS "bio" text NULL,
            ADD COLUMN IF NOT EXISTS "whatsapp_number" varchar(20) NULL,
            ADD COLUMN IF NOT EXISTS "whatsapp_reports_enabled" boolean NOT NULL DEFAULT false,
            ADD COLUMN IF NOT EXISTS "whatsapp_report_time" varchar(5) NULL,
            ADD COLUMN IF NOT EXISTS "report_config" json NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remover colunas de perfil da tabela users
        await queryRunner.query(`
            ALTER TABLE "users" 
            DROP COLUMN IF EXISTS "phone",
            DROP COLUMN IF EXISTS "crp",
            DROP COLUMN IF EXISTS "clinic_name",
            DROP COLUMN IF EXISTS "address",
            DROP COLUMN IF EXISTS "bio",
            DROP COLUMN IF EXISTS "whatsapp_number",
            DROP COLUMN IF EXISTS "whatsapp_reports_enabled",
            DROP COLUMN IF EXISTS "whatsapp_report_time",
            DROP COLUMN IF EXISTS "report_config"
        `);
    }
} 