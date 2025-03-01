import {Request, Response, Router} from "express"
import bcrypt from 'bcrypt'
import jwt from "jsonwebtoken"
import multer from 'multer'
import path from 'path'

import inputValidation from './validators/inputValidation'
import { validationResult } from 'express-validator'
import { authenticateUser } from './middleware/validateToken'

import { User } from '../models/User'
import { Column } from '../models/Column'
import { Board } from '../models/Board'
import { Types } from "mongoose"
import { Ticket } from "../models/Ticket"

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname))
    }
})

// Upload function for multer, max filesize 5Mb
const upload = multer({ 
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif/
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
        const mimetype = allowedTypes.test(file.mimetype)
        if (extname && mimetype) {
            return cb(null, true)
        }
        cb(new Error('Only image files are allowed!'))
    }
})

const router: Router = Router()

// Define routes
router.get('/', (req, res) => {
    res.send('Hello from the server!')
})
  
// POST: Register a new user
router.post('/api/user/register', inputValidation.register, async(req: Request, res: Response) => {

    // New user data
    const { name, email, password } = req.body

    // Validate user input
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

    // Check if user already exists
    const userExists = await User.findOne({email})
    if(userExists){
        res.status(403).json({message: 'Email is already registered'})
        return
    }
    try {
        // Hash the password and create the user
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
    // User data
    const {email, password} = req.body
    // Validate user input
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
        // Check if user exists
        const user = await User.findOne({email})
        if(!user){
            res.status(404).json({message: 'User not found'})
            return
        }
        // Check if password is valid
        const isPasswordValid = await bcrypt.compare(password, user.password)
        if(!isPasswordValid){
            res.status(401).json({message: 'Invalid credentials'})
            return
        }
        // Create a token and send it to the frontend for authentication
        const token = jwt.sign({ _id: user._id, name: user.name}, process.env.SECRET!, { expiresIn: '2h' })
        const profilePicture = user.profilePicture
        res.status(200).json({token, profilePicture})
        return
    } catch (error) {
        console.log(error)
    }
})

// GET: Get user data
router.get('/api/users/profile', authenticateUser, async(req: Request, res: Response) => {
    try {
        // Get user data (-password) with id.
        const user = await User.findById(req.user._id).select('-password')
        if(user){
            res.status(200).json(user)
        }else{
            res.status(404).json({message: 'User not found'})
        }
    } catch (error) {
        res.status(500).json({error: 'Server error'})
    }
})

// PUT: Edit user
router.put('/api/users/edit', authenticateUser, upload.single('profilePicture'), async(req: Request, res: Response) => {
    try {
        // Get updated data
        const updates: any = {}
        if (req.body.name) updates.name = req.body.name
        if (req.file) updates.profilePicture = `/uploads/${req.file.filename}`

        // Get user that we are going to update and update it
        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            updates,
            { new: true }
        ).select('-password')
        if (!updatedUser) {
            res.status(404).json({ message: 'User not found' })
            return 
        }
        res.status(200).json(updatedUser)
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Server error' })
    }
})

// POST: Create a board
router.post('/api/boards/add', authenticateUser, async(req: Request, res:Response) => {
    try {
        // New board data
        const { title } = req.body
        const userId = req.user._id

        // Check if user already has a board
        const existingBoard = await Board.findOne({ userId })
        if(existingBoard){
            res.status(400).json({message: "User already has a board"})
            console.log("User already has a board")
            return
        }
        // Create a new board and send it to frontend
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
        // User data
        const userId = req.user._id
        // Find the board and populate it with columns and tickets
        const boards = await Board.find({ userId }).populate({
            path: 'columns',
            populate: {
                path: 'tickets',
                model: 'Ticket'
            }
        })
        // If no board is found, return a 404
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

// PUT: Edit board by id
router.put('/api/boards/:id', authenticateUser, async(req:Request, res:Response) => {
    try {
        // Board data
        const { title } = req.body
        const boardId = req.params.id

        // Find the column and update
        const updatedBoard = await Board.findByIdAndUpdate(boardId, {
            title
        }, { new: true })
        if (updatedBoard) {
            res.status(200).json(updatedBoard)
        } else {
            res.status(404).json({ message: 'Board not found' })
        }
    } catch (error) {
        console.error('Error updating board:', error)  
        res.status(500).json({ message: 'Server error' })
    }
})

// POST: Create a column
router.post('/api/columns/add', authenticateUser, async(req:Request, res:Response) => {
    try {
        // New column data
        const { title, boardId, backgroundColor } = req.body
        const userId = req.user._id

        // Check if user has a board
        const board = await Board.findOne({ _id: boardId, userId })
        if (!board) {
            res.status(403).json({ message: 'No board found' })
            console.log("No board found")
            return
        }

        // Create a new column and add it to the board
        const column = new Column({ title, boardId, backgroundColor })
        await column.save()
        board.columns.push(column._id as Types.ObjectId)
        await board.save()
        res.status(201).json(column)
    } catch (error) {
        res.status(500).json({ error: 'Server error' })
    }
})

// DELETE: Delete column by id
router.delete('/api/columns/:id', authenticateUser, async(req:Request, res:Response) => {
    try {
        // Column data
        const columnId = req.params.id
        // Find the column and delete it
        const column = await Column.findById(columnId)
        if(!column){
            res.status(404).json({message: "Column not found"})
            return
        }
        // Delete all tickets in the column
        await Ticket.deleteMany({ columnId: columnId })
        // Delete the column
        await Column.findByIdAndDelete(columnId)
        // Update the board
        await Board.updateOne(
            { _id: column.boardId },
            { $pull: { columns: column._id } }
        )
        res.status(200).json({ message: 'Column deleted successfully' })
    } catch (error) {
        console.error('Error deleting column:', error)
        res.status(500).json({ message: 'Server error' })
    }
})

// PUT: Edit column by id
router.put('/api/columns/:id', authenticateUser, async(req:Request, res:Response) => {
    try {
        // Column data
        const { title, backgroundColor } = req.body
        const columnId = req.params.id
        // Find the column and update
        const updatedColumn = await Column.findByIdAndUpdate(columnId, {
            title, backgroundColor
        }, { new: true })
        if (updatedColumn) {
            res.status(200).json(updatedColumn)
        } else {
            res.status(404).json({ message: 'Column not found' })
        }
    } catch (error) {
        console.error('Error updating column:', error)  
        res.status(500).json({ message: 'Server error' })
    }
})

// POST: Reorder columns
router.post('/api/columns/reorder', authenticateUser, async(req:Request, res:Response) => {
    try {
        // Column data
        const {boardId, columnOrder} = req.body
        
        // Find the board and update the column order
        const board = await Board.findOne({_id: boardId, userId: req.user._id})
        if(!board){
            res.status(403).json({ message: 'Not authorized to modify this board' })
            return
        }
        board.columns = columnOrder
        await board.save()

        res.status(200).json({ message: 'Columns reordered successfully' })
    } catch (error) {
        console.error('Error reordering columns:', error)
        res.status(500).json({ message: 'Server error' })
    }
})

// POST: Add new ticket to a column
router.post('/api/tickets/add', authenticateUser, async(req:Request, res:Response) => {
    try {
        // Ticket data
        const { title, description, columnId, backgroundColor } = req.body
        
        // Check if title and columnId are provided
        if (!title || !columnId) {
            res.status(400).json({ error: "Title and columnId are required" })
            return
        }
        // Create a new ticket and add it to the column
        const newTicket = await Ticket.create({title, description, columnId, backgroundColor})
        await Column.findByIdAndUpdate(columnId, {
            $push: {tickets: newTicket._id}
        })
        // Return the new ticket and the updated column
        const updatedColumn = await Column.findById(columnId).populate('tickets')
        res.status(200).json({ ticket: newTicket, updatedColumn })
    } catch (error) {
        console.error('Error adding ticket:', error)
        res.status(500).json({ message: 'Server error' })
    }
})

// DELETE: Delete ticket by id
router.delete('/api/tickets/:id', authenticateUser, async(req:Request, res:Response) => {
    try {
        // Ticket data
        const ticketId = req.params.id
        // Find the ticket and delete it
        const ticket = await Ticket.findByIdAndDelete(ticketId)
        if(!ticket){
            res.status(404).json({message: "Ticket not found"})
            return
        }
        // Update the column
        await Column.updateOne(
            { _id: ticket.columnId },
            { $pull: { tickets: ticket._id } }
        )
        res.status(200).json({ message: 'Ticket deleted successfully' })
    } catch (error) {
        console.error('Error deleting ticket:', error)
        res.status(500).json({ message: 'Server error' })
    }
})

// PUT: Edit ticket by id
router.put('/api/tickets/:id', authenticateUser, async(req:Request, res:Response) => {
    try {
        // Ticket data
        const { title, description, backgroundColor } = req.body
        const ticketId = req.params.id
        // Find the ticket and update
        const updatedTicket = await Ticket.findByIdAndUpdate(ticketId, {
            title,
            description,
            backgroundColor,
            modifiedAt: new Date()
        }, { new: true })
        if (updatedTicket) {
            res.status(200).json(updatedTicket)
        } else {
            res.status(404).json({ message: 'Ticket not found' })
        }
    } catch (error) {
        console.error('Error updating ticket:', error)  
        res.status(500).json({ message: 'Server error' })
    }
})


// POST: Reorder tickets
router.post('/api/tickets/reorder', authenticateUser, async(req:Request, res:Response) => {
    try {
        // Ticket data
        const { sourceColumnId, destinationColumnId, ticketId, newOrder } = req.body

        // Find the ticket
        const ticket = await Ticket.findById(ticketId)
        if (!ticket) {
            res.status(404).json({ message: 'Ticket not found' })
            return 
        }

        // Reorder the ticket
        if (sourceColumnId === destinationColumnId) {
            // Moving ticket within the same column
            // Find the column
            const column = await Column.findById(sourceColumnId);
            if (!column) {
                res.status(404).json({ message: 'Column not found' })
                return
            }
            // Update the ticket order in the column
            column.tickets = newOrder
            await column.save()
        } else {
            // Moving ticket between columns
            // Remove from source column
            await Column.findByIdAndUpdate(sourceColumnId, {
                $pull: { tickets: ticketId }
            })

            // Add to destination column in the correct position
            await Column.findByIdAndUpdate(destinationColumnId, {
                $set: { tickets: newOrder }
            })

            // Update the ticket's columnId and save the ticket
            ticket.columnId = destinationColumnId
            await ticket.save()
        }

        res.status(200).json({ message: 'Ticket reordered successfully' })
    } catch (error) {
        console.error('Error reordering ticket:', error)
        res.status(500).json({ message: 'Server error' })
    }
})

export default router