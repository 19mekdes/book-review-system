"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookModel = void 0;
const index_1 = require("./index");
class BookModel {
    static async findAll() {
        const result = await (0, index_1.query)(`
      SELECT b.*, bc.category,
             COALESCE(ROUND(AVG(r.rating), 1), 0) as avg_rating,
             COUNT(r.id) as review_count
      FROM books b
      LEFT JOIN book_categories bc ON b.categoryId = bc.id
      LEFT JOIN reviews r ON b.id = r.book_id
      GROUP BY b.id, bc.category
      ORDER BY avg_rating DESC
    `);
        return result.rows;
    }
    static async findById(id) {
        const result = await (0, index_1.query)(`
      SELECT b.*, bc.category,
             COALESCE(ROUND(AVG(r.rating), 1), 0) as avg_rating,
             COUNT(r.id) as review_count
      FROM books b
      LEFT JOIN book_categories bc ON b.categoryId = bc.id
      LEFT JOIN reviews r ON b.id = r.book_id
      WHERE b.id = $1
      GROUP BY b.id, bc.category
    `, [id]);
        return result.rows[0] || null;
    }
    static async create(book) {
        const result = await (0, index_1.query)(`INSERT INTO books (title, author, description, categoryId) 
       VALUES ($1, $2, $3, $4) RETURNING *`, [book.title, book.author, book.description, book.categoryId]);
        return result.rows[0];
    }
    static async update(id, book) {
        const fields = [];
        const values = [];
        let paramCount = 1;
        if (book.title) {
            fields.push(`title = $${paramCount++}`);
            values.push(book.title);
        }
        if (book.author) {
            fields.push(`author = $${paramCount++}`);
            values.push(book.author);
        }
        if (book.description) {
            fields.push(`description = $${paramCount++}`);
            values.push(book.description);
        }
        if (book.categoryId) {
            fields.push(`categoryId = $${paramCount++}`);
            values.push(book.categoryId);
        }
        if (fields.length === 0)
            return null;
        values.push(id);
        const result = await (0, index_1.query)(`UPDATE books SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`, values);
        return result.rows[0] || null;
    }
    static async delete(id) {
        const result = await (0, index_1.query)('DELETE FROM books WHERE id = $1', [id]);
        return result.rowCount !== null && result.rowCount > 0;
    }
    static async getPopularBooks(limit = 5) {
        const result = await (0, index_1.query)(`
      SELECT b.*, bc.category,
             COALESCE(ROUND(AVG(r.rating), 1), 0) as avg_rating,
             COUNT(r.id) as review_count
      FROM books b
      LEFT JOIN book_categories bc ON b.categoryId = bc.id
      LEFT JOIN reviews r ON b.id = r.book_id
      GROUP BY b.id, bc.category
      HAVING COUNT(r.id) > 0
      ORDER BY avg_rating DESC, review_count DESC
      LIMIT $1
    `, [limit]);
        return result.rows;
    }
    static async search(searchTerm, categoryId) {
        let queryText = `
      SELECT b.*, bc.category,
             COALESCE(ROUND(AVG(r.rating), 1), 0) as avg_rating,
             COUNT(r.id) as review_count
      FROM books b
      LEFT JOIN book_categories bc ON b.categoryId = bc.id
      LEFT JOIN reviews r ON b.id = r.book_id
      WHERE b.title ILIKE $1 OR b.author ILIKE $1
    `;
        const params = [`%${searchTerm}%`];
        if (categoryId) {
            queryText += ` AND b.categoryId = $2`;
            params.push(categoryId.toString());
        }
        queryText += ` GROUP BY b.id, bc.category ORDER BY avg_rating DESC`;
        const result = await (0, index_1.query)(queryText, params);
        return result.rows;
    }
}
exports.BookModel = BookModel;
