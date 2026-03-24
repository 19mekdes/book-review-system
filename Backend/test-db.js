const { Pool } = require('pg');

console.log('Testing with hardcoded password...');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'book_review_system',
  user: 'postgres',
  password: '21mek#BDU',  // Hardcoded password
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Connection error:', err.message);
  } else {
    console.log('✅ Connection successful!');
    console.log('Server time:', res.rows[0].now);
  }
  pool.end();
});