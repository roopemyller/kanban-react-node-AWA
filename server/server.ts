import mongoose, { Connection } from 'mongoose'
import cors from 'cors'
import router from "./src/index"
import morgan from 'morgan'
import dotenv from "dotenv"
import express, {Express} from "express"
import path from 'path'
import fs from 'fs'

dotenv.config()
const app: Express = express()
const port: number = parseInt(process.env.PORT as string) || 3001

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(morgan("dev"))
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// MongoDB database connection
const mongoDB: string = "mongodb://127.0.0.1:27017/testdb"
mongoose.connect(mongoDB)
mongoose.Promise = Promise
const db: Connection = mongoose.connection
db.on("error", console.error.bind(console, "MongoDB connection error"))


// Create folder for the profile pictures
const folderName = path.join(__dirname, '../uploads')
try {
  if (!fs.existsSync(folderName)) {
    fs.mkdirSync(folderName)
  }
} catch (err) {
  console.error(err)
}

//Define router
app.use("/", router)
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
