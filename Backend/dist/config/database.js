"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load environment variables
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
// Get credentials from env with fallbacks
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
    password: '*********' // Hide password in logs
});
// Create pool
const pool = new pg_1.Pool(dbConfig);
// Test connection immediately
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
        console.error('   Please check your database configuration');
    }
    else {
        console.log('✅ Database connected successfully at:', res.rows[0].now);
    }
});
pool.on('error', (err) => {
    console.error('❌ Unexpected database error:', err);
});
exports.default = pool;
