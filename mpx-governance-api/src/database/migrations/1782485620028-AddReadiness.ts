import { MigrationInterface, QueryRunner } from "typeorm";

export class AddReadiness1782485620028 implements MigrationInterface {
    name = 'AddReadiness1782485620028'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "unit_scores" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "score_snapshot_id" uuid NOT NULL, "organization_unit_id" uuid NOT NULL, "organization_unit_name" character varying(255), "region_id" uuid, "province_code" character varying(20), "profile_level" character varying(30), "readiness_score" numeric(5,2) NOT NULL DEFAULT '0', "compliance_score" numeric(5,2) NOT NULL DEFAULT '0', "control_evidence_score" numeric(5,2) NOT NULL DEFAULT '0', "operational_score" numeric(5,2) NOT NULL DEFAULT '0', "incomplete_records" integer NOT NULL DEFAULT '0', "open_actions" integer NOT NULL DEFAULT '0', "overdue_actions" integer NOT NULL DEFAULT '0', "risk_status" character varying(30), "record_count" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_5b2fdf65b02a3def0766fb17d45" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_8ed88a2fff358931a52bebafb5" ON "unit_scores" ("score_snapshot_id", "organization_unit_id") `);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "tenants" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "slug" character varying(100) NOT NULL, "organization_id" uuid, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_2310ecc5cb8be427097154b18fc" UNIQUE ("slug"), CONSTRAINT "PK_53be67a04681c66b87ee27c9321" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "score_source_metrics" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "score_snapshot_id" uuid NOT NULL, "metric_code" character varying(100) NOT NULL, "metric_name" character varying(255) NOT NULL, "metric_group" character varying(100), "metric_value" numeric(18,4) NOT NULL DEFAULT '0', "metric_unit" character varying(50), "source_module" character varying(100), "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_8b083a7ab3d5831569e69b87316" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_d04c69ec9fe5c78da1ceeaf499" ON "score_source_metrics" ("score_snapshot_id", "metric_code") `);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "score_snapshots" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tenant_id" uuid, "assessment_period" character varying(20) NOT NULL, "organization_unit_id" uuid, "region_id" uuid, "province_code" character varying(20), "process_category" character varying(100), "profile_level" character varying(30), "scope_hash" character varying(64), "overall_score" numeric(5,2) NOT NULL DEFAULT '0', "compliance_score" numeric(5,2) NOT NULL DEFAULT '0', "control_evidence_score" numeric(5,2) NOT NULL DEFAULT '0', "operational_score" numeric(5,2) NOT NULL DEFAULT '0', "status" character varying(30) NOT NULL DEFAULT 'completed', "methodology_version_id" uuid, "record_count" integer NOT NULL DEFAULT '0', "is_latest" boolean NOT NULL DEFAULT true, "calculated_at" TIMESTAMP WITH TIME ZONE, "calculated_by_type" character varying(20) NOT NULL DEFAULT 'system', "calculated_by_user_id" uuid, "warnings_json" jsonb, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_c9c88ecda82247938e2b787c9e1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_62dad39016d99e9ec91d4fcf93" ON "score_snapshots" ("tenant_id", "assessment_period", "is_latest") `);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "score_methodology_versions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tenant_id" uuid, "version_code" character varying(50) NOT NULL, "name" character varying(255) NOT NULL, "description" text, "weight_config" jsonb NOT NULL, "formula_config" jsonb, "threshold_config" jsonb, "is_active" boolean NOT NULL DEFAULT false, "effective_from" TIMESTAMP WITH TIME ZONE, "effective_to" TIMESTAMP WITH TIME ZONE, "created_by" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_74606812cf6cd32562b0c029ee1" UNIQUE ("version_code"), CONSTRAINT "PK_ee4b89936824ceda564741aacc7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_4d9b4adcb27fdbf715570e5abd" ON "score_methodology_versions" ("tenant_id", "is_active") `);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "score_components" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "score_snapshot_id" uuid NOT NULL, "component_code" character varying(100) NOT NULL, "component_name" character varying(255) NOT NULL, "weight_percent" numeric(5,2) NOT NULL, "raw_score" numeric(5,2) NOT NULL DEFAULT '0', "weighted_score" numeric(5,2) NOT NULL DEFAULT '0', "score_status" character varying(30), "calculation_note" text, CONSTRAINT "PK_bdb8fd801140ced17b3937a682a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_be3b73413e5334a1169fae87c5" ON "score_components" ("score_snapshot_id", "component_code") `);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "regions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tenant_id" uuid, "name" character varying(255) NOT NULL, "code" character varying(50), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_4fcd12ed6a046276e2deb08801c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_72cb339021ba0a9191ea21dc27" ON "regions" ("tenant_id", "code") `);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "module_scores" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "score_snapshot_id" uuid NOT NULL, "module_code" character varying(100) NOT NULL, "module_name" character varying(255) NOT NULL, "module_score" numeric(5,2) NOT NULL DEFAULT '0', "status" character varying(30), "completed_count" integer NOT NULL DEFAULT '0', "incomplete_count" integer NOT NULL DEFAULT '0', "overdue_count" integer NOT NULL DEFAULT '0', "evidence_count" integer NOT NULL DEFAULT '0', "total_count" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_a64b321647cc3af607a1e783cfb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_de2c4df52fc3a70b075995a086" ON "module_scores" ("score_snapshot_id", "module_code") `);
        await queryRunner.query(`ALTER TABLE "issues" ADD COLUMN IF NOT EXISTS "is_readiness_gap" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "issues" ADD COLUMN IF NOT EXISTS "source_module" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "issues" ADD COLUMN IF NOT EXISTS "region_id" uuid`);
        await queryRunner.query(`ALTER TABLE "issues" ADD COLUMN IF NOT EXISTS "province_code" character varying(20)`);
        await queryRunner.query(`ALTER TABLE "issues" ADD COLUMN IF NOT EXISTS "methodology_version_id" uuid`);
        await queryRunner.query(`ALTER TABLE "business_units" ADD COLUMN IF NOT EXISTS "region_id" uuid`);
        await queryRunner.query(`ALTER TABLE "business_units" ADD COLUMN IF NOT EXISTS "province_code" character varying(20)`);
        await queryRunner.query(`ALTER TABLE "business_units" ADD COLUMN IF NOT EXISTS "profile_level" character varying(30)`);
        await queryRunner.query(`ALTER TABLE "action_plans" ADD COLUMN IF NOT EXISTS "source_module" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "action_plans" ADD COLUMN IF NOT EXISTS "business_unit_id" uuid`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "action_plans" DROP COLUMN "business_unit_id"`);
        await queryRunner.query(`ALTER TABLE "action_plans" DROP COLUMN "source_module"`);
        await queryRunner.query(`ALTER TABLE "business_units" DROP COLUMN "profile_level"`);
        await queryRunner.query(`ALTER TABLE "business_units" DROP COLUMN "province_code"`);
        await queryRunner.query(`ALTER TABLE "business_units" DROP COLUMN "region_id"`);
        await queryRunner.query(`ALTER TABLE "issues" DROP COLUMN "methodology_version_id"`);
        await queryRunner.query(`ALTER TABLE "issues" DROP COLUMN "province_code"`);
        await queryRunner.query(`ALTER TABLE "issues" DROP COLUMN "region_id"`);
        await queryRunner.query(`ALTER TABLE "issues" DROP COLUMN "source_module"`);
        await queryRunner.query(`ALTER TABLE "issues" DROP COLUMN "is_readiness_gap"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_de2c4df52fc3a70b075995a086"`);
        await queryRunner.query(`DROP TABLE "module_scores"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_72cb339021ba0a9191ea21dc27"`);
        await queryRunner.query(`DROP TABLE "regions"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_be3b73413e5334a1169fae87c5"`);
        await queryRunner.query(`DROP TABLE "score_components"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4d9b4adcb27fdbf715570e5abd"`);
        await queryRunner.query(`DROP TABLE "score_methodology_versions"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_62dad39016d99e9ec91d4fcf93"`);
        await queryRunner.query(`DROP TABLE "score_snapshots"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d04c69ec9fe5c78da1ceeaf499"`);
        await queryRunner.query(`DROP TABLE "score_source_metrics"`);
        await queryRunner.query(`DROP TABLE "tenants"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8ed88a2fff358931a52bebafb5"`);
        await queryRunner.query(`DROP TABLE "unit_scores"`);
    }

}
