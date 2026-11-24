import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDb from "./config/database.js";
import errorHandler from "./middleware/errorHandler.js";
import authRoute from './routes/authRoute.js';
import sessionRoute from './routes/sessionRoute.js';

dotenv.config();

const REQUIRED_ENV = ['MONGO_URI', 'JWT_SECRET'];
const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
}
if (!process.env.ZEGO_APP_ID || !process.env.ZEGO_SERVER_SECRET) {
    console.warn('ZEGO_APP_ID / ZEGO_SERVER_SECRET are not set: video rooms will not work until they are.');
}

const app = express();
const PORT = process.env.PORT || 5000;

// CLIENT_URL can hold several origins, separated by commas
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: '10kb' }));

app.get("/api/health", (req, res) => {
    res.json({
        status: 'OK',
        message: 'Live class server is running',
        timestamp: new Date().toISOString(),
    });
});

app.use('/api/auth', authRoute);
app.use('/api/session', sessionRoute);

app.use('/api', (req, res) => {
    res.status(404).json({ success: false, error: 'Route not found' });
});

app.use(errorHandler);

const start = async () => {
    await connectDb();
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
};

start();
