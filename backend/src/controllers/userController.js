const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/User");

const JWT_SECRET = "your_jwt_secret_key";

// Register
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password)
            return res.status(400).json({ message: "Missing fields" });

        const existingUser = await User.findOne({ email });
        if (existingUser)
            return res.status(409).json({ message: "User exists" });

        const lastUser = await User.findOne().sort({ id: -1 });
        const newId = lastUser ? lastUser.id + 1 : 1;

        // Hash password
        const hashed = await bcrypt.hash(password, 10);
        
        // Create user
        const newUser = new User({
            id: newId,
            name,
            email,
            password: hashed
        });
        await newUser.save();

        const token = jwt.sign(
            { id: newUser.id, email: newUser.email },
            JWT_SECRET,
            { expiresIn: "1h" }
        );
        
        res.status(201).json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// Login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: "Invalid credentials" });

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ message: "Invalid credentials" });

        const token = jwt.sign(
            { id: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: "1h" }
        );
        res.json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// Get logged-in user info
const getMe = async (req, res) => {
    try {
        const user = await User.findOne({ id: req.user.id });
        if (!user) return res.status(404).json({ message: "User not found" });
        
        // Return user data without password
        const { password, ...userData } = user.toObject();
        res.json(userData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    register,
    login,
    getMe
};