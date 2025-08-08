import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCorToPacientes1703123456791 implements MigrationInterface {
    name = 'AddCorToPacientes1703123456791'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pacientes" ADD "cor" character varying(7)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pacientes" DROP COLUMN "cor"`);
    }
}
