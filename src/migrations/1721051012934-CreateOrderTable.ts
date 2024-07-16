import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateOrderTable1627484743301 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the order table
    await queryRunner.createTable(
      new Table({
        name: 'order',
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
            name: 'financialStatus',
            type: 'varchar',
          },
          {
            name: 'fulfillmentStatus',
            type: 'varchar',
          },
          {
            name: 'note',
            type: 'varchar',
          },
          {
            name: 'adminId',
            type: 'uuid',
          },
          {
            name: 'guestId',
            type: 'uuid',
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
      true,
    );

    // Create the foreign key for adminId
    await queryRunner.createForeignKey(
      'order',
      new TableForeignKey({
        columnNames: ['adminId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'user',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    // Create the foreign key for guestId
    await queryRunner.createForeignKey(
      'order',
      new TableForeignKey({
        columnNames: ['guestId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'user',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = (await queryRunner.getTable('order')) as Table;
    const adminForeignKey = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('adminId') !== -1,
    );
    const guestForeignKey = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('guestId') !== -1,
    );

    await queryRunner.dropForeignKey(
      'order',
      adminForeignKey as TableForeignKey,
    );
    await queryRunner.dropForeignKey(
      'order',
      guestForeignKey as TableForeignKey,
    );

    await queryRunner.dropTable('order');
  }
}
