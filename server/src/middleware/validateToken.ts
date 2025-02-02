
import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const authenticateUser = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers['authorization']?.split(' ')[1]

    if (!token) {
        res.status(401).json({ message: 'Token not found' })
        return
    }
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
const authenticateAdmin = (req: Request, res: Response, next: NextFunction) => {
    
    const token = req.headers['authorization']?.split(' ')[1]

    if (!token) {
        res.status(401).json({ message: 'Token not found' })
        return
    }

    jwt.verify(token, process.env.SECRET as string, (err, decoded) => {
        if (err) {
            res.status(401).json({ message: 'Unauthorized: Invalid token' })
            return
        }
        req.user = decoded
        console.log(req.user)
        if (!req.user.isadmin){
            res.status(403).json({ message: 'Access denied.' })
            return
        }

        next()
    })
}
*/
export { authenticateUser }