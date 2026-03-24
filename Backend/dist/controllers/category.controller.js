"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryController = void 0;
const category_service_1 = require("../services/category.service");
const apiResponse_utils_1 = require("../utils/apiResponse.utils");
// Helper functions for query parameters
const getQueryString = (param) => {
    if (Array.isArray(param)) {
        return param[0]; // Take first value if array
    }
    return typeof param === 'string' ? param : undefined;
};
const getQueryNumber = (param) => {
    const str = getQueryString(param);
    if (str) {
        const num = parseInt(str, 10);
        return isNaN(num) ? undefined : num;
    }
    return undefined;
};
const getQueryBoolean = (param) => {
    const str = getQueryString(param);
    if (str) {
        return str.toLowerCase() === 'true';
    }
    return undefined;
};
// Helper function for route parameters (req.params)
const getRouteParam = (param) => {
    if (Array.isArray(param)) {
        return param[0]; // Take first value if array
    }
    return param;
};
class CategoryController {
    /**
     * Get all categories
     */
    static async getAllCategories(req, res) {
        try {
            const includeStats = getQueryBoolean(req.query.stats) || false;
            let categories;
            if (includeStats) {
                categories = await category_service_1.CategoryService.getCategoriesWithStats();
            }
            else {
                categories = await category_service_1.CategoryService.getAllCategories();
            }
            return res.json(apiResponse_utils_1.ApiResponseUtil.success(categories, 'Categories retrieved successfully'));
        }
        catch (error) {
            return res.status(error.statusCode || 500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to get categories'));
        }
    }
    /**
     * Get category by ID
     */
    static async getCategoryById(req, res) {
        try {
            const idParam = getRouteParam(req.params.id);
            const categoryId = parseInt(idParam || '', 10);
            if (isNaN(categoryId)) {
                return res.status(400).json(apiResponse_utils_1.ApiResponseUtil.badRequest('Invalid category ID'));
            }
            const category = await category_service_1.CategoryService.getCategoryById(categoryId);
            return res.json(apiResponse_utils_1.ApiResponseUtil.success(category, 'Category retrieved successfully'));
        }
        catch (error) {
            return res.status(error.statusCode || 500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to get category'));
        }
    }
    /**
     * Get category by name
     */
    static async getCategoryByName(req, res) {
        try {
            const nameParam = getRouteParam(req.params.name);
            const name = nameParam || '';
            if (!name) {
                return res.status(400).json(apiResponse_utils_1.ApiResponseUtil.badRequest('Category name is required'));
            }
            const category = await category_service_1.CategoryService.getCategoryByName(name);
            return res.json(apiResponse_utils_1.ApiResponseUtil.success(category, 'Category retrieved successfully'));
        }
        catch (error) {
            return res.status(error.statusCode || 500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to get category'));
        }
    }
    /**
     * Create new category (admin only)
     */
    static async createCategory(req, res) {
        try {
            const { name } = req.body;
            if (!name) {
                return res.status(400).json(apiResponse_utils_1.ApiResponseUtil.badRequest('Category name is required'));
            }
            const category = await category_service_1.CategoryService.createCategory(name);
            return res.status(201).json(apiResponse_utils_1.ApiResponseUtil.created(category, 'Category created successfully'));
        }
        catch (error) {
            return res.status(error.statusCode || 500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to create category'));
        }
    }
    /**
     * Update category (admin only)
     */
    static async updateCategory(req, res) {
        try {
            const idParam = getRouteParam(req.params.id);
            const categoryId = parseInt(idParam || '', 10);
            if (isNaN(categoryId)) {
                return res.status(400).json(apiResponse_utils_1.ApiResponseUtil.badRequest('Invalid category ID'));
            }
            const { name } = req.body;
            if (!name) {
                return res.status(400).json(apiResponse_utils_1.ApiResponseUtil.badRequest('Category name is required'));
            }
            const category = await category_service_1.CategoryService.updateCategory(categoryId, name);
            return res.json(apiResponse_utils_1.ApiResponseUtil.success(category, 'Category updated successfully'));
        }
        catch (error) {
            return res.status(error.statusCode || 500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to update category'));
        }
    }
    /**
     * Delete category (admin only)
     */
    static async deleteCategory(req, res) {
        try {
            const idParam = getRouteParam(req.params.id);
            const categoryId = parseInt(idParam || '', 10);
            if (isNaN(categoryId)) {
                return res.status(400).json(apiResponse_utils_1.ApiResponseUtil.badRequest('Invalid category ID'));
            }
            await category_service_1.CategoryService.deleteCategory(categoryId);
            return res.json(apiResponse_utils_1.ApiResponseUtil.success(null, 'Category deleted successfully'));
        }
        catch (error) {
            return res.status(error.statusCode || 500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to delete category'));
        }
    }
    /**
     * Get category statistics
     */
    static async getCategoryStats(req, res) {
        try {
            let categoryId;
            if (req.params.id) {
                const idParam = getRouteParam(req.params.id);
                const parsedId = parseInt(idParam || '', 10);
                categoryId = isNaN(parsedId) ? undefined : parsedId;
            }
            if (categoryId !== undefined && isNaN(categoryId)) {
                return res.status(400).json(apiResponse_utils_1.ApiResponseUtil.badRequest('Invalid category ID'));
            }
            let stats;
            if (categoryId) {
                stats = await category_service_1.CategoryService.getCategoryStats(categoryId);
            }
            else {
                stats = await category_service_1.CategoryService.getAllCategoriesStats();
            }
            return res.json(apiResponse_utils_1.ApiResponseUtil.success(stats, 'Category statistics retrieved successfully'));
        }
        catch (error) {
            return res.status(error.statusCode || 500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to get category statistics'));
        }
    }
    /**
     * Get books by category
     */
    static async getBooksByCategory(req, res) {
        try {
            const idParam = getRouteParam(req.params.id);
            const categoryId = parseInt(idParam || '', 10);
            if (isNaN(categoryId)) {
                return res.status(400).json(apiResponse_utils_1.ApiResponseUtil.badRequest('Invalid category ID'));
            }
            const page = getQueryNumber(req.query.page) || 1;
            const limit = getQueryNumber(req.query.limit) || 10;
            const sortBy = getQueryString(req.query.sortBy);
            const sortOrder = getQueryString(req.query.sortOrder);
            const result = await category_service_1.CategoryService.getBooksByCategory(categoryId, { page, limit, sortBy, sortOrder });
            return res.json(apiResponse_utils_1.ApiResponseUtil.success(result, 'Books retrieved successfully'));
        }
        catch (error) {
            return res.status(error.statusCode || 500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to get books by category'));
        }
    }
    /**
     * Get popular categories
     */
    static async getPopularCategories(req, res) {
        try {
            const limit = getQueryNumber(req.query.limit) || 5;
            const categories = await category_service_1.CategoryService.getPopularCategories(limit);
            return res.json(apiResponse_utils_1.ApiResponseUtil.success(categories, 'Popular categories retrieved successfully'));
        }
        catch (error) {
            return res.status(500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to get popular categories'));
        }
    }
    /**
     * Search categories
     */
    static async searchCategories(req, res) {
        try {
            const query = getQueryString(req.query.q);
            if (!query) {
                return res.status(400).json(apiResponse_utils_1.ApiResponseUtil.badRequest('Search query is required'));
            }
            const categories = await category_service_1.CategoryService.searchCategories(query);
            return res.json(apiResponse_utils_1.ApiResponseUtil.success(categories, 'Search completed successfully'));
        }
        catch (error) {
            return res.status(500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Search failed'));
        }
    }
    /**
     * Bulk create categories (admin only)
     */
    static async bulkCreateCategories(req, res) {
        try {
            const { categories } = req.body;
            if (!categories || !Array.isArray(categories) || categories.length === 0) {
                return res.status(400).json(apiResponse_utils_1.ApiResponseUtil.badRequest('Categories array is required'));
            }
            const result = await category_service_1.CategoryService.bulkCreateCategories(categories);
            return res.status(201).json(apiResponse_utils_1.ApiResponseUtil.success(result, `${result.created.length} categories created successfully, ${result.skipped.length} skipped`));
        }
        catch (error) {
            return res.status(error.statusCode || 500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to bulk create categories'));
        }
    }
    /**
     * Get category tree/hierarchy (for nested categories if implemented)
     */
    static async getCategoryTree(req, res) {
        try {
            // This would be implemented if you have parent-child category relationships
            const categories = await category_service_1.CategoryService.getAllCategories();
            // Simple flat list for now
            return res.json(apiResponse_utils_1.ApiResponseUtil.success(categories, 'Category tree retrieved successfully'));
        }
        catch (error) {
            return res.status(500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to get category tree'));
        }
    }
    /**
     * Merge categories (admin only)
     */
    static async mergeCategories(req, res) {
        try {
            const { sourceId, targetId } = req.body;
            if (!sourceId || !targetId) {
                return res.status(400).json(apiResponse_utils_1.ApiResponseUtil.badRequest('Source and target category IDs are required'));
            }
            const result = await category_service_1.CategoryService.mergeCategories(sourceId, targetId);
            return res.json(apiResponse_utils_1.ApiResponseUtil.success(result, 'Categories merged successfully'));
        }
        catch (error) {
            return res.status(error.statusCode || 500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to merge categories'));
        }
    }
    /**
     * Export categories (admin only)
     */
    static async exportCategories(req, res) {
        try {
            const format = getQueryString(req.query.format) || 'json';
            const categories = await category_service_1.CategoryService.getAllCategories();
            if (format === 'csv') {
                // Convert to CSV
                const csv = this.convertToCSV(categories);
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', 'attachment; filename=categories.csv');
                return res.send(csv);
            }
            else {
                // Return as JSON
                return res.json(apiResponse_utils_1.ApiResponseUtil.success(categories, 'Categories exported successfully'));
            }
        }
        catch (error) {
            return res.status(500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to export categories'));
        }
    }
    /**
     * Import categories (admin only)
     */
    static async importCategories(req, res) {
        try {
            const { categories } = req.body;
            if (!categories || !Array.isArray(categories)) {
                return res.status(400).json(apiResponse_utils_1.ApiResponseUtil.badRequest('Categories array is required'));
            }
            const result = await category_service_1.CategoryService.bulkCreateCategories(categories);
            return res.status(201).json(apiResponse_utils_1.ApiResponseUtil.success(result, `${result.created.length} categories imported successfully`));
        }
        catch (error) {
            return res.status(error.statusCode || 500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to import categories'));
        }
    }
    /**
     * Validate category name
     */
    static async validateCategoryName(req, res) {
        try {
            const name = getQueryString(req.query.name);
            if (!name) {
                return res.status(400).json(apiResponse_utils_1.ApiResponseUtil.badRequest('Category name is required'));
            }
            const isValid = await category_service_1.CategoryService.validateCategoryName(name);
            return res.json(apiResponse_utils_1.ApiResponseUtil.success({ isValid, name }, 'Category name validated successfully'));
        }
        catch (error) {
            return res.status(500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to validate category name'));
        }
    }
    /**
     * Get category suggestions based on partial input
     */
    static async getCategorySuggestions(req, res) {
        try {
            const query = getQueryString(req.query.q);
            const limit = getQueryNumber(req.query.limit) || 5;
            if (!query || query.length < 2) {
                return res.json(apiResponse_utils_1.ApiResponseUtil.success([], 'No suggestions available'));
            }
            const categories = await category_service_1.CategoryService.searchCategories(query);
            const suggestions = categories.slice(0, limit).map(c => c.category);
            return res.json(apiResponse_utils_1.ApiResponseUtil.success(suggestions, 'Suggestions retrieved successfully'));
        }
        catch (error) {
            return res.status(500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to get suggestions'));
        }
    }
    /**
     * Get category usage statistics
     */
    static async getCategoryUsage(req, res) {
        try {
            let categoryId;
            if (req.params.id) {
                const idParam = getRouteParam(req.params.id);
                const parsedId = parseInt(idParam || '', 10);
                categoryId = isNaN(parsedId) ? undefined : parsedId;
            }
            if (categoryId !== undefined && isNaN(categoryId)) {
                return res.status(400).json(apiResponse_utils_1.ApiResponseUtil.badRequest('Invalid category ID'));
            }
            const usage = await category_service_1.CategoryService.getCategoryUsage(categoryId);
            return res.json(apiResponse_utils_1.ApiResponseUtil.success(usage, 'Category usage statistics retrieved successfully'));
        }
        catch (error) {
            return res.status(error.statusCode || 500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to get category usage'));
        }
    }
    /**
     * Helper: Convert categories to CSV
     */
    static convertToCSV(categories) {
        const headers = ['ID', 'Name', 'Books Count', 'Reviews Count', 'Average Rating', 'Created At'];
        const rows = categories.map(c => [
            c.id,
            c.category,
            c.bookCount || 0,
            c.reviewCount || 0,
            c.avgRating || 0,
            c.created_at ? new Date(c.created_at).toLocaleDateString() : ''
        ]);
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');
        return csvContent;
    }
}
exports.CategoryController = CategoryController;
