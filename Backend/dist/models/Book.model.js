"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookModel = void 0;
const database_1 = __importDefault(require("../config/database"));
class BookModel {
    static async findAll() {
        try {
            const query = `
        SELECT 
          b.id,
          b.title,
          b.author,
          b.description,
          b."categoryId",
          b.cover_image,  -- ADD THIS LINE
          c.category,
          COALESCE(AVG(r.rating), 0) as avg_rating,
          COUNT(DISTINCT r.id) as review_count
        FROM books b
        LEFT JOIN book_categories c ON b."categoryId" = c.id
        LEFT JOIN reviews r ON b.id = r.book_id
        GROUP BY b.id, c.category, b.cover_image  -- ADD b.cover_image here
        ORDER BY b.title
      `;
            const result = await database_1.default.query(query);
            return result.rows.map(row => ({
                ...row,
                avg_rating: parseFloat(row.avg_rating) || 0,
                review_count: parseInt(row.review_count) || 0
            }));
        }
        catch (error) {
            console.error('Error in BookModel.findAll:', error);
            throw error;
        }
    }
    static async findById(id) {
        try {
            console.log(`🔍 BookModel.findById called with ID: ${id}`);
            // Get book with basic info
            const bookQuery = `
        SELECT 
          b.id,
          b.title,
          b.author,
          b.description,
          b."categoryId",
          b.cover_image,  -- ADD THIS LINE
          c.category,
          COALESCE(AVG(r.rating), 0) as avg_rating,
          COUNT(DISTINCT r.id) as review_count
        FROM books b
        LEFT JOIN book_categories c ON b."categoryId" = c.id
        LEFT JOIN reviews r ON b.id = r.book_id
        WHERE b.id = $1
        GROUP BY b.id, c.category, b.cover_image  -- ADD b.cover_image here
      `;
            const bookResult = await database_1.default.query(bookQuery, [id]);
            if (bookResult.rows.length === 0) {
                return null;
            }
            const book = bookResult.rows[0];
            // Get all reviews for this book - WITHOUT avatar
            const reviewsQuery = `
        SELECT 
          r.id,
          r.user_id as "userId",
          r.book_id as "bookId",
          r.rating,
          r.comment,
          r.created_at as "createdAt",
          u.name as "userName"
        FROM reviews r
        LEFT JOIN users u ON r.user_id = u.id
        WHERE r.book_id = $1
        ORDER BY r.created_at DESC
      `;
            const reviewsResult = await database_1.default.query(reviewsQuery, [id]);
            console.log(`📚 Found ${reviewsResult.rows.length} reviews for book ID: ${id}`);
            // Format the book object for frontend
            const formattedBook = {
                id: book.id,
                title: book.title,
                author: book.author,
                description: book.description,
                categoryId: book.categoryId,
                category: book.category || 'Uncategorized',
                cover_image: book.cover_image, // ADD THIS LINE
                averageRating: parseFloat(book.avg_rating) || 0,
                reviewCount: parseInt(book.review_count) || 0,
                reviews: reviewsResult.rows.map(r => ({
                    id: r.id,
                    userId: r.userId,
                    userName: r.userName || 'Anonymous',
                    userAvatar: null,
                    rating: r.rating,
                    comment: r.comment,
                    createdAt: r.createdAt,
                    likes: 0,
                    isLiked: false
                }))
            };
            return formattedBook;
        }
        catch (error) {
            console.error('❌ Error in BookModel.findById:', error);
            throw error;
        }
    }
    /**
     * Create a new book
     */
    static async create(bookData) {
        try {
            const { title, author, description, categoryId, cover_image } = bookData;
            const query = `
        INSERT INTO books (title, author, description, "categoryId", cover_image)  -- ADD cover_image
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, title, author, description, "categoryId" as "categoryId", cover_image  -- ADD cover_image
      `;
            const values = [title, author, description || '', categoryId, cover_image || null];
            const result = await database_1.default.query(query, values);
            return result.rows[0];
        }
        catch (error) {
            console.error('Error in BookModel.create:', error);
            throw error;
        }
    }
    /**
     * Update a book
     */
    static async update(id, updates) {
        try {
            const setClauses = [];
            const values = [];
            let paramIndex = 1;
            if (updates.title !== undefined) {
                setClauses.push(`title = $${paramIndex}`);
                values.push(updates.title);
                paramIndex++;
            }
            if (updates.author !== undefined) {
                setClauses.push(`author = $${paramIndex}`);
                values.push(updates.author);
                paramIndex++;
            }
            if (updates.description !== undefined) {
                setClauses.push(`description = $${paramIndex}`);
                values.push(updates.description);
                paramIndex++;
            }
            if (updates.categoryId !== undefined) {
                setClauses.push(`"categoryId" = $${paramIndex}`);
                values.push(updates.categoryId);
                paramIndex++;
            }
            if (updates.cover_image !== undefined) { // ADD THIS BLOCK
                setClauses.push(`cover_image = $${paramIndex}`);
                values.push(updates.cover_image);
                paramIndex++;
            }
            if (setClauses.length === 0) {
                return this.findById(id);
            }
            const query = `
        UPDATE books
        SET ${setClauses.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING id, title, author, description, "categoryId" as "categoryId", cover_image  -- ADD cover_image
      `;
            values.push(id);
            const result = await database_1.default.query(query, values);
            return result.rows[0] || null;
        }
        catch (error) {
            console.error('Error in BookModel.update:', error);
            throw error;
        }
    }
    /**
     * Delete a book
     */
    static async delete(id) {
        try {
            const query = 'DELETE FROM books WHERE id = $1 RETURNING id';
            const result = await database_1.default.query(query, [id]);
            return result.rowCount ? result.rowCount > 0 : false;
        }
        catch (error) {
            console.error('Error in BookModel.delete:', error);
            throw error;
        }
    }
    /**
     * Get popular books
     */
    static async getPopularBooks(limit = 10) {
        try {
            const query = `
        SELECT 
          b.id,
          b.title,
          b.author,
          b.description,
          b."categoryId",
          b.cover_image,  -- ADD THIS LINE
          c.category,
          COALESCE(AVG(r.rating), 0) as avg_rating,
          COUNT(DISTINCT r.id) as review_count
        FROM books b
        LEFT JOIN book_categories c ON b."categoryId" = c.id
        LEFT JOIN reviews r ON b.id = r.book_id
        GROUP BY b.id, c.category, b.cover_image  -- ADD b.cover_image here
        ORDER BY review_count DESC, avg_rating DESC
        LIMIT $1
      `;
            const result = await database_1.default.query(query, [limit]);
            return result.rows.map(row => ({
                ...row,
                avg_rating: parseFloat(row.avg_rating) || 0,
                review_count: parseInt(row.review_count) || 0
            }));
        }
        catch (error) {
            console.error('Error in BookModel.getPopularBooks:', error);
            throw error;
        }
    }
    /**
     * Get books by category
     */
    static async findByCategory(categoryId, limit, offset) {
        try {
            let query = `
        SELECT 
          b.id,
          b.title,
          b.author,
          b.description,
          b."categoryId",
          b.cover_image,  -- ADD THIS LINE
          c.category,
          COALESCE(AVG(r.rating), 0) as avg_rating,
          COUNT(DISTINCT r.id) as review_count
        FROM books b
        LEFT JOIN book_categories c ON b."categoryId" = c.id
        LEFT JOIN reviews r ON b.id = r.book_id
        WHERE b."categoryId" = $1
        GROUP BY b.id, c.category, b.cover_image  -- ADD b.cover_image here
        ORDER BY b.title
      `;
            const params = [categoryId];
            if (limit !== undefined) {
                query += ` LIMIT $2`;
                params.push(limit);
                if (offset !== undefined) {
                    query += ` OFFSET $3`;
                    params.push(offset);
                }
            }
            const result = await database_1.default.query(query, params);
            return result.rows.map(row => ({
                ...row,
                avg_rating: parseFloat(row.avg_rating) || 0,
                review_count: parseInt(row.review_count) || 0
            }));
        }
        catch (error) {
            console.error('Error in BookModel.findByCategory:', error);
            throw error;
        }
    }
    /**
     * Search books
     */
    static async search(searchTerm, limit, offset) {
        try {
            let query = `
        SELECT 
          b.id,
          b.title,
          b.author,
          b.description,
          b."categoryId",
          b.cover_image,  -- ADD THIS LINE
          c.category,
          COALESCE(AVG(r.rating), 0) as avg_rating,
          COUNT(DISTINCT r.id) as review_count
        FROM books b
        LEFT JOIN book_categories c ON b."categoryId" = c.id
        LEFT JOIN reviews r ON b.id = r.book_id
        WHERE b.title ILIKE $1 OR b.author ILIKE $1 OR b.description ILIKE $1
        GROUP BY b.id, c.category, b.cover_image  -- ADD b.cover_image here
        ORDER BY 
          CASE 
            WHEN b.title ILIKE $1 THEN 1
            WHEN b.author ILIKE $1 THEN 2
            ELSE 3
          END,
          b.title
      `;
            const params = [`%${searchTerm}%`];
            if (limit !== undefined) {
                query += ` LIMIT $2`;
                params.push(limit);
                if (offset !== undefined) {
                    query += ` OFFSET $3`;
                    params.push(offset);
                }
            }
            const result = await database_1.default.query(query, params);
            return result.rows.map(row => ({
                ...row,
                avg_rating: parseFloat(row.avg_rating) || 0,
                review_count: parseInt(row.review_count) || 0
            }));
        }
        catch (error) {
            console.error('Error in BookModel.search:', error);
            throw error;
        }
    }
    /**
     * Count total books
     */
    static async count() {
        try {
            const query = 'SELECT COUNT(*) as count FROM books';
            const result = await database_1.default.query(query);
            return parseInt(result.rows[0].count);
        }
        catch (error) {
            console.error('Error in BookModel.count:', error);
            throw error;
        }
    }
}
exports.BookModel = BookModel;
