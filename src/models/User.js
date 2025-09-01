import mongoose from 'mongoose';

   const userSchema = new mongoose.Schema({
     email: { type: String, required: true, unique: true },
     password: { type: String, required: true },
     favorites: [{ 
       id: String, 
       title: String, 
       channel: String, 
       thumbnail: String, 
       views: String, 
       likes: String, 
       embedUrl: String, 
       duration: String, 
       isShort: Boolean, 
       isLong: Boolean 
     }],
     playlists: [{
       name: String,
       videos: [{ 
         id: String, 
         title: String, 
         channel: String, 
         thumbnail: String, 
         views: String, 
         likes: String, 
         embedUrl: String, 
         duration: String, 
         isShort: Boolean, 
         isLong: Boolean 
       }]
     }]
   });

   export default mongoose.model('User', userSchema);