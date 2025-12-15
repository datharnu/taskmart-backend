import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import passwordRoutes from './routes/password';
import userRoutes from './routes/user';
import listingRoutes from './routes/listing';
import uploadRoutes from './routes/upload';
import { errorHandler } from './middlewares/errorHandler';
import { validateEnv } from './utils/env';

// Validate environment variables
try {
  validateEnv();
} catch (error) {
  console.error('❌ Environment validation failed:');
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Basic API route
app.get('/api', (req, res) => {
  res.json({ message: 'TaskMart API' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/password', passwordRoutes);
app.use('/api/users', userRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/upload', uploadRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

export default app;


