// Path: backend/src/controllers/message.controller.js
import * as messageService from "../services/message.service.js";
import { sendMessageSchema, getMessagesSchema } from "../dto/message.dto.js";
import ApiError from "../utils/ApiError.js";

/**
 * Controller to handle sending a message.
 */
export const sendMessage = async (req, res, next) => {
    try {
        const { value, error } = sendMessageSchema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const errorMessageList = error.details.map((detail) => detail.message);
            throw new ApiError(400, "Validation failed", errorMessageList);
        }

        const message = await messageService.createMessage(value);

        return res.status(201).json({
            success: true,
            message: "Message sent successfully",
            data: message
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Controller to retrieve all messages in a conversation.
 * Supports cursor-based pagination: ?before=<messageId>&limit=30
 */
export const getMessages = async (req, res, next) => {
    try {
        const { value, error } = getMessagesSchema.validate(req.params, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const errorMessageList = error.details.map((detail) => detail.message);
            throw new ApiError(400, "Validation failed", errorMessageList);
        }

        const { conversationId } = value;
        const { limit = 20, before } = req.query;

        const messages = await messageService.getMessages(
            conversationId,
            { limit: Number(limit), before: before ? Number(before) : undefined }
        );

        return res.status(200).json({
            success: true,
            message: "Messages retrieved successfully",
            data: messages.messages,
            meta: {
                hasMore: messages.hasMore,
                nextCursor: messages.nextCursor,
                limit: Number(limit)
            }
        });
    } catch (err) {
        next(err);
    }
};