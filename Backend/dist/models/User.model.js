"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const index_1 = require("./index");
const bcrypt_1 = __importDefault(require("bcrypt"));
class UserModel {
    static async findAll() {
        const result = await (0, index_1.query)(`
      SELECT u.*, r.name as role_name 
      FROM users u
      LEFT JOIN roles r ON u.roleId = r.id
      ORDER BY u.id
    `);
        return result.rows;
    }
    static async findById(id) {
        const result = await (0, index_1.query)(`
      SELECT u.*, r.name as role_name 
      FROM users u
      LEFT JOIN roles r ON u.roleId = r.id
      WHERE u.id = $1
    `, [id]);
        return result.rows[0] || null;
    }
    static async findByEmail(email) {
        const result = await (0, index_1.query)('SELECT * FROM users WHERE email = $1', [email]);
        return result.rows[0] || null;
    }
    static async create(user) {
        const hashedPassword = await bcrypt_1.default.hash(user.password, 10);
        const result = await (0, index_1.query)(`INSERT INTO users (name, email, password, roleId) 
       VALUES ($1, $2, $3, $4) RETURNING *`, [user.name, user.email, hashedPassword, user.roleId || 2] // Default roleId 2 = User
        );
        return result.rows[0];
    }
    static async update(id, user) {
        const fields = [];
        const values = [];
        let paramCount = 1;
        if (user.name) {
            fields.push(`name = $${paramCount++}`);
            values.push(user.name);
        }
        if (user.email) {
            fields.push(`email = $${paramCount++}`);
            values.push(user.email);
        }
        if (user.password) {
            fields.push(`password = $${paramCount++}`);
            values.push(await bcrypt_1.default.hash(user.password, 10));
        }
        if (user.roleId) {
            fields.push(`roleId = $${paramCount++}`);
            values.push(user.roleId);
        }
        if (fields.length === 0)
            return null;
        values.push(id);
        const result = await (0, index_1.query)(`UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`, values);
        return result.rows[0] || null;
    }
    static async delete(id) {
        const result = await (0, index_1.query)('DELETE FROM users WHERE id = $1', [id]);
        return result.rowCount !== null && result.rowCount > 0;
    }
    static async getUsersWithReviewCounts() {
        const result = await (0, index_1.query)(`
      SELECT u.id, u.name, u.email, r.name as role, COUNT(rev.id) as review_count
      FROM users u
      LEFT JOIN roles r ON u.roleId = r.id
      LEFT JOIN reviews rev ON u.id = rev.user_id
      GROUP BY u.id, u.name, u.email, r.name
    `);
        return result.rows;
    }
}
exports.UserModel = UserModel;
