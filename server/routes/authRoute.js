import express from 'express';
import { body } from 'express-validator';
import { register, login, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validate.js';

const router = express.Router();

// POST /api/auth/register
router.post(
    '/register',
    [
        body('name')
            .isString()
            .trim()
            .isLength({ min: 3, max: 50 })
            .withMessage('Name must be between 3 and 50 characters long'),

        body('email')
            .isEmail()
            .withMessage('Please provide a valid email')
            .normalizeEmail(),

        body('password')
            .isString()
            .isLength({ min: 6, max: 128 })
            .withMessage('Password must be between 6 and 128 characters long'),
    ],
    handleValidationErrors,
    register
);

// POST /api/auth/login
router.post(
    '/login',
    [
        body('email')
            .isEmail()
            .withMessage('Please provide a valid email')
            .normalizeEmail(),

        body('password')
            .isString()
            .notEmpty()
            .withMessage('Password is required'),
    ],
    handleValidationErrors,
    login
);

// GET /api/auth/me
router.get('/me', protect, getMe);

export default router;
