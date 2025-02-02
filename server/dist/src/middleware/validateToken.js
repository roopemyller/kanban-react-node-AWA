"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authenticateUser = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        res.status(401).json({ message: 'Token not found' });
        return;
    }
    jsonwebtoken_1.default.verify(token, process.env.SECRET, (err, decoded) => {
        if (err) {
            res.status(401).json({ message: 'Unauthorized: Invalid token' });
            return;
        }
        req.user = decoded;
        next();
    });
};
exports.authenticateUser = authenticateUser;
