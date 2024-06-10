export default () => ({
  database: {
    username: 'postgres',
    password: 'root',
    database: 'test',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT as string, 10) || 5432,
  },
});
