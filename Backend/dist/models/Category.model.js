"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryModel = void 0;
const database_1 = __importDefault(require("../config/database"));
class CategoryModel {
    static async findAll() {
        try {
            console.log('📊 CategoryModel.findAll() called');
            const result = await database_1.default.query(`
        SELECT 
          id, 
          category, 
          created_at, 
          updated_at 
        FROM book_categories 
        ORDER BY category ASC
      `);
            console.log(`✅ Found ${result.rows.length} categories`);
            return result.rows || [];
        }
        catch (error) {
            console.error('❌ Error in CategoryModel.findAll:', error);
            return [];
        }
    }
    static async findById(id) {
        try {
            const result = await database_1.default.query('SELECT * FROM book_categories WHERE id = $1', [id]);
            return result.rows[0] || null;
        }
        catch (error) {
            console.error('Error in CategoryModel.findById:', error);
            return null;
        }
    }
    static async getCategoriesWithStats() {
        try {
            const query = `
        SELECT 
          bc.category,
          COUNT(DISTINCT b.id) as "bookCount",
          COUNT(r.id) as "reviewCount",
          COALESCE(AVG(r.rating), 0) as "avgRating"
        FROM book_categories bc
        LEFT JOIN books b ON b.category_id = bc.id
        LEFT JOIN reviews r ON r.book_id = b.id
        GROUP BY bc.id, bc.category
        ORDER BY "bookCount" DESC
      `;
            const result = await database_1.default.query(query);
            return result.rows;
        }
        catch (error) {
            console.error('Error in CategoryModel.getCategoriesWithStats:', error);
            return [];
        }
    }
    static async create(categoryName) {
        try {
            const result = await database_1.default.query('INSERT INTO book_categories (category, created_at, updated_at) VALUES ($1, NOW(), NOW()) RETURNING *', [categoryName]);
            return result.rows[0];
        }
        catch (error) {
            console.error('Error in CategoryModel.create:', error);
            throw error;
        }
    }
    static async update(id, categoryName) {
        try {
            const result = await database_1.default.query('UPDATE book_categories SET category = $1, updated_at = NOW() WHERE id = $2 RETURNING *', [categoryName, id]);
            return result.rows[0] || null;
        }
        catch (error) {
            console.error('Error in CategoryModel.update:', error);
            return null;
        }
    }
    static async delete(id) {
        try {
            const result = await database_1.default.query('DELETE FROM book_categories WHERE id = $1 RETURNING id', [id]);
            return result.rows.length > 0;
        }
        catch (error) {
            console.error('Error in CategoryModel.delete:', error);
            return false;
        }
    }
}
exports.CategoryModel = CategoryModel;
