"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const database_1 = __importDefault(require("../config/database"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const admin_middleware_1 = require("../middleware/admin.middleware");
const router = (0, express_1.Router)();
// Configure storage
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path_1.default.join(__dirname, '../../uploads/covers');
        // Create directory if it doesn't exist
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Create unique filename: bookId-timestamp-originalname
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path_1.default.extname(file.originalname);
        cb(null, `book-${uniqueSuffix}${ext}`);
    }
});
// File filter - only accept images
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Invalid file type. Only JPEG, PNG, GIF and WEBP are allowed.'));
    }
};
const upload = (0, multer_1.default)({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});
// Upload cover image for a book (admin only)
router.post('/books/:bookId/cover', auth_middleware_1.authenticate, admin_middleware_1.isAdmin, upload.single('cover'), async (req, res) => {
    try {
        const bookId = parseInt(req.params.bookId);
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        // Generate URL for the image
        const imageUrl = `/uploads/covers/${req.file.filename}`;
        // Update database with the image URL
        const result = await database_1.default.query('UPDATE books SET cover_image = $1 WHERE id = $2 RETURNING id, title, cover_image', [imageUrl, bookId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Book not found' });
        }
        res.json({
            success: true,
            message: 'Cover image uploaded successfully',
            coverImage: imageUrl,
            book: result.rows[0]
        });
    }
    catch (error) {
        console.error('Error uploading cover:', error);
        res.status(500).json({ error: 'Failed to upload cover image' });
    }
});
// Delete cover image (admin only)
router.delete('/books/:bookId/cover', auth_middleware_1.authenticate, admin_middleware_1.isAdmin, async (req, res) => {
    try {
        const bookId = parseInt(req.params.bookId);
        // Get current cover image path
        const result = await database_1.default.query('SELECT cover_image FROM books WHERE id = $1', [bookId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Book not found' });
        }
        const coverImage = result.rows[0].cover_image;
        if (coverImage) {
            // Delete file from filesystem
            const fileName = path_1.default.basename(coverImage);
            const filePath = path_1.default.join(__dirname, '../../uploads/covers', fileName);
            if (fs_1.default.existsSync(filePath)) {
                fs_1.default.unlinkSync(filePath);
            }
            // Update database to remove reference
            await database_1.default.query('UPDATE books SET cover_image = NULL WHERE id = $1', [bookId]);
        }
        res.json({
            success: true,
            message: 'Cover image deleted successfully'
        });
    }
    catch (error) {
        console.error('Error deleting cover:', error);
        res.status(500).json({ error: 'Failed to delete cover image' });
    }
});
// Get cover image URL for a book
router.get('/books/:bookId/cover', async (req, res) => {
    try {
        const bookId = parseInt(req.params.bookId);
        const result = await database_1.default.query('SELECT cover_image FROM books WHERE id = $1', [bookId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Book not found' });
        }
        res.json({
            success: true,
            coverImage: result.rows[0].cover_image
        });
    }
    catch (error) {
        console.error('Error fetching cover:', error);
        res.status(500).json({ error: 'Failed to fetch cover image' });
    }
});
exports.default = router;
