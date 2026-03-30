import pool from '../config/database';

export interface Review {
  updated_at: any;
  id: number;
  user_id: number;
  book_id: number;
  rating: number;
  comment: string;
  created_at?: Date;
}

export interface ReviewWithDetails extends Review {
  c: any;
  updated_at: any;
  title: any;
  status: string;
  helpful_count: number;
  likes: number;
  isLiked: boolean;
  user_name: string;
  book_title: string;
  book_author: string;
  // Removed user_avatar
}

export class ReviewModel {
  
  static async findAll(): Promise<ReviewWithDetails[]> {
    const result = await pool.query(`
      SELECT
        r.id,
        r.user_id,
        r.book_id,
        r.rating,
        r.comment,
        r.created_at,
        u.name as user_name,
        b.title as book_title,
        b.author as book_author
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      JOIN books b ON r.book_id = b.id
      ORDER BY r.created_at DESC
    `);
    return result.rows;
  }

  
  static async findById(id: number): Promise<ReviewWithDetails | null> {
    const result = await pool.query(`
      SELECT
        r.id,
        r.user_id,
        r.book_id,
        r.rating,
        r.comment,
        r.created_at,
        u.name as user_name,
        b.title as book_title,
        b.author as book_author
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      JOIN books b ON r.book_id = b.id
      WHERE r.id = $1
    `, [id]);
    return result.rows[0] || null;
  }

  /**
   * Find reviews by book ID
   */
  static async findByBookId(bookId: number): Promise<ReviewWithDetails[]> {
    const result = await pool.query(`
      SELECT
        r.id,
        r.user_id,
        r.book_id,
        r.rating,
        r.comment,
        r.created_at,
        u.name as user_name
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.book_id = $1
      ORDER BY r.created_at DESC
    `, [bookId]);
    return result.rows;
  }

  /**
   * Find reviews by user ID
   */
  static async findByUserId(userId: number): Promise<ReviewWithDetails[]> {
    const result = await pool.query(`
      SELECT
        r.id,
        r.user_id,
        r.book_id,
        r.rating,
        r.comment,
        r.created_at,
        b.title as book_title,
        b.author as book_author
      FROM reviews r
      JOIN books b ON r.book_id = b.id
      WHERE r.user_id = $1
      ORDER BY r.created_at DESC
    `, [userId]);
    return result.rows;
  }

  /**
   * Create a new review
   */
  static async create(review: Omit<Review, 'id' | 'created_at'>): Promise<Review> {
    const result = await pool.query(
      `INSERT INTO reviews (user_id, book_id, rating, comment, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING id, user_id, book_id, rating, comment, created_at`,
      [review.user_id, review.book_id, review.rating, review.comment]
    );
    return result.rows[0];
  }

  /**
   * Update a review
   */
  static async update(id: number, review: Partial<Review>): Promise<Review | null> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (review.rating !== undefined) {
      fields.push(`rating = $${paramCount++}`);
      values.push(review.rating);
    }
    if (review.comment !== undefined) {
      fields.push(`comment = $${paramCount++}`);
      values.push(review.comment);
    }

    if (fields.length === 0) return null;

    values.push(id);
    const result = await pool.query(
      `UPDATE reviews SET ${fields.join(', ')}, updated_at = NOW()
       WHERE id = $${paramCount}
       RETURNING id, user_id, book_id, rating, comment, created_at`,
      values
    );
    return result.rows[0] || null;
  }

  /**
   * Delete a review
   */
  static async delete(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM reviews WHERE id = $1', [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  /**
   * Get latest reviews
   */
  static async getLatestReviews(limit: number = 5): Promise<ReviewWithDetails[]> {
    const result = await pool.query(`
      SELECT
        r.id,
        r.user_id,
        r.book_id,
        r.rating,
        r.comment,
        r.created_at,
        u.name as user_name,
        b.title as book_title,
        b.author as book_author
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      JOIN books b ON r.book_id = b.id
      ORDER BY r.created_at DESC
      LIMIT $1
    `, [limit]);
    return result.rows;
  }

  /**
   * Get rating distribution for a book
   */
  static async getRatingDistribution(bookId: number): Promise<any[]> {
    const result = await pool.query(`
      SELECT rating, COUNT(*) as count
      FROM reviews
      WHERE book_id = $1
      GROUP BY rating
      ORDER BY rating DESC
    `, [bookId]);
    return result.rows;
  }

  /**
   * Get average rating for a book
   */
  static async getAverageRating(bookId: number): Promise<number> {
    const result = await pool.query(`
      SELECT COALESCE(AVG(rating), 0) as average
      FROM reviews
      WHERE book_id = $1
    `, [bookId]);
    return parseFloat(result.rows[0].average);
  }

  /**
   * Get review count for a book
   */
  static async getReviewCount(bookId: number): Promise<number> {
    const result = await pool.query(`
      SELECT COUNT(*) as count
      FROM reviews
      WHERE book_id = $1
    `, [bookId]);
    return parseInt(result.rows[0].count);
  }
}