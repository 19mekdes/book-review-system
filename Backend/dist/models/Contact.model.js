"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactModel = void 0;
const database_1 = __importDefault(require("../config/database"));
class ContactModel {
    static async create(messageData) {
        try {
            const { name, email, subject, message } = messageData;
            const query = `
        INSERT INTO contact_messages (name, email, subject, message, status, created_at, updated_at)
        VALUES ($1, $2, $3, $4, 'pending', NOW(), NOW())
        RETURNING *
      `;
            const values = [name, email, subject, message];
            const result = await database_1.default.query(query, values);
            return result.rows[0];
        }
        catch (error) {
            console.error('Error in ContactModel.create:', error);
            throw error;
        }
    }
    static async findAll(limit = 100, offset = 0) {
        try {
            const query = `
        SELECT * FROM contact_messages
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2
      `;
            const result = await database_1.default.query(query, [limit, offset]);
            return result.rows;
        }
        catch (error) {
            console.error('Error in ContactModel.findAll:', error);
            throw error;
        }
    }
    static async findById(id) {
        try {
            const query = 'SELECT * FROM contact_messages WHERE id = $1';
            const result = await database_1.default.query(query, [id]);
            return result.rows[0] || null;
        }
        catch (error) {
            console.error('Error in ContactModel.findById:', error);
            throw error;
        }
    }
    static async updateStatus(id, status) {
        try {
            const query = `
        UPDATE contact_messages
        SET status = $1, updated_at = NOW()
        WHERE id = $2
        RETURNING *
      `;
            const result = await database_1.default.query(query, [status, id]);
            return result.rows[0] || null;
        }
        catch (error) {
            console.error('Error in ContactModel.updateStatus:', error);
            throw error;
        }
    }
    static async delete(id) {
        try {
            const query = 'DELETE FROM contact_messages WHERE id = $1';
            const result = await database_1.default.query(query, [id]);
            return (result.rowCount || 0) > 0;
        }
        catch (error) {
            console.error('Error in ContactModel.delete:', error);
            throw error;
        }
    }
}
exports.ContactModel = ContactModel;
