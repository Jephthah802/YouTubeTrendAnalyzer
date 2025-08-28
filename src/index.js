import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/api.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Mount API routes
app.use('/api', apiRoutes);

// Basic health check
app.get('/', (req, res) => res.json({ message: 'YouTube Trend Analyzer API' }));

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});