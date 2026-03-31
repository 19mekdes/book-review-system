import { UserModel, User, UserWithRole } from '../models/User.model';
import { BookModel, Book, BookWithDetails } from '../models/Book.model';
import { ReviewModel, ReviewWithDetails } from '../models/Review.model';
import { CategoryModel, Category } from '../models/Category.model';
import { RoleModel } from '../models/Role.model';
import { ApiError } from '../middleware/error.middleware';
import { BcryptUtils } from '../utils/bcrypt.utils';
import { JwtUtils } from '../utils/jwt.utils';

export interface DashboardStats {
  totalUsers: number;
  totalBooks: number;
  totalReviews: number;
  totalCategories: number;
  recentUsers: UserWithRole[];
  recentBooks: BookWithDetails[];
  recentReviews: ReviewWithDetails[];
  popularBooks: BookWithDetails[];
  activeUsers: UserWithRole[];
  categoryStats: Array<{
    category: string;
    bookCount: number;
    reviewCount: number;
    avgRating: number;
  }>;
  ratingDistribution: Array<{
    rating: number;
    count: number;
  }>;
}

export interface UserManagementData {
  users: UserWithRole[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BookManagementData {
  books: BookWithDetails[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ReviewManagementData {
  reviews: ReviewWithDetails[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SystemHealth {
  database: {
    status: 'healthy' | 'unhealthy';
    responseTime: number;
  };
  server: {
    uptime: number;
    memoryUsage: {
      rss: number;
      heapTotal: number;
      heapUsed: number;
      external: number;
    };
    cpuUsage: {
      user: number;
      system: number;
    };
  };
  activeSessions: number;
  requestsLastHour: number;
}

export class AdminService {
  /**
   * Get dashboard statistics
   */
  static async getDashboardStats(): Promise<DashboardStats> {
    try {
      // Get counts
      const users = await UserModel.findAll();
      const books = await BookModel.findAll();
      const reviews = await ReviewModel.findAll();
      const categories = await CategoryModel.findAll();

      // Get recent data
      const recentUsers = await UserModel.getUsersWithReviewCounts();
      const recentBooks = await BookModel.findAll();
      const recentReviews = await ReviewModel.getLatestReviews(10);

      // Get popular books
      const popularBooks = await BookModel.getPopularBooks(5);

      // Get active users (users with most reviews)
      const activeUsers = recentUsers
        .filter(u => u.review_count > 0)
        .sort((a, b) => (b.review_count || 0) - (a.review_count || 0))
        .slice(0, 5);

      // Get category statistics
      const categoryStats = await CategoryModel.getCategoriesWithStats();

      // Get rating distribution
      const allReviews = await ReviewModel.findAll();
      const ratingDistribution = [1, 2, 3, 4, 5].map(rating => ({
        rating,
        count: allReviews.filter(r => r.rating === rating).length
      }));

      return {
        totalUsers: users.length,
        totalBooks: books.length,
        totalReviews: reviews.length,
        totalCategories: categories.length,
        recentUsers: recentUsers.slice(0, 5),
        recentBooks: recentBooks.slice(0, 5),
        recentReviews: recentReviews.slice(0, 5),
        popularBooks,
        activeUsers,
        categoryStats,
        ratingDistribution
      };
    } catch (error) {
      throw new ApiError(500, `Failed to get dashboard stats: ${(error as Error).message}`);
    }
  }

  /**
   * Get all users with pagination
   */
  static async getAllUsers(
    page: number = 1,
    limit: number = 10,
    search?: string,
    role?: string
  ): Promise<UserManagementData> {
    try {
      let users = await UserModel.getUsersWithReviewCounts();

      // Apply search filter
      if (search) {
        const searchLower = search.toLowerCase();
        users = users.filter(
          u => 
            u.name.toLowerCase().includes(searchLower) ||
            u.email.toLowerCase().includes(searchLower)
        );
      }

      // Apply role filter
      if (role) {
        users = users.filter(u => u.role_name?.toLowerCase() === role.toLowerCase());
      }

      // Calculate pagination
      const total = users.length;
      const totalPages = Math.ceil(total / limit);
      const start = (page - 1) * limit;
      const paginatedUsers = users.slice(start, start + limit);

      return {
        users: paginatedUsers,
        total,
        page,
        limit,
        totalPages
      };
    } catch (error) {
      throw new ApiError(500, `Failed to get users: ${(error as Error).message}`);
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: number): Promise<UserWithRole | null> {
    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new ApiError(404, 'User not found');
      }
      return user;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, `Failed to get user: ${(error as Error).message}`);
    }
  }

  /**
   * Create new user (admin only)
   */
  static async createUser(userData: {
    name: string;
    email: string;
    password: string;
    roleId: number;
  }): Promise<Omit<User, 'password'>> {
    try {
      // Check if user exists
      const existingUser = await UserModel.findByEmail(userData.email);
      if (existingUser) {
        throw new ApiError(400, 'User with this email already exists');
      }

      // Validate password strength
      const passwordValidation = BcryptUtils.validatePasswordStrength(userData.password);
      if (!passwordValidation.isValid) {
        throw new ApiError(400, passwordValidation.message);
      }

      // Hash password
      const hashedPassword = await BcryptUtils.hashPassword(userData.password);

      // Create user
      const newUser = await UserModel.create({
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        roleId: userData.roleId
      });

      // Remove password from response
      const { password, ...userWithoutPassword } = newUser;
      return userWithoutPassword;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, `Failed to create user: ${(error as Error).message}`);
    }
  }

  /**
   * Update user (admin only)
   */
  static async updateUser(
    userId: number,
    updates: Partial<User>
  ): Promise<Omit<User, 'password'>> {
    try {
      // Check if user exists
      const existingUser = await UserModel.findById(userId);
      if (!existingUser) {
        throw new ApiError(404, 'User not found');
      }

      // If updating email, check if it's already taken
      if (updates.email && updates.email !== existingUser.email) {
        const userWithEmail = await UserModel.findByEmail(updates.email);
        if (userWithEmail) {
          throw new ApiError(400, 'Email already in use');
        }
      }

      // If updating password, hash it
      if (updates.password) {
        const passwordValidation = BcryptUtils.validatePasswordStrength(updates.password);
        if (!passwordValidation.isValid) {
          throw new ApiError(400, passwordValidation.message);
        }
        updates.password = await BcryptUtils.hashPassword(updates.password);
      }

      // Update user
      const updatedUser = await UserModel.update(userId, updates);
      if (!updatedUser) {
        throw new ApiError(500, 'Failed to update user');
      }

      // Remove password from response
      const { password, ...userWithoutPassword } = updatedUser;
      return userWithoutPassword;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, `Failed to update user: ${(error as Error).message}`);
    }
  }

  /**
   * Delete user (admin only)
   */
  static async deleteUser(userId: number, adminUserId: number): Promise<boolean> {
    try {
      // Check if user exists
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      // Prevent admin from deleting themselves
      if (userId === adminUserId) {
        throw new ApiError(400, 'Cannot delete your own account');
      }

      // Delete user
      const deleted = await UserModel.delete(userId);
      
      // Revoke all user sessions
      await JwtUtils.revokeAllUserTokens(userId);

      return deleted;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, `Failed to delete user: ${(error as Error).message}`);
    }
  }

  
  static async getAllBooks(
    page: number = 1,
    limit: number = 10,
    search?: string,
    categoryId?: number
  ): Promise<BookManagementData> {
    try {
      let books = await BookModel.findAll();

      // Apply search filter
      if (search) {
        const searchLower = search.toLowerCase();
        books = books.filter(
          b => 
            b.title.toLowerCase().includes(searchLower) ||
            b.author.toLowerCase().includes(searchLower)
        );
      }

      // Apply category filter
      if (categoryId) {
        books = books.filter(b => b.categoryId === categoryId);
      }

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
        totalPages
      };
    } catch (error) {
      throw new ApiError(500, `Failed to get books: ${(error as Error).message}`);
    }
  }

  /**
   * Create new book (admin only)
   */
  static async createBook(bookData: {
    title: string;
    author: string;
    description: string;
    categoryId: number;
  }): Promise<Book> {
    try {
      // Validate category exists
      const category = await CategoryModel.findById(bookData.categoryId);
      if (!category) {
        throw new ApiError(400, 'Invalid category');
      }

      // Create book
      const newBook = await BookModel.create(bookData);
      return newBook;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, `Failed to create book: ${(error as Error).message}`);
    }
  }

  /**
   * Update book (admin only)
   */
  static async updateBook(
    bookId: number,
    updates: Partial<Book>
  ): Promise<Book> {
    try {
      // Check if book exists
      const existingBook = await BookModel.findById(bookId);
      if (!existingBook) {
        throw new ApiError(404, 'Book not found');
      }

      // If updating category, validate it exists
      if (updates.categoryId) {
        const category = await CategoryModel.findById(updates.categoryId);
        if (!category) {
          throw new ApiError(400, 'Invalid category');
        }
      }

      // Update book
      const updatedBook = await BookModel.update(bookId, updates);
      if (!updatedBook) {
        throw new ApiError(500, 'Failed to update book');
      }

      return updatedBook;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, `Failed to update book: ${(error as Error).message}`);
    }
  }

  /**
   * Delete book (admin only)
   */
  static async deleteBook(bookId: number): Promise<boolean> {
    try {
      // Check if book exists
      const book = await BookModel.findById(bookId);
      if (!book) {
        throw new ApiError(404, 'Book not found');
      }

      // Delete book (reviews will be cascade deleted)
      const deleted = await BookModel.delete(bookId);
      return deleted;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, `Failed to delete book: ${(error as Error).message}`);
    }
  }

  /**
   * Get all reviews with pagination
   */
  static async getAllReviews(
    page: number = 1,
    limit: number = 10,
    search?: string,
    minRating?: number
  ): Promise<ReviewManagementData> {
    try {
      let reviews = await ReviewModel.findAll();

      // Apply search filter
      if (search) {
        const searchLower = search.toLowerCase();
        reviews = reviews.filter(
          r => 
            r.comment?.toLowerCase().includes(searchLower) ||
            r.user_name?.toLowerCase().includes(searchLower) ||
            r.book_title?.toLowerCase().includes(searchLower)
        );
      }

      // Apply rating filter
      if (minRating) {
        reviews = reviews.filter(r => r.rating >= minRating);
      }

      // Calculate pagination
      const total = reviews.length;
      const totalPages = Math.ceil(total / limit);
      const start = (page - 1) * limit;
      const paginatedReviews = reviews.slice(start, start + limit);

      return {
        reviews: paginatedReviews,
        total,
        page,
        limit,
        totalPages
      };
    } catch (error) {
      throw new ApiError(500, `Failed to get reviews: ${(error as Error).message}`);
    }
  }

  /**
   * Delete review (admin only)
   */
  static async deleteReview(reviewId: number): Promise<boolean> {
    try {
      // Check if review exists
      const review = await ReviewModel.findById(reviewId);
      if (!review) {
        throw new ApiError(404, 'Review not found');
      }

      // Delete review
      const deleted = await ReviewModel.delete(reviewId);
      return deleted;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, `Failed to delete review: ${(error as Error).message}`);
    }
  }

  /**
   * Get all categories with statistics
   */
  static async getAllCategories(): Promise<any[]> {
    try {
      const categories = await CategoryModel.getCategoriesWithStats();
      return categories;
    } catch (error) {
      throw new ApiError(500, `Failed to get categories: ${(error as Error).message}`);
    }
  }

  
  static async createCategory(categoryName: string): Promise<Category> {
    try {
      // Check if category exists - using 'category' field
      const existingCategory = (await CategoryModel.findAll())
        .find((c: Category) => c.category.toLowerCase() === categoryName.toLowerCase());
      
      if (existingCategory) {
        throw new ApiError(400, 'Category already exists');
      }

      // Create category
      const newCategory = await CategoryModel.create(categoryName);
      return newCategory;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, `Failed to create category: ${(error as Error).message}`);
    }
  }

  /**
   * Update category
   */
  static async updateCategory(
    categoryId: number,
    categoryName: string
  ): Promise<Category> {
    try {
      // Check if category exists
      const category = await CategoryModel.findById(categoryId);
      if (!category) {
        throw new ApiError(404, 'Category not found');
      }

      // Update category
      const updatedCategory = await CategoryModel.update(categoryId, categoryName);
      if (!updatedCategory) {
        throw new ApiError(500, 'Failed to update category');
      }

      return updatedCategory;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, `Failed to update category: ${(error as Error).message}`);
    }
  }

  /**
   * Delete category
   */
  static async deleteCategory(categoryId: number): Promise<boolean> {
    try {
      // Check if category exists
      const category = await CategoryModel.findById(categoryId);
      if (!category) {
        throw new ApiError(404, 'Category not found');
      }

      // Check if category has books
      const books = await BookModel.findAll();
      const booksInCategory = books.filter(b => b.categoryId === categoryId);
      
      if (booksInCategory.length > 0) {
        throw new ApiError(400, 'Cannot delete category with books');
      }

      // Delete category
      const deleted = await CategoryModel.delete(categoryId);
      return deleted;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, `Failed to delete category: ${(error as Error).message}`);
    }
  }

  /**
   * Get system health
   */
  static async getSystemHealth(): Promise<SystemHealth> {
    try {
      const startTime = Date.now();
      
      // Test database connection
      await UserModel.findAll();
      const dbResponseTime = Date.now() - startTime;

      return {
        database: {
          status: dbResponseTime < 1000 ? 'healthy' : 'unhealthy',
          responseTime: dbResponseTime
        },
        server: {
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage(),
          cpuUsage: process.cpuUsage()
        },
        activeSessions: await JwtUtils.getActiveSessionCount?.() || 0,
        requestsLastHour: 0
      };
    } catch (error) {
      throw new ApiError(500, `Failed to get system health: ${(error as Error).message}`);
    }
  }

  /**
   * Get all roles
   */
  static async getAllRoles(): Promise<any[]> {
    try {
      const roles = await RoleModel.findAll();
      return roles;
    } catch (error) {
      throw new ApiError(500, `Failed to get roles: ${(error as Error).message}`);
    }
  }

  /**
   * Generate report data
   */
  static async generateReport(type: 'users' | 'books' | 'reviews', dateRange: {
    start: Date;
    end: Date;
  }): Promise<any> {
    try {
      switch (type) {
        case 'users':
          const users = await UserModel.findAll();
          return {
            type: 'users',
            period: dateRange,
            total: users.length,
            newUsers: users.length,
            usersByRole: await this.getUsersByRole(),
            data: users.slice(0, 100)
          };

        case 'books':
          const books = await BookModel.findAll();
          return {
            type: 'books',
            period: dateRange,
            total: books.length,
            newBooks: books.length,
            booksByCategory: await this.getBooksByCategory(),
            data: books.slice(0, 100)
          };

        case 'reviews':
          const reviews = await ReviewModel.findAll();
          const newReviews = reviews.filter(
            r => r.created_at && 
            new Date(r.created_at) >= dateRange.start && 
            new Date(r.created_at) <= dateRange.end
          );

          return {
            type: 'reviews',
            period: dateRange,
            total: reviews.length,
            newReviews: newReviews.length,
            averageRating: this.calculateAverageRating(reviews),
            ratingDistribution: this.getRatingDistribution(reviews),
            data: newReviews.slice(0, 100)
          };

        default:
          throw new ApiError(400, 'Invalid report type');
      }
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, `Failed to generate report: ${(error as Error).message}`);
    }
  }

  /**
   * Helper: Get users by role
   */
  private static async getUsersByRole(): Promise<any[]> {
    const users = await UserModel.findAll();
    const roles = await RoleModel.findAll();
    
    return roles.map(role => ({
      role: role.name,
      count: users.filter(u => u.roleId === role.id).length
    }));
  }

  /**
   * Helper: Get books by category - FIXED: Use 'category' field
   */
  private static async getBooksByCategory(): Promise<any[]> {
    const books = await BookModel.findAll();
    const categories = await CategoryModel.findAll();
    
    return categories.map((cat: Category) => ({
      category: cat.category, // Changed from cat.name to cat.category
      count: books.filter(b => b.categoryId === cat.id).length
    }));
  }

  /**
   * Helper: Calculate average rating
   */
  private static calculateAverageRating(reviews: any[]): number {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return Number((sum / reviews.length).toFixed(1));
  }

  /**
   * Helper: Get rating distribution
   */
  private static getRatingDistribution(reviews: any[]): any[] {
    return [1, 2, 3, 4, 5].map(rating => ({
      rating,
      count: reviews.filter(r => r.rating === rating).length
    }));
  }
}