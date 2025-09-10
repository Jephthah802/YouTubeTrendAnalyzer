import express from 'express';
import cors from 'cors';

import connectDB from '../api/src/config/db.js';

import apiRoutes from '../api/src/routes/api.js';

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

connectDB(); 

app.use('/api', apiRoutes);


app.get('/api', (req, res) => {
  res.json({ message: 'YouTube Trend Analyzer API is running' });
});

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});
