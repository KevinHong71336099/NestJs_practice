import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLoginTokenTable1687428302876 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE login_token (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          userId VARCHAR NOT NULL,
          token VARCHAR NOT NULL,
          createdAt TIMESTAMP DEFAULT now() NOT NULL,
          expiresAt TIMESTAMP
        );
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE login_token;`);
  }
}
