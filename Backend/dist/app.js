"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const book_routes_1 = __importDefault(require("./routes/book.routes"));
const review_routes_1 = __importDefault(require("./routes/review.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const category_routes_1 = __importDefault(require("./routes/category.routes"));
const contact_routes_1 = __importDefault(require("./routes/contact.routes")); // ✅ ADD THIS

dotenv_1.default.config();
const app = (0, express_1.default)();

// Middleware
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));


app.use('/api/auth', auth_routes_1.default); 
app.use('/api/books', book_routes_1.default); 
app.use('/api/categories', category_routes_1.default); 
app.use('/api/reviews', review_routes_1.default); 
app.use('/api/contact', contact_routes_1.default); 


app.use('/api/users', user_routes_1.default); 


app.use('/api/admin', admin_routes_1.default); 

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date(), service: 'Book Review API' });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

exports.default = app;