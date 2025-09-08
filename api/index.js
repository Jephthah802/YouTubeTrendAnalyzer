import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import serverless from 'serverless-http';
import connectDB from './src/config/db.js';


import apiRoutes from './src/routes/api.js'
import authRoutes from './src/routes/auth.routes.js';
import favoritesRoutes from './src/routes/favorites.routes.js';
import playlistRoutes from './src/routes/playlist.routes.js';

dotenv.config();

const app = express();

app.use(cors({
  origin: ['https://trend-tube.vercel.app', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json());

// Connect DB
connectDB();

// Mount routes
app.use('/api', apiRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/playlists', playlistRoutes);


app.get('/', (req, res) => {
  res.json({ message: 'YouTube Trend Analyzer API' });
});

// ✅ Default export for Vercel
export default serverless(app);
