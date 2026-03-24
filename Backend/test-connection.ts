import { Pool } from 'pg';

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'book_review_system',
  user: 'postgres',
  password: '21mek#BDU'
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ TypeScript test failed:', err.message);
  } else {
    console.log('✅ TypeScript test succeeded:', res.rows[0]);
  }
  pool.end();
});