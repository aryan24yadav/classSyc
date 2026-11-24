import { validationResult } from 'express-validator';

// Sends the first express-validator error as a 400 response.
export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            error: errors.array()[0].msg,
        });
    }
    return next();
};
