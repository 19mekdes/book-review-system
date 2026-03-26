"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookController = void 0;
const book_service_1 = require("../services/book.service");
const apiResponse_utils_1 = require("../utils/apiResponse.utils");
const getQueryString = (param) => {
    if (Array.isArray(param)) {
        return param[0];
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
const getRouteParam = (param) => {
    if (Array.isArray(param)) {
        return param[0];
    }
    return param;
};
const getSortBy = (param) => {
    const str = getQueryString(param);
    if (str === 'title' || str === 'author' || str === 'rating' || str === 'reviews') {
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
    // Remove the unimplemented methods or implement them properly
    static addBookmark(req, res) {
        return res.status(501).json(apiResponse_utils_1.ApiResponseUtil.error('Method not implemented'));
    }
    static removeBookmark(req, res) {
        return res.status(501).json(apiResponse_utils_1.ApiResponseUtil.error('Method not implemented'));
    }
    static getUserBookmarks(req, res) {
        return res.status(501).json(apiResponse_utils_1.ApiResponseUtil.error('Method not implemented'));
    }
    static addFavorite(req, res) {
        return res.status(501).json(apiResponse_utils_1.ApiResponseUtil.error('Method not implemented'));
    }
    static removeFavorite(req, res) {
        return res.status(501).json(apiResponse_utils_1.ApiResponseUtil.error('Method not implemented'));
    }
    static getUserFavorites(req, res) {
        return res.status(501).json(apiResponse_utils_1.ApiResponseUtil.error('Method not implemented'));
    }
    static getUserReadingList(req, res) {
        return res.status(501).json(apiResponse_utils_1.ApiResponseUtil.error('Method not implemented'));
    }
    static removeFromReadingList(req, res) {
        return res.status(501).json(apiResponse_utils_1.ApiResponseUtil.error('Method not implemented'));
    }
    static updateReadingStatus(req, res) {
        return res.status(501).json(apiResponse_utils_1.ApiResponseUtil.error('Method not implemented'));
    }
    static addToReadingList(req, res) {
        return res.status(501).json(apiResponse_utils_1.ApiResponseUtil.error('Method not implemented'));
    }
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
            console.log('📚 Fetching books with filters:', filters);
            const result = await book_service_1.BookService.getAllBooks(filters);
            return res.json(apiResponse_utils_1.ApiResponseUtil.success(result, 'Books retrieved successfully'));
        }
        catch (error) {
            console.error('❌ Error in getAllBooks:', error);
            return res.status(error.statusCode || 500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to get books'));
        }
    }
    static async getBookById(req, res) {
        try {
            const idParam = getRouteParam(req.params.id);
            const bookId = parseInt(idParam || '', 10);
            console.log(`🔍 BookController.getBookById called with ID: ${bookId}`);
            if (isNaN(bookId)) {
                console.error('❌ Invalid book ID:', idParam);
                return res.status(400).json(apiResponse_utils_1.ApiResponseUtil.badRequest('Invalid book ID'));
            }
            console.log(`📖 Fetching book with ID: ${bookId} from service`);
            const book = await book_service_1.BookService.getBookById(bookId);
            console.log(`✅ Book found:`, book ? book.title : 'No book found');
            return res.json(apiResponse_utils_1.ApiResponseUtil.success(book, 'Book retrieved successfully'));
        }
        catch (error) {
            console.error('❌ Error in getBookById controller:', error);
            if (error.stack) {
                console.error('Stack trace:', error.stack);
            }
            return res.status(error.statusCode || 500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to get book'));
        }
    }
    /**
     * Get popular books
     */
    static async getPopularBooks(req, res) {
        try {
            const limit = getQueryNumber(req.query.limit) || 10;
            console.log(`📊 Fetching ${limit} popular books`);
            const books = await book_service_1.BookService.getPopularBooks(limit);
            return res.json(apiResponse_utils_1.ApiResponseUtil.success(books, 'Popular books retrieved successfully'));
        }
        catch (error) {
            console.error('❌ Error in getPopularBooks:', error);
            return res.status(500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to get popular books'));
        }
    }
    static async getBooksByCategory(req, res) {
        try {
            const categoryIdParam = getRouteParam(req.params.categoryId);
            const categoryId = parseInt(categoryIdParam || '', 10);
            if (isNaN(categoryId)) {
                return res.status(400).json(apiResponse_utils_1.ApiResponseUtil.badRequest('Invalid category ID'));
            }
            const page = getQueryNumber(req.query.page) || 1;
            const limit = getQueryNumber(req.query.limit) || 10;
            console.log(`📚 Fetching books for category ID: ${categoryId}, page: ${page}, limit: ${limit}`);
            const result = await book_service_1.BookService.getBooksByCategory(categoryId, page, limit);
            return res.json(apiResponse_utils_1.ApiResponseUtil.success(result, 'Books retrieved successfully'));
        }
        catch (error) {
            console.error('❌ Error in getBooksByCategory:', error);
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
            console.log(`📚 Fetching books by author: ${author}, page: ${page}, limit: ${limit}`);
            const result = await book_service_1.BookService.getBooksByAuthor(author, page, limit);
            return res.json(apiResponse_utils_1.ApiResponseUtil.success(result, 'Books retrieved successfully'));
        }
        catch (error) {
            console.error('❌ Error in getBooksByAuthor:', error);
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
            console.log(`🔍 Searching books with query: "${query}", filters:`, filters);
            const result = await book_service_1.BookService.searchBooks(query, filters);
            return res.json(apiResponse_utils_1.ApiResponseUtil.success(result, 'Search completed successfully'));
        }
        catch (error) {
            console.error('❌ Error in searchBooks:', error);
            return res.status(500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Search failed'));
        }
    }
    /**
     * Get book statistics
     */
    static async getBookStats(req, res) {
        try {
            console.log('📊 Fetching book statistics');
            const stats = await book_service_1.BookService.getBookStats();
            return res.json(apiResponse_utils_1.ApiResponseUtil.success(stats, 'Book statistics retrieved successfully'));
        }
        catch (error) {
            console.error('❌ Error in getBookStats:', error);
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
            console.log(`📖 Fetching book summary for ID: ${bookId}`);
            const summary = await book_service_1.BookService.getBookWithReviewSummary(bookId);
            return res.json(apiResponse_utils_1.ApiResponseUtil.success(summary, 'Book summary retrieved successfully'));
        }
        catch (error) {
            console.error('❌ Error in getBookWithReviewSummary:', error);
            return res.status(error.statusCode || 500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to get book summary'));
        }
    }
    /**
     * Create book (admin only) - ✅ FIXED: Added cover_image extraction
     */
    static async createBook(req, res) {
        try {
            // ✅ FIXED: Extract cover_image from request body
            const { title, author, description, categoryId, cover_image // ✅ ADD THIS
             } = req.body;
            if (!title || !author || !categoryId) {
                return res.status(400).json(apiResponse_utils_1.ApiResponseUtil.badRequest('Title, author and category are required'));
            }
            console.log(`📝 Creating new book: ${title} by ${author}`);
            console.log(`🖼️ Cover image: ${cover_image ? 'Present' : 'Not provided'}`);
            // ✅ FIXED: Pass cover_image to service
            const book = await book_service_1.BookService.createBook({
                title,
                author,
                description: description || '',
                categoryId,
                cover_image: cover_image || null // ✅ ADD THIS
            });
            console.log(`✅ Book created with ID: ${book.id}, cover_image: ${book.cover_image ? 'Yes' : 'No'}`);
            return res.status(201).json(apiResponse_utils_1.ApiResponseUtil.created(book, 'Book created successfully'));
        }
        catch (error) {
            console.error('❌ Error in createBook:', error);
            return res.status(error.statusCode || 500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to create book'));
        }
    }
    /**
     * Update book (admin only) - ✅ FIXED: Added cover_image extraction
     */
    static async updateBook(req, res) {
        try {
            const idParam = getRouteParam(req.params.id);
            const bookId = parseInt(idParam || '', 10);
            if (isNaN(bookId)) {
                return res.status(400).json(apiResponse_utils_1.ApiResponseUtil.badRequest('Invalid book ID'));
            }
            // ✅ FIXED: Extract all updates including cover_image
            const updates = {};
            if (req.body.title !== undefined)
                updates.title = req.body.title;
            if (req.body.author !== undefined)
                updates.author = req.body.author;
            if (req.body.description !== undefined)
                updates.description = req.body.description;
            if (req.body.categoryId !== undefined)
                updates.categoryId = req.body.categoryId;
            if (req.body.cover_image !== undefined)
                updates.cover_image = req.body.cover_image;
            if (req.body.coverImage !== undefined)
                updates.cover_image = req.body.coverImage;
            if (req.body.isbn !== undefined)
                updates.isbn = req.body.isbn;
            if (req.body.publisher !== undefined)
                updates.publisher = req.body.publisher;
            if (req.body.publishDate !== undefined)
                updates.publish_date = req.body.publishDate;
            if (req.body.pages !== undefined)
                updates.pages = req.body.pages;
            if (req.body.language !== undefined)
                updates.language = req.body.language;
            if (req.body.format !== undefined)
                updates.format = req.body.format;
            if (req.body.price !== undefined)
                updates.price = req.body.price;
            if (req.body.status !== undefined)
                updates.status = req.body.status;
            if (req.body.isFeatured !== undefined)
                updates.is_featured = req.body.isFeatured;
            console.log(`📝 Updating book ID: ${bookId} with:`, Object.keys(updates));
            const book = await book_service_1.BookService.updateBook(bookId, updates);
            return res.json(apiResponse_utils_1.ApiResponseUtil.success(book, 'Book updated successfully'));
        }
        catch (error) {
            console.error('❌ Error in updateBook:', error);
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
            console.log(`🗑️ Deleting book ID: ${bookId}`);
            await book_service_1.BookService.deleteBook(bookId);
            return res.json(apiResponse_utils_1.ApiResponseUtil.success(null, 'Book deleted successfully'));
        }
        catch (error) {
            console.error('❌ Error in deleteBook:', error);
            return res.status(error.statusCode || 500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to delete book'));
        }
    }
    /**
     * Bulk create books (admin only) - ✅ FIXED: Added cover_image extraction
     */
    static async bulkCreateBooks(req, res) {
        try {
            const { books } = req.body;
            if (!books || !Array.isArray(books) || books.length === 0) {
                return res.status(400).json(apiResponse_utils_1.ApiResponseUtil.badRequest('Books array is required'));
            }
            console.log(`📚 Bulk creating ${books.length} books`);
            // ✅ FIXED: Pass through the books array as is (includes cover_image)
            const createdBooks = await book_service_1.BookService.bulkCreateBooks(books);
            return res.status(201).json(apiResponse_utils_1.ApiResponseUtil.success(createdBooks, `${createdBooks.length} books created successfully`));
        }
        catch (error) {
            console.error('❌ Error in bulkCreateBooks:', error);
            return res.status(error.statusCode || 500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to bulk create books'));
        }
    }
}
exports.BookController = BookController;
