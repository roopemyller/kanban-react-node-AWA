
import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

// Middleware to authenticate user
const authenticateUser = (req: Request, res: Response, next: NextFunction) => {
    // Get token from Authorization header
    const token = req.headers['authorization']?.split(' ')[1]
    if (!token) {
        res.status(401).json({ message: 'Token not found' })
        return
    }
    // Verify the token
    jwt.verify(token, process.env.SECRET as string, (err, decoded) => {
        if (err) {
            res.status(401).json({ message: 'Unauthorized: Invalid token' })
            return
        }
        req.user = decoded
        next()
    })
}
/*
// Middleware to authenticate admin
const authenticateAdmin = (req: Request, res: Response, next: NextFunction) => {
    // Get token from Authorization header
    const token = req.headers['authorization']?.split(' ')[1]
    if (!token) {
        res.status(401).json({ message: 'Token not found' })
        return
    }
    // Verify the token
    jwt.verify(token, process.env.SECRET as string, (err, decoded) => {
        if (err) {
            res.status(401).json({ message: 'Unauthorized: Invalid token' })
            return
        }
        req.user = decoded
        console.log(req.user)
        // Check if user is admin
        if (!req.user.isadmin){
            res.status(403).json({ message: 'Access denied.' })
            return
        }
        next()
    })
}
*/
export { authenticateUser }