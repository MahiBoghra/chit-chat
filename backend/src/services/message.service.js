// Path: backend\src\services\message.service.js
import { db } from "../db/db.js";
import { conversations } from "../db/schema/conversation.js";
import { conversationMembers } from "../db/schema/conversationMember.js";
import { messages } from "../db/schema/message.js";
import { eq, and, asc } from "drizzle-orm";
import ApiError from "../utils/ApiError.js";

/**
 * Creates a message inside a conversation and updates the conversation's updatedAt timestamp.
 * @param {object} messageData 
 * @param {number} messageData.conversationId
 * @param {number} messageData.senderId
 * @param {string} messageData.text
 * @returns {Promise<object>} The inserted message
 */
export const createMessage = async ({ conversationId, senderId, text }) => {
    if (!text || !text.trim()) {
        throw new ApiError(400, "Message text cannot be empty or only spaces.");
    }

    // 1. Check if the conversation exists
    const conversationCheck = await db
        .select({ id: conversations.id })
        .from(conversations)
        .where(eq(conversations.id, conversationId))
        .limit(1);

    if (conversationCheck.length === 0) {
        throw new ApiError(404, "Conversation not found.");
    }

    // 2. Check if the sender is a member of the conversation
    const membershipCheck = await db
        .select()
        .from(conversationMembers)
        .where(
            and(
                eq(conversationMembers.conversationId, conversationId),
                eq(conversationMembers.userId, senderId)
            )
        )
        .limit(1);

    if (membershipCheck.length === 0) {
        throw new ApiError(403, "You are not a member of this conversation.");
    }

    // 3. Insert the message
    const insertedMessages = await db
        .insert(messages)
        .values({
            conversationId,
            senderId,
            text: text.trim()
        })
        .returning();

    if (insertedMessages.length === 0) {
        throw new ApiError(500, "Failed to send message.");
    }

    // 4. Update conversation's updatedAt timestamp
    await db
        .update(conversations)
        .set({ updatedAt: new Date() })
        .where(eq(conversations.id, conversationId));

    return insertedMessages[0];
};

/**
 * Fetches all messages from a conversation sorted by createdAt ASC.
 * @param {number} conversationId 
 * @returns {Promise<Array<object>>} List of messages
 */
export const getMessages = async (conversationId) => {
    // 1. Check if the conversation exists
    const conversationCheck = await db
        .select({ id: conversations.id })
        .from(conversations)
        .where(eq(conversations.id, conversationId))
        .limit(1);

    if (conversationCheck.length === 0) {
        throw new ApiError(404, "Conversation not found.");
    }

    // 2. Fetch all messages sorted by createdAt ASC
    const result = await db
        .select()
        .from(messages)
        .where(eq(messages.conversationId, conversationId))
        .orderBy(asc(messages.createdAt));

    return result;
};
