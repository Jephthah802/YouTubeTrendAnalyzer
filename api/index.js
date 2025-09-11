import express from 'express';
import cors from 'cors';
import serverless from 'serverless-http';
import connectDB from './src/config/db.js';

import apiRoutes from './src/routes/api.js';
import authRoutes from './src/routes/auth.routes.js';
import favoritesRoutes from './src/routes/favorites.routes.js';
import playlistRoutes from './src/routes/playlist.routes.js';

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

//  Connect to DB immediately on cold start (not per request)
console.log("[index.js]  Attempting initial DB connection...");
connectDB()
  .then(() => console.log("[index.js]  MongoDB connected successfully"))
  .catch((err) => console.error("[index.js]  MongoDB connection failed:", err.message));

//  Add route logging to confirm they are hit
app.use((req, res, next) => {
  console.log(`[index.js]  Incoming Request: ${req.method} ${req.url}`);
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
