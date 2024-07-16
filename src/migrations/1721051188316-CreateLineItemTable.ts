import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateLineItemTable1627484743301 implements MigrationInterface {
  name = 'CreateLineItemTable1627484743301';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the line_item table
    await queryRunner.createTable(
      new Table({
        name: 'line_item',
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
            name: 'orderId',
            type: 'uuid',
          },
          {
            name: 'productId',
            type: 'uuid',
          },
          {
            name: 'name',
            type: 'varchar',
          },
          {
            name: 'price',
            type: 'float',
          },
          {
            name: 'quantity',
            type: 'int',
          },
          {
            name: 'test',
            type: 'varchar',
          },
        ],
      }),
      true,
    );

    // Create the foreign key for orderId
    await queryRunner.createForeignKey(
      'line_item',
      new TableForeignKey({
        columnNames: ['orderId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'order',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    // Create the foreign key for productId
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = (await queryRunner.getTable('line_item')) as Table;
    const orderForeignKey = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('orderId') !== -1,
    );
    const productForeignKey = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('productId') !== -1,
    );

    await queryRunner.dropForeignKey(
      'line_item',
      orderForeignKey as TableForeignKey,
    );
    await queryRunner.dropForeignKey(
      'line_item',
      productForeignKey as TableForeignKey,
    );

    await queryRunner.dropTable('line_item');
  }
}
