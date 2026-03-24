"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleModel = void 0;
const index_1 = require("./index");
class RoleModel {
    static async findAll() {
        const result = await (0, index_1.query)('SELECT * FROM roles ORDER BY id');
        return result.rows;
    }
    static async findById(id) {
        const result = await (0, index_1.query)('SELECT * FROM roles WHERE id = $1', [id]);
        return result.rows[0] || null;
    }
    static async findByName(name) {
        const result = await (0, index_1.query)('SELECT * FROM roles WHERE name = $1', [name]);
        return result.rows[0] || null;
    }
}
exports.RoleModel = RoleModel;
