import express from 'express';
import { getTrendingVideos, getCategories } from '../controllers/vedios.js';

const router = express.Router();

router.get('/trending', getTrendingVideos);
router.get('/categories', getCategories);

export default router;