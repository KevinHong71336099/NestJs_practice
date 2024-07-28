import { DataSource, DataSourceOptions } from 'typeorm';
import { SeederOptions } from 'typeorm-extension';
import { User } from '../entities/user.entity';
import { Order } from '../../../src/orders/entities/order.entity';
import { LineItem } from '../../../src/orders/entities/lineItem.entity';
import { Product } from '../../../src/products/entities/product.entity';
import UserSeeder from './users.seeder';
import usersFactory from './users.factory';

const options: DataSourceOptions & SeederOptions = {
  type: 'postgres',
  database: 'testing',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'root',
  entities: [User, Order, LineItem, Product],
  seeds: [UserSeeder],
  factories: [usersFactory],
  synchronize: true,
};

export const dataSource = new DataSource(options);
