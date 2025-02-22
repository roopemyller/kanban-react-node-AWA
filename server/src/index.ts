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
import { Ticket } from "../models/Ticket";


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
        const boards = await Board.find({ userId }).populate({
            path: 'columns',
            populate: {
                path: 'tickets',
                model: 'Ticket'
            }
        })

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

// DELETE: Delete column by id
router.delete('/api/columns/:id', authenticateUser, async(req:Request, res:Response) => {
    try {
        const columnId = req.params.id

        const column = await Column.findByIdAndDelete(columnId)
        if(!column){
            res.status(404).json({message: "Column not found"})
            return
        }
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

// POST: Reorder columns
router.post('/api/columns/reorder', authenticateUser, async(req:Request, res:Response) => {
    try {
        const {boardId, columnOrder} = req.body
        const board = await Board.findOne({_id: boardId, userId: req.user._id})
        if(!board){
            res.status(403).json({ message: 'Not authorized to modify this board' })
            return
        }
        board.columns = columnOrder
        await board.save();

        res.status(200).json({ message: 'Columns reordered successfully' });
    } catch (error) {
        console.error('Error reordering columns:', error);
        res.status(500).json({ message: 'Server error' });
    }
})

// POST: Add new ticket to a column
router.post('/api/tickets/add', authenticateUser, async(req:Request, res:Response) => {
    try {
        const { title, description, columnId, backgroundColor } = req.body

        if (!title || !columnId) {
            res.status(400).json({ error: "Title and columnId are required" })
            return
        }
        const newTicket = await Ticket.create({title, description, columnId, backgroundColor})
        await Column.findByIdAndUpdate(columnId, {
            $push: {tickets: newTicket._id}
        })

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
        const ticketId = req.params.id

        const ticket = await Ticket.findByIdAndDelete(ticketId)
        if(!ticket){
            res.status(404).json({message: "Ticket not found"})
            return
        }
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

// POST: Reorder tickets
router.post('/api/tickets/reorder', authenticateUser, async(req:Request, res:Response) => {
    try {
        const { sourceColumnId, destinationColumnId, ticketId, newOrder } = req.body

        // First, verify the ticket exists
        const ticket = await Ticket.findById(ticketId)
        if (!ticket) {
            res.status(404).json({ message: 'Ticket not found' })
            return 
        }

        if (sourceColumnId === destinationColumnId) {
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

            // Update the ticket's columnId
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