import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

export default new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT as string, 10) || 5432,
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'root',
  database: process.env.DATABASE || 'test',
  synchronize: false,
  entities: ['../../dist/**/entities/*.entity{.ts,.js}'],
  migrations: ['../migrations/**/*.ts'],
  migrationsTableName: 'migration_table',
});
