import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import serverless from 'serverless-http';
import connectDB from './src/config/db.js';

import apiRoutes from './src/routes/api.js';
import authRoutes from './src/routes/auth.routes.js';
import favoritesRoutes from './src/routes/favorites.routes.js';
import playlistRoutes from './src/routes/playlist.routes.js';

dotenv.config();

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

//  Connect only once (not on every request)
let isConnected = false;

app.use(async (req, res, next) => {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
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

// ✅ Ensure function closes after response
const handler = serverless(app, {
  callbackWaitsForEmptyEventLoop: false,
});

export default handler;
