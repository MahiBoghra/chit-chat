// Path: backend\src\dto\conversation.dto.js
import Joi from 'joi';

export const createConversationSchema = Joi.object({
    senderId: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'number.base': 'Sender ID must be a number',
            'number.integer': 'Sender ID must be an integer',
            'number.positive': 'Sender ID must be a positive number',
            'any.required': 'Sender ID is required'
        }),
    receiverId: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'number.base': 'Receiver ID must be a number',
            'number.integer': 'Receiver ID must be an integer',
            'number.positive': 'Receiver ID must be a positive number',
            'any.required': 'Receiver ID is required'
        })
});

export const getUserConversationsSchema = Joi.object({
    userId: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'number.base': 'User ID must be a number',
            'number.integer': 'User ID must be an integer',
            'number.positive': 'User ID must be a positive number',
            'any.required': 'User ID is required'
        })
});
