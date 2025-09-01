import express from 'express';
import { authenticate, getFavorites, addFavorite, removeFavorite } 
from "../controllers/Playlist.js";

const router = express.Router();

router.get('/favorites', authenticate, getFavorites);
router.post('/favorites', authenticate, addFavorite);
router.delete('/favorites/:videoId', authenticate, removeFavorite);

export default router;