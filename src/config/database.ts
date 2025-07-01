import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'barber_app',
  password: process.env.DB_PASSWORD || 'secure_password',
  database: process.env.DB_DATABASE || 'barber_db',
  synchronize: process.env.NODE_ENV === 'development', // Only in development
  logging: process.env.NODE_ENV === 'development',
  entities: [
    process.env.NODE_ENV === 'production' 
      ? 'dist/entities/*.js' 
      : 'src/entities/*.ts'
  ],
  migrations: [
    process.env.NODE_ENV === 'production' 
      ? 'dist/migrations/*.js' 
      : 'src/migrations/*.ts'
  ],
  subscribers: [
    process.env.NODE_ENV === 'production' 
      ? 'dist/subscribers/*.js' 
      : 'src/subscribers/*.ts'
  ],
});