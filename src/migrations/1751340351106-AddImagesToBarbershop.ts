import { MigrationInterface, QueryRunner } from "typeorm";

export class AddImagesToBarbershop1751340351106 implements MigrationInterface {
    name = 'AddImagesToBarbershop1751340351106'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "barbershops" ADD "images" json`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "barbershops" DROP COLUMN "images"`);
    }

}
