"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookController = void 0;
const book_service_1 = require("../services/book.service");
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
// Helper function for route parameters (req.params)
const getRouteParam = (param) => {
    if (Array.isArray(param)) {
        return param[0]; // Take first value if array
    }
    return param;
};
const getSortBy = (param) => {
    const str = getQueryString(param);
    if (str === 'title' || str === 'author' || str === 'rating' || str === 'reviews' || str === 'created_at') {
        return str;
    }
    return undefined;
};
const getSortOrder = (param) => {
    const str = getQueryString(param);
    if (str === 'asc' || str === 'desc') {
        return str;
    }
    return undefined;
};
class BookController {
    /**
     * Get all books with filters
     */
    static async getAllBooks(req, res) {
        try {
            const filters = {
                search: getQueryString(req.query.search),
                categoryId: getQueryNumber(req.query.categoryId),
                author: getQueryString(req.query.author),
                minRating: getQueryNumber(req.query.minRating),
                sortBy: getSortBy(req.query.sortBy),
                sortOrder: getSortOrder(req.query.sortOrder),
                page: getQueryNumber(req.query.page) || 1,
                limit: getQueryNumber(req.query.limit) || 10
            };
            const result = await book_service_1.BookService.getAllBooks(filters);
            return res.json(apiResponse_utils_1.ApiResponseUtil.success(result, 'Books retrieved successfully'));
        }
        catch (error) {
            return res.status(error.statusCode || 500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to get books'));
        }
    }
    /**
     * Get book by ID
     */
    static async getBookById(req, res) {
        try {
            const idParam = getRouteParam(req.params.id);
            const bookId = parseInt(idParam || '', 10);
            if (isNaN(bookId)) {
                return res.status(400).json(apiResponse_utils_1.ApiResponseUtil.badRequest('Invalid book ID'));
            }
            const book = await book_service_1.BookService.getBookById(bookId);
            return res.json(apiResponse_utils_1.ApiResponseUtil.success(book, 'Book retrieved successfully'));
        }
        catch (error) {
            return res.status(error.statusCode || 500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to get book'));
        }
    }
    /**
     * Get popular books
     */
    static async getPopularBooks(req, res) {
        try {
            const limit = getQueryNumber(req.query.limit) || 10;
            const books = await book_service_1.BookService.getPopularBooks(limit);
            return res.json(apiResponse_utils_1.ApiResponseUtil.success(books, 'Popular books retrieved successfully'));
        }
        catch (error) {
            return res.status(500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to get popular books'));
        }
    }
    /**
     * Get books by category
     */
    static async getBooksByCategory(req, res) {
        try {
            const categoryIdParam = getRouteParam(req.params.categoryId);
            const categoryId = parseInt(categoryIdParam || '', 10);
            if (isNaN(categoryId)) {
                return res.status(400).json(apiResponse_utils_1.ApiResponseUtil.badRequest('Invalid category ID'));
            }
            const page = getQueryNumber(req.query.page) || 1;
            const limit = getQueryNumber(req.query.limit) || 10;
            const result = await book_service_1.BookService.getBooksByCategory(categoryId, page, limit);
            return res.json(apiResponse_utils_1.ApiResponseUtil.success(result, 'Books retrieved successfully'));
        }
        catch (error) {
            return res.status(error.statusCode || 500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to get books by category'));
        }
    }
    /**
     * Get books by author
     */
    static async getBooksByAuthor(req, res) {
        try {
            const authorParam = getRouteParam(req.params.author);
            const author = authorParam || '';
            if (!author) {
                return res.status(400).json(apiResponse_utils_1.ApiResponseUtil.badRequest('Author name is required'));
            }
            const page = getQueryNumber(req.query.page) || 1;
            const limit = getQueryNumber(req.query.limit) || 10;
            const result = await book_service_1.BookService.getBooksByAuthor(author, page, limit);
            return res.json(apiResponse_utils_1.ApiResponseUtil.success(result, 'Books retrieved successfully'));
        }
        catch (error) {
            return res.status(500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to get books by author'));
        }
    }
    /**
     * Search books
     */
    static async searchBooks(req, res) {
        try {
            const query = getQueryString(req.query.q);
            if (!query) {
                return res.status(400).json(apiResponse_utils_1.ApiResponseUtil.badRequest('Search query is required'));
            }
            const filters = {
                categoryId: getQueryNumber(req.query.categoryId),
                sortBy: getSortBy(req.query.sortBy),
                sortOrder: getSortOrder(req.query.sortOrder),
                page: getQueryNumber(req.query.page) || 1,
                limit: getQueryNumber(req.query.limit) || 10
            };
            const result = await book_service_1.BookService.searchBooks(query, filters);
            return res.json(apiResponse_utils_1.ApiResponseUtil.success(result, 'Search completed successfully'));
        }
        catch (error) {
            return res.status(500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Search failed'));
        }
    }
    /**
     * Get book statistics
     */
    static async getBookStats(req, res) {
        try {
            const stats = await book_service_1.BookService.getBookStats();
            return res.json(apiResponse_utils_1.ApiResponseUtil.success(stats, 'Book statistics retrieved successfully'));
        }
        catch (error) {
            return res.status(500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to get book statistics'));
        }
    }
    /**
     * Get book with review summary
     */
    static async getBookWithReviewSummary(req, res) {
        try {
            const idParam = getRouteParam(req.params.id);
            const bookId = parseInt(idParam || '', 10);
            if (isNaN(bookId)) {
                return res.status(400).json(apiResponse_utils_1.ApiResponseUtil.badRequest('Invalid book ID'));
            }
            const summary = await book_service_1.BookService.getBookWithReviewSummary(bookId);
            return res.json(apiResponse_utils_1.ApiResponseUtil.success(summary, 'Book summary retrieved successfully'));
        }
        catch (error) {
            return res.status(error.statusCode || 500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to get book summary'));
        }
    }
    /**
     * Create book (admin only)
     */
    static async createBook(req, res) {
        try {
            const { title, author, description, categoryId } = req.body;
            if (!title || !author || !categoryId) {
                return res.status(400).json(apiResponse_utils_1.ApiResponseUtil.badRequest('Title, author and category are required'));
            }
            const book = await book_service_1.BookService.createBook({
                title,
                author,
                description: description || '', // Ensure description is never undefined
                categoryId
            });
            return res.status(201).json(apiResponse_utils_1.ApiResponseUtil.created(book, 'Book created successfully'));
        }
        catch (error) {
            return res.status(error.statusCode || 500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to create book'));
        }
    }
    /**
     * Update book (admin only)
     */
    static async updateBook(req, res) {
        try {
            const idParam = getRouteParam(req.params.id);
            const bookId = parseInt(idParam || '', 10);
            if (isNaN(bookId)) {
                return res.status(400).json(apiResponse_utils_1.ApiResponseUtil.badRequest('Invalid book ID'));
            }
            const updates = req.body;
            const book = await book_service_1.BookService.updateBook(bookId, updates);
            return res.json(apiResponse_utils_1.ApiResponseUtil.success(book, 'Book updated successfully'));
        }
        catch (error) {
            return res.status(error.statusCode || 500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to update book'));
        }
    }
    /**
     * Delete book (admin only)
     */
    static async deleteBook(req, res) {
        try {
            const idParam = getRouteParam(req.params.id);
            const bookId = parseInt(idParam || '', 10);
            if (isNaN(bookId)) {
                return res.status(400).json(apiResponse_utils_1.ApiResponseUtil.badRequest('Invalid book ID'));
            }
            await book_service_1.BookService.deleteBook(bookId);
            return res.json(apiResponse_utils_1.ApiResponseUtil.success(null, 'Book deleted successfully'));
        }
        catch (error) {
            return res.status(error.statusCode || 500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to delete book'));
        }
    }
    /**
     * Bulk create books (admin only)
     */
    static async bulkCreateBooks(req, res) {
        try {
            const { books } = req.body;
            if (!books || !Array.isArray(books) || books.length === 0) {
                return res.status(400).json(apiResponse_utils_1.ApiResponseUtil.badRequest('Books array is required'));
            }
            const createdBooks = await book_service_1.BookService.bulkCreateBooks(books);
            return res.status(201).json(apiResponse_utils_1.ApiResponseUtil.success(createdBooks, `${createdBooks.length} books created successfully`));
        }
        catch (error) {
            return res.status(error.statusCode || 500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to bulk create books'));
        }
    }
}
exports.BookController = BookController;
