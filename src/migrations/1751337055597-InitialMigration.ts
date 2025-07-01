import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1751337055597 implements MigrationInterface {
    name = 'InitialMigration1751337055597'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "amenities" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "icon" character varying(100) NOT NULL, "name" character varying(255) NOT NULL, CONSTRAINT "PK_c0777308847b3556086f2fb233e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "opening_hours" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "day" character varying(20) NOT NULL, "openTime" character varying(10), "closeTime" character varying(10), "isClosed" boolean NOT NULL DEFAULT false, "barbershop_id" uuid NOT NULL, CONSTRAINT "PK_09415e2b345103b1f5971464f85" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "barbershops" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "address" text NOT NULL, "phone" character varying(20), "logoUrl" character varying(500), "coverImageUrl" character varying(500), "rating" numeric(2,1) NOT NULL DEFAULT '0', "about" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "created_by" uuid NOT NULL, CONSTRAINT "PK_6da853d8fa59f0f97114c30e5b6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('client', 'barber', 'admin')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying(255) NOT NULL, "password" character varying(255) NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT 'client', "fullName" character varying(255), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "barbershop_amenities" ("barbershop_id" uuid NOT NULL, "amenity_id" uuid NOT NULL, CONSTRAINT "PK_5125fa8321ce0f127cd7f969ec8" PRIMARY KEY ("barbershop_id", "amenity_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_c54f1f6a3a226921f372304e56" ON "barbershop_amenities" ("barbershop_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_a3754cdbdf5aec3693f0dc7d81" ON "barbershop_amenities" ("amenity_id") `);
        await queryRunner.query(`ALTER TABLE "opening_hours" ADD CONSTRAINT "FK_96622505bfb22610f5753acd699" FOREIGN KEY ("barbershop_id") REFERENCES "barbershops"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "barbershops" ADD CONSTRAINT "FK_b37c7d48d1b3c92e019534e0ea9" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "barbershop_amenities" ADD CONSTRAINT "FK_c54f1f6a3a226921f372304e569" FOREIGN KEY ("barbershop_id") REFERENCES "barbershops"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "barbershop_amenities" ADD CONSTRAINT "FK_a3754cdbdf5aec3693f0dc7d817" FOREIGN KEY ("amenity_id") REFERENCES "amenities"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "barbershop_amenities" DROP CONSTRAINT "FK_a3754cdbdf5aec3693f0dc7d817"`);
        await queryRunner.query(`ALTER TABLE "barbershop_amenities" DROP CONSTRAINT "FK_c54f1f6a3a226921f372304e569"`);
        await queryRunner.query(`ALTER TABLE "barbershops" DROP CONSTRAINT "FK_b37c7d48d1b3c92e019534e0ea9"`);
        await queryRunner.query(`ALTER TABLE "opening_hours" DROP CONSTRAINT "FK_96622505bfb22610f5753acd699"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a3754cdbdf5aec3693f0dc7d81"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c54f1f6a3a226921f372304e56"`);
        await queryRunner.query(`DROP TABLE "barbershop_amenities"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`DROP TABLE "barbershops"`);
        await queryRunner.query(`DROP TABLE "opening_hours"`);
        await queryRunner.query(`DROP TABLE "amenities"`);
    }

}
