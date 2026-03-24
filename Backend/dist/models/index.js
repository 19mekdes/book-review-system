"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transaction = exports.query = exports.pool = void 0;
const database_1 = __importDefault(require("../config/database"));
exports.pool = database_1.default;
// Helper to query with parameters
const query = (text, params) => database_1.default.query(text, params);
exports.query = query;
// Transaction helper
const transaction = async (callback) => {
    const client = await database_1.default.connect();
    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    }
    catch (error) {
        await client.query('ROLLBACK');
        throw error;
    }
    finally {
        client.release();
    }
};
exports.transaction = transaction;
