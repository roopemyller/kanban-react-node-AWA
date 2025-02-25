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
    const { name, email, password } = req.body;
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
    const userExists = await User_1.User.findOne({ email });
    if (userExists) {
        res.status(403).json({ message: 'Email is already registered' });
        return;
    }
    try {
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
    const { email, password } = req.body;
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
        const user = await User_1.User.findOne({ email });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        const isPasswordValid = await bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ _id: user._id, name: user.name }, process.env.SECRET, { expiresIn: '1h' });
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
        const { title } = req.body;
        const userId = req.user._id;
        const existingBoard = await Board_1.Board.findOne({ userId });
        if (existingBoard) {
            res.status(400).json({ message: "User already has a board" });
            console.log("User already has a board");
            return;
        }
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
        const userId = req.user._id;
        const boards = await Board_1.Board.find({ userId }).populate({
            path: 'columns',
            populate: {
                path: 'tickets',
                model: 'Ticket'
            }
        });
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
        const { title, boardId } = req.body;
        const userId = req.user._id;
        const board = await Board_1.Board.findOne({ _id: boardId, userId });
        if (!board) {
            res.status(403).json({ message: 'Not authorized' });
            console.log("Not authorized");
            return;
        }
        const column = new Column_1.Column({ title, boardId });
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
        const columnId = req.params.id;
        const column = await Column_1.Column.findById(columnId);
        if (!column) {
            res.status(404).json({ message: "Column not found" });
            return;
        }
        await Ticket_1.Ticket.deleteMany({ columnId: columnId });
        await Column_1.Column.findByIdAndDelete(columnId);
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
        const { title } = req.body;
        const columnId = req.params.id;
        const updatedColumn = await Column_1.Column.findByIdAndUpdate(columnId, {
            title
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
        const { boardId, columnOrder } = req.body;
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
        const { title, description, columnId, backgroundColor } = req.body;
        if (!title || !columnId) {
            res.status(400).json({ error: "Title and columnId are required" });
            return;
        }
        const newTicket = await Ticket_1.Ticket.create({ title, description, columnId, backgroundColor });
        await Column_1.Column.findByIdAndUpdate(columnId, {
            $push: { tickets: newTicket._id }
        });
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
        const ticketId = req.params.id;
        const ticket = await Ticket_1.Ticket.findByIdAndDelete(ticketId);
        if (!ticket) {
            res.status(404).json({ message: "Ticket not found" });
            return;
        }
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
        const { title, description, backgroundColor } = req.body;
        const ticketId = req.params.id;
        const updatedTicket = await Ticket_1.Ticket.findByIdAndUpdate(ticketId, {
            title,
            description,
            backgroundColor
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
        const { sourceColumnId, destinationColumnId, ticketId, newOrder } = req.body;
        // First, verify the ticket exists
        const ticket = await Ticket_1.Ticket.findById(ticketId);
        if (!ticket) {
            res.status(404).json({ message: 'Ticket not found' });
            return;
        }
        if (sourceColumnId === destinationColumnId) {
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
            // Update the ticket's columnId
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
