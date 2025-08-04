import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreatePacotesTable1703123456790 implements MigrationInterface {
    name = 'CreatePacotesTable1703123456790'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "pacotes",
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
                        name: "value",
                        type: "decimal",
                        precision: 10,
                        scale: 2,
                        default: 0
                    },
                    {
                        name: "title",
                        type: "varchar",
                        length: "255"
                    },
                    {
                        name: "descricao",
                        type: "text",
                        isNullable: true
                    },
                    {
                        name: "ativo",
                        type: "boolean",
                        default: true
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
            "pacotes",
            new TableForeignKey({
                columnNames: ["user_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "users",
                onDelete: "CASCADE"
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("pacotes");
    }
} 