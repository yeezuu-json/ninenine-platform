import { MigrationInterface, QueryRunner } from "typeorm";

export class TestCorrectPath1763975324178 implements MigrationInterface {
    name = 'TestCorrectPath1763975324178'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "accounts" ("id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "email" character varying(255) NOT NULL, CONSTRAINT "PK_5a7a02c20412299d198e097a8fe" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_ee66de6cdc53993296d1ceb8aa" ON "accounts" ("email") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_ee66de6cdc53993296d1ceb8aa"`);
        await queryRunner.query(`DROP TABLE "accounts"`);
    }

}
