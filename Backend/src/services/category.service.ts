import { CategoryModel, Category, CategoryWithStats } from '../models/Category.model';
import { BookModel } from '../models/Book.model';
import { ApiError } from '../middleware/error.middleware';

export interface CategoryStats {
  category: string;
  bookCount: number;
  reviewCount: number;
  avgRating: number;
}

export class CategoryService {
  /**
   * Get all categories with statistics
   */
  static async getAllCategories(): Promise<CategoryWithStats[]> {
    try {
      console.log('📚 CategoryService.getAllCategories() called');
      const categories = await CategoryModel.findAll();
      const stats = await CategoryModel.getCategoriesWithStats();
      
      const result: CategoryWithStats[] = categories.map(category => {
        const stat = stats.find(s => s.category === category.category);
        return {
          id: category.id,
          name: category.category,  
          category: category.category,  
          created_at: category.created_at,
          updated_at: category.updated_at,
          bookCount: stat?.bookCount || 0,
          reviewCount: stat?.reviewCount || 0,
          avgRating: stat?.avgRating || 0
        };
      });
      
      console.log(`✅ Returning ${result.length} categories`);
      return result;
    } catch (error) {
      console.error('❌ Error in getAllCategories:', error);
      throw new ApiError(500, `Failed to get categories: ${(error as Error).message}`);
    }
  }

  /**
   * Get category by ID with statistics
   */
  static async getCategoryById(categoryId: number): Promise<CategoryWithStats | null> {
    try {
      const category = await CategoryModel.findById(categoryId);
      if (!category) {
        return null;
      }
      
      const stats = await CategoryModel.getCategoriesWithStats();
      const stat = stats.find(s => s.category === category.category);
      
      return {
        id: category.id,
        name: category.category,  
        category: category.category,  
        created_at: category.created_at,
        updated_at: category.updated_at,
        bookCount: stat?.bookCount || 0,
        reviewCount: stat?.reviewCount || 0,
        avgRating: stat?.avgRating || 0
      };
    } catch (error) {
      console.error('Error in getCategoryById:', error);
      throw new ApiError(500, `Failed to get category: ${(error as Error).message}`);
    }
  }

  /**
   * Get category by name
   */
  static async getCategoryByName(name: string): Promise<CategoryWithStats | null> {
    try {
      const allCategories = await this.getAllCategories();
      const category = allCategories.find(
        c => c.name?.toLowerCase() === name.toLowerCase() || c.category?.toLowerCase() === name.toLowerCase()
      );
      return category || null;
    } catch (error) {
      throw new ApiError(500, `Failed to get category by name: ${(error as Error).message}`);
    }
  }

  /**
   * Create a new category
   */
  static async createCategory(categoryName: string): Promise<Category> {
    try {
      // Check if category already exists
      const existingCategories = await CategoryModel.findAll();
      const exists = existingCategories.some(
        c => c.category.toLowerCase() === categoryName.toLowerCase()
      );
      
      if (exists) {
        throw new ApiError(400, 'Category already exists');
      }
      
      const newCategory = await CategoryModel.create(categoryName);
      console.log(`✅ Created new category: ${categoryName}`);
      return newCategory;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, `Failed to create category: ${(error as Error).message}`);
    }
  }

  /**
   * Bulk create categories
   */
  static async bulkCreateCategories(categories: string[]): Promise<Category[]> {
    try {
      const created: Category[] = [];
      for (const name of categories) {
        try {
          const category = await this.createCategory(name);
          created.push(category);
        } catch (error) {
          console.error(`Failed to create category ${name}:`, error);
        }
      }
      return created;
    } catch (error) {
      throw new ApiError(500, `Failed to bulk create categories: ${(error as Error).message}`);
    }
  }

  /**
   * Update a category
   */
  static async updateCategory(
    categoryId: number,
    categoryName: string
  ): Promise<Category> {
    try {
      const category = await CategoryModel.findById(categoryId);
      if (!category) {
        throw new ApiError(404, 'Category not found');
      }
      
      // Check if new name already exists
      const allCategories = await CategoryModel.findAll();
      const nameExists = allCategories.some(
        c => c.category.toLowerCase() === categoryName.toLowerCase() && c.id !== categoryId
      );
      
      if (nameExists) {
        throw new ApiError(400, 'Category name already exists');
      }
      
      const updatedCategory = await CategoryModel.update(categoryId, categoryName);
      if (!updatedCategory) {
        throw new ApiError(500, 'Failed to update category');
      }
      
      console.log(`✅ Updated category ${categoryId} to ${categoryName}`);
      return updatedCategory;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, `Failed to update category: ${(error as Error).message}`);
    }
  }

  /**
   * Delete a category
   */
  static async deleteCategory(categoryId: number): Promise<boolean> {
    try {
      const category = await CategoryModel.findById(categoryId);
      if (!category) {
        throw new ApiError(404, 'Category not found');
      }
      
      // Check if category has books
      const books = await BookModel.findAll();
      const booksInCategory = books.filter(b => b.categoryId === categoryId);
      
      if (booksInCategory.length > 0) {
        throw new ApiError(400, `Cannot delete category "${category.category}" because it has ${booksInCategory.length} books`);
      }
      
      const deleted = await CategoryModel.delete(categoryId);
      console.log(`✅ Deleted category: ${category.category}`);
      return deleted;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, `Failed to delete category: ${(error as Error).message}`);
    }
  }

  /**
   * Get books by category with pagination
   */
  static async getBooksByCategory(
    categoryId: number,
    page: number = 1,
    limit: number = 10
  ): Promise<{ books: any[]; total: number; page: number; limit: number; totalPages: number }> {
    try {
      const category = await CategoryModel.findById(categoryId);
      if (!category) {
        throw new ApiError(404, 'Category not found');
      }
      
      const allBooks = await BookModel.findAll();
      const categoryBooks = allBooks.filter(book => book.categoryId === categoryId);
      
      const total = categoryBooks.length;
      const totalPages = Math.ceil(total / limit);
      const start = (page - 1) * limit;
      const paginatedBooks = categoryBooks.slice(start, start + limit);
      
      return {
        books: paginatedBooks,
        total,
        page,
        limit,
        totalPages
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, `Failed to get books by category: ${(error as Error).message}`);
    }
  }

  /**
   * Get popular categories (categories with most books)
   */
  static async getPopularCategories(limit: number = 5): Promise<CategoryWithStats[]> {
    try {
      const categories = await this.getAllCategories();
      return categories
        .sort((a, b) => b.bookCount - a.bookCount)
        .slice(0, limit);
    } catch (error) {
      throw new ApiError(500, `Failed to get popular categories: ${(error as Error).message}`);
    }
  }

  /**
   * Get category tree
   */
  static async getCategoryTree(): Promise<CategoryWithStats[]> {
    try {
      return await this.getAllCategories();
    } catch (error) {
      throw new ApiError(500, `Failed to get category tree: ${(error as Error).message}`);
    }
  }

  /**
   * Get category statistics
   */
  static async getCategoryStats(categoryId: number): Promise<CategoryStats> {
    try {
      const category = await CategoryModel.findById(categoryId);
      if (!category) {
        throw new ApiError(404, 'Category not found');
      }
      
      const stats = await CategoryModel.getCategoriesWithStats();
      const stat = stats.find(s => s.category === category.category);
      
      return {
        category: category.category,
        bookCount: stat?.bookCount || 0,
        reviewCount: stat?.reviewCount || 0,
        avgRating: stat?.avgRating || 0
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, `Failed to get category stats: ${(error as Error).message}`);
    }
  }

  /**
   * Get category usage (how many books and reviews)
   */
  static async getCategoryUsage(categoryId: number): Promise<{ bookCount: number; reviewCount: number }> {
    try {
      const stats = await this.getCategoryStats(categoryId);
      return {
        bookCount: stats.bookCount,
        reviewCount: stats.reviewCount
      };
    } catch (error) {
      throw new ApiError(500, `Failed to get category usage: ${(error as Error).message}`);
    }
  }

  /**
   * Search categories
   */
  static async searchCategories(searchTerm: string): Promise<CategoryWithStats[]> {
    try {
      const allCategories = await this.getAllCategories();
      const lowerSearch = searchTerm.toLowerCase();
      
      return allCategories.filter(
        c => c.name?.toLowerCase().includes(lowerSearch) || c.category?.toLowerCase().includes(lowerSearch)
      );
    } catch (error) {
      throw new ApiError(500, `Failed to search categories: ${(error as Error).message}`);
    }
  }

  /**
   * Get category suggestions (for autocomplete)
   */
  static async getCategorySuggestions(searchTerm: string, limit: number = 10): Promise<CategoryWithStats[]> {
    try {
      const categories = await this.searchCategories(searchTerm);
      return categories.slice(0, limit);
    } catch (error) {
      throw new ApiError(500, `Failed to get category suggestions: ${(error as Error).message}`);
    }
  }

  /**
   * Merge two categories (move all books from source to target)
   */
  static async mergeCategories(sourceId: number, targetId: number): Promise<{ merged: boolean }> {
    try {
      const source = await CategoryModel.findById(sourceId);
      const target = await CategoryModel.findById(targetId);
      
      if (!source || !target) {
        throw new ApiError(404, 'Category not found');
      }
      
      // Update all books from source to target
      const allBooks = await BookModel.findAll();
      const booksToUpdate = allBooks.filter(book => book.categoryId === sourceId);
      
      for (const book of booksToUpdate) {
        await BookModel.update(book.id, { categoryId: targetId });
      }
      
      // Delete the source category
      await CategoryModel.delete(sourceId);
      
      return { merged: true };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, `Failed to merge categories: ${(error as Error).message}`);
    }
  }

  /**
   * Validate category name (check if it's valid and available)
   */
  static async validateCategoryName(name: string): Promise<{ valid: boolean; message?: string }> {
    try {
      if (!name || name.trim().length === 0) {
        return { valid: false, message: 'Category name is required' };
      }
      
      if (name.length < 2) {
        return { valid: false, message: 'Category name must be at least 2 characters' };
      }
      
      if (name.length > 50) {
        return { valid: false, message: 'Category name must be less than 50 characters' };
      }
      
      const existingCategories = await CategoryModel.findAll();
      const exists = existingCategories.some(
        c => c.category.toLowerCase() === name.toLowerCase()
      );
      
      if (exists) {
        return { valid: false, message: 'Category name already exists' };
      }
      
      return { valid: true };
    } catch (error) {
      throw new ApiError(500, `Failed to validate category name: ${(error as Error).message}`);
    }
  }
}