"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryModel = void 0;
const index_1 = require("./index");
class CategoryModel {
    static async findAll() {
        const result = await (0, index_1.query)('SELECT * FROM book_categories ORDER BY category');
        return result.rows;
    }
    static async findById(id) {
        const result = await (0, index_1.query)('SELECT * FROM book_categories WHERE id = $1', [id]);
        return result.rows[0] || null;
    }
    static async create(category) {
        const result = await (0, index_1.query)('INSERT INTO book_categories (category) VALUES ($1) RETURNING *', [category]);
        return result.rows[0];
    }
    static async update(id, category) {
        const result = await (0, index_1.query)('UPDATE book_categories SET category = $1 WHERE id = $2 RETURNING *', [category, id]);
        return result.rows[0] || null;
    }
    static async delete(id) {
        const result = await (0, index_1.query)('DELETE FROM book_categories WHERE id = $1', [id]);
        return result.rowCount !== null && result.rowCount > 0;
    }
    static async getCategoriesWithStats() {
        const result = await (0, index_1.query)(`
      SELECT bc.id, bc.category,
             COUNT(DISTINCT b.id) as total_books,
             COUNT(r.id) as total_reviews,
             COALESCE(ROUND(AVG(r.rating), 1), 0) as avg_rating
      FROM book_categories bc
      LEFT JOIN books b ON bc.id = b.categoryId
      LEFT JOIN reviews r ON b.id = r.book_id
      GROUP BY bc.id, bc.category
      ORDER BY bc.category
    `);
        return result.rows;
    }
}
exports.CategoryModel = CategoryModel;
