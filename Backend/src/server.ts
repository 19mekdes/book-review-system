import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import pool from './config/database';

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Test database connection
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Database connected successfully at:', result.rows[0].now);
    
    console.log('📊 Using database:', process.env.DB_NAME);
    console.log('👤 As user:', process.env.DB_USER);

    // Start the server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('   Error:', error instanceof Error ? error.message : error);
    console.error('\n📋 Please check:');
    console.error('   1. PostgreSQL is running');
    console.error('   2. Database credentials in .env file are correct');
    console.error('   3. Database "book_review_system" exists');
    process.exit(1);
  }
}


process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  process.exit(1);
});

startServer();