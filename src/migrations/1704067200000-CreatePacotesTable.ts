import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreatePacotesTable1704067200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Verificar se a tabela já existe
    const tableExists = await queryRunner.hasTable('pacotes');
    
    if (!tableExists) {
      await queryRunner.query(`
        CREATE TABLE "pacotes" (
          "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
          "user_id" uuid NOT NULL,
          "value" decimal(10,2) DEFAULT 0,
          "title" varchar(255) NOT NULL,
          "descricao" text,
          "ativo" boolean DEFAULT true,
          "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
          "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
        )
      `);
    }

    // Verificar se a foreign key já existe
    const foreignKeyExists = await queryRunner.hasColumn('pacotes', 'user_id');
    if (foreignKeyExists) {
      try {
        await queryRunner.query(`
          ALTER TABLE "pacotes" 
          ADD CONSTRAINT "FK_pacotes_user_id" 
          FOREIGN KEY ("user_id") 
          REFERENCES "users"("id") 
          ON DELETE CASCADE
        `);
      } catch (error) {
        // Se a constraint já existe, ignorar o erro
        console.log('Foreign key FK_pacotes_user_id já existe');
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('pacotes');
  }
} 