import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateProntuariosTable1703123456790 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "prontuarios",
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                        generationStrategy: "uuid",
                        default: "uuid_generate_v4()",
                    },
                    {
                        name: "paciente_id",
                        type: "uuid",
                    },
                    {
                        name: "user_id",
                        type: "uuid",
                    },
                    {
                        name: "avaliacao_demanda",
                        type: "text",
                        isNullable: true,
                    },
                    {
                        name: "evolucao",
                        type: "json",
                        isNullable: true,
                    },
                    {
                        name: "encaminhamento",
                        type: "text",
                        isNullable: true,
                    },
                    {
                        name: "anexos",
                        type: "json",
                        isNullable: true,
                    },
                    {
                        name: "created_at",
                        type: "timestamp",
                        default: "now()",
                    },
                    {
                        name: "updated_at",
                        type: "timestamp",
                        default: "now()",
                    },
                ],
            }),
            true
        );

        // Adicionar foreign keys
        await queryRunner.createForeignKey(
            "prontuarios",
            new TableForeignKey({
                columnNames: ["paciente_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "pacientes",
                onDelete: "CASCADE",
            })
        );

        await queryRunner.createForeignKey(
            "prontuarios",
            new TableForeignKey({
                columnNames: ["user_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "users",
                onDelete: "CASCADE",
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("prontuarios");
    }
} 