"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookService = void 0;
const Book_model_1 = require("../models/Book.model");
const Review_model_1 = require("../models/Review.model");
const Category_model_1 = require("../models/Category.model");
const error_middleware_1 = require("../middleware/error.middleware");
class BookService {
    /**
     * Get all books with filters and pagination
     */
    static async getAllBooks(filters = {}) {
        try {
            const { search, categoryId, author, minRating, sortBy = 'rating', sortOrder = 'desc', page = 1, limit = 10 } = filters;
            // Get all books
            let books = await Book_model_1.BookModel.findAll();
            // Apply search filter
            if (search) {
                const searchLower = search.toLowerCase();
                books = books.filter(b => b.title.toLowerCase().includes(searchLower) ||
                    b.author.toLowerCase().includes(searchLower) ||
                    b.description?.toLowerCase().includes(searchLower));
            }
            // Apply category filter
            if (categoryId) {
                books = books.filter(b => b.categoryId === categoryId);
            }
            // Apply author filter
            if (author) {
                const authorLower = author.toLowerCase();
                books = books.filter(b => b.author.toLowerCase().includes(authorLower));
            }
            // Apply minimum rating filter
            if (minRating) {
                books = books.filter(b => b.avg_rating >= minRating);
            }
            // Sort books
            books = this.sortBooks(books, sortBy, sortOrder);
            // Calculate pagination
            const total = books.length;
            const totalPages = Math.ceil(total / limit);
            const start = (page - 1) * limit;
            const paginatedBooks = books.slice(start, start + limit);
            return {
                books: paginatedBooks,
                total,
                page,
                limit,
                totalPages,
                filters
            };
        }
        catch (error) {
            throw new error_middleware_1.ApiError(500, `Failed to get books: ${error.message}`);
        }
    }
    /**
     * Get book by ID with details
     */
    static async getBookById(bookId) {
        try {
            console.log(`📖 BookService.getBookById called with ID: ${bookId}`);
            // Get book details from BookModel.findById
            const book = await Book_model_1.BookModel.findById(bookId);
            if (!book) {
                throw new error_middleware_1.ApiError(404, 'Book not found');
            }
            // Get book reviews
            let reviews = [];
            try {
                const allReviews = await Review_model_1.ReviewModel.findAll();
                reviews = allReviews.filter(r => r.book_id === bookId) || [];
                reviews = reviews.map(r => ({
                    id: r.id,
                    userId: r.user_id,
                    userName: r.user_name || 'Anonymous',
                    userAvatar: null,
                    rating: r.rating,
                    comment: r.comment,
                    createdAt: r.created_at,
                    likes: r.likes || 0,
                    isLiked: r.isLiked || false
                }));
            }
            catch (reviewError) {
                console.log('⚠️ No reviews found or error fetching reviews:', reviewError);
                reviews = [];
            }
            // Get rating distribution
            const ratingDistribution = await this.getRatingDistribution(bookId);
            // Get similar books
            let similarBooks = [];
            try {
                const allBooks = await Book_model_1.BookModel.findAll() || [];
                similarBooks = allBooks
                    .filter(b => b.categoryId === book.categoryId &&
                    b.id !== book.id)
                    .sort((a, b) => (b.avg_rating || 0) - (a.avg_rating || 0))
                    .slice(0, 5);
            }
            catch (similarError) {
                console.log('⚠️ Error fetching similar books:', similarError);
                similarBooks = [];
            }
            return {
                ...book,
                reviews: reviews,
                ratingDistribution: ratingDistribution,
                similarBooks: similarBooks
            };
        }
        catch (error) {
            if (error instanceof error_middleware_1.ApiError)
                throw error;
            console.error('❌ Error in getBookById service:', error);
            throw new error_middleware_1.ApiError(500, `Failed to get book: ${error.message}`);
        }
    }
    /**
     * Get book by ID (basic)
     */
    static async getBook(bookId) {
        try {
            const book = await Book_model_1.BookModel.findById(bookId);
            if (!book) {
                throw new error_middleware_1.ApiError(404, 'Book not found');
            }
            return book;
        }
        catch (error) {
            if (error instanceof error_middleware_1.ApiError)
                throw error;
            throw new error_middleware_1.ApiError(500, `Failed to get book: ${error.message}`);
        }
    }
    /**
     * Create new book - ✅ FIXED to handle cover_image correctly
     */
    static async createBook(input) {
        try {
            console.log('📝 Creating book with input:', {
                title: input.title,
                author: input.author,
                categoryId: input.categoryId,
                hasCoverImage: !!input.cover_image
            });
            // Validate category exists
            if (input.categoryId) {
                const category = await Category_model_1.CategoryModel.findById(input.categoryId);
                if (!category) {
                    throw new error_middleware_1.ApiError(400, 'Invalid category');
                }
            }
            // Check if book already exists (same title and author)
            const existingBooks = await Book_model_1.BookModel.findAll();
            const duplicate = existingBooks.find(b => b.title.toLowerCase() === input.title.toLowerCase() &&
                b.author.toLowerCase() === input.author.toLowerCase());
            if (duplicate) {
                throw new error_middleware_1.ApiError(400, 'Book with this title and author already exists');
            }
            // ✅ FIXED: Create book with cover_image (handle undefined properly)
            const bookData = {
                title: input.title,
                author: input.author,
                description: input.description || '',
                categoryId: input.categoryId,
                cover_image: input.cover_image || undefined // ✅ Convert null/undefined to undefined
            };
            const newBook = await Book_model_1.BookModel.create(bookData);
            console.log('✅ Book created with ID:', newBook.id, 'Cover image:', newBook.cover_image ? 'Yes' : 'No');
            return newBook;
        }
        catch (error) {
            if (error instanceof error_middleware_1.ApiError)
                throw error;
            console.error('❌ Error in createBook service:', error);
            throw new error_middleware_1.ApiError(500, `Failed to create book: ${error.message}`);
        }
    }
    /**
     * Update book - ✅ FIXED to handle cover_image correctly
     */
    static async updateBook(bookId, updates) {
        try {
            // Check if book exists
            const existingBook = await Book_model_1.BookModel.findById(bookId);
            if (!existingBook) {
                throw new error_middleware_1.ApiError(404, 'Book not found');
            }
            // Validate category if being updated
            if (updates.categoryId) {
                const category = await Category_model_1.CategoryModel.findById(updates.categoryId);
                if (!category) {
                    throw new error_middleware_1.ApiError(400, 'Invalid category');
                }
            }
            // Check for duplicate if title or author changed
            if (updates.title || updates.author) {
                const title = updates.title || existingBook.title;
                const author = updates.author || existingBook.author;
                const existingBooks = await Book_model_1.BookModel.findAll();
                const duplicate = existingBooks.find(b => b.id !== bookId &&
                    b.title.toLowerCase() === title.toLowerCase() &&
                    b.author.toLowerCase() === author.toLowerCase());
                if (duplicate) {
                    throw new error_middleware_1.ApiError(400, 'Book with this title and author already exists');
                }
            }
            // ✅ FIXED: Prepare update data, handling cover_image properly
            const updateData = {};
            if (updates.title !== undefined)
                updateData.title = updates.title;
            if (updates.author !== undefined)
                updateData.author = updates.author;
            if (updates.description !== undefined)
                updateData.description = updates.description;
            if (updates.categoryId !== undefined)
                updateData.categoryId = updates.categoryId;
            if (updates.cover_image !== undefined)
                updateData.cover_image = updates.cover_image;
            if (updates.isbn !== undefined)
                updateData.isbn = updates.isbn;
            if (updates.publisher !== undefined)
                updateData.publisher = updates.publisher;
            if (updates.publish_date !== undefined)
                updateData.publish_date = updates.publish_date;
            if (updates.pages !== undefined)
                updateData.pages = updates.pages;
            if (updates.language !== undefined)
                updateData.language = updates.language;
            if (updates.format !== undefined)
                updateData.format = updates.format;
            if (updates.price !== undefined)
                updateData.price = updates.price;
            if (updates.status !== undefined)
                updateData.status = updates.status;
            if (updates.is_featured !== undefined)
                updateData.is_featured = updates.is_featured;
            // Update book
            const updatedBook = await Book_model_1.BookModel.update(bookId, updateData);
            if (!updatedBook) {
                throw new error_middleware_1.ApiError(500, 'Failed to update book');
            }
            return updatedBook;
        }
        catch (error) {
            if (error instanceof error_middleware_1.ApiError)
                throw error;
            throw new error_middleware_1.ApiError(500, `Failed to update book: ${error.message}`);
        }
    }
    /**
     * Delete book
     */
    static async deleteBook(bookId) {
        try {
            // Check if book exists
            const book = await Book_model_1.BookModel.findById(bookId);
            if (!book) {
                throw new error_middleware_1.ApiError(404, 'Book not found');
            }
            // Check if book has reviews
            const reviews = await Review_model_1.ReviewModel.findByBookId(bookId);
            if (reviews.length > 0) {
                throw new error_middleware_1.ApiError(400, 'Cannot delete book with existing reviews. Delete reviews first.');
            }
            // Delete book
            const deleted = await Book_model_1.BookModel.delete(bookId);
            return deleted;
        }
        catch (error) {
            if (error instanceof error_middleware_1.ApiError)
                throw error;
            throw new error_middleware_1.ApiError(500, `Failed to delete book: ${error.message}`);
        }
    }
    /**
     * Get popular books
     */
    static async getPopularBooks(limit = 10) {
        try {
            const books = await Book_model_1.BookModel.getPopularBooks(limit);
            return books;
        }
        catch (error) {
            throw new error_middleware_1.ApiError(500, `Failed to get popular books: ${error.message}`);
        }
    }
    /**
     * Get books by category
     */
    static async getBooksByCategory(categoryId, page = 1, limit = 10) {
        try {
            // Check if category exists
            const category = await Category_model_1.CategoryModel.findById(categoryId);
            if (!category) {
                throw new error_middleware_1.ApiError(404, 'Category not found');
            }
            // Get books by category
            const allBooks = await Book_model_1.BookModel.findAll();
            const categoryBooks = allBooks.filter(b => b.categoryId === categoryId);
            // Sort by rating
            const sortedBooks = categoryBooks.sort((a, b) => b.avg_rating - a.avg_rating);
            // Paginate
            const total = sortedBooks.length;
            const totalPages = Math.ceil(total / limit);
            const start = (page - 1) * limit;
            const paginatedBooks = sortedBooks.slice(start, start + limit);
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
     * Get books by author
     */
    static async getBooksByAuthor(author, page = 1, limit = 10) {
        try {
            const authorLower = author.toLowerCase();
            const allBooks = await Book_model_1.BookModel.findAll();
            const authorBooks = allBooks.filter(b => b.author.toLowerCase().includes(authorLower));
            // Sort by rating
            const sortedBooks = authorBooks.sort((a, b) => b.avg_rating - a.avg_rating);
            // Paginate
            const total = sortedBooks.length;
            const totalPages = Math.ceil(total / limit);
            const start = (page - 1) * limit;
            const paginatedBooks = sortedBooks.slice(start, start + limit);
            return {
                books: paginatedBooks,
                total,
                page,
                limit,
                totalPages
            };
        }
        catch (error) {
            throw new error_middleware_1.ApiError(500, `Failed to get books by author: ${error.message}`);
        }
    }
    /**
     * Search books
     */
    static async searchBooks(query, filters) {
        try {
            return this.getAllBooks({
                ...filters,
                search: query
            });
        }
        catch (error) {
            throw new error_middleware_1.ApiError(500, `Failed to search books: ${error.message}`);
        }
    }
    /**
     * Get book statistics
     */
    static async getBookStats() {
        try {
            const books = await Book_model_1.BookModel.findAll();
            const reviews = await Review_model_1.ReviewModel.findAll();
            // Calculate average rating
            const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
            const averageRating = reviews.length > 0
                ? Number((totalRating / reviews.length).toFixed(1))
                : 0;
            // Get books by category
            const categories = await Category_model_1.CategoryModel.findAll();
            const booksByCategory = await Promise.all(categories.map(async (cat) => {
                const catBooks = books.filter(b => b.categoryId === cat.id);
                const catReviews = await Review_model_1.ReviewModel.findAll();
                const catBookReviews = catReviews.filter(r => catBooks.some(b => b.id === r.book_id));
                const avgRating = catBookReviews.length > 0
                    ? Number((catBookReviews.reduce((sum, r) => sum + r.rating, 0) / catBookReviews.length).toFixed(1))
                    : 0;
                return {
                    category: cat.category,
                    count: catBooks.length,
                    averageRating: avgRating
                };
            }));
            // Top rated books (minimum 3 reviews)
            const topRatedBooks = books
                .filter(b => b.review_count >= 3)
                .sort((a, b) => b.avg_rating - a.avg_rating)
                .slice(0, 5);
            // Most reviewed books
            const mostReviewedBooks = books
                .sort((a, b) => b.review_count - a.review_count)
                .slice(0, 5);
            return {
                totalBooks: books.length,
                totalReviews: reviews.length,
                averageRating,
                booksByCategory,
                topRatedBooks,
                mostReviewedBooks
            };
        }
        catch (error) {
            throw new error_middleware_1.ApiError(500, `Failed to get book stats: ${error.message}`);
        }
    }
    /**
     * Get rating distribution for a book
     */
    static async getRatingDistribution(bookId) {
        try {
            const reviews = await Review_model_1.ReviewModel.findByBookId(bookId) || [];
            const totalReviews = reviews.length;
            const distribution = [5, 4, 3, 2, 1].map(rating => {
                const count = reviews.filter(r => r && r.rating === rating).length;
                const percentage = totalReviews > 0
                    ? Number(((count / totalReviews) * 100).toFixed(1))
                    : 0;
                return { rating, count, percentage };
            });
            return distribution;
        }
        catch (error) {
            console.error('Error getting rating distribution:', error);
            return [5, 4, 3, 2, 1].map(rating => ({
                rating,
                count: 0,
                percentage: 0
            }));
        }
    }
    /**
     * Sort books by given criteria
     */
    static sortBooks(books, sortBy, sortOrder) {
        const sorted = [...books];
        switch (sortBy) {
            case 'title':
                sorted.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'author':
                sorted.sort((a, b) => a.author.localeCompare(b.author));
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
    /**
     * Validate book exists
     */
    static async validateBookExists(bookId) {
        try {
            const book = await Book_model_1.BookModel.findById(bookId);
            return !!book;
        }
        catch (error) {
            return false;
        }
    }
    /**
     * Get book with review summary
     */
    static async getBookWithReviewSummary(bookId) {
        try {
            const book = await Book_model_1.BookModel.findById(bookId);
            if (!book) {
                throw new error_middleware_1.ApiError(404, 'Book not found');
            }
            const reviews = await Review_model_1.ReviewModel.findByBookId(bookId);
            const ratingDistribution = await this.getRatingDistribution(bookId);
            return {
                ...book,
                reviewSummary: {
                    total: reviews.length,
                    average: book.avg_rating,
                    distribution: ratingDistribution,
                    recentReviews: reviews.slice(0, 3)
                }
            };
        }
        catch (error) {
            if (error instanceof error_middleware_1.ApiError)
                throw error;
            throw new error_middleware_1.ApiError(500, `Failed to get book summary: ${error.message}`);
        }
    }
    /**
     * Bulk create books (admin only) - ✅ FIXED to handle cover_image
     */
    static async bulkCreateBooks(books) {
        try {
            const createdBooks = [];
            const errors = [];
            for (const bookData of books) {
                try {
                    // Validate category
                    if (bookData.categoryId) {
                        const category = await Category_model_1.CategoryModel.findById(bookData.categoryId);
                        if (!category) {
                            errors.push({ book: bookData, error: 'Invalid category' });
                            continue;
                        }
                    }
                    // Check for duplicate
                    const existingBooks = await Book_model_1.BookModel.findAll();
                    const duplicate = existingBooks.find(b => b.title.toLowerCase() === bookData.title.toLowerCase() &&
                        b.author.toLowerCase() === bookData.author.toLowerCase());
                    if (duplicate) {
                        errors.push({ book: bookData, error: 'Book already exists' });
                        continue;
                    }
                    // ✅ FIXED: Create book with cover_image (handle undefined properly)
                    const bookToCreate = {
                        title: bookData.title,
                        author: bookData.author,
                        description: bookData.description || '',
                        categoryId: bookData.categoryId,
                        cover_image: bookData.cover_image || undefined
                    };
                    const newBook = await Book_model_1.BookModel.create(bookToCreate);
                    createdBooks.push(newBook);
                }
                catch (error) {
                    errors.push({ book: bookData, error: error.message });
                }
            }
            if (errors.length > 0) {
                console.warn('Bulk create completed with errors:', errors);
            }
            return createdBooks;
        }
        catch (error) {
            if (error instanceof error_middleware_1.ApiError)
                throw error;
            throw new error_middleware_1.ApiError(500, `Failed to bulk create books: ${error.message}`);
        }
    }
}
exports.BookService = BookService;
