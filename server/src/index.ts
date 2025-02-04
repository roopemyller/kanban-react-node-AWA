import {Request, Response, Router} from "express"
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken"

import inputValidation from './validators/inputValidation'
import { validationResult } from 'express-validator'
import { authenticateUser } from './middleware/validateToken'

import { User } from '../models/User'
import { Column } from '../models/Column';
import { Board } from '../models/Board';
import { Types } from "mongoose";


const router: Router = Router()

// Define routes
router.get('/', (req, res) => {
    res.send('Hello from the server!')
})
  
// POST: Register a new user
router.post('/api/user/register', inputValidation.register, async(req: Request, res: Response) => {

    const { name, email, password } = req.body

    const errors = validationResult(req)
    if(!errors.isEmpty()){
        console.log(errors)
        res.status(400).json({errors: errors.array()})
        return
    }

    if (!email || !password){
        res.status(400).json({message: 'No email or password'})
        return
    }

    const userExists = await User.findOne({email})
    if(userExists){
        res.status(403).json({message: 'Email is already registered'})
        return
    }
    try {
        const hashedPassword = await bcrypt.hash(password, 10)

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
        })
        await newUser.save()
        res.status(200).json(newUser)
        console.log("User created successfully!")
        return
    } catch (error) {
        res.status(500).json({ message: 'Error creating user', error });
        console.log("Error creatign a user!")
    }
})

// POST: login with a user
router.post('/api/user/login', inputValidation.login, async (req: Request, res: Response) => {
    const {email, password} = req.body

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return
    }

    if (!email || !password){
        res.status(400).json({message: 'No email or password'})
        return
    }

    try {
        const user = await User.findOne({email})
        if(!user){
            res.status(404).json({message: 'User not found'})
            return
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)
        if(!isPasswordValid){
            res.status(401).json({message: 'Invalid credentials'})
            return
        }
        const token = jwt.sign({ _id: user._id, name: user.name}, process.env.SECRET!, { expiresIn: '1h' })

        res.status(200).json({token})
        return
    } catch (error) {
        console.log(error)
    }
})

// POST: Create a board
router.post('/api/boards/add', authenticateUser, async(req: Request, res:Response) => {
    try {
        const { title } = req.body
        const userId = req.user._id

        const existingBoard = await Board.findOne({ userId })
        if(existingBoard){
            res.status(400).json({message: "User already has a board"})
            console.log("User already has a board")
            return
        }
        const newBoard = new Board({ title, userId })
        await newBoard.save()

        res.status(201).json(newBoard)
    }catch(error){
        res.status(500).json({error: 'Server error'})
    }
})

// GET: Get users board
router.get('/api/boards/get', authenticateUser, async (req:Request, res:Response) => {
    try {
        const userId = req.user._id

        console.log('User ID from token:', userId)

        const boards = await Board.find({ userId }).populate('columns')

        if (!boards.length) {
            res.status(404).json({ message: 'No board found' })
            console.log("No Board Found")
            return
        }

        res.json(boards)
    } catch (error) {
        res.status(500).json({ error: 'Server error' })
    }
})

// POST: Create a column
router.post('/api/columns/add', authenticateUser, async(req:Request, res:Response) => {
    try {
        const { title, boardId } = req.body
        const userId = req.user._id

        const board = await Board.findOne({ _id: boardId, userId })
        if (!board) {
            res.status(403).json({ message: 'Not authorized' })
            console.log("Not authorized")
            return
        }

        const column = new Column({ title, boardId })
        await column.save()

        board.columns.push(column._id as Types.ObjectId)
        await board.save()

        res.status(201).json(column)
    } catch (error) {
        res.status(500).json({ error: 'Server error' })
    }
})

export default router