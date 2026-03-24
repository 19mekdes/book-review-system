"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewModel = void 0;
const index_1 = require("./index");
class ReviewModel {
    static async findAll() {
        const result = await (0, index_1.query)(`
      SELECT r.*, u.name as user_name, b.title as book_title, b.author as book_author
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      JOIN books b ON r.book_id = b.id
      ORDER BY r.created_at DESC
    `);
        return result.rows;
    }
    static async findById(id) {
        const result = await (0, index_1.query)(`
      SELECT r.*, u.name as user_name, b.title as book_title, b.author as book_author
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      JOIN books b ON r.book_id = b.id
      WHERE r.id = $1
    `, [id]);
        return result.rows[0] || null;
    }
    static async findByBookId(bookId) {
        const result = await (0, index_1.query)(`
      SELECT r.*, u.name as user_name
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.book_id = $1
      ORDER BY r.created_at DESC
    `, [bookId]);
        return result.rows;
    }
    static async findByUserId(userId) {
        const result = await (0, index_1.query)(`
      SELECT r.*, b.title as book_title, b.author as book_author
      FROM reviews r
      JOIN books b ON r.book_id = b.id
      WHERE r.user_id = $1
      ORDER BY r.created_at DESC
    `, [userId]);
        return result.rows;
    }
    static async create(review) {
        const result = await (0, index_1.query)(`INSERT INTO reviews (user_id, book_id, rating, comment) 
       VALUES ($1, $2, $3, $4) RETURNING *`, [review.user_id, review.book_id, review.rating, review.comment]);
        return result.rows[0];
    }
    static async update(id, review) {
        const fields = [];
        const values = [];
        let paramCount = 1;
        if (review.rating) {
            fields.push(`rating = $${paramCount++}`);
            values.push(review.rating);
        }
        if (review.comment) {
            fields.push(`comment = $${paramCount++}`);
            values.push(review.comment);
        }
        if (fields.length === 0)
            return null;
        values.push(id);
        const result = await (0, index_1.query)(`UPDATE reviews SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`, values);
        return result.rows[0] || null;
    }
    static async delete(id) {
        const result = await (0, index_1.query)('DELETE FROM reviews WHERE id = $1', [id]);
        return result.rowCount !== null && result.rowCount > 0;
    }
    static async getLatestReviews(limit = 5) {
        const result = await (0, index_1.query)(`
      SELECT r.*, u.name as user_name, b.title as book_title, b.author as book_author, b.id as book_id
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      JOIN books b ON r.book_id = b.id
      ORDER BY r.id DESC
      LIMIT $1
    `, [limit]);
        return result.rows;
    }
    static async getRatingDistribution(bookId) {
        const result = await (0, index_1.query)(`
      SELECT rating, COUNT(*) as count
      FROM reviews
      WHERE book_id = $1
      GROUP BY rating
      ORDER BY rating DESC
    `, [bookId]);
        return result.rows;
    }
}
exports.ReviewModel = ReviewModel;
