import { MigrationInterface, QueryRunner } from "typeorm";

export class LottoEightySchema1764014836039 implements MigrationInterface {
    name = 'LottoEightySchema1764014836039'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."lotto_eighties_status_enum" AS ENUM('OPEN', 'DRAWING', 'FINISHED', 'SETTLED', 'VOIDED')`);
        await queryRunner.query(`CREATE TYPE "public"."lotto_eighties_over_under_enum" AS ENUM('OVER', 'UNDER')`);
        await queryRunner.query(`CREATE TYPE "public"."lotto_eighties_range_enum" AS ENUM('RANGE_1', 'RANGE_2', 'RANGE_3', 'RANGE_4', 'RANGE_5')`);
        await queryRunner.query(`CREATE TYPE "public"."lotto_eighties_jackpot_on_enum" AS ENUM('RANGE_1', 'RANGE_2', 'RANGE_3', 'RANGE_4', 'RANGE_5')`);
        await queryRunner.query(`CREATE TABLE "lotto_eighties" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "round_number" character varying(12) NOT NULL, "status" "public"."lotto_eighties_status_enum" NOT NULL DEFAULT 'OPEN', "opened_at" TIMESTAMP WITH TIME ZONE NOT NULL, "closed_at" TIMESTAMP WITH TIME ZONE, "drawn_numbers" jsonb, "drawn_at" TIMESTAMP WITH TIME ZONE, "sum" integer, "over_under" "public"."lotto_eighties_over_under_enum", "range" "public"."lotto_eighties_range_enum", "is_jackpot" boolean NOT NULL DEFAULT false, "jackpot_on" "public"."lotto_eighties_jackpot_on_enum", CONSTRAINT "UQ_5e7b81956c18fefc1af704a52d5" UNIQUE ("round_number"), CONSTRAINT "PK_0da83f9fbdfd6bb7a6d997e55be" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "lotto_eighties"`);
        await queryRunner.query(`DROP TYPE "public"."lotto_eighties_jackpot_on_enum"`);
        await queryRunner.query(`DROP TYPE "public"."lotto_eighties_range_enum"`);
        await queryRunner.query(`DROP TYPE "public"."lotto_eighties_over_under_enum"`);
        await queryRunner.query(`DROP TYPE "public"."lotto_eighties_status_enum"`);
    }

}
