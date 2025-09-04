import bcrypt from 'bcrypt';
   import jwt from 'jsonwebtoken';
   import User from '../models/User.js';

   export async function register(req, res) {
     const { email, password } = req.body;
     try {
       const existingUser = await User.findOne({ email });
       if (existingUser) return res.status(400).json({ error: 'Email already exists' });
       const hashedPassword = await bcrypt.hash(password, 10);
       const user = new User({ email, password: hashedPassword, favorites: [], playlists: [] });
       await user.save();
       res.status(201).json({ message: 'User registered' });
     } catch (error) {
       res.status(500).json({ error: error.message });
     }
   }

   export async function login(req, res) {
     const { email, password } = req.body;
     try {
       const user = await User.findOne({ email });
       if (!user) return res.status(400).json({ error: 'Invalid credentials' });
       const isMatch = await bcrypt.compare(password, user.password);
       if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });
       const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
       res.json({ token });
     } catch (error) {
       res.status(500).json({ error: error.message });
     }
   }

  //  export async function logout(req, res) {

  //  }