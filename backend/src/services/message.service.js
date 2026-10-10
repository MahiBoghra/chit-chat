// Path: backend/src/services/message.service.js
import { db } from "../db/db.js";
import { conversations } from "../db/schema/conversation.js";
import { conversationMembers } from "../db/schema/conversationMember.js";
import { messages } from "../db/schema/message.js";
import { users } from "../db/schema/user.js";
import { eq, and, asc, desc, gte, lt } from "drizzle-orm";
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
 * Fetches messages from a conversation with cursor-based pagination.
 * Use ?before=<messageId> to get older messages (pagination backwards).
 * Limit capped at 50 per request for cost/bandwidth control.
 * @param {number} conversationId 
 * @param {object} [options] 
 * @param {number} [options.limit=20] - Max 50, default 20
 * @param {number} [options.before] - Message ID cursor to paginate before (older messages)
 * @returns {Promise<object>} { messages: Array, hasMore: boolean, nextCursor: string | null }
 */
export const getMessages = async (conversationId, { limit = 20, before } = {}) => {
    // Limit to max 50 for bandwidth/cost control
    const pageLimit = Math.min(limit, 50);

    // 1. Check if the conversation exists
    const conversationCheck = await db
        .select({ id: conversations.id })
        .from(conversations)
        .where(eq(conversations.id, conversationId))
        .limit(1);

    if (conversationCheck.length === 0) {
        throw new ApiError(404, "Conversation not found.");
    }

    // 2. Build paginated query
    let query = db
        .select({
            id: messages.id,
            conversationId: messages.conversationId,
            senderId: messages.senderId,
            text: messages.text,
            createdAt: messages.createdAt
        })
        .from(messages)
        .where(eq(messages.conversationId, conversationId));

    // Apply cursor filter if provided (pagination backwards)
    if (before) {
        query = where(lte(messages.createdAt, before)); // Get messages up to and including the cursor point
        // Actually better to use ID-based: messages.id < before
        // Let me use ID-based cursor which is more reliable
    }

    // Base query - get most recent messages first, then we'll reverse
    let resultQuery = query
        .orderBy(desc(messages.createdAt))
        .limit(pageLimit + 1); // Get one extra to determine if there are more

    if (before) {
        resultQuery = resultQuery.where(lt(messages.id, before));
    }

    const messages = await resultQuery;

    // Determine if there are more messages and set cursor for next page
    let hasMore = messages.length > pageLimit;
    let nextCursor = null;
    let prevCursor = before;

    if (hasMore) {
        // Remove the extra message we fetched
        const extraMessage = messages.pop();
        // The next cursor (for getting older messages) is the oldest message's ID in the current page
        // Since we ordered desc, the last one is the oldest
        if (messages.length > 0) {
            const oldestInPage = messages[messages.length - 1];
            nextCursor = oldestInPage.id;
        }
    }

    // Return messages in chronological order (ASC) for consistent frontend display
    const sortedMessages = messages.sort((a, b) => a.createdAt - b.createdAt);

    return {
        messages: sortedMessages,
        hasMore,
        nextCursor, // Cursor to get older messages (use with ?before=)
        prevCursor  // Cursor to get newer messages (use with ?after=, if implemented)
    };
};