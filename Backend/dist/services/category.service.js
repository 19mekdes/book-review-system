"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryService = void 0;
const Category_model_1 = require("../models/Category.model");
const Book_model_1 = require("../models/Book.model");
const error_middleware_1 = require("../middleware/error.middleware");
class CategoryService {
    /**
     * Get all categories with statistics
     */
    static async getAllCategories() {
        try {
            console.log('📚 CategoryService.getAllCategories() called');
            const categories = await Category_model_1.CategoryModel.findAll();
            const stats = await Category_model_1.CategoryModel.getCategoriesWithStats();
            const result = categories.map(category => {
                const stat = stats.find(s => s.category === category.category);
                return {
                    id: category.id,
                    name: category.category, // ← FIXED: Changed 'category' to 'name' to match CategoryWithStats
                    category: category.category, // Keep both if needed
                    created_at: category.created_at,
                    updated_at: category.updated_at,
                    bookCount: stat?.bookCount || 0,
                    reviewCount: stat?.reviewCount || 0,
                    avgRating: stat?.avgRating || 0
                };
            });
            console.log(`✅ Returning ${result.length} categories`);
            return result;
        }
        catch (error) {
            console.error('❌ Error in getAllCategories:', error);
            throw new error_middleware_1.ApiError(500, `Failed to get categories: ${error.message}`);
        }
    }
    /**
     * Get category by ID with statistics
     */
    static async getCategoryById(categoryId) {
        try {
            const category = await Category_model_1.CategoryModel.findById(categoryId);
            if (!category) {
                return null;
            }
            const stats = await Category_model_1.CategoryModel.getCategoriesWithStats();
            const stat = stats.find(s => s.category === category.category);
            return {
                id: category.id,
                name: category.category, // ← FIXED: Added name property
                category: category.category, // Keep both if needed
                created_at: category.created_at,
                updated_at: category.updated_at,
                bookCount: stat?.bookCount || 0,
                reviewCount: stat?.reviewCount || 0,
                avgRating: stat?.avgRating || 0
            };
        }
        catch (error) {
            console.error('Error in getCategoryById:', error);
            throw new error_middleware_1.ApiError(500, `Failed to get category: ${error.message}`);
        }
    }
    /**
     * Get category by name
     */
    static async getCategoryByName(name) {
        try {
            const allCategories = await this.getAllCategories();
            const category = allCategories.find(c => c.name?.toLowerCase() === name.toLowerCase() || c.category?.toLowerCase() === name.toLowerCase());
            return category || null;
        }
        catch (error) {
            throw new error_middleware_1.ApiError(500, `Failed to get category by name: ${error.message}`);
        }
    }
    /**
     * Create a new category
     */
    static async createCategory(categoryName) {
        try {
            // Check if category already exists
            const existingCategories = await Category_model_1.CategoryModel.findAll();
            const exists = existingCategories.some(c => c.category.toLowerCase() === categoryName.toLowerCase());
            if (exists) {
                throw new error_middleware_1.ApiError(400, 'Category already exists');
            }
            const newCategory = await Category_model_1.CategoryModel.create(categoryName);
            console.log(`✅ Created new category: ${categoryName}`);
            return newCategory;
        }
        catch (error) {
            if (error instanceof error_middleware_1.ApiError)
                throw error;
            throw new error_middleware_1.ApiError(500, `Failed to create category: ${error.message}`);
        }
    }
    /**
     * Bulk create categories
     */
    static async bulkCreateCategories(categories) {
        try {
            const created = [];
            for (const name of categories) {
                try {
                    const category = await this.createCategory(name);
                    created.push(category);
                }
                catch (error) {
                    console.error(`Failed to create category ${name}:`, error);
                }
            }
            return created;
        }
        catch (error) {
            throw new error_middleware_1.ApiError(500, `Failed to bulk create categories: ${error.message}`);
        }
    }
    /**
     * Update a category
     */
    static async updateCategory(categoryId, categoryName) {
        try {
            const category = await Category_model_1.CategoryModel.findById(categoryId);
            if (!category) {
                throw new error_middleware_1.ApiError(404, 'Category not found');
            }
            // Check if new name already exists
            const allCategories = await Category_model_1.CategoryModel.findAll();
            const nameExists = allCategories.some(c => c.category.toLowerCase() === categoryName.toLowerCase() && c.id !== categoryId);
            if (nameExists) {
                throw new error_middleware_1.ApiError(400, 'Category name already exists');
            }
            const updatedCategory = await Category_model_1.CategoryModel.update(categoryId, categoryName);
            if (!updatedCategory) {
                throw new error_middleware_1.ApiError(500, 'Failed to update category');
            }
            console.log(`✅ Updated category ${categoryId} to ${categoryName}`);
            return updatedCategory;
        }
        catch (error) {
            if (error instanceof error_middleware_1.ApiError)
                throw error;
            throw new error_middleware_1.ApiError(500, `Failed to update category: ${error.message}`);
        }
    }
    /**
     * Delete a category
     */
    static async deleteCategory(categoryId) {
        try {
            const category = await Category_model_1.CategoryModel.findById(categoryId);
            if (!category) {
                throw new error_middleware_1.ApiError(404, 'Category not found');
            }
            // Check if category has books
            const books = await Book_model_1.BookModel.findAll();
            const booksInCategory = books.filter(b => b.categoryId === categoryId);
            if (booksInCategory.length > 0) {
                throw new error_middleware_1.ApiError(400, `Cannot delete category "${category.category}" because it has ${booksInCategory.length} books`);
            }
            const deleted = await Category_model_1.CategoryModel.delete(categoryId);
            console.log(`✅ Deleted category: ${category.category}`);
            return deleted;
        }
        catch (error) {
            if (error instanceof error_middleware_1.ApiError)
                throw error;
            throw new error_middleware_1.ApiError(500, `Failed to delete category: ${error.message}`);
        }
    }
    /**
     * Get books by category with pagination
     */
    static async getBooksByCategory(categoryId, page = 1, limit = 10) {
        try {
            const category = await Category_model_1.CategoryModel.findById(categoryId);
            if (!category) {
                throw new error_middleware_1.ApiError(404, 'Category not found');
            }
            const allBooks = await Book_model_1.BookModel.findAll();
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
        }
        catch (error) {
            if (error instanceof error_middleware_1.ApiError)
                throw error;
            throw new error_middleware_1.ApiError(500, `Failed to get books by category: ${error.message}`);
        }
    }
    /**
     * Get popular categories (categories with most books)
     */
    static async getPopularCategories(limit = 5) {
        try {
            const categories = await this.getAllCategories();
            return categories
                .sort((a, b) => b.bookCount - a.bookCount)
                .slice(0, limit);
        }
        catch (error) {
            throw new error_middleware_1.ApiError(500, `Failed to get popular categories: ${error.message}`);
        }
    }
    /**
     * Get category tree
     */
    static async getCategoryTree() {
        try {
            return await this.getAllCategories();
        }
        catch (error) {
            throw new error_middleware_1.ApiError(500, `Failed to get category tree: ${error.message}`);
        }
    }
    /**
     * Get category statistics
     */
    static async getCategoryStats(categoryId) {
        try {
            const category = await Category_model_1.CategoryModel.findById(categoryId);
            if (!category) {
                throw new error_middleware_1.ApiError(404, 'Category not found');
            }
            const stats = await Category_model_1.CategoryModel.getCategoriesWithStats();
            const stat = stats.find(s => s.category === category.category);
            return {
                category: category.category,
                bookCount: stat?.bookCount || 0,
                reviewCount: stat?.reviewCount || 0,
                avgRating: stat?.avgRating || 0
            };
        }
        catch (error) {
            if (error instanceof error_middleware_1.ApiError)
                throw error;
            throw new error_middleware_1.ApiError(500, `Failed to get category stats: ${error.message}`);
        }
    }
    /**
     * Get category usage (how many books and reviews)
     */
    static async getCategoryUsage(categoryId) {
        try {
            const stats = await this.getCategoryStats(categoryId);
            return {
                bookCount: stats.bookCount,
                reviewCount: stats.reviewCount
            };
        }
        catch (error) {
            throw new error_middleware_1.ApiError(500, `Failed to get category usage: ${error.message}`);
        }
    }
    /**
     * Search categories
     */
    static async searchCategories(searchTerm) {
        try {
            const allCategories = await this.getAllCategories();
            const lowerSearch = searchTerm.toLowerCase();
            return allCategories.filter(c => c.name?.toLowerCase().includes(lowerSearch) || c.category?.toLowerCase().includes(lowerSearch));
        }
        catch (error) {
            throw new error_middleware_1.ApiError(500, `Failed to search categories: ${error.message}`);
        }
    }
    /**
     * Get category suggestions (for autocomplete)
     */
    static async getCategorySuggestions(searchTerm, limit = 10) {
        try {
            const categories = await this.searchCategories(searchTerm);
            return categories.slice(0, limit);
        }
        catch (error) {
            throw new error_middleware_1.ApiError(500, `Failed to get category suggestions: ${error.message}`);
        }
    }
    /**
     * Merge two categories (move all books from source to target)
     */
    static async mergeCategories(sourceId, targetId) {
        try {
            const source = await Category_model_1.CategoryModel.findById(sourceId);
            const target = await Category_model_1.CategoryModel.findById(targetId);
            if (!source || !target) {
                throw new error_middleware_1.ApiError(404, 'Category not found');
            }
            // Update all books from source to target
            const allBooks = await Book_model_1.BookModel.findAll();
            const booksToUpdate = allBooks.filter(book => book.categoryId === sourceId);
            for (const book of booksToUpdate) {
                await Book_model_1.BookModel.update(book.id, { categoryId: targetId });
            }
            // Delete the source category
            await Category_model_1.CategoryModel.delete(sourceId);
            return { merged: true };
        }
        catch (error) {
            if (error instanceof error_middleware_1.ApiError)
                throw error;
            throw new error_middleware_1.ApiError(500, `Failed to merge categories: ${error.message}`);
        }
    }
    /**
     * Validate category name (check if it's valid and available)
     */
    static async validateCategoryName(name) {
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
            const existingCategories = await Category_model_1.CategoryModel.findAll();
            const exists = existingCategories.some(c => c.category.toLowerCase() === name.toLowerCase());
            if (exists) {
                return { valid: false, message: 'Category name already exists' };
            }
            return { valid: true };
        }
        catch (error) {
            throw new error_middleware_1.ApiError(500, `Failed to validate category name: ${error.message}`);
        }
    }
}
exports.CategoryService = CategoryService;
