import { config } from 'dotenv';

config();

let database;

if (process.env.NODE_ENV === 'production') {
  database = 'production';
} else if (process.env.NODE_ENV === 'development') {
  database = 'test';
} else {
  database = 'testing';
}

const databaseConfig = {
  database: {
    username: 'postgres',
    password: 'root',
    database,
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT as string, 10) || 5432,
  },
};

export default () => databaseConfig;
