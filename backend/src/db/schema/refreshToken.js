// Path: backend/src/db/schema/refreshToken.js
import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./user.js";

export const refreshTokens = pgTable("refresh_tokens", {
	id: serial().primaryKey(),
	userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
	tokenHash: text("token_hash").notNull(),
	familyId: text("family_id").notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	revokedAt: timestamp("revoked_at"),
	userAgent: text("user_agent"),
	ip: text("ip"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
	unique("refresh_tokens_family_id_key").on(table.familyId),
]);