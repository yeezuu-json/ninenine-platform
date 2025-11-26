import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateLotto80Schema1764145353349 implements MigrationInterface {
    name = 'CreateLotto80Schema1764145353349'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."lotto80_rounds_status_enum" AS ENUM('OPEN', 'DRAWING', 'FINISHED', 'SETTLED', 'VOIDED')`);
        await queryRunner.query(`CREATE TYPE "public"."lotto80_rounds_over_under_enum" AS ENUM('OVER', 'UNDER')`);
        await queryRunner.query(`CREATE TYPE "public"."lotto80_rounds_range_enum" AS ENUM('RANGE_1', 'RANGE_2', 'RANGE_3', 'RANGE_4', 'RANGE_5')`);
        await queryRunner.query(`CREATE TYPE "public"."lotto80_rounds_jackpot_on_enum" AS ENUM('RANGE_1', 'RANGE_2', 'RANGE_3', 'RANGE_4', 'RANGE_5')`);
        await queryRunner.query(`CREATE TABLE "lotto80_rounds" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "version" integer NOT NULL DEFAULT '1', "round_number" character varying(12) NOT NULL, "status" "public"."lotto80_rounds_status_enum" NOT NULL DEFAULT 'OPEN', "opened_at" TIMESTAMP WITH TIME ZONE NOT NULL, "closed_at" TIMESTAMP WITH TIME ZONE, "drawn_numbers" jsonb, "drawn_at" TIMESTAMP WITH TIME ZONE, "sum" integer, "over_under" "public"."lotto80_rounds_over_under_enum", "range" "public"."lotto80_rounds_range_enum", "is_jackpot" boolean NOT NULL DEFAULT false, "jackpot_on" "public"."lotto80_rounds_jackpot_on_enum", "rng_seed" character varying(128), "rng_algo_version" integer NOT NULL DEFAULT '1', CONSTRAINT "UQ_9353fe3c7c4bc5d3a6fcbb9d369" UNIQUE ("round_number"), CONSTRAINT "PK_9b50cce4e630d28cecaaa002659" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_lotto80_jackpot" ON "lotto80_rounds" ("is_jackpot", "jackpot_on") `);
        await queryRunner.query(`CREATE INDEX "idx_lotto80_drawn_at" ON "lotto80_rounds" ("drawn_at") `);
        await queryRunner.query(`CREATE INDEX "idx_lotto80_status_opened_at" ON "lotto80_rounds" ("status", "opened_at") `);
        await queryRunner.query(`CREATE INDEX "idx_lotto80_opened_at" ON "lotto80_rounds" ("opened_at") `);
        await queryRunner.query(`CREATE INDEX "idx_lotto80_status" ON "lotto80_rounds" ("status") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."idx_lotto80_status"`);
        await queryRunner.query(`DROP INDEX "public"."idx_lotto80_opened_at"`);
        await queryRunner.query(`DROP INDEX "public"."idx_lotto80_status_opened_at"`);
        await queryRunner.query(`DROP INDEX "public"."idx_lotto80_drawn_at"`);
        await queryRunner.query(`DROP INDEX "public"."idx_lotto80_jackpot"`);
        await queryRunner.query(`DROP TABLE "lotto80_rounds"`);
        await queryRunner.query(`DROP TYPE "public"."lotto80_rounds_jackpot_on_enum"`);
        await queryRunner.query(`DROP TYPE "public"."lotto80_rounds_range_enum"`);
        await queryRunner.query(`DROP TYPE "public"."lotto80_rounds_over_under_enum"`);
        await queryRunner.query(`DROP TYPE "public"."lotto80_rounds_status_enum"`);
    }

}
