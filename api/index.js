import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import serverless from 'serverless-http';
import connectDB from './src/config/db.js';

// Import routes
import apiRoutes from './src/routes/api.js';
import authRoutes from './src/routes/auth.routes.js';
import favoritesRoutes from './src/routes/favorites.routes.js';
import playlistRoutes from './src/routes/playlist.routes.js';

dotenv.config();

const app = express();

// CORS setup
app.use(
  cors({
    origin: [
      'https://you-tube-trend-analyzer.vercel.app',
      'http://localhost:5000',
    ],
    credentials: true,
  })
);

app.use(express.json());

// Connect to MongoDB
connectDB();

// Mount routes (all will be available under `/api/...`)
app.use('/', apiRoutes);
app.use('/auth', authRoutes);
app.use('/favorites', favoritesRoutes);
app.use('/playlists', playlistRoutes); 

// Root check endpoint
app.get('/', (req, res) => {
  res.json({ message: 'YouTube Trend Analyzer API is running ' });
});

// Export for Vercel serverless
export default serverless(app);
