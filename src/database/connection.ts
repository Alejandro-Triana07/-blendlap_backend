import mysql, { Pool, PoolOptions } from 'mysql2/promise';
import logger from '../utils/logger';

const poolOptions: PoolOptions = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'brasilios',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

export const pool: Pool = mysql.createPool(poolOptions);

export const testConnection = async (): Promise<void> => {
  try {
    const connection = await pool.getConnection();
    logger.info('Conexión a MySQL establecida correctamente');
    connection.release();
  } catch (error) {
    logger.error(`Error al conectar con MySQL: ${error}`);
    process.exit(1);
  }
};