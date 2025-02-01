import express from 'express'
import mongoose, { Connection } from 'mongoose'
import cors from 'cors'

import { User } from './models/User'

const app = express()
const port = 5000

// Middleware
app.use(cors())
app.use(express.json())

// MongoDB database connection
const mongoDB: string = "mongodb://127.0.0.1:27017/testdb"
mongoose.connect(mongoDB)
mongoose.Promise = Promise
const db: Connection = mongoose.connection
db.on("error", console.error.bind(console, "MongoDB connection error"))


// Define routes
app.get('/', (req, res) => {
  res.send('Hello from the server!')
})

// POST: Add a new user
app.post('/api/users', async(req, res) => {
    try {
        const { name, email, password } = req.body
        const user = new User({ name, email, password })
        await user.save();
        res.status(201).json(user);
        console.log("User created successfully!")
    } catch (error) {
        res.status(500).json({ message: 'Error creating user', error });
        console.log("Error creatign a user!")
    }
})

// GET: Fetch all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find()
    res.status(200).json(users)
    console.log("Users fetched successfully!")
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error })
    console.log("Error while fetching users!")
  }
})

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
