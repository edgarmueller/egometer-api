import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1784625035934 implements MigrationInterface {
    name = 'Init1784625035934'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "egometer"."user" ("id" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "display_name" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "egometer"."meter_type_enum" AS ENUM('BOOLEAN', 'NUMBER', 'TEXT', 'MOOD', 'QUANTITY', 'ACTIVITIES')`);
        await queryRunner.query(`CREATE TABLE "egometer"."meter" ("id" character varying NOT NULL, "name" character varying NOT NULL, "type" "egometer"."meter_type_enum" NOT NULL, "user_id" character varying NOT NULL, "color" character varying NOT NULL, "icon" character varying NOT NULL, "daily_goal" integer, "weekly_goal" integer, "sort_order" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6a2a722edc5f966fa3562638f91" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "egometer"."entry" ("id" character varying NOT NULL, "date" date NOT NULL, "meter_id" character varying NOT NULL, "user_id" character varying NOT NULL, "value" jsonb NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "uq_entry_meter_id_date" UNIQUE ("meter_id", "date"), CONSTRAINT "PK_a58c675c4c129a8e0f63d3676d6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_entry_user_id_date" ON "egometer"."entry" ("user_id", "date") `);
        await queryRunner.query(`CREATE INDEX "idx_meter_user_id" ON "egometer"."meter" ("user_id") `);
        // Foreign keys: the domain/persistence layer models these relations as
        // plain string columns (userId/meterId) rather than TypeORM relations
        // (see meter.schema.ts / entry.schema.ts), so `migration:generate`
        // doesn't emit them automatically. Added by hand here to get real
        // referential integrity at the database level.
        await queryRunner.query(`ALTER TABLE "egometer"."meter" ADD CONSTRAINT "FK_meter_user_id" FOREIGN KEY ("user_id") REFERENCES "egometer"."user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "egometer"."entry" ADD CONSTRAINT "FK_entry_meter_id" FOREIGN KEY ("meter_id") REFERENCES "egometer"."meter"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "egometer"."entry" ADD CONSTRAINT "FK_entry_user_id" FOREIGN KEY ("user_id") REFERENCES "egometer"."user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "egometer"."entry" DROP CONSTRAINT "FK_entry_user_id"`);
        await queryRunner.query(`ALTER TABLE "egometer"."entry" DROP CONSTRAINT "FK_entry_meter_id"`);
        await queryRunner.query(`ALTER TABLE "egometer"."meter" DROP CONSTRAINT "FK_meter_user_id"`);
        await queryRunner.query(`DROP INDEX "egometer"."idx_meter_user_id"`);
        await queryRunner.query(`DROP INDEX "egometer"."idx_entry_user_id_date"`);
        await queryRunner.query(`DROP TABLE "egometer"."entry"`);
        await queryRunner.query(`DROP TABLE "egometer"."meter"`);
        await queryRunner.query(`DROP TYPE "egometer"."meter_type_enum"`);
        await queryRunner.query(`DROP TABLE "egometer"."user"`);
    }

}
