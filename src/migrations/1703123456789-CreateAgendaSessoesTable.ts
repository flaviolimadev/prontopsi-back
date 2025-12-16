import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateAgendaSessoesTable1703123456789 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "agenda_sessoes",
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                        default: "uuid_generate_v4()",
                    },
                    {
                        name: "user_id",
                        type: "uuid",
                    },
                    {
                        name: "paciente_id",
                        type: "uuid",
                    },
                    {
                        name: "data",
                        type: "date",
                    },
                    {
                        name: "horario",
                        type: "time",
                    },
                    {
                        name: "tipo_da_consulta",
                        type: "varchar",
                        length: "100",
                    },
                    {
                        name: "modalidade",
                        type: "varchar",
                        length: "50",
                    },
                    {
                        name: "tipo_atendimento",
                        type: "varchar",
                        length: "50",
                    },
                    {
                        name: "duracao",
                        type: "int",
                    },
                    {
                        name: "observacao",
                        type: "text",
                        isNullable: true,
                    },
                    {
                        name: "value",
                        type: "decimal",
                        precision: 10,
                        scale: 2,
                        default: 0,
                    },
                    {
                        name: "status",
                        type: "int",
                        default: 0,
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
                foreignKeys: [
                    {
                        columnNames: ["user_id"],
                        referencedColumnNames: ["id"],
                        referencedTableName: "users",
                        onDelete: "CASCADE",
                    },
                    {
                        columnNames: ["paciente_id"],
                        referencedColumnNames: ["id"],
                        referencedTableName: "pacientes",
                        onDelete: "CASCADE",
                    },
                ],
            }),
            true
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("agenda_sessoes");
    }
} 