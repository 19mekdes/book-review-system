import dotenv from 'dotenv';
import path from 'path';

// Try different paths
console.log('Current working directory:', process.cwd());
console.log('__dirname:', __dirname);

// Try loading with different paths
const paths = [
  '.env',
  path.resolve(process.cwd(), '.env'),
  path.resolve(__dirname, '../.env'),
  path.resolve(__dirname, '../../.env')
];

paths.forEach((envPath) => {
  console.log(`\nTrying to load .env from: ${envPath}`);
  const result = dotenv.config({ path: envPath });
  if (result.error) {
    console.log('  ❌ Failed:', result.error.message);
  } else {
    console.log('  ✅ Success!');
    console.log('  DB_PASSWORD exists?', process.env.DB_PASSWORD ? 'Yes' : 'No');
    if (process.env.DB_PASSWORD) {
      console.log('  DB_PASSWORD length:', process.env.DB_PASSWORD.length);
    }
  }
});

// Show final values
console.log('\n=== FINAL ENVIRONMENT VALUES ===');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD exists?', process.env.DB_PASSWORD ? 'Yes' : 'No');