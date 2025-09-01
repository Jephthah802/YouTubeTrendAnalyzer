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
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

connect();

// Mount API routes
app.use('/api', apiRoutes);
app.use('/api', authRoutes);
app.use('/api', favoritesRoutes);
app.use('/api', playlistRoutes);

// Basic health check
app.get('/', (req, res) => res.json({ message: 'YouTube Trend Analyzer API' }));

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});