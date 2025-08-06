const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// REGISTER
const register = async (req, res) => {
    try {
        let { name, username, email, password } = req.body;

        
        name = name?.trim();
        username = username?.trim().toLowerCase();
        email = email?.trim().toLowerCase();
        password = password?.trim();

        // Validate input
        if (!name || !username || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({ name, username, email, password: hashedPassword });
        await newUser.save();

        const { password: _, ...userData } = newUser._doc;
        res.status(201).json({ message: 'User registered successfully', user: userData });
    } catch (error) {
        console.error('Error in register:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// LOGIN
const login = async (req, res) => {
    try {
        let { email, password } = req.body;

        email = email?.trim().toLowerCase();
        password = password?.trim();

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
  { userId: user._id, username: user.username, email: user.email },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

        const { password: _, ...userData } = user._doc;

        res.status(200).json({
            message: 'Login successful',
            token,
            user: userData
        });
    } catch (error) {
        console.error('Error in login:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { register, login };
