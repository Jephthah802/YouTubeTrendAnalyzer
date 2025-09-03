import User from '../models/User.js';
   import jwt from 'jsonwebtoken';

   const authenticate = (req, res, next) => {
     const token = req.headers.authorization?.split(' ')[1];
     if (!token) return res.status(401).json({ error: 'Unauthorized' });
     try {
       const decoded = jwt.verify(token, process.env.JWT_SECRET);
       req.userId = decoded.userId;
       next();
     } catch (error) {
       res.status(401).json({ error: 'Invalid token' });
     }
   };

   export async function getFavorites(req, res) {
     try {
       const user = await User.findById(req.userId);
       res.json(user.favorites);
     } catch (error) {
       res.status(500).json({ error: error.message });
     }
   }

   export async function addFavorite(req, res) {
     try {
       const user = await User.findById(req.userId);
       const video = req.body;
       if (!user.favorites.some(v => v.id === video.id)) {
         user.favorites.push(video);
         await user.save();
       }
       res.json(user.favorites);
     } catch (error) {
       res.status(500).json({ error: error.message });
     }
   }

   export async function removeFavorite(req, res) {
     try {
       const user = await User.findById(req.userId);
       user.favorites = user.favorites.filter(v => v.id !== req.params.videoId);
       await user.save();
       res.json(user.favorites);
     } catch (error) {
       res.status(500).json({ error: error.message });
     }
   }

   export async function getPlaylists(req, res) {
     try {
       const user = await User.findById(req.userId);
       res.json(user.playlists);
     } catch (error) {
       res.status(500).json({ error: error.message });
     }
   }

   export async function createPlaylist(req, res) {
     try {
       const user = await User.findById(req.userId);
       const { name } = req.body;
       user.playlists.push({ name, videos: [] });
       await user.save();
       res.json(user.playlists);
     } catch (error) {
       res.status(500).json({ error: error.message });
     }
   }

   export async function addToPlaylist(req, res) {
     try {
       const user = await User.findById(req.userId);
       const { playlistName, video } = req.body;
       const playlist = user.playlists.find(p => p.name === playlistName);
       if (!playlist) return res.status(400).json({ error: 'Playlist not found' });
       if (!playlist.videos.some(v => v.id === video.id)) {
         playlist.videos.push(video);
         await user.save();
       }
       res.json(user.playlists);
     } catch (error) {
       res.status(500).json({ error: error.message });
     }
   }

   export async function changePlaylistName(req, res) {
     try {
       const user = await User.findById(req.userId);
       const { oldName, newName } = req.body;
       const playlist = user.playlists.find(p => p.name === oldName);
       if (!playlist) return res.status(400).json({ error: 'Playlist not found' });
       playlist.name = newName;
       await user.save();
       res.json(user.playlists);
     } catch (error) {
       res.status(500).json({ error: error.message });
     }
   }

   export async function removeFromPlaylist(req, res) {
     try {
       const user = await User.findById(req.userId);
       const { playlistName, videoId } = req.params;
       const playlist = user.playlists.find(p => p.name === playlistName);
       if (!playlist) return res.status(400).json({ error: 'Playlist not found' });
       playlist.videos = playlist.videos.filter(v => v.id !== videoId);
       await user.save();
       res.json(user.playlists);
     } catch (error) {
       res.status(500).json({ error: error.message });
     }
   }

   export { authenticate };