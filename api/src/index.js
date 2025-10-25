import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import apiRoutes from './routes/api.js';
import authRoutes from './routes/auth.routes.js';
import favoritesRoutes from './routes/favorites.routes.js';
import playlistRoutes from './routes/playlist.routes.js';

const app = express();

// CORS
app.use(
  cors({
    origin: [
      'https://you-tube-trend-analyzer-7f1oivqpz-jephewoh-gmailcoms-projects.vercel.app',
      'https://youtubetrendanalyzer.onrender.com',
      'http://localhost:5000', 
      'http://127.0.0.1:5501' 
    ],
    credentials: true,
  })
);


app.use(express.json());

// Connect DB once at startup
connectDB();

// Routes
app.use('/api', apiRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/playlists', playlistRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'YouTube Trend Analyzer API is running' });
});

// Listen on Render’s port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));
