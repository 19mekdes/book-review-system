"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryService = void 0;
const Category_model_1 = require("../models/Category.model");
const Book_model_1 = require("../models/Book.model");
const Review_model_1 = require("../models/Review.model");
const error_middleware_1 = require("../middleware/error.middleware");
class CategoryService {
    /**
     * Get all categories
     */
    static async getAllCategories() {
        try {
            return await Category_model_1.CategoryModel.findAll();
        }
        catch (error) {
            throw new error_middleware_1.ApiError(500, `Failed to get categories: ${error.message}`);
        }
    }
    /**
     * Get categories with statistics
     */
    static async getCategoriesWithStats() {
        try {
            return await Category_model_1.CategoryModel.getCategoriesWithStats();
        }
        catch (error) {
            throw new error_middleware_1.ApiError(500, `Failed to get categories with stats: ${error.message}`);
        }
    }
    /**
     * Get category by ID
     */
    static async getCategoryById(categoryId) {
        try {
            const category = await Category_model_1.CategoryModel.findById(categoryId);
            if (!category) {
                throw new error_middleware_1.ApiError(404, 'Category not found');
            }
            const stats = await Category_model_1.CategoryModel.getCategoriesWithStats();
            const categoryWithStats = stats.find(c => c.id === categoryId);
            return categoryWithStats || { ...category, bookCount: 0, reviewCount: 0, avgRating: 0 };
        }
        catch (error) {
            if (error instanceof error_middleware_1.ApiError)
                throw error;
            throw new error_middleware_1.ApiError(500, `Failed to get category: ${error.message}`);
        }
    }
    /**
     * Get category by name
     */
    static async getCategoryByName(name) {
        try {
            const categories = await Category_model_1.CategoryModel.findAll();
            const category = categories.find(c => c.category.toLowerCase() === name.toLowerCase());
            if (!category) {
                throw new error_middleware_1.ApiError(404, 'Category not found');
            }
            return this.getCategoryById(category.id);
        }
        catch (error) {
            if (error instanceof error_middleware_1.ApiError)
                throw error;
            throw new error_middleware_1.ApiError(500, `Failed to get category: ${error.message}`);
        }
    }
    /**
     * Create new category
     */
    static async createCategory(name) {
        try {
            // Check if category exists
            const categories = await Category_model_1.CategoryModel.findAll();
            const existing = categories.find(c => c.category.toLowerCase() === name.toLowerCase());
            if (existing) {
                throw new error_middleware_1.ApiError(400, 'Category already exists');
            }
            // Create category
            const newCategory = await Category_model_1.CategoryModel.create(name);
            return newCategory;
        }
        catch (error) {
            if (error instanceof error_middleware_1.ApiError)
                throw error;
            throw new error_middleware_1.ApiError(500, `Failed to create category: ${error.message}`);
        }
    }
    /**
     * Update category
     */
    static async updateCategory(categoryId, name) {
        try {
            // Check if category exists
            const category = await Category_model_1.CategoryModel.findById(categoryId);
            if (!category) {
                throw new error_middleware_1.ApiError(404, 'Category not found');
            }
            // Check if new name already exists
            const categories = await Category_model_1.CategoryModel.findAll();
            const existing = categories.find(c => c.id !== categoryId && c.category.toLowerCase() === name.toLowerCase());
            if (existing) {
                throw new error_middleware_1.ApiError(400, 'Category name already exists');
            }
            // Update category
            const updatedCategory = await Category_model_1.CategoryModel.update(categoryId, name);
            if (!updatedCategory) {
                throw new error_middleware_1.ApiError(500, 'Failed to update category');
            }
            return updatedCategory;
        }
        catch (error) {
            if (error instanceof error_middleware_1.ApiError)
                throw error;
            throw new error_middleware_1.ApiError(500, `Failed to update category: ${error.message}`);
        }
    }
    /**
     * Delete category
     */
    static async deleteCategory(categoryId) {
        try {
            // Check if category exists
            const category = await Category_model_1.CategoryModel.findById(categoryId);
            if (!category) {
                throw new error_middleware_1.ApiError(404, 'Category not found');
            }
            // Check if category has books
            const books = await Book_model_1.BookModel.findAll();
            const booksInCategory = books.filter(b => b.categoryId === categoryId);
            if (booksInCategory.length > 0) {
                throw new error_middleware_1.ApiError(400, 'Cannot delete category with books');
            }
            // Delete category
            const deleted = await Category_model_1.CategoryModel.delete(categoryId);
            return deleted;
        }
        catch (error) {
            if (error instanceof error_middleware_1.ApiError)
                throw error;
            throw new error_middleware_1.ApiError(500, `Failed to delete category: ${error.message}`);
        }
    }
    /**
     * Get category statistics for a specific category
     */
    static async getCategoryStats(categoryId) {
        try {
            const category = await this.getCategoryById(categoryId);
            const books = await Book_model_1.BookModel.findAll();
            const categoryBooks = books.filter(b => b.categoryId === categoryId);
            const reviews = await Review_model_1.ReviewModel.findAll();
            const categoryReviews = reviews.filter(r => categoryBooks.some(b => b.id === r.book_id));
            // Rating distribution
            const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
                rating,
                count: categoryReviews.filter(r => r.rating === rating).length
            }));
            // Top books in category
            const topBooks = categoryBooks
                .sort((a, b) => b.avg_rating - a.avg_rating)
                .slice(0, 5)
                .map(b => ({
                id: b.id,
                title: b.title,
                author: b.author,
                avgRating: b.avg_rating,
                reviewCount: b.review_count
            }));
            return {
                ...category,
                bookCount: categoryBooks.length,
                reviewCount: categoryReviews.length,
                avgRating: category.avgRating,
                ratingDistribution,
                topBooks
            };
        }
        catch (error) {
            if (error instanceof error_middleware_1.ApiError)
                throw error;
            throw new error_middleware_1.ApiError(500, `Failed to get category stats: ${error.message}`);
        }
    }
    /**
     * Get all categories statistics
     */
    static async getAllCategoriesStats() {
        try {
            const categories = await Category_model_1.CategoryModel.getCategoriesWithStats();
            const totalBooks = categories.reduce((sum, c) => sum + c.bookCount, 0);
            const totalReviews = categories.reduce((sum, c) => sum + c.reviewCount, 0);
            const avgRating = categories.length > 0
                ? Number((categories.reduce((sum, c) => sum + c.avgRating, 0) / categories.length).toFixed(1))
                : 0;
            return {
                categories,
                summary: {
                    totalCategories: categories.length,
                    totalBooks,
                    totalReviews,
                    avgRating
                }
            };
        }
        catch (error) {
            throw new error_middleware_1.ApiError(500, `Failed to get categories stats: ${error.message}`);
        }
    }
    /**
     * Get books by category with pagination
     */
    static async getBooksByCategory(categoryId, options = {}) {
        try {
            const { page = 1, limit = 10, sortBy = 'rating', sortOrder = 'desc' } = options;
            // Check if category exists
            const category = await Category_model_1.CategoryModel.findById(categoryId);
            if (!category) {
                throw new error_middleware_1.ApiError(404, 'Category not found');
            }
            // Get all books in category
            const allBooks = await Book_model_1.BookModel.findAll();
            let books = allBooks.filter(b => b.categoryId === categoryId);
            // Sort books
            books = this.sortBooks(books, sortBy, sortOrder);
            // Paginate
            const total = books.length;
            const totalPages = Math.ceil(total / limit);
            const start = (page - 1) * limit;
            const paginatedBooks = books.slice(start, start + limit);
            return {
                category: category.category,
                books: paginatedBooks,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages
                }
            };
        }
        catch (error) {
            if (error instanceof error_middleware_1.ApiError)
                throw error;
            throw new error_middleware_1.ApiError(500, `Failed to get books by category: ${error.message}`);
        }
    }
    /**
     * Get popular categories
     */
    static async getPopularCategories(limit = 5) {
        try {
            const categories = await Category_model_1.CategoryModel.getCategoriesWithStats();
            return categories
                .sort((a, b) => b.bookCount - a.bookCount)
                .slice(0, limit);
        }
        catch (error) {
            throw new error_middleware_1.ApiError(500, `Failed to get popular categories: ${error.message}`);
        }
    }
    /**
     * Search categories
     */
    static async searchCategories(query) {
        try {
            const categories = await Category_model_1.CategoryModel.findAll();
            const queryLower = query.toLowerCase();
            return categories.filter(c => c.category.toLowerCase().includes(queryLower));
        }
        catch (error) {
            throw new error_middleware_1.ApiError(500, `Failed to search categories: ${error.message}`);
        }
    }
    /**
     * Bulk create categories
     */
    static async bulkCreateCategories(names) {
        try {
            const created = [];
            const skipped = [];
            for (const name of names) {
                try {
                    // Check if exists
                    const categories = await Category_model_1.CategoryModel.findAll();
                    const existing = categories.find(c => c.category.toLowerCase() === name.toLowerCase());
                    if (existing) {
                        skipped.push(name);
                        continue;
                    }
                    const newCategory = await Category_model_1.CategoryModel.create(name);
                    created.push(newCategory);
                }
                catch (error) {
                    skipped.push(name);
                }
            }
            return { created, skipped };
        }
        catch (error) {
            throw new error_middleware_1.ApiError(500, `Failed to bulk create categories: ${error.message}`);
        }
    }
    /**
     * Merge categories
     */
    static async mergeCategories(sourceId, targetId) {
        try {
            // Check if both categories exist
            const source = await Category_model_1.CategoryModel.findById(sourceId);
            const target = await Category_model_1.CategoryModel.findById(targetId);
            if (!source || !target) {
                throw new error_middleware_1.ApiError(404, 'One or both categories not found');
            }
            if (sourceId === targetId) {
                throw new error_middleware_1.ApiError(400, 'Cannot merge category with itself');
            }
            // Update all books from source category to target category
            const books = await Book_model_1.BookModel.findAll();
            const booksToUpdate = books.filter(b => b.categoryId === sourceId);
            for (const book of booksToUpdate) {
                await Book_model_1.BookModel.update(book.id, { categoryId: targetId });
            }
            // Delete source category
            await Category_model_1.CategoryModel.delete(sourceId);
            // Get updated target stats
            const updatedTarget = await this.getCategoryById(targetId);
            return {
                message: `Category "${source.category}" merged into "${target.category}"`,
                booksUpdated: booksToUpdate.length,
                targetCategory: updatedTarget
            };
        }
        catch (error) {
            if (error instanceof error_middleware_1.ApiError)
                throw error;
            throw new error_middleware_1.ApiError(500, `Failed to merge categories: ${error.message}`);
        }
    }
    /**
     * Validate category name
     */
    static async validateCategoryName(name) {
        try {
            if (!name || name.trim().length === 0) {
                return false;
            }
            const categories = await Category_model_1.CategoryModel.findAll();
            const exists = categories.some(c => c.category.toLowerCase() === name.toLowerCase());
            return !exists;
        }
        catch (error) {
            return false;
        }
    }
    /**
     * Get category usage
     */
    static async getCategoryUsage(categoryId) {
        try {
            const books = await Book_model_1.BookModel.findAll();
            if (categoryId) {
                const category = await Category_model_1.CategoryModel.findById(categoryId);
                if (!category) {
                    throw new error_middleware_1.ApiError(404, 'Category not found');
                }
                const categoryBooks = books.filter(b => b.categoryId === categoryId);
                return {
                    categoryId,
                    categoryName: category.category,
                    booksCount: categoryBooks.length,
                    books: categoryBooks.map(b => ({
                        id: b.id,
                        title: b.title,
                        author: b.author
                    }))
                };
            }
            // Get usage for all categories
            const categories = await Category_model_1.CategoryModel.findAll();
            const usage = [];
            for (const category of categories) {
                const categoryBooks = books.filter(b => b.categoryId === category.id);
                usage.push({
                    categoryId: category.id,
                    categoryName: category.category,
                    booksCount: categoryBooks.length
                });
            }
            return usage;
        }
        catch (error) {
            if (error instanceof error_middleware_1.ApiError)
                throw error;
            throw new error_middleware_1.ApiError(500, `Failed to get category usage: ${error.message}`);
        }
    }
    /**
     * Sort books helper
     */
    static sortBooks(books, sortBy, sortOrder) {
        const sorted = [...books];
        switch (sortBy) {
            case 'title':
                sorted.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'rating':
                sorted.sort((a, b) => a.avg_rating - b.avg_rating);
                break;
            case 'reviews':
                sorted.sort((a, b) => a.review_count - b.review_count);
                break;
            default:
                sorted.sort((a, b) => a.avg_rating - b.avg_rating);
        }
        return sortOrder === 'desc' ? sorted.reverse() : sorted;
    }
}
exports.CategoryService = CategoryService;
