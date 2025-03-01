import { body, validationResult } from 'express-validator'

// Input validation for user registration and login
const inputValidation = {
    register: [
        body('name')
            .trim()
            .escape(),
  
        body('email')
            .trim()
            .escape()
            .isEmail()
            .withMessage('Invalid email format'),
  
        body('password')
            .trim()
            .isStrongPassword({ 
            minLength: 8, 
            minUppercase: 1, 
            minLowercase: 1, 
            minNumbers: 1, 
            minSymbols: 1 
            }) 
            .withMessage('Password length at least 8 characters, including at least 1 uppercase and 1 lowercase letter, 1 number, and 1 special character')
    ],
    
    login: [
        body('email')
            .trim()
            .escape()
            .isEmail()
            .withMessage('Invalid email format'),
  
        body('password')
            .trim()
            .notEmpty()
            .withMessage('Password is required')
    ]
  }
  
  export default inputValidation