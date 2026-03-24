import db from '../config/database';

export interface Category {
  id: number;
  category: string;  
  created_at?: string;
  updated_at?: string;
  // Add these if they exist in your table
  slug?: string;
  description?: string;
  image?: string;
  color?: string;
  icon?: string;
  parent_id?: number;
  is_active?: boolean;
  is_featured?: boolean;
  sort_order?: number;
}

export interface CategoryWithStats extends Category {
  name: any;
  bookCount: number;
  reviewCount: number;
  avgRating: number;
}

export class CategoryModel {
  static async findAll(): Promise<Category[]> {
    try {
      console.log('📊 CategoryModel.findAll() called');
      const result = await db.query(`
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
    } catch (error) {
      console.error('❌ Error in CategoryModel.findAll:', error);
      return [];
    }
  }

  static async findById(id: number): Promise<Category | null> {
    try {
      const result = await db.query(
        'SELECT * FROM book_categories WHERE id = $1',
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error in CategoryModel.findById:', error);
      return null;
    }
  }

  static async getCategoriesWithStats(): Promise<Array<{
    category: string;
    bookCount: number;
    reviewCount: number;
    avgRating: number;
  }>> {
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
      
      const result = await db.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error in CategoryModel.getCategoriesWithStats:', error);
      return [];
    }
  }

  static async create(categoryName: string): Promise<Category> {
    try {
      const result = await db.query(
        'INSERT INTO book_categories (category, created_at, updated_at) VALUES ($1, NOW(), NOW()) RETURNING *',
        [categoryName]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error in CategoryModel.create:', error);
      throw error;
    }
  }

  static async update(id: number, categoryName: string): Promise<Category | null> {
    try {
      const result = await db.query(
        'UPDATE book_categories SET category = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
        [categoryName, id]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error in CategoryModel.update:', error);
      return null;
    }
  }

  static async delete(id: number): Promise<boolean> {
    try {
      const result = await db.query(
        'DELETE FROM book_categories WHERE id = $1 RETURNING id',
        [id]
      );
      return result.rows.length > 0;
    } catch (error) {
      console.error('Error in CategoryModel.delete:', error);
      return false;
    }
  }
}