import express from 'express';
import cors from 'cors';
import serverless from 'serverless-http';
import connectDB from './src/config/db.js';

import apiRoutes from './src/routes/api.js';
import authRoutes from './src/routes/auth.routes.js';
import favoritesRoutes from './src/routes/favorites.routes.js';
import playlistRoutes from './src/routes/playlist.routes.js';

// Removed dotenv.config() (not needed in Vercel)

const app = express();

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

// Connect DB on first request, but always read env from Vercel
let isConnected = false;
app.use(async (req, res, next) => {
  if (!isConnected) {
    try {
      await connectDB();
      isConnected = true;
    } catch (err) {
      console.error('Failed to connect to MongoDB:', err.message);
      return res.status(500).json({ error: 'Database connection failed' });
    }
  }
  next();
});

app.use('/api', apiRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/playlists', playlistRoutes);

app.get('/api', (req, res) => {
  res.json({ message: 'YouTube Trend Analyzer API is running' });
});

export default serverless(app, {
  callbackWaitsForEmptyEventLoop: false,
});
