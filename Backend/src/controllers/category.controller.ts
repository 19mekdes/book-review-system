import { Request, Response } from 'express';
import { CategoryService } from '../services/category.service';
import { ApiResponseUtil } from '../utils/apiResponse.utils';
import { AuthRequest } from '../middleware/auth.middleware';

// Helper functions
const getQueryNumber = (param: unknown): number | undefined => {
  if (typeof param === 'string') {
    const num = parseInt(param, 10);
    return isNaN(num) ? undefined : num;
  }
  if (Array.isArray(param) && param.length > 0) {
    const num = parseInt(param[0], 10);
    return isNaN(num) ? undefined : num;
  }
  return undefined;
};

const getQueryString = (param: unknown): string | undefined => {
  if (typeof param === 'string') return param;
  if (Array.isArray(param) && param.length > 0) return param[0];
  return undefined;
};

const getRouteParam = (param: string | string[] | undefined): string | undefined => {
  if (Array.isArray(param)) return param[0];
  return param;
};

export class CategoryController {
  /**
   * Get all categories
   */
  static async getAllCategories(req: Request, res: Response) {
    try {
      const categories = await CategoryService.getAllCategories();
      return res.json(
        ApiResponseUtil.success(categories, 'Categories retrieved successfully')
      );
    } catch (error: any) {
      console.error('Error in getAllCategories:', error);
      return res.status(error.statusCode || 500).json(
        ApiResponseUtil.error(error.message || 'Failed to get categories')
      );
    }
  }

  /**
   * Get category by ID
   */
  static async getCategoryById(req: Request, res: Response) {
    try {
      const idParam = getRouteParam(req.params.id);
      const categoryId = parseInt(idParam || '', 10);
      
      if (isNaN(categoryId)) {
        return res.status(400).json(
          ApiResponseUtil.badRequest('Invalid category ID')
        );
      }
      
      const category = await CategoryService.getCategoryById(categoryId);
      if (!category) {
        return res.status(404).json(
          ApiResponseUtil.notFound('Category not found')
        );
      }
      
      return res.json(
        ApiResponseUtil.success(category, 'Category retrieved successfully')
      );
    } catch (error: any) {
      console.error('Error in getCategoryById:', error);
      return res.status(error.statusCode || 500).json(
        ApiResponseUtil.error(error.message || 'Failed to get category')
      );
    }
  }

  /**
   * Get category by name
   */
  static async getCategoryByName(req: Request, res: Response) {
    try {
      const name = getRouteParam(req.params.name);
      if (!name) {
        return res.status(400).json(
          ApiResponseUtil.badRequest('Category name is required')
        );
      }
      
      const category = await CategoryService.getCategoryByName(name);
      if (!category) {
        return res.status(404).json(
          ApiResponseUtil.notFound('Category not found')
        );
      }
      
      return res.json(
        ApiResponseUtil.success(category, 'Category retrieved successfully')
      );
    } catch (error: any) {
      console.error('Error in getCategoryByName:', error);
      return res.status(error.statusCode || 500).json(
        ApiResponseUtil.error(error.message || 'Failed to get category')
      );
    }
  }

  /**
   * Get categories with statistics
   */
  static async getCategoriesWithStats(req: Request, res: Response) {
    try {
      const categories = await CategoryService.getAllCategories();
      return res.json(
        ApiResponseUtil.success(categories, 'Category statistics retrieved successfully')
      );
    } catch (error: any) {
      console.error('Error in getCategoriesWithStats:', error);
      return res.status(error.statusCode || 500).json(
        ApiResponseUtil.error(error.message || 'Failed to get category statistics')
      );
    }
  }

  /**
   * Get popular categories
   */
  static async getPopularCategories(req: Request, res: Response) {
    try {
      const limit = getQueryNumber(req.query.limit) || 5;
      const categories = await CategoryService.getPopularCategories(limit);
      return res.json(
        ApiResponseUtil.success(categories, 'Popular categories retrieved successfully')
      );
    } catch (error: any) {
      console.error('Error in getPopularCategories:', error);
      return res.status(error.statusCode || 500).json(
        ApiResponseUtil.error(error.message || 'Failed to get popular categories')
      );
    }
  }

  /**
   * Get category tree
   */
  static async getCategoryTree(req: Request, res: Response) {
    try {
      const tree = await CategoryService.getCategoryTree();
      return res.json(
        ApiResponseUtil.success(tree, 'Category tree retrieved successfully')
      );
    } catch (error: any) {
      console.error('Error in getCategoryTree:', error);
      return res.status(error.statusCode || 500).json(
        ApiResponseUtil.error(error.message || 'Failed to get category tree')
      );
    }
  }

  /**
   * Search categories
   */
  static async searchCategories(req: Request, res: Response) {
    try {
      const query = getQueryString(req.query.q);
      if (!query) {
        return res.status(400).json(
          ApiResponseUtil.badRequest('Search query is required')
        );
      }
      
      const categories = await CategoryService.searchCategories(query);
      return res.json(
        ApiResponseUtil.success(categories, 'Categories retrieved successfully')
      );
    } catch (error: any) {
      console.error('Error in searchCategories:', error);
      return res.status(error.statusCode || 500).json(
        ApiResponseUtil.error(error.message || 'Failed to search categories')
      );
    }
  }

  /**
   * Get category suggestions (autocomplete)
   */
  static async getCategorySuggestions(req: Request, res: Response) {
    try {
      const query = getQueryString(req.query.q);
      const limit = getQueryNumber(req.query.limit) || 10;
      
      if (!query) {
        return res.status(400).json(
          ApiResponseUtil.badRequest('Search query is required')
        );
      }
      
      const suggestions = await CategoryService.getCategorySuggestions(query, limit);
      return res.json(
        ApiResponseUtil.success(suggestions, 'Category suggestions retrieved successfully')
      );
    } catch (error: any) {
      console.error('Error in getCategorySuggestions:', error);
      return res.status(error.statusCode || 500).json(
        ApiResponseUtil.error(error.message || 'Failed to get category suggestions')
      );
    }
  }

  /**
   * Get category stats
   */
  static async getCategoryStats(req: Request, res: Response) {
    try {
      const idParam = getRouteParam(req.params.id);
      const categoryId = parseInt(idParam || '', 10);
      
      if (isNaN(categoryId)) {
        return res.status(400).json(
          ApiResponseUtil.badRequest('Invalid category ID')
        );
      }
      
      const stats = await CategoryService.getCategoryStats(categoryId);
      return res.json(
        ApiResponseUtil.success(stats, 'Category stats retrieved successfully')
      );
    } catch (error: any) {
      console.error('Error in getCategoryStats:', error);
      return res.status(error.statusCode || 500).json(
        ApiResponseUtil.error(error.message || 'Failed to get category stats')
      );
    }
  }

  /**
   * Get category usage
   */
  static async getCategoryUsage(req: Request, res: Response) {
    try {
      const idParam = getRouteParam(req.params.id);
      const categoryId = parseInt(idParam || '', 10);
      
      if (isNaN(categoryId)) {
        return res.status(400).json(
          ApiResponseUtil.badRequest('Invalid category ID')
        );
      }
      
      const usage = await CategoryService.getCategoryUsage(categoryId);
      return res.json(
        ApiResponseUtil.success(usage, 'Category usage retrieved successfully')
      );
    } catch (error: any) {
      console.error('Error in getCategoryUsage:', error);
      return res.status(error.statusCode || 500).json(
        ApiResponseUtil.error(error.message || 'Failed to get category usage')
      );
    }
  }

  /**
   * Get books by category
   */
  static async getBooksByCategory(req: Request, res: Response) {
    try {
      const idParam = getRouteParam(req.params.id);
      const categoryId = parseInt(idParam || '', 10);
      
      if (isNaN(categoryId)) {
        return res.status(400).json(
          ApiResponseUtil.badRequest('Invalid category ID')
        );
      }
      
      const page = getQueryNumber(req.query.page) || 1;
      const limit = getQueryNumber(req.query.limit) || 10;
      
      const result = await CategoryService.getBooksByCategory(categoryId, page, limit);
      return res.json(
        ApiResponseUtil.success(result, 'Books retrieved successfully')
      );
    } catch (error: any) {
      console.error('Error in getBooksByCategory:', error);
      return res.status(error.statusCode || 500).json(
        ApiResponseUtil.error(error.message || 'Failed to get books by category')
      );
    }
  }

  /**
   * Validate category name
   */
  static async validateCategoryName(req: Request, res: Response) {
    try {
      const name = getQueryString(req.query.name);
      if (!name) {
        return res.status(400).json(
          ApiResponseUtil.badRequest('Category name is required')
        );
      }
      
      const validation = await CategoryService.validateCategoryName(name);
      return res.json(
        ApiResponseUtil.success(validation, 'Category name validation completed')
      );
    } catch (error: any) {
      console.error('Error in validateCategoryName:', error);
      return res.status(error.statusCode || 500).json(
        ApiResponseUtil.error(error.message || 'Failed to validate category name')
      );
    }
  }

  /**
   * Create category (admin only)
   */
  static async createCategory(req: AuthRequest, res: Response) {
    try {
      const { name } = req.body;
      
      if (!name) {
        return res.status(400).json(
          ApiResponseUtil.badRequest('Category name is required')
        );
      }
      
      const category = await CategoryService.createCategory(name);
      return res.status(201).json(
        ApiResponseUtil.created(category, 'Category created successfully')
      );
    } catch (error: any) {
      console.error('Error in createCategory:', error);
      return res.status(error.statusCode || 500).json(
        ApiResponseUtil.error(error.message || 'Failed to create category')
      );
    }
  }

  /**
   * Bulk create categories (admin only)
   */
  static async bulkCreateCategories(req: AuthRequest, res: Response) {
    try {
      const { categories } = req.body;
      
      if (!categories || !Array.isArray(categories) || categories.length === 0) {
        return res.status(400).json(
          ApiResponseUtil.badRequest('Categories array is required')
        );
      }
      
      const created = await CategoryService.bulkCreateCategories(categories);
      return res.status(201).json(
        ApiResponseUtil.created(created, `${created.length} categories created successfully`)
      );
    } catch (error: any) {
      console.error('Error in bulkCreateCategories:', error);
      return res.status(error.statusCode || 500).json(
        ApiResponseUtil.error(error.message || 'Failed to create categories')
      );
    }
  }

  /**
   * Update category (admin only) - FIXED
   */
  static async updateCategory(req: AuthRequest, res: Response) {
    try {
      const idParam = getRouteParam(req.params.id);
      const categoryId = parseInt(idParam || '', 10);
      
      if (isNaN(categoryId)) {
        return res.status(400).json(
          ApiResponseUtil.badRequest('Invalid category ID')
        );
      }
      
      const { name } = req.body;
      if (!name) {
        return res.status(400).json(
          ApiResponseUtil.badRequest('Category name is required')
        );
      }
      
      // FIXED: Pass only the name string, not an object
      const category = await CategoryService.updateCategory(categoryId, name);
      
      return res.json(
        ApiResponseUtil.success(category, 'Category updated successfully')
      );
    } catch (error: any) {
      console.error('Error in updateCategory:', error);
      return res.status(error.statusCode || 500).json(
        ApiResponseUtil.error(error.message || 'Failed to update category')
      );
    }
  }

  /**
   * Delete category (admin only)
   */
  static async deleteCategory(req: AuthRequest, res: Response) {
    try {
      const idParam = getRouteParam(req.params.id);
      const categoryId = parseInt(idParam || '', 10);
      
      if (isNaN(categoryId)) {
        return res.status(400).json(
          ApiResponseUtil.badRequest('Invalid category ID')
        );
      }
      
      await CategoryService.deleteCategory(categoryId);
      return res.json(
        ApiResponseUtil.success(null, 'Category deleted successfully')
      );
    } catch (error: any) {
      console.error('Error in deleteCategory:', error);
      return res.status(error.statusCode || 500).json(
        ApiResponseUtil.error(error.message || 'Failed to delete category')
      );
    }
  }

  /**
   * Merge categories (admin only)
   */
  static async mergeCategories(req: AuthRequest, res: Response) {
    try {
      const { sourceId, targetId } = req.body;
      
      if (!sourceId || !targetId) {
        return res.status(400).json(
          ApiResponseUtil.badRequest('Source and target category IDs are required')
        );
      }
      
      const result = await CategoryService.mergeCategories(parseInt(sourceId), parseInt(targetId));
      return res.json(
        ApiResponseUtil.success(result, 'Categories merged successfully')
      );
    } catch (error: any) {
      console.error('Error in mergeCategories:', error);
      return res.status(error.statusCode || 500).json(
        ApiResponseUtil.error(error.message || 'Failed to merge categories')
      );
    }
  }

  /**
   * Export categories (admin only)
   */
  static async exportCategories(req: AuthRequest, res: Response) {
    try {
      const categories = await CategoryService.getAllCategories();
      
      // Format as CSV
      const csvHeaders = ['ID', 'Name', 'Book Count', 'Review Count', 'Avg Rating', 'Created At'];
      const csvRows = categories.map(cat => [
        cat.id,
        cat.category,
        cat.bookCount,
        cat.reviewCount,
        cat.avgRating.toFixed(2),
        cat.created_at || ''
      ]);
      
      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=categories-${new Date().toISOString().split('T')[0]}.csv`);
      res.send(csvContent);
      
    } catch (error: any) {
      console.error('Error in exportCategories:', error);
      return res.status(error.statusCode || 500).json(
        ApiResponseUtil.error(error.message || 'Failed to export categories')
      );
    }
  }

  /**
   * Import categories (admin only)
   */
  static async importCategories(req: AuthRequest, res: Response) {
    try {
      const file = (req as any).file;
      
      if (!file) {
        return res.status(400).json(
          ApiResponseUtil.badRequest('No file uploaded')
        );
      }
      
      // Parse CSV content
      const content = file.buffer.toString('utf-8');
      const lines = content.split('\n').filter((line: string) => line.trim());
      
      if (lines.length < 2) {
        return res.status(400).json(
          ApiResponseUtil.badRequest('File must contain headers and data')
        );
      }
      
      // Parse CSV line
      const parseCSVLine = (line: string): string[] => {
        const result: string[] = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
          } else {
            current += char;
          }
        }
        result.push(current);
        return result.map(cell => cell.replace(/^"|"$/g, '').replace(/""/g, '"'));
      };
      
      const headers = parseCSVLine(lines[0]);
      const nameIndex = headers.findIndex(h => h.toLowerCase() === 'name');
      
      if (nameIndex === -1) {
        return res.status(400).json(
          ApiResponseUtil.badRequest('CSV must contain a "Name" column')
        );
      }
      
      const categories: string[] = [];
      const errors: string[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        const name = values[nameIndex]?.trim();
        
        if (name) {
          categories.push(name);
        } else {
          errors.push(`Row ${i + 1}: Missing category name`);
        }
      }
      
      if (categories.length === 0) {
        return res.status(400).json(
          ApiResponseUtil.badRequest('No valid categories found in file')
        );
      }
      
      const created = await CategoryService.bulkCreateCategories(categories);
      
      return res.status(201).json(
        ApiResponseUtil.created(
          { created: created.length, total: categories.length, errors },
          `${created.length} categories imported successfully`
        )
      );
      
    } catch (error: any) {
      console.error('Error in importCategories:', error);
      return res.status(error.statusCode || 500).json(
        ApiResponseUtil.error(error.message || 'Failed to import categories')
      );
    }
  }
}