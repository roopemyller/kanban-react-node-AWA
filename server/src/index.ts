import {Request, Response, Router} from "express"
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken"

import { User } from '../models/User'

import inputValidation from './validators/inputValidation'
import { validationResult } from 'express-validator'
import { authenticateUser } from './middleware/validateToken'
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



export default router