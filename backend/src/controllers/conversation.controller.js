// Path: backend\src\controllers\conversation.controller.js
import * as conversationService from "../services/conversationService.js";
import { createConversationSchema, getUserConversationsSchema } from "../dto/conversation.dto.js";
import ApiError from "../utils/ApiError.js";

/**
 * Controller to handle conversation creation.
 */
export const createConversation = async (req, res, next) => {
    try {
        const { value, error } = createConversationSchema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const errorMessageList = error.details.map((detail) => detail.message);
            throw new ApiError(400, "Validation failed", errorMessageList);
        }

        const { senderId, receiverId } = value;
        const conversation = await conversationService.createConversation(senderId, receiverId);

        return res.status(201).json({
            success: true,
            message: "Conversation created successfully",
            conversation
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Controller to fetch all conversations for a user.
 */
export const getUserConversations = async (req, res, next) => {
    try {
        const { value, error } = getUserConversationsSchema.validate(req.params, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const errorMessageList = error.details.map((detail) => detail.message);
            throw new ApiError(400, "Validation failed", errorMessageList);
        }

        const { userId } = value;
        const conversations = await conversationService.getUserConversations(userId);

        return res.status(200).json({
            success: true,
            message: "User conversations retrieved successfully",
            conversations
        });
    } catch (err) {
        next(err);
    }
};

