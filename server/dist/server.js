"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const User_1 = require("./models/User");
const app = (0, express_1.default)();
const port = 5000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// MongoDB database connection
const mongoDB = "mongodb://127.0.0.1:27017/testdb";
mongoose_1.default.connect(mongoDB);
mongoose_1.default.Promise = Promise;
const db = mongoose_1.default.connection;
db.on("error", console.error.bind(console, "MongoDB connection error"));
// Define routes
app.get('/', (req, res) => {
    res.send('Hello from the server!');
});
// POST: Add a new user
app.post('/api/users', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const user = new User_1.User({ name, email, password });
        await user.save();
        res.status(201).json(user);
        console.log("User created successfully!");
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating user', error });
        console.log("Error creatign a user!");
    }
});
// GET: Fetch all users
app.get('/api/users', async (req, res) => {
    try {
        const users = await User_1.User.find();
        res.status(200).json(users);
        console.log("Users fetched successfully!");
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching users', error });
        console.log("Error while fetching users!");
    }
});
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
