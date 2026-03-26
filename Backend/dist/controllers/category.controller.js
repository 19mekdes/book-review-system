"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryController = void 0;
const category_service_1 = require("../services/category.service");
const apiResponse_utils_1 = require("../utils/apiResponse.utils");
// Helper functions
const getQueryNumber = (param) => {
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
const getQueryString = (param) => {
    if (typeof param === 'string')
        return param;
    if (Array.isArray(param) && param.length > 0)
        return param[0];
    return undefined;
};
const getRouteParam = (param) => {
    if (Array.isArray(param))
        return param[0];
    return param;
};
class CategoryController {
    /**
     * Get all categories
     */
    static async getAllCategories(req, res) {
        try {
            const categories = await category_service_1.CategoryService.getAllCategories();
            return res.json(apiResponse_utils_1.ApiResponseUtil.success(categories, 'Categories retrieved successfully'));
        }
        catch (error) {
            console.error('Error in getAllCategories:', error);
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
            if (!category) {
                return res.status(404).json(apiResponse_utils_1.ApiResponseUtil.notFound('Category not found'));
            }
            return res.json(apiResponse_utils_1.ApiResponseUtil.success(category, 'Category retrieved successfully'));
        }
        catch (error) {
            console.error('Error in getCategoryById:', error);
            return res.status(error.statusCode || 500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to get category'));
        }
    }
    /**
     * Get category by name
     */
    static async getCategoryByName(req, res) {
        try {
            const name = getRouteParam(req.params.name);
            if (!name) {
                return res.status(400).json(apiResponse_utils_1.ApiResponseUtil.badRequest('Category name is required'));
            }
            const category = await category_service_1.CategoryService.getCategoryByName(name);
            if (!category) {
                return res.status(404).json(apiResponse_utils_1.ApiResponseUtil.notFound('Category not found'));
            }
            return res.json(apiResponse_utils_1.ApiResponseUtil.success(category, 'Category retrieved successfully'));
        }
        catch (error) {
            console.error('Error in getCategoryByName:', error);
            return res.status(error.statusCode || 500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to get category'));
        }
    }
    /**
     * Get categories with statistics
     */
    static async getCategoriesWithStats(req, res) {
        try {
            const categories = await category_service_1.CategoryService.getAllCategories();
            return res.json(apiResponse_utils_1.ApiResponseUtil.success(categories, 'Category statistics retrieved successfully'));
        }
        catch (error) {
            console.error('Error in getCategoriesWithStats:', error);
            return res.status(error.statusCode || 500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to get category statistics'));
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
            console.error('Error in getPopularCategories:', error);
            return res.status(error.statusCode || 500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to get popular categories'));
        }
    }
    /**
     * Get category tree
     */
    static async getCategoryTree(req, res) {
        try {
            const tree = await category_service_1.CategoryService.getCategoryTree();
            return res.json(apiResponse_utils_1.ApiResponseUtil.success(tree, 'Category tree retrieved successfully'));
        }
        catch (error) {
            console.error('Error in getCategoryTree:', error);
            return res.status(error.statusCode || 500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to get category tree'));
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
            return res.json(apiResponse_utils_1.ApiResponseUtil.success(categories, 'Categories retrieved successfully'));
        }
        catch (error) {
            console.error('Error in searchCategories:', error);
            return res.status(error.statusCode || 500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to search categories'));
        }
    }
    /**
     * Get category suggestions (autocomplete)
     */
    static async getCategorySuggestions(req, res) {
        try {
            const query = getQueryString(req.query.q);
            const limit = getQueryNumber(req.query.limit) || 10;
            if (!query) {
                return res.status(400).json(apiResponse_utils_1.ApiResponseUtil.badRequest('Search query is required'));
            }
            const suggestions = await category_service_1.CategoryService.getCategorySuggestions(query, limit);
            return res.json(apiResponse_utils_1.ApiResponseUtil.success(suggestions, 'Category suggestions retrieved successfully'));
        }
        catch (error) {
            console.error('Error in getCategorySuggestions:', error);
            return res.status(error.statusCode || 500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to get category suggestions'));
        }
    }
    /**
     * Get category stats
     */
    static async getCategoryStats(req, res) {
        try {
            const idParam = getRouteParam(req.params.id);
            const categoryId = parseInt(idParam || '', 10);
            if (isNaN(categoryId)) {
                return res.status(400).json(apiResponse_utils_1.ApiResponseUtil.badRequest('Invalid category ID'));
            }
            const stats = await category_service_1.CategoryService.getCategoryStats(categoryId);
            return res.json(apiResponse_utils_1.ApiResponseUtil.success(stats, 'Category stats retrieved successfully'));
        }
        catch (error) {
            console.error('Error in getCategoryStats:', error);
            return res.status(error.statusCode || 500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to get category stats'));
        }
    }
    /**
     * Get category usage
     */
    static async getCategoryUsage(req, res) {
        try {
            const idParam = getRouteParam(req.params.id);
            const categoryId = parseInt(idParam || '', 10);
            if (isNaN(categoryId)) {
                return res.status(400).json(apiResponse_utils_1.ApiResponseUtil.badRequest('Invalid category ID'));
            }
            const usage = await category_service_1.CategoryService.getCategoryUsage(categoryId);
            return res.json(apiResponse_utils_1.ApiResponseUtil.success(usage, 'Category usage retrieved successfully'));
        }
        catch (error) {
            console.error('Error in getCategoryUsage:', error);
            return res.status(error.statusCode || 500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to get category usage'));
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
            const result = await category_service_1.CategoryService.getBooksByCategory(categoryId, page, limit);
            return res.json(apiResponse_utils_1.ApiResponseUtil.success(result, 'Books retrieved successfully'));
        }
        catch (error) {
            console.error('Error in getBooksByCategory:', error);
            return res.status(error.statusCode || 500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to get books by category'));
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
            const validation = await category_service_1.CategoryService.validateCategoryName(name);
            return res.json(apiResponse_utils_1.ApiResponseUtil.success(validation, 'Category name validation completed'));
        }
        catch (error) {
            console.error('Error in validateCategoryName:', error);
            return res.status(error.statusCode || 500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to validate category name'));
        }
    }
    /**
     * Create category (admin only)
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
            console.error('Error in createCategory:', error);
            return res.status(error.statusCode || 500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to create category'));
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
            const created = await category_service_1.CategoryService.bulkCreateCategories(categories);
            return res.status(201).json(apiResponse_utils_1.ApiResponseUtil.created(created, `${created.length} categories created successfully`));
        }
        catch (error) {
            console.error('Error in bulkCreateCategories:', error);
            return res.status(error.statusCode || 500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to create categories'));
        }
    }
    /**
     * Update category (admin only) - FIXED
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
            // FIXED: Pass only the name string, not an object
            const category = await category_service_1.CategoryService.updateCategory(categoryId, name);
            return res.json(apiResponse_utils_1.ApiResponseUtil.success(category, 'Category updated successfully'));
        }
        catch (error) {
            console.error('Error in updateCategory:', error);
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
            console.error('Error in deleteCategory:', error);
            return res.status(error.statusCode || 500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to delete category'));
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
            const result = await category_service_1.CategoryService.mergeCategories(parseInt(sourceId), parseInt(targetId));
            return res.json(apiResponse_utils_1.ApiResponseUtil.success(result, 'Categories merged successfully'));
        }
        catch (error) {
            console.error('Error in mergeCategories:', error);
            return res.status(error.statusCode || 500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to merge categories'));
        }
    }
    /**
     * Export categories (admin only)
     */
    static async exportCategories(req, res) {
        try {
            const categories = await category_service_1.CategoryService.getAllCategories();
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
        }
        catch (error) {
            console.error('Error in exportCategories:', error);
            return res.status(error.statusCode || 500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to export categories'));
        }
    }
    /**
     * Import categories (admin only)
     */
    static async importCategories(req, res) {
        try {
            const file = req.file;
            if (!file) {
                return res.status(400).json(apiResponse_utils_1.ApiResponseUtil.badRequest('No file uploaded'));
            }
            // Parse CSV content
            const content = file.buffer.toString('utf-8');
            const lines = content.split('\n').filter((line) => line.trim());
            if (lines.length < 2) {
                return res.status(400).json(apiResponse_utils_1.ApiResponseUtil.badRequest('File must contain headers and data'));
            }
            // Parse CSV line
            const parseCSVLine = (line) => {
                const result = [];
                let current = '';
                let inQuotes = false;
                for (let i = 0; i < line.length; i++) {
                    const char = line[i];
                    if (char === '"') {
                        inQuotes = !inQuotes;
                    }
                    else if (char === ',' && !inQuotes) {
                        result.push(current);
                        current = '';
                    }
                    else {
                        current += char;
                    }
                }
                result.push(current);
                return result.map(cell => cell.replace(/^"|"$/g, '').replace(/""/g, '"'));
            };
            const headers = parseCSVLine(lines[0]);
            const nameIndex = headers.findIndex(h => h.toLowerCase() === 'name');
            if (nameIndex === -1) {
                return res.status(400).json(apiResponse_utils_1.ApiResponseUtil.badRequest('CSV must contain a "Name" column'));
            }
            const categories = [];
            const errors = [];
            for (let i = 1; i < lines.length; i++) {
                const values = parseCSVLine(lines[i]);
                const name = values[nameIndex]?.trim();
                if (name) {
                    categories.push(name);
                }
                else {
                    errors.push(`Row ${i + 1}: Missing category name`);
                }
            }
            if (categories.length === 0) {
                return res.status(400).json(apiResponse_utils_1.ApiResponseUtil.badRequest('No valid categories found in file'));
            }
            const created = await category_service_1.CategoryService.bulkCreateCategories(categories);
            return res.status(201).json(apiResponse_utils_1.ApiResponseUtil.created({ created: created.length, total: categories.length, errors }, `${created.length} categories imported successfully`));
        }
        catch (error) {
            console.error('Error in importCategories:', error);
            return res.status(error.statusCode || 500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to import categories'));
        }
    }
}
exports.CategoryController = CategoryController;
