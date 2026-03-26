"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_model_1 = require("../models/User.model");
const apiResponse_utils_1 = require("../utils/apiResponse.utils");
class AuthController {
    static async register(req, res) {
        try {
            const { name, email, password } = req.body;
            // Validate input
            if (!name || !email || !password) {
                return res.status(400).json(apiResponse_utils_1.ApiResponseUtil.badRequest('Name, email and password are required'));
            }
            // Check if user exists
            const existingUser = await User_model_1.UserModel.findByEmail(email);
            if (existingUser) {
                return res.status(400).json(apiResponse_utils_1.ApiResponseUtil.badRequest('User with this email already exists'));
            }
            // Hash password
            const hashedPassword = await bcrypt_1.default.hash(password, 10);
            // Create user (default roleId = 2 for regular user)
            const newUser = await User_model_1.UserModel.create({
                name,
                email,
                password: hashedPassword,
                roleId: 2
            });
            // Generate JWT token
            const token = jsonwebtoken_1.default.sign({
                id: newUser.id,
                email: newUser.email,
                roleId: newUser.roleId
            }, process.env.JWT_SECRET || 'your-secret-key', {
                expiresIn: (process.env.JWT_EXPIRES_IN || '7d')
            });
            // Remove password from response
            const { password: _, ...userWithoutPassword } = newUser;
            return res.status(201).json(apiResponse_utils_1.ApiResponseUtil.success({ user: userWithoutPassword, token }, 'User registered successfully'));
        }
        catch (error) {
            console.error(error);
            return res.status(500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Registration failed'));
        }
    }
    /**
     * Login user
     */
    static async login(req, res) {
        try {
            const { email, password } = req.body;
            // Validate input
            if (!email || !password) {
                return res.status(400).json(apiResponse_utils_1.ApiResponseUtil.badRequest('Email and password are required'));
            }
            // Find user by email
            const user = await User_model_1.UserModel.findByEmail(email);
            if (!user) {
                return res.status(401).json(apiResponse_utils_1.ApiResponseUtil.unauthorized('Invalid email or password'));
            }
            // Verify password
            const isValidPassword = await bcrypt_1.default.compare(password, user.password);
            if (!isValidPassword) {
                return res.status(401).json(apiResponse_utils_1.ApiResponseUtil.unauthorized('Invalid email or password'));
            }
            // Generate JWT token
            const token = jsonwebtoken_1.default.sign({
                id: user.id,
                email: user.email,
                roleId: user.roleId
            }, process.env.JWT_SECRET || 'your-secret-key', {
                expiresIn: (process.env.JWT_EXPIRES_IN || '7d')
            });
            // Get user with role
            const userWithRole = await User_model_1.UserModel.findById(user.id);
            // Remove password from response
            const { password: _, ...userWithoutPassword } = user;
            return res.json(apiResponse_utils_1.ApiResponseUtil.success({
                user: {
                    ...userWithoutPassword,
                    role: userWithRole?.role_name
                },
                token
            }, 'Login successful'));
        }
        catch (error) {
            console.error(error);
            return res.status(500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Login failed'));
        }
    }
    /**
     * Get current user profile - ✅ FIXED
     */
    static async getProfile(req, res) {
        try {
            // ✅ Check if user exists in request
            if (!req.user) {
                return res.status(401).json(apiResponse_utils_1.ApiResponseUtil.unauthorized('User not authenticated'));
            }
            const userId = req.user.id;
            // Get user with role
            const user = await User_model_1.UserModel.findById(userId);
            if (!user) {
                return res.status(404).json(apiResponse_utils_1.ApiResponseUtil.notFound('User'));
            }
            // Remove password from response
            const { password: _, ...userWithoutPassword } = user;
            return res.json(apiResponse_utils_1.ApiResponseUtil.success(userWithoutPassword, 'Profile retrieved successfully'));
        }
        catch (error) {
            console.error(error);
            return res.status(500).json(apiResponse_utils_1.ApiResponseUtil.error(error.message || 'Failed to get profile'));
        }
    }
    /**
     * Verify token (helper method for frontend) - ✅ FIXED
     */
    static async verifyToken(req, res) {
        try {
            // ✅ Check if user exists in request
            if (!req.user) {
                return res.status(401).json(apiResponse_utils_1.ApiResponseUtil.unauthorized('Invalid token or user not found'));
            }
            // User is already attached to req by auth middleware
            return res.json(apiResponse_utils_1.ApiResponseUtil.success({
                valid: true,
                user: {
                    id: req.user.id,
                    email: req.user.email,
                    roleId: req.user.roleId,
                    name: req.user.name
                }
            }, 'Token is valid'));
        }
        catch (error) {
            console.error('Token verification error:', error);
            return res.status(401).json(apiResponse_utils_1.ApiResponseUtil.unauthorized('Invalid token'));
        }
    }
}
exports.AuthController = AuthController;
