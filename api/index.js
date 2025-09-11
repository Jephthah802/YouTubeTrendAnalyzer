import express from 'express';
import cors from 'cors';
import serverless from 'serverless-http';
import connectDB from './src/config/db.js';

import apiRoutes from './src/routes/api.js';
import authRoutes from './src/routes/auth.routes.js';
import favoritesRoutes from './src/routes/favorites.routes.js';
import playlistRoutes from './src/routes/playlist.routes.js';

const app = express();


// Immediately connect to DB at module load
await connectDB();

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
