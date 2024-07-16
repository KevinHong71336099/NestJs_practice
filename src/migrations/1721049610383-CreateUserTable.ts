import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateProductTable1627484743301 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    /*
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

    // Create the foreign key for lineItem
    await queryRunner.createForeignKey(
      'line_item',
      new TableForeignKey({
        columnNames: ['productId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'product',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );
    */

    await queryRunner.query(
      `CREATE TABLE "test" ( "name" character varying(50) )`,
    );
    console.log('test11111111111111111111');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    /*
    const table = (await queryRunner.getTable('line_item')) as Table;
    const foreignKey = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('productId') !== -1,
    );

    await queryRunner.dropForeignKey(
      'line_item',
      foreignKey as TableForeignKey,
    );
    await queryRunner.dropTable('product');
    */
  }
}
