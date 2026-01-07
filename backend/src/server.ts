import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes';
import jobRoutes from './routes/jobRoutes';
import aiRoutes from './routes/aiRoutes';

dotenv.config();

export const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: function (origin, callback) {
        const allowedOrigins = [
            process.env.FRONTEND_URL || 'http://localhost:5173',
            'http://localhost:5173',
            'http://localhost:3000',
            `chrome-extension://${process.env.EXTENSION_ID || '<YOUR_EXTENSION_ID>'}`
        ];
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(null, true); // Allow all origins for now to debug
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Length', 'X-Requested-With'],
    maxAge: 86400 // 24 hours
}));
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }
}));
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/ai', aiRoutes);

// Capture connection error
let dbError: string | null = null;

// Health Check
app.get('/health', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1 && process.env.MONGODB_URI) {
            console.log('Health check: DB not connected, attempting to wait...');
            await Promise.race([
                mongoose.connection.asPromise(),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 4000))
            ]);
        }
    } catch (err: any) {
        console.error('Health check connection wait error:', err.message);
        dbError = err.message;
    }

    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    res.status(200).json({
        status: 'ok',
        dbStatus,
        readyState: mongoose.connection.readyState,
        envVarCheck: process.env.MONGODB_URI ? 'Set' : 'Not Set',
        lastError: dbError,
        timestamp: new Date().toISOString(),
        nodeEnv: process.env.NODE_ENV
    });
});

// Database Connection
const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) return;

    if (process.env.MONGODB_URI) {
        try {
            console.log('Connecting to MongoDB...');
            await mongoose.connect(process.env.MONGODB_URI as string, {
                serverSelectionTimeoutMS: 5000,
            });
            console.log('Connected to MongoDB');
            dbError = null;
        } catch (err: any) {
            console.error('MongoDB connection error:', err);
            dbError = err.message;
        }
    } else {
        dbError = 'MONGODB_URI environment variable is not set';
        console.error(dbError);
    }
};

// Initial connection attempt
connectDB();

// Start Server
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

export default app;

