import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdatePacotesTableSchema1765210569857 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Verificar se a tabela existe
    const tableExists = await queryRunner.hasTable('pacotes');
    
    if (!tableExists) {
      // Se a tabela não existe, criar com o schema correto
      await queryRunner.query(`
        CREATE TABLE "pacotes" (
          "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
          "user_id" uuid NOT NULL,
          "paciente_id" uuid,
          "nome" varchar(255) NOT NULL,
          "descricao" text,
          "sessoes_total" integer NOT NULL DEFAULT 0,
          "sessoes_usadas" integer NOT NULL DEFAULT 0,
          "valor_total" decimal(10,2) NOT NULL DEFAULT 0,
          "valor_por_sessao" decimal(10,2) NOT NULL DEFAULT 0,
          "data_inicio" date NOT NULL,
          "data_fim" date,
          "status" integer NOT NULL DEFAULT 1,
          "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
          "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Adicionar foreign key
      await queryRunner.query(`
        ALTER TABLE "pacotes" 
        ADD CONSTRAINT "FK_pacotes_user_id" 
        FOREIGN KEY ("user_id") 
        REFERENCES "users"("id") 
        ON DELETE CASCADE
      `);
      
      return;
    }

    // Se a tabela existe, verificar e atualizar colunas
    const hasOldColumns = await queryRunner.hasColumn('pacotes', 'value');
    const hasNewColumns = await queryRunner.hasColumn('pacotes', 'valor_total');

    // Se tem colunas antigas e não tem as novas, migrar
    if (hasOldColumns && !hasNewColumns) {
      // Migrar dados das colunas antigas para as novas
      await queryRunner.query(`
        ALTER TABLE "pacotes"
        ADD COLUMN IF NOT EXISTS "paciente_id" uuid,
        ADD COLUMN IF NOT EXISTS "nome" varchar(255),
        ADD COLUMN IF NOT EXISTS "sessoes_total" integer DEFAULT 0,
        ADD COLUMN IF NOT EXISTS "sessoes_usadas" integer DEFAULT 0,
        ADD COLUMN IF NOT EXISTS "valor_total" decimal(10,2),
        ADD COLUMN IF NOT EXISTS "valor_por_sessao" decimal(10,2),
        ADD COLUMN IF NOT EXISTS "data_inicio" date,
        ADD COLUMN IF NOT EXISTS "data_fim" date,
        ADD COLUMN IF NOT EXISTS "status" integer
      `);

      // Migrar dados
      await queryRunner.query(`
        UPDATE "pacotes"
        SET 
          "nome" = COALESCE("title", 'Pacote sem nome'),
          "valor_total" = COALESCE("value", 0),
          "valor_por_sessao" = COALESCE("value", 0),
          "sessoes_total" = 0,
          "sessoes_usadas" = 0,
          "data_inicio" = CURRENT_DATE,
          "status" = CASE WHEN "ativo" = true THEN 1 ELSE 0 END
      `);

      // Tornar colunas obrigatórias
      await queryRunner.query(`
        ALTER TABLE "pacotes"
        ALTER COLUMN "nome" SET NOT NULL,
        ALTER COLUMN "valor_total" SET NOT NULL,
        ALTER COLUMN "valor_por_sessao" SET NOT NULL,
        ALTER COLUMN "sessoes_total" SET NOT NULL,
        ALTER COLUMN "sessoes_usadas" SET NOT NULL,
        ALTER COLUMN "data_inicio" SET NOT NULL,
        ALTER COLUMN "status" SET NOT NULL
      `);

      // Remover colunas antigas
      await queryRunner.query(`
        ALTER TABLE "pacotes"
        DROP COLUMN IF EXISTS "value",
        DROP COLUMN IF EXISTS "title",
        DROP COLUMN IF EXISTS "ativo"
      `);
    } else if (!hasNewColumns) {
      // Se não tem as novas colunas, adicionar
      await queryRunner.query(`
        ALTER TABLE "pacotes"
        ADD COLUMN IF NOT EXISTS "paciente_id" uuid,
        ADD COLUMN IF NOT EXISTS "nome" varchar(255),
        ADD COLUMN IF NOT EXISTS "sessoes_total" integer DEFAULT 0,
        ADD COLUMN IF NOT EXISTS "sessoes_usadas" integer DEFAULT 0,
        ADD COLUMN IF NOT EXISTS "valor_total" decimal(10,2) DEFAULT 0,
        ADD COLUMN IF NOT EXISTS "valor_por_sessao" decimal(10,2) DEFAULT 0,
        ADD COLUMN IF NOT EXISTS "data_inicio" date DEFAULT CURRENT_DATE,
        ADD COLUMN IF NOT EXISTS "data_fim" date,
        ADD COLUMN IF NOT EXISTS "status" integer DEFAULT 1
      `);

      // Tornar colunas obrigatórias
      await queryRunner.query(`
        ALTER TABLE "pacotes"
        ALTER COLUMN "nome" SET NOT NULL,
        ALTER COLUMN "valor_total" SET NOT NULL,
        ALTER COLUMN "valor_por_sessao" SET NOT NULL,
        ALTER COLUMN "sessoes_total" SET NOT NULL,
        ALTER COLUMN "sessoes_usadas" SET NOT NULL,
        ALTER COLUMN "data_inicio" SET NOT NULL,
        ALTER COLUMN "status" SET NOT NULL
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverter para o schema antigo (se necessário)
    const hasNewColumns = await queryRunner.hasColumn('pacotes', 'valor_total');
    
    if (hasNewColumns) {
      await queryRunner.query(`
        ALTER TABLE "pacotes"
        ADD COLUMN IF NOT EXISTS "value" decimal(10,2),
        ADD COLUMN IF NOT EXISTS "title" varchar(255),
        ADD COLUMN IF NOT EXISTS "ativo" boolean DEFAULT true
      `);

      await queryRunner.query(`
        UPDATE "pacotes"
        SET 
          "title" = "nome",
          "value" = "valor_total",
          "ativo" = CASE WHEN "status" = 1 THEN true ELSE false END
      `);

      await queryRunner.query(`
        ALTER TABLE "pacotes"
        DROP COLUMN IF EXISTS "paciente_id",
        DROP COLUMN IF EXISTS "nome",
        DROP COLUMN IF EXISTS "sessoes_total",
        DROP COLUMN IF EXISTS "sessoes_usadas",
        DROP COLUMN IF EXISTS "valor_total",
        DROP COLUMN IF EXISTS "valor_por_sessao",
        DROP COLUMN IF EXISTS "data_inicio",
        DROP COLUMN IF EXISTS "data_fim",
        DROP COLUMN IF EXISTS "status"
      `);
    }
  }
}

