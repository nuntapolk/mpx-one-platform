import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPdpaSync1782524992185 implements MigrationInterface {
    name = 'AddPdpaSync1782524992185'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ropa_activities" ADD COLUMN IF NOT EXISTS "external_id" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "ropa_activities" ADD COLUMN IF NOT EXISTS "external_source" character varying(50)`);
        await queryRunner.query(`ALTER TABLE "ropa_activities" ADD COLUMN IF NOT EXISTS "last_synced_at" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "ropa_activities" ADD COLUMN IF NOT EXISTS "origin" character varying(20) NOT NULL DEFAULT 'mpx'`);
        await queryRunner.query(`ALTER TABLE "ropa_activities" ADD COLUMN IF NOT EXISTS "external_payload" jsonb`);
        await queryRunner.query(`ALTER TABLE "rights_requests" ADD COLUMN IF NOT EXISTS "external_id" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "rights_requests" ADD COLUMN IF NOT EXISTS "external_source" character varying(50)`);
        await queryRunner.query(`ALTER TABLE "rights_requests" ADD COLUMN IF NOT EXISTS "last_synced_at" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "rights_requests" ADD COLUMN IF NOT EXISTS "origin" character varying(20) NOT NULL DEFAULT 'mpx'`);
        await queryRunner.query(`ALTER TABLE "rights_requests" ADD COLUMN IF NOT EXISTS "external_payload" jsonb`);
        await queryRunner.query(`ALTER TABLE "consents" ADD COLUMN IF NOT EXISTS "external_id" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "consents" ADD COLUMN IF NOT EXISTS "external_source" character varying(50)`);
        await queryRunner.query(`ALTER TABLE "consents" ADD COLUMN IF NOT EXISTS "last_synced_at" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "consents" ADD COLUMN IF NOT EXISTS "origin" character varying(20) NOT NULL DEFAULT 'mpx'`);
        await queryRunner.query(`ALTER TABLE "consents" ADD COLUMN IF NOT EXISTS "external_payload" jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "consents" DROP COLUMN "external_payload"`);
        await queryRunner.query(`ALTER TABLE "consents" DROP COLUMN "origin"`);
        await queryRunner.query(`ALTER TABLE "consents" DROP COLUMN "last_synced_at"`);
        await queryRunner.query(`ALTER TABLE "consents" DROP COLUMN "external_source"`);
        await queryRunner.query(`ALTER TABLE "consents" DROP COLUMN "external_id"`);
        await queryRunner.query(`ALTER TABLE "rights_requests" DROP COLUMN "external_payload"`);
        await queryRunner.query(`ALTER TABLE "rights_requests" DROP COLUMN "origin"`);
        await queryRunner.query(`ALTER TABLE "rights_requests" DROP COLUMN "last_synced_at"`);
        await queryRunner.query(`ALTER TABLE "rights_requests" DROP COLUMN "external_source"`);
        await queryRunner.query(`ALTER TABLE "rights_requests" DROP COLUMN "external_id"`);
        await queryRunner.query(`ALTER TABLE "ropa_activities" DROP COLUMN "external_payload"`);
        await queryRunner.query(`ALTER TABLE "ropa_activities" DROP COLUMN "origin"`);
        await queryRunner.query(`ALTER TABLE "ropa_activities" DROP COLUMN "last_synced_at"`);
        await queryRunner.query(`ALTER TABLE "ropa_activities" DROP COLUMN "external_source"`);
        await queryRunner.query(`ALTER TABLE "ropa_activities" DROP COLUMN "external_id"`);
    }

}
