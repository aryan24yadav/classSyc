// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal server error';

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = Object.values(err.errors).map((val) => val.message).join(', ');
    }

    // Invalid MongoDB ObjectId
    if (err.name === 'CastError') {
        statusCode = 400;
        message = 'Invalid id';
    }

    // MongoDB duplicate key error
    if (err.code === 11000) {
        statusCode = 400;
        message = 'Duplicate field value entered';
    }

    // JWT
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    }

    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired';
    }

    // Malformed JSON body
    if (err.type === 'entity.parse.failed') {
        statusCode = 400;
        message = 'Invalid JSON body';
    }

    if (statusCode >= 500) {
        console.error(err);
        // Do not leak internal details to clients in production
        if (process.env.NODE_ENV === 'production') {
            message = 'Internal server error';
        }
    }

    res.status(statusCode).json({
        success: false,
        error: message,
    });
};

export default errorHandler;
