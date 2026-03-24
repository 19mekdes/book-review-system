const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'book_review_system',
  user: 'postgres',
  password: '21mek#BDU'
});

console.log('Testing connection...');

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Failed:', err.message);
    console.error('Full error:', err);
  } else {
    console.log('✅ Success:', res.rows[0]);
  }
  pool.end();
});