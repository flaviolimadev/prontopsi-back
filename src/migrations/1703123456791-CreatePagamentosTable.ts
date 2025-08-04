import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreatePagamentosTable1703123456791 implements MigrationInterface {
    name = 'CreatePagamentosTable1703123456791'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "pagamentos",
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                        generationStrategy: "uuid",
                        default: "uuid_generate_v4()"
                    },
                    {
                        name: "user_id",
                        type: "uuid"
                    },
                    {
                        name: "paciente_id",
                        type: "uuid"
                    },
                    {
                        name: "pacote_id",
                        type: "uuid",
                        isNullable: true
                    },
                    {
                        name: "data",
                        type: "date"
                    },
                    {
                        name: "vencimento",
                        type: "date"
                    },
                    {
                        name: "status",
                        type: "integer",
                        default: 0
                    },
                    {
                        name: "value",
                        type: "decimal",
                        precision: 10,
                        scale: 2,
                        default: 0
                    },
                    {
                        name: "descricao",
                        type: "text",
                        isNullable: true
                    },
                    {
                        name: "type",
                        type: "integer",
                        isNullable: true
                    },
                    {
                        name: "txid",
                        type: "varchar",
                        length: "255",
                        isNullable: true
                    },
                    {
                        name: "created_at",
                        type: "timestamp",
                        default: "now()"
                    },
                    {
                        name: "updated_at",
                        type: "timestamp",
                        default: "now()"
                    }
                ]
            }),
            true
        );

        await queryRunner.createForeignKey(
            "pagamentos",
            new TableForeignKey({
                columnNames: ["user_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "users",
                onDelete: "CASCADE"
            })
        );

        await queryRunner.createForeignKey(
            "pagamentos",
            new TableForeignKey({
                columnNames: ["paciente_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "pacientes",
                onDelete: "CASCADE"
            })
        );

        await queryRunner.createForeignKey(
            "pagamentos",
            new TableForeignKey({
                columnNames: ["pacote_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "pacotes",
                onDelete: "SET NULL"
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("pagamentos");
    }
} 