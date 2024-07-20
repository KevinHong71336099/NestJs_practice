import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateProductTable1627484743301 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the product table
    await queryRunner.createTable(
      new Table({
        name: 'product',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
            default: `uuid_generate_v4()`,
          },
          {
            name: 'name',
            type: 'varchar',
          },
          {
            name: 'costPrice',
            type: 'float',
          },
          {
            name: 'sellPrice',
            type: 'float',
          },
          {
            name: 'description',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'stockQuantity',
            type: 'int',
          },
          {
            name: 'productStatus',
            type: 'varchar',
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('product');
  }
}
