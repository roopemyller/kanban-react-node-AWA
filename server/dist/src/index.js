"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const inputValidation_1 = __importDefault(require("./validators/inputValidation"));
const express_validator_1 = require("express-validator");
const validateToken_1 = require("./middleware/validateToken");
const User_1 = require("../models/User");
const Column_1 = require("../models/Column");
const Board_1 = require("../models/Board");
const Ticket_1 = require("../models/Ticket");
const router = (0, express_1.Router)();
// Define routes
router.get('/', (req, res) => {
    res.send('Hello from the server!');
});
// POST: Register a new user
router.post('/api/user/register', inputValidation_1.default.register, async (req, res) => {
    // New user data
    const { name, email, password } = req.body;
    // Validate user input
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        console.log(errors);
        res.status(400).json({ errors: errors.array() });
        return;
    }
    if (!email || !password) {
        res.status(400).json({ message: 'No email or password' });
        return;
    }
    // Check if user already exists
    const userExists = await User_1.User.findOne({ email });
    if (userExists) {
        res.status(403).json({ message: 'Email is already registered' });
        return;
    }
    try {
        // Hash the password and create the user
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const newUser = new User_1.User({
            name,
            email,
            password: hashedPassword,
        });
        await newUser.save();
        res.status(200).json(newUser);
        console.log("User created successfully!");
        return;
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating user', error });
        console.log("Error creatign a user!");
    }
});
// POST: login with a user
router.post('/api/user/login', inputValidation_1.default.login, async (req, res) => {
    // User data
    const { email, password } = req.body;
    // Validate user input
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    if (!email || !password) {
        res.status(400).json({ message: 'No email or password' });
        return;
    }
    try {
        // Check if user exists
        const user = await User_1.User.findOne({ email });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        // Check if password is valid
        const isPasswordValid = await bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }
        // Create a token and send it to the frontend for authentication
        const token = jsonwebtoken_1.default.sign({ _id: user._id, name: user.name }, process.env.SECRET, { expiresIn: '2h' });
        res.status(200).json({ token });
        return;
    }
    catch (error) {
        console.log(error);
    }
});
// POST: Create a board
router.post('/api/boards/add', validateToken_1.authenticateUser, async (req, res) => {
    try {
        // New board data
        const { title } = req.body;
        const userId = req.user._id;
        // Check if user already has a board
        const existingBoard = await Board_1.Board.findOne({ userId });
        if (existingBoard) {
            res.status(400).json({ message: "User already has a board" });
            console.log("User already has a board");
            return;
        }
        // Create a new board and send it to frontend
        const newBoard = new Board_1.Board({ title, userId });
        await newBoard.save();
        res.status(201).json(newBoard);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
// GET: Get users board
router.get('/api/boards/get', validateToken_1.authenticateUser, async (req, res) => {
    try {
        // User data
        const userId = req.user._id;
        // Find the board and populate it with columns and tickets
        const boards = await Board_1.Board.find({ userId }).populate({
            path: 'columns',
            populate: {
                path: 'tickets',
                model: 'Ticket'
            }
        });
        // If no board is found, return a 404
        if (!boards.length) {
            res.status(404).json({ message: 'No board found' });
            console.log("No Board Found");
            return;
        }
        res.json(boards);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
// POST: Create a column
router.post('/api/columns/add', validateToken_1.authenticateUser, async (req, res) => {
    try {
        // New column data
        const { title, boardId, backgroundColor } = req.body;
        const userId = req.user._id;
        // Check if user has a board
        const board = await Board_1.Board.findOne({ _id: boardId, userId });
        if (!board) {
            res.status(403).json({ message: 'No board found' });
            console.log("No board found");
            return;
        }
        // Create a new column and add it to the board
        const column = new Column_1.Column({ title, boardId, backgroundColor });
        await column.save();
        board.columns.push(column._id);
        await board.save();
        res.status(201).json(column);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
// DELETE: Delete column by id
router.delete('/api/columns/:id', validateToken_1.authenticateUser, async (req, res) => {
    try {
        // Column data
        const columnId = req.params.id;
        // Find the column and delete it
        const column = await Column_1.Column.findById(columnId);
        if (!column) {
            res.status(404).json({ message: "Column not found" });
            return;
        }
        // Delete all tickets in the column
        await Ticket_1.Ticket.deleteMany({ columnId: columnId });
        // Delete the column
        await Column_1.Column.findByIdAndDelete(columnId);
        // Update the board
        await Board_1.Board.updateOne({ _id: column.boardId }, { $pull: { columns: column._id } });
        res.status(200).json({ message: 'Column deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting column:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
// PUT: Edit column by id
router.put('/api/columns/:id', validateToken_1.authenticateUser, async (req, res) => {
    try {
        // Column data
        const { title, backgroundColor } = req.body;
        const columnId = req.params.id;
        // Find the column and update
        const updatedColumn = await Column_1.Column.findByIdAndUpdate(columnId, {
            title, backgroundColor
        }, { new: true });
        if (updatedColumn) {
            res.status(200).json(updatedColumn);
        }
        else {
            res.status(404).json({ message: 'Column not found' });
        }
    }
    catch (error) {
        console.error('Error updating column:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
// POST: Reorder columns
router.post('/api/columns/reorder', validateToken_1.authenticateUser, async (req, res) => {
    try {
        // Column data
        const { boardId, columnOrder } = req.body;
        // Find the board and update the column order
        const board = await Board_1.Board.findOne({ _id: boardId, userId: req.user._id });
        if (!board) {
            res.status(403).json({ message: 'Not authorized to modify this board' });
            return;
        }
        board.columns = columnOrder;
        await board.save();
        res.status(200).json({ message: 'Columns reordered successfully' });
    }
    catch (error) {
        console.error('Error reordering columns:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
// POST: Add new ticket to a column
router.post('/api/tickets/add', validateToken_1.authenticateUser, async (req, res) => {
    try {
        // Ticket data
        const { title, description, columnId, backgroundColor } = req.body;
        // Check if title and columnId are provided
        if (!title || !columnId) {
            res.status(400).json({ error: "Title and columnId are required" });
            return;
        }
        // Create a new ticket and add it to the column
        const newTicket = await Ticket_1.Ticket.create({ title, description, columnId, backgroundColor });
        await Column_1.Column.findByIdAndUpdate(columnId, {
            $push: { tickets: newTicket._id }
        });
        // Return the new ticket and the updated column
        const updatedColumn = await Column_1.Column.findById(columnId).populate('tickets');
        res.status(200).json({ ticket: newTicket, updatedColumn });
    }
    catch (error) {
        console.error('Error adding ticket:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
// DELETE: Delete ticket by id
router.delete('/api/tickets/:id', validateToken_1.authenticateUser, async (req, res) => {
    try {
        // Ticket data
        const ticketId = req.params.id;
        // Find the ticket and delete it
        const ticket = await Ticket_1.Ticket.findByIdAndDelete(ticketId);
        if (!ticket) {
            res.status(404).json({ message: "Ticket not found" });
            return;
        }
        // Update the column
        await Column_1.Column.updateOne({ _id: ticket.columnId }, { $pull: { tickets: ticket._id } });
        res.status(200).json({ message: 'Ticket deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting ticket:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
// PUT: Edit ticket by id
router.put('/api/tickets/:id', validateToken_1.authenticateUser, async (req, res) => {
    try {
        // Ticket data
        const { title, description, backgroundColor } = req.body;
        const ticketId = req.params.id;
        // Find the ticket and update
        const updatedTicket = await Ticket_1.Ticket.findByIdAndUpdate(ticketId, {
            title,
            description,
            backgroundColor,
            modifiedAt: new Date()
        }, { new: true });
        if (updatedTicket) {
            res.status(200).json(updatedTicket);
        }
        else {
            res.status(404).json({ message: 'Ticket not found' });
        }
    }
    catch (error) {
        console.error('Error updating ticket:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
// POST: Reorder tickets
router.post('/api/tickets/reorder', validateToken_1.authenticateUser, async (req, res) => {
    try {
        // Ticket data
        const { sourceColumnId, destinationColumnId, ticketId, newOrder } = req.body;
        // Find the ticket
        const ticket = await Ticket_1.Ticket.findById(ticketId);
        if (!ticket) {
            res.status(404).json({ message: 'Ticket not found' });
            return;
        }
        // Reorder the ticket
        if (sourceColumnId === destinationColumnId) {
            // Moving ticket within the same column
            // Find the column
            const column = await Column_1.Column.findById(sourceColumnId);
            if (!column) {
                res.status(404).json({ message: 'Column not found' });
                return;
            }
            // Update the ticket order in the column
            column.tickets = newOrder;
            await column.save();
        }
        else {
            // Moving ticket between columns
            // Remove from source column
            await Column_1.Column.findByIdAndUpdate(sourceColumnId, {
                $pull: { tickets: ticketId }
            });
            // Add to destination column in the correct position
            await Column_1.Column.findByIdAndUpdate(destinationColumnId, {
                $set: { tickets: newOrder }
            });
            // Update the ticket's columnId and save the ticket
            ticket.columnId = destinationColumnId;
            await ticket.save();
        }
        res.status(200).json({ message: 'Ticket reordered successfully' });
    }
    catch (error) {
        console.error('Error reordering ticket:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.default = router;
