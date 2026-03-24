import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });


const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'book_review_system',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '21mek#BDU',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
};

console.log('📊 Database Config:', {
  ...dbConfig,
  password: '*********' 
});

// Create pool
const pool = new Pool(dbConfig);

// Test connection immediately
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    console.error('   Please check your database configuration');
  } else {
    console.log('✅ Database connected successfully at:', res.rows[0].now);
  }
});

pool.on('error', (err) => {
  console.error('❌ Unexpected database error:', err);
});

export default pool;