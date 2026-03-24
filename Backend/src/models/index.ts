import pool from '../config/database';

// This file exports the pool and provides helper functions
export { pool };

// Helper to query with parameters
export const query = (text: string, params?: any[]) => pool.query(text, params);

// Transaction helper
export const transaction = async <T>(callback: (client: any) => Promise<T>): Promise<T> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};