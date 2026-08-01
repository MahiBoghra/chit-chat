// Path: backend\src\db\schema\message.js
import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { conversations } from "./conversation.js";
import { users } from "./user.js";

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),

  conversationId: integer("conversation_id")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),

  senderId: integer("sender_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  text: text("text").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

