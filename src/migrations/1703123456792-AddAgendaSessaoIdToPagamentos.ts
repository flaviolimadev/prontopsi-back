import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAgendaSessaoIdToPagamentos1703123456792 implements MigrationInterface {
    name = 'AddAgendaSessaoIdToPagamentos1703123456792'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pagamentos" ADD "agenda_sessao_id" uuid`);
        await queryRunner.query(`ALTER TABLE "pagamentos" ADD CONSTRAINT "FK_pagamentos_agenda_sessao" FOREIGN KEY ("agenda_sessao_id") REFERENCES "agenda_sessoes"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pagamentos" DROP CONSTRAINT "FK_pagamentos_agenda_sessao"`);
        await queryRunner.query(`ALTER TABLE "pagamentos" DROP COLUMN "agenda_sessao_id"`);
    }
} 