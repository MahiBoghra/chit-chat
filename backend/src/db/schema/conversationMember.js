// Path: backend\src\db\schema\conversationMember.js
import { pgTable, integer, primaryKey, timestamp } from "drizzle-orm/pg-core";
import { conversations } from "./conversation.js";
import { users } from "./user.js";

export const conversationMembers = pgTable(
  "conversation_members",
  {
    conversationId: integer("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),

    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    joinedAt: timestamp("joined_at").defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.conversationId, table.userId] }),
  ]
);

