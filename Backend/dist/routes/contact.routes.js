"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
// POST /api/contact - Send contact message
router.post('/', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        // Validation
        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email address'
            });
        }
        // Message length validation
        if (message.length < 10) {
            return res.status(400).json({
                success: false,
                message: 'Message must be at least 10 characters'
            });
        }
        // Log the message to console (for development)
        console.log('\n📧 ========== NEW CONTACT MESSAGE ==========');
        console.log(`📝 From: ${name}`);
        console.log(`📧 Email: ${email}`);
        console.log(`📌 Subject: ${subject}`);
        console.log(`💬 Message:`);
        console.log(`${message}`);
        console.log(`🕐 Time: ${new Date().toLocaleString()}`);
        console.log('==========================================\n');
        // Return success
        res.status(200).json({
            success: true,
            message: 'Message sent successfully! We\'ll get back to you soon.'
        });
    }
    catch (error) {
        console.error('Error in contact route:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send message. Please try again.'
        });
    }
});
exports.default = router;
