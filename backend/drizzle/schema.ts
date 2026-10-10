// Path: backend\drizzle\schema.ts
// Path: backend\drizzle\schema.ts
import { pgTable, serial, integer, text, timestamp, foreignKey, primaryKey, unique } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const conversationMembers = pgTable("conversation_members", {
	conversationId: integer("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" } ),
	userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" } ),
	joinedAt: timestamp("joined_at").default(sql`now()`).notNull(),
}, (table) => [
	primaryKey({ columns: [table.conversationId, table.userId], name: "conversation_members_pkey"}),
]);

export const conversations = pgTable("conversations", {
	id: serial().primaryKey(),
	createdAt: timestamp("created_at").default(sql`now()`).notNull(),
	updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
});

export const messages = pgTable("messages", {
	id: serial().primaryKey(),
	conversationId: integer("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" } ),
	senderId: integer("sender_id").notNull().references(() => users.id, { onDelete: "cascade" } ),
	text: text().notNull(),
	createdAt: timestamp("created_at").default(sql`now()`).notNull(),
});

export const users = pgTable("users", {
	id: serial().primaryKey(),
	username: text().notNull(),
	email: text().notNull(),
	password: text().notNull(),
	createdAt: timestamp("created_at").default(sql`now()`).notNull(),
}, (table) => [
	unique("users_email_key").on(table.email),]);

	
	
