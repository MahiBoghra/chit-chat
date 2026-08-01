// Path: backend\src\dto\auth.dto.js
import Joi from 'joi';

export const signupSchema = Joi.object({
    username: Joi.string()
        .min(2)
        .max(50)
        .trim()
        .required()
        .messages({
            'string.empty': 'Username cannot be empty',
            'string.min': 'Username must be at least 2 characters',
            'any.required': 'Username is required'
        }),
    email: Joi.string()
        .email()
        .lowercase()
        .trim()
        .required()
        .messages({
            'string.email': 'Please provide a valid email address',
            'string.empty': 'Email cannot be empty',
            'any.required': 'Email is required'
        }),
    password: Joi.string()
        .min(6)
        .required()
        .messages({
            'string.min': 'Password must be at least 6 characters long',
            'string.empty': 'Password cannot be empty',
            'any.required': 'Password is required'
        })
});

export const loginSchema = Joi.object({
    email: Joi.string()
        .email()
        .lowercase()
        .trim()
        .required()
        .messages({
            'string.email': 'Please provide a valid email address',
            'string.empty': 'Email cannot be empty',
            'any.required': 'Email is required'
        }),
    password: Joi.string()
        .required()
        .messages({
            'string.empty': 'Password cannot be empty',
            'any.required': 'Password is required'
        })
});
