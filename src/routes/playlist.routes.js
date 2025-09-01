import express from 'express';
import { authenticate, getPlaylists, createPlaylist, addToPlaylist, removeFromPlaylist } from '../controllers/Playlist.js';

const router = express.Router();

router.get('/playlists', authenticate, getPlaylists);
router.post('/playlists', authenticate, createPlaylist);
router.post('/playlists/add', authenticate, addToPlaylist);
router.delete('/playlists/:playlistName/:videoId', authenticate, removeFromPlaylist);

export default router;
