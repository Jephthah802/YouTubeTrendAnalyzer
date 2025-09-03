import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connect from './config/db.js';

import apiRoutes from './routes/api.js';
import authRoutes from './routes/auth.routes.js';
import favoritesRoutes from './routes/favorites.routes.js';
import playlistRoutes from './routes/playlist.routes.js';

dotenv.config();

const app = express();

app.use(cors({
  origin: ['https://trend-tube.vercel.app', 'http://localhost:3000'], // adjust frontend URL
  credentials: true,
}));
app.use(express.json());

connect();

// Mount API routes
app.use('/api', apiRoutes);
app.use('/api', authRoutes);
app.use('/api', favoritesRoutes);
app.use('/api', playlistRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'YouTube Trend Analyzer API' });
});

// ✅ For Vercel, just export app
export default app;
