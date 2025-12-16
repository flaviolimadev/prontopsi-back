import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreatePagamentosTable1704067200001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Verificar se a tabela já existe
    const tableExists = await queryRunner.hasTable('pagamentos');
    
    if (!tableExists) {
      await queryRunner.query(`
        CREATE TABLE "pagamentos" (
          "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
          "user_id" uuid NOT NULL,
          "paciente_id" uuid NOT NULL,
          "pacote_id" uuid,
          "agenda_sessao_id" uuid,
          "value" decimal(10,2) NOT NULL,
          "data" date NOT NULL,
          "vencimento" date NOT NULL,
          "descricao" text,
          "status" int DEFAULT 0,
          "type" int,
          "txid" varchar(255),
          "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
          "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
        )
      `);
    }

    // Adicionar foreign keys se não existirem
    const addForeignKey = async (constraintName: string, column: string, referencedTable: string, referencedColumn: string, onDelete: string) => {
      try {
        await queryRunner.query(`
          ALTER TABLE "pagamentos" 
          ADD CONSTRAINT "${constraintName}" 
          FOREIGN KEY ("${column}") 
          REFERENCES "${referencedTable}"("${referencedColumn}") 
          ON DELETE ${onDelete}
        `);
      } catch (error) {
        // Se a constraint já existe, ignorar o erro
        console.log(`Foreign key ${constraintName} já existe`);
      }
    };

    await addForeignKey('FK_pagamentos_user_id', 'user_id', 'users', 'id', 'CASCADE');
    await addForeignKey('FK_pagamentos_paciente_id', 'paciente_id', 'pacientes', 'id', 'CASCADE');
    await addForeignKey('FK_pagamentos_pacote_id', 'pacote_id', 'pacotes', 'id', 'SET NULL');
    await addForeignKey('FK_pagamentos_agenda_sessao_id', 'agenda_sessao_id', 'agenda_sessoes', 'id', 'SET NULL');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('pagamentos');
  }
} 