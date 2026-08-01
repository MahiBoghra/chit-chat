// Path: backend\src\dto\message.dto.js
import Joi from 'joi';

export const sendMessageSchema = Joi.object({
    conversationId: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'number.base': 'Conversation ID must be a number',
            'number.integer': 'Conversation ID must be an integer',
            'number.positive': 'Conversation ID must be a positive number',
            'any.required': 'Conversation ID is required'
        }),
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
    text: Joi.string()
        .trim()
        .min(1)
        .required()
        .messages({
            'string.empty': 'Message text cannot be empty',
            'any.required': 'Message text is required'
        })
});

export const getMessagesSchema = Joi.object({
    conversationId: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'number.base': 'Conversation ID must be a number',
            'number.integer': 'Conversation ID must be an integer',
            'number.positive': 'Conversation ID must be a positive number',
            'any.required': 'Conversation ID is required'
        })
});
