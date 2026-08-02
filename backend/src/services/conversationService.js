// Path: backend\src\services\conversationService.js
import { db } from "../db/db.js";
import { conversations } from "../db/schema/conversation.js";
import { conversationMembers } from "../db/schema/conversationMember.js";
import { users } from "../db/schema/user.js";
import { eq, inArray, and, ne, desc } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import ApiError from "../utils/ApiError.js";

/**
 * Creates a conversation and adds both the sender and receiver as members.
 * @param {number} senderId 
 * @param {number} receiverId 
 * @returns {Promise<object>} The created conversation
 */
export const createConversation = async (senderId, receiverId) => {
    if (senderId === receiverId) {
        throw new ApiError(400, "Sender and receiver must be different users.");
    }

    // 1. Check both users exist in the database
    const foundUsers = await db
        .select({ id: users.id })
        .from(users)
        .where(inArray(users.id, [senderId, receiverId]));

    if (foundUsers.length !== 2) {
        throw new ApiError(404, "One or both users do not exist.");
    }

    // 2. Check if a conversation between these two users already exists
    const cm1 = conversationMembers;
    const cm2 = alias(conversationMembers, "cm2");

    const existing = await db
        .select({ id: conversations.id, createdAt: conversations.createdAt })
        .from(conversations)
        .innerJoin(cm1, eq(conversations.id, cm1.conversationId))
        .innerJoin(cm2, eq(conversations.id, cm2.conversationId))
        .where(
            and(
                eq(cm1.userId, senderId),
                eq(cm2.userId, receiverId)
            )
        )
        .limit(1);

    if (existing.length > 0) {
        return existing[0];
    }

    // 3. Create the conversation
    const newConversations = await db
        .insert(conversations)
        .values({})
        .returning();

    if (newConversations.length === 0) {
        throw new ApiError(500, "Failed to create conversation.");
    }

    const conversationId = newConversations[0].id;

    // 4. Insert both users as conversation members
    await db.insert(conversationMembers).values([
        { conversationId, userId: senderId },
        { conversationId, userId: receiverId }
    ]);

    return newConversations[0];
};

/**
 * Fetches all conversations a user is member of, including the other participant's username.
 * @param {number} userId 
 * @returns {Promise<Array<object>>} List of conversations with participant usernames
 */
export const getUserConversations = async (userId) => {
    // 1. Check if the user exists
    const userCheck = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

    if (userCheck.length === 0) {
        throw new ApiError(404, "User not found.");
    }

    // 2. Query conversations joined with conversationMembers twice and users table
    const myMemberships = conversationMembers;
    const otherMemberships = alias(conversationMembers, "other_memberships");

    const result = await db
        .select({
            conversationId: myMemberships.conversationId,
            username: users.username,
            updatedAt: conversations.updatedAt
        })
        .from(myMemberships)
        .innerJoin(
            conversations,
            eq(myMemberships.conversationId, conversations.id)
        )
        .innerJoin(
            otherMemberships,
            eq(myMemberships.conversationId, otherMemberships.conversationId)
        )
        .innerJoin(
            users,
            eq(otherMemberships.userId, users.id)
        )
        .where(
            and(
                eq(myMemberships.userId, userId),
                ne(otherMemberships.userId, userId)
            )
        )
        .orderBy(desc(conversations.updatedAt));

    return result;
};


