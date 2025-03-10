"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
// Input validation for user registration and login
const inputValidation = {
    register: [
        (0, express_validator_1.body)('name')
            .trim()
            .escape(),
        (0, express_validator_1.body)('email')
            .trim()
            .escape()
            .isEmail()
            .withMessage('Invalid email format'),
        (0, express_validator_1.body)('password')
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
        (0, express_validator_1.body)('email')
            .trim()
            .escape()
            .isEmail()
            .withMessage('Invalid email format'),
        (0, express_validator_1.body)('password')
            .trim()
            .notEmpty()
            .withMessage('Password is required')
    ]
};
exports.default = inputValidation;
